import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import {
  GovUKHeadingM,
  GovUKHeadingL,
  GovUKBodyS,
  GovUKLoadingSpinner,
  GovUKContainer,
  COLORS,
  BREAKPOINTS
} from '../../../../styles/theme';

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

// Styled components
const InsightsWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f8f8',
  minHeight: '100vh',
  paddingTop: '20px',
  paddingBottom: '40px',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    paddingTop: '10px',
    paddingBottom: '20px'
  }
}));

const InsightsHeader = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  borderBottom: `3px solid ${COLORS.BLUE}`,
  padding: '30px 0',
  marginBottom: '30px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    padding: '20px 0',
    marginBottom: '20px'
  }
}));

const HeaderContent = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '15px',
    padding: '0 15px'
  }
}));

const HeaderIcon = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  backgroundColor: COLORS.BLUE,
  color: COLORS.WHITE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '30px',
  borderRadius: '5px',
  flexShrink: 0,
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    width: '48px',
    height: '48px',
    fontSize: '24px'
  }
}));

const HeaderText = styled(Box)(({ theme }) => ({
  flex: 1
}));

const InsightsContent = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    padding: '0 15px'
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  padding: '60px 40px',
  textAlign: 'center',
  maxWidth: '600px',
  margin: '40px auto',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    padding: '40px 20px',
    margin: '20px auto'
  }
}));

const EmptyStateContainer = styled(LoadingContainer)(({ theme }) => ({
  '& svg': {
    marginBottom: '20px'
  }
}));

const ErrorContainer = styled(EmptyStateContainer)(({ theme }) => ({
  borderLeft: `5px solid ${COLORS.RED}`,
  
  '& h2': {
    color: COLORS.RED
  }
}));

const SummaryGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '30px',
  
  [`@media (max-width: ${BREAKPOINTS.tablet})`]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginBottom: '20px'
  }
}));

const SummaryCard = styled(Box)(({ status }) => ({
  backgroundColor: COLORS.WHITE,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  borderRadius: '5px',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  position: 'relative',
  
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    borderColor: COLORS.BLACK,
    transform: 'translateY(-2px)'
  },
  
  '&:focus': {
    outline: `3px solid ${COLORS.FOCUS}`,
    outlineOffset: 0
  },
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: 
      status === 'good' ? COLORS.GREEN :
      status === 'warning' ? COLORS.ORANGE :
      status === 'critical' ? COLORS.RED :
      COLORS.BLUE,
    borderRadius: '5px 0 0 5px'
  },
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    padding: '15px',
    gap: '12px'
  }
}));

const SummaryIcon = styled(Box)(({ color }) => ({
  width: '40px',
  height: '40px',
  backgroundColor: color || COLORS.BLUE,
  color: COLORS.WHITE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  borderRadius: '5px',
  flexShrink: 0,
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    width: '36px',
    height: '36px',
    fontSize: '18px'
  }
}));

const SummaryContent = styled(Box)(({ theme }) => ({
  flex: 1
}));

const SummaryTitle = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  color: COLORS.DARK_GREY,
  marginBottom: '4px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    fontSize: '13px'
  }
}));

const SummaryValue = styled(Box)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 700,
  color: COLORS.BLACK,
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    fontSize: '18px'
  }
}));

const InsightSection = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '20px',
  overflow: 'hidden',
  scrollMarginTop: '20px', // For smooth scroll positioning
  
  '&:last-child': {
    marginBottom: 0
  },
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    marginBottom: '15px',
    scrollMarginTop: '15px'
  }
}));

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
        <Box p={3} textAlign="center">
          <WarningIcon style={{ fontSize: 30, color: COLORS.RED, marginBottom: 10 }} />
          <GovUKBodyS>Error displaying this insight section</GovUKBodyS>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
const LoadingFallback = () => (
  <Box p={4} textAlign="center">
    <GovUKLoadingSpinner size="small" />
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
        color: COLORS.BLUE,
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
        color: COLORS.PURPLE || COLORS.BLUE,
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
        color: COLORS.GREEN,
        title: 'Emissions',
        value: `${insights.emissionsInsights.co2Emissions || 0}g/km`,
        status: insights.emissionsInsights.isULEZCompliant ? 'good' : 'critical',
        sectionId: 'emissions'
      });
    }
    
    if (insights.fuelEfficiencyInsights) {
      cards.push({
        icon: <LocalGasStationIcon />,
        color: COLORS.GREEN,
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
        <GovUKContainer>
          <LoadingContainer>
            <GovUKLoadingSpinner />
            <GovUKHeadingM style={{ marginTop: '20px', marginBottom: '10px' }}>
              Loading Vehicle Insights
            </GovUKHeadingM>
            <GovUKBodyS style={{ color: COLORS.DARK_GREY }}>
              We're analyzing your vehicle data to provide detailed insights...
            </GovUKBodyS>
          </LoadingContainer>
        </GovUKContainer>
      </InsightsWrapper>
    );
  }
  
  // Error state
  if (error) {
    return (
      <InsightsWrapper>
        <GovUKContainer>
          <ErrorContainer>
            <WarningIcon style={{ fontSize: 60, color: COLORS.RED }} />
            <GovUKHeadingM style={{ marginBottom: '10px' }}>
              Unable to Load Insights
            </GovUKHeadingM>
            <GovUKBodyS style={{ color: COLORS.DARK_GREY, marginBottom: '20px' }}>
              {error}
            </GovUKBodyS>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: COLORS.BUTTON_COLOUR || COLORS.GREEN,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                fontFamily: '"GDS Transport", arial, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                borderRadius: '3px'
              }}
            >
              Try again
            </button>
          </ErrorContainer>
        </GovUKContainer>
      </InsightsWrapper>
    );
  }
  
  // No data state
  if (!vehicleData || availableInsights.length === 0) {
    return (
      <InsightsWrapper>
        <GovUKContainer>
          <EmptyStateContainer>
            <InfoIcon style={{ fontSize: 60, color: COLORS.BLUE }} />
            <GovUKHeadingM style={{ marginBottom: '10px' }}>
              Limited Data Available
            </GovUKHeadingM>
            <GovUKBodyS style={{ color: COLORS.DARK_GREY }}>
              {vehicleData ? 
                "We don't have enough data to generate meaningful insights for this vehicle." :
                "No vehicle data available for analysis."}
            </GovUKBodyS>
          </EmptyStateContainer>
        </GovUKContainer>
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
            <GovUKHeadingL style={{ margin: 0 }}>
              Vehicle Insights
            </GovUKHeadingL>
            <GovUKBodyS style={{ margin: 0, marginTop: '5px' }}>
              Comprehensive analysis for {displayMake} {displayModel}
            </GovUKBodyS>
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
                <SummaryIcon color={card.color}>
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