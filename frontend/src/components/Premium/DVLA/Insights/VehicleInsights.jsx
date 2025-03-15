import React, { useState, useEffect } from 'react';
import {
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKBodyS,
  GovUKLoadingSpinner,
  GovUKContainer,
  COLORS
} from '../../../../styles/theme';

// Import calculator components
import EmissionsInsightsCalculator from '../Tax/EmissionsInsightsCalculator';
import OwnershipInsightsCalculator from '../Ownership/OwnershipInsightsCalculator';
import StatusInsightsCalculator from '../Status/StatusInsightsCalculator';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Import styled components with GOV.UK theme alignment
import {
  InsightsContainer,
  OwnershipPanel,
  StatusPanel,
  EmissionsPanel,
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

// Define tooltip content
const tooltips = {
  // Section tooltips
  sectionOwnership: "Ownership data is sourced directly from DVLA records",
  sectionStatus: "Status data is sourced directly from DVLA and MOT databases",
  sectionEmissions: "Emissions data is sourced from official manufacturer records via DVLA when available, otherwise estimated based on vehicle specifications",
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
  
  // General tooltips
  confidenceHigh: "High confidence (90%+): Based on official government data or direct measurements.",
  confidenceMedium: "Medium confidence (70-90%): Based on typical values for vehicles of this specification.",
  confidenceLow: "Low confidence (<70%): Limited data available, broader estimates applied.",
  
  // Notes tooltips
  fuelEfficiencyNote: "All fuel efficiency data is derived from UK Department for Business, Energy and Industrial Strategy's 'Road fuel consumption and the UK motor vehicle fleet' report"
};

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

  // Show loading state with aligned GOV.UK styling
  if (loading) {
    return (
      <GovUKContainer>
        <EnhancedLoadingContainer>
          <GovUKLoadingSpinner />
          <GovUKBody>Loading vehicle insights...</GovUKBody>
        </EnhancedLoadingContainer>
      </GovUKContainer>
    );
  }

  // Show error state with aligned GOV.UK styling
  if (error) {
    return (
      <GovUKContainer>
        <InsightsContainer>
          <GovUKHeadingM> Insights</GovUKHeadingM>
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
        {availableInsights.map(insight => {
          switch(insight.type) {
            case 'ownershipInsights':
              return insights.ownershipInsights && (
                <OwnershipPanel key="ownership">
                  <HeadingWithTooltip tooltip={tooltips.sectionOwnership} iconColor={COLORS.BLUE}>
                    <GovUKHeadingM>
                   Ownership & History 
                   </GovUKHeadingM>

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
                      <FactorsTitle color={COLORS.RED}>
                        <WarningIcon fontSize="small" /> Risk Factors:
                      </FactorsTitle>
                      <FactorList>
                        {insights.ownershipInsights.riskFactors.map((factor, index) => (
                          <FactorItem key={index} iconColor={COLORS.RED}>
                            <WarningIcon fontSize="small" />
                            <span>{factor}</span>
                          </FactorItem>
                        ))}
                      </FactorList>
                    </FactorsSection>
                  )}
                  
                  {insights.ownershipInsights.positiveFactors && insights.ownershipInsights.positiveFactors.length > 0 && (
                    <FactorsSection>
                      <FactorsTitle color={COLORS.GREEN}>
                        <CheckCircleIcon fontSize="small" /> Positive Factors:
                      </FactorsTitle>
                      <FactorList>
                        {insights.ownershipInsights.positiveFactors.map((factor, index) => (
                          <FactorItem key={index} iconColor={COLORS.GREEN}>
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
                  <HeadingWithTooltip tooltip={tooltips.sectionStatus} iconColor={COLORS.PURPLE}>
                    <GovUKHeadingM>
                    Current Status 
                    </GovUKHeadingM>
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
                            <MetricDisplay iconColor={COLORS.GREEN}>
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
                            <MetricDisplay iconColor={COLORS.BLUE}>
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
                              insights.statusInsights.daysUntilMotExpiry < 0 ? COLORS.RED :
                              insights.statusInsights.daysUntilMotExpiry < 30 ? COLORS.ORANGE : COLORS.GREEN
                            }>
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
                  
                  {insights.statusInsights.riskFactors && insights.statusInsights.riskFactors.length > 0 && (
                    <FactorsSection>
                      <FactorsTitle color={COLORS.RED}>
                        <WarningIcon fontSize="small" /> Risk Factors:
                      </FactorsTitle>
                      <FactorList>
                        {insights.statusInsights.riskFactors.map((factor, index) => (
                          <FactorItem key={index} iconColor={COLORS.RED}>
                            <WarningIcon fontSize="small" />
                            <span>{factor}</span>
                          </FactorItem>
                        ))}
                      </FactorList>
                    </FactorsSection>
                  )}
                  
                  {insights.statusInsights.positiveFactors && insights.statusInsights.positiveFactors.length > 0 && (
                    <FactorsSection>
                      <FactorsTitle color={COLORS.GREEN}>
                        <CheckCircleIcon fontSize="small" /> Positive Factors:
                      </FactorsTitle>
                      <FactorList>
                        {insights.statusInsights.positiveFactors.map((factor, index) => (
                          <FactorItem key={index} iconColor={COLORS.GREEN}>
                            <CheckCircleIcon fontSize="small" />
                            <span>{factor}</span>
                          </FactorItem>
                        ))}
                      </FactorList>
                    </FactorsSection>
                  )}
                </StatusPanel>
              );
                
              case 'emissionsInsights':
                return insights.emissionsInsights && (
                  <EmissionsPanel key="emissions">
                    <HeadingWithTooltip 
                      tooltip={insights.emissionsInsights.isEstimated 
                        ? "Emissions data is estimated based on vehicle specifications and typical values for vehicles of similar make, model, and year of manufacture." 
                        : "Emissions data is sourced from official manufacturer records via DVLA."} 
                      iconColor={COLORS.TURQUOISE}
                    >
                      <GovUKHeadingM>
                      Emissions & Tax 
                      </GovUKHeadingM>

                    </HeadingWithTooltip>
                    
                    <InsightBody>
                      {insights.emissionsInsights.isEstimated ? 
                        `Based on this vehicle's specifications, we estimate its CO2 emissions to be approximately ` :
                        `This vehicle's CO2 emissions are `
                      }
                      <ValueWithTooltip tooltip={tooltips.co2Emissions}>
                        <ValueHighlight color={COLORS.TURQUOISE}>
                          {insights.emissionsInsights.co2Emissions}g/km
                        </ValueHighlight>
                      </ValueWithTooltip>.
                      
                      {insights.emissionsInsights.euroStatus && ` It meets `}
                      {insights.emissionsInsights.euroStatus && (
                        <ValueWithTooltip tooltip="Euro emissions standards define acceptable limits for exhaust emissions of new vehicles sold in the EU and UK.">
                          <ValueHighlight color={COLORS.TURQUOISE}>
                            {insights.emissionsInsights.euroStatus}
                          </ValueHighlight>
                        </ValueWithTooltip>
                      )}
                      {insights.emissionsInsights.euroStatus && ` emissions standards.`}
                      
                      {insights.emissionsInsights.euroSubcategory && ` (Specifically `}
                      {insights.emissionsInsights.euroSubcategory && (
                        <ValueWithTooltip tooltip="Euro subcategories indicate specific implementations of emissions standards with varying limits on pollutants.">
                          <ValueHighlight color={COLORS.TURQUOISE}>
                            {insights.emissionsInsights.euroSubcategory}
                          </ValueHighlight>
                        </ValueWithTooltip>
                      )}
                      {insights.emissionsInsights.euroSubcategory && `)`}
                      
                      {insights.emissionsInsights.rde2Compliant && (
                        <span> This diesel vehicle <ValueHighlight color={COLORS.GREEN}>meets RDE2 standards</ValueHighlight>, qualifying for lower tax rates.</span>
                      )}
                    </InsightBody>
                    
                    <InsightTable>
                      <tbody>
                        {/* Tax Information Section */}
                        <tr>
                          <td colSpan="2" style={{ backgroundColor: COLORS.LIGHT_GREY, fontWeight: 'bold', paddingTop: '10px' }}>
                            Tax Information (Based on April 2024 DVLA Rates)
                          </td>
                        </tr>
                        
                        {insights.emissionsInsights.taxBand && insights.emissionsInsights.taxBand !== "N/A (Standard Rate)" && (
                          <tr>
                            <CellWithTooltip 
                              label="Tax Band" 
                              tooltip={`Vehicle tax bands are determined by CO2 emissions and registration date. Band ${insights.emissionsInsights.taxBand} applies to vehicles registered between March 2001 and March 2017.`} 
                            />
                            <td>
                              <MetricDisplay iconColor={COLORS.TURQUOISE}>
                                <InfoIcon fontSize="small" />
                                <MetricValue>
                                  Band {insights.emissionsInsights.taxBand}
                                </MetricValue>
                              </MetricDisplay>
                            </td>
                          </tr>
                        )}
                        
                        <tr>
                          <CellWithTooltip 
                            label="Annual Road Tax" 
                            tooltip={
                              `Annual Vehicle Excise Duty: ${insights.emissionsInsights.annualTaxCost}. ` +
                              `This rate is determined by the vehicle's ${insights.emissionsInsights.taxBand && insights.emissionsInsights.taxBand !== "N/A (Standard Rate)" ? 'CO2 emissions band' : 'registration date, fuel type, and CO2 emissions'}.` +
                              `${insights.emissionsInsights.taxNotes?.length > 0 ? ' ' + insights.emissionsInsights.taxNotes.join(' ') : ''}`
                            } 
                          />
                          <td>
                            <MetricDisplay iconColor={COLORS.TURQUOISE}>
                              <MetricValue>
                                {insights.emissionsInsights.annualTaxCost}
                              </MetricValue>
                            </MetricDisplay>
                          </td>
                        </tr>
                        
                        {insights.emissionsInsights.firstYearTaxCost && insights.emissionsInsights.firstYearTaxCost !== "Unknown" && (
                          <tr>
                            <CellWithTooltip 
                              label="First Year Tax" 
                              tooltip={`First year tax rate for vehicles registered after April 2017. Based on CO2 emissions of ${insights.emissionsInsights.co2Emissions}g/km.`} 
                            />
                            <td>
                              <MetricDisplay iconColor={COLORS.TURQUOISE}>
                                <MetricValue>
                                  {insights.emissionsInsights.firstYearTaxCost}
                                </MetricValue>
                              </MetricDisplay>
                            </td>
                          </tr>
                        )}
                        
                        {/* Emissions & Clean Air Zone Section */}
                        <tr>
                          <td colSpan="2" style={{ backgroundColor: COLORS.LIGHT_GREY, fontWeight: 'bold', paddingTop: '10px' }}>
                            Emissions Standards & Clean Air Zone Compliance
                          </td>
                        </tr>
                        
                        {insights.emissionsInsights.isCommercial && (
                          <tr>
                            <CellWithTooltip 
                              label="Vehicle Category" 
                              tooltip="Vehicle category affects tax calculations and emission standards that apply." 
                            />
                            <td>
                              <MetricDisplay iconColor={COLORS.BLUE}>
                                <MetricValue>
                                  {insights.emissionsInsights.vehicleCategory.charAt(0).toUpperCase() + insights.emissionsInsights.vehicleCategory.slice(1)}
                                </MetricValue>
                              </MetricDisplay>
                            </td>
                          </tr>
                        )}
                        
                        <tr>
                          <CellWithTooltip 
                            label="UK ULEZ Status" 
                            tooltip="Ultra Low Emission Zone (ULEZ) compliance based on Euro emissions standards. Non-compliant vehicles must pay a daily charge to drive in ULEZ areas." 
                          />
                          <td>
                            <StatusIndicator status={insights.emissionsInsights.isULEZCompliant ? 'Compliant' : 'Non-Compliant'}>
                              {insights.emissionsInsights.isULEZCompliant ? 
                                <CheckCircleIcon fontSize="small" /> : 
                                <CancelIcon fontSize="small" />
                              }
                              {insights.emissionsInsights.isULEZCompliant ? 'Compliant' : 'Non-Compliant'}
                            </StatusIndicator>
                          </td>
                        </tr>
                        
                        <tr>
                          <CellWithTooltip 
                            label="Scottish LEZ Status" 
                            tooltip="Scottish Low Emission Zone compliance. Non-compliant vehicles may be subject to penalties when entering LEZ areas in Scotland." 
                          />
                          <td>
                            <StatusIndicator status={insights.emissionsInsights.isScottishLEZCompliant ? 'Compliant' : 'Non-Compliant'}>
                              {insights.emissionsInsights.isScottishLEZCompliant ? 
                                <CheckCircleIcon fontSize="small" /> : 
                                <CancelIcon fontSize="small" />
                              }
                              {insights.emissionsInsights.isScottishLEZCompliant ? 'Compliant' : 'Non-Compliant'}
                            </StatusIndicator>
                          </td>
                        </tr>
                      </tbody>
                    </InsightTable>
                    
                    {/* Emissions Details Section */}
                    {insights.emissionsInsights.pollutantLimits && insights.emissionsInsights.pollutantLimits.length > 0 && (
                      <>
                        <FactorsTitle color={COLORS.TURQUOISE}>
                      Euro Standard Pollutant Limits:
                        </FactorsTitle>
                        <FactorList>
                          {insights.emissionsInsights.pollutantLimits.map((limit, index) => (
                            <FactorItem key={index} iconColor={COLORS.TURQUOISE}>
                              <InfoIcon fontSize="small" />
                              <span>{limit}</span>
                            </FactorItem>
                          ))}
                        </FactorList>
                      </>
                    )}
                    
                    {/* Display brake particulate info for Euro 7 vehicles */}
                    {insights.emissionsInsights.brakeParticulateInfo && (
                      <FactorsSection>
                        <FactorsTitle color={COLORS.TURQUOISE}>
                          <InfoIcon fontSize="small" /> Euro 7 Brake Particulate Standards:
                        </FactorsTitle>
                        <p style={{ margin: '5px 0 15px 25px', color: COLORS.DARK_GREY }}>
                          {insights.emissionsInsights.brakeParticulateInfo}
                        </p>
                      </FactorsSection>
                    )}
                    
                    {/* Clean Air Zone Impact */}
                    <FactorsSection>
                      <FactorsTitle color={
                        insights.emissionsInsights.cleanAirZoneImpact.includes("not compliant") ? 
                          COLORS.RED : 
                          COLORS.GREEN
                      }>
                        {insights.emissionsInsights.cleanAirZoneImpact.includes("not compliant") ? 
                          <WarningIcon fontSize="small" /> : 
                          <CheckCircleIcon fontSize="small" />
                        } 
                        Clean Air Zone Impact:
                      </FactorsTitle>
                      <p style={{ margin: '5px 0 15px 25px', color: COLORS.DARK_GREY }}>
                        {insights.emissionsInsights.cleanAirZoneImpact}
                      </p>
                    </FactorsSection>
                    
                    {/* Updated Section: Verify Compliance to Avoid Charges */}
                    {(!insights.emissionsInsights.isULEZCompliant || !insights.emissionsInsights.isScottishLEZCompliant) && (
                      <FactorsSection>
                        <FactorsTitle color={COLORS.BLUE}>
                          Verify Compliance to Avoid Charges
                        </FactorsTitle>
                        <p style={{ margin: '5px 0 5px 25px', color: COLORS.DARK_GREY }}>
                          Some vehicles, particularly older models, may meet emissions standards but are not recorded as compliant. For petrol vehicles, compliance with Euro 4 requires NOx emissions below 0.08 g/km. Verifying and updating your vehicle’s status may exempt it from Clean Air Zone (CAZ), Ultra Low Emission Zone (ULEZ), or Low Emission Zone (LEZ) charges.
                        </p>
                        <FactorList>
                          <FactorItem iconColor={COLORS.BLUE}>
                            <InfoIcon fontSize="small" />
                            <span>Check your Vehicle Registration Certificate (V5C) for emissions data. If NOx emissions are listed and below 0.08 g/km, you may proceed to update the compliance status.</span>
                          </FactorItem>
                          <FactorItem iconColor={COLORS.BLUE}>
                            <InfoIcon fontSize="small" />
                            <span>If emissions data is not listed, obtain a Certificate of Conformity (CoC) from the vehicle manufacturer. Contact the manufacturer directly, providing your registration number and Vehicle Identification Number (VIN).</span>
                          </FactorItem>
                          <FactorItem iconColor={COLORS.BLUE}>
                            <InfoIcon fontSize="small" />
                            <span>Submit the CoC and a copy of your V5C to the relevant authority to update your vehicle’s status: <a href="https://contact.drive-clean-air-zone.service.gov.uk/" target="_blank" style={{ color: COLORS.BLUE }}>CAZ Service</a> for UK Clean Air Zones, <a href="https://tfl.gov.uk/modes/driving/ulez-make-an-enquiry-wizard" target="_blank" style={{ color: COLORS.BLUE }}>Transport for London</a> for ULEZ, or the relevant local authority for Scottish LEZs (e.g., <a href="mailto:LEZ@glasgow.gov.uk" style={{ color: COLORS.BLUE }}>Glasgow LEZ</a>).</span>
                          </FactorItem>
                          <FactorItem iconColor={COLORS.BLUE}>
                            <InfoIcon fontSize="small" />
                            <span>Updating compliance can prevent charges and may avoid the need to replace a vehicle that meets the required standards.</span>
                          </FactorItem>
                        </FactorList>
                      </FactorsSection>
                    )}
                    
                    {/* Scottish LEZ Penalty Information */}
                    {insights.emissionsInsights.scottishLEZPenaltyInfo && !insights.emissionsInsights.isScottishLEZCompliant && (
                      <FactorsSection>
                        <FactorsTitle color={COLORS.RED}>
                          <WarningIcon fontSize="small" /> Scottish LEZ Penalty Information:
                        </FactorsTitle>
                        <p style={{ margin: '5px 0 5px 25px', color: COLORS.DARK_GREY }}>
                          Base penalty: {insights.emissionsInsights.scottishLEZPenaltyInfo.baseCharge}
                        </p>
                        <p style={{ margin: '0 0 5px 25px', color: COLORS.DARK_GREY }}>
                          Penalties increase with repeated violations: 
                          First: {insights.emissionsInsights.scottishLEZPenaltyInfo.firstSurcharge}, 
                          Second: {insights.emissionsInsights.scottishLEZPenaltyInfo.secondSurcharge}, 
                          Third: {insights.emissionsInsights.scottishLEZPenaltyInfo.thirdSurcharge}, 
                          Fourth: {insights.emissionsInsights.scottishLEZPenaltyInfo.fourthSurcharge}
                        </p>
                        <p style={{ margin: '0 0 15px 25px', color: COLORS.DARK_GREY }}>
                          {insights.emissionsInsights.scottishLEZPenaltyInfo.description}
                        </p>
                      </FactorsSection>
                    )}
                    
                    {/* Scottish LEZ Exemptions */}
                    {insights.emissionsInsights.scottishExemptions && insights.emissionsInsights.scottishExemptions.length > 0 && (
                      <FactorsSection>
                        <FactorsTitle color={COLORS.GREEN}>
                          <CheckCircleIcon fontSize="small" /> Potential LEZ Exemptions:
                        </FactorsTitle>
                        <FactorList>
                          {insights.emissionsInsights.scottishExemptions.map((exemption, index) => (
                            <FactorItem key={index} iconColor={COLORS.GREEN}>
                              <CheckCircleIcon fontSize="small" />
                              <span><strong>{exemption.type}:</strong> {exemption.description}</span>
                            </FactorItem>
                          ))}
                        </FactorList>
                      </FactorsSection>
                    )}
                    
                    {/* Tax Notes Section */}
                    {insights.emissionsInsights.taxNotes && insights.emissionsInsights.taxNotes.length > 0 && (
                      <FactorsSection>
                        <FactorsTitle color={COLORS.BLUE}>
                          Tax Notes:
                        </FactorsTitle>
                        <FactorList>
                          {insights.emissionsInsights.taxNotes.map((note, index) => (
                            <FactorItem key={index} iconColor={COLORS.BLUE}>
                              <InfoIcon fontSize="small" />
                              <span>{note}</span>
                            </FactorItem>
                          ))}
                        </FactorList>
                      </FactorsSection>
                    )}
                    
                    {/* Estimation Notes */}
                    {insights.emissionsInsights.isEstimated && (
                      <InsightNote>
                        <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        Note: Emissions data and Euro status are estimated based on vehicle age, fuel type, and specifications.
                        {insights.emissionsInsights.co2Emissions && ` CO2 estimate may have a margin of error of approximately ±15%.`}
                      </InsightNote>
                    )}
                  </EmissionsPanel>
                );
                
            case 'fuelEfficiencyInsights':
              return insights.fuelEfficiencyInsights && (
                <FuelEfficiencyPanel key="fuelEfficiency">
                  <HeadingWithTooltip tooltip={tooltips.sectionFuelEfficiency} iconColor={COLORS.GREEN}>
                    <GovUKHeadingM>
                    Fuel Efficiency 
                    </GovUKHeadingM>
                  </HeadingWithTooltip>
                  
                  {insights.fuelEfficiencyInsights.isElectric ? (
                    <>
                      <InsightBody>
                        As an electric vehicle, this car has an estimated efficiency 
                        of {withTooltip(
                          <ValueHighlight color={COLORS.GREEN}>
                            {insights.fuelEfficiencyInsights.estimatedMilesPerKWh} miles per kWh
                          </ValueHighlight>,
                          tooltips.evEfficiency
                        )}, 
                        costing approximately {withTooltip(
                          <ValueHighlight color={COLORS.GREEN}>
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
                              <MetricDisplay iconColor={COLORS.GREEN}>
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
                              <MetricDisplay iconColor={COLORS.GREEN}>
                                <MetricValue color={COLORS.GREEN}>
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
                              <MetricDisplay iconColor={COLORS.GREEN}>
                                <MetricValue color={COLORS.GREEN}>
                                  {insights.fuelEfficiencyInsights.annualCO2Savings}
                                </MetricValue>
                              </MetricDisplay>
                            </td>
                          </tr>
                        </tbody>
                      </InsightTable>
                      
                      <GovUKTooltip title={tooltips.marketTrends} arrow placement="top">
                        <FactorsTitle color={COLORS.BLUE} style={{ borderBottom: '1px dotted #505a5f', display: 'inline-flex', cursor: 'help' }}>
                         Market Trends:
                        </FactorsTitle>
                      </GovUKTooltip>
                      <FactorList>
                        <FactorItem iconColor={COLORS.BLUE}>
                          <InfoIcon fontSize="small" />
                          <span>{insights.fuelEfficiencyInsights.evMarketGrowthInfo}</span>
                        </FactorItem>
                      </FactorList>
                      
                      {/* Add the new calculator component for EVs */}
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
                          <ValueHighlight color={COLORS.GREEN}>
                            {insights.fuelEfficiencyInsights.estimatedMPGCombined} MPG
                          </ValueHighlight>,
                          tooltips.mpgCombined
                        )} combined, 
                        costing approximately {withTooltip(
                          <ValueHighlight color={COLORS.GREEN}>
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
                              <MetricDisplay iconColor={COLORS.GREEN}>
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
                                <MetricDisplay iconColor={COLORS.TURQUOISE}>
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
                            <FactorsTitle color={COLORS.BLUE} style={{ borderBottom: '1px dotted #505a5f', display: 'inline-flex', cursor: 'help' }}>
                              <InfoIcon fontSize="small" /> Efficiency Context:
                            </FactorsTitle>
                          </GovUKTooltip>
                          <FactorList>
                            <FactorItem iconColor={COLORS.BLUE}>
                              <InfoIcon fontSize="small" />
                              <span>{insights.fuelEfficiencyInsights.fuelTypeEfficiencyNote}</span>
                            </FactorItem>
                          </FactorList>
                        </>
                      )}
                      
                      {insights.fuelEfficiencyInsights.marketTrends && (
                        <>
                          <GovUKTooltip title={tooltips.marketTrends} arrow placement="top">
                            <FactorsTitle color={COLORS.BLUE} style={{ borderBottom: '1px dotted #505a5f', display: 'inline-flex', cursor: 'help' }}>
                              Market Trends:
                            </FactorsTitle>
                          </GovUKTooltip>
                          <FactorList>
                            <FactorItem iconColor={COLORS.BLUE}>
                              <InfoIcon fontSize="small" />
                              <span>{insights.fuelEfficiencyInsights.marketTrends}</span>
                            </FactorItem>
                          </FactorList>
                        </>
                      )}
                      
                      {/* Add the calculator component */}
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
    </GovUKContainer>
  );
};

export default VehicleInsights;