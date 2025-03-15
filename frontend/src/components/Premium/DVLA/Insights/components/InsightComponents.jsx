// PanelComponents.jsx
// This file contains all panel components to minimize new file creation

import React from 'react';
import {
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKBodyS,
  GovUKLoadingSpinner,
  GovUKContainer,
  COLORS,
  GovUKDetails ,
  GovUKDetailsSummary,
  GovUKDetailsText ,
  GovUKList,

} from '../../../../../styles/theme';

// Import custom tooltip components
import {
  GovUKTooltip,
  HeadingWithTooltip,
  ValueWithTooltip,
  CellWithTooltip,
  useTooltip
} from '../../../../../styles/tooltip';

// Import Material-UI icons
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Import styled components
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
} from '../style/style';

// Import calculator components
import FuelCostCalculator from '../../MPG/FuelCostCalculator';

// Define tooltip content - moved here to be accessible by all components
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
// OWNERSHIP PANEL COMPONENT
export const OwnershipPanelComponent = ({ insights }) => {
    if (!insights) return null;
    
    // Destructure environmental insights if available
    const { environmentalInsights } = insights;
    
    return (
      <OwnershipPanel>
        <HeadingWithTooltip tooltip={tooltips.sectionOwnership} iconColor={COLORS.BLUE}>
          <GovUKHeadingM>Ownership & History</GovUKHeadingM>
        </HeadingWithTooltip>
        
        <InsightBody>
          This vehicle has been with the same keeper since <ValueHighlight>
            {insights.v5cDate.toLocaleDateString('en-GB', { 
              day: 'numeric', month: 'long', year: 'numeric' 
            })}
          </ValueHighlight> ({insights.yearsWithCurrentOwner} years), 
          suggesting <ValueHighlight>{insights.ownershipStability.toLowerCase()}</ValueHighlight> ownership.
          {insights.registrationRegion && (
            <> It was first registered in <ValueHighlight>{insights.registrationRegion}</ValueHighlight>
              {insights.registrationArea && ` (${insights.registrationArea})`}.
            </>
          )}
        </InsightBody>
        
        <InsightTable>
          <tbody>
            <tr>
              <CellWithTooltip 
                label="Ownership Status" 
                tooltip={tooltips.ownershipStatus} 
              />
              <td>{insights.ownershipStability}</td>
            </tr>
            {insights.regGapYears > 0 && (
              <tr>
                <CellWithTooltip 
                  label="Registration Gap" 
                  tooltip={tooltips.registrationGap} 
                />
                <td>{insights.regGapYears} years between manufacture and DVLA registration</td>
              </tr>
            )}
            {insights.memoryTag && (
              <tr>
                <CellWithTooltip 
                  label="Registration Area" 
                  tooltip="The registration area code provides information about where the vehicle was first registered" 
                />
                <td>
                  <MetricDisplay iconColor={COLORS.BLUE}>
                    <InfoIcon fontSize="small" />
                    <MetricValue>
                      {insights.memoryTag} - {insights.registrationRegion}
                      {insights.registrationArea && ` (${insights.registrationArea})`}
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
                <StatusIndicator status={insights.ownershipRiskLevel}>
                  {insights.ownershipRiskLevel === 'Low' ? 
                    <CheckCircleIcon fontSize="small" /> : 
                    insights.ownershipRiskLevel === 'High' ? 
                      <CancelIcon fontSize="small" /> : 
                      <WarningIcon fontSize="small" />
                  }
                  {insights.ownershipRiskLevel}
                </StatusIndicator>
              </td>
            </tr>
          </tbody>
        </InsightTable>
        
        {/* Environmental Insights Section */}
        {environmentalInsights && (
          <>
            <GovUKHeadingS style={{ marginTop: '20px', marginBottom: '10px' }}>
              Regional & Environmental Factors
            </GovUKHeadingS>
            
            <InsightTable>
              <tbody>
                {/* Flood Risk */}
                {environmentalInsights.floodRisk && (
                  <tr>
                    <CellWithTooltip 
                      label="Flood Risk" 
                      tooltip="Assessment of flood risk in the vehicle's registration area" 
                    />
                    <td>
                      <StatusIndicator status={
                        environmentalInsights.floodRisk.riskLevel === 'Low' ? 'Low' :
                        environmentalInsights.floodRisk.riskLevel === 'Medium' ? 'Medium' : 'High'
                      }>
                        {environmentalInsights.floodRisk.riskLevel === 'Low' ? 
                          <CheckCircleIcon fontSize="small" /> : 
                          environmentalInsights.floodRisk.riskLevel === 'High' ? 
                            <CancelIcon fontSize="small" /> : 
                            <WarningIcon fontSize="small" />
                        }
                        {environmentalInsights.floodRisk.riskLevel}
                      </StatusIndicator>
                    </td>
                  </tr>
                )}
                
                {/* Air Quality */}
                {environmentalInsights.airQuality && (
                  <tr>
                    <CellWithTooltip 
                      label="Air Quality" 
                      tooltip="Assessment of air quality in the vehicle's registration area and its potential impact on vehicle components" 
                    />
                    <td>
                      <StatusIndicator status={
                        environmentalInsights.airQuality.qualityLevel === 'Good' ? 'Low' :
                        environmentalInsights.airQuality.qualityLevel === 'Moderate' ? 'Medium' : 'High'
                      }>
                        {environmentalInsights.airQuality.qualityLevel === 'Good' ? 
                          <CheckCircleIcon fontSize="small" /> : 
                          environmentalInsights.airQuality.qualityLevel === 'Poor' ? 
                            <CancelIcon fontSize="small" /> : 
                            <WarningIcon fontSize="small" />
                        }
                        {environmentalInsights.airQuality.qualityLevel}
                      </StatusIndicator>
                    </td>
                  </tr>
                )}
                
                {/* Road Salt Usage */}
                {environmentalInsights.roadSaltUsage && (
                  <tr>
                    <CellWithTooltip 
                      label="Road Salt Exposure" 
                      tooltip="Assessment of road salt usage in the vehicle's registration area and its potential impact on vehicle corrosion" 
                    />
                    <td>
                      <StatusIndicator status={
                        environmentalInsights.roadSaltUsage.usageLevel === 'Light' ? 'Low' :
                        environmentalInsights.roadSaltUsage.usageLevel === 'Moderate' ? 'Medium' : 'High'
                      }>
                        {environmentalInsights.roadSaltUsage.usageLevel === 'Light' ? 
                          <CheckCircleIcon fontSize="small" /> : 
                          environmentalInsights.roadSaltUsage.usageLevel === 'Heavy' ? 
                            <CancelIcon fontSize="small" /> : 
                            <WarningIcon fontSize="small" />
                        }
                        {environmentalInsights.roadSaltUsage.usageLevel}
                      </StatusIndicator>
                    </td>
                  </tr>
                )}
                
                {/* Accident Risk */}
                {environmentalInsights.accidentRisk && (
                  <tr>
                    <CellWithTooltip 
                      label="Regional Accident Risk" 
                      tooltip="Statistical assessment of accident rates in the vehicle's registration area" 
                    />
                    <td>
                      <StatusIndicator status={environmentalInsights.accidentRisk.riskLevel}>
                        {environmentalInsights.accidentRisk.riskLevel === 'Low' ? 
                          <CheckCircleIcon fontSize="small" /> : 
                          environmentalInsights.accidentRisk.riskLevel === 'High' ? 
                            <CancelIcon fontSize="small" /> : 
                            <WarningIcon fontSize="small" />
                        }
                        {environmentalInsights.accidentRisk.riskLevel}
                      </StatusIndicator>
                    </td>
                  </tr>
                )}
                
                {/* Insurance Insight */}
                {environmentalInsights.insuranceInsight && (
                  <tr>
                    <CellWithTooltip 
                      label="Insurance Risk Rating" 
                      tooltip="Regional insurance risk assessment based on local theft and accident statistics" 
                    />
                    <td>
                      <StatusIndicator status={environmentalInsights.insuranceInsight.riskRating}>
                        {environmentalInsights.insuranceInsight.riskRating === 'Low' ? 
                          <CheckCircleIcon fontSize="small" /> : 
                          environmentalInsights.insuranceInsight.riskRating === 'High' ? 
                            <CancelIcon fontSize="small" /> : 
                            <WarningIcon fontSize="small" />
                        }
                        {environmentalInsights.insuranceInsight.riskRating}
                      </StatusIndicator>
                    </td>
                  </tr>
                )}
              </tbody>
            </InsightTable>
          </>
        )}
        
        {/* Environmental Details Section */}
        {environmentalInsights && (
          <FactorsSection>
            <FactorsTitle color={COLORS.BLUE}>
              <InfoIcon fontSize="small" /> Environmental Impact Details:
            </FactorsTitle>
            <FactorList>
              {environmentalInsights.floodRisk && (
                <FactorItem 
                  iconColor={environmentalInsights.floodRisk.riskLevel === 'Low' ? COLORS.GREEN : 
                            environmentalInsights.floodRisk.riskLevel === 'High' ? COLORS.RED : 
                            COLORS.ORANGE}
                >
                  {environmentalInsights.floodRisk.riskLevel === 'Low' ? 
                    <CheckCircleIcon fontSize="small" /> : 
                    environmentalInsights.floodRisk.riskLevel === 'High' ? 
                      <WarningIcon fontSize="small" /> : 
                      <InfoIcon fontSize="small" />
                  }
                  <span><strong>Flood Risk:</strong> {environmentalInsights.floodRisk.details}</span>
                </FactorItem>
              )}
              
              {environmentalInsights.airQuality && (
                <FactorItem 
                  iconColor={environmentalInsights.airQuality.qualityLevel === 'Good' ? COLORS.GREEN : 
                            environmentalInsights.airQuality.qualityLevel === 'Poor' ? COLORS.RED : 
                            COLORS.ORANGE}
                >
                  {environmentalInsights.airQuality.qualityLevel === 'Good' ? 
                    <CheckCircleIcon fontSize="small" /> : 
                    environmentalInsights.airQuality.qualityLevel === 'Poor' ? 
                      <WarningIcon fontSize="small" /> : 
                      <InfoIcon fontSize="small" />
                  }
                  <span><strong>Emissions System Impact:</strong> {environmentalInsights.airQuality.catalyticConverterImpact}</span>
                </FactorItem>
              )}
              
              {environmentalInsights.roadSaltUsage && (
                <FactorItem 
                  iconColor={environmentalInsights.roadSaltUsage.usageLevel === 'Light' ? COLORS.GREEN : 
                            environmentalInsights.roadSaltUsage.usageLevel === 'Heavy' ? COLORS.RED : 
                            COLORS.ORANGE}
                >
                  {environmentalInsights.roadSaltUsage.usageLevel === 'Light' ? 
                    <CheckCircleIcon fontSize="small" /> : 
                    environmentalInsights.roadSaltUsage.usageLevel === 'Heavy' ? 
                      <WarningIcon fontSize="small" /> : 
                      <InfoIcon fontSize="small" />
                  }
                  <span><strong>Corrosion Risk:</strong> {environmentalInsights.roadSaltUsage.details}</span>
                </FactorItem>
              )}
              
              {environmentalInsights.accidentRisk && (
                <FactorItem 
                  iconColor={environmentalInsights.accidentRisk.riskLevel === 'Low' ? COLORS.GREEN : 
                            environmentalInsights.accidentRisk.riskLevel === 'High' ? COLORS.RED : 
                            COLORS.ORANGE}
                >
                  {environmentalInsights.accidentRisk.riskLevel === 'Low' ? 
                    <CheckCircleIcon fontSize="small" /> : 
                    environmentalInsights.accidentRisk.riskLevel === 'High' ? 
                      <WarningIcon fontSize="small" /> : 
                      <InfoIcon fontSize="small" />
                  }
                  <span><strong>Accident History Risk:</strong> {environmentalInsights.accidentRisk.details}</span>
                </FactorItem>
              )}
              
              {environmentalInsights.insuranceInsight && (
                <FactorItem 
                  iconColor={environmentalInsights.insuranceInsight.riskRating === 'Low' ? COLORS.GREEN : 
                            environmentalInsights.insuranceInsight.riskRating === 'High' ? COLORS.RED : 
                            COLORS.ORANGE}
                >
                  {environmentalInsights.insuranceInsight.riskRating === 'Low' ? 
                    <CheckCircleIcon fontSize="small" /> : 
                    environmentalInsights.insuranceInsight.riskRating === 'High' ? 
                      <WarningIcon fontSize="small" /> : 
                      <InfoIcon fontSize="small" />
                  }
                  <span><strong>Insurance Implications:</strong> {environmentalInsights.insuranceInsight.details}</span>
                </FactorItem>
              )}
            </FactorList>
          </FactorsSection>
        )}
        
        {/* Risk Factors Section */}
        {insights.riskFactors && insights.riskFactors.length > 0 && (
          <FactorsSection>
            <FactorsTitle color={COLORS.RED}>
              <WarningIcon fontSize="small" /> Risk Factors:
            </FactorsTitle>
            <FactorList>
              {insights.riskFactors.map((factor, index) => (
                <FactorItem key={index} iconColor={COLORS.RED}>
                  <WarningIcon fontSize="small" />
                  <span>{factor}</span>
                </FactorItem>
              ))}
            </FactorList>
          </FactorsSection>
        )}
        
        {/* Positive Factors Section */}
        {insights.positiveFactors && insights.positiveFactors.length > 0 && (
          <FactorsSection>
            <FactorsTitle color={COLORS.GREEN}>
              <CheckCircleIcon fontSize="small" /> Positive Factors:
            </FactorsTitle>
            <FactorList>
              {insights.positiveFactors.map((factor, index) => (
                <FactorItem key={index} iconColor={COLORS.GREEN}>
                  <CheckCircleIcon fontSize="small" />
                  <span>{factor}</span>
                </FactorItem>
              ))}
            </FactorList>
          </FactorsSection>
        )}
        
        {/* Data Source Note */}
        {insights.registrationRegion && (
          <InsightNote>
            <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px', color: COLORS.BLUE }} />
            Regional and environmental assessments are based on statistical data for the vehicle's registration area.
            Individual vehicle experiences may vary based on specific usage patterns and maintenance history.
          </InsightNote>
        )}
      </OwnershipPanel>
    );
  };

// STATUS PANEL COMPONENT
export const StatusPanelComponent = ({ insights }) => {
  if (!insights) return null;
  
  return (
    <StatusPanel>
      <HeadingWithTooltip tooltip={tooltips.sectionStatus} iconColor={COLORS.PURPLE}>
        <GovUKHeadingM>Current Status</GovUKHeadingM>
      </HeadingWithTooltip>
      
      <InsightBody>
        This vehicle is currently{' '}
        <ValueHighlight>
          {insights.isTaxExempt ? 'EXEMPT FROM TAX' : insights.taxStatus}
        </ValueHighlight>{' '}
        {insights.isPossiblyMotExempt ? (
          <>and <ValueHighlight>possibly exempt from MOT</ValueHighlight></>
        ) : (
          <>with a <ValueHighlight>{insights.motStatus.toLowerCase()}</ValueHighlight> MOT</>
        )}, 
        making its driveability status: <ValueHighlight>
          {insights.driveabilityStatus}
        </ValueHighlight>.
      </InsightBody>
      
      <InsightTable>
        <tbody>
          <tr>
            <CellWithTooltip 
              label="Driveability Status" 
              tooltip={tooltips.driveabilityStatus} 
            />
            <td>{insights.driveabilityStatus}</td>
          </tr>
          {insights.isTaxExempt && (
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
          {insights.isPossiblyMotExempt && (
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
          {insights.motExpiryDate && !insights.isPossiblyMotExempt && (
            <tr>
              <CellWithTooltip 
                label="MOT Expires" 
                tooltip={tooltips.motStatus} 
              />
              <td>
                <MetricDisplay iconColor={
                  insights.daysUntilMotExpiry < 0 ? COLORS.RED :
                  insights.daysUntilMotExpiry < 30 ? COLORS.ORANGE : COLORS.GREEN
                }>
                  <MetricValue>
                    {insights.motExpiryDate.toLocaleDateString('en-GB', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                    {insights.daysUntilMotExpiry > 0 ? 
                      ` (${insights.daysUntilMotExpiry} days)` : 
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
              <StatusIndicator status={insights.statusRiskLevel}>
                {insights.statusRiskLevel === 'Low' ? 
                  <CheckCircleIcon fontSize="small" /> : 
                  insights.statusRiskLevel === 'High' ? 
                    <CancelIcon fontSize="small" /> : 
                    <WarningIcon fontSize="small" />
                }
                {insights.statusRiskLevel}
              </StatusIndicator>
            </td>
          </tr>
        </tbody>
      </InsightTable>
      
      {insights.riskFactors && insights.riskFactors.length > 0 && (
        <FactorsSection>
          <FactorsTitle color={COLORS.RED}>
            <WarningIcon fontSize="small" /> Risk Factors:
          </FactorsTitle>
          <FactorList>
            {insights.riskFactors.map((factor, index) => (
              <FactorItem key={index} iconColor={COLORS.RED}>
                <WarningIcon fontSize="small" />
                <span>{factor}</span>
              </FactorItem>
            ))}
          </FactorList>
        </FactorsSection>
      )}
      
      {insights.positiveFactors && insights.positiveFactors.length > 0 && (
        <FactorsSection>
          <FactorsTitle color={COLORS.GREEN}>
            <CheckCircleIcon fontSize="small" /> Positive Factors:
          </FactorsTitle>
          <FactorList>
            {insights.positiveFactors.map((factor, index) => (
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
};

// EMISSIONS PANEL COMPONENT
export const EmissionsPanelComponent = ({ insights }) => {
  if (!insights) return null;
  
  return (
    <EmissionsPanel>
      <HeadingWithTooltip 
        tooltip={insights.isEstimated 
          ? "Emissions data is estimated based on vehicle specifications and typical values for vehicles of similar make, model, and year of manufacture." 
          : "Emissions data is sourced from official manufacturer records via DVLA."} 
        iconColor={COLORS.BLUE}
      >
        <GovUKHeadingM>Emissions & Tax</GovUKHeadingM>
      </HeadingWithTooltip>
      
      <InsightBody>
        {/* Historic Vehicle Notice */}
        {insights.isHistoricVehicle && (
          <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: COLORS.LIGHT_GREEN, borderRadius: '4px' }}>
            <strong>Historic Vehicle Status:</strong> This vehicle qualifies as a historic vehicle (40+ years old).
            {insights.isMotExempt && " It is exempt from MOT testing requirements."}
            {insights.annualTaxCost?.includes("Exempt") && " It is also exempt from vehicle tax when registered in the 'Historic Vehicle' tax class with the DVLA."}
          </div>
        )}

        {insights.isEstimated ? 
          `Based on this vehicle's specifications, we estimate its CO2 emissions to be approximately ` :
          `This vehicle's CO2 emissions are `
        }
        <ValueWithTooltip tooltip={tooltips.co2Emissions}>
          <ValueHighlight color={COLORS.BLUE}>
            {insights.co2Emissions}g/km
          </ValueHighlight>
        </ValueWithTooltip>.
        
        {insights.euroStatus && ` It meets `}
        {insights.euroStatus && (
          <ValueWithTooltip tooltip="Euro emissions standards define acceptable limits for exhaust emissions of new vehicles sold in the EU and UK.">
            <ValueHighlight color={COLORS.BLUE}>
              {insights.euroStatus}
            </ValueHighlight>
          </ValueWithTooltip>
        )}
        {insights.euroStatus && ` emissions standards.`}
        
        {insights.euroSubcategory && ` (Specifically `}
        {insights.euroSubcategory && (
          <ValueWithTooltip tooltip="Euro subcategories indicate specific implementations of emissions standards with varying limits on pollutants.">
            <ValueHighlight color={COLORS.BLUE}>
              {insights.euroSubcategory}
            </ValueHighlight>
          </ValueWithTooltip>
        )}
        {insights.euroSubcategory && `)`}
        
        {insights.rde2Compliant && (
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
          
          {/* Show Category for All Vehicles */}
          <tr>
            <CellWithTooltip 
              label="Vehicle Category" 
              tooltip="Vehicle category affects tax calculations, emissions standards, and exemption eligibility." 
            />
            <td>
              <MetricDisplay iconColor={COLORS.BLUE}>
                <MetricValue>
                  {insights.vehicleCategory.charAt(0).toUpperCase() + insights.vehicleCategory.slice(1)}
                </MetricValue>
              </MetricDisplay>
            </td>
          </tr>
          
          {/* Tax Class - Only show if explicit exemption */}
          {insights.annualTaxCost?.includes("Exempt") && (
            <tr>
              <CellWithTooltip 
                label="Tax Status" 
                tooltip="Vehicles may be exempt from tax based on age, category, or special designations." 
              />
              <td>
                <StatusIndicator status="Exempt">
                  <CheckCircleIcon fontSize="small" />
                  {insights.annualTaxCost.includes("Historic") ? "Historic Vehicle - Exempt" : 
                    insights.annualTaxCost.includes("NHS") ? "NHS Vehicle - Exempt" :
                    insights.annualTaxCost.includes("Crown") ? "Crown Vehicle - Exempt" :
                    insights.annualTaxCost.includes("Emergency") ? "Emergency Vehicle - Exempt" :
                    insights.annualTaxCost.includes("Disabled") ? "Disabled Vehicle - Exempt" :
                    insights.annualTaxCost.includes("Electric Motorcycle") ? "Electric Motorcycle - Exempt" :
                    "Exempt"}
                </StatusIndicator>
              </td>
            </tr>
          )}
          
          {insights.taxBand && insights.taxBand !== "N/A (Standard Rate)" && 
           !insights.taxBand.includes("Historic") && (
            <tr>
              <CellWithTooltip 
                label="Tax Band" 
                tooltip={`Vehicle tax bands are determined by CO2 emissions and registration date. Band ${insights.taxBand} applies to vehicles registered between March 2001 and March 2017.`} 
              />
              <td>
                <MetricDisplay iconColor={COLORS.BLUE}>
                  <InfoIcon fontSize="small" />
                  <MetricValue>
                    {insights.taxBand.startsWith("Band") ? insights.taxBand : `Band ${insights.taxBand}`}
                  </MetricValue>
                </MetricDisplay>
              </td>
            </tr>
          )}
          
          {/* Only show if not exempt */}
          {!insights.annualTaxCost?.includes("Exempt") && (
            <>
              <tr>
                <CellWithTooltip 
                  label="Annual Road Tax" 
                  tooltip={
                    `Annual Vehicle Excise Duty: ${insights.annualTaxCost}. ` +
                    `This rate is determined by the vehicle's ${insights.taxBand && insights.taxBand !== "N/A (Standard Rate)" ? 'CO2 emissions band' : 'registration date, fuel type, and CO2 emissions'}.`
                  } 
                />
                <td>
                  <MetricDisplay iconColor={COLORS.BLUE}>
                    <MetricValue>
                      {insights.annualTaxCost}
                    </MetricValue>
                  </MetricDisplay>
                </td>
              </tr>
              
              {/* Direct Debit option */}
              {insights.annualTaxCostDirectDebit && 
              insights.annualTaxCostDirectDebit !== "Unknown" && 
              !insights.annualTaxCostDirectDebit.includes("£0") && (
                <tr>
                  <CellWithTooltip 
                    label="Direct Debit Option" 
                    tooltip="Monthly installment option available when paying by Direct Debit." 
                  />
                  <td>
                    <MetricDisplay iconColor={COLORS.BLUE}>
                      <MetricValue>
                        {insights.annualTaxCostDirectDebit}
                      </MetricValue>
                    </MetricDisplay>
                  </td>
                </tr>
              )}
            </>
          )}
          
          {insights.firstYearTaxCost && 
           insights.firstYearTaxCost !== "Unknown" && 
           !insights.firstYearTaxCost.includes("Exempt") && (
            <tr>
              <CellWithTooltip 
                label="First Year Tax" 
                tooltip={`First year tax rate for vehicles registered after April 2017. Based on CO2 emissions of ${insights.co2Emissions}g/km.`} 
              />
              <td>
                <MetricDisplay iconColor={COLORS.BLUE}>
                  <MetricValue>
                    {insights.firstYearTaxCost}
                  </MetricValue>
                </MetricDisplay>
              </td>
            </tr>
          )}
          
          {/* MOT Exemption */}
          {insights.isMotExempt && (
            <tr>
              <CellWithTooltip 
                label="MOT Status" 
                tooltip="Vehicles manufactured before 1984 (40+ years old) are exempt from MOT testing unless they have been substantially modified." 
              />
              <td>
                <StatusIndicator status="Exempt">
                  <CheckCircleIcon fontSize="small" />
                  MOT Exempt (40+ years old)
                </StatusIndicator>
              </td>
            </tr>
          )}
          
          {/* Emissions & Clean Air Zone Section */}
          <tr>
            <td colSpan="2" style={{ backgroundColor: COLORS.LIGHT_GREY, fontWeight: 'bold', paddingTop: '10px' }}>
              Emissions Standards & Clean Air Zone Compliance
            </td>
          </tr>
          
          <tr>
            <CellWithTooltip 
              label="UK ULEZ Status" 
              tooltip={
                insights.isHistoricVehicle && insights.isULEZCompliant ?
                "This vehicle is exempt from ULEZ charges as a historic vehicle (30+ years old)." :
                "Ultra Low Emission Zone (ULEZ) compliance based on Euro emissions standards. Non-compliant vehicles must pay a daily charge to drive in ULEZ areas."
              } 
            />
            <td>
              <StatusIndicator status={insights.isULEZCompliant ? 'Compliant' : 'Non-Compliant'}>
                {insights.isULEZCompliant ? 
                  <CheckCircleIcon fontSize="small" /> : 
                  <CancelIcon fontSize="small" />
                }
                {insights.isULEZCompliant ? 
                  (insights.isHistoricVehicle ? 'Compliant (Historic Vehicle)' : 'Compliant') : 
                  'Non-Compliant'
                }
              </StatusIndicator>
            </td>
          </tr>
          
          <tr>
            <CellWithTooltip 
              label="Scottish LEZ Status" 
              tooltip={
                insights.isHistoricVehicle && insights.isScottishLEZCompliant ?
                "This vehicle is exempt from Scottish LEZ restrictions as a historic vehicle (30+ years old)." :
                "Scottish Low Emission Zone compliance. Non-compliant vehicles may be subject to penalties when entering LEZ areas in Scotland."
              } 
            />
            <td>
              <StatusIndicator status={insights.isScottishLEZCompliant ? 'Compliant' : 'Non-Compliant'}>
                {insights.isScottishLEZCompliant ? 
                  <CheckCircleIcon fontSize="small" /> : 
                  <CancelIcon fontSize="small" />
                }
                {insights.isScottishLEZCompliant ? 
                  (insights.isHistoricVehicle ? 'Compliant (Historic Vehicle)' : 'Compliant') : 
                  'Non-Compliant'
                }
              </StatusIndicator>
            </td>
          </tr>
        </tbody>
      </InsightTable>
      
      {/* Emissions Details Section */}
      {insights.pollutantLimits && insights.pollutantLimits.length > 0 && (
        <>
          <FactorsTitle color={COLORS.BLUE}>
        Euro Standard Pollutant Limits:
          </FactorsTitle>
          <FactorList>
            {insights.pollutantLimits.map((limit, index) => (
              <FactorItem key={index} iconColor={COLORS.BLUE}>
                <InfoIcon fontSize="small" />
                <span>{limit}</span>
              </FactorItem>
            ))}
          </FactorList>
        </>
      )}
      
      {/* Display brake particulate info for Euro 7 vehicles */}
      {insights.brakeParticulateInfo && (
        <FactorsSection>
          <FactorsTitle color={COLORS.BLUE}>
            <InfoIcon fontSize="small" /> Euro 7 Brake Particulate Standards:
          </FactorsTitle>
          <p style={{ margin: '5px 0 15px 25px', color: COLORS.DARK_GREY }}>
            {insights.brakeParticulateInfo}
          </p>
        </FactorsSection>
      )}
      
      {/* Clean Air Zone Impact */}
      <FactorsSection>
        <FactorsTitle color={
          insights.cleanAirZoneImpact.includes("not compliant") ? 
            COLORS.RED : 
            COLORS.GREEN
        }>
          {insights.cleanAirZoneImpact.includes("not compliant") ? 
            <WarningIcon fontSize="small" /> : 
            <CheckCircleIcon fontSize="small" />
          } 
          Clean Air Zone Impact:
        </FactorsTitle>
        <p style={{ margin: '5px 0 15px 25px', color: COLORS.DARK_GREY }}>
          {insights.cleanAirZoneImpact}
          {insights.isHistoricVehicle && insights.cleanAirZoneImpact.includes("exempt") && 
            " However, always check with the relevant authorities before travel as exemption policies may change."}
        </p>
      </FactorsSection>
      
      {/* Updated Section: Verify Compliance to Avoid Charges - only show if NOT exempt due to historic status */}
      {(!insights.isULEZCompliant || !insights.isScottishLEZCompliant) && 
       !insights.isHistoricVehicle && (
        <FactorsSection>
          <FactorsTitle color={COLORS.BLUE}>
            Verify Compliance to Avoid Charges
          </FactorsTitle>
          <p style={{ margin: '5px 0 5px 25px', color: COLORS.DARK_GREY }}>
            Some vehicles, particularly older models, may meet emissions standards but are not recorded as compliant. For petrol vehicles, compliance with Euro 4 requires NOx emissions below 0.08 g/km. Verifying and updating your vehicle's status may exempt it from Clean Air Zone (CAZ), Ultra Low Emission Zone (ULEZ), or Low Emission Zone (LEZ) charges.
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
              <span>Submit the CoC and a copy of your V5C to the relevant authority to update your vehicle's status: <a href="https://contact.drive-clean-air-zone.service.gov.uk/" target="_blank" style={{ color: COLORS.BLUE }}>CAZ Service</a> for UK Clean Air Zones, <a href="https://tfl.gov.uk/modes/driving/ulez-make-an-enquiry-wizard" target="_blank" style={{ color: COLORS.BLUE }}>Transport for London</a> for ULEZ, or the relevant local authority for Scottish LEZs (e.g., <a href="mailto:LEZ@glasgow.gov.uk" style={{ color: COLORS.BLUE }}>Glasgow LEZ</a>).</span>
            </FactorItem>
            <FactorItem iconColor={COLORS.BLUE}>
              <InfoIcon fontSize="small" />
              <span>Updating compliance can prevent charges and may avoid the need to replace a vehicle that meets the required standards.</span>
            </FactorItem>
          </FactorList>
        </FactorsSection>
      )}
      
      {/* Scottish LEZ Penalty Information - Only show if not exempt due to historic status */}
      {insights.scottishLEZPenaltyInfo && 
       !insights.isScottishLEZCompliant && 
       !insights.isHistoricVehicle && (
        <FactorsSection>
          <FactorsTitle color={COLORS.RED}>
            <WarningIcon fontSize="small" /> Scottish LEZ Penalty Information:
          </FactorsTitle>
          <p style={{ margin: '5px 0 5px 25px', color: COLORS.DARK_GREY }}>
            Base penalty: {insights.scottishLEZPenaltyInfo.baseCharge}
          </p>
          <p style={{ margin: '0 0 5px 25px', color: COLORS.DARK_GREY }}>
            Penalties increase with repeated violations: 
            First: {insights.scottishLEZPenaltyInfo.firstSurcharge}, 
            Second: {insights.scottishLEZPenaltyInfo.secondSurcharge}, 
            Third: {insights.scottishLEZPenaltyInfo.thirdSurcharge}, 
            Fourth: {insights.scottishLEZPenaltyInfo.fourthSurcharge}
          </p>
          <p style={{ margin: '0 0 15px 25px', color: COLORS.DARK_GREY }}>
            {insights.scottishLEZPenaltyInfo.description}
          </p>
          <p style={{ margin: '0 0 15px 25px', color: COLORS.DARK_GREY }}>
            {insights.scottishLEZPenaltyInfo.resetPeriod}
          </p>
        </FactorsSection>
      )}
      
      {/* Scottish LEZ Exemptions */}
      {insights.scottishExemptions && insights.scottishExemptions.length > 0 && (
        <FactorsSection>
          <FactorsTitle color={COLORS.GREEN}>
            <CheckCircleIcon fontSize="small" /> Potential LEZ Exemptions:
          </FactorsTitle>
          <FactorList>
            {insights.scottishExemptions.map((exemption, index) => (
              <FactorItem key={index} iconColor={COLORS.GREEN}>
                <CheckCircleIcon fontSize="small" />
                <span><strong>{exemption.type}:</strong> {exemption.description}</span>
              </FactorItem>
            ))}
          </FactorList>
        </FactorsSection>
      )}
      
      {/* Tax Notes Section */}
      {insights.taxNotes && insights.taxNotes.length > 0 && (
        <FactorsSection>
          <FactorsTitle color={COLORS.BLUE}>
            Tax Notes:
          </FactorsTitle>
          <FactorList>
            {insights.taxNotes.map((note, index) => (
              <FactorItem key={index} iconColor={COLORS.BLUE}>
                <InfoIcon fontSize="small" />
                <span>{note}</span>
              </FactorItem>
            ))}
          </FactorList>
        </FactorsSection>
      )}
      
      {/* Estimation Notes */}
      {insights.isEstimated && (
        <InsightNote>
          <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          Note: Emissions data and Euro status are estimated based on vehicle age, fuel type, and specifications.
          {insights.co2Emissions && ` CO2 estimate may have a margin of error of approximately ±15%.`}
        </InsightNote>
      )}
    </EmissionsPanel>
  );
};

// FUEL EFFICIENCY PANEL COMPONENT
export const FuelEfficiencyPanelComponent = ({ insights, vehicleData }) => {
  if (!insights) return null;
  
  const { withTooltip } = useTooltip();
  
  return (
    <FuelEfficiencyPanel>
      <HeadingWithTooltip tooltip={tooltips.sectionFuelEfficiency} iconColor={COLORS.GREEN}>
        <GovUKHeadingM>Fuel Efficiency</GovUKHeadingM>
      </HeadingWithTooltip>
      
      {insights.isElectric ? (
        <>
          <InsightBody>
            As an electric vehicle, this car has an estimated efficiency 
            of {withTooltip(
              <ValueHighlight color={COLORS.GREEN}>
                {insights.estimatedMilesPerKWh} miles per kWh
              </ValueHighlight>,
              tooltips.evEfficiency
            )}, 
            costing approximately {withTooltip(
              <ValueHighlight color={COLORS.GREEN}>
                £{insights.estimatedCostPerMile} per mile
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
                      {insights.estimatedRange}
                    </MetricValue>
                  </MetricDisplay>
                </td>
              </tr>
              <tr>
                <CellWithTooltip 
                  label="Battery Capacity" 
                  tooltip="Estimated based on typical battery size for EVs of this age and model" 
                />
                <td>{insights.batteryCapacityEstimate}</td>
              </tr>
              <tr>
                <CellWithTooltip 
                  label="Annual Savings vs Petrol" 
                  tooltip={tooltips.evAnnualSavings} 
                />
                <td>
                  <MetricDisplay iconColor={COLORS.GREEN}>
                    <MetricValue color={COLORS.GREEN}>
                      {insights.annualSavingsVsPetrol}
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
                      {insights.annualCO2Savings}
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
              <span>{insights.evMarketGrowthInfo}</span>
            </FactorItem>
          </FactorList>
          
          {/* Add the new calculator component for EVs */}
          <FuelCostCalculator 
            defaultValues={insights}
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
                {insights.estimatedMPGCombined} MPG
              </ValueHighlight>,
              tooltips.mpgCombined
            )} combined, 
            costing approximately {withTooltip(
              <ValueHighlight color={COLORS.GREEN}>
                £{insights.costPerMile} per mile
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
                <td>{insights.estimatedMPGUrban} MPG</td>
              </tr>
              <tr>
                <CellWithTooltip 
                  label="Estimated Extra-Urban MPG" 
                  tooltip={tooltips.mpgExtraUrban} 
                />
                <td>{insights.estimatedMPGExtraUrban} MPG</td>
              </tr>
              <tr>
                <CellWithTooltip 
                  label="Estimated Annual Fuel Cost" 
                  tooltip={tooltips.annualFuelCost} 
                />
                <td>
                  <MetricDisplay iconColor={COLORS.GREEN}>
                    <MetricValue>
                      £{insights.annualFuelCost}
                    </MetricValue>
                    <MetricLabel>(based on average UK mileage)</MetricLabel>
                  </MetricDisplay>
                </td>
              </tr>
              {insights.co2EmissionsGPerKM && (
                <tr>
                  <CellWithTooltip 
                    label="CO2 Emissions" 
                    tooltip={tooltips.co2Emissions} 
                  />
                  <td>
                    <MetricDisplay iconColor={COLORS.BLUE}>
                      <MetricValue>
                        {insights.co2EmissionsGPerKM} g/km
                      </MetricValue>
                    </MetricDisplay>
                  </td>
                </tr>
              )}
            </tbody>
          </InsightTable>
          
          {insights.fuelTypeEfficiencyNote && (
            <>
              <GovUKTooltip title={tooltips.efficiencyContext} arrow placement="top">
                <FactorsTitle color={COLORS.BLUE} style={{ borderBottom: '1px dotted #505a5f', display: 'inline-flex', cursor: 'help' }}>
                  <InfoIcon fontSize="small" /> Efficiency Context:
                </FactorsTitle>
              </GovUKTooltip>
              <FactorList>
                <FactorItem iconColor={COLORS.BLUE}>
                  <InfoIcon fontSize="small" />
                  <span>{insights.fuelTypeEfficiencyNote}</span>
                </FactorItem>
              </FactorList>
            </>
          )}
          
          {insights.marketTrends && (
            <>
              <GovUKTooltip title={tooltips.marketTrends} arrow placement="top">
                <FactorsTitle color={COLORS.BLUE} style={{ borderBottom: '1px dotted #505a5f', display: 'inline-flex', cursor: 'help' }}>
                  Market Trends:
                </FactorsTitle>
              </GovUKTooltip>
              <FactorList>
                <FactorItem iconColor={COLORS.BLUE}>
                  <InfoIcon fontSize="small" />
                  <span>{insights.marketTrends}</span>
                </FactorItem>
              </FactorList>
            </>
          )}
          
          {/* Add the calculator component */}
          <FuelCostCalculator 
            defaultValues={insights}
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
};