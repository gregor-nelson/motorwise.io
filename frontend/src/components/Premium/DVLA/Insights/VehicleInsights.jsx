import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import Box from '@mui/material/Box';

// Import calculator components 
import EmissionsInsightsCalculator from '../Tax/EmissionsInsightsCalculator';
import OwnershipInsightsCalculator from '../Ownership/OwnershipInsightsCalculator';
import StatusInsightsCalculator from '../Status/StatusInsightsCalculator';
import FuelEfficiencyInsightsCalculator from '../MPG/FuelEfficiencyInsightsCalculator';

// Import Material-UI icons
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Co2Icon from '@mui/icons-material/Co2';

// Import styled components from centralized styles
import {
  InsightsWrapper,
  InsightsHeader,
  HeaderContent,
  HeaderIcon,
  HeaderText,
  InsightsContent,
  LoadingContainer,
  EmptyStateContainer,
  ErrorContainer,
  SummaryGrid,
  SummaryCard,
  SummaryIcon,
  SummaryContent,
  SummaryTitle,
  SummaryValue,
  InsightSection,
  LoadingSpinner,
  HeadingL,
  HeadingM,
  BodyText
} from './style/style';

// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8004/api'
  : '/api';

// All styled components now imported from centralized styles

// Lazy load panel components with error handling
const OwnershipPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.OwnershipPanelComponent 
  })).catch(err => {
    console.error('Failed to load OwnershipPanelComponent:', err);
    return { default: () => <ErrorContainer>Failed to load component</ErrorContainer> };
  })
);

const StatusPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.StatusPanelComponent 
  })).catch(err => {
    console.error('Failed to load StatusPanelComponent:', err);
    return { default: () => <ErrorContainer>Failed to load component</ErrorContainer> };
  })
);

const EmissionsPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.EmissionsPanelComponent 
  })).catch(err => {
    console.error('Failed to load EmissionsPanelComponent:', err);
    return { default: () => <ErrorContainer>Failed to load component</ErrorContainer> };
  })
);

const FuelEfficiencyPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.FuelEfficiencyPanelComponent 
  })).catch(err => {
    console.error('Failed to load FuelEfficiencyPanelComponent:', err);
    return { default: () => <ErrorContainer>Failed to load component</ErrorContainer> };
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

// MarketDash error boundary component
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
        <Box p={3} textAlign="center">
          <WarningIcon style={{ fontSize: 30, color: 'var(--negative)', marginBottom: 10 }} />
          <BodyText>Error displaying this insight section</BodyText>
        </Box>
      );
    }

    return this.props.children;
  }
}

// MarketDash loading fallback component
const LoadingFallback = () => (
  <Box p={4} textAlign="center">
    <LoadingSpinner />
  </Box>
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
        icon: <DirectionsCarIcon />,
        color: 'var(--primary)',
        title: 'Ownership',
        value: `${insights.ownershipInsights.yearsWithCurrentOwner} years`,
        status: insights.ownershipInsights.ownershipRiskLevel === 'Low' ? 'good' : 
               insights.ownershipInsights.ownershipRiskLevel === 'Medium' ? 'warning' : 'critical',
        sectionId: 'ownership'
      });
    }
    
    if (insights.statusInsights) {
      cards.push({
        icon: <SpeedIcon />,
        color: 'var(--neutral)',
        title: 'Status',
        value: insights.statusInsights.driveabilityStatus,
        status: ['Legal to drive', 'Fully Road Legal'].includes(insights.statusInsights.driveabilityStatus) 
          ? 'good' : 'critical',
        sectionId: 'status'
      });
    }
    
    if (insights.emissionsInsights) {
      cards.push({
        icon: <Co2Icon />,
        color: 'var(--positive)',
        title: 'Emissions',
        value: `${insights.emissionsInsights.co2Emissions || 0}g/km`,
        status: insights.emissionsInsights.isULEZCompliant ? 'good' : 'critical',
        sectionId: 'emissions'
      });
    }
    
    if (insights.fuelEfficiencyInsights) {
      cards.push({
        icon: <LocalGasStationIcon />,
        color: 'var(--warning)',
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
      <InsightsWrapper>
        <InsightsContent>
          <LoadingContainer>
            <LoadingSpinner />
            <HeadingM style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>
              Loading Vehicle Insights
            </HeadingM>
            <BodyText>
              We're analyzing your vehicle data to provide detailed insights...
            </BodyText>
          </LoadingContainer>
        </InsightsContent>
      </InsightsWrapper>
    );
  }
  
  // Error state
  if (error) {
    return (
      <InsightsWrapper>
        <InsightsContent>
          <ErrorContainer>
            <WarningIcon style={{ fontSize: 60, color: 'var(--negative)' }} />
            <HeadingM style={{ marginBottom: 'var(--space-sm)' }}>
              Unable to Load Insights
            </HeadingM>
            <BodyText style={{ marginBottom: 'var(--space-lg)' }}>
              {error}
            </BodyText>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--negative)',
                color: 'var(--white)',
                border: 'none',
                padding: 'var(--space-md) var(--space-xl)',
                fontFamily: 'var(--font-main)',
                fontWeight: 'var(--font-medium)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition)'
              }}
              onMouseOver={(e) => e.target.style.background = 'var(--negative-hover)'}
              onMouseOut={(e) => e.target.style.background = 'var(--negative)'}
            >
              Try again
            </button>
          </ErrorContainer>
        </InsightsContent>
      </InsightsWrapper>
    );
  }
  
  // No data state
  if (!vehicleData || availableInsights.length === 0) {
    return (
      <InsightsWrapper>
        <InsightsContent>
          <EmptyStateContainer>
            <InfoIcon style={{ fontSize: 60, color: 'var(--primary)' }} />
            <HeadingM style={{ marginBottom: 'var(--space-sm)' }}>
              Limited Data Available
            </HeadingM>
            <BodyText>
              {vehicleData ? 
                "We don't have enough data to generate meaningful insights for this vehicle." :
                "No vehicle data available for analysis."}
            </BodyText>
          </EmptyStateContainer>
        </InsightsContent>
      </InsightsWrapper>
    );
  }
  
  // Main render with insights
  const displayMake = vehicleData?.make || 'Unknown';
  const displayModel = vehicleData?.model || 'Vehicle';
  
  return (
    <InsightsWrapper>
      <InsightsHeader>
        <HeaderContent>
          <HeaderIcon>
            <AssessmentIcon />
          </HeaderIcon>
          <HeaderText>
            <HeadingL>
              Vehicle Insights
            </HeadingL>
            <BodyText style={{ margin: 'var(--space-xs) 0 0 0' }}>
              Comprehensive analysis for {displayMake} {displayModel}
            </BodyText>
          </HeaderText>
        </HeaderContent>
      </InsightsHeader>
      
      <InsightsContent>
        {/* Summary Cards */}
        {summaryData.length > 0 && (
          <SummaryGrid>
            {summaryData.map((card, index) => (
              <SummaryCard 
                key={index} 
                status={card.status}
                onClick={() => handleSummaryCardClick(card.sectionId)}
                tabIndex={0}
                role="button"
                aria-label={`Navigate to ${card.title} section`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSummaryCardClick(card.sectionId);
                  }
                }}
              >
                <SummaryIcon style={{ backgroundColor: card.color }}>
                  {card.icon}
                </SummaryIcon>
                <SummaryContent>
                  <SummaryTitle>{card.title}</SummaryTitle>
                  <SummaryValue>{card.value}</SummaryValue>
                </SummaryContent>
              </SummaryCard>
            ))}
          </SummaryGrid>
        )}
        
        {/* Vertically Stacked Sections */}
        {sections.map((section) => (
          <InsightSection key={section.id} id={section.id}>
            <InsightErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <section.component 
                  insights={section.insights}
                  vehicleData={vehicleData}
                />
              </Suspense>
            </InsightErrorBoundary>
          </InsightSection>
        ))}
      </InsightsContent>
    </InsightsWrapper>
  );
});

EnhancedVehicleInsights.displayName = 'EnhancedVehicleInsights';

export default EnhancedVehicleInsights;