import React, { useState, useEffect, useRef, useCallback } from 'react';
// Simple color constants for semantic use only (matches DVLADataHeader approach)
const SEMANTIC_COLORS = {
  POSITIVE: '#059669',
  NEGATIVE: '#dc2626', 
  WARNING: '#d97706',
  PRIMARY: '#3b82f6'
};

// Import Material-UI icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Simple tooltip component - minimal styling (matches DVLADataHeader approach)
const SimpleTooltip = ({ children, title }) => (
  <span title={title} style={{ cursor: 'help' }}>
    {children}
  </span>
);

// Ultra Clean Loading Spinner (matches DVLADataHeader pattern)
const LoadingSpinner = () => (
  <>
    <style>
      {`
        @keyframes mileage-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
    </style>
    <div style={{
      width: '24px',
      height: '24px',
      border: '2px solid var(--gray-200)',
      borderRadius: '50%',
      borderTopColor: 'var(--primary)',
      animation: 'mileage-spin 1s linear infinite'
    }} />
  </>
);

// Clean Section Spacing - No Visual Dividers (matches DVLADataHeader pattern)
const SectionBreak = () => (
  <div style={{ height: 'var(--space-3xl)' }} />
);

// Import mileage tooltips
import { mileageTooltips } from './mileageTooltips';

// Import styled components
import {
  MileageInsightsContainer,
  MileageInsightSection,
  MileageInsightPanel,
  MileageTable,
  RiskScoreDisplay,
  RiskScoreCircle,
  RiskScoreText,
  RiskCategory,
  RiskDescription,
  FactorsHeading,
  FactorsList,
  FactorItem,
  FooterNote,
  ValueDisplay,
  LoadingContainer,
  ErrorContainer,
  EmptyContainer,
  SectionTitleContainer,
  MileageMetricCard,
  MileageMetricLabel,
  MileageMetricValue,
  MileageMetricSubtext,
  DataQualityBadge
} from './style/style';

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
  let qualityColor = SEMANTIC_COLORS.POSITIVE;
  
  if (hasClockingIssues) {
    qualityLevel = "poor";
    qualityDisplayName = "Poor Quality";
    qualityColor = SEMANTIC_COLORS.NEGATIVE;
  } else if (motGapsDetected || (anomalies && anomalies.length > 0)) {
    qualityLevel = "medium";
    qualityDisplayName = "Medium Quality";
    qualityColor = SEMANTIC_COLORS.WARNING;
  } else if (dataPoints < 4) {
    qualityLevel = "limited";
    qualityDisplayName = "Limited Data";
    qualityColor = 'var(--gray-500)';
  }
  
  return (
    <MileageInsightSection>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-lg)'
      }}>
        <SimpleTooltip title="Assessment of the reliability and completeness of the vehicle's history data">
          <h3 style={{
            margin: 0,
            fontFamily: 'var(--font-main)',
            fontSize: 'var(--text-xl)',
            fontWeight: '600',
            color: 'var(--gray-900)',
            letterSpacing: '-0.02em',
            lineHeight: '1.2',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            Data Quality Assessment
          </h3>
        </SimpleTooltip>
        <DataQualityBadge quality={qualityLevel}>
          {qualityLevel === "high" && <CheckCircleIcon fontSize="small" />}
          {qualityLevel === "medium" && <WarningIcon fontSize="small" />}
          {qualityLevel === "poor" && <ErrorOutlineIcon fontSize="small" />}
          {qualityLevel === "limited" && <InfoIcon fontSize="small" />}
          {qualityDisplayName}
        </DataQualityBadge>
      </div>
      
      <MileageInsightPanel>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)'
        }}>
          <MileageMetricCard>
            <MileageMetricLabel>Data Points Available</MileageMetricLabel>
            <MileageMetricValue>{dataPoints}</MileageMetricValue>
            <MileageMetricSubtext>
              {dataPoints >= 4 ? 'Sufficient for comprehensive analysis' : 'Limited data may affect analysis accuracy'}
            </MileageMetricSubtext>
          </MileageMetricCard>
          
          <MileageMetricCard>
            <MileageMetricLabel>Assessment Status</MileageMetricLabel>
            <MileageMetricValue style={{ color: qualityColor }}>{qualityDisplayName}</MileageMetricValue>
            <MileageMetricSubtext>
              {hasClockingIssues
                ? "Significant inconsistencies detected"
                : motGapsDetected
                ? "Testing gaps may impact completeness"
                : "Complete and reliable history available"}
            </MileageMetricSubtext>
          </MileageMetricCard>
        </div>
        
        <FactorsList>
          {hasClockingIssues && (
            <FactorItem _iconColor={"var(--negative)"}>
              <ErrorOutlineIcon fontSize="small" />
              <span>Mileage inconsistencies detected, suggesting potential odometer tampering.</span>
            </FactorItem>
          )}
          
          {motGapsDetected && (
            <FactorItem _iconColor={"var(--warning)"}>
              <WarningIcon fontSize="small" />
              <span>Significant gaps in MOT testing history (18+ months) detected.</span>
            </FactorItem>
          )}
          
          {anomalies && anomalies.filter(a => a.type === 'negative').length > 0 && (
            <FactorItem _iconColor={"var(--negative)"}>
              <ErrorOutlineIcon fontSize="small" />
              <span>{anomalies.filter(a => a.type === 'negative').length} instances of decreasing mileage detected.</span>
            </FactorItem>
          )}
          
          {anomalies && anomalies.filter(a => a.type === 'spike').length > 0 && (
            <FactorItem _iconColor={"var(--warning)"}>
              <WarningIcon fontSize="small" />
              <span>{anomalies.filter(a => a.type === 'spike').length} unusual mileage patterns detected.</span>
            </FactorItem>
          )}
          
          {dataPoints < 3 && (
            <FactorItem _iconColor={"var(--warning)"}>
              <InfoIcon fontSize="small" />
              <span>Limited data points available ({dataPoints}). Analysis may be less reliable.</span>
            </FactorItem>
          )}
          
          {!hasClockingIssues && !motGapsDetected && dataPoints >= 4 && 
           (!anomalies || anomalies.length === 0) && (
            <FactorItem _iconColor={"var(--positive)"}>
              <CheckCircleIcon fontSize="small" />
              <span>Complete and consistent mileage history with no detected anomalies.</span>
            </FactorItem>
          )}
        </FactorsList>
      </MileageInsightPanel>
    </MileageInsightSection>
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
      <MileageInsightsContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <div style={{
            fontFamily: 'var(--font-main)',
            color: 'var(--gray-600)',
            fontSize: 'var(--text-sm)',
            textAlign: 'center'
          }}>Loading vehicle mileage insights...</div>
        </LoadingContainer>
      </MileageInsightsContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <MileageInsightsContainer>
        <SectionTitleContainer>
          <h2>Mileage Insights</h2>
        </SectionTitleContainer>
        
        <ErrorContainer>
          <div style={{
            fontFamily: 'var(--font-main)',
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--gray-900)',
            marginBottom: 'var(--space-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-sm)'
          }}>
            <ErrorOutlineIcon style={{ color: 'var(--negative)' }} />
            Service Unavailable
          </div>
          <div style={{
            fontFamily: 'var(--font-main)',
            fontSize: 'var(--text-base)',
            color: 'var(--negative)',
            lineHeight: '1.5'
          }}>The vehicle mileage data service is currently unavailable. Please try again later.</div>
        </ErrorContainer>
      </MileageInsightsContainer>
    );
  }

  // Show data unavailable state
  if (dataUnavailable || !mileageData || mileageData.length < 2) {
    return (
      <MileageInsightsContainer>
        <SectionTitleContainer>
          <h2>Mileage Insights</h2>
        </SectionTitleContainer>
        
        <EmptyContainer>
          <InfoIcon style={{ fontSize: 40, color: 'var(--primary)', marginBottom: 10 }} />
          <div style={{
            fontFamily: 'var(--font-main)',
            fontSize: 'var(--text-base)',
            color: 'var(--gray-700)',
            lineHeight: '1.5'
          }}>Insufficient mileage data available for this vehicle. A minimum of two MOT test records with mileage readings is required to provide insights.</div>
        </EmptyContainer>
      </MileageInsightsContainer>
    );
  }

  // Determine if the vehicle has clocking issues
  const hasClockingIssues = insights.riskAssessment?.hasClockingAnomalies || false;

  // Render insights
  return (
    <MileageInsightsContainer>
      <SectionTitleContainer>
        <h2>Mileage Insights</h2>
      </SectionTitleContainer>
      
      <p style={{ 
        marginBottom: 'var(--space-xl)', 
        color: 'var(--gray-600)',
        fontFamily: 'var(--font-main)',
        fontSize: 'var(--text-sm)',
        lineHeight: '1.5'
      }}>
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
        <MileageInsightSection>
          <SimpleTooltip title={mileageTooltips.sectionRiskAssessment}>
            <h3 style={{
              margin: '0 0 var(--space-lg) 0',
              fontFamily: 'var(--font-main)',
              fontSize: 'var(--text-xl)',
              fontWeight: '600',
              color: 'var(--gray-900)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
            Mileage History Risk Assessment
            </h3>
          </SimpleTooltip>
          
          <MileageInsightPanel>
            <RiskScoreDisplay>
              <RiskScoreCircle riskCategory={insights.riskAssessment.riskCategory}>
                {insights.riskAssessment.riskScore}
              </RiskScoreCircle>
              <RiskScoreText>
                <RiskCategory riskCategory={insights.riskAssessment.riskCategory}>
                  {insights.riskAssessment.riskCategory} Risk
                </RiskCategory>
                <RiskDescription>
                  {hasClockingIssues 
                    ? "Based on detected mileage inconsistencies and usage patterns" 
                    : "Based on comprehensive analysis of mileage patterns and vehicle history"}
                </RiskDescription>
              </RiskScoreText>
            </RiskScoreDisplay>
            
            {insights.riskAssessment.riskFactors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <FactorsHeading color={"var(--negative)"}>
                  <WarningIcon fontSize="small" /> Risk Factors
                </FactorsHeading>
                <FactorsList>
                  {insights.riskAssessment.riskFactors.map((factor, index) => (
                    <FactorItem key={`risk-${index}`} _iconColor={"var(--negative)"}>
                      <WarningIcon fontSize="small" />
                      <span>{factor}</span>
                    </FactorItem>
                  ))}
                </FactorsList>
              </div>
            )}
            
            {insights.riskAssessment.positiveFactors.length > 0 && (
              <div>
                <FactorsHeading color={"var(--positive)"}>
                  <CheckCircleIcon fontSize="small" /> Positive Factors
                </FactorsHeading>
                <FactorsList>
                  {insights.riskAssessment.positiveFactors.map((factor, index) => (
                    <FactorItem key={`positive-${index}`} _iconColor={"var(--positive)"}>
                      <CheckCircleIcon fontSize="small" />
                      <span>{factor}</span>
                    </FactorItem>
                  ))}
                </FactorsList>
              </div>
            )}
          </MileageInsightPanel>
        </MileageInsightSection>
      )}
      
      {/* Mileage Benchmark Panel */}
      {insights.benchmarks && (
        <MileageInsightSection>
          <SimpleTooltip title={mileageTooltips.sectionBenchmarks}>
            <h3 style={{
              margin: '0 0 var(--space-lg) 0',
              fontFamily: 'var(--font-main)',
              fontSize: 'var(--text-xl)',
              fontWeight: '600',
              color: 'var(--gray-900)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
            Benchmark Analysis
            </h3>
          </SimpleTooltip>
          
          <MileageInsightPanel>
            <p style={{
            fontFamily: 'var(--font-main)',
            fontSize: 'var(--text-base)',
            color: 'var(--gray-700)',
            lineHeight: '1.5',
            margin: 0
          }}>
              This vehicle has <SimpleTooltip title={mileageTooltips.currentMileage}>
                <ValueDisplay>{mileageData[mileageData.length-1].formattedMileage} miles</ValueDisplay>
              </SimpleTooltip>
              {hasClockingIssues && insights.benchmarks.hasAdjustedMileage && (
                <span style={{ 
                  fontStyle: 'italic', 
                  marginLeft: '5px', 
                  color: "var(--negative)",
                  backgroundColor: `${"var(--negative)"}10`,
                  padding: '2px 5px',
                  borderRadius: '3px'
                }}>
                  (adjusted for inconsistencies)
                </span>
              )}, 
              which is <SimpleTooltip title={mileageTooltips.mileageCategory}>
                <ValueDisplay>{insights.benchmarks.mileageCategory}</ValueDisplay>
              </SimpleTooltip> for a vehicle of this age and type.
            </p>
            
            <MileageTable>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <SimpleTooltip title="Time since vehicle registration date">
                      Vehicle Age
                    </SimpleTooltip>
                  </td>
                  <td>{insights.benchmarks.vehicleAgeYears} years</td>
                </tr>
                <tr>
                  <td>
                    <SimpleTooltip title={mileageTooltips.averageAnnualMileage}>
                      Average Annual Mileage
                    </SimpleTooltip>
                  </td>
                  <td>
                    {insights.benchmarks.averageAnnualMileage.toLocaleString()} miles/year
                    {hasClockingIssues && insights.benchmarks.hasAdjustedMileage && (
                      <span style={{ 
                        display: 'inline-block', 
                        fontSize: '0.85em', 
                        color: 'white',
                        backgroundColor: "var(--negative)",
                        padding: '1px 5px',
                        borderRadius: '3px',
                        marginLeft: '5px'
                      }}>
                        Adjusted
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <SimpleTooltip title={hasClockingIssues ? 
                      "Calculated by summing only positive mileage increments" : 
                      "Total mileage added since first record"}>
                      {hasClockingIssues ? "Adjusted Total Mileage" : "Total Mileage"}
                    </SimpleTooltip>
                  </td>
                  <td>
                    {insights.benchmarks.totalMileage.toLocaleString()} miles
                    {hasClockingIssues && (
                      <span style={{ 
                        display: 'block', 
                        fontSize: '0.85em', 
                        color: "var(--negative)",
                        fontWeight: 'bold'
                      }}>
                        Excludes negative readings
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <SimpleTooltip title="Calculated based on vehicle age, type and typical usage">
                      Expected Mileage
                    </SimpleTooltip>
                  </td>
                  <td>{insights.benchmarks.expectedTotalMileage.toLocaleString()} miles</td>
                </tr>
                <tr>
                  <td>
                    <SimpleTooltip 
                      title="How much the vehicle's mileage deviates from expected" 
                    >
                      Variance From Expected
                    </SimpleTooltip>
                  </td>
                  <td>
                    <ValueDisplay 
                      color={insights.benchmarks.mileageRatio < 1 ? "var(--positive)" : 
                            insights.benchmarks.mileageRatio > 1.35 ? "var(--negative)" : undefined}
                    >
                      {insights.benchmarks.mileageRatio < 1 ? "-" : "+"}{Math.abs(Math.round((insights.benchmarks.mileageRatio - 1) * 100))}%
                    </ValueDisplay>
                  </td>
                </tr>
                <tr>
                  <td>
                    <SimpleTooltip 
                      title="Estimated miles and years remaining based on current usage patterns" 
                    >
                      Estimated Remaining Life
                    </SimpleTooltip>
                  </td>
                  <td>
                    <ValueDisplay>{insights.benchmarks.remainingMilesEstimate.toLocaleString()} miles</ValueDisplay>
                    <br />
                    <span style={{ fontSize: '0.9em', color: "var(--gray-600)" }}>
                      (approx. {insights.benchmarks.remainingYearsEstimate} years at current usage rate)
                    </span>
                  </td>
                </tr>
              </tbody>
            </MileageTable>
            
            <SimpleTooltip title={mileageTooltips.dataSource}>
              <FactorsHeading color="var(--primary)" style={{ borderBottom: '1px dotted var(--gray-500)', display: 'inline-flex', cursor: 'help' }}>
                <InfoIcon fontSize="small" /> Data Context:
              </FactorsHeading>
            </SimpleTooltip>
            <FactorsList>
              <FactorItem _iconColor={"var(--primary)"}>
                <InfoIcon fontSize="small" />
                <span>
                  UK average annual mileage is {insights.benchmarks.ukAverageAnnualMileage.toLocaleString()} miles. 
                  {insights.benchmarks.typeSpecificAnnualMileage !== insights.benchmarks.ukAverageAnnualMileage &&
                  ` For ${vehicleInfo.fuelType} ${vehicleInfo.bodyType} vehicles, the typical annual mileage is ${insights.benchmarks.typeSpecificAnnualMileage.toLocaleString()} miles.`}
                </span>
              </FactorItem>
              {hasClockingIssues && (
                <FactorItem _iconColor={"var(--negative)"}>
                  <WarningIcon fontSize="small" />
                  <span>
                    Due to detected mileage inconsistencies, average and total figures have been adjusted.
                  </span>
                </FactorItem>
              )}
            </FactorsList>
          </MileageInsightPanel>
        </MileageInsightSection>
      )}
      
      {/* Usage Pattern Panel - Enhanced with anomaly detection */}
      {insights.usagePatterns && (
        <MileageInsightSection>
          <SimpleTooltip title="Analysis of how the vehicle has been used over time based on mileage records">
            <h3 style={{
              margin: '0 0 var(--space-lg) 0',
              fontFamily: 'var(--font-main)',
              fontSize: 'var(--text-xl)',
              fontWeight: '600',
              color: 'var(--gray-900)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
            Usage Pattern Analysis
            </h3>
          </SimpleTooltip>
          
          <MileageInsightPanel>
            <p style={{
            fontFamily: 'var(--font-main)',
            fontSize: 'var(--text-base)',
            color: 'var(--gray-700)',
            lineHeight: '1.5',
            margin: 0
          }}>
              This vehicle shows a <ValueDisplay color={"var(--primary)"}>
                {insights.usagePatterns.usagePattern}
              </ValueDisplay> usage pattern 
              with an average of <ValueDisplay color={"var(--primary)"}>
                {insights.usagePatterns.averageAnnualRate.toLocaleString()} miles per year
              </ValueDisplay>.
              {hasClockingIssues && insights.usagePatterns.dataQuality === "adjusted" && (
                <span style={{ 
                  fontStyle: 'italic', 
                  marginLeft: '5px', 
                  color: "var(--negative)",
                  backgroundColor: `${"var(--negative)"}10`,
                  padding: '2px 5px',
                  borderRadius: '3px' 
                }}>
                  (excludes periods with inconsistent mileage)
                </span>
              )}
            </p>
            
            <MileageTable>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <SimpleTooltip 
                      title="Period with the highest annualised mileage rate" 
                    >
                      Highest Usage Period
                    </SimpleTooltip>
                  </td>
                  <td>
                    {insights.usagePatterns.highestUsagePeriod.period}
                    <br />
                    <span style={{ color: "var(--gray-600)" }}>
                      ({insights.usagePatterns.highestUsagePeriod.annualizedRate.toLocaleString()} miles/year)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <SimpleTooltip 
                      title="Period with the lowest annualised mileage rate" 
                    >
                      Lowest Usage Period
                    </SimpleTooltip>
                  </td>
                  <td>
                    {insights.usagePatterns.lowestUsagePeriod.period}
                    <br />
                    <span style={{ color: "var(--gray-600)" }}>
                      ({insights.usagePatterns.lowestUsagePeriod.annualizedRate.toLocaleString()} miles/year)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <SimpleTooltip 
                      title="Difference between highest and lowest annual rates" 
                    >
                      Usage Variability
                    </SimpleTooltip>
                  </td>
                  <td>
                    <ValueDisplay>
                      {insights.usagePatterns.usageVariance.toLocaleString()} miles/year
                    </ValueDisplay>
                  </td>
                </tr>
                {insights.usagePatterns.potentialCommercialUse && (
                  <tr>
                    <td>
                      <SimpleTooltip 
                        title="Indicators that suggest potential commercial use" 
                      >
                        Commercial Usage
                      </SimpleTooltip>
                    </td>
                    <td>
                      <span style={{ 
                        color: "var(--negative)", 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '3px 6px',
                        backgroundColor: `${"var(--negative)"}10`,
                        borderRadius: '3px',
                        width: 'fit-content'
                      }}>
                        <WarningIcon fontSize="small" style={{ marginRight: '5px' }} />
                        Potential commercial use detected
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </MileageTable>
            
            {/* MOT Gaps - Direct utilization of checkForMOTGaps */}
            {motGapsDetected && (
              <>
                <FactorsHeading color={"var(--negative)"}>
                  <WarningIcon fontSize="small" /> MOT Testing Gaps
                </FactorsHeading>
                <FactorsList>
                  <FactorItem _iconColor={"var(--negative)"}>
                    <WarningIcon fontSize="small" />
                    <span>
                      Significant gaps detected in MOT testing history (18+ months) - vehicle may have been untested or unregistered for periods
                    </span>
                  </FactorItem>
                </FactorsList>
              </>
            )}
            
            {anomalies && anomalies.filter(a => a.type === 'spike').length > 0 && (
              <>
                <FactorsHeading color={"var(--warning)"}>
                  <WarningIcon fontSize="small" /> Unusual Mileage Patterns
                </FactorsHeading>
                <FactorsList>
                  {anomalies.filter(a => a.type === 'spike')
                    .sort((a, b) => b.details.annualizedMileage - a.details.annualizedMileage)
                    .slice(0, 2)
                    .map((anomaly, index) => (
                    <FactorItem key={`anomaly-${index}`} _iconColor={"var(--warning)"}>
                      <WarningIcon fontSize="small" />
                      <span>
                        {anomaly.details.current.formattedDate}: {anomaly.message}
                      </span>
                    </FactorItem>
                  ))}
                  {anomalies.filter(a => a.type === 'spike').length > 2 && (
                    <FactorItem _iconColor={"var(--warning)"}>
                      <InfoIcon fontSize="small" />
                      <span>
                        {anomalies.filter(a => a.type === 'spike').length - 2} more unusual usage patterns detected
                      </span>
                    </FactorItem>
                  )}
                </FactorsList>
              </>
            )}
            
            {inactivityPeriods && inactivityPeriods.length > 0 && (
              <>
                <FactorsHeading color={"var(--primary)"}>
                  <InfoIcon fontSize="small" /> Detected Inactivity Periods
                </FactorsHeading>
                <FactorsList>
                  {inactivityPeriods
                    .sort((a, b) => b.days - a.days)
                    .slice(0, 2)
                    .map((period, index) => (
                    <FactorItem key={`inactivity-${index}`} _iconColor={"var(--primary)"}>
                      <HistoryIcon fontSize="small" />
                      <span>
                        {period.start.formattedDate} to {period.end.formattedDate}: {period.description}
                      </span>
                    </FactorItem>
                  ))}
                  {inactivityPeriods.length > 2 && (
                    <FactorItem _iconColor={"var(--primary)"}>
                      <InfoIcon fontSize="small" />
                      <span>
                        {inactivityPeriods.length - 2} more inactivity periods detected
                      </span>
                    </FactorItem>
                  )}
                </FactorsList>
              </>
            )}
          </MileageInsightPanel>
        </MileageInsightSection>
      )}
      
      {/* Risk Assessment Panel - Only shown here if not a clocked vehicle */}
      {insights.riskAssessment && !hasClockingIssues && (
        <MileageInsightSection>
          <SimpleTooltip title={mileageTooltips.sectionRiskAssessment}>
           <h3 style={{
              margin: '0 0 var(--space-lg) 0',
              fontFamily: 'var(--font-main)',
              fontSize: 'var(--text-xl)',
              fontWeight: '600',
              color: 'var(--gray-900)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
            History Risk Assessment
            </h3>
          </SimpleTooltip>
          
          <MileageInsightPanel>
            <RiskScoreDisplay>
              <RiskScoreCircle riskCategory={insights.riskAssessment.riskCategory}>
                {insights.riskAssessment.riskScore}
              </RiskScoreCircle>
              <RiskScoreText>
                <RiskCategory riskCategory={insights.riskAssessment.riskCategory}>
                  {insights.riskAssessment.riskCategory} Risk
                </RiskCategory>
                <RiskDescription>
                  Based on comprehensive analysis of mileage patterns and vehicle history
                </RiskDescription>
              </RiskScoreText>
            </RiskScoreDisplay>
            
            {insights.riskAssessment.riskFactors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <FactorsHeading color={"var(--negative)"}>
                  <WarningIcon fontSize="small" /> Risk Factors
                </FactorsHeading>
                <FactorsList>
                  {insights.riskAssessment.riskFactors.map((factor, index) => (
                    <FactorItem key={`risk-${index}`} _iconColor={"var(--negative)"}>
                      <WarningIcon fontSize="small" />
                      <span>{factor}</span>
                    </FactorItem>
                  ))}
                </FactorsList>
              </div>
            )}
            
            {insights.riskAssessment.positiveFactors.length > 0 && (
              <div>
                <FactorsHeading color={"var(--positive)"}>
                  <CheckCircleIcon fontSize="small" /> Positive Factors
                </FactorsHeading>
                <FactorsList>
                  {insights.riskAssessment.positiveFactors.map((factor, index) => (
                    <FactorItem key={`positive-${index}`} _iconColor={"var(--positive)"}>
                      <CheckCircleIcon fontSize="small" />
                      <span>{factor}</span>
                    </FactorItem>
                  ))}
                </FactorsList>
              </div>
            )}
          </MileageInsightPanel>
        </MileageInsightSection>
      )}
      
      <SectionBreak />
      
      <SimpleTooltip title="Information updated regularly with the latest UK vehicle data">
        <FooterNote>
          Data analysis based on vehicle history and UK market trends as of March 2025
        </FooterNote>
      </SimpleTooltip>
    </MileageInsightsContainer>
  );
};

export default VehicleMileageInsights;