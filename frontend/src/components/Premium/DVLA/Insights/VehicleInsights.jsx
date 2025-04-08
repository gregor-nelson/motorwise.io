import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  GovUKHeadingM,
  GovUKLoadingSpinner,
  GovUKContainer,
  COLORS
} from '../../../../styles/theme';

// Import calculator components
import EmissionsInsightsCalculator from '../Tax/EmissionsInsightsCalculator';
import OwnershipInsightsCalculator from '../Ownership/OwnershipInsightsCalculator';
import StatusInsightsCalculator from '../Status/StatusInsightsCalculator';
import FuelEfficiencyInsightsCalculator from '../MPG/FuelEfficiencyInsightsCalculator';

// Import Material-UI icons for error/empty states
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// Import styled components
import {
  InsightsContainer,
  EnhancedLoadingContainer,
  EmptyStateContainer,
  InsightBody,
  ValueHighlight
} from './style/style';

// API setup moved to a constant
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8004/api'
  : '/api';

// Lazy load panel components to reduce initial bundle size
const OwnershipPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.OwnershipPanelComponent 
  }))
);
const StatusPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.StatusPanelComponent 
  }))
);
const EmissionsPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.EmissionsPanelComponent 
  }))
);
const FuelEfficiencyPanelComponent = lazy(() => 
  import('./components/InsightComponents').then(module => ({ 
    default: module.FuelEfficiencyPanelComponent 
  }))
);

// Insight quality calculator moved outside component for memoization
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

// Error boundary component for catching rendering errors in panels
class InsightErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in insight panel:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyStateContainer>
          <WarningIcon style={{ fontSize: 30, color: COLORS.RED, marginBottom: 10 }} />
          <InsightBody>
            <ValueHighlight color={COLORS.RED}>Error displaying insight</ValueHighlight>
          </InsightBody>
        </EmptyStateContainer>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component for lazy-loaded components
const LoadingFallback = () => (
  <EnhancedLoadingContainer>
    <GovUKLoadingSpinner size="small" />
    <InsightBody>Loading panel...</InsightBody>
  </EnhancedLoadingContainer>
);

// Custom hook for vehicle data fetching and processing
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
  
  // Use a ref to track if data has been sent to parent
  const hasNotifiedParent = useRef(false);
  // Use a cache key to prevent duplicate fetches
  const fetchCacheKey = useRef(`${registration || ''}:${vin || ''}`);
  // Abort controller for cleanup
  const abortControllerRef = useRef(null);
  // Request timeout ID
  const timeoutIdRef = useRef(null);
  
  // Process vehicle data - memoized to avoid recalculation
  const processVehicleData = useCallback((data) => {
    if (!data) return;
    
    try {
      // Determine which insights we can provide based on available data
      const insightAvailability = {
        ownershipInsights: Boolean(data.dateOfLastV5CIssued),
        statusInsights: Boolean(data.taxStatus || data.motStatus),
        emissionsInsights: Boolean(data.co2Emissions || data.fuelType || data.typeApproval),
        fuelEfficiencyInsights: Boolean(data.fuelType && data.engineCapacity && data.yearOfManufacture)
      };
      
      // Only calculate insights for which we have sufficient data
      const calculatedInsights = {
        ownershipInsights: insightAvailability.ownershipInsights ? OwnershipInsightsCalculator(data) : null,
        statusInsights: insightAvailability.statusInsights ? StatusInsightsCalculator(data) : null,
        emissionsInsights: insightAvailability.emissionsInsights ? EmissionsInsightsCalculator(data) : null,
        fuelEfficiencyInsights: insightAvailability.fuelEfficiencyInsights ? FuelEfficiencyInsightsCalculator(data) : null
      };
      
      // Create a list of available insights for rendering
      const availableInsightsList = Object.keys(insightAvailability)
        .filter(key => insightAvailability[key])
        .map(key => ({
          type: key,
          quality: calculateInsightQuality(key, data)
        }))
        .sort((a, b) => b.quality - a.quality); // Sort by insight quality
      
      setInsights(calculatedInsights);
      setAvailableInsights(availableInsightsList);
      setVehicleData(data);
    } catch (err) {
      console.error("Error processing vehicle data:", err);
      setError("Failed to process vehicle data");
    }
  }, []);
  
  // Effect to handle data loading and parent notification - optimized
  useEffect(() => {
    if (vehicleData && availableInsights.length > 0 && insights && 
        onDataLoad && typeof onDataLoad === 'function' && !hasNotifiedParent.current) {
      try {
        // Call the parent callback with the processed data - only once
        onDataLoad({
          vehicleData,
          availableInsights,
          insights
        });
        
        // Mark as notified to prevent repeated callbacks
        hasNotifiedParent.current = true;
      } catch (err) {
        console.error("Error in parent callback:", err);
      }
    }
  }, [vehicleData, availableInsights, insights, onDataLoad]);
  
  // Fetch data with improved error handling, timeout and cancellation
  useEffect(() => {
    const currentFetchKey = `${registration || ''}:${vin || ''}`;
    
    // Skip redundant fetches for the same registration/VIN
    if (fetchCacheKey.current === currentFetchKey && vehicleData) {
      setLoading(false);
      return;
    }
    
    fetchCacheKey.current = currentFetchKey;
    
    // Clean up previous fetch attempt if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    
    const fetchData = async () => {
      // Skip fetch if no identifiers provided
      if (!registration && !vin) {
        setError("Vehicle registration or VIN required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Reset notification flag on new data fetch
        hasNotifiedParent.current = false;
        
        // Create a new AbortController
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;
        
        // Set a timeout to abort the request if it takes too long (10 seconds)
        timeoutIdRef.current = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setError("Request timeout: Server took too long to respond");
            setLoading(false);
          }
        }, 10000);
        
        // The API expects a POST request with registrationNumber
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
          credentials: API_BASE_URL.includes('localhost') ? 'include' : 'same-origin',
          mode: API_BASE_URL.includes('localhost') ? 'cors' : 'same-origin',
          signal // Add the abort signal
        });
        
        // Clear the timeout as we got a response
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        
        if (!response.ok) {
          // Handle specific HTTP status codes with meaningful messages
          let errorMessage;
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
              errorMessage = "Server error, please try again later";
              break;
            default:
              errorMessage = `Failed to fetch vehicle data: ${response.status}`;
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorMessage);
        }
        
        const data = await response.json();
        
        // Process the vehicle data
        processVehicleData(data);
      } catch (err) {
        // Don't set error state if request was aborted
        if (err.name === 'AbortError') {
          if (timeoutIdRef.current) {
            // This was a manual abort, not a timeout
            console.log('Fetch aborted');
            return;
          } else {
            // This was a timeout
            setError("Request timed out. Please try again.");
          }
        } else {
          console.error("Error fetching vehicle data for insights:", err);
          setError(err.message || "Failed to load vehicle insights");
        }
        
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

    // Implement debouncing to avoid rapid requests
    const debounceDelay = 300;
    const debounceTimer = setTimeout(fetchData, debounceDelay);
    
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

/**
 * Enhanced VehicleInsights Component with GOV.UK styling
 * Displays advanced analytics for vehicle data aligned with GOV.UK design system
 */
const VehicleInsights = ({ registration, vin, paymentId, onDataLoad }) => {
  // Use our custom hook for data fetching and processing
  const { loading, error, vehicleData, insights, availableInsights } = useVehicleData(
    registration, 
    vin, 
    onDataLoad
  );

  // Render insight panel with error boundary - memoized to prevent re-renders
  const renderInsightPanel = useCallback((insight) => {
    if (!insight || !insights) return null;
    
    let PanelComponent;
    switch (insight.type) {
      case 'ownershipInsights':
        PanelComponent = () => (
          <OwnershipPanelComponent 
            insights={insights.ownershipInsights} 
          />
        );
        break;
      case 'statusInsights':
        PanelComponent = () => (
          <StatusPanelComponent 
            insights={insights.statusInsights} 
          />
        );
        break;
      case 'emissionsInsights':
        PanelComponent = () => (
          <EmissionsPanelComponent 
            insights={insights.emissionsInsights} 
          />
        );
        break;
      case 'fuelEfficiencyInsights':
        PanelComponent = () => (
          <FuelEfficiencyPanelComponent 
            insights={insights.fuelEfficiencyInsights}
            vehicleData={vehicleData}
          />
        );
        break;
      default:
        return null;
    }
    
    return (
      <InsightErrorBoundary key={insight.type}>
        <Suspense fallback={<LoadingFallback />}>
          <PanelComponent />
        </Suspense>
      </InsightErrorBoundary>
    );
  }, [insights, vehicleData]);

  // Memoize available insights rendering to prevent re-renders
  const renderedInsights = useMemo(() => {
    return availableInsights.map(insight => renderInsightPanel(insight));
  }, [availableInsights, renderInsightPanel]);

  // Render states - using early returns pattern for cleaner code
  if (loading) {
    return (
      <GovUKContainer>
        <EnhancedLoadingContainer>
          <GovUKLoadingSpinner />
          <InsightBody>Loading vehicle insights...</InsightBody>
        </EnhancedLoadingContainer>
      </GovUKContainer>
    );
  }

  if (error) {
    return (
      <GovUKContainer>
        <InsightsContainer>
          <GovUKHeadingM>Insights</GovUKHeadingM>
          <EmptyStateContainer>
            <WarningIcon style={{ fontSize: 40, color: COLORS.RED, marginBottom: 10 }} />
            <InsightBody>
              <ValueHighlight color={COLORS.RED}>Error Loading Insights:</ValueHighlight> {error}
            </InsightBody>
          </EmptyStateContainer>
        </InsightsContainer>
      </GovUKContainer>
    );
  }

  if (!vehicleData || availableInsights.length === 0) {
    return (
      <GovUKContainer>
        <InsightsContainer>
          <GovUKHeadingM>Vehicle Insights</GovUKHeadingM>
          <EmptyStateContainer>
            <InfoIcon style={{ fontSize: 40, color: COLORS.BLUE, marginBottom: 10 }} />
            <InsightBody>
              {vehicleData ? 
                "Insufficient data available to generate meaningful insights for this vehicle." :
                "No vehicle data available for analysis."}
            </InsightBody>
          </EmptyStateContainer>
        </InsightsContainer>
      </GovUKContainer>
    );
  }

  // Render insights with aligned GOV.UK styling
  return (
    <GovUKContainer>
      <InsightsContainer>
        <GovUKHeadingM>Vehicle Insights</GovUKHeadingM>
        {renderedInsights}
      </InsightsContainer>
    </GovUKContainer>
  );
};

// Optimize with memo to prevent unnecessary re-renders
export default React.memo(VehicleInsights);