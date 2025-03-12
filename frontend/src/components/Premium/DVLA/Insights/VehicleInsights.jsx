import React, { useState, useEffect } from 'react';
import { GovUKHeadingM, GovUKLoadingSpinner } from '../../../../styles/theme';

// Import calculator components
import EmissionsInsightsCalculator from '../Tax/EmissionsInsightsCalculator';
import OwnershipInsightsCalculator from '../Ownership/OwnershipInsightsCalculator';
import StatusInsightsCalculator from '../Status/StatusInsightsCalculator';
// AgeValueInsightsCalculator removed
import FuelEfficiencyInsightsCalculator from '../MPG/FuelEfficiencyInsightsCalculator';
import FuelCostCalculator from '../MPG/FuelCostCalculator';
// Import custom tooltip components
import {
  GovUKTooltip,
  HeadingWithTooltip,
  ValueWithTooltip,
  CellWithTooltip,
  useTooltip
} from '../../../../styles/tooltip';

// Import Material-UI icons
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import NatureIcon from '@mui/icons-material/Nature';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoneyIcon from '@mui/icons-material/Money';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Import styled components
import {
  InsightsContainer,
  OwnershipPanel,
  StatusPanel,
  EmissionsPanel,
  // AgeValuePanel removed
  FuelEfficiencyPanel,
  InsightBody,
  InsightTable,
  StatusIndicator,
  ValueHighlight,
  FactorList,
  FactorItem,
  FactorsSection,
  FactorsTitle,
  MetricDisplay,
  MetricLabel,
  MetricValue,
  InsightNote,
  EnhancedLoadingContainer,
  EmptyStateContainer
} from './style/style';

// Define tooltip content for different data fields
const tooltips = {
  // Section tooltips
  sectionOwnership: "Ownership data is sourced directly from DVLA records",
  sectionStatus: "Status data is sourced directly from DVLA and MOT databases",
  sectionEmissions: "Emissions data is sourced from official manufacturer records via DVLA when available, otherwise estimated based on vehicle specifications",
  // sectionAgeValue removed
  sectionFuelEfficiency: "Fuel efficiency values are estimated based on UK government data for vehicles of similar specifications",
  
  // Fuel Efficiency tooltips
  mpgCombined: "Estimated based on vehicle engine size, fuel type, age and UK government data on typical fuel efficiency for similar vehicles.",
  mpgUrban: "Estimated urban driving efficiency based on UK government statistics for vehicles of this type and age.",
  mpgExtraUrban: "Estimated highway/motorway efficiency based on UK government statistics for vehicles of this type and age.",
  costPerMile: "Calculated using current average UK fuel prices and estimated MPG figures.",
  annualFuelCost: "Calculated based on average annual UK mileage of 7,200 miles and current fuel prices.",
  co2Emissions: "Calculated based on fuel type and estimated fuel efficiency using standard conversion factors.",
  
  // Electric vehicle tooltips
  evEfficiency: "Estimated miles per kWh based on typical performance of electric vehicles of this age and type.",
  evRange: "Estimated range based on typical battery capacity for EVs of this age and manufacturer.",
  evCostPerMile: "Calculated using average UK electricity prices of 6p per mile.",
  evAnnualSavings: "Comparison against equivalent petrol vehicle based on average UK mileage.",
  evCO2Savings: "Estimated CO2 savings compared to equivalent petrol vehicle using UK government conversion factors.",
  
  // Data source tooltips
  officialData: "This data is from official DVLA/government records.",
  estimatedData: "This is an estimated value based on vehicle specifications and UK government data.",
  marketTrends: "Based on UK Department for Transport vehicle licensing statistics.",
  
  // Efficiency context tooltips
  efficiencyContext: "Information derived from UK government 'Road fuel consumption and the UK motor vehicle fleet' report.",
  
  // Ownership tooltips
  ownershipStatus: "Determined from the length of current ownership based on DVLA records.",
  registrationGap: "Calculated from the difference between manufacture date and first UK registration date.",
  riskLevel: "Generated using algorithms based on ownership patterns and DVLA data.",
  
  // Status tooltips
  driveabilityStatus: "Determined based on current tax and MOT status from DVLA records.",
  taxStatus: "Current vehicle tax status according to DVLA records.",
  motStatus: "Current MOT test status according to DVSA records.",
  
  // Age/Value tooltips removed
  
  // General tooltips
  confidenceHigh: "High confidence (90%+): Based on official government data or direct measurements.",
  confidenceMedium: "Medium confidence (70-90%): Based on typical values for vehicles of this specification.",
  confidenceLow: "Low confidence (<70%): Limited data available, broader estimates applied.",
  
  // Notes tooltips
  fuelEfficiencyNote: "All fuel efficiency data is derived from UK Department for Business, Energy and Industrial Strategy's 'Road fuel consumption and the UK motor vehicle fleet' report"
};

// API setup code
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8004/api'
                    : '/api';

/**
 * Enhanced VehicleInsights Component with GOV.UK styled tooltips
 * Displays advanced analytics for vehicle data with improved styling and data source tooltips
 */
const VehicleInsights = ({ registration, vin }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [insights, setInsights] = useState({
    ownershipInsights: null,
    statusInsights: null,
    emissionsInsights: null,
    // ageValueInsights removed
    fuelEfficiencyInsights: null
  });
  const [availableInsights, setAvailableInsights] = useState([]);
  
  // Use the tooltip hook for inline tooltips
  const { withTooltip } = useTooltip();

  // Fetch necessary data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!registration && !vin) {
          throw new Error("Vehicle registration or VIN required");
        }

        setLoading(true);
        setError(null);
        
        // The Python API expects a POST request with registrationNumber
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
      // ageValueInsights removed
      fuelEfficiencyInsights: Boolean(data.fuelType && data.engineCapacity && data.yearOfManufacture)
    };
    
    // Only calculate insights for which we have sufficient data using the separate calculator components
    const calculatedInsights = {
      ownershipInsights: insightAvailability.ownershipInsights ? OwnershipInsightsCalculator(data) : null,
      statusInsights: insightAvailability.statusInsights ? StatusInsightsCalculator(data) : null,
      emissionsInsights: insightAvailability.emissionsInsights ? EmissionsInsightsCalculator(data) : null,
      // ageValueInsights removed
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
      // ageValueInsights case removed
      case 'fuelEfficiencyInsights':
        return (data.fuelType && data.engineCapacity && data.yearOfManufacture) ? 7 : 0;
      default:
        return 0;
    }
  };

  // Show loading state with enhanced styling
  if (loading) {
    return (
      <EnhancedLoadingContainer>
        <GovUKLoadingSpinner />
        <InsightBody>Loading vehicle insights...</InsightBody>
      </EnhancedLoadingContainer>
    );
  }

  // Show error state with enhanced styling
  if (error) {
    return (
      <InsightsContainer>
        <GovUKHeadingM>Vehicle Insights</GovUKHeadingM>
        <EmptyStateContainer>
          <WarningIcon style={{ fontSize: 40, color: '#d4351c', marginBottom: 10 }} />
          <InsightBody>
            <ValueHighlight color="#d4351c">Error Loading Insights:</ValueHighlight> {error}
          </InsightBody>
        </EmptyStateContainer>
      </InsightsContainer>
    );
  }

  // Show empty state with enhanced styling
  if (!vehicleData || availableInsights.length === 0) {
    return (
      <InsightsContainer>
        <GovUKHeadingM>Vehicle Insights</GovUKHeadingM>
        <EmptyStateContainer>
          <InfoIcon style={{ fontSize: 40, color: '#1d70b8', marginBottom: 10 }} />
          <InsightBody>
            {vehicleData ? 
              "Insufficient data available to generate meaningful insights for this vehicle." :
              "No vehicle data available for analysis."}
          </InsightBody>
        </EmptyStateContainer>
      </InsightsContainer>
    );
  }

  // Render insights with enhanced styling
  return (
    <InsightsContainer>
      <GovUKHeadingM>Vehicle Insights</GovUKHeadingM>
      
      {/* Render insights in the order of their quality/completeness */}
      {availableInsights.map(insight => {
        switch(insight.type) {
          case 'ownershipInsights':
            return insights.ownershipInsights && (
              <OwnershipPanel key="ownership">
                <HeadingWithTooltip tooltip={tooltips.sectionOwnership} iconColor="#1d70b8">
                  <DescriptionIcon /> Ownership & History Insights
                </HeadingWithTooltip>
                
                <InsightBody>
                  This vehicle has been with the same keeper since <ValueHighlight>
                    {insights.ownershipInsights.v5cDate.toLocaleDateString('en-GB', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </ValueHighlight> ({insights.ownershipInsights.yearsWithCurrentOwner} years), 
                  suggesting <ValueHighlight>{insights.ownershipInsights.ownershipStability.toLowerCase()}</ValueHighlight> ownership.
                </InsightBody>
                
                <InsightTable>
                  <tbody>
                    <tr>
                      <CellWithTooltip 
                        label="Ownership Status" 
                        tooltip={tooltips.ownershipStatus} 
                      />
                      <td>{insights.ownershipInsights.ownershipStability}</td>
                    </tr>
                    {insights.ownershipInsights.regGapYears > 0 && (
                      <tr>
                        <CellWithTooltip 
                          label="Registration Gap" 
                          tooltip={tooltips.registrationGap} 
                        />
                        <td>{insights.ownershipInsights.regGapYears} years between manufacture and DVLA registration</td>
                      </tr>
                    )}
                    <tr>
                      <CellWithTooltip 
                        label="Risk Level" 
                        tooltip={tooltips.riskLevel} 
                      />
                      <td>
                        <StatusIndicator status={insights.ownershipInsights.ownershipRiskLevel}>
                          {insights.ownershipInsights.ownershipRiskLevel === 'Low' ? 
                            <CheckCircleIcon fontSize="small" /> : 
                            insights.ownershipInsights.ownershipRiskLevel === 'High' ? 
                              <CancelIcon fontSize="small" /> : 
                              <WarningIcon fontSize="small" />
                          }
                          {insights.ownershipInsights.ownershipRiskLevel}
                        </StatusIndicator>
                      </td>
                    </tr>
                  </tbody>
                </InsightTable>
                
                {insights.ownershipInsights.riskFactors && insights.ownershipInsights.riskFactors.length > 0 && (
                  <FactorsSection>
                    <FactorsTitle color="#d4351c">
                      <WarningIcon fontSize="small" /> Risk Factors:
                    </FactorsTitle>
                    <FactorList>
                      {insights.ownershipInsights.riskFactors.map((factor, index) => (
                        <FactorItem key={index} iconColor="#d4351c">
                          <WarningIcon fontSize="small" />
                          <span>{factor}</span>
                        </FactorItem>
                      ))}
                    </FactorList>
                  </FactorsSection>
                )}
                
                {insights.ownershipInsights.positiveFactors && insights.ownershipInsights.positiveFactors.length > 0 && (
                  <FactorsSection>
                    <FactorsTitle color="#00703c">
                      <CheckCircleIcon fontSize="small" /> Positive Factors:
                    </FactorsTitle>
                    <FactorList>
                      {insights.ownershipInsights.positiveFactors.map((factor, index) => (
                        <FactorItem key={index} iconColor="#00703c">
                          <CheckCircleIcon fontSize="small" />
                          <span>{factor}</span>
                        </FactorItem>
                      ))}
                    </FactorList>
                  </FactorsSection>
                )}
              </OwnershipPanel>
            );
          
          case 'statusInsights':
            return insights.statusInsights && (
              <StatusPanel key="status">
                <HeadingWithTooltip tooltip={tooltips.sectionStatus} iconColor="#6e3894">
                  <AccessTimeIcon /> Current Status Insights
                </HeadingWithTooltip>
                
                <InsightBody>
                  This vehicle is currently{' '}
                  <ValueHighlight>
                    {insights.statusInsights.isTaxExempt ? 'EXEMPT FROM TAX' : insights.statusInsights.taxStatus}
                  </ValueHighlight>{' '}
                  {insights.statusInsights.isPossiblyMotExempt ? (
                    <>and <ValueHighlight>possibly exempt from MOT</ValueHighlight></>
                  ) : (
                    <>with a <ValueHighlight>{insights.statusInsights.motStatus.toLowerCase()}</ValueHighlight> MOT</>
                  )}, 
                  making its driveability status: <ValueHighlight>
                    {insights.statusInsights.driveabilityStatus}
                  </ValueHighlight>.
                </InsightBody>
                
                <InsightTable>
                  <tbody>
                    <tr>
                      <CellWithTooltip 
                        label="Driveability Status" 
                        tooltip={tooltips.driveabilityStatus} 
                      />
                      <td>{insights.statusInsights.driveabilityStatus}</td>
                    </tr>
                    {insights.statusInsights.isTaxExempt && (
                      <tr>
                        <CellWithTooltip 
                          label="Tax Status" 
                          tooltip={tooltips.taxStatus} 
                        />
                        <td>
                          <MetricDisplay iconColor="#00703c">
                            <CheckCircleIcon fontSize="small" />
                            <MetricValue>Exempt from Vehicle Tax</MetricValue>
                          </MetricDisplay>
                        </td>
                      </tr>
                    )}
                    {insights.statusInsights.isPossiblyMotExempt && (
                      <tr>
                        <CellWithTooltip 
                          label="MOT Status" 
                          tooltip={tooltips.motStatus} 
                        />
                        <td>
                          <MetricDisplay iconColor="#1d70b8">
                            <InfoIcon fontSize="small" />
                            <MetricValue>Potentially exempt from MOT requirements</MetricValue>
                          </MetricDisplay>
                        </td>
                      </tr>
                    )}
                    {insights.statusInsights.motExpiryDate && !insights.statusInsights.isPossiblyMotExempt && (
                      <tr>
                        <CellWithTooltip 
                          label="MOT Expires" 
                          tooltip={tooltips.motStatus} 
                        />
                        <td>
                          <MetricDisplay iconColor={
                            insights.statusInsights.daysUntilMotExpiry < 0 ? "#d4351c" :
                            insights.statusInsights.daysUntilMotExpiry < 30 ? "#f47738" : "#00703c"
                          }>
                            <AccessTimeIcon fontSize="small" />
                            <MetricValue>
                              {insights.statusInsights.motExpiryDate.toLocaleDateString('en-GB', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                              })}
                              {insights.statusInsights.daysUntilMotExpiry > 0 ? 
                                ` (${insights.statusInsights.daysUntilMotExpiry} days)` : 
                                ' (Expired)'}
                            </MetricValue>
                          </MetricDisplay>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <CellWithTooltip 
                        label="Risk Level" 
                        tooltip={tooltips.riskLevel} 
                      />
                      <td>
                        <StatusIndicator status={insights.statusInsights.statusRiskLevel}>
                          {insights.statusInsights.statusRiskLevel === 'Low' ? 
                            <CheckCircleIcon fontSize="small" /> : 
                            insights.statusInsights.statusRiskLevel === 'High' ? 
                              <CancelIcon fontSize="small" /> : 
                              <WarningIcon fontSize="small" />
                          }
                          {insights.statusInsights.statusRiskLevel}
                        </StatusIndicator>
                      </td>
                    </tr>
                  </tbody>
                </InsightTable>
                
                {/* The rest of the status section remains unchanged */}
              </StatusPanel>
            );
              
          case 'emissionsInsights':
            return insights.emissionsInsights && (
              <EmissionsPanel key="emissions">
                <HeadingWithTooltip 
                  tooltip={insights.emissionsInsights.isEstimated 
                    ? "Emissions data is estimated based on vehicle specifications and typical values" 
                    : "Emissions data is sourced from official manufacturer records via DVLA"} 
                  iconColor="#28a197"
                >
                  <NatureIcon /> Emissions & Tax Insights
                </HeadingWithTooltip>
                
                <InsightBody>
                  {insights.emissionsInsights.isEstimated ? 
                    `Based on this vehicle's specifications, we estimate its CO2 emissions to be approximately ` :
                    `This vehicle's CO2 emissions are `
                  }
                  <ValueWithTooltip tooltip={tooltips.co2Emissions}>
                    <ValueHighlight color="#28a197">
                      {insights.emissionsInsights.co2Emissions}g/km
                    </ValueHighlight>
                  </ValueWithTooltip>.
                  
                  {insights.emissionsInsights.euroStatus && ` It meets `}
                  {insights.emissionsInsights.euroStatus && (
                    <ValueHighlight color="#28a197">
                      {insights.emissionsInsights.euroStatus}
                    </ValueHighlight>
                  )}
                  {insights.emissionsInsights.euroStatus && ` emissions standards.`}
                  
                  {insights.emissionsInsights.euroSubcategory && ` (Specifically `}
                  {insights.emissionsInsights.euroSubcategory && (
                    <ValueHighlight color="#28a197">
                      {insights.emissionsInsights.euroSubcategory}
                    </ValueHighlight>
                  )}
                  {insights.emissionsInsights.euroSubcategory && `)`}
                </InsightBody>
                
                <InsightTable>
                  <tbody>
                    <tr>
                      <CellWithTooltip 
                        label="Annual Road Tax" 
                        tooltip="Calculated based on current UK Vehicle Excise Duty rates" 
                      />
                      <td>
                        <MetricDisplay iconColor="#28a197">
                          <MoneyIcon fontSize="small" />
                          <MetricValue>{insights.emissionsInsights.annualTaxCost}</MetricValue>
                        </MetricDisplay>
                      </td>
                    </tr>
                    {/* Rest of the emissions table remains unchanged */}
                  </tbody>
                </InsightTable>
                
                {/* The rest of the emissions section remains unchanged */}
              </EmissionsPanel>
            );
          
          case 'fuelEfficiencyInsights':
            return insights.fuelEfficiencyInsights && (
              <FuelEfficiencyPanel key="fuelEfficiency">
                <HeadingWithTooltip tooltip={tooltips.sectionFuelEfficiency} iconColor="#85994b">
                  <LocalGasStationIcon /> Fuel Efficiency Insights
                </HeadingWithTooltip>
                
                {insights.fuelEfficiencyInsights.isElectric ? (
                  <>
                    <InsightBody>
                      As an electric vehicle, this car has an estimated efficiency 
                      of {withTooltip(
                        <ValueHighlight color="#85994b">
                          {insights.fuelEfficiencyInsights.estimatedMilesPerKWh} miles per kWh
                        </ValueHighlight>,
                        tooltips.evEfficiency
                      )}, 
                      costing approximately {withTooltip(
                        <ValueHighlight color="#85994b">
                          £{insights.fuelEfficiencyInsights.estimatedCostPerMile} per mile
                        </ValueHighlight>,
                        tooltips.evCostPerMile
                      )} to run.
                    </InsightBody>
                    
                    <InsightTable>
                      <tbody>
                        <tr>
                          <CellWithTooltip 
                            label="Estimated Range" 
                            tooltip={tooltips.evRange} 
                          />
                          <td>
                            <MetricDisplay iconColor="#85994b">
                              <DirectionsCarIcon fontSize="small" />
                              <MetricValue>
                                {insights.fuelEfficiencyInsights.estimatedRange}
                              </MetricValue>
                            </MetricDisplay>
                          </td>
                        </tr>
                        <tr>
                          <CellWithTooltip 
                            label="Battery Capacity" 
                            tooltip="Estimated based on typical battery size for EVs of this age and model" 
                          />
                          <td>{insights.fuelEfficiencyInsights.batteryCapacityEstimate}</td>
                        </tr>
                        <tr>
                          <CellWithTooltip 
                            label="Annual Savings vs Petrol" 
                            tooltip={tooltips.evAnnualSavings} 
                          />
                          <td>
                            <MetricDisplay iconColor="#00703c">
                              <MoneyIcon fontSize="small" />
                              <MetricValue color="#00703c">
                                {insights.fuelEfficiencyInsights.annualSavingsVsPetrol}
                              </MetricValue>
                            </MetricDisplay>
                          </td>
                        </tr>
                        <tr>
                          <CellWithTooltip 
                            label="Annual CO2 Savings" 
                            tooltip={tooltips.evCO2Savings} 
                          />
                          <td>
                            <MetricDisplay iconColor="#00703c">
                              <MetricValue color="#00703c">
                                {insights.fuelEfficiencyInsights.annualCO2Savings}
                              </MetricValue>
                            </MetricDisplay>
                          </td>
                        </tr>
                      </tbody>
                    </InsightTable>
                    
                    <GovUKTooltip title={tooltips.marketTrends} arrow placement="top">
                      <FactorsTitle color="#1d70b8" style={{ borderBottom: '1px dotted #505a5f', display: 'inline-flex', cursor: 'help' }}>
                        <TrendingUpIcon fontSize="small" /> Market Trends:
                      </FactorsTitle>
                    </GovUKTooltip>
                    <FactorList>
                      <FactorItem iconColor="#1d70b8">
                        <InfoIcon fontSize="small" />
                        <span>{insights.fuelEfficiencyInsights.evMarketGrowthInfo}</span>
                      </FactorItem>
                    </FactorList>
                    
                    {/* Add the new calculator component for EVs without modifying existing code */}
                    <FuelCostCalculator 
                      defaultValues={insights.fuelEfficiencyInsights}
                      fuelType="ELECTRIC"
                      isElectric={true}
                    />
                    
                  </>
                ) : (
                  <>
                    <InsightBody>
                      Based on this vehicle's specifications, it has an estimated fuel efficiency 
                      of {withTooltip(
                        <ValueHighlight color="#85994b">
                          {insights.fuelEfficiencyInsights.estimatedMPGCombined} MPG
                        </ValueHighlight>,
                        tooltips.mpgCombined
                      )} combined, 
                      costing approximately {withTooltip(
                        <ValueHighlight color="#85994b">
                          £{insights.fuelEfficiencyInsights.costPerMile} per mile
                        </ValueHighlight>,
                        tooltips.costPerMile
                      )} to run.
                    </InsightBody>
                    
                    <InsightTable>
                      <tbody>
                        <tr>
                          <CellWithTooltip 
                            label="Estimated Urban MPG" 
                            tooltip={tooltips.mpgUrban} 
                          />
                          <td>{insights.fuelEfficiencyInsights.estimatedMPGUrban} MPG</td>
                        </tr>
                        <tr>
                          <CellWithTooltip 
                            label="Estimated Extra-Urban MPG" 
                            tooltip={tooltips.mpgExtraUrban} 
                          />
                          <td>{insights.fuelEfficiencyInsights.estimatedMPGExtraUrban} MPG</td>
                        </tr>
                        <tr>
                          <CellWithTooltip 
                            label="Estimated Annual Fuel Cost" 
                            tooltip={tooltips.annualFuelCost} 
                          />
                          <td>
                            <MetricDisplay iconColor="#85994b">
                              <MoneyIcon fontSize="small" />
                              <MetricValue>
                                £{insights.fuelEfficiencyInsights.annualFuelCost}
                              </MetricValue>
                              <MetricLabel>(based on average UK mileage)</MetricLabel>
                            </MetricDisplay>
                          </td>
                        </tr>
                        {insights.fuelEfficiencyInsights.co2EmissionsGPerKM && (
                          <tr>
                            <CellWithTooltip 
                              label="CO2 Emissions" 
                              tooltip={tooltips.co2Emissions} 
                            />
                            <td>
                              <MetricDisplay iconColor="#28a197">
                                <MetricValue>
                                  {insights.fuelEfficiencyInsights.co2EmissionsGPerKM} g/km
                                </MetricValue>
                              </MetricDisplay>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </InsightTable>
                    
                    {insights.fuelEfficiencyInsights.fuelTypeEfficiencyNote && (
                      <>
                        <GovUKTooltip title={tooltips.efficiencyContext} arrow placement="top">
                          <FactorsTitle color="#1d70b8" style={{ borderBottom: '1px dotted #505a5f', display: 'inline-flex', cursor: 'help' }}>
                            <InfoIcon fontSize="small" /> Efficiency Context:
                          </FactorsTitle>
                        </GovUKTooltip>
                        <FactorList>
                          <FactorItem iconColor="#1d70b8">
                            <InfoIcon fontSize="small" />
                            <span>{insights.fuelEfficiencyInsights.fuelTypeEfficiencyNote}</span>
                          </FactorItem>
                        </FactorList>
                      </>
                    )}
                    
                    {insights.fuelEfficiencyInsights.marketTrends && (
                      <>
                        <GovUKTooltip title={tooltips.marketTrends} arrow placement="top">
                          <FactorsTitle color="#1d70b8" style={{ borderBottom: '1px dotted #505a5f', display: 'inline-flex', cursor: 'help' }}>
                            <TrendingUpIcon fontSize="small" /> Market Trends:
                          </FactorsTitle>
                        </GovUKTooltip>
                        <FactorList>
                          <FactorItem iconColor="#1d70b8">
                            <InfoIcon fontSize="small" />
                            <span>{insights.fuelEfficiencyInsights.marketTrends}</span>
                          </FactorItem>
                        </FactorList>
                      </>
                    )}
                    
                    {/* Add the new calculator component without modifying existing code */}
                    <FuelCostCalculator 
                      defaultValues={insights.fuelEfficiencyInsights}
                      fuelType={vehicleData.fuelType}
                      isElectric={false}
                    />
                  </>
                )}
                
                <GovUKTooltip title={tooltips.fuelEfficiencyNote} arrow placement="top">
                  <InsightNote style={{ borderBottom: '1px dotted #505a5f', cursor: 'help', display: 'inline-block' }}>
                    Note: Fuel efficiency estimates are based on UK government data for vehicles of this type, age, and engine size. 
                    Actual performance may vary based on driving style, maintenance, and conditions.
                  </InsightNote>
                </GovUKTooltip>
              </FuelEfficiencyPanel>
            );
          
          default:
            return null;
        }
      })}
    </InsightsContainer>
  );
};

export default VehicleInsights;