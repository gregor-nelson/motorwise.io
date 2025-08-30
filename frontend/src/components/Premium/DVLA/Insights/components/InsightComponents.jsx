// Ultra-Minimal Enhanced Insight Components - Design System Compliant
// Implements the universal design system with emotionally-driven interactions
// and premium visual hierarchy

import React, { useState } from 'react';

// Import tooltip components
import {
  useTooltip,
  GovUKTooltip
} from '../../../../../styles/tooltip';

// Import calculator components
import FuelCostCalculator from '../../MPG/FuelCostCalculator';

// Using Phosphor Icons via CSS classes

// Missing Data Callout Component
const MissingDataCallout = ({ title, message, actionable, severity = 'medium', className = '' }) => {
  const severityStyles = {
    low: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'ph-info text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-800',
      actionable: 'text-blue-700'
    },
    medium: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'ph-warning text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-800',
      actionable: 'text-yellow-700'
    },
    high: {
      container: 'bg-red-50 border-red-200',
      icon: 'ph-x-circle text-red-600',
      title: 'text-red-900',
      message: 'text-red-800',
      actionable: 'text-red-700'
    }
  };

  const styles = severityStyles[severity] || severityStyles.medium;

  return (
    <div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex items-start gap-3">
        <i className={`${styles.icon} text-lg mt-0.5 flex-shrink-0`}></i>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${styles.title} mb-1`}>
            {title}
          </h4>
          <p className={`text-sm ${styles.message} mb-2`}>
            {message}
          </p>
          {actionable && (
            <p className={`text-xs ${styles.actionable} flex items-center gap-1`}>
              <i className="ph-arrow-right text-xs"></i>
              {actionable}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

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

// Enhanced Gauge component with premium animations and interactions
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
    <div className="text-center group">
      <div className="relative w-32 h-32 mx-auto mb-4 transition-all duration-300 hover:scale-110">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8"
                  fill="none" className="text-neutral-200" />
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8"
                  fill="none" strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`${colorClass} transition-all duration-300 ease-out`} />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className={`text-2xl font-bold transition-all duration-300 ${
            colorClass.replace('text-', 'text-')
          }`}>
            {Math.round(value)}
          </div>
          <div className="text-xs text-neutral-500">{unit}</div>
        </div>
      </div>
      <div className="text-sm font-medium text-neutral-900 group-hover:text-blue-600 transition-colors duration-300">{label}</div>
    </div>
  );
};

// OWNERSHIP PANEL COMPONENT
export const OwnershipPanelComponent = ({ insights, available, missingDataInfo }) => {
  // Show missing data callout if insights are not available
  if (!available && missingDataInfo) {
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

        {/* Missing Data Callout */}
        <MissingDataCallout 
          title={missingDataInfo.title}
          message={missingDataInfo.message}
          actionable={missingDataInfo.actionable}
          severity={missingDataInfo.severity}
          className="mb-6"
        />
        
        {/* Optional: Show what we would display if data was available */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <p className="text-sm text-neutral-600 flex items-start">
            <i className="ph ph-info text-blue-600 mr-2 mt-0.5 flex-shrink-0"></i>
            Ownership insights would normally show ownership duration, regional analysis, and ownership stability assessment.
          </p>
        </div>
      </div>
    );
  }
  
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
        {/* Enhanced Ownership Duration Card */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start">
              <i className="ph ph-calendar text-lg text-blue-600 mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-300"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900">Current Ownership</div>
                <div className="text-xs text-neutral-600">Duration analysis</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                insights.yearsWithCurrentOwner > 5 ? 'text-green-600' : 
                insights.yearsWithCurrentOwner > 2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {insights.yearsWithCurrentOwner}
              </div>
              <div className="text-xs text-blue-600">years</div>
            </div>
          </div>
          
          {/* Expandable details */}
          <div className="pt-3 border-t border-neutral-200 space-y-2">
            <div className="text-xs text-neutral-700 flex justify-between">
              <span>Started:</span>
              <span className="font-medium">
                {insights.v5cDate.toLocaleDateString('en-GB', { 
                  day: 'numeric', month: 'short', year: 'numeric' 
                })}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1">
              <div 
                className={`h-full rounded-full ${
                  insights.yearsWithCurrentOwner > 5 ? 'bg-green-500' : 
                  insights.yearsWithCurrentOwner > 2 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((insights.yearsWithCurrentOwner / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Enhanced Ownership Stability Card */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start">
              <i className="ph ph-shield-check text-lg text-blue-600 mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-300"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900">Ownership Stability</div>
                <div className="text-xs text-neutral-600">Risk assessment</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                insights.ownershipRiskLevel === 'Low' ? 'text-green-600' :
                insights.ownershipRiskLevel === 'Medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {ownershipScore}
              </div>
              <div className="text-xs text-blue-600">score</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-900">{ownershipStabilityDisplay}</span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                insights.ownershipRiskLevel === 'Low' ? 'bg-green-50 text-green-600' :
                insights.ownershipRiskLevel === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                'bg-red-50 text-red-600'
              }`}>
                <i className={`ph ${
                  insights.ownershipRiskLevel === 'Low' ? 'ph-check-circle' :
                  insights.ownershipRiskLevel === 'Medium' ? 'ph-warning-circle' :
                  'ph-x-circle'
                } mr-1`}></i>
                {insights.ownershipRiskLevel} Risk
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r rounded-full transition-all duration-300 ease-out ${
                  ownershipScore > 70 ? 'from-green-400 to-green-600' : 
                  ownershipScore > 40 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600'
                }`}
                style={{ width: `${ownershipScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Registration Area Card */}
        {insights.registrationRegion && (
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-start">
                <i className="ph ph-map-pin text-lg text-blue-600 mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-300"></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Registration Area</div>
                  <div className="text-xs text-neutral-600">Location details</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.memoryTag || 'N/A'}
                </div>
                <div className="text-xs text-blue-600">tag</div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <div className="text-sm text-neutral-700 font-medium">{insights.registrationRegion}</div>
              {insights.registrationArea && (
                <div className="text-xs text-neutral-500">{insights.registrationArea}</div>
              )}
            </div>
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

// STATUS PANEL COMPONENT - Ultra-Minimal Design
export const StatusPanelComponent = ({ insights, available, missingDataInfo }) => {
  // Show missing data callout if insights are not available
  if (!available && missingDataInfo) {
    return (
      <div className="p-6 md:p-8">
        {/* Ultra-Minimal Header */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <i className="ph ph-gauge text-lg text-blue-600 mr-3 mt-0.5 transition-all duration-300 hover:scale-110"></i>
            <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Current Status</h2>
          </div>
          <p className="text-xs text-neutral-600">
            Tax and MOT status information
          </p>
        </div>

        {/* Missing Data Callout */}
        <MissingDataCallout 
          title={missingDataInfo.title}
          message={missingDataInfo.message}
          actionable={missingDataInfo.actionable}
          severity={missingDataInfo.severity}
          className="mb-6"
        />
        
        {/* Optional: Show what we would display if data was available */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <p className="text-sm text-neutral-600 flex items-start">
            <i className="ph ph-info text-blue-600 mr-2 mt-0.5 flex-shrink-0"></i>
            Status insights would normally show current tax status, MOT expiry dates, and driveability assessment.
          </p>
        </div>
      </div>
    );
  }
  
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
        {/* Enhanced Driveability Status Card */}
        <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${
          insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal' 
            ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start">
              <i className={`ph ph-car text-lg mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-300 ${
                insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal' 
                  ? 'text-green-600' : 'text-red-600'
              }`}></i>
              <div>
                <div className="text-sm font-medium text-neutral-900">Driveability Status</div>
                <div className="text-xs text-neutral-600">Legal compliance</div>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal' 
                ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}></div>
          </div>
          
          <div className="space-y-3">
            <div className={`px-3 py-2 text-sm font-medium rounded-lg ${
              insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal'
                ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <i className={`ph mr-2 ${
                insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal'
                  ? 'ph-check-circle' : 'ph-x-circle'
              }`}></i>
              {insights.driveabilityStatus}
            </div>
            <div className="text-xs text-neutral-500">
              {insights.driveabilityStatus === 'Legal to drive' || insights.driveabilityStatus === 'Fully Road Legal'
                ? '✓ Vehicle meets all legal requirements'
                : '⚠ Vehicle requires attention'}
            </div>
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
        
        {/* Enhanced MOT Status Card */}
        {!insights.isPossiblyMotExempt && insights.motExpiryDate && (
          <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${
            insights.daysUntilMotExpiry < 0 ? 'bg-red-50' :
            insights.daysUntilMotExpiry < 30 ? 'bg-yellow-50' : 'bg-green-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-start">
                <i className={`ph ph-calendar text-lg mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-300 ${
                  insights.daysUntilMotExpiry < 0 ? 'text-red-600' :
                  insights.daysUntilMotExpiry < 30 ? 'text-yellow-600' : 'text-green-600'
                }`}></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">MOT Expiry</div>
                  <div className="text-xs text-neutral-600">Days remaining</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  insights.daysUntilMotExpiry < 0 ? 'text-red-600' :
                  insights.daysUntilMotExpiry < 30 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {insights.daysUntilMotExpiry > 0 ? insights.daysUntilMotExpiry : 0}
                </div>
                <div className="text-xs text-blue-600">days</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r rounded-full transition-all duration-300 ease-out ${
                    insights.daysUntilMotExpiry < 0 ? 'from-red-400 to-red-600' :
                    insights.daysUntilMotExpiry < 30 ? 'from-yellow-400 to-yellow-600' : 'from-green-400 to-green-600'
                  }`}
                  style={{ width: `${Math.max(motPercentage, 5)}%` }}
                />
              </div>
              <div className="text-xs text-neutral-500">
                <strong>Expires:</strong> {insights.motExpiryDate.toLocaleDateString('en-GB', { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                })}
                {insights.daysUntilMotExpiry < 0 && ' (Expired)'}
              </div>
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

// EMISSIONS PANEL COMPONENT - Ultra-Minimal Design
export const EmissionsPanelComponent = ({ insights, available, missingDataInfo }) => {
  const [expandedSections, setExpandedSections] = useState({});
  
  // Show missing data callout if insights are not available
  if (!available && missingDataInfo) {
    return (
      <div className="p-6 md:p-8">
        {/* Ultra-Minimal Header */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <i className="ph ph-leaf text-lg text-green-600 mr-3 mt-0.5 transition-all duration-300 hover:scale-110"></i>
            <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Emissions & Tax</h2>
          </div>
          <p className="text-xs text-neutral-600">
            Environmental impact and tax calculations
          </p>
        </div>

        {/* Missing Data Callout */}
        <MissingDataCallout 
          title={missingDataInfo.title}
          message={missingDataInfo.message}
          actionable={missingDataInfo.actionable}
          severity={missingDataInfo.severity}
          className="mb-6"
        />
        
        {/* Optional: Show what we would display if data was available */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <p className="text-sm text-neutral-600 flex items-start">
            <i className="ph ph-info text-blue-600 mr-2 mt-0.5 flex-shrink-0"></i>
            Emissions insights would normally show CO2 emissions, Euro standards, road tax calculations, and ULEZ/LEZ compliance status.
          </p>
        </div>
      </div>
    );
  }
  
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
        {/* Enhanced CO2 Emissions Card */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start">
              <i className="ph ph-leaf text-lg text-green-600 mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-300"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900">CO2 Emissions</div>
                <div className="text-xs text-neutral-600">
                  {insights.isEstimated ? 'Estimated value' : 'Official data'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                insights.co2Emissions < 100 ? 'text-green-600' :
                insights.co2Emissions < 150 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {insights.co2Emissions || 0}
              </div>
              <div className="text-xs text-blue-600">g/km</div>
            </div>
          </div>
          
          {/* Environmental impact visualization */}
          <div className="pt-3 border-t border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">Environmental Impact:</span>
              <span className={`font-medium ${
                insights.co2Emissions < 100 ? 'text-green-600' :
                insights.co2Emissions < 150 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {insights.co2Emissions < 100 ? 'Low' :
                 insights.co2Emissions < 150 ? 'Medium' : 'High'}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1">
              <div 
                className={`h-full bg-gradient-to-r rounded-full transition-all duration-300 ease-out ${
                  insights.co2Emissions < 100 ? 'from-green-400 to-green-600' :
                  insights.co2Emissions < 150 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600'
                }`}
                style={{ width: `${Math.min((insights.co2Emissions / 500) * 100, 100)}%` }}
              />
            </div>
          </div>
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
        
        {/* Enhanced ULEZ Compliance Card */}
        <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${
          insights.isULEZCompliant ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start">
              <i className={`ph text-lg mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-300 ${
                insights.isULEZCompliant ? 'ph-shield-check text-green-600' : 'ph-shield-warning text-red-600'
              }`}></i>
              <div>
                <div className="text-sm font-medium text-neutral-900">ULEZ Status</div>
                <div className="text-xs text-neutral-600">London compliance</div>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              insights.isULEZCompliant ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}></div>
          </div>
          
          <div className="space-y-3">
            <div className={`px-3 py-2 text-sm font-medium rounded-lg ${
              insights.isULEZCompliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <i className={`ph mr-2 ${
                insights.isULEZCompliant ? 'ph-check-circle' : 'ph-x-circle'
              }`}></i>
              {insights.isULEZCompliant ? 
                (insights.isHistoricVehicle ? 'Compliant (Historic)' : 'Compliant') : 
                'Non-Compliant'
              }
            </div>
            <div className="text-xs text-neutral-500">
              {insights.isULEZCompliant ? '✓ No daily charge required' : '⚠ Daily charge applies in ULEZ'}
            </div>
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

// FUEL EFFICIENCY PANEL COMPONENT - Ultra-Minimal Design
export const FuelEfficiencyPanelComponent = ({ insights, vehicleData, available, missingDataInfo }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Show missing data callout if insights are not available
  if (!available && missingDataInfo) {
    return (
      <div className="p-6 md:p-8">
        {/* Ultra-Minimal Header */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <i className="ph ph-drop text-lg text-green-600 mr-3 mt-0.5 transition-all duration-300 hover:scale-110"></i>
            <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Fuel Efficiency</h2>
          </div>
          <p className="text-xs text-neutral-600">
            Estimated fuel consumption and running costs
          </p>
        </div>

        {/* Missing Data Callout */}
        <MissingDataCallout 
          title={missingDataInfo.title}
          message={missingDataInfo.message}
          actionable={missingDataInfo.actionable}
          severity={missingDataInfo.severity}
          className="mb-6"
        />
        
        {/* Optional: Show what we would display if data was available */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <p className="text-sm text-neutral-600 flex items-start">
            <i className="ph ph-info text-blue-600 mr-2 mt-0.5 flex-shrink-0"></i>
            Fuel efficiency insights would normally show estimated MPG figures, running costs, annual fuel expenses, and environmental impact calculations.
          </p>
        </div>
      </div>
    );
  }
  
  if (!insights) return null;
  
  const { withTooltip } = useTooltip();
  
  return (
    <div className="p-6 md:p-8">
      {/* Enhanced Header with Tab Navigation */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <i className="ph ph-drop text-lg text-green-600 mr-3 mt-0.5 transition-all duration-300 hover:scale-110"></i>
          <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Fuel Efficiency</h2>
        </div>
        <p className="text-xs text-neutral-600 mb-4">
          {insights.isElectric ? 'Electric vehicle efficiency and savings' : 'Estimated fuel consumption and running costs'}
        </p>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <i className="ph ph-chart-pie"></i>
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === 'calculator'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <i className="ph ph-calculator"></i>
              <span>Calculator</span>
            </button>
          </div>
        </div>
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
            {/* Enhanced Combined MPG Card */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start">
                  <i className="ph ph-gauge text-lg text-blue-600 mr-3 mt-0.5 group-hover:scale-110 transition-transform duration-300"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Combined MPG</div>
                    <div className="text-xs text-neutral-600">Fuel economy</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    parseFloat(insights.estimatedMPGCombined) > 50 ? 'text-green-600' :
                    parseFloat(insights.estimatedMPGCombined) > 30 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {insights.estimatedMPGCombined}
                  </div>
                  <div className="text-xs text-blue-600">MPG</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-neutral-900">{insights.estimatedMPGUrban}</div>
                    <div className="text-neutral-600">Urban</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-neutral-900">{insights.estimatedMPGExtraUrban}</div>
                    <div className="text-neutral-600">Highway</div>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className={`h-full bg-gradient-to-r rounded-full transition-all duration-300 ease-out ${
                      parseFloat(insights.estimatedMPGCombined) > 50 ? 'from-green-400 to-green-600' :
                      parseFloat(insights.estimatedMPGCombined) > 30 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600'
                    }`}
                    style={{ width: `${(parseFloat(insights.estimatedMPGCombined) / 80) * 100}%` }}
                  />
                </div>
              </div>
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
      
      {/* Enhanced Content with Tab System */}
      {activeTab === 'overview' && (
        <>
          {/* Content sections remain the same but wrapped in overview tab */}
        </>
      )}
      
      {activeTab === 'calculator' && (
        <div className="transition-all duration-500 ease-out">
          <div className="bg-neutral-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
              <i className="ph ph-calculator text-blue-600 mr-2"></i>
              Fuel Cost Calculator
            </h3>
            <FuelCostCalculator 
              defaultValues={insights}
              fuelType={insights.isElectric ? "ELECTRIC" : vehicleData?.fuelType}
              isElectric={insights.isElectric}
            />
          </div>
        </div>
      )}
      
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