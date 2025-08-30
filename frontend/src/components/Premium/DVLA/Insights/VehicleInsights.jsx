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

// Missing data message generator
const getMissingDataMessage = (insightType, vehicleData, availableData) => {
  const messages = {
    ownershipInsights: {
      noV5CDate: {
        title: "Limited Ownership Analysis",
        message: "V5C issue date not available in DVLA records - ownership duration cannot be calculated",
        actionable: "Ownership information may be available on your V5C registration document",
        severity: "medium"
      },
      noRegistrationRegion: {
        title: "Regional Analysis Unavailable",
        message: "Registration format doesn't provide regional information for environmental analysis",
        actionable: null,
        severity: "low"
      }
    },
    statusInsights: {
      noMotData: {
        title: "MOT Status Unavailable",
        message: "MOT records not found - vehicle may be exempt due to age or classification",
        actionable: "Check MOT history directly at gov.uk/check-mot-history",
        severity: "medium"
      },
      noTaxData: {
        title: "Tax Status Limited",
        message: "Current tax status not available in DVLA records",
        actionable: "Tax information may be available on DVLA website",
        severity: "medium"
      }
    },
    emissionsInsights: {
      noCO2Data: {
        title: "Official Emissions Data Unavailable",
        message: "Official CO2 emissions not in DVLA records - showing estimated values based on vehicle specifications",
        actionable: "Check your V5C document for manufacturer emissions data",
        severity: "low"
      },
      noEuroStandard: {
        title: "Emissions Standard Unknown",
        message: "Euro emissions standard not available - compliance status estimated from vehicle age",
        actionable: null,
        severity: "medium"
      }
    },
    fuelEfficiencyInsights: {
      insufficientEngineData: {
        title: "Fuel Efficiency Estimates Limited",
        message: "Insufficient engine specifications available - calculations based on vehicle type and age only",
        actionable: "More detailed specifications may be on your V5C document",
        severity: "medium"
      },
      unknownFuelType: {
        title: "Fuel Type Unknown",
        message: "Fuel type not specified in DVLA records - efficiency calculations unavailable",
        actionable: "Check fuel type on your V5C registration document",
        severity: "high"
      }
    }
  };

  return messages[insightType] || null;
};

// Enhanced data completeness analyzer
const analyzeDataCompleteness = (data) => {
  const analysis = {
    overall: 'good',
    missingFields: [],
    availableFields: [],
    criticalMissing: [],
    estimatedFields: []
  };

  if (!data) {
    analysis.overall = 'poor';
    return analysis;
  }

  // Check critical DVLA fields
  const criticalFields = ['make', 'yearOfManufacture', 'fuelType', 'taxStatus'];
  const optionalFields = ['co2Emissions', 'engineCapacity', 'motStatus', 'dateOfLastV5CIssued'];

  criticalFields.forEach(field => {
    if (data[field]) {
      analysis.availableFields.push(field);
    } else {
      analysis.criticalMissing.push(field);
    }
  });

  optionalFields.forEach(field => {
    if (data[field]) {
      analysis.availableFields.push(field);
    } else {
      analysis.missingFields.push(field);
    }
  });

  // Determine overall completeness
  const totalFields = criticalFields.length + optionalFields.length;
  const availableCount = analysis.availableFields.length;
  const completeness = availableCount / totalFields;

  if (analysis.criticalMissing.length > 2) {
    analysis.overall = 'poor';
  } else if (completeness < 0.5) {
    analysis.overall = 'limited';
  } else if (completeness < 0.8) {
    analysis.overall = 'good';
  } else {
    analysis.overall = 'excellent';
  }

  return analysis;
};

// Enhanced insight quality calculator with missing data context
const calculateInsightQuality = (insightType, data) => {
  if (!data) return { score: 0, confidence: 'none', dataSource: 'unavailable' };
  
  const getQualityInfo = (insightType, data) => {
    switch(insightType) {
      case 'ownershipInsights':
        if (data.dateOfLastV5CIssued) {
          return { score: 9, confidence: 'high', dataSource: 'official' };
        }
        return { score: 0, confidence: 'none', dataSource: 'unavailable' };
        
      case 'statusInsights':
        if (data.taxStatus && data.motStatus) {
          return { score: 10, confidence: 'high', dataSource: 'official' };
        } else if (data.taxStatus || data.motStatus) {
          return { score: 7, confidence: 'medium', dataSource: 'partial' };
        }
        return { score: 0, confidence: 'low', dataSource: 'limited' };
        
      case 'emissionsInsights':
        if (data.co2Emissions) {
          return { score: 10, confidence: 'high', dataSource: 'official' };
        } else if (data.fuelType && data.yearOfManufacture) {
          return { score: 6, confidence: 'medium', dataSource: 'estimated' };
        }
        return { score: 0, confidence: 'low', dataSource: 'insufficient' };
        
      case 'fuelEfficiencyInsights':
        if (data.fuelType && data.engineCapacity && data.yearOfManufacture) {
          return { score: 7, confidence: 'medium', dataSource: 'estimated' };
        }
        return { score: 0, confidence: 'low', dataSource: 'insufficient' };
        
      default:
        return { score: 0, confidence: 'none', dataSource: 'unknown' };
    }
  };

  return getQualityInfo(insightType, data);
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

// Enhanced loading fallback with smooth animation
const LoadingFallback = () => {
  return (
    <div className="p-8 text-center">
      <div className="inline-block w-6 h-6 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
      <div className="text-xs text-neutral-500">Loading insights...</div>
    </div>
  );
};

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
      // Analyze data completeness first
      const dataAnalysis = analyzeDataCompleteness(data);
      
      const insightAvailability = {
        ownershipInsights: Boolean(data.dateOfLastV5CIssued),
        statusInsights: Boolean(data.taxStatus || data.motStatus),
        emissionsInsights: Boolean(data.co2Emissions || data.fuelType || data.typeApproval),
        fuelEfficiencyInsights: Boolean(data.fuelType && data.engineCapacity && data.yearOfManufacture)
      };
      
      // Calculate insights and collect missing data info
      const calculatedInsights = {
        ownershipInsights: insightAvailability.ownershipInsights ? OwnershipInsightsCalculator(data) : null,
        statusInsights: insightAvailability.statusInsights ? StatusInsightsCalculator(data) : null,
        emissionsInsights: insightAvailability.emissionsInsights ? EmissionsInsightsCalculator(data) : null,
        fuelEfficiencyInsights: insightAvailability.fuelEfficiencyInsights ? FuelEfficiencyInsightsCalculator(data) : null
      };

      // Collect missing data information for unavailable insights
      const missingDataInfo = {};
      Object.keys(insightAvailability).forEach(insightType => {
        if (!insightAvailability[insightType]) {
          // Determine specific reason for missing data
          let missingDataKey = null;
          
          switch(insightType) {
            case 'ownershipInsights':
              missingDataKey = !data.dateOfLastV5CIssued ? 'noV5CDate' : null;
              break;
            case 'statusInsights':
              missingDataKey = (!data.taxStatus && !data.motStatus) ? 'noMotData' : null;
              break;
            case 'emissionsInsights':
              missingDataKey = !data.co2Emissions ? 'noCO2Data' : null;
              break;
            case 'fuelEfficiencyInsights':
              if (!data.fuelType) {
                missingDataKey = 'unknownFuelType';
              } else if (!data.engineCapacity || !data.yearOfManufacture) {
                missingDataKey = 'insufficientEngineData';
              }
              break;
          }
          
          if (missingDataKey) {
            const allMessages = getMissingDataMessage(insightType, data, null);
            if (allMessages && allMessages[missingDataKey]) {
              missingDataInfo[insightType] = allMessages[missingDataKey];
            }
          }
        }
      });
      
      // Create available insights list with enhanced quality info
      const availableInsightsList = Object.keys(insightAvailability)
        .map(key => {
          const qualityInfo = calculateInsightQuality(key, data);
          return {
            type: key,
            quality: qualityInfo.score || 0,
            confidence: qualityInfo.confidence,
            dataSource: qualityInfo.dataSource,
            available: insightAvailability[key],
            missingDataInfo: missingDataInfo[key] || null
          };
        })
        .sort((a, b) => {
          // Sort by availability first, then by quality
          if (a.available !== b.available) {
            return b.available - a.available; // Available first
          }
          return b.quality - a.quality; // Then by quality
        });
      
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
  
  // Enhanced animation states
  const [expandedCards, setExpandedCards] = useState({});
  
  // Toggle expandable card function
  const toggleCard = useCallback((cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  }, []);
  
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
    
    // Include all insight types, both available and unavailable
    const allInsightTypes = ['ownershipInsights', 'statusInsights', 'emissionsInsights', 'fuelEfficiencyInsights'];
    
    allInsightTypes.forEach((insightType) => {
      const insightInfo = availableInsights.find(insight => insight.type === insightType) || 
                         { type: insightType, available: false, missingDataInfo: null };
      
      let component, id;
      switch (insightType) {
        case 'ownershipInsights':
          id = 'ownership';
          component = OwnershipPanelComponent;
          break;
        case 'statusInsights':
          id = 'status';
          component = StatusPanelComponent;
          break;
        case 'emissionsInsights':
          id = 'emissions';
          component = EmissionsPanelComponent;
          break;
        case 'fuelEfficiencyInsights':
          id = 'fuel';
          component = FuelEfficiencyPanelComponent;
          break;
        default:
          return; // Skip unknown types
      }
      
      sectionConfig.push({
        id,
        component,
        insights: insights[insightType],
        available: insightInfo.available,
        missingDataInfo: insightInfo.missingDataInfo,
        quality: insightInfo.quality || 0,
        confidence: insightInfo.confidence || 'none',
        dataSource: insightInfo.dataSource || 'unknown'
      });
    });
    
    return sectionConfig;
  }, [availableInsights, insights]);
  
  // Enhanced loading state with staggered animation
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8">
          <div className="relative">
            <div className="inline-block w-8 h-8 border-3 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 inline-block w-8 h-8 border-3 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '150ms', animationDirection: 'reverse' }}></div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3 animate-pulse">Loading Vehicle Insights</h2>
            <p className="text-xs text-neutral-700 leading-relaxed max-w-md">Analyzing your vehicle data to provide comprehensive insights and recommendations...</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-neutral-50 rounded-lg p-4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-full h-3 bg-neutral-200 rounded mb-3"></div>
                <div className="w-2/3 h-2 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Enhanced error state with better UX
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8">
          <div className="relative">
            <i className="ph ph-warning-circle text-6xl text-red-600 animate-pulse"></i>
            <div className="absolute -inset-2 bg-red-100 rounded-full opacity-20 animate-ping"></div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Unable to Load Insights</h2>
            <p className="text-xs text-neutral-700 leading-relaxed max-w-md">{error}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 hover:scale-105 transition-all duration-200"
            >
              <i className="ph ph-arrow-clockwise mr-2"></i>
              Try Again
            </button>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 hover:scale-105 transition-all duration-200"
            >
              <i className="ph ph-arrow-left mr-2"></i>
              Go Back
            </button>
          </div>
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
      {/* Enhanced Header with Animation */}
      <div className={`mb-12 transition-all duration-700 ease-out ${
        'opacity-100 translate-y-0'
      }`}>
        <div className="flex items-center mb-4">
          <div className="relative">
            <i className="ph ph-chart-bar text-lg text-blue-600 mr-3 transition-all duration-300 hover:scale-110"></i>
            <div className="absolute -inset-1 bg-blue-100 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight">
            Vehicle Insights
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-neutral-600">
            Comprehensive analysis for <span className="font-medium text-neutral-900">{displayMake} {displayModel}</span>
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-neutral-500">Live Data</span>
          </div>
        </div>
      </div>
      
      {/* Enhanced Summary Cards with Staggered Animation */}
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
              className={`bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer
                ${'opacity-100 translate-y-0'}`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                transition: 'all 500ms ease-out'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className={`${card.icon} text-lg mr-3 mt-0.5 transition-all duration-300 ${
                    card.status === 'good' ? 'text-green-600' :
                    card.status === 'warning' ? 'text-yellow-600' :
                    card.status === 'critical' ? 'text-red-600' :
                    'text-blue-600'
                  }`}></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{card.title}</div>
                    <div className="text-xs text-neutral-600 mt-1">Click to view details</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold transition-all duration-300 ${
                    card.status === 'good' ? 'text-green-600' :
                    card.status === 'warning' ? 'text-yellow-600' :
                    card.status === 'critical' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>{card.value}</div>
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    card.status === 'good' ? 'bg-green-500' :
                    card.status === 'warning' ? 'bg-yellow-500' :
                    card.status === 'critical' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                </div>
              </div>
              
              {/* Subtle expand indicator */}
              <div className="text-center mt-3 text-neutral-400 transition-all duration-300 hover:text-blue-600">
                <i className="ph ph-caret-down text-sm"></i>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Enhanced Insight Sections with Progressive Loading */}
      <div className="space-y-16">
        {sections.map((section, index) => (
          <div 
            key={section.id} 
            id={section.id} 
            className={`mt-16 mb-12 transition-all duration-700 ease-out ${
              'opacity-100 translate-y-0'
            }`}
            style={{ 
              animationDelay: `${(index + 2) * 200}ms`,
              transition: 'all 700ms ease-out'
            }}
          >
            <InsightErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
                  <section.component 
                    insights={section.insights}
                    vehicleData={vehicleData}
                    available={section.available}
                    missingDataInfo={section.missingDataInfo}
                    quality={section.quality}
                    confidence={section.confidence}
                    dataSource={section.dataSource}
                  />
                </div>
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