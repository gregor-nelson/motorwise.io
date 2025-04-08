import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GovUKBody,
  GovUKBodyS,
  GovUKLoadingSpinner,
  GovUKSectionBreak,
  GovUKHeadingM,
  COLORS
} from '../../../../../styles/theme';

// Import Material-UI icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Import custom tooltip components
import {
  GovUKTooltip,
  HeadingWithTooltip,
  ValueWithTooltip,
  CellWithTooltip,
  useTooltip
} from '../../../../../styles/tooltip';

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
  SectionTitleContainer
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
  let qualityLevel = "High";
  let qualityColor = COLORS.GREEN;
  
  if (hasClockingIssues) {
    qualityLevel = "Poor";
    qualityColor = COLORS.RED;
  } else if (motGapsDetected || (anomalies && anomalies.length > 0)) {
    qualityLevel = "Medium";
    qualityColor = COLORS.BLACK;
  } else if (dataPoints < 4) {
    qualityLevel = "Limited";
    qualityColor = COLORS.BLACK
  }
  
  return (
    <MileageInsightSection>
      <HeadingWithTooltip 
        tooltip="Assessment of the reliability and completeness of the vehicle's history data" 
        iconColor={qualityColor}
      >
        <GovUKHeadingM>
        Data Quality Assessment
        </GovUKHeadingM>
      </HeadingWithTooltip>
      
      <MileageInsightPanel borderColor={qualityColor}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: `${qualityColor}20`,
          borderRadius: '5px'
        }}>
          <div style={{ 
            backgroundColor: qualityColor, 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '4px',
            fontWeight: 'bold',
            marginRight: '15px',
            display: 'flex',
            alignItems: 'center'
          }}>
            {qualityLevel === "High" && <CheckCircleIcon style={{ marginRight: '5px' }} />}
            {qualityLevel === "Medium" && <WarningIcon style={{ marginRight: '5px' }} />}
            {qualityLevel === "Poor" && <ErrorOutlineIcon style={{ marginRight: '5px' }} />}
            {qualityLevel === "Limited" && <InfoIcon style={{ marginRight: '5px' }} />}
            {qualityLevel} Quality
          </div>
          <div>
            <GovUKBody style={{ margin: 0 }}>
              {hasClockingIssues
                ? "Significant mileage inconsistencies detected, affecting data reliability."
                : motGapsDetected
                ? "Gaps in vehicle testing history may impact the completeness of mileage data."
                : `Based on ${dataPoints} mileage readings over the vehicle's history.`}
            </GovUKBody>
          </div>
        </div>
        
        <FactorsList>
          {hasClockingIssues && (
            <FactorItem borderColor={COLORS.RED} iconColor={COLORS.RED}>
              <ErrorOutlineIcon fontSize="small" />
              <span>Mileage inconsistencies detected, suggesting potential odometer tampering.</span>
            </FactorItem>
          )}
          
          {motGapsDetected && (
            <FactorItem borderColor={COLORS.BLACK} iconColor={COLORS.BLACK}>
              <WarningIcon fontSize="small" />
              <span>Significant gaps in MOT testing history (18+ months) detected.</span>
            </FactorItem>
          )}
          
          {anomalies && anomalies.filter(a => a.type === 'negative').length > 0 && (
            <FactorItem borderColor={COLORS.RED} iconColor={COLORS.RED}>
              <ErrorOutlineIcon fontSize="small" />
              <span>{anomalies.filter(a => a.type === 'negative').length} instances of decreasing mileage detected.</span>
            </FactorItem>
          )}
          
          {anomalies && anomalies.filter(a => a.type === 'spike').length > 0 && (
            <FactorItem borderColor={COLORS.BLACK} iconColor={COLORS.BLACK}>
              <WarningIcon fontSize="small" />
              <span>{anomalies.filter(a => a.type === 'spike').length} unusual mileage patterns detected.</span>
            </FactorItem>
          )}
          
          {dataPoints < 3 && (
            <FactorItem borderColor={COLORS.BLACK} iconColor={COLORS.BLACK}>
              <InfoIcon fontSize="small" />
              <span>Limited data points available ({dataPoints}). Analysis may be less reliable.</span>
            </FactorItem>
          )}
          
          {!hasClockingIssues && !motGapsDetected && dataPoints >= 4 && 
           (!anomalies || anomalies.length === 0) && (
            <FactorItem borderColor={COLORS.GREEN} iconColor={COLORS.GREEN}>
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
  
  // Use tooltip hooks
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
      <LoadingContainer>
        <GovUKLoadingSpinner />
        <GovUKBody>Loading vehicle mileage insights...</GovUKBody>
      </LoadingContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <MileageInsightsContainer>
        <SectionTitleContainer>
          <GovUKHeadingM>Mileage Insights</GovUKHeadingM>
        </SectionTitleContainer>
        
        <ErrorContainer>
          <HeadingWithTooltip 
            tooltip="Error occurred while fetching or processing vehicle data" 
            iconColor={COLORS.RED}
          >
            <ErrorOutlineIcon /> Service Unavailable
          </HeadingWithTooltip>
          <GovUKBody>The vehicle mileage data service is currently unavailable. Please try again later.</GovUKBody>
        </ErrorContainer>
      </MileageInsightsContainer>
    );
  }

  // Show data unavailable state
  if (dataUnavailable || !mileageData || mileageData.length < 2) {
    return (
      <MileageInsightsContainer>
        <SectionTitleContainer>
          <GovUKHeadingM>Mileage Insights</GovUKHeadingM>
        </SectionTitleContainer>
        
        <EmptyContainer>
          <InfoIcon style={{ fontSize: 40, color: '#1d70b8', marginBottom: 10 }} />
          <GovUKBody>Insufficient mileage data available for this vehicle. A minimum of two MOT test records with mileage readings is required to provide insights.</GovUKBody>
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
        <GovUKHeadingM>Mileage Insights</GovUKHeadingM>
      </SectionTitleContainer>
      
      <GovUKBodyS style={{ marginBottom: '20px', color: COLORS.DARK_GREY }}>
        Advanced analysis of vehicle mileage patterns and usage history
      </GovUKBodyS>
      
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
      
      <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
      
      {/* Risk Assessment Panel - Always show first for clocked vehicles */}
      {insights.riskAssessment && hasClockingIssues && (
        <MileageInsightSection>
          <HeadingWithTooltip 
            tooltip={mileageTooltips.sectionRiskAssessment} 
            iconColor={
              insights.riskAssessment.riskCategory === 'Low' ? COLORS.GREEN : 
              insights.riskAssessment.riskCategory === 'Medium' ? COLORS.BLACK : 
              COLORS.RED
            }
          >
            <GovUKHeadingM>
            <AssessmentIcon /> Mileage History Risk Assessment
            </GovUKHeadingM>
          </HeadingWithTooltip>
          
          <MileageInsightPanel borderColor={
              insights.riskAssessment.riskCategory === 'Low' ? COLORS.GREEN : 
              insights.riskAssessment.riskCategory === 'Medium' ? COLORS.BLACK : 
              COLORS.RED
          }>
            <RiskScoreDisplay riskCategory={insights.riskAssessment.riskCategory}>
              <RiskScoreCircle riskCategory={insights.riskAssessment.riskCategory}>
                {insights.riskAssessment.riskScore}
                {/* Add icons for better accessibility */}
                {insights.riskAssessment.riskCategory === 'Low' && 
                  <CheckCircleIcon fontSize="small" style={{ position: 'absolute', right: '-10px', top: '-10px' }} />}
                {insights.riskAssessment.riskCategory === 'Medium' && 
                  <WarningIcon fontSize="small" style={{ position: 'absolute', right: '-10px', top: '-10px' }} />}
                {insights.riskAssessment.riskCategory === 'High' && 
                  <ErrorOutlineIcon fontSize="small" style={{ position: 'absolute', right: '-10px', top: '-10px' }} />}
              </RiskScoreCircle>
              <RiskScoreText>
                <RiskCategory riskCategory={insights.riskAssessment.riskCategory}>
                  {/* Add visual patterns for colour-blind users */}
                  {insights.riskAssessment.riskCategory === 'Low' && "✓ "}
                  {insights.riskAssessment.riskCategory === 'Medium' && "⚠ "}
                  {insights.riskAssessment.riskCategory === 'High' && "⛔ "}
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
                <FactorsHeading color={COLORS.RED}>
                  <WarningIcon fontSize="small" /> Risk Factors
                </FactorsHeading>
                <FactorsList>
                  {insights.riskAssessment.riskFactors.map((factor, index) => (
                    <FactorItem key={`risk-${index}`} borderColor={COLORS.RED} iconColor={COLORS.RED}>
                      <WarningIcon fontSize="small" />
                      <span>{factor}</span>
                    </FactorItem>
                  ))}
                </FactorsList>
              </div>
            )}
            
            {insights.riskAssessment.positiveFactors.length > 0 && (
              <div>
                <FactorsHeading color={COLORS.GREEN}>
                  <CheckCircleIcon fontSize="small" /> Positive Factors
                </FactorsHeading>
                <FactorsList>
                  {insights.riskAssessment.positiveFactors.map((factor, index) => (
                    <FactorItem key={`positive-${index}`} borderColor={COLORS.GREEN} iconColor={COLORS.GREEN}>
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
          <HeadingWithTooltip tooltip={mileageTooltips.sectionBenchmarks} iconColor={COLORS.BLUE}>
            <GovUKHeadingM>
            Benchmark Analysis
            </GovUKHeadingM>
          </HeadingWithTooltip>
          
          <MileageInsightPanel borderColor={COLORS.BLUE}>
            <GovUKBody>
              This vehicle has <ValueWithTooltip tooltip={mileageTooltips.currentMileage}>
                <ValueDisplay>{mileageData[mileageData.length-1].formattedMileage} miles</ValueDisplay>
              </ValueWithTooltip>
              {hasClockingIssues && insights.benchmarks.hasAdjustedMileage && (
                <span style={{ 
                  fontStyle: 'italic', 
                  marginLeft: '5px', 
                  color: COLORS.RED,
                  backgroundColor: `${COLORS.RED}10`,
                  padding: '2px 5px',
                  borderRadius: '3px'
                }}>
                  (adjusted for inconsistencies)
                </span>
              )}, 
              which is <ValueWithTooltip tooltip={mileageTooltips.mileageCategory}>
                <ValueDisplay>{insights.benchmarks.mileageCategory}</ValueDisplay>
              </ValueWithTooltip> for a vehicle of this age and type.
            </GovUKBody>
            
            <MileageTable>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <CellWithTooltip 
                    label="Vehicle Age" 
                    tooltip="Time since vehicle registration date" 
                  />
                  <td>{insights.benchmarks.vehicleAgeYears} years</td>
                </tr>
                <tr>
                  <CellWithTooltip 
                    label="Average Annual Mileage" 
                    tooltip={mileageTooltips.averageAnnualMileage} 
                  />
                  <td>
                    {insights.benchmarks.averageAnnualMileage.toLocaleString()} miles/year
                    {hasClockingIssues && insights.benchmarks.hasAdjustedMileage && (
                      <span style={{ 
                        display: 'inline-block', 
                        fontSize: '0.85em', 
                        color: 'white',
                        backgroundColor: COLORS.RED,
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
                  <CellWithTooltip 
                    label={hasClockingIssues ? "Adjusted Total Mileage" : "Total Mileage"} 
                    tooltip={hasClockingIssues ? 
                      "Calculated by summing only positive mileage increments" : 
                      "Total mileage added since first record"} 
                  />
                  <td>
                    {insights.benchmarks.totalMileage.toLocaleString()} miles
                    {hasClockingIssues && (
                      <span style={{ 
                        display: 'block', 
                        fontSize: '0.85em', 
                        color: COLORS.RED,
                        fontWeight: 'bold'
                      }}>
                        Excludes negative readings
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <CellWithTooltip 
                    label="Expected Mileage" 
                    tooltip="Calculated based on vehicle age, type and typical usage" 
                  />
                  <td>{insights.benchmarks.expectedTotalMileage.toLocaleString()} miles</td>
                </tr>
                <tr>
                  <CellWithTooltip 
                    label="Variance From Expected" 
                    tooltip="How much the vehicle's mileage deviates from expected" 
                  />
                  <td>
                    <ValueDisplay 
                      color={insights.benchmarks.mileageRatio < 1 ? COLORS.GREEN : 
                            insights.benchmarks.mileageRatio > 1.35 ? COLORS.RED : undefined}
                    >
                      {insights.benchmarks.mileageRatio < 1 ? "-" : "+"}{Math.abs(Math.round((insights.benchmarks.mileageRatio - 1) * 100))}%
                    </ValueDisplay>
                  </td>
                </tr>
                <tr>
                  <CellWithTooltip 
                    label="Estimated Remaining Life" 
                    tooltip="Estimated miles and years remaining based on current usage patterns" 
                  />
                  <td>
                    <ValueDisplay>{insights.benchmarks.remainingMilesEstimate.toLocaleString()} miles</ValueDisplay>
                    <br />
                    <span style={{ fontSize: '0.9em', color: COLORS.DARK_GREY }}>
                      (approx. {insights.benchmarks.remainingYearsEstimate} years at current usage rate)
                    </span>
                  </td>
                </tr>
              </tbody>
            </MileageTable>
            
            <GovUKTooltip title={mileageTooltips.dataSource} arrow placement="top">
              <FactorsHeading color={COLORS.BLUE} style={{ borderBottom: '1px dotted #505a5f', display: 'inline-flex', cursor: 'help' }}>
                <InfoIcon fontSize="small" /> Data Context:
              </FactorsHeading>
            </GovUKTooltip>
            <FactorsList>
              <FactorItem iconColor={COLORS.BLUE}>
                <InfoIcon fontSize="small" />
                <span>
                  UK average annual mileage is {insights.benchmarks.ukAverageAnnualMileage.toLocaleString()} miles. 
                  {insights.benchmarks.typeSpecificAnnualMileage !== insights.benchmarks.ukAverageAnnualMileage &&
                  ` For ${vehicleInfo.fuelType} ${vehicleInfo.bodyType} vehicles, the typical annual mileage is ${insights.benchmarks.typeSpecificAnnualMileage.toLocaleString()} miles.`}
                </span>
              </FactorItem>
              {hasClockingIssues && (
                <FactorItem iconColor={COLORS.RED}>
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
          <HeadingWithTooltip 
            tooltip="Analysis of how the vehicle has been used over time based on mileage records" 
            iconColor={COLORS.BLUE}
          >
            <GovUKHeadingM>
            Usage Pattern Analysis
            </GovUKHeadingM>
          </HeadingWithTooltip>
          
          <MileageInsightPanel borderColor={COLORS.BLUE}>
            <GovUKBody>
              This vehicle shows a <ValueDisplay color={COLORS.BLUE}>
                {insights.usagePatterns.usagePattern}
              </ValueDisplay> usage pattern 
              with an average of <ValueDisplay color={COLORS.BLUE}>
                {insights.usagePatterns.averageAnnualRate.toLocaleString()} miles per year
              </ValueDisplay>.
              {hasClockingIssues && insights.usagePatterns.dataQuality === "adjusted" && (
                <span style={{ 
                  fontStyle: 'italic', 
                  marginLeft: '5px', 
                  color: COLORS.RED,
                  backgroundColor: `${COLORS.RED}10`,
                  padding: '2px 5px',
                  borderRadius: '3px' 
                }}>
                  (excludes periods with inconsistent mileage)
                </span>
              )}
            </GovUKBody>
            
            <MileageTable>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <CellWithTooltip 
                    label="Highest Usage Period" 
                    tooltip="Period with the highest annualised mileage rate" 
                  />
                  <td>
                    {insights.usagePatterns.highestUsagePeriod.period}
                    <br />
                    <span style={{ color: COLORS.DARK_GREY }}>
                      ({insights.usagePatterns.highestUsagePeriod.annualizedRate.toLocaleString()} miles/year)
                    </span>
                  </td>
                </tr>
                <tr>
                  <CellWithTooltip 
                    label="Lowest Usage Period" 
                    tooltip="Period with the lowest annualised mileage rate" 
                  />
                  <td>
                    {insights.usagePatterns.lowestUsagePeriod.period}
                    <br />
                    <span style={{ color: COLORS.DARK_GREY }}>
                      ({insights.usagePatterns.lowestUsagePeriod.annualizedRate.toLocaleString()} miles/year)
                    </span>
                  </td>
                </tr>
                <tr>
                  <CellWithTooltip 
                    label="Usage Variability" 
                    tooltip="Difference between highest and lowest annual rates" 
                  />
                  <td>
                    <ValueDisplay>
                      {insights.usagePatterns.usageVariance.toLocaleString()} miles/year
                    </ValueDisplay>
                  </td>
                </tr>
                {insights.usagePatterns.potentialCommercialUse && (
                  <tr>
                    <CellWithTooltip 
                      label="Commercial Usage" 
                      tooltip="Indicators that suggest potential commercial use" 
                    />
                    <td>
                      <span style={{ 
                        color: COLORS.RED, 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '3px 6px',
                        backgroundColor: `${COLORS.RED}10`,
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
                <FactorsHeading color={COLORS.RED}>
                  <WarningIcon fontSize="small" /> MOT Testing Gaps
                </FactorsHeading>
                <FactorsList>
                  <FactorItem borderColor={COLORS.RED} iconColor={COLORS.RED}>
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
                <FactorsHeading color={COLORS.BLACK}>
                  <WarningIcon fontSize="small" /> Unusual Mileage Patterns
                </FactorsHeading>
                <FactorsList>
                  {anomalies.filter(a => a.type === 'spike')
                    .sort((a, b) => b.details.annualizedMileage - a.details.annualizedMileage)
                    .slice(0, 2)
                    .map((anomaly, index) => (
                    <FactorItem key={`anomaly-${index}`} borderColor={COLORS.BLACK} iconColor={COLORS.BLACK}>
                      <WarningIcon fontSize="small" />
                      <span>
                        {anomaly.details.current.formattedDate}: {anomaly.message}
                      </span>
                    </FactorItem>
                  ))}
                  {anomalies.filter(a => a.type === 'spike').length > 2 && (
                    <FactorItem borderColor={COLORS.BLACK} iconColor={COLORS.BLACK}>
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
                <FactorsHeading color={COLORS.BLUE}>
                  <InfoIcon fontSize="small" /> Detected Inactivity Periods
                </FactorsHeading>
                <FactorsList>
                  {inactivityPeriods
                    .sort((a, b) => b.days - a.days)
                    .slice(0, 2)
                    .map((period, index) => (
                    <FactorItem key={`inactivity-${index}`} borderColor={COLORS.BLUE} iconColor={COLORS.BLUE}>
                      <HistoryIcon fontSize="small" />
                      <span>
                        {period.start.formattedDate} to {period.end.formattedDate}: {period.description}
                      </span>
                    </FactorItem>
                  ))}
                  {inactivityPeriods.length > 2 && (
                    <FactorItem borderColor={COLORS.BLUE} iconColor={COLORS.BLUE}>
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
          <HeadingWithTooltip 
            tooltip={mileageTooltips.sectionRiskAssessment} 
            iconColor={
              insights.riskAssessment.riskCategory === 'Low' ? COLORS.GREEN : 
              insights.riskAssessment.riskCategory === 'Medium' ? COLORS.BLACK : 
              COLORS.RED
            }
          >
           <GovUKHeadingM>
            History Risk Assessment
            </GovUKHeadingM> 
          </HeadingWithTooltip>
          
          <MileageInsightPanel borderColor={
              insights.riskAssessment.riskCategory === 'Low' ? COLORS.GREEN : 
              insights.riskAssessment.riskCategory === 'Medium' ? COLORS.BLACK : 
              COLORS.RED
          }>
            <RiskScoreDisplay riskCategory={insights.riskAssessment.riskCategory}>
              <RiskScoreCircle riskCategory={insights.riskAssessment.riskCategory}>
                {insights.riskAssessment.riskScore}
                {/* Add icons for better accessibility */}
                {insights.riskAssessment.riskCategory === 'Low' && 
                  <CheckCircleIcon fontSize="small" style={{ position: 'absolute', right: '-10px', top: '-10px' }} />}
                {insights.riskAssessment.riskCategory === 'Medium' && 
                  <WarningIcon fontSize="small" style={{ position: 'absolute', right: '-10px', top: '-10px' }} />}
                {insights.riskAssessment.riskCategory === 'High' && 
                  <ErrorOutlineIcon fontSize="small" style={{ position: 'absolute', right: '-10px', top: '-10px' }} />}
              </RiskScoreCircle>
              <RiskScoreText>
                <RiskCategory riskCategory={insights.riskAssessment.riskCategory}>
                  {/* Add visual patterns for colour-blind users */}
                  {insights.riskAssessment.riskCategory === 'Low' && "✓ "}
                  {insights.riskAssessment.riskCategory === 'Medium' && "⚠ "}
                  {insights.riskAssessment.riskCategory === 'High' && "⛔ "}
                  {insights.riskAssessment.riskCategory} Risk
                </RiskCategory>
                <RiskDescription>
                  Based on comprehensive analysis of mileage patterns and vehicle history
                </RiskDescription>
              </RiskScoreText>
            </RiskScoreDisplay>
            
            {insights.riskAssessment.riskFactors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <FactorsHeading color={COLORS.RED}>
                  <WarningIcon fontSize="small" /> Risk Factors
                </FactorsHeading>
                <FactorsList>
                  {insights.riskAssessment.riskFactors.map((factor, index) => (
                    <FactorItem key={`risk-${index}`} borderColor={COLORS.RED} iconColor={COLORS.RED}>
                      <WarningIcon fontSize="small" />
                      <span>{factor}</span>
                    </FactorItem>
                  ))}
                </FactorsList>
              </div>
            )}
            
            {insights.riskAssessment.positiveFactors.length > 0 && (
              <div>
                <FactorsHeading color={COLORS.GREEN}>
                  <CheckCircleIcon fontSize="small" /> Positive Factors
                </FactorsHeading>
                <FactorsList>
                  {insights.riskAssessment.positiveFactors.map((factor, index) => (
                    <FactorItem key={`positive-${index}`} borderColor={COLORS.GREEN} iconColor={COLORS.GREEN}>
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
      
      <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
      
      <GovUKTooltip title="Information updated regularly with the latest UK vehicle data" arrow placement="top">
        <FooterNote style={{ borderBottom: '1px dotted #505a5f', cursor: 'help', display: 'inline-block' }}>
          Data analysis based on vehicle history and UK market trends as of March 2025
        </FooterNote>
      </GovUKTooltip>
    </MileageInsightsContainer>
  );
};

export default VehicleMileageInsights;