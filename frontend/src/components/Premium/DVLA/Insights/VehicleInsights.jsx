import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';

// Import calculator components 
import EmissionsInsightsCalculator from '../Tax/EmissionsInsightsCalculator';
import OwnershipInsightsCalculator from '../Ownership/OwnershipInsightsCalculator';
import StatusInsightsCalculator from '../Status/StatusInsightsCalculator';
import FuelEfficiencyInsightsCalculator from '../MPG/FuelEfficiencyInsightsCalculator';


// Phosphor Icons (no imports needed, using classes directly)

// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8004/api'
  : '/api';


// Lazy load panel components with error handling
const OwnershipPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.OwnershipPanelComponent 
  })).catch(err => {
    console.error('Failed to load OwnershipPanelComponent:', err);
    return { default: () => <div className="p-6 text-center text-red-600">Failed to load component</div> };
  })
);

const StatusPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.StatusPanelComponent 
  })).catch(err => {
    console.error('Failed to load StatusPanelComponent:', err);
    return { default: () => <div className="p-6 text-center text-red-600">Failed to load component</div> };
  })
);

const EmissionsPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.EmissionsPanelComponent 
  })).catch(err => {
    console.error('Failed to load EmissionsPanelComponent:', err);
    return { default: () => <div className="p-6 text-center text-red-600">Failed to load component</div> };
  })
);

const FuelEfficiencyPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.FuelEfficiencyPanelComponent 
  })).catch(err => {
    console.error('Failed to load FuelEfficiencyPanelComponent:', err);
    return { default: () => <div className="p-6 text-center text-red-600">Failed to load component</div> };
  })
);

// Insight quality calculator
const calculateInsightQuality = (insightType, data) => {
  if (!data) return 0;
  
  switch(insightType) {
    case 'ownershipInsights':
      return data.dateOfLastV5CIssued ? 9 : 0;
    case 'statusInsights':
      return (data.taxStatus && data.motStatus) ? 10 : 
             (data.taxStatus || data.motStatus) ? 7 : 0;
    case 'emissionsInsights':
      return data.co2Emissions ? 10 : 
             (data.fuelType && data.yearOfManufacture) ? 6 : 0;
    case 'fuelEfficiencyInsights':
      return (data.fuelType && data.engineCapacity && data.yearOfManufacture) ? 7 : 0;
    default:
      return 0;
  }
};

// Error boundary component
class InsightErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in insight panel:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <i className="ph ph-warning-circle text-3xl text-red-600 mb-3 block"></i>
          <p className="text-sm text-neutral-700">Error displaying this insight section</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="p-8 text-center">
    <div className="inline-block w-6 h-6 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

// Custom hook for vehicle data fetching
const useVehicleData = (registration, vin, onDataLoad) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [insights, setInsights] = useState({
    ownershipInsights: null,
    statusInsights: null,
    emissionsInsights: null,
    fuelEfficiencyInsights: null
  });
  const [availableInsights, setAvailableInsights] = useState([]);
  
  const hasNotifiedParent = useRef(false);
  const fetchCacheKey = useRef(`${registration || ''}:${vin || ''}`);
  const abortControllerRef = useRef(null);
  const timeoutIdRef = useRef(null);
  
  const processVehicleData = useCallback((data) => {
    if (!data) return;
    
    try {
      const insightAvailability = {
        ownershipInsights: Boolean(data.dateOfLastV5CIssued),
        statusInsights: Boolean(data.taxStatus || data.motStatus),
        emissionsInsights: Boolean(data.co2Emissions || data.fuelType || data.typeApproval),
        fuelEfficiencyInsights: Boolean(data.fuelType && data.engineCapacity && data.yearOfManufacture)
      };
      
      const calculatedInsights = {
        ownershipInsights: insightAvailability.ownershipInsights ? OwnershipInsightsCalculator(data) : null,
        statusInsights: insightAvailability.statusInsights ? StatusInsightsCalculator(data) : null,
        emissionsInsights: insightAvailability.emissionsInsights ? EmissionsInsightsCalculator(data) : null,
        fuelEfficiencyInsights: insightAvailability.fuelEfficiencyInsights ? FuelEfficiencyInsightsCalculator(data) : null
      };
      
      const availableInsightsList = Object.keys(insightAvailability)
        .filter(key => insightAvailability[key])
        .map(key => ({
          type: key,
          quality: calculateInsightQuality(key, data)
        }))
        .sort((a, b) => b.quality - a.quality);
      
      setInsights(calculatedInsights);
      setAvailableInsights(availableInsightsList);
      setVehicleData(data);
    } catch (err) {
      console.error("Error processing vehicle data:", err);
      setError("Failed to process vehicle data");
    }
  }, []);
  
  // Notify parent component when data is loaded
  useEffect(() => {
    if (vehicleData && availableInsights.length > 0 && insights && 
        onDataLoad && typeof onDataLoad === 'function' && !hasNotifiedParent.current) {
      try {
        onDataLoad({
          vehicleData,
          availableInsights,
          insights
        });
        hasNotifiedParent.current = true;
      } catch (err) {
        console.error("Error in parent callback:", err);
      }
    }
  }, [vehicleData, availableInsights, insights, onDataLoad]);
  
  // Fetch vehicle data
  useEffect(() => {
    const currentFetchKey = `${registration || ''}:${vin || ''}`;
    
    // Skip if we already have data for this registration/VIN
    if (fetchCacheKey.current === currentFetchKey && vehicleData) {
      setLoading(false);
      return;
    }
    
    fetchCacheKey.current = currentFetchKey;
    
    // Cleanup previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    
    const fetchData = async () => {
      if (!registration && !vin) {
        setError("Vehicle registration or VIN required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        hasNotifiedParent.current = false;
        
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;
        
        // Set timeout for request
        timeoutIdRef.current = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setError("Request timeout: Server took too long to respond");
            setLoading(false);
          }
        }, 10000); // 10 second timeout
        
        const requestBody = {
          registrationNumber: registration || vin
        };
        
        const response = await fetch(`${API_BASE_URL}/vehicle`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          credentials: 'same-origin',
          signal
        });
        
        // Clear timeout on successful response
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch vehicle data';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch {
            // Use status-based error messages if JSON parsing fails
            switch(response.status) {
              case 400:
                errorMessage = "Invalid vehicle registration or VIN format";
                break;
              case 404:
                errorMessage = "Vehicle information not found";
                break;
              case 429:
                errorMessage = "Too many requests, please try again later";
                break;
              case 500:
              case 502:
              case 503:
                errorMessage = "Server error, please try again later";
                break;
              default:
                errorMessage = `Error: ${response.status} ${response.statusText}`;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        processVehicleData(data);
        
      } catch (err) {
        if (err.name === 'AbortError') {
          // Don't set error for manual aborts (component unmount)
          if (!timeoutIdRef.current) {
            console.log('Fetch aborted');
            return;
          }
        } else {
          console.error("Error fetching vehicle data:", err);
          setError(err.message || "Failed to load vehicle insights");
        }
        
        // Reset state on error
        setVehicleData(null);
        setInsights({
          ownershipInsights: null,
          statusInsights: null,
          emissionsInsights: null,
          fuelEfficiencyInsights: null
        });
        setAvailableInsights([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch to avoid rapid requests
    const debounceTimer = setTimeout(fetchData, 300);
    
    // Cleanup function
    return () => {
      clearTimeout(debounceTimer);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [registration, vin, processVehicleData, vehicleData]);

  return {
    loading,
    error,
    vehicleData,
    insights,
    availableInsights
  };
};

// Main Enhanced Vehicle Insights Component
const EnhancedVehicleInsights = React.memo(({ registration, vin, paymentId, onDataLoad }) => {
  const { loading, error, vehicleData, insights, availableInsights } = useVehicleData(
    registration, 
    vin, 
    onDataLoad
  );
  
  // Handle summary card clicks to scroll to section
  const handleSummaryCardClick = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -20; // Adjust scroll position
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);
  
  // Memoize summary cards data
  const summaryData = useMemo(() => {
    if (!insights || !vehicleData) return [];
    
    const cards = [];
    
    if (insights.ownershipInsights) {
      cards.push({
        icon: 'ph-car',
        title: 'Ownership',
        value: `${insights.ownershipInsights.yearsWithCurrentOwner} years`,
        status: insights.ownershipInsights.ownershipRiskLevel === 'Low' ? 'good' : 
               insights.ownershipInsights.ownershipRiskLevel === 'Medium' ? 'warning' : 'critical',
        sectionId: 'ownership'
      });
    }
    
    if (insights.statusInsights) {
      cards.push({
        icon: 'ph-gauge',
        title: 'Status',
        value: insights.statusInsights.driveabilityStatus,
        status: ['Legal to drive', 'Fully Road Legal'].includes(insights.statusInsights.driveabilityStatus) 
          ? 'good' : 'critical',
        sectionId: 'status'
      });
    }
    
    if (insights.emissionsInsights) {
      cards.push({
        icon: 'ph-leaf',
        title: 'Emissions',
        value: `${insights.emissionsInsights.co2Emissions || 0}g/km`,
        status: insights.emissionsInsights.isULEZCompliant ? 'good' : 'critical',
        sectionId: 'emissions'
      });
    }
    
    if (insights.fuelEfficiencyInsights) {
      cards.push({
        icon: 'ph-drop',
        title: 'Fuel Economy',
        value: insights.fuelEfficiencyInsights.isElectric 
          ? `${insights.fuelEfficiencyInsights.estimatedMilesPerKWh} mi/kWh`
          : `${insights.fuelEfficiencyInsights.estimatedMPGCombined} MPG`,
        status: 'good',
        sectionId: 'fuel'
      });
    }
    
    return cards;
  }, [insights, vehicleData]);
  
  // Memoize sections configuration
  const sections = useMemo(() => {
    const sectionConfig = [];
    
    availableInsights.forEach((insight) => {
      switch (insight.type) {
        case 'ownershipInsights':
          sectionConfig.push({
            id: 'ownership',
            component: OwnershipPanelComponent,
            insights: insights.ownershipInsights
          });
          break;
        case 'statusInsights':
          sectionConfig.push({
            id: 'status',
            component: StatusPanelComponent,
            insights: insights.statusInsights
          });
          break;
        case 'emissionsInsights':
          sectionConfig.push({
            id: 'emissions',
            component: EmissionsPanelComponent,
            insights: insights.emissionsInsights
          });
          break;
        case 'fuelEfficiencyInsights':
          sectionConfig.push({
            id: 'fuel',
            component: FuelEfficiencyPanelComponent,
            insights: insights.fuelEfficiencyInsights
          });
          break;
      }
    });
    
    return sectionConfig;
  }, [availableInsights, insights]);
  
  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
          <div className="inline-block w-6 h-6 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
          <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight">Loading Vehicle Insights</h2>
          <p className="text-xs text-neutral-700 leading-relaxed">We're analyzing your vehicle data to provide detailed insights...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
          <i className="ph ph-warning-circle text-6xl text-red-600"></i>
          <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight">Unable to Load Insights</h2>
          <p className="text-xs text-neutral-700 leading-relaxed mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  // No data state
  if (!vehicleData || availableInsights.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
          <i className="ph ph-info text-6xl text-blue-600"></i>
          <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight">Limited Data Available</h2>
          <p className="text-xs text-neutral-700 leading-relaxed">
            {vehicleData ? 
              "We don't have enough data to generate meaningful insights for this vehicle." :
              "No vehicle data available for analysis."}
          </p>
        </div>
      </div>
    );
  }
  
  // Main render with insights
  const displayMake = vehicleData?.make || 'Unknown';
  const displayModel = vehicleData?.model || 'Vehicle';
  
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center mb-3">
          <i className="ph ph-chart-bar text-lg text-blue-600 mr-3"></i>
          <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
            Vehicle Insights
          </h1>
        </div>
        <p className="text-xs text-neutral-600">
          Comprehensive analysis for {displayMake} {displayModel}
        </p>
      </div>
      
      {/* Summary Cards */}
      {summaryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {summaryData.map((card, index) => (
            <div 
              key={index}
              onClick={() => handleSummaryCardClick(card.sectionId)}
              tabIndex={0}
              role="button"
              aria-label={`Navigate to ${card.title} section`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSummaryCardClick(card.sectionId);
                }
              }}
              className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <i className={`${card.icon} text-lg mr-3 mt-0.5 ${
                    card.status === 'good' ? 'text-green-600' :
                    card.status === 'warning' ? 'text-yellow-600' :
                    card.status === 'critical' ? 'text-red-600' :
                    'text-blue-600'
                  }`}></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{card.title}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    card.status === 'good' ? 'text-green-600' :
                    card.status === 'warning' ? 'text-yellow-600' :
                    card.status === 'critical' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>{card.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Insight Sections */}
      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="mt-16 mb-12">
            <InsightErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <section.component 
                  insights={section.insights}
                  vehicleData={vehicleData}
                />
              </Suspense>
            </InsightErrorBoundary>
          </div>
        ))}
      </div>
    </div>
  );
});

EnhancedVehicleInsights.displayName = 'EnhancedVehicleInsights';

export default EnhancedVehicleInsights;