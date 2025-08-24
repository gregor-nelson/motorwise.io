// Enhanced Insight Components - Tailwind Version
// Converted from styled-components to Tailwind CSS utility classes

import React from 'react';

// Import tooltip components
import {
  HeadingWithTooltip,
  ValueWithTooltip,
  CellWithTooltip,
  useTooltip,
  GovUKTooltip
} from '../../../../../styles/tooltip';

// Import calculator components
import FuelCostCalculator from '../../MPG/FuelCostCalculator';

// Using Phosphor Icons via CSS classes

// Complete tooltip content from original
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

// Simple Gauge component with minimal Tailwind styling
const Gauge = ({ value, max, unit, label, color, size = 140 }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colorClass = color === 'var(--positive)' ? 'text-green-600' :
                    color === 'var(--warning)' ? 'text-yellow-600' :
                    color === 'var(--negative)' ? 'text-red-600' :
                    'text-blue-600';
  
  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8"
                  fill="none" className="text-neutral-200" />
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8"
                  fill="none" strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`${colorClass}`} />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-bold text-neutral-900">{value}</div>
          <div className="text-xs text-neutral-500">{unit}</div>
        </div>
      </div>
      <div className="text-sm font-medium text-neutral-900">{label}</div>
    </div>
  );
};

// OWNERSHIP PANEL COMPONENT
export const OwnershipPanelComponent = ({ insights }) => {
  if (!insights) return null;
  
  const { environmentalInsights } = insights;
  
  // Calculate ownership score (0-100)
  const ownershipScore = insights.ownershipRiskLevel === 'Low' ? 85 : 
                        insights.ownershipRiskLevel === 'Medium' ? 50 : 20;
  
  // Determine ownership stability display
  const getOwnershipStability = (stability) => {
    switch(stability) {
      case 'Very Stable': return 'Long-term';
      case 'Stable': return 'Medium-term';
      case 'Moderate': return 'Medium-term';
      case 'Recent': return 'Short-term';
      case 'Very Recent': return 'Very Short-term';
      default: return stability;
    }
  };
  
  const ownershipStabilityDisplay = getOwnershipStability(insights.ownershipStability);
  
  return (
    <div className="bg-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <i className="ph ph-car text-lg text-blue-600 mr-3"></i>
          <h2 className="text-lg font-medium text-neutral-900">Ownership & History</h2>
        </div>
        <p className="text-xs text-neutral-600">
          Vehicle ownership patterns and regional analysis
        </p>
      </div>
      
      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Ownership Duration Card */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <Gauge
            value={insights.yearsWithCurrentOwner}
            max={20}
            unit="years"
            label="Current Ownership"
            color={insights.yearsWithCurrentOwner > 5 ? 'var(--positive)' : 
                  insights.yearsWithCurrentOwner > 2 ? 'var(--warning)' : 'var(--negative)'}
          />
          <div className="text-xs text-neutral-500 text-center mt-2">
            Since {insights.v5cDate.toLocaleDateString('en-GB', { 
              day: 'numeric', month: 'short', year: 'numeric' 
            })}
          </div>
        </div>
        
        {/* Ownership Score */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-neutral-900">Ownership Stability</div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-neutral-900">{ownershipStabilityDisplay}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                insights.ownershipRiskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                insights.ownershipRiskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {insights.ownershipRiskLevel} Risk
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  ownershipScore > 70 ? 'bg-green-500' : 
                  ownershipScore > 40 ? 'bg-transparent' : 'bg-transparent'
                }`}
                style={{ width: `${ownershipScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Registration Area Card */}
        {insights.registrationRegion && (
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-neutral-900">Registration Area</div>
              <i className="ph ph-map-pin text-lg text-blue-600"></i>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {insights.memoryTag || 'N/A'}
              <span className="text-lg font-normal text-neutral-600 ml-2">{insights.registrationRegion}</span>
            </div>
            {insights.registrationArea && (
              <div className="text-xs text-neutral-500 mt-2">{insights.registrationArea}</div>
            )}
          </div>
        )}
        
        {/* Registration Gap Card */}
        {insights.regGapYears > 0 && (
          <div className="bg-transparent rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-neutral-900">Registration Gap</div>
              <i className="ph ph-calendar text-lg text-yellow-600"></i>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {insights.regGapYears}
              <span className="text-lg font-normal text-neutral-600 ml-2">years</span>
            </div>
            <div className="text-xs text-neutral-500 mt-2">Between manufacture and UK registration</div>
          </div>
        )}
      </div>
      
      {/* Environmental Insights Section */}
      {environmentalInsights && (
        <>
          <h3 className="text-lg font-medium text-neutral-900 mb-6">
            Regional & Environmental Factors
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Flood Risk Card */}
            {environmentalInsights.floodRisk && (
              <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
                environmentalInsights.floodRisk.riskLevel === 'Low' ? 'bg-green-50' :
                environmentalInsights.floodRisk.riskLevel === 'Medium' ? 'bg-transparent' : 'bg-transparent'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-neutral-900">Flood Risk</div>
                  <i className={`ph text-lg ${
                    environmentalInsights.floodRisk.riskLevel === 'Low' ? 'ph-check-circle text-green-600' :
                    environmentalInsights.floodRisk.riskLevel === 'Medium' ? 'ph-warning text-yellow-600' :
                    'ph-x-circle text-red-600'
                  }`}></i>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                  environmentalInsights.floodRisk.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                  environmentalInsights.floodRisk.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <i className={`ph text-sm ${
                    environmentalInsights.floodRisk.riskLevel === 'Low' ? 'ph-check-circle' :
                    environmentalInsights.floodRisk.riskLevel === 'High' ? 'ph-x-circle' :
                    'ph-warning'
                  }`}></i>
                  {environmentalInsights.floodRisk.riskLevel}
                </div>
                <div className="text-xs text-neutral-500 mt-3">
                  {environmentalInsights.floodRisk.details}
                </div>
              </div>
            )}
            
            {/* Air Quality Card */}
            {environmentalInsights.airQuality && (
              <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
                environmentalInsights.airQuality.qualityLevel === 'Good' ? 'bg-green-50' :
                environmentalInsights.airQuality.qualityLevel === 'Moderate' ? 'bg-transparent' : 'bg-transparent'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-neutral-900">Air Quality</div>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                  environmentalInsights.airQuality.qualityLevel === 'Good' ? 'bg-green-100 text-green-700' :
                  environmentalInsights.airQuality.qualityLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {environmentalInsights.airQuality.qualityLevel}
                </div>
                <div className="text-xs text-neutral-500 mt-3">
                  {environmentalInsights.airQuality.catalyticConverterImpact}
                </div>
              </div>
            )}
            
            {/* Road Salt Card */}
            {environmentalInsights.roadSaltUsage && (
              <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
                environmentalInsights.roadSaltUsage.usageLevel === 'Light' ? 'bg-green-50' :
                environmentalInsights.roadSaltUsage.usageLevel === 'Moderate' ? 'bg-transparent' : 'bg-transparent'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-neutral-900">Road Salt Exposure</div>
                  <i className="ph ph-truck text-lg text-neutral-600"></i>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                  environmentalInsights.roadSaltUsage.usageLevel === 'Light' ? 'bg-green-100 text-green-700' :
                  environmentalInsights.roadSaltUsage.usageLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {environmentalInsights.roadSaltUsage.usageLevel}
                </div>
                <div className="text-xs text-neutral-500 mt-3">
                  {environmentalInsights.roadSaltUsage.details}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Risk and Positive Factors */}
      {(insights.riskFactors?.length > 0 || insights.positiveFactors?.length > 0) && (
        <div className="mt-8 pt-6">
          {insights.riskFactors?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-red-600 mb-3 flex items-center">
                <i className="ph ph-warning text-lg mr-2"></i>
                Risk Factors
              </h3>
              <ul className="list-none space-y-3">
                {insights.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-neutral-700">
                    <i className="ph ph-warning text-red-600 mt-1 flex-shrink-0"></i>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.positiveFactors?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-green-600 mb-3 flex items-center">
                <i className="ph ph-check-circle text-lg mr-2"></i>
                Positive Factors
              </h3>
              <ul className="list-none space-y-3">
                {insights.positiveFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-neutral-700">
                    <i className="ph ph-check-circle text-green-600 mt-1 flex-shrink-0"></i>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Data Source Note */}
      {insights.registrationRegion && (
        <div className="bg-neutral-50 rounded-lg p-4 mt-6">
          <p className="text-sm text-neutral-700 flex items-start">
            <i className="ph ph-info text-blue-600 mr-2 mt-0.5 flex-shrink-0"></i>
            Regional and environmental assessments are based on statistical data for the vehicle's registration area.
            Individual vehicle experiences may vary based on specific usage patterns and maintenance history.
          </p>
        </div>
      )}
    </div>
  );
};

// STATUS PANEL COMPONENT
export const StatusPanelComponent = ({ insights }) => {
  if (!insights) return null;
  
  // Calculate days until MOT as percentage (365 days = 100%)
  const motPercentage = insights.daysUntilMotExpiry > 0 
    ? Math.min((insights.daysUntilMotExpiry / 365) * 100, 100)
    : 0;
  
  return (
    <div className="bg-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <i className="ph ph-gauge text-lg text-blue-600 mr-3"></i>
          <h2 className="text-lg font-medium text-neutral-900">Current Status</h2>
        </div>
        <p className="text-xs text-neutral-600">
          Tax and MOT status information
        </p>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Driveability Status Card */}
        <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
          insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal' 
            ? 'bg-green-50' : 'bg-transparent'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-neutral-900">Driveability Status</div>
            <i className={`ph ph-car text-lg ${
              insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal' 
                ? 'text-green-600' : 'text-red-600'
            }`}></i>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
            insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal'
              ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <i className={`ph ${
              insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal'
                ? 'ph-check-circle' : 'ph-x-circle'
            }`}></i>
            {insights.driveabilityStatus}
          </div>
          <div className="text-xs text-neutral-500 mt-3">
            {insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal'
              ? 'Vehicle meets all legal requirements'
              : 'Vehicle requires attention'}
          </div>
        </div>
        
        {/* Tax Status Card */}
        <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
          insights.isTaxExempt || insights.taxStatus === 'TAXED' ? 'bg-green-50' : 'bg-transparent'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-neutral-900">Tax Status</div>
            <i className={`ph ph-bank text-lg ${
              insights.isTaxExempt || insights.taxStatus === 'TAXED' ? 'text-green-600' : 'text-red-600'
            }`}></i>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
            insights.isTaxExempt ? 'bg-blue-100 text-blue-700' :
            insights.taxStatus === 'TAXED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {insights.isTaxExempt ? 'Tax Exempt' : insights.taxStatus}
          </div>
          {insights.isTaxExempt && (
            <div className="text-xs text-neutral-500 mt-3">
              Exempt from Vehicle Tax
            </div>
          )}
        </div>
        
        {/* MOT Status Card */}
        {!insights.isPossiblyMotExempt && insights.motExpiryDate && (
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-neutral-900">MOT Expiry</div>
              <i className={`ph ph-calendar text-lg ${
                insights.daysUntilMotExpiry < 0 ? 'text-red-600' :
                insights.daysUntilMotExpiry < 30 ? 'text-yellow-600' : 'text-green-600'
              }`}></i>
            </div>
            <div className={`text-2xl font-bold ${
              insights.daysUntilMotExpiry < 0 ? 'text-red-600' :
              insights.daysUntilMotExpiry < 30 ? 'text-yellow-600' : 'text-green-600'
            } mb-2`}>
              {insights.daysUntilMotExpiry > 0 ? insights.daysUntilMotExpiry : 0}
              <span className="text-lg font-normal text-neutral-600 ml-2">days</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full ${
                  insights.daysUntilMotExpiry < 0 ? 'bg-transparent' :
                  insights.daysUntilMotExpiry < 30 ? 'bg-transparent' : 'bg-green-500'
                }`}
                style={{ width: `${motPercentage}%` }}
              />
            </div>
            <div className="text-xs text-neutral-500">
              {insights.motExpiryDate.toLocaleDateString('en-GB', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}
              {insights.daysUntilMotExpiry < 0 && ' (Expired)'}
            </div>
          </div>
        )}
        
        {/* MOT Exempt Card */}
        {insights.isPossiblyMotExempt && (
          <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-neutral-900">MOT Status</div>
              <i className="ph ph-info text-lg text-blue-600"></i>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
              MOT Exempt
            </div>
            <div className="text-xs text-neutral-500 mt-3">
              Potentially exempt from MOT requirements
            </div>
          </div>
        )}
        
        {/* Risk Level Card */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-center">
          <Gauge
            value={
              insights.statusRiskLevel === 'Low' ? 90 :
              insights.statusRiskLevel === 'Medium' ? 50 : 20
            }
            max={100}
            unit="%"
            label="Status Risk Score"
            color={
              insights.statusRiskLevel === 'Low' ? 'var(--positive)' :
              insights.statusRiskLevel === 'Medium' ? 'var(--warning)' : 'var(--negative)'
            }
          />
          <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full mt-2 ${
            insights.statusRiskLevel === 'Low' ? 'bg-green-100 text-green-700' :
            insights.statusRiskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {insights.statusRiskLevel} Risk
          </div>
        </div>
      </div>
      
      {/* Risk and Considerations */}
      {(insights.riskFactors?.length > 0 || insights.considerations?.length > 0) && (
        <div className="mt-8 pt-6">
          {insights.riskFactors?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-red-600 mb-3 flex items-center">
                <i className="ph ph-warning text-lg mr-2"></i>
                Risk Factors
              </h3>
              <ul className="list-none space-y-3">
                {insights.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-neutral-700">
                    <i className="ph ph-warning text-red-600 mt-1 flex-shrink-0"></i>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.considerations?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-blue-600 mb-3 flex items-center">
                <i className="ph ph-info mr-2"></i>
                Considerations
              </h3>
              <ul className="list-none space-y-3">
                {insights.considerations.map((consideration, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-neutral-700">
                    <i className="ph ph-info text-blue-600 mt-1 flex-shrink-0"></i>
                    <span>{consideration}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// EMISSIONS PANEL COMPONENT
export const EmissionsPanelComponent = ({ insights }) => {
  if (!insights) return null;
  
  const { withTooltip } = useTooltip();
  
  // Calculate emissions score (lower is better)
  const emissionsScore = insights.co2Emissions 
    ? Math.max(0, 100 - (insights.co2Emissions / 5))
    : 50;
    
  // Determine if we should show compliance verification
  const showComplianceVerification = (!insights.isULEZCompliant || !insights.isScottishLEZCompliant) && 
                                   !insights.isHistoricVehicle && 
                                   insights.showComplianceVerification;
  
  return (
    <div className="bg-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <i className="ph ph-leaf text-lg text-green-600 mr-3"></i>
          <h2 className="text-lg font-medium text-neutral-900">Emissions & Tax</h2>
        </div>
        <p className="text-xs text-neutral-600">
          Environmental impact and tax calculations
        </p>
      </div>
      
      {/* Historic Vehicle Notice */}
      {insights.isHistoricVehicle && (
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700">
            <strong>Historic Vehicle Status:</strong> This vehicle qualifies as a historic vehicle (40+ years old).
            {insights.isMotExempt && " It is exempt from MOT testing requirements."}
            {insights.annualTaxCost?.includes("Exempt") && " It is also exempt from vehicle tax when registered in the 'Historic Vehicle' tax class with the DVLA."}
          </p>
        </div>
      )}
      
      {/* Emissions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* CO2 Emissions Gauge */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-center">
          <Gauge
            value={insights.co2Emissions || 0}
            max={500}
            unit="g/km"
            label="CO2 Emissions"
            color={
              insights.co2Emissions < 100 ? 'var(--positive)' :
              insights.co2Emissions < 150 ? 'var(--warning)' : 'var(--negative)'
            }
          />
          {insights.isEstimated && (
            <div className="text-xs text-neutral-500 mt-2">Estimated value</div>
          )}
        </div>
        
        {/* Euro Standard Card */}
        {insights.euroStatus && (
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-neutral-900">Emissions Standard</div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {insights.euroStatus}
            </div>
            {insights.euroSubcategory && (
              <div className="text-xs text-neutral-500 mb-2">{insights.euroSubcategory}</div>
            )}
            {insights.rde2Compliant && (
              <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700 mt-2">
                RDE2 Compliant
              </div>
            )}
          </div>
        )}
        
        {/* Annual Tax Card */}
        {!insights.annualTaxCost?.includes("Exempt") && (
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-neutral-900">Annual Road Tax</div>
              <i className="ph ph-bank text-lg text-blue-600"></i>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {insights.annualTaxCost}
            </div>
            {insights.taxBand && insights.taxBand !== "N/A (Standard Rate)" && (
              <div className="text-xs text-neutral-500 mb-2">Tax Band {insights.taxBand}</div>
            )}
            {insights.annualTaxCostDirectDebit && 
             !insights.annualTaxCostDirectDebit.includes("£0") && (
              <div className="text-xs text-neutral-500 mt-2">
                Direct Debit: {insights.annualTaxCostDirectDebit}
              </div>
            )}
          </div>
        )}
        
        {/* Tax Exempt Card */}
        {insights.annualTaxCost?.includes("Exempt") && (
          <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-neutral-900">Tax Status</div>
              <i className="ph ph-bank text-lg text-blue-600"></i>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
              <i className="ph ph-check-circle"></i>
              Tax Exempt
            </div>
            <div className="text-xs text-neutral-500 mt-3">
              {insights.annualTaxCost}
            </div>
          </div>
        )}
        
        {/* ULEZ Compliance Card */}
        <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
          insights.isULEZCompliant ? 'bg-green-50' : 'bg-transparent'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-neutral-900">ULEZ Status</div>
            <i className={`ph ${
              insights.isULEZCompliant ? 'ph-check-circle text-green-600' : 'ph-x-circle text-red-600'
            } text-lg`}></i>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
            insights.isULEZCompliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <i className={`ph ${
              insights.isULEZCompliant ? 'ph-check-circle' : 'ph-x-circle'
            }`}></i>
            {insights.isULEZCompliant ? 
              (insights.isHistoricVehicle ? 'Compliant (Historic)' : 'Compliant') : 
              'Non-Compliant'
            }
          </div>
          <div className="text-xs text-neutral-500 mt-3">
            Ultra Low Emission Zone
          </div>
        </div>
        
        {/* Scottish LEZ Card */}
        <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${
          insights.isScottishLEZCompliant ? 'bg-green-50' : 'bg-transparent'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-neutral-900">Scottish LEZ</div>
            <i className={`ph ${
              insights.isScottishLEZCompliant ? 'ph-check-circle text-green-600' : 'ph-x-circle text-red-600'
            } text-lg`}></i>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
            insights.isScottishLEZCompliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <i className={`ph ${
              insights.isScottishLEZCompliant ? 'ph-check-circle' : 'ph-x-circle'
            }`}></i>
            {insights.isScottishLEZCompliant ? 
              (insights.isHistoricVehicle ? 'Compliant (Historic)' : 'Compliant') : 
              'Non-Compliant'
            }
          </div>
          <div className="text-xs text-neutral-500 mt-3">
            Low Emission Zone
          </div>
        </div>
      </div>
      
      {/* Clean Air Zone Impact */}
      <div className={`rounded-lg p-4 mb-6 ${
        insights.cleanAirZoneImpact.includes("not compliant") ? 'bg-transparent' : 'bg-green-50'
      }`}>
        <p className={`text-sm ${
          insights.cleanAirZoneImpact.includes("not compliant") ? 'text-yellow-700' : 'text-green-700'
        }`}>
          <strong>Clean Air Zone Impact:</strong> {insights.cleanAirZoneImpact}
          {insights.isHistoricVehicle && insights.cleanAirZoneImpact.includes("exempt") && 
            " However, always check with the relevant authorities before travel as exemption policies may change."}
        </p>
      </div>
      
      {/* Additional sections would continue here with similar Tailwind conversions */}
      
      {/* Estimation Note */}
      {insights.isEstimated && (
        <div className="bg-neutral-50 rounded-lg p-4 mt-6">
          <p className="text-sm text-neutral-700 flex items-start">
            <i className="ph ph-info text-blue-600 mr-2 mt-0.5 flex-shrink-0"></i>
            Emissions data and Euro status are estimated based on vehicle age, fuel type, and specifications.
            {insights.co2Emissions && ` CO2 estimate may have a margin of error of approximately ±15%.`}
          </p>
        </div>
      )}
    </div>
  );
};

// FUEL EFFICIENCY PANEL COMPONENT
export const FuelEfficiencyPanelComponent = ({ insights, vehicleData }) => {
  if (!insights) return null;
  
  const { withTooltip } = useTooltip();
  
  return (
    <div className="bg-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <i className="ph ph-drop text-lg text-green-600 mr-3"></i>
          <h2 className="text-lg font-medium text-neutral-900">Fuel Efficiency</h2>
        </div>
        <p className="text-xs text-neutral-600">
          Estimated fuel consumption and running costs
        </p>
      </div>
      
      {insights.isElectric ? (
        <>
          {/* Electric Vehicle Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Electric Efficiency Gauge */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-center">
              <Gauge
                value={parseFloat(insights.estimatedMilesPerKWh)}
                max={5}
                unit="mi/kWh"
                label="Electric Efficiency"
                color={'var(--positive)'}
              />
            </div>
            
            {/* Cost Per Mile */}
            <div className="bg-green-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-neutral-900">Cost Per Mile</div>
                <span className="text-lg font-bold text-green-600">£</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {insights.estimatedCostPerMile}
                <span className="text-lg font-normal text-neutral-600 ml-2">per mile</span>
              </div>
              <div className="text-xs text-neutral-500">Based on average UK electricity prices</div>
            </div>
            
            {/* Estimated Range */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-neutral-900">Estimated Range</div>
                <i className="ph ph-gauge text-lg text-blue-600"></i>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {insights.estimatedRange}
              </div>
              <div className="text-xs text-neutral-500">{insights.batteryCapacityEstimate}</div>
            </div>
            
            {/* Annual Savings */}
            <div className="bg-green-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-neutral-900">Annual Savings vs Petrol</div>
                <span className="text-lg font-bold text-green-600">£</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {insights.annualSavingsVsPetrol}
              </div>
              <div className="text-xs text-neutral-500">Based on 7,200 miles/year</div>
            </div>
            
            {/* CO2 Savings */}
            <div className="bg-green-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-neutral-900">Annual CO2 Savings</div>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {insights.annualCO2Savings}
              </div>
              <div className="text-xs text-neutral-500">Compared to equivalent petrol vehicle</div>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-700 flex items-start">
              <i className="ph ph-info text-blue-600 mr-2 mt-0.5 flex-shrink-0"></i>
              {insights.evMarketGrowthInfo}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Conventional Vehicle Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Combined MPG Gauge */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-center">
              <Gauge
                value={parseFloat(insights.estimatedMPGCombined)}
                max={80}
                unit="MPG"
                label="Combined Fuel Economy"
                color={
                  parseFloat(insights.estimatedMPGCombined) > 50 ? 'var(--positive)' :
                  parseFloat(insights.estimatedMPGCombined) > 30 ? 'var(--warning)' : 'var(--negative)'
                }
              />
            </div>
            
            {/* Urban MPG */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-neutral-900">Urban MPG</div>
                <i className="ph ph-car text-lg text-blue-600"></i>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {insights.estimatedMPGUrban}
                <span className="text-lg font-normal text-neutral-600 ml-2">MPG</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(parseFloat(insights.estimatedMPGUrban) / 80) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Extra-Urban MPG */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-neutral-900">Extra-Urban MPG</div>
                <i className="ph ph-gauge text-lg text-green-600"></i>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {insights.estimatedMPGExtraUrban}
                <span className="text-lg font-normal text-neutral-600 ml-2">MPG</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(parseFloat(insights.estimatedMPGExtraUrban) / 80) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Cost Per Mile */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-neutral-900">Cost Per Mile</div>
                <span className="text-lg font-bold text-yellow-600">£</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                £{insights.costPerMile}
                <span className="text-lg font-normal text-neutral-600 ml-2">per mile</span>
              </div>
              <div className="text-xs text-neutral-500">Based on current fuel prices</div>
            </div>
            
            {/* Annual Fuel Cost */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-neutral-900">Annual Fuel Cost</div>
                <i className="ph ph-drop text-lg text-yellow-600"></i>
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                £{insights.annualFuelCost}
              </div>
              <div className="text-xs text-neutral-500">Based on 7,200 miles/year</div>
            </div>
            
            {/* CO2 Emissions */}
            {insights.co2EmissionsGPerKM && (
              <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-neutral-900">CO2 Emissions</div>
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  parseFloat(insights.co2EmissionsGPerKM) < 120 ? 'text-green-600' :
                  parseFloat(insights.co2EmissionsGPerKM) < 150 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {insights.co2EmissionsGPerKM}
                  <span className="text-lg font-normal text-neutral-600 ml-2">g/km</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Efficiency Context */}
          {insights.fuelTypeEfficiencyNote && (
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-neutral-700 flex items-start">
                <i className="ph ph-info text-blue-600 mr-2 mt-0.5 flex-shrink-0"></i>
                {insights.fuelTypeEfficiencyNote}
              </p>
            </div>
          )}
          
          {/* Market Trends */}
          {insights.marketTrends && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-3">
                Market Trends
              </h3>
              <p className="text-sm text-neutral-700">{insights.marketTrends}</p>
            </div>
          )}
        </>
      )}
      
      {/* Fuel Cost Calculator */}
      <div className="mt-8 pt-6">
        <FuelCostCalculator 
          defaultValues={insights}
          fuelType={insights.isElectric ? "ELECTRIC" : vehicleData?.fuelType}
          isElectric={insights.isElectric}
        />
      </div>
      
      <GovUKTooltip title={tooltips.fuelEfficiencyNote} arrow placement="top">
        <div className="bg-neutral-50 rounded-lg p-4 mt-6 border-b border-dotted border-neutral-400 cursor-help inline-block">
          <p className="text-sm text-neutral-700 flex items-start">
            <i className="ph ph-info text-blue-600 mr-2 mt-0.5 flex-shrink-0"></i>
            Fuel efficiency estimates are based on UK government data for vehicles of this type, age, and engine size. 
            Actual performance may vary based on driving style, maintenance, and conditions.
          </p>
        </div>
      </GovUKTooltip>
    </div>
  );
};