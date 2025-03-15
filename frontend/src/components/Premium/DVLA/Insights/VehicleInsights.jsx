import React, { useState, useEffect } from 'react';
import {
  GovUKHeadingM,
  GovUKLoadingSpinner,
  GovUKContainer,
  COLORS
} from '../../../../styles/theme';

// Import the panel components
import {
  OwnershipPanelComponent,
  StatusPanelComponent,
  EmissionsPanelComponent,
  FuelEfficiencyPanelComponent
} from './components/InsightComponents';

// Import calculator components for initial data processing
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

// API setup code with consistent approach
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8004/api'
                    : '/api';

/**
 * Enhanced VehicleInsights Component with GOV.UK styling
 * Displays advanced analytics for vehicle data aligned with GOV.UK design system
 */
const VehicleInsights = ({ registration, vin }) => {
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

  // Fetch necessary data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!registration && !vin) {
          throw new Error("Vehicle registration or VIN required");
        }

        setLoading(true);
        setError(null);
        
        // The API expects a POST request with registrationNumber
        const requestBody = {
          registrationNumber: registration || vin
        };
        
        console.log(`Fetching vehicle data from: ${API_BASE_URL}/vehicle`);
        console.log('Request body:', requestBody);
        
        const response = await fetch(`${API_BASE_URL}/vehicle`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to fetch vehicle data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received vehicle data:', data);
        processVehicleData(data);
      } catch (err) {
        console.error("Error fetching vehicle data for insights:", err);
        setError(err.message || "Failed to load vehicle insights");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [registration, vin]);

  // Process vehicle data from API
  const processVehicleData = (data) => {
    console.log('Processing vehicle data for insights');
    
    // Store the vehicle data
    setVehicleData(data);
    
    // Determine which insights we can provide based on available data
    const insightAvailability = {
      ownershipInsights: Boolean(data.dateOfLastV5CIssued),
      statusInsights: Boolean(data.taxStatus || data.motStatus),
      emissionsInsights: Boolean(data.co2Emissions || (data.yearOfManufacture && data.fuelType)),
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
  };

  // Helper function to determine insight quality (0-10 scale)
  const calculateInsightQuality = (insightType, data) => {
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

  // Render the appropriate component based on insight type
  const renderInsightPanel = (insight) => {
    switch (insight.type) {
      case 'ownershipInsights':
        return (
          <OwnershipPanelComponent 
            key="ownership" 
            insights={insights.ownershipInsights} 
          />
        );
      case 'statusInsights':
        return (
          <StatusPanelComponent 
            key="status" 
            insights={insights.statusInsights} 
          />
        );
      case 'emissionsInsights':
        return (
          <EmissionsPanelComponent 
            key="emissions" 
            insights={insights.emissionsInsights} 
          />
        );
      case 'fuelEfficiencyInsights':
        return (
          <FuelEfficiencyPanelComponent 
            key="fuelEfficiency" 
            insights={insights.fuelEfficiencyInsights}
            vehicleData={vehicleData}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state with aligned GOV.UK styling
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

  // Show error state with aligned GOV.UK styling
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

  // Show empty state with aligned GOV.UK styling
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
        
        {/* Render insights in the order of their quality/completeness */}
        {availableInsights.map(insight => renderInsightPanel(insight))}
      </InsightsContainer>
    </GovUKContainer>
  );
};

export default VehicleInsights;