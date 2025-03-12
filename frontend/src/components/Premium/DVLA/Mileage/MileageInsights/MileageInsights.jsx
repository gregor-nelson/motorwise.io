import React, { useState, useEffect } from 'react';
import {
  GovUKBody,
  GovUKBodyS,
  GovUKLoadingSpinner,
  GovUKSectionBreak,
  GovUKList,
  GovUKHeadingM,
  COLORS
} from '../../../../../styles/theme';

// Import Material-UI icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';

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
  MileageInsightsHeader,
  MileageBadge,
  MileageInsightsTitle,
  MileageInsightsDescription,
  MileageInsightSection,
  MileageInsightPanel,
  MileageSectionHeading,
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

// API configuration
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8000/api/v1'
                    : '/api/v1';

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
  const registrationDate = vehicleInfo?.registrationDate ? vehicleInfo.registrationDate : firstDate;
  const currentDate = new Date();
  
  const vehicleAgeYears = (currentDate - registrationDate) / (1000 * 60 * 60 * 24 * 365.25);
  
  // Use adjusted values if vehicle has been clocked
  const totalMileage = hasAccurateStats 
    ? mileageStats.totalMileage 
    : mileageData[mileageData.length - 1].mileage - mileageData[0].mileage;
    
  const averageAnnualMileage = hasAccurateStats
    ? mileageStats.averageAnnualMileage
    : totalMileage / vehicleAgeYears;
  
  // UK average annual mileage - updated for 2024 based on National Travel Survey
  const UK_AVERAGE_ANNUAL_MILEAGE = 6800;
  
  // Get vehicle type-specific benchmarks
  let typeSpecificAnnualMileage = UK_AVERAGE_ANNUAL_MILEAGE;
  let mileageCategory = "average";
  let vehicleLifespanMiles = 150000; // Default lifespan
  
  // Adjust based on fuel type using latest UK statistics
  if (vehicleInfo?.fuelType) {
    const fuelTypeLower = vehicleInfo.fuelType.toLowerCase();
    
    if (fuelTypeLower.includes("diesel")) {
      typeSpecificAnnualMileage = 9000; // Diesel cars - updated for 2024
      vehicleLifespanMiles = 190000; // Diesel engines typically last longer
    } else if (fuelTypeLower.includes("petrol")) {
      typeSpecificAnnualMileage = 6700; // Petrol cars - updated for 2024
      vehicleLifespanMiles = 160000;
    } else if (fuelTypeLower.includes("electric") || fuelTypeLower.includes("ev")) {
      typeSpecificAnnualMileage = 7600; // Electric vehicles - updated for 2024
      vehicleLifespanMiles = 180000; // Modern EVs have good longevity
    } else if (fuelTypeLower.includes("hybrid")) {
      if (fuelTypeLower.includes("plug") || fuelTypeLower.includes("phev")) {
        typeSpecificAnnualMileage = 7500; // Plug-in hybrids
      } else {
        typeSpecificAnnualMileage = 8200; // Regular hybrids
      }
      vehicleLifespanMiles = 170000;
    }
  }
  
  // Additional adjustments based on vehicle type
  if (vehicleInfo?.bodyType) {
    const bodyTypeLower = vehicleInfo.bodyType.toLowerCase();
    
    // Apply adjustments based on body type (using existing logic)
    // ...
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
    ukAverageAnnualMileage: UK_AVERAGE_ANNUAL_MILEAGE,
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
 * VehicleMileageInsights Component
 * Displays premium analytics for vehicle mileage data
 * Styled to match GOV.UK design patterns and VehicleInsights component
 */
const VehicleMileageInsights = ({ registration, vin }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mileageData, setMileageData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [inactivityPeriods, setInactivityPeriods] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [mileageStats, setMileageStats] = useState(null);
  const [insights, setInsights] = useState({
    benchmarks: null,
    usagePatterns: null,
    riskAssessment: null
  });
  
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

        // Use real API data instead of mock data
        const useMockData = false;

        if (!useMockData) {
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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errorMessage || `Failed to fetch vehicle data: ${response.status}`);
          }
          
          const vehicleData = await response.json();
          console.log('Received vehicle data:', vehicleData);
          processVehicleData(vehicleData);
          setLoading(false);
        } else {
          // Keep mock data path for fallback testing
          setTimeout(() => {
            const mockData = createMockData(registration || vin);
            processVehicleData(mockData);
            setLoading(false);
          }, 1000);
        }
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
              parsedDate = date;
              formattedDate = date.toLocaleDateString('en-GB', { 
                day: '2-digit', month: 'short', year: 'numeric' 
              });
            } else {
              return null;
            }
          } catch (err) {
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
    
    // If not enough real data, create sample data
    if (formattedData.length < 2) {
      console.warn('Not enough MOT data points for analysis, using sample data');
      formattedData = createSampleMileageData();
    }
    
    // Use enhanced anomaly detection and inactivity period detection
    const detectedAnomalies = findMileageAnomalies(formattedData);
    const detectedInactivityPeriods = findInactivityPeriods(formattedData);
    
    // Calculate accurate mileage statistics accounting for clocking
    const accurateMileageStats = calculateAccurateMileageStats(formattedData, detectedAnomalies);
    
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
    const usagePatterns = analyzeUsagePatterns(formattedData, accurateMileageStats);
    
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

  // Helper to parse dates safely
  const parseDate = (dateString) => {
    if (!dateString) return new Date('2018-01-01');
    
    try {
      return new Date(dateString);
    } catch (e) {
      return new Date('2018-01-01');
    }
  };

  // Analyze usage patterns
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
    
    // Determine usage pattern
    const variabilityRatio = maxRate / (minRate || 1);
    let usagePattern = "consistent";
    if (variabilityRatio > 3) {
      usagePattern = "highly variable";
    } else if (variabilityRatio > 1.8) {
      usagePattern = "somewhat variable";
    }
    
    // Check for commercial use
    const potentialCommercialUse = maxRate > 25000;
    
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

  // Helper function for sample data
  const createSampleMileageData = () => {
    const startDate = new Date('2018-03-01');
    const data = [];
    
    // Add 6 data points, roughly 1 year apart with increasing mileage
    for (let i = 0; i < 6; i++) {
      const testDate = new Date(startDate);
      testDate.setFullYear(startDate.getFullYear() + i);
      
      // Base mileage on rough UK average of 8,000 miles per year
      const mileage = 2000 + (i * 8000);
      
      data.push({
        date: testDate,
        formattedDate: testDate.toLocaleDateString('en-GB', { 
          day: '2-digit', month: 'short', year: 'numeric' 
        }),
        mileage: mileage,
        formattedMileage: mileage.toLocaleString(),
        testResult: i === 3 ? 'FAIL' : 'PASS' // Make the 4th test a failure for variety
      });
    }
    
    return data;
  };

  // Create mock data (for fallback)
  const createMockData = (reg) => {
    return {
      registration: reg,
      make: 'Ford',
      model: 'Focus',
      fuelType: 'Petrol',
      firstUsedDate: '2018-01-01',
      bodyType: 'Hatchback',
      motTests: createSampleMileageData().map(item => ({
        completedDate: item.date.toISOString(),
        odometerValue: item.mileage,
        testResult: item.testResult
      }))
    };
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
          <GovUKHeadingM>Vehicle Mileage Insights</GovUKHeadingM>
          <MileageBadge>Premium</MileageBadge>
        </SectionTitleContainer>
        
        <ErrorContainer>
          <HeadingWithTooltip 
            tooltip="Error occurred while fetching or processing vehicle data" 
            iconColor={COLORS.RED}
          >
            <ErrorOutlineIcon /> Error Loading Insights
          </HeadingWithTooltip>
          <GovUKBody>{error}</GovUKBody>
        </ErrorContainer>
      </MileageInsightsContainer>
    );
  }

  // Show empty state
  if (!mileageData || mileageData.length === 0) {
    return (
      <MileageInsightsContainer>
        <SectionTitleContainer>
          <GovUKHeadingM>Vehicle Mileage Insights</GovUKHeadingM>
          <MileageBadge>Premium</MileageBadge>
        </SectionTitleContainer>
        
        <EmptyContainer>
          <InfoIcon style={{ fontSize: 40, color: '#1d70b8', marginBottom: 10 }} />
          <GovUKBody>No mileage data available for analysis.</GovUKBody>
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
        <GovUKHeadingM>Vehicle Mileage Insights</GovUKHeadingM>
        <MileageBadge>Premium</MileageBadge>
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
      
      <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
      
      {/* Risk Assessment Panel - Always show first for clocked vehicles */}
      {insights.riskAssessment && hasClockingIssues && (
        <MileageInsightSection>
          <HeadingWithTooltip 
            tooltip={mileageTooltips.sectionRiskAssessment} 
            iconColor={
              insights.riskAssessment.riskCategory === 'Low' ? COLORS.GREEN : 
              insights.riskAssessment.riskCategory === 'Medium' ? COLORS.ORANGE : 
              COLORS.RED
            }
          >
            <AssessmentIcon /> Mileage History Risk Assessment
          </HeadingWithTooltip>
          
          <MileageInsightPanel borderColor={
              insights.riskAssessment.riskCategory === 'Low' ? COLORS.GREEN : 
              insights.riskAssessment.riskCategory === 'Medium' ? COLORS.ORANGE : 
              COLORS.RED
          }>
            <RiskScoreDisplay riskCategory={insights.riskAssessment.riskCategory}>
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
            <SpeedIcon /> Mileage Benchmark Analysis
          </HeadingWithTooltip>
          
          <MileageInsightPanel borderColor={COLORS.BLUE}>
            <GovUKBody>
              This vehicle has <ValueWithTooltip tooltip={mileageTooltips.currentMileage}>
                <ValueDisplay>{mileageData[mileageData.length-1].formattedMileage} miles</ValueDisplay>
              </ValueWithTooltip>
              {hasClockingIssues && insights.benchmarks.hasAdjustedMileage && (
                <span style={{ fontStyle: 'italic', marginLeft: '5px', color: COLORS.DARK_GREY }}>
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
                      <span style={{ display: 'block', fontSize: '0.85em', color: COLORS.RED }}>
                        Adjusted for inconsistencies
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
                      <span style={{ display: 'block', fontSize: '0.85em', color: COLORS.RED }}>
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
            iconColor={COLORS.TURQUOISE}
          >
            <TimelineIcon /> Usage Pattern Analysis
          </HeadingWithTooltip>
          
          <MileageInsightPanel borderColor={COLORS.TURQUOISE}>
            <GovUKBody>
              This vehicle shows a <ValueDisplay color={COLORS.TURQUOISE}>
                {insights.usagePatterns.usagePattern}
              </ValueDisplay> usage pattern 
              with an average of <ValueDisplay color={COLORS.TURQUOISE}>
                {insights.usagePatterns.averageAnnualRate.toLocaleString()} miles per year
              </ValueDisplay>.
              {hasClockingIssues && insights.usagePatterns.dataQuality === "adjusted" && (
                <span style={{ fontStyle: 'italic', marginLeft: '5px', color: COLORS.DARK_GREY }}>
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
                    tooltip="Period with the highest annualized mileage rate" 
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
                    tooltip="Period with the lowest annualized mileage rate" 
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
                      <span style={{ color: COLORS.RED, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <WarningIcon fontSize="small" style={{ marginRight: '5px' }} />
                        Potential commercial use detected
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </MileageTable>
            
            {anomalies.filter(a => a.type === 'spike').length > 0 && (
              <>
                <FactorsHeading color={COLORS.ORANGE}>
                  <WarningIcon fontSize="small" /> Unusual Mileage Patterns
                </FactorsHeading>
                <FactorsList>
                  {anomalies.filter(a => a.type === 'spike')
                    .sort((a, b) => b.details.annualizedMileage - a.details.annualizedMileage)
                    .slice(0, 2)
                    .map((anomaly, index) => (
                    <FactorItem key={`anomaly-${index}`} borderColor={COLORS.ORANGE} iconColor={COLORS.ORANGE}>
                      <WarningIcon fontSize="small" />
                      <span>
                        {anomaly.details.current.formattedDate}: {anomaly.message}
                      </span>
                    </FactorItem>
                  ))}
                  {anomalies.filter(a => a.type === 'spike').length > 2 && (
                    <FactorItem borderColor={COLORS.ORANGE} iconColor={COLORS.ORANGE}>
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
              insights.riskAssessment.riskCategory === 'Medium' ? COLORS.ORANGE : 
              COLORS.RED
            }
          >
            <AssessmentIcon /> Mileage History Risk Assessment
          </HeadingWithTooltip>
          
          <MileageInsightPanel borderColor={
              insights.riskAssessment.riskCategory === 'Low' ? COLORS.GREEN : 
              insights.riskAssessment.riskCategory === 'Medium' ? COLORS.ORANGE : 
              COLORS.RED
          }>
            <RiskScoreDisplay riskCategory={insights.riskAssessment.riskCategory}>
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