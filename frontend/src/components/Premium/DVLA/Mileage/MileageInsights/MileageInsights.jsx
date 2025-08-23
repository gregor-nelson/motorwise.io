import React, { useState, useEffect, useRef, useCallback } from 'react';

// Simple color constants for semantic use only (matches DVLADataHeader approach)
const SEMANTIC_COLORS = {
  POSITIVE: '#059669',
  NEGATIVE: '#dc2626', 
  WARNING: '#d97706',
  PRIMARY: '#3b82f6'
};

// Phosphor icons used throughout the component

// Simple tooltip component - minimal styling (matches DVLADataHeader approach)
const SimpleTooltip = ({ children, title }) => (
  <span title={title} className="cursor-help">
    {children}
  </span>
);

// Ultra Clean Loading Spinner (matches DVLADataHeader pattern)
const LoadingSpinner = () => (
  <div className="w-6 h-6 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" />
);

// Clean Section Spacing - No Visual Dividers (matches DVLADataHeader pattern)
const SectionBreak = () => (
  <div className="h-16" />
);

// Import mileage tooltips
import { mileageTooltips } from './mileageTooltips';

// Components now use Tailwind CSS classes directly

// Import enhanced risk assessment, anomaly detection functions, and clocking warning
import { calculateRiskScore, checkForMOTGaps } from './enhancedRiskAssessment';
import { findMileageAnomalies, findInactivityPeriods, calculateAccurateMileageStats } from './mileageAnomalyDetector';
import MileageClockingWarning from './MileageClockingWarning';

// Constants for industry standard thresholds
const USAGE_PATTERN_THRESHOLDS = {
  HIGHLY_VARIABLE: 2.5,   // Ratio above which usage is considered highly variable
  SOMEWHAT_VARIABLE: 1.7, // Ratio above which usage is considered somewhat variable
  COMMERCIAL_USE: 20000   // Annual mileage above which commercial use is suspected
};

// Constants for vehicle lifespan
const VEHICLE_LIFESPAN = {
  DEFAULT: 150000,
  DIESEL: 200000,
  PETROL: 160000,
  ELECTRIC: 180000,
  HYBRID: 175000,
  PHEV: 170000
};

// UK average mileage data - updated for 2024
const UK_MILEAGE = {
  AVERAGE: 6800,
  DIESEL: 9000,
  PETROL: 6700,
  ELECTRIC: 7600,
  HYBRID: 8200,
  PHEV: 7500
};

// API configuration
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8000/api/v1'
                    : '/api/v1';

/**
 * DataQualityIndicator - A component that provides an overall data quality assessment
 */
const DataQualityIndicator = ({ 
  hasClockingIssues,
  motGapsDetected,
  anomalies = [],
  dataPoints = 0
}) => {
  // Determine overall data quality
  let qualityLevel = "high";
  let qualityDisplayName = "High Quality";
  
  if (hasClockingIssues) {
    qualityLevel = "poor";
    qualityDisplayName = "Poor Quality";
  } else if (motGapsDetected || (anomalies && anomalies.length > 0)) {
    qualityLevel = "medium";
    qualityDisplayName = "Medium Quality";
  } else if (dataPoints < 4) {
    qualityLevel = "limited";
    qualityDisplayName = "Limited Data";
  }
  
  return (
    <section className="space-y-12 mb-16">
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          Data Quality Assessment
        </h3>
        <p className="text-sm text-neutral-600 mb-8">
          Assessment of the reliability and completeness of the vehicle's history data
        </p>
      </div>
      
      {/* Main Quality Status Card */}
      <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
        qualityLevel === 'high' ? 'bg-green-50' :
        qualityLevel === 'medium' ? 'bg-yellow-50' :
        qualityLevel === 'poor' ? 'bg-red-50' :
        'bg-neutral-50'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-start">
            <i className={`ph ${
              qualityLevel === "high" ? "ph-check-circle" :
              qualityLevel === "medium" ? "ph-warning-circle" :
              qualityLevel === "poor" ? "ph-x-circle" :
              "ph-info"
            } text-lg ${
              qualityLevel === 'high' ? 'text-green-600' :
              qualityLevel === 'medium' ? 'text-yellow-600' :
              qualityLevel === 'poor' ? 'text-red-600' :
              'text-neutral-700'
            } mr-3 mt-0.5`}></i>
            <div>
              <div className="text-sm font-medium text-neutral-900">Data Quality</div>
              <div className="text-xs text-neutral-600">Overall assessment</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`text-2xl font-bold ${
              qualityLevel === 'high' ? 'text-green-600' :
              qualityLevel === 'medium' ? 'text-yellow-600' :
              qualityLevel === 'poor' ? 'text-red-600' :
              'text-neutral-900'
            }`}>{qualityDisplayName}</div>
            <div className={`text-xs ${
              qualityLevel === 'high' ? 'text-green-600' :
              qualityLevel === 'medium' ? 'text-yellow-600' :
              qualityLevel === 'poor' ? 'text-red-600' :
              'text-neutral-600'
            }`}>
              {hasClockingIssues
                ? "Inconsistencies detected"
                : motGapsDetected
                ? "Testing gaps detected"
                : "Complete history"}
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Points and Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-start">
              <i className="ph ph-database text-lg text-blue-600 mr-3 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900">Data Points</div>
                <div className="text-xs text-neutral-600">Available records</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-blue-600">{dataPoints}</div>
              <div className="text-xs text-blue-600">MOT records</div>
            </div>
          </div>
          <div className="text-xs text-neutral-700">
            {dataPoints >= 4 ? 'Sufficient for comprehensive analysis' : 'Limited data may affect analysis accuracy'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-start">
              <i className="ph ph-detective text-lg text-purple-600 mr-3 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900">Analysis Status</div>
                <div className="text-xs text-neutral-600">Processing result</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className={`text-lg font-bold ${
                qualityLevel === 'high' ? 'text-green-600' :
                qualityLevel === 'medium' ? 'text-yellow-600' :
                qualityLevel === 'poor' ? 'text-red-600' :
                'text-neutral-900'
              }`}>
                {dataPoints >= 4 ? 'Complete' : 'Partial'}
              </div>
              <div className="text-xs text-purple-600">Assessment</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Issues Summary Cards */}
      {(hasClockingIssues || motGapsDetected || (anomalies && anomalies.length > 0) || dataPoints < 3) && (
        <div className="space-y-3">
          {hasClockingIssues && (
            <div className="bg-red-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <i className="ph ph-x-circle text-lg text-red-600 mt-0.5 flex-shrink-0"></i>
                <div>
                  <div className="text-sm font-medium text-red-900 mb-1">Critical Issue Detected</div>
                  <div className="text-xs text-red-700">Mileage inconsistencies detected, suggesting potential odometer tampering.</div>
                </div>
              </div>
            </div>
          )}
          
          {motGapsDetected && (
            <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <i className="ph ph-warning-circle text-lg text-yellow-600 mt-0.5 flex-shrink-0"></i>
                <div>
                  <div className="text-sm font-medium text-yellow-900 mb-1">Testing Gaps Found</div>
                  <div className="text-xs text-yellow-700">Significant gaps in MOT testing history (18+ months) detected.</div>
                </div>
              </div>
            </div>
          )}
          
          {anomalies && anomalies.filter(a => a.type === 'negative').length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <i className="ph ph-x-circle text-lg text-red-600 mt-0.5 flex-shrink-0"></i>
                <div>
                  <div className="text-sm font-medium text-red-900 mb-1">Decreasing Mileage</div>
                  <div className="text-xs text-red-700">{anomalies.filter(a => a.type === 'negative').length} instances of decreasing mileage detected.</div>
                </div>
              </div>
            </div>
          )}
          
          {anomalies && anomalies.filter(a => a.type === 'spike').length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <i className="ph ph-warning-circle text-lg text-yellow-600 mt-0.5 flex-shrink-0"></i>
                <div>
                  <div className="text-sm font-medium text-yellow-900 mb-1">Unusual Patterns</div>
                  <div className="text-xs text-yellow-700">{anomalies.filter(a => a.type === 'spike').length} unusual mileage patterns detected.</div>
                </div>
              </div>
            </div>
          )}
          
          {dataPoints < 3 && (
            <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <i className="ph ph-info text-lg text-blue-600 mt-0.5 flex-shrink-0"></i>
                <div>
                  <div className="text-sm font-medium text-blue-900 mb-1">Limited Data</div>
                  <div className="text-xs text-blue-700">Limited data points available ({dataPoints}). Analysis may be less reliable.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Positive Status Card - only show when no issues */}
      {!hasClockingIssues && !motGapsDetected && dataPoints >= 4 && 
       (!anomalies || anomalies.length === 0) && (
        <div className="bg-green-50 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-2">
            <i className="ph ph-check-circle text-lg text-green-600 mt-0.5 flex-shrink-0"></i>
            <div>
              <div className="text-sm font-medium text-green-900 mb-1">Excellent Data Quality</div>
              <div className="text-xs text-green-700">Complete and consistent mileage history with no detected anomalies.</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/**
 * MileageBenchmarksCalculator - Extract calculation logic to separate function
 * @param {Array} mileageData - Array of mileage readings
 * @param {Object} vehicleInfo - Vehicle information
 * @param {Object} mileageStats - Accurate mileage statistics accounting for anomalies
 * @returns {Object} Benchmark calculations
 */
const MileageBenchmarksCalculator = (mileageData, vehicleInfo, mileageStats) => {
  if (!mileageData || mileageData.length < 2) return null;
  
  // Use accurate mileage stats if available (for clocked vehicles)
  const hasAccurateStats = mileageStats && mileageStats.adjustedValues;
  
  // Get vehicle age in years
  const firstDate = mileageData[0].date;
  const lastDate = mileageData[mileageData.length - 1].date;
  const registrationDate = vehicleInfo?.registrationDate ? new Date(vehicleInfo.registrationDate) : firstDate;
  
  // Check if registration date is valid, if not fallback to first record
  const validRegistrationDate = !isNaN(registrationDate.getTime()) ? registrationDate : firstDate;
  
  const currentDate = new Date();
  
  const vehicleAgeYears = (currentDate - validRegistrationDate) / (1000 * 60 * 60 * 24 * 365.25);
  
  // Use adjusted values if vehicle has been clocked
  const totalMileage = hasAccurateStats 
    ? mileageStats.totalMileage 
    : mileageData[mileageData.length - 1].mileage - mileageData[0].mileage;
    
  const averageAnnualMileage = hasAccurateStats
    ? mileageStats.averageAnnualMileage
    : totalMileage / vehicleAgeYears;
  
  // Get vehicle type-specific benchmarks
  let typeSpecificAnnualMileage = UK_MILEAGE.AVERAGE;
  let mileageCategory = "average";
  let vehicleLifespanMiles = VEHICLE_LIFESPAN.DEFAULT;
  
  // Adjust based on fuel type using latest UK statistics
  if (vehicleInfo?.fuelType) {
    const fuelTypeLower = vehicleInfo.fuelType.toLowerCase();
    
    if (fuelTypeLower.includes("diesel")) {
      typeSpecificAnnualMileage = UK_MILEAGE.DIESEL;
      vehicleLifespanMiles = VEHICLE_LIFESPAN.DIESEL;
    } else if (fuelTypeLower.includes("petrol")) {
      typeSpecificAnnualMileage = UK_MILEAGE.PETROL;
      vehicleLifespanMiles = VEHICLE_LIFESPAN.PETROL;
    } else if (fuelTypeLower.includes("electric") || fuelTypeLower.includes("ev")) {
      typeSpecificAnnualMileage = UK_MILEAGE.ELECTRIC;
      vehicleLifespanMiles = VEHICLE_LIFESPAN.ELECTRIC;
    } else if (fuelTypeLower.includes("hybrid")) {
      if (fuelTypeLower.includes("plug") || fuelTypeLower.includes("phev")) {
        typeSpecificAnnualMileage = UK_MILEAGE.PHEV;
        vehicleLifespanMiles = VEHICLE_LIFESPAN.PHEV;
      } else {
        typeSpecificAnnualMileage = UK_MILEAGE.HYBRID;
        vehicleLifespanMiles = VEHICLE_LIFESPAN.HYBRID;
      }
    }
  }
  
  // Additional adjustments based on vehicle body type
  if (vehicleInfo?.bodyType) {
    const bodyTypeLower = vehicleInfo.bodyType.toLowerCase();
    
    if (bodyTypeLower.includes("suv") || bodyTypeLower.includes("4x4")) {
      typeSpecificAnnualMileage *= 1.05; // SUVs/4x4s slightly higher mileage
      vehicleLifespanMiles -= 10000; // Slightly shorter lifespan due to weight
    } else if (bodyTypeLower.includes("estate") || bodyTypeLower.includes("wagon")) {
      typeSpecificAnnualMileage *= 1.12; // Estates/wagons often used for family trips
      vehicleLifespanMiles += 5000; // Often well maintained
    } else if (bodyTypeLower.includes("convertible") || bodyTypeLower.includes("coupe") || bodyTypeLower.includes("sports")) {
      typeSpecificAnnualMileage *= 0.75; // Sports cars typically driven less
      vehicleLifespanMiles -= 15000; // Often driven harder
    } else if (bodyTypeLower.includes("mpv") || bodyTypeLower.includes("minivan") || bodyTypeLower.includes("people carrier")) {
      typeSpecificAnnualMileage *= 1.15; // Family carriers driven more
      vehicleLifespanMiles += 10000; // Built for durability
    } else if (bodyTypeLower.includes("saloon") || bodyTypeLower.includes("sedan")) {
      typeSpecificAnnualMileage *= 1.08; // Slightly higher for saloons (often business use)
      vehicleLifespanMiles += 5000; // Often well maintained
    } else if (bodyTypeLower.includes("pickup") || bodyTypeLower.includes("truck")) {
      typeSpecificAnnualMileage *= 1.2; // Utility vehicles used more
      vehicleLifespanMiles += 20000; // Built for durability
    } else if (bodyTypeLower.includes("van") || bodyTypeLower.includes("commercial")) {
      typeSpecificAnnualMileage *= 1.5; // Commercial vehicles used significantly more
      vehicleLifespanMiles += 40000; // Built for high mileage
    }
  }
  
  // Determine mileage category compared to expected
  const expectedTotalMileage = typeSpecificAnnualMileage * vehicleAgeYears;
  const mileageRatio = totalMileage / expectedTotalMileage;
  
  if (mileageRatio < 0.65) {
    mileageCategory = "significantly below average";
  } else if (mileageRatio < 0.85) {
    mileageCategory = "below average";
  } else if (mileageRatio > 1.35) {
    mileageCategory = "significantly above average";
  } else if (mileageRatio > 1.15) {
    mileageCategory = "above average";
  } else {
    mileageCategory = "average";
  }
  
  // Calculate remaining useful life estimate
  const remainingMiles = Math.max(0, vehicleLifespanMiles - totalMileage);
  const remainingYearsEstimate = averageAnnualMileage > 0 ? remainingMiles / averageAnnualMileage : 0;
  
  return {
    vehicleAgeYears: Math.round(vehicleAgeYears * 10) / 10,
    averageAnnualMileage: Math.round(averageAnnualMileage),
    totalMileage: Math.round(totalMileage),
    ukAverageAnnualMileage: UK_MILEAGE.AVERAGE,
    typeSpecificAnnualMileage: Math.round(typeSpecificAnnualMileage),
    expectedTotalMileage: Math.round(expectedTotalMileage),
    mileageRatio: Math.round(mileageRatio * 100) / 100,
    mileageCategory,
    vehicleLifespanMiles: Math.round(vehicleLifespanMiles),
    remainingMilesEstimate: Math.round(remainingMiles),
    remainingYearsEstimate: Math.round(remainingYearsEstimate * 10) / 10,
    hasAdjustedMileage: hasAccurateStats
  };
};

/**
 * Analyze usage patterns with improved thresholds and reliability
 * @param {Array} mileageData - Array of mileage readings
 * @param {Object} mileageStats - Accurate mileage statistics accounting for anomalies
 * @returns {Object} Usage patterns analysis
 */
const analyzeUsagePatterns = (mileageData, mileageStats) => {
  if (!mileageData || mileageData.length < 3) return null;
  
  // Don't trust simple year-over-year analysis for clocked vehicles
  const hasBeenClocked = mileageStats?.hasBeenClocked || false;
  
  // Create yearly segments
  const yearlyMileage = [];
  let previousEntry = mileageData[0];
  
  for (let i = 1; i < mileageData.length; i++) {
    const current = mileageData[i];
    const daysDiff = (current.date - previousEntry.date) / (1000 * 60 * 60 * 24);
    const mileageDiff = current.mileage - previousEntry.mileage;
    
    // Skip negative mileage periods if the vehicle has been clocked
    if (hasBeenClocked && mileageDiff < 0) {
      previousEntry = current;
      continue;
    }
    
    if (daysDiff > 30) {
      const dailyRate = mileageDiff / daysDiff;
      const annualizedRate = dailyRate * 365;
      
      yearlyMileage.push({
        period: `${previousEntry.formattedDate} to ${current.formattedDate}`,
        days: Math.round(daysDiff),
        mileageAdded: mileageDiff,
        dailyAverage: Math.round(dailyRate),
        annualizedRate: Math.round(annualizedRate)
      });
    }
    
    previousEntry = current;
  }
  
  if (yearlyMileage.length === 0) return null;
  
  // Calculate statistics on valid periods only
  const rates = yearlyMileage.map(y => y.annualizedRate);
  const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const variance = Math.round(maxRate - minRate);
  
  // Find max and min periods
  const maxPeriod = yearlyMileage.find(y => y.annualizedRate === maxRate);
  const minPeriod = yearlyMileage.find(y => y.annualizedRate === minRate);
  
  // Determine usage pattern using updated thresholds
  const variabilityRatio = maxRate / (minRate || 1);
  let usagePattern = "consistent";
  if (variabilityRatio > USAGE_PATTERN_THRESHOLDS.HIGHLY_VARIABLE) {
    usagePattern = "highly variable";
  } else if (variabilityRatio > USAGE_PATTERN_THRESHOLDS.SOMEWHAT_VARIABLE) {
    usagePattern = "somewhat variable";
  }
  
  // Check for commercial use
  const potentialCommercialUse = maxRate > USAGE_PATTERN_THRESHOLDS.COMMERCIAL_USE;
  
  return {
    averageAnnualRate: Math.round(avgRate),
    highestUsagePeriod: {
      period: maxPeriod.period,
      annualizedRate: maxPeriod.annualizedRate
    },
    lowestUsagePeriod: {
      period: minPeriod.period,
      annualizedRate: minPeriod.annualizedRate
    },
    usageVariance: variance,
    usagePattern,
    potentialCommercialUse,
    detailedPeriods: yearlyMileage,
    dataQuality: hasBeenClocked ? "adjusted" : "reliable"
  };
};

/**
 * Helper function to parse dates safely
 * @param {string} dateString - The date string to parse
 * @returns {Date} Parsed date or fallback
 */
const parseDate = (dateString) => {
  if (!dateString) {
    console.warn('Missing date value, using fallback date');
    return new Date('2018-01-01');
  }
  
  try {
    const parsedDate = new Date(dateString);
    // Check if we got a valid date
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date: ${dateString}, using fallback date`);
      return new Date('2018-01-01'); 
    }
    return parsedDate;
  } catch (e) {
    console.warn(`Error parsing date: ${dateString}`, e);
    return new Date('2018-01-01');
  }
};

/**
 * VehicleMileageInsights Component
 * Displays premium analytics for vehicle mileage data
 * Styled to match GOV.UK design patterns and VehicleInsights component
 */
const VehicleMileageInsights = ({ registration, vin, paymentId, onDataLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mileageData, setMileageData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [inactivityPeriods, setInactivityPeriods] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [mileageStats, setMileageStats] = useState(null);
  const [motGapsDetected, setMotGapsDetected] = useState(false);
  const [insights, setInsights] = useState({
    benchmarks: null,
    usagePatterns: null,
    riskAssessment: null
  });
  const [dataUnavailable, setDataUnavailable] = useState(false);

  // Use a ref to track if data has been sent to parent
  const hasNotifiedParent = useRef(false);
  
  // Memoize the callback for parent notification to prevent unnecessary re-renders
  const notifyParent = useCallback((data) => {
    if (onDataLoad && typeof onDataLoad === 'function') {
      onDataLoad(data);
    }
  }, [onDataLoad]);
  
  // Effect to handle data loading and parent notification
  useEffect(() => {
    // Only notify the parent once when we have meaningful data to share
    // and only if we haven't already notified them
    if (mileageData && mileageData.length > 0 && 
        !hasNotifiedParent.current && 
        !loading) {
      
      console.log("Mileage insights notifying parent with data");
      
      // Call the parent callback with the processed data
      notifyParent({
        mileageData,
        anomalies,
        inactivityPeriods,
        vehicleInfo,
        mileageStats,
        insights,
        motGapsDetected,
        dataQuality: insights.riskAssessment?.hasClockingAnomalies ? "poor" : 
                     motGapsDetected ? "medium" : 
                     mileageData.length < 4 ? "limited" : "high"
      });
      
      // Mark as notified to prevent repeated callbacks
      hasNotifiedParent.current = true;
    } else if (dataUnavailable && !hasNotifiedParent.current && !loading) {
      // Notify parent about unavailable data
      notifyParent({
        dataUnavailable: true
      });
      
      hasNotifiedParent.current = true;
    }
  }, [
    mileageData, 
    anomalies, 
    inactivityPeriods, 
    vehicleInfo, 
    mileageStats, 
    insights,
    motGapsDetected,
    loading,
    dataUnavailable,
    notifyParent
  ]);
  
  // Self-contained tooltip functionality - no external hooks needed

  // Fetch necessary data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!registration && !vin) {
          throw new Error("Vehicle registration or VIN required");
        }

        setLoading(true);
        setError(null);
        setDataUnavailable(false);
        
        // Reset notification flag on new data fetch
        hasNotifiedParent.current = false;

        // Construct proper endpoint
        const endpoint = registration 
          ? `${API_BASE_URL}/vehicle/registration/${registration}`
          : `${API_BASE_URL}/vehicle/vin/${vin}`;
        
        console.log(`Fetching vehicle data from: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin'
        });
        
        if (!response.ok) {
          // Improved error handling with content-type check
          let errorData = {};
          const contentType = response.headers.get("content-type");
          
          if (contentType && contentType.indexOf("application/json") !== -1) {
            errorData = await response.json().catch(() => ({}));
          } else {
            const textError = await response.text().catch(() => "");
            errorData = { errorMessage: textError || `HTTP error: ${response.status}` };
          }
          
          throw new Error(errorData.errorMessage || `Failed to fetch vehicle data: ${response.status}`);
        }
        
        const vehicleData = await response.json();
        console.log('Received vehicle data:', vehicleData);
        processVehicleData(vehicleData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching vehicle data for insights:", err);
        setError(err.message || "Failed to load vehicle insights");
        setLoading(false);
      }
    };

    fetchData();
  }, [registration, vin]);

  // Process vehicle data from API
  const processVehicleData = (data) => {
    console.log('Processing vehicle data for insights');
    
    // Extract basic vehicle info
    const vehicleInfo = {
      registrationNumber: data.registration || registration || "Unknown",
      vin: data.vin || vin || "Unknown",
      make: data.make || "Unknown",
      model: data.model || "Unknown",
      fuelType: data.fuelType || "Unknown",
      bodyType: data.bodyType || data.model || "Unknown",
      registrationDate: parseDate(data.firstUsedDate || data.registrationDate || data.manufactureDate)
    };
    
    console.log('Extracted vehicle info:', vehicleInfo);

    // Process MOT tests into mileage data
    let formattedData = [];
    
    if (data.motTests && Array.isArray(data.motTests) && data.motTests.length > 0) {
      formattedData = data.motTests
        .map(test => {
          // Parse date
          let parsedDate = new Date(0);
          let formattedDate = '';
          try {
            if (test.completedDate) {
              const date = new Date(test.completedDate);
              if (isNaN(date.getTime())) {
                return null;
              }
              parsedDate = date;
              formattedDate = date.toLocaleDateString('en-GB', { 
                day: '2-digit', month: 'short', year: 'numeric' 
              });
            } else {
              return null;
            }
          } catch (err) {
            console.warn("Error parsing test date:", err);
            return null;
          }
          
          // Parse mileage
          let numericMileage = 0;
          let formattedMileage = '0';
          try {
            if (test.odometerValue) {
              numericMileage = typeof test.odometerValue === 'number' 
                ? test.odometerValue 
                : parseInt(String(test.odometerValue).replace(/,/g, ''), 10);
              
              if (isNaN(numericMileage)) {
                return null;
              }
              
              formattedMileage = numericMileage.toLocaleString();
            } else {
              return null;
            }
          } catch (err) {
            console.warn("Error parsing mileage:", err);
            return null;
          }
          
          // Process test result
          let testResult = 'UNKNOWN';
          if (test.testResult) {
            testResult = String(test.testResult).trim().toUpperCase();
          }
          
          return {
            date: parsedDate,
            formattedDate,
            mileage: numericMileage,
            formattedMileage,
            testResult,
            rawTest: test // Keep the original data for reference
          };
        })
        .filter(test => test !== null && !isNaN(test.mileage) && test.mileage > 0)
        .sort((a, b) => a.date - b.date);
    }
    
    // Check if we have enough data for analysis
    if (formattedData.length < 2) {
      console.warn('Not enough MOT data points for analysis');
      setDataUnavailable(true);
      return;
    }
    
    // Use enhanced anomaly detection and inactivity period detection
    const detectedAnomalies = findMileageAnomalies(formattedData);
    const detectedInactivityPeriods = findInactivityPeriods(formattedData);
    
    // Calculate accurate mileage statistics accounting for clocking
    const accurateMileageStats = calculateAccurateMileageStats(formattedData, detectedAnomalies);
    
    // Check for MOT gaps
    const hasMotGaps = checkForMOTGaps(formattedData);
    setMotGapsDetected(hasMotGaps);
    
    setMileageData(formattedData);
    setAnomalies(detectedAnomalies);
    setInactivityPeriods(detectedInactivityPeriods);
    setVehicleInfo(vehicleInfo);
    setMileageStats(accurateMileageStats);
    
    // Calculate benchmarks with accurate mileage stats
    const benchmarkData = MileageBenchmarksCalculator(
      formattedData, 
      vehicleInfo,
      accurateMileageStats
    );
    
    // Analyze usage patterns
    const usagePatterns = formattedData.length >= 3
      ? analyzeUsagePatterns(formattedData, accurateMileageStats)
      : null;
    
    // Use enhanced risk assessment with accurate data
    const riskAssessment = calculateRiskScore(
      formattedData, 
      detectedAnomalies, 
      detectedInactivityPeriods, 
      vehicleInfo,
      benchmarkData
    );
    
    setInsights({
      benchmarks: benchmarkData,
      usagePatterns: usagePatterns,
      riskAssessment: riskAssessment
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 text-neutral-900">
        <div className="flex justify-center items-center min-h-[200px] flex-col gap-6">
          <LoadingSpinner />
          <div className="text-sm text-neutral-600 text-center">
            Loading vehicle mileage insights...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 text-neutral-900">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
            Mileage Insights
          </h2>
        </div>
        
        <div className="text-center p-8">
          <div className="text-lg font-semibold text-neutral-900 mb-2 flex items-center justify-center gap-2">
            <i className="ph ph-x-circle text-lg text-red-600"></i>
            Service Unavailable
          </div>
          <div className="text-base text-red-600 leading-relaxed">
            The vehicle mileage data service is currently unavailable. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Show data unavailable state
  if (dataUnavailable || !mileageData || mileageData.length < 2) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 text-neutral-900">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
            Mileage Insights
          </h2>
        </div>
        
        <div className="text-center p-8">
          <i className="ph ph-info text-4xl text-blue-600 mb-3 block"></i>
          <div className="text-base text-neutral-700 leading-relaxed">
            Insufficient mileage data available for this vehicle. A minimum of two MOT test records with mileage readings is required to provide insights.
          </div>
        </div>
      </div>
    );
  }

  // Determine if the vehicle has clocking issues
  const hasClockingIssues = insights.riskAssessment?.hasClockingAnomalies || false;

  // Render insights
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 text-neutral-900">
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
          Mileage Insights
        </h2>
      </div>
      
      <p className="mb-8 text-neutral-600 text-sm leading-relaxed">
        Advanced analysis of vehicle mileage patterns and usage history
      </p>
      
      {/* Clocking Warning Banner - Only shown if vehicle has been clocked */}
      {hasClockingIssues && (
        <MileageClockingWarning 
          anomalies={anomalies} 
          mileageStats={mileageStats}
        />
      )}
      
      {/* Data Quality Indicator - Always show this first */}
      <DataQualityIndicator 
        hasClockingIssues={hasClockingIssues}
        motGapsDetected={motGapsDetected}
        anomalies={anomalies}
        dataPoints={mileageData.length}
      />
      
      <SectionBreak />
      
      {/* Risk Assessment Panel - Always show first for clocked vehicles */}
      {insights.riskAssessment && hasClockingIssues && (
        <section className="space-y-12 mb-16">
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
              Mileage History Risk Assessment
            </h3>
            <p className="text-sm text-neutral-600 mb-8">
              Comprehensive risk analysis based on detected mileage inconsistencies
            </p>
          </div>
          
          {/* Risk Score Card */}
          <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 ${
            insights.riskAssessment.riskCategory === 'Low' ? 'bg-green-50' :
            insights.riskAssessment.riskCategory === 'Medium' ? 'bg-yellow-50' :
            'bg-red-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-start">
                <i className={`ph ph-shield-check text-lg mr-3 mt-0.5 ${
                  insights.riskAssessment.riskCategory === 'Low' ? 'text-green-600' :
                  insights.riskAssessment.riskCategory === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Risk Assessment</div>
                  <div className="text-xs text-neutral-600">Overall risk level</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-2xl font-bold ${
                  insights.riskAssessment.riskCategory === 'Low' ? 'text-green-600' :
                  insights.riskAssessment.riskCategory === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{insights.riskAssessment.riskScore}</div>
                <div className={`text-xs ${
                  insights.riskAssessment.riskCategory === 'Low' ? 'text-green-600' :
                  insights.riskAssessment.riskCategory === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{insights.riskAssessment.riskCategory} Risk</div>
              </div>
            </div>
            <div className="text-xs text-neutral-700">
              Based on detected mileage inconsistencies and usage patterns
            </div>
          </div>
          
          {/* Risk Factors Cards */}
          {insights.riskAssessment.riskFactors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <i className="ph ph-warning-circle text-lg text-red-600"></i>
                <h4 className="text-lg font-semibold text-red-600">Identified Risk Factors</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {insights.riskAssessment.riskFactors.map((factor, index) => {
                  // Categorize risk factors for better visual treatment
                  let riskCategory = "general";
                  let riskIcon = "ph-warning-circle";
                  let riskTitle = "Risk Factor";
                  
                  if (factor.toLowerCase().includes("mileage discrepancy") || factor.toLowerCase().includes("rolled back")) {
                    riskCategory = "critical";
                    riskIcon = "ph-x-circle";
                    riskTitle = "Critical Issue";
                  } else if (factor.toLowerCase().includes("legal risk") || factor.toLowerCase().includes("illegal")) {
                    riskCategory = "legal";
                    riskIcon = "ph-scales";
                    riskTitle = "Legal Risk";
                  } else if (factor.toLowerCase().includes("possible causes") || factor.toLowerCase().includes("tampering")) {
                    riskCategory = "causes";
                    riskIcon = "ph-detective";
                    riskTitle = "Potential Causes";
                  } else if (factor.toLowerCase().includes("inactive") || factor.toLowerCase().includes("low usage")) {
                    riskCategory = "usage";
                    riskIcon = "ph-clock-clockwise";
                    riskTitle = "Usage Pattern";
                  } else if (factor.toLowerCase().includes("mot failure") || factor.toLowerCase().includes("maintenance")) {
                    riskCategory = "maintenance";
                    riskIcon = "ph-wrench";
                    riskTitle = "Maintenance Risk";
                  }
                  
                  const cardStyles = {
                    critical: "bg-red-50 border-l-4 border-red-600",
                    legal: "bg-purple-50 border-l-4 border-purple-600",
                    causes: "bg-orange-50 border-l-4 border-orange-600", 
                    usage: "bg-blue-50 border-l-4 border-blue-600",
                    maintenance: "bg-yellow-50 border-l-4 border-yellow-600",
                    general: "bg-red-50 border-l-4 border-red-600"
                  };
                  
                  const iconStyles = {
                    critical: "text-red-600",
                    legal: "text-purple-600", 
                    causes: "text-orange-600",
                    usage: "text-blue-600",
                    maintenance: "text-yellow-600",
                    general: "text-red-600"
                  };
                  
                  const textStyles = {
                    critical: "text-red-900",
                    legal: "text-purple-900",
                    causes: "text-orange-900", 
                    usage: "text-blue-900",
                    maintenance: "text-yellow-900",
                    general: "text-red-900"
                  };
                  
                  const subtextStyles = {
                    critical: "text-red-700",
                    legal: "text-purple-700",
                    causes: "text-orange-700",
                    usage: "text-blue-700", 
                    maintenance: "text-yellow-700",
                    general: "text-red-700"
                  };
                  
                  return (
                    <div key={`risk-${index}`} className={`${cardStyles[riskCategory]} rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300`}>
                      <div className="flex items-start gap-3">
                        <i className={`ph ${riskIcon} text-lg ${iconStyles[riskCategory]} mt-0.5 flex-shrink-0`}></i>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${textStyles[riskCategory]} mb-1`}>{riskTitle}</div>
                          <div className={`text-xs ${subtextStyles[riskCategory]} leading-relaxed`}>{factor}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Positive Factors Cards */}
          {insights.riskAssessment.positiveFactors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <i className="ph ph-check-circle text-lg text-green-600"></i>
                <h4 className="text-lg font-semibold text-green-600">Positive Factors</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {insights.riskAssessment.positiveFactors.map((factor, index) => (
                  <div key={`positive-${index}`} className="bg-green-50 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-2">
                      <i className="ph ph-check-circle text-lg text-green-600 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <div className="text-sm font-medium text-green-900 mb-1">Positive Factor {index + 1}</div>
                        <div className="text-xs text-green-700 leading-relaxed">{factor}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      
      {/* Mileage Benchmark Panel */}
      {insights.benchmarks && (
        <section className="space-y-12 mb-16">
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
              Benchmark Analysis
            </h3>
            <p className="text-sm text-neutral-600 mb-8">
              Comparison with UK vehicle usage patterns and expected values
            </p>
          </div>
          
          {/* Summary Statement Card */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-3 mb-4">
              <i className="ph ph-chart-bar text-lg text-blue-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900 mb-2">Current Status</div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  This vehicle has <span className="font-semibold text-neutral-900">{mileageData[mileageData.length-1].formattedMileage} miles</span>
                  {hasClockingIssues && insights.benchmarks.hasAdjustedMileage && (
                    <span className="italic ml-1 text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs">
                      (adjusted for inconsistencies)
                    </span>
                  )}, which is <span className="font-semibold text-blue-600">{insights.benchmarks.mileageCategory}</span> for a vehicle of this age and type.
                </p>
              </div>
            </div>
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Vehicle Age */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className="ph ph-clock text-lg text-green-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Vehicle Age</div>
                    <div className="text-xs text-neutral-600">Since registration</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-green-600">{insights.benchmarks.vehicleAgeYears}</div>
                  <div className="text-xs text-green-600">years</div>
                </div>
              </div>
            </div>
            
            {/* Average Annual Mileage */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className="ph ph-chart-line text-lg text-blue-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Annual Average</div>
                    <div className="text-xs text-neutral-600">Miles per year</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-blue-600">{insights.benchmarks.averageAnnualMileage.toLocaleString()}</div>
                  <div className="text-xs text-blue-600">miles/year</div>
                </div>
              </div>
              {hasClockingIssues && insights.benchmarks.hasAdjustedMileage && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mt-2">
                  Adjusted for inconsistencies
                </div>
              )}
            </div>
            
            {/* Total Mileage */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className="ph ph-target text-lg text-purple-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{hasClockingIssues ? "Adjusted Total" : "Total Mileage"}</div>
                    <div className="text-xs text-neutral-600">{hasClockingIssues ? "Excluding negative readings" : "Cumulative distance"}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-purple-600">{insights.benchmarks.totalMileage.toLocaleString()}</div>
                  <div className="text-xs text-purple-600">miles</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comparison Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Expected vs Actual */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className="ph ph-scales text-lg text-yellow-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Expected Mileage</div>
                    <div className="text-xs text-neutral-600">Age and type based</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-yellow-600">{insights.benchmarks.expectedTotalMileage.toLocaleString()}</div>
                  <div className="text-xs text-yellow-600">miles</div>
                </div>
              </div>
            </div>
            
            {/* Variance */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className="ph ph-trending-up text-lg text-neutral-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Variance</div>
                    <div className="text-xs text-neutral-600">From expected</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`text-2xl font-bold ${
                    insights.benchmarks.mileageRatio < 1 ? 'text-green-600' : 
                    insights.benchmarks.mileageRatio > 1.35 ? 'text-red-600' : 'text-neutral-900'
                  }`}>
                    {insights.benchmarks.mileageRatio < 1 ? "-" : "+"}{Math.abs(Math.round((insights.benchmarks.mileageRatio - 1) * 100))}%
                  </div>
                  <div className="text-xs text-neutral-600">difference</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Remaining Life Estimate */}
          <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-start">
                <i className="ph ph-battery-medium text-lg text-blue-600 mr-3 mt-0.5"></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Estimated Remaining Life</div>
                  <div className="text-xs text-neutral-600">Based on current usage patterns</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-blue-600">{insights.benchmarks.remainingMilesEstimate.toLocaleString()}</div>
                <div className="text-xs text-blue-600">miles (~{insights.benchmarks.remainingYearsEstimate} years)</div>
              </div>
            </div>
          </div>
          
          {/* Context Information */}
          <div className="bg-neutral-50 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-2 mb-3">
              <i className="ph ph-info text-lg text-blue-600 mt-0.5 flex-shrink-0"></i>
              <div>
                <div className="text-sm font-medium text-blue-900 mb-2">UK Market Context</div>
                <div className="text-xs text-blue-700 leading-relaxed">
                  UK average annual mileage is {insights.benchmarks.ukAverageAnnualMileage.toLocaleString()} miles. 
                  {insights.benchmarks.typeSpecificAnnualMileage !== insights.benchmarks.ukAverageAnnualMileage &&
                  ` For ${vehicleInfo.fuelType} ${vehicleInfo.bodyType} vehicles, the typical annual mileage is ${insights.benchmarks.typeSpecificAnnualMileage.toLocaleString()} miles.`}
                </div>
                {hasClockingIssues && (
                  <div className="text-xs text-red-700 mt-2 bg-red-50 p-2 rounded">
                    <i className="ph ph-warning-circle text-red-600 mr-1"></i>
                    Due to detected mileage inconsistencies, average and total figures have been adjusted.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Usage Pattern Panel - Enhanced with anomaly detection */}
      {insights.usagePatterns && (
        <section className="space-y-12 mb-16">
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
              Usage Pattern Analysis
            </h3>
            <p className="text-sm text-neutral-600 mb-8">
              Analysis of how the vehicle has been used over time based on mileage records
            </p>
          </div>
          
          {/* Summary Statement Card */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-3 mb-4">
              <i className="ph ph-chart-line text-lg text-blue-600 mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900 mb-2">Usage Pattern Summary</div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  This vehicle shows a <span className="font-semibold text-blue-600">{insights.usagePatterns.usagePattern}</span> usage pattern 
                  with an average of <span className="font-semibold text-blue-600">{insights.usagePatterns.averageAnnualRate.toLocaleString()} miles per year</span>.
                  {hasClockingIssues && insights.usagePatterns.dataQuality === "adjusted" && (
                    <span className="italic ml-1 text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs">
                      (excludes periods with inconsistent mileage)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {/* Usage Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Highest Usage Period */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className="ph ph-trending-up text-lg text-green-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Peak Usage</div>
                    <div className="text-xs text-neutral-600">Highest period</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold text-green-600">{insights.usagePatterns.highestUsagePeriod.annualizedRate.toLocaleString()}</div>
                  <div className="text-xs text-green-600">miles/year</div>
                </div>
              </div>
              <div className="text-xs text-neutral-700">
                {insights.usagePatterns.highestUsagePeriod.period}
              </div>
            </div>
            
            {/* Lowest Usage Period */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className="ph ph-trending-down text-lg text-blue-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Low Usage</div>
                    <div className="text-xs text-neutral-600">Lowest period</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold text-blue-600">{insights.usagePatterns.lowestUsagePeriod.annualizedRate.toLocaleString()}</div>
                  <div className="text-xs text-blue-600">miles/year</div>
                </div>
              </div>
              <div className="text-xs text-neutral-700">
                {insights.usagePatterns.lowestUsagePeriod.period}
              </div>
            </div>
            
            {/* Usage Variability */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className="ph ph-waves text-lg text-purple-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Variability</div>
                    <div className="text-xs text-neutral-600">Usage range</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold text-purple-600">{insights.usagePatterns.usageVariance.toLocaleString()}</div>
                  <div className="text-xs text-purple-600">difference</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Commercial Use Warning */}
          {insights.usagePatterns.potentialCommercialUse && (
            <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className="ph ph-warning-circle text-lg text-red-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Commercial Use Detected</div>
                    <div className="text-xs text-neutral-600">Usage patterns suggest commercial activity</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold text-red-600">High</div>
                  <div className="text-xs text-red-600">Risk</div>
                </div>
              </div>
              <div className="text-xs text-red-700">
                High mileage usage patterns may indicate commercial or business use, which can affect vehicle valuation and insurance requirements.
              </div>
            </div>
          )}
            
          {/* Additional Findings Cards */}
          <div className="space-y-4">
            {/* MOT Gaps Card */}
            {motGapsDetected && (
              <div className="bg-red-50 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-2 mb-3">
                  <i className="ph ph-warning-circle text-lg text-red-600 mt-0.5 flex-shrink-0"></i>
                  <div>
                    <div className="text-sm font-medium text-red-900 mb-2">MOT Testing Gaps</div>
                    <div className="text-xs text-red-700 leading-relaxed">
                      Significant gaps detected in MOT testing history (18+ months) - vehicle may have been untested or unregistered for periods
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Unusual Patterns Cards */}
            {anomalies && anomalies.filter(a => a.type === 'spike').length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ph ph-warning-circle text-lg text-yellow-600"></i>
                  <h4 className="text-sm font-semibold text-yellow-900">Unusual Mileage Patterns</h4>
                </div>
                
                {anomalies.filter(a => a.type === 'spike')
                  .sort((a, b) => b.details.annualizedMileage - a.details.annualizedMileage)
                  .slice(0, 2)
                  .map((anomaly, index) => (
                  <div key={`anomaly-${index}`} className="bg-yellow-50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-2">
                      <i className="ph ph-warning-circle text-lg text-yellow-600 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <div className="text-sm font-medium text-yellow-900 mb-1">{anomaly.details.current.formattedDate}</div>
                        <div className="text-xs text-yellow-700 leading-relaxed">{anomaly.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {anomalies.filter(a => a.type === 'spike').length > 2 && (
                  <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-2">
                      <i className="ph ph-info text-lg text-yellow-600 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <div className="text-sm font-medium text-yellow-900 mb-1">Additional Patterns</div>
                        <div className="text-xs text-yellow-700 leading-relaxed">
                          {anomalies.filter(a => a.type === 'spike').length - 2} more unusual usage patterns detected
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Inactivity Periods Cards */}
            {inactivityPeriods && inactivityPeriods.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ph ph-clock-clockwise text-lg text-blue-600"></i>
                  <h4 className="text-sm font-semibold text-blue-900">Detected Inactivity Periods</h4>
                </div>
                
                {inactivityPeriods
                  .sort((a, b) => b.days - a.days)
                  .slice(0, 2)
                  .map((period, index) => (
                  <div key={`inactivity-${index}`} className="bg-blue-50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-2">
                      <i className="ph ph-clock-clockwise text-lg text-blue-600 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <div className="text-sm font-medium text-blue-900 mb-1">{period.start.formattedDate} to {period.end.formattedDate}</div>
                        <div className="text-xs text-blue-700 leading-relaxed">{period.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {inactivityPeriods.length > 2 && (
                  <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-2">
                      <i className="ph ph-info text-lg text-blue-600 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <div className="text-sm font-medium text-blue-900 mb-1">Additional Periods</div>
                        <div className="text-xs text-blue-700 leading-relaxed">
                          {inactivityPeriods.length - 2} more inactivity periods detected
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Risk Assessment Panel - Only shown here if not a clocked vehicle */}
      {insights.riskAssessment && !hasClockingIssues && (
        <section className="space-y-12 mb-16">
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
              History Risk Assessment
            </h3>
            <p className="text-sm text-neutral-600 mb-8">
              Comprehensive analysis of mileage patterns and vehicle history
            </p>
          </div>
          
          {/* Risk Score Card */}
          <div className={`rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 ${
            insights.riskAssessment.riskCategory === 'Low' ? 'bg-green-50' :
            insights.riskAssessment.riskCategory === 'Medium' ? 'bg-yellow-50' :
            'bg-red-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-start">
                <i className={`ph ph-shield-check text-lg mr-3 mt-0.5 ${
                  insights.riskAssessment.riskCategory === 'Low' ? 'text-green-600' :
                  insights.riskAssessment.riskCategory === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Risk Assessment</div>
                  <div className="text-xs text-neutral-600">Overall risk level</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-2xl font-bold ${
                  insights.riskAssessment.riskCategory === 'Low' ? 'text-green-600' :
                  insights.riskAssessment.riskCategory === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{insights.riskAssessment.riskScore}</div>
                <div className={`text-xs ${
                  insights.riskAssessment.riskCategory === 'Low' ? 'text-green-600' :
                  insights.riskAssessment.riskCategory === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{insights.riskAssessment.riskCategory} Risk</div>
              </div>
            </div>
            <div className="text-xs text-neutral-700">
              Based on comprehensive analysis of mileage patterns and vehicle history
            </div>
          </div>
          
          {/* Risk Factors Cards */}
          {insights.riskAssessment.riskFactors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <i className="ph ph-warning-circle text-lg text-red-600"></i>
                <h4 className="text-lg font-semibold text-red-600">Identified Risk Factors</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {insights.riskAssessment.riskFactors.map((factor, index) => {
                  // Categorize risk factors for better visual treatment
                  let riskCategory = "general";
                  let riskIcon = "ph-warning-circle";
                  let riskTitle = "Risk Factor";
                  
                  if (factor.toLowerCase().includes("mileage discrepancy") || factor.toLowerCase().includes("rolled back")) {
                    riskCategory = "critical";
                    riskIcon = "ph-x-circle";
                    riskTitle = "Critical Issue";
                  } else if (factor.toLowerCase().includes("legal risk") || factor.toLowerCase().includes("illegal")) {
                    riskCategory = "legal";
                    riskIcon = "ph-scales";
                    riskTitle = "Legal Risk";
                  } else if (factor.toLowerCase().includes("possible causes") || factor.toLowerCase().includes("tampering")) {
                    riskCategory = "causes";
                    riskIcon = "ph-detective";
                    riskTitle = "Potential Causes";
                  } else if (factor.toLowerCase().includes("inactive") || factor.toLowerCase().includes("low usage")) {
                    riskCategory = "usage";
                    riskIcon = "ph-clock-clockwise";
                    riskTitle = "Usage Pattern";
                  } else if (factor.toLowerCase().includes("mot failure") || factor.toLowerCase().includes("maintenance")) {
                    riskCategory = "maintenance";
                    riskIcon = "ph-wrench";
                    riskTitle = "Maintenance Risk";
                  }
                  
                  const cardStyles = {
                    critical: "bg-red-50 border-l-4 border-red-600",
                    legal: "bg-purple-50 border-l-4 border-purple-600",
                    causes: "bg-orange-50 border-l-4 border-orange-600", 
                    usage: "bg-blue-50 border-l-4 border-blue-600",
                    maintenance: "bg-yellow-50 border-l-4 border-yellow-600",
                    general: "bg-red-50 border-l-4 border-red-600"
                  };
                  
                  const iconStyles = {
                    critical: "text-red-600",
                    legal: "text-purple-600", 
                    causes: "text-orange-600",
                    usage: "text-blue-600",
                    maintenance: "text-yellow-600",
                    general: "text-red-600"
                  };
                  
                  const textStyles = {
                    critical: "text-red-900",
                    legal: "text-purple-900",
                    causes: "text-orange-900", 
                    usage: "text-blue-900",
                    maintenance: "text-yellow-900",
                    general: "text-red-900"
                  };
                  
                  const subtextStyles = {
                    critical: "text-red-700",
                    legal: "text-purple-700",
                    causes: "text-orange-700",
                    usage: "text-blue-700", 
                    maintenance: "text-yellow-700",
                    general: "text-red-700"
                  };
                  
                  return (
                    <div key={`risk-${index}`} className={`${cardStyles[riskCategory]} rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300`}>
                      <div className="flex items-start gap-3">
                        <i className={`ph ${riskIcon} text-lg ${iconStyles[riskCategory]} mt-0.5 flex-shrink-0`}></i>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${textStyles[riskCategory]} mb-1`}>{riskTitle}</div>
                          <div className={`text-xs ${subtextStyles[riskCategory]} leading-relaxed`}>{factor}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Positive Factors Cards */}
          {insights.riskAssessment.positiveFactors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <i className="ph ph-check-circle text-lg text-green-600"></i>
                <h4 className="text-lg font-semibold text-green-600">Positive Factors</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {insights.riskAssessment.positiveFactors.map((factor, index) => (
                  <div key={`positive-${index}`} className="bg-green-50 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-2">
                      <i className="ph ph-check-circle text-lg text-green-600 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <div className="text-sm font-medium text-green-900 mb-1">Positive Factor {index + 1}</div>
                        <div className="text-xs text-green-700 leading-relaxed">{factor}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      
      <SectionBreak />
      
      <SimpleTooltip title="Information updated regularly with the latest UK vehicle data">
        <p className="text-xs text-neutral-500 text-center mt-8 leading-relaxed">
          Data analysis based on vehicle history and UK market trends as of March 2025
        </p>
      </SimpleTooltip>
    </div>
  );
};

export default VehicleMileageInsights;