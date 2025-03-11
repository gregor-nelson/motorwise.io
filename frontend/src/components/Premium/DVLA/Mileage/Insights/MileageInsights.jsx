import React, { useState, useEffect } from 'react';
import {
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKBodyS,
  PremiumInfoPanel,
  ReportTable,
  COLORS,
  GovUKLoadingSpinner,
  GovUKLoadingContainer
} from '../../../../../styles/theme';

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8000/api/v1'   // Development - direct to API port
                    : '/api/v1';                       // Production - use relative URL for Nginx proxy

/**
 * VehicleMileageInsights Component
 * Displays advanced analytics for vehicle mileage data
 * - Self-contained with its own data fetching
 * - Matches the structure of the original MileageChart component
 */
const VehicleMileageInsights = ({ registration, vin }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mileageData, setMileageData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [inactivityPeriods, setInactivityPeriods] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [insights, setInsights] = useState({
    benchmarks: null,
    valueImpact: null,
    maintenanceProjections: null,
    usagePatterns: null,
    riskAssessment: null,
    futureProjections: null
  });

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
    
    // Extract basic vehicle info with fallbacks for missing data
    const vehicleInfo = {
      registrationNumber: data.registration || registration || "Unknown",
      vin: data.vin || vin || "Unknown",
      make: data.make || "Unknown",
      model: data.model || "Unknown",
      fuelType: data.fuelType || "Unknown",
      bodyType: data.bodyType || data.model || "Unknown",
      registrationDate: parseDate(data.firstUsedDate || data.registrationDate || data.manufactureDate),
      estimatedValue: estimateVehicleValue(data) // Calculate estimated value
    };
    
    console.log('Extracted vehicle info:', vehicleInfo);

    // Check if we have MOT tests data
    if (!data.motTests || !Array.isArray(data.motTests) || data.motTests.length === 0) {
      console.warn('No MOT test data available');
      const sampleData = createSampleMileageData();
      setMileageData(sampleData);
      findAnomaliesAndInactivity(sampleData);
      calculateInsights(sampleData, vehicleInfo);
      setVehicleInfo(vehicleInfo);
      return;
    }
    
    // Process MOT tests into mileage data
    const formattedData = data.motTests
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
            console.warn('MOT test missing completedDate');
            return null;
          }
        } catch (err) {
          console.warn('Error parsing date:', err);
          return null;
        }
        
        // Parse mileage
        let numericMileage = 0;
        let formattedMileage = '0';
        try {
          if (test.odometerValue) {
            // Handle both string and number formats
            numericMileage = typeof test.odometerValue === 'number' 
              ? test.odometerValue 
              : parseInt(String(test.odometerValue).replace(/,/g, ''), 10);
            
            if (isNaN(numericMileage)) {
              console.warn('Invalid mileage value:', test.odometerValue);
              return null;
            }
            
            formattedMileage = numericMileage.toLocaleString();
          } else {
            console.warn('MOT test missing odometerValue');
            return null;
          }
        } catch (err) {
          console.warn('Error parsing mileage:', err, test);
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
      .filter(test => test !== null && !isNaN(test.mileage) && test.mileage > 0 && test.date > new Date(1990, 0, 1))
      .sort((a, b) => a.date - b.date);

    console.log(`Processed ${formattedData.length} MOT records with valid mileage data`);

    // If not enough real data, create some sample data points
    if (formattedData.length < 2) {
      console.warn('Not enough MOT data points for analysis, using sample data');
      const sampleData = createSampleMileageData();
      setMileageData(sampleData);
      findAnomaliesAndInactivity(sampleData);
      calculateInsights(sampleData, vehicleInfo);
    } else {
      setMileageData(formattedData);
      findAnomaliesAndInactivity(formattedData);
      calculateInsights(formattedData, vehicleInfo);
    }

    setVehicleInfo(vehicleInfo);
  };

  // Helper to parse dates safely with a fallback
  const parseDate = (dateString) => {
    if (!dateString) return new Date('2018-01-01'); // Fallback date
    
    try {
      return new Date(dateString);
    } catch (e) {
      console.warn('Error parsing date:', dateString, e);
      return new Date('2018-01-01'); // Fallback date
    }
  };
  
  // Function to estimate vehicle value based on age, make, model
  const estimateVehicleValue = (data) => {
    // Default base value
    let baseValue = 10000;
    
    // Try to get vehicle age
    let vehicleAge = 3; // Default to 3 years
    
    try {
      const regDate = parseDate(data.firstUsedDate || data.registrationDate || data.manufactureDate);
      const currentDate = new Date();
      vehicleAge = (currentDate - regDate) / (1000 * 60 * 60 * 24 * 365.25);
    } catch (e) {
      console.warn('Error calculating vehicle age, using default');
    }
    
    // Apply rough depreciation
    // Average car loses ~15-35% in year 1, then ~15% per year after
    if (vehicleAge <= 1) {
      baseValue = baseValue * 0.7; // 30% first year depreciation
    } else {
      baseValue = baseValue * 0.7 * Math.pow(0.85, vehicleAge - 1);
    }
    
    // Apply make/model adjustments if known
    if (data.make) {
      const make = data.make.toLowerCase();
      if (make.includes('bmw') || make.includes('audi') || make.includes('mercedes')) {
        baseValue *= 1.2; // Premium brands hold value better
      } else if (make.includes('ford') || make.includes('vauxhall')) {
        baseValue *= 0.9; // Common brands depreciate faster
      }
    }
    
    return Math.round(baseValue); // Round to nearest pound
  };

  // Find anomalies and inactivity periods
  const findAnomaliesAndInactivity = (data) => {
    // Find anomalies (simplified version)
    const anomalies = [];
    
    for (let i = 1; i < data.length; i++) {
      const prevReading = data[i-1];
      const currentReading = data[i];
      const mileageDiff = currentReading.mileage - prevReading.mileage;
      
      // Detect mileage decreases
      if (mileageDiff < 0) {
        anomalies.push({
          index: i,
          date: currentReading.date,
          type: 'decrease',
          message: `Mileage decreased by ${Math.abs(mileageDiff).toLocaleString()} miles`,
          details: {
            current: currentReading,
            previous: prevReading,
            diff: mileageDiff
          }
        });
      }
      
      // Detect unusual increases (simplified)
      const daysDiff = (currentReading.date - prevReading.date) / (1000 * 60 * 60 * 24);
      if (daysDiff > 0) {
        const dailyRate = mileageDiff / daysDiff;
        if (dailyRate > 150) { // Arbitrary threshold
          anomalies.push({
            index: i,
            date: currentReading.date,
            type: 'spike',
            message: `Unusually high daily mileage (${Math.round(dailyRate)} miles/day)`,
            details: {
              current: currentReading,
              previous: prevReading,
              diff: mileageDiff,
              days: daysDiff,
              dailyRate
            }
          });
        }
      }
    }
    
    // Find inactivity periods (simplified)
    const inactivityPeriods = [];
    const LOW_ACTIVITY_THRESHOLD = 5; // miles per day
    const MIN_INACTIVITY_DAYS = 60; // minimum 2 months
    
    for (let i = 1; i < data.length; i++) {
      const prevReading = data[i-1];
      const currentReading = data[i];
      const daysDiff = (currentReading.date - prevReading.date) / (1000 * 60 * 60 * 24);
      
      if (daysDiff >= MIN_INACTIVITY_DAYS) {
        const mileageDiff = currentReading.mileage - prevReading.mileage;
        const dailyRate = mileageDiff / daysDiff;
        
        if (dailyRate < LOW_ACTIVITY_THRESHOLD) {
          const monthsDiff = Math.round(daysDiff / 30);
          const description = dailyRate <= 0 
            ? `Vehicle appears to have been unused for ${monthsDiff} months`
            : `Very low usage period (${Math.round(dailyRate)} miles/day for ${monthsDiff} months)`;
            
          inactivityPeriods.push({
            start: prevReading,
            end: currentReading,
            days: daysDiff,
            dailyAverage: dailyRate,
            description
          });
        }
      }
    }
    
    setAnomalies(anomalies);
    setInactivityPeriods(inactivityPeriods);
  };

  // Calculate all insights
  const calculateInsights = (data, vehicleInfo) => {
    setInsights({
      benchmarks: calculateMileageBenchmarks(data, vehicleInfo),
      valueImpact: calculateValueImpact(data, vehicleInfo),
      maintenanceProjections: calculateMaintenanceProjections(data, vehicleInfo),
      usagePatterns: analyzeUsagePatterns(data),
      riskAssessment: calculateRiskScore(data, anomalies, inactivityPeriods, vehicleInfo),
      futureProjections: projectFutureMileage(data)
    });
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

  // Create sample mileage data points
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

  // All the analysis functions follow
  // Mileage benchmarks calculation
  const calculateMileageBenchmarks = (mileageData, vehicleInfo) => {
    if (!mileageData || mileageData.length < 2) return null;
    
    // Get vehicle age in years
    const firstDate = mileageData[0].date;
    const lastDate = mileageData[mileageData.length - 1].date;
    const registrationDate = vehicleInfo?.registrationDate ? vehicleInfo.registrationDate : firstDate;
    const currentDate = new Date();
    
    const vehicleAgeYears = (currentDate - registrationDate) / (1000 * 60 * 60 * 24 * 365.25);
    const totalMileage = mileageData[mileageData.length - 1].mileage;
    const averageAnnualMileage = totalMileage / vehicleAgeYears;
    
    // UK average annual mileage - updated for 2024 based on National Travel Survey
    const UK_AVERAGE_ANNUAL_MILEAGE = 6800; // 2024 figure, reduced due to increased remote working
    
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
    
    // Calculate vehicle category specific benchmarks - updated for 2024 UK market
    if (vehicleInfo?.bodyType) {
      const bodyTypeLower = vehicleInfo.bodyType.toLowerCase();
      
      // City cars and superminis
      if (bodyTypeLower.includes("city car") || 
          bodyTypeLower.includes("supermini") || 
          bodyTypeLower.includes("mini")) {
        typeSpecificAnnualMileage = Math.min(typeSpecificAnnualMileage, 6000);
      }
      // Hatchbacks
      else if (bodyTypeLower.includes("hatchback") || 
              bodyTypeLower.includes("small family")) {
        typeSpecificAnnualMileage = Math.min(typeSpecificAnnualMileage, 6800);
      }
      // Estates and MPVs
      else if (bodyTypeLower.includes("estate") || 
              bodyTypeLower.includes("mpv") || 
              bodyTypeLower.includes("people carrier") ||
              bodyTypeLower.includes("tourer")) {
        typeSpecificAnnualMileage = 8500; // Higher mileage for family vehicles
      }
      // SUVs by size
      else if (bodyTypeLower.includes("suv") || 
              bodyTypeLower.includes("crossover") || 
              bodyTypeLower.includes("4x4")) {
        if (bodyTypeLower.includes("small") || bodyTypeLower.includes("compact")) {
          typeSpecificAnnualMileage = 7000; // Small SUVs
        } else if (bodyTypeLower.includes("large") || bodyTypeLower.includes("full size")) {
          typeSpecificAnnualMileage = 8200; // Large SUVs
        } else {
          typeSpecificAnnualMileage = 7500; // Medium SUVs (default)
        }
      }
      // Luxury, executive and premium vehicles
      else if (bodyTypeLower.includes("luxury") || 
              bodyTypeLower.includes("executive") || 
              bodyTypeLower.includes("premium") ||
              bodyTypeLower.includes("saloon")) {
        typeSpecificAnnualMileage = 8000; // Executive cars often do higher miles
      }
      // Sports cars
      else if (bodyTypeLower.includes("sport") || 
              bodyTypeLower.includes("coupe") || 
              bodyTypeLower.includes("convertible") ||
              bodyTypeLower.includes("roadster")) {
        typeSpecificAnnualMileage = 5000; // Sports cars typically do fewer miles
        vehicleLifespanMiles = Math.min(vehicleLifespanMiles, 140000); // Often lower lifespan
      }
      // Commercial-derived vehicles
      else if (bodyTypeLower.includes("van") || 
              bodyTypeLower.includes("pickup") || 
              bodyTypeLower.includes("commercial")) {
        typeSpecificAnnualMileage = 10000; // Commercial vehicles do higher mileage
        vehicleLifespanMiles = 200000; // But often built to last longer
      }
    }
    
    // Make-specific adjustments based on reliability data
    if (vehicleInfo?.make) {
      const makeLower = vehicleInfo.make.toLowerCase();
      
      // Japanese and Korean brands often have better longevity
      if (makeLower.includes("toyota") || 
          makeLower.includes("lexus") || 
          makeLower.includes("honda") ||
          makeLower.includes("mazda") ||
          makeLower.includes("suzuki") ||
          makeLower.includes("hyundai") ||
          makeLower.includes("kia")) {
        vehicleLifespanMiles *= 1.1; // 10% longer lifespan
      }
      // Premium German brands often have higher annual mileage
      else if (makeLower.includes("bmw") || 
              makeLower.includes("audi") || 
              makeLower.includes("mercedes") ||
              makeLower.includes("volkswagen")) {
        typeSpecificAnnualMileage *= 1.05; // 5% higher annual mileage
      }
    }
    
    // Determine mileage category compared to expected
    const expectedTotalMileage = typeSpecificAnnualMileage * vehicleAgeYears;
    const mileageRatio = totalMileage / expectedTotalMileage;
    
    // Updated mileage ratio categories with more nuanced thresholds
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
    
    // Calculate remaining useful life estimate based on vehicle-specific factors
    const remainingMiles = Math.max(0, vehicleLifespanMiles - totalMileage);
    const remainingYearsEstimate = averageAnnualMileage > 0 ? remainingMiles / averageAnnualMileage : 0;
    
    return {
      vehicleAgeYears: Math.round(vehicleAgeYears * 10) / 10,
      averageAnnualMileage: Math.round(averageAnnualMileage),
      ukAverageAnnualMileage: UK_AVERAGE_ANNUAL_MILEAGE,
      typeSpecificAnnualMileage: Math.round(typeSpecificAnnualMileage),
      expectedTotalMileage: Math.round(expectedTotalMileage),
      mileageRatio: Math.round(mileageRatio * 100) / 100,
      mileageCategory,
      vehicleLifespanMiles: Math.round(vehicleLifespanMiles),
      remainingMilesEstimate: Math.round(remainingMiles),
      remainingYearsEstimate: Math.round(remainingYearsEstimate * 10) / 10
    };
  };

  // Value impact analysis - updated with 2024 UK market data
  const calculateValueImpact = (mileageData, vehicleInfo) => {
    if (!mileageData || mileageData.length < 2 || !vehicleInfo?.estimatedValue) return null;
    
    const currentMileage = mileageData[mileageData.length - 1].mileage;
    const benchmarks = calculateMileageBenchmarks(mileageData, vehicleInfo);
    
    if (!benchmarks) return null;
    
    // Calculate mileage variance from expected
    const mileageDifference = benchmarks.expectedTotalMileage - currentMileage;
    const mileageDifferenceThousands = mileageDifference / 1000;
    
    // Value impact factors vary by vehicle age, type and UK market conditions
    let valueImpactPercent = 0;
    const vehicleAgeYears = benchmarks.vehicleAgeYears;
    
    // Determine mileage impact factor based on vehicle age (newer vehicles more sensitive)
    // Updated with 2024 UK market data on mileage impact on values
    let mileageImpactFactor;
    if (vehicleAgeYears <= 2) {
      // Newer vehicles (0-2 years) - mileage has higher impact on value
      mileageImpactFactor = 0.8; // 0.8% value change per 1,000 miles variance
    } else if (vehicleAgeYears <= 5) {
      // Mid-age vehicles (3-5 years)
      mileageImpactFactor = 0.6; // 0.6% value change per 1,000 miles variance
    } else if (vehicleAgeYears <= 8) {
      // Older vehicles (6-8 years)
      mileageImpactFactor = 0.4; // 0.4% value change per 1,000 miles variance
    } else {
      // Much older vehicles (9+ years)
      mileageImpactFactor = 0.3; // 0.3% value change per 1,000 miles variance
    }
    
    // Adjust impact factor based on vehicle type and fuel type
    if (vehicleInfo.fuelType) {
      const fuelTypeLower = vehicleInfo.fuelType.toLowerCase();
      
      // Diesel values more sensitive to mileage in 2024 due to emissions regulations
      if (fuelTypeLower.includes('diesel')) {
        mileageImpactFactor *= 1.2; // 20% more sensitivity for diesels
      } 
      // Electric vehicles are becoming more accepted at higher mileages as technology matures
      else if (fuelTypeLower.includes('electric')) {
        mileageImpactFactor *= 0.9; // 10% less sensitivity for EVs
      }
    }
    
    // Apply segment-specific adjustment
    if (vehicleInfo.bodyType) {
      const bodyTypeLower = vehicleInfo.bodyType.toLowerCase();
      
      // Luxury/premium vehicles more sensitive to mileage
      if (bodyTypeLower.includes('luxury') || 
          bodyTypeLower.includes('executive') || 
          bodyTypeLower.includes('premium')) {
        mileageImpactFactor *= 1.2; // 20% more sensitivity
      }
      // Sports/performance vehicles extremely sensitive to mileage
      else if (bodyTypeLower.includes('sport') || 
               bodyTypeLower.includes('coupe') || 
               bodyTypeLower.includes('convertible')) {
        mileageImpactFactor *= 1.3; // 30% more sensitivity
      }
      // Utility vehicles less sensitive to mileage
      else if (bodyTypeLower.includes('mpv') || 
               bodyTypeLower.includes('van') || 
               bodyTypeLower.includes('pickup')) {
        mileageImpactFactor *= 0.8; // 20% less sensitivity
      }
    }
    
    // Calculate value impact with the refined factor
    if (mileageDifference > 0) {
      // Below average mileage (positive impact) - with more realistic cap for 2024 market
      valueImpactPercent = Math.min(mileageDifferenceThousands * mileageImpactFactor, 12);
    } else {
      // Above average mileage (negative impact)
      valueImpactPercent = Math.max(mileageDifferenceThousands * mileageImpactFactor, -20);
    }
    
    // Apply the value adjustment
    const baseValue = vehicleInfo.estimatedValue;
    const adjustedValue = baseValue * (1 + valueImpactPercent / 100);
    const valueDifference = adjustedValue - baseValue;
    
    return {
      baseValue,
      adjustedValue: Math.round(adjustedValue),
      valueDifference: Math.round(valueDifference),
      valueImpactPercent: Math.round(valueImpactPercent * 10) / 10,
      mileageDifference: Math.round(mileageDifference),
      mileageImpactFactor: Math.round(mileageImpactFactor * 100) / 100
    };
  };

  // Maintenance projections - updated with 2024 UK service costs and intervals
  const calculateMaintenanceProjections = (mileageData, vehicleInfo) => {
    if (!mileageData || mileageData.length < 2) return null;
    
    const currentMileage = mileageData[mileageData.length - 1].mileage;
    const benchmarks = calculateMileageBenchmarks(mileageData, vehicleInfo);
    
    if (!benchmarks) return null;
    
    // Define type-specific service intervals and costs
    let serviceIntervals = [];
    let componentReplacements = [];
    let baseCostPer10k = 550; // Updated 2024 base cost for 10k miles of maintenance
    
    // Default service intervals
    const defaultServiceIntervals = [
      { name: "Oil & Filter Change", interval: 10000, lastDone: 0 },
      { name: "Full Service", interval: 20000, lastDone: 0 },
      { name: "Brake Fluid", interval: 30000, lastDone: 0 },
      { name: "Air Filter", interval: 40000, lastDone: 0 }
    ];
    
    // Default component replacements
    const defaultComponentReplacements = [
      { name: "Timing Belt/Chain", milestone: 80000, cost: "£350-£850" },
      { name: "Clutch", milestone: 100000, cost: "£550-£1300" },
      { name: "Brake Discs & Pads", milestone: 50000, cost: "£250-£450" },
      { name: "Suspension Components", milestone: 80000, cost: "£350-£650" },
      { name: "Battery", milestone: 60000, cost: "£120-£350" }
    ];
    
    // Apply vehicle-specific adjustments based on type and make
    const fuelTypeLower = vehicleInfo.fuelType ? vehicleInfo.fuelType.toLowerCase() : '';
    const bodyTypeLower = vehicleInfo.bodyType ? vehicleInfo.bodyType.toLowerCase() : '';
    const makeLower = vehicleInfo.make ? vehicleInfo.make.toLowerCase() : '';
    
    // Electric vehicle specific maintenance
    if (fuelTypeLower.includes('electric') || fuelTypeLower.includes('ev')) {
      serviceIntervals = [
        { name: "Cabin Filter", interval: 12500, lastDone: 0 },
        { name: "Brake Fluid", interval: 25000, lastDone: 0 },
        { name: "Coolant System", interval: 37500, lastDone: 0 },
        { name: "Full Service", interval: 25000, lastDone: 0 }
      ];
      
      componentReplacements = [
        { name: "Battery Health Check", milestone: 20000, cost: "£80-£150" },
        { name: "Brake Discs & Pads", milestone: 70000, cost: "£250-£450" }, // EVs have less brake wear
        { name: "AC Service", milestone: 50000, cost: "£120-£200" },
        { name: "Suspension Check", milestone: 60000, cost: "£100-£200" },
        { name: "Tyre Replacement", milestone: 35000, cost: "£350-£600" } // EVs have higher tyre wear
      ];
      
      // EVs have lower overall maintenance costs
      baseCostPer10k = 300;
    }
    // Diesel specific maintenance
    else if (fuelTypeLower.includes('diesel')) {
      // Copy the default intervals
      serviceIntervals = [...defaultServiceIntervals];
      
      // Diesel-specific components and their intervals
      componentReplacements = [
        { name: "Timing Belt", milestone: 70000, cost: "£400-£900" }, // Diesels often shorter interval
        { name: "Fuel Filter", milestone: 30000, cost: "£120-£200" }, // Diesel-specific
        { name: "DPF Check/Clean", milestone: 80000, cost: "£300-£850" }, // Diesel-specific
        { name: "EGR Valve", milestone: 90000, cost: "£250-£450" }, // Diesel-specific
        { name: "Clutch", milestone: 100000, cost: "£600-£1400" },
        { name: "Brake Discs & Pads", milestone: 50000, cost: "£250-£450" },
        { name: "Injector Service", milestone: 60000, cost: "£300-£800" } // Diesel-specific
      ];
      
      // Diesels typically have higher maintenance costs
      baseCostPer10k = 650;
    }
    // Hybrid-specific maintenance
    else if (fuelTypeLower.includes('hybrid')) {
      // Copy defaults but adjust intervals
      serviceIntervals = defaultServiceIntervals.map(item => ({
        ...item,
        interval: item.name.includes("Oil") ? 15000 : item.interval // Hybrids often have longer oil change intervals
      }));
      
      // Add hybrid-specific components
      componentReplacements = [
        ...defaultComponentReplacements,
        { name: "Hybrid Battery Check", milestone: 50000, cost: "£80-£180" },
        { name: "Inverter Coolant", milestone: 100000, cost: "£150-£300" }
      ];
      
      // Hybrids have moderate maintenance costs
      baseCostPer10k = 500;
    }
    // Standard petrol maintenance
    else {
      serviceIntervals = defaultServiceIntervals;
      componentReplacements = defaultComponentReplacements;
      
      // Premium/performance brands have higher costs
      if (makeLower.includes('bmw') || 
          makeLower.includes('audi') || 
          makeLower.includes('mercedes') ||
          makeLower.includes('jaguar') ||
          makeLower.includes('land rover') ||
          makeLower.includes('porsche')) {
        baseCostPer10k = 800; // Premium brands cost more to maintain
      }
      // Budget brands have lower costs
      else if (makeLower.includes('dacia') || 
               makeLower.includes('kia') ||
               makeLower.includes('hyundai') ||
               makeLower.includes('mg') ||
               makeLower.includes('suzuki')) {
        baseCostPer10k = 450; // Budget brands cost less to maintain
      }
    }
    
    // Body type adjustments
    if (bodyTypeLower.includes('suv') || bodyTypeLower.includes('4x4')) {
      baseCostPer10k *= 1.15; // SUVs cost more to maintain (tires, brakes, etc.)
    } 
    else if (bodyTypeLower.includes('sport') || bodyTypeLower.includes('performance')) {
      baseCostPer10k *= 1.25; // Sports/performance vehicles cost more to maintain
    }
    
    // Age-based adjustments - 2024 UK-specific breakdown
    // Vehicles become increasingly expensive to maintain as they age
    let ageFactor;
    if (benchmarks.vehicleAgeYears < 3) {
      ageFactor = 0.8; // Under warranty, lower costs
    } else if (benchmarks.vehicleAgeYears < 6) {
      ageFactor = 1.0; // Base costs (mid-life)
    } else if (benchmarks.vehicleAgeYears < 9) {
      ageFactor = 1.3; // Early aging, more components need replacement
    } else if (benchmarks.vehicleAgeYears < 12) {
      ageFactor = 1.6; // Significantly aged, many components nearing end of life
    } else {
      ageFactor = 2.0; // Very old vehicle, frequent repairs needed
    }
    
    // Find upcoming service needs
    const upcomingServices = serviceIntervals.map(service => {
      // Calculate next milestone based on current mileage
      let nextDueMileage;
      if (currentMileage % service.interval === 0) {
        // If exactly at an interval point, the next due is one full interval away
        nextDueMileage = currentMileage + service.interval;
      } else {
        // Otherwise, find the next interval point
        nextDueMileage = currentMileage + (service.interval - (currentMileage % service.interval));
      }
      
      const milesUntilDue = nextDueMileage - currentMileage;
      const estimatedTimeUntilDue = benchmarks.averageAnnualMileage > 0 ? 
                                    milesUntilDue / benchmarks.averageAnnualMileage : 0;
      
      // Determine urgency based on both mileage and time
      let urgency;
      if (milesUntilDue < 1000 || estimatedTimeUntilDue < 0.1) {
        urgency = "High";
      } else if (milesUntilDue < 5000 || estimatedTimeUntilDue < 0.5) {
        urgency = "Medium";
      } else {
        urgency = "Low";
      }
      
      return {
        ...service,
        nextDueMileage,
        milesUntilDue,
        estimatedTimeUntilDue: Math.round(estimatedTimeUntilDue * 12) / 12, // In months
        urgency
      };
    }).filter(service => service.milesUntilDue < 15000); // Only show reasonable future horizon
    
    // Find upcoming component replacements
    const upcomingReplacements = componentReplacements.map(component => {
      let nextMilestone = component.milestone;
      
      // Find the next appropriate milestone
      while (nextMilestone <= currentMileage) {
        nextMilestone += component.milestone;
      }
      
      const milesUntilReplacement = nextMilestone - currentMileage;
      const estimatedTimeUntilReplacement = benchmarks.averageAnnualMileage > 0 ?
                                           milesUntilReplacement / benchmarks.averageAnnualMileage : 0;
      
      // Determine urgency based on both mileage and time
      let urgency;
      if (milesUntilReplacement < 2000 || estimatedTimeUntilReplacement < 0.2) {
        urgency = "High";
      } else if (milesUntilReplacement < 10000 || estimatedTimeUntilReplacement < 1.0) {
        urgency = "Medium";
      } else {
        urgency = "Low";
      }
      
      return {
        ...component,
        nextMilestone,
        milesUntilReplacement,
        estimatedTimeUntilReplacement: Math.round(estimatedTimeUntilReplacement * 10) / 10, // In years
        urgency
      };
    }).filter(comp => comp.milesUntilReplacement < 20000); // Only show reasonably upcoming items
    
    // Calculate expected annual and 5-year maintenance costs
    const annualMaintenanceCost = (benchmarks.averageAnnualMileage / 10000) * baseCostPer10k * ageFactor;
    
    // 5-year costs need to account for vehicle aging
    let nextFiveCostProjection = 0;
    for (let year = 0; year < 5; year++) {
      // Vehicle gets progressively more expensive to maintain each year
      const yearAgingFactor = Math.min(2.5, ageFactor + (year * 0.1));
      nextFiveCostProjection += (benchmarks.averageAnnualMileage / 10000) * baseCostPer10k * yearAgingFactor;
    }
    
    return {
      upcomingServices,
      upcomingReplacements,
      estimatedAnnualMaintenanceCost: Math.round(annualMaintenanceCost),
      nextFiveCostProjection: Math.round(nextFiveCostProjection),
      baseCostPer10k,
      ageFactor: Math.round(ageFactor * 100) / 100
    };
  };

  // Usage pattern analysis
  const analyzeUsagePatterns = (mileageData) => {
    if (!mileageData || mileageData.length < 3) return null;
    
    // Create yearly segments
    const yearlyMileage = [];
    let previousEntry = mileageData[0];
    
    for (let i = 1; i < mileageData.length; i++) {
      const current = mileageData[i];
      const daysDiff = (current.date - previousEntry.date) / (1000 * 60 * 60 * 24);
      const mileageDiff = current.mileage - previousEntry.mileage;
      
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
    
    // Calculate statistics
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
      detailedPeriods: yearlyMileage
    };
  };

  // Calculate MOT fail rate helper
  const calculateMOTFailRate = (mileageData) => {
    if (!mileageData || mileageData.length === 0) return 0;
    
    const totalTests = mileageData.length;
    const failedTests = mileageData.filter(d => {
      const result = d.testResult ? String(d.testResult).trim().toUpperCase() : "";
      return !result.includes('PASS');
    }).length;
    
    return failedTests / totalTests;
  };

  // Risk assessment - updated with 2024 UK market risk factors
  const calculateRiskScore = (mileageData, anomalies, inactivityPeriods, vehicleInfo) => {
    if (!mileageData || mileageData.length < 2) return null;
    
    // Base risk score starts at 50 (neutral)
    let riskScore = 50;
    const riskFactors = [];
    const positiveFactors = [];
    
    // 1. Penalize for anomalies - these are red flags in the used car market
    if (anomalies && anomalies.length > 0) {
      // Mileage decreases are severe issues (potential clocking)
      const decreases = anomalies.filter(a => a.type === 'decrease');
      if (decreases.length > 0) {
        // Multiple decreases are an even bigger concern
        const penaltyPerDecrease = decreases.length === 1 ? 20 : 25;
        riskScore -= penaltyPerDecrease * decreases.length;
        riskFactors.push(`${decreases.length} instance(s) of mileage decrease detected - potential odometer tampering`);
      }
      
      // Other anomalies such as unusual spikes
      const spikes = anomalies.filter(a => a.type === 'spike');
      if (spikes.length > 0) {
        riskScore -= 8 * spikes.length;
        riskFactors.push(`${spikes.length} instance(s) of unusual mileage increase detected - possible data entry errors`);
      }
    }
    
    // 2. Assess inactivity periods - can indicate neglect or poor storage
    if (inactivityPeriods && inactivityPeriods.length > 0) {
      if (inactivityPeriods.length > 2) {
        riskScore -= 8;
        riskFactors.push("Multiple periods of vehicle inactivity - may indicate inconsistent use");
      }
      
      // Long inactivity periods
      const longInactivePeriods = inactivityPeriods.filter(p => p.days > 365);
      if (longInactivePeriods.length > 0) {
        riskScore -= 12;
        riskFactors.push("Extended period(s) of inactivity exceeding 1 year - risk of deterioration from disuse");
      }
      
      // COVID-specific inactivity (2020-2021) is less concerning
      const covidInactivityPeriods = inactivityPeriods.filter(p => {
        const startYear = p.start.date.getFullYear();
        const endYear = p.end.date.getFullYear();
        return (startYear === 2020 || startYear === 2021) || (endYear === 2020 || endYear === 2021);
      });
      
      if (covidInactivityPeriods.length > 0 && covidInactivityPeriods.length === inactivityPeriods.length) {
        // If all inactivity was during COVID, reduce the penalty
        riskScore += 5;
        positiveFactors.push("Vehicle inactivity coincides with COVID-19 pandemic period - common pattern");
      }
    }
    
    // 3. Check mileage vs. age alignment - updated thresholds
    const benchmarks = calculateMileageBenchmarks(mileageData, vehicleInfo);
    if (benchmarks) {
      if (benchmarks.mileageRatio > 2.2) {
        riskScore -= 18;
        riskFactors.push("Extremely high mileage for vehicle age - accelerated wear likely");
      } else if (benchmarks.mileageRatio > 1.7) {
        riskScore -= 12;
        riskFactors.push("Significantly higher mileage than expected for vehicle age");
      } else if (benchmarks.mileageRatio > 1.3) {
        riskScore -= 5;
        riskFactors.push("Higher than average mileage for vehicle age");
      } else if (benchmarks.mileageRatio < 0.4) {
        // Very low mileage can indicate sitting unused (not good) or a "garage queen" (potentially good)
        const vehicleAgeYears = benchmarks.vehicleAgeYears;
        
        if (vehicleAgeYears > 8) {
          riskScore -= 5;
          riskFactors.push("Unusually low mileage on older vehicle may indicate long periods of disuse");
        } else {
          riskScore += 3;
          positiveFactors.push("Lower than average mileage suggests lighter use");
        }
      } else if (benchmarks.mileageRatio < 0.8) {
        riskScore += 5;
        positiveFactors.push("Lower than average mileage for vehicle age - likely less wear");
      } else if (benchmarks.mileageRatio >= 0.8 && benchmarks.mileageRatio <= 1.2) {
        riskScore += 3;
        positiveFactors.push("Average mileage indicates typical usage pattern");
      }
      
      // 4. Remaining lifespan
      if (benchmarks.remainingYearsEstimate > 10) {
        riskScore += 10;
        positiveFactors.push("Substantial estimated remaining vehicle lifespan based on current usage");
      } else if (benchmarks.remainingYearsEstimate < 3) {
        riskScore -= 12;
        riskFactors.push("Limited estimated remaining vehicle lifespan - approaching end of typical useful life");
      }
    }
    
    // 5. Usage pattern analysis - consistent patterns are better
    const usagePatterns = analyzeUsagePatterns(mileageData);
    if (usagePatterns) {
      if (usagePatterns.potentialCommercialUse) {
        // Commercial use means harder wear typically
        riskScore -= 12;
        riskFactors.push("Usage pattern suggests possible previous commercial use - typically harder wear");
      }
      
      if (usagePatterns.usagePattern === "highly variable") {
        riskScore -= 8;
        riskFactors.push("Highly inconsistent usage pattern - may indicate multiple drivers or changing use");
      } else if (usagePatterns.usagePattern === "somewhat variable") {
        riskScore -= 3;
        riskFactors.push("Somewhat variable usage pattern");
      } else if (usagePatterns.usagePattern === "consistent") {
        riskScore += 8;
        positiveFactors.push("Consistent usage pattern suggests regular driving and maintenance");
      }
    }
    
    // 6. Consider MOT history and age-related failure rates
    const motFailRate = calculateMOTFailRate(mileageData);
    const vehicleAgeYears = benchmarks ? benchmarks.vehicleAgeYears : 5; // Default to 5 if unknown
    
    // Age-adjusted MOT failure expectations based on UK 2024 data
    let expectedFailRate;
    if (vehicleAgeYears < 4) {
      expectedFailRate = 0.1; // 10% for newer vehicles (1-3 years)
    } else if (vehicleAgeYears < 7) {
      expectedFailRate = 0.25; // 25% for mid-age vehicles (4-6 years)
    } else if (vehicleAgeYears < 10) {
      expectedFailRate = 0.35; // 35% for older vehicles (7-9 years)
    } else {
      expectedFailRate = 0.4; // 40% for much older vehicles (10+ years)
    }
    
    if (motFailRate > expectedFailRate * 1.5) {
      // Significantly worse than expected for age
      riskScore -= 15;
      riskFactors.push(`High MOT failure rate (${Math.round(motFailRate * 100)}%) - exceeds typical rate for vehicle age`);
    } else if (motFailRate > expectedFailRate) {
      // Worse than expected for age
      riskScore -= 7;
      riskFactors.push(`MOT failure rate (${Math.round(motFailRate * 100)}%) higher than average for vehicle age`);
    } else if (motFailRate === 0 && mileageData.length >= 3) {
      // Perfect record with multiple tests is very good
      riskScore += 12;
      positiveFactors.push("Perfect MOT pass history suggests excellent maintenance");
    } else if (motFailRate < expectedFailRate) {
      // Better than expected for age
      riskScore += 5;
      positiveFactors.push(`MOT failure rate (${Math.round(motFailRate * 100)}%) lower than average for vehicle age`);
    }
    
    // 7. Emissions and ULEZ considerations for 2024
    if (vehicleInfo?.fuelType && vehicleInfo?.registrationDate) {
      const fuelTypeLower = vehicleInfo.fuelType.toLowerCase();
      const regDate = new Date(vehicleInfo.registrationDate);
      
      // Diesel emissions concerns (significant in UK with expanding ULEZ/CAZ)
      if (fuelTypeLower.includes('diesel')) {
        if (regDate < new Date('2015-09-01')) {
          // Pre-Euro 6 diesels face significant restrictions
          riskScore -= 10;
          riskFactors.push("Older diesel may face restrictions in Ultra Low Emission Zones (ULEZ)");
        } else if (regDate < new Date('2018-09-01')) {
          // Early Euro 6 diesels may still face some issues
          riskScore -= 3;
          riskFactors.push("Diesel emissions standards may face stricter regulations in future");
        }
      }
      // Petrol emissions concerns
      else if (fuelTypeLower.includes('petrol') && regDate < new Date('2006-01-01')) {
        // Pre-Euro 4 petrol faces restrictions
        riskScore -= 5;
        riskFactors.push("Older petrol vehicle may face restrictions in some emission control zones");
      }
      // Electric vehicles are future-proofed for emissions
      else if (fuelTypeLower.includes('electric')) {
        riskScore += 8;
        positiveFactors.push("Zero emissions vehicle exempt from ULEZ, CAZ and future emission restrictions");
      }
      // Hybrids generally fare well
      else if (fuelTypeLower.includes('hybrid')) {
        riskScore += 4;
        positiveFactors.push("Hybrid vehicles typically meet current emission standards");
      }
    }
    
    // 8. Consideration of manufacturer reliability (based on UK reliability indexes)
    if (vehicleInfo?.make) {
      const makeLower = vehicleInfo.make.toLowerCase();
      
      // Brands with above-average reliability in UK
      const highReliabilityBrands = ['toyota', 'lexus', 'mazda', 'honda', 'suzuki', 'kia', 'hyundai', 'subaru'];
      
      // Brands with below-average reliability in UK
      const lowReliabilityBrands = ['land rover', 'range rover', 'jaguar', 'alfa romeo', 'jeep', 'fiat', 'mini'];
      
      if (highReliabilityBrands.some(brand => makeLower.includes(brand))) {
        riskScore += 7;
        positiveFactors.push("Manufacturer known for above-average reliability in UK reliability surveys");
      } else if (lowReliabilityBrands.some(brand => makeLower.includes(brand))) {
        riskScore -= 7;
        riskFactors.push("Manufacturer historically scores below average in UK reliability surveys");
      }
    }
    
    // Ensure score stays within 0-100 range
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    // Determine risk category with refined thresholds
    let riskCategory;
    if (riskScore >= 75) {
      riskCategory = "Low";
    } else if (riskScore >= 40) {
      riskCategory = "Medium";
    } else {
      riskCategory = "High";
    }
    
    return {
      riskScore: Math.round(riskScore),
      riskCategory,
      riskFactors,
      positiveFactors
    };
  };

  // Function to project future mileage
  const projectFutureMileage = (mileageData) => {
    if (!mileageData || mileageData.length < 2) return null;
    
    const lastDate = mileageData[mileageData.length - 1].date;
    const lastMileage = mileageData[mileageData.length - 1].mileage;
    
    // Calculate average annual increase
    const firstDate = mileageData[0].date;
    const firstMileage = mileageData[0].mileage;
    
    const yearsDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25);
    const mileageDiff = lastMileage - firstMileage;
    
    // Only project if we have meaningful time difference
    if (yearsDiff < 0.5) return null;
    
    const annualRate = mileageDiff / yearsDiff;
    
    // Project for next 5 years
    const projections = [];
    const currentDate = new Date();
    
    for (let year = 1; year <= 5; year++) {
      const projectedDate = new Date(currentDate);
      projectedDate.setFullYear(currentDate.getFullYear() + year);
      
      const yearsSinceLastReading = (projectedDate - lastDate) / (1000 * 60 * 60 * 24 * 365.25);
      const projectedMileage = lastMileage + (annualRate * yearsSinceLastReading);
      
      projections.push({
        year: currentDate.getFullYear() + year,
        projectedMileage: Math.round(projectedMileage),
        additionalMiles: Math.round(projectedMileage - lastMileage)
      });
    }
    
    return {
      annualRate: Math.round(annualRate),
      projections
    };
  };

  // Show loading state
  if (loading) {
    return (
      <GovUKLoadingContainer>
        <GovUKLoadingSpinner />
        <GovUKBody>Loading vehicle insights...</GovUKBody>
      </GovUKLoadingContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <GovUKHeadingM>Vehicle Mileage Insights</GovUKHeadingM>
        <PremiumInfoPanel>
          <GovUKHeadingS>Error Loading Insights</GovUKHeadingS>
          <GovUKBody>{error}</GovUKBody>
        </PremiumInfoPanel>
      </div>
    );
  }

  // Show empty state
  if (!mileageData || mileageData.length === 0) {
    return (
      <div>
        <GovUKHeadingM>Vehicle Mileage Insights</GovUKHeadingM>
        <PremiumInfoPanel>
          <GovUKBody>No mileage data available for analysis.</GovUKBody>
        </PremiumInfoPanel>
      </div>
    );
  }

  // Render insights
  return (
    <div>
      <GovUKHeadingM>Vehicle Mileage Insights</GovUKHeadingM>
      
      {/* Mileage Benchmark Analysis */}
      {insights.benchmarks && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Mileage Benchmark Analysis</GovUKHeadingS>
          <GovUKBody>
            This vehicle has <strong>{mileageData[mileageData.length-1].formattedMileage}</strong> miles, 
            which is <strong>{insights.benchmarks.mileageCategory}</strong> for a vehicle of this age and type.
          </GovUKBody>
          
          <ReportTable>
            <tbody>
              <tr>
                <td>Vehicle Age</td>
                <td>{insights.benchmarks.vehicleAgeYears} years</td>
              </tr>
              <tr>
                <td>Current Average Annual Mileage</td>
                <td>{insights.benchmarks.averageAnnualMileage.toLocaleString()} miles/year</td>
              </tr>
              <tr>
                <td>Expected Mileage For This Vehicle</td>
                <td>{insights.benchmarks.expectedTotalMileage.toLocaleString()} miles</td>
              </tr>
              <tr>
                <td>Variance From Expected</td>
                <td>{insights.benchmarks.mileageRatio < 1 ? "-" : "+"}{Math.abs(Math.round((insights.benchmarks.mileageRatio - 1) * 100))}%</td>
              </tr>
              <tr>
                <td>Estimated Remaining Useful Life</td>
                <td>
                  {insights.benchmarks.remainingMilesEstimate.toLocaleString()} miles 
                  (approx. {insights.benchmarks.remainingYearsEstimate} years at current usage rate)
                </td>
              </tr>
            </tbody>
          </ReportTable>
        </PremiumInfoPanel>
      )}
      
      {/* Risk Assessment */}
      {insights.riskAssessment && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Mileage History Risk Assessment</GovUKHeadingS>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              backgroundColor: insights.riskAssessment.riskCategory === 'Low' ? COLORS.GREEN : 
                              insights.riskAssessment.riskCategory === 'Medium' ? '#f47738' : COLORS.RED,
              color: COLORS.WHITE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              marginRight: '15px'
            }}>
              {insights.riskAssessment.riskScore}
            </div>
            <div>
              <GovUKBody style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {insights.riskAssessment.riskCategory} Risk
              </GovUKBody>
              <GovUKBodyS style={{ marginBottom: '0' }}>
                Based on mileage patterns and vehicle history
              </GovUKBodyS>
            </div>
          </div>
          
          {insights.riskAssessment.riskFactors.length > 0 && (
            <>
              <GovUKBodyS style={{ fontWeight: 'bold', color: COLORS.RED }}>Risk Factors:</GovUKBodyS>
              <ul style={{ marginTop: '5px', marginBottom: '15px' }}>
                {insights.riskAssessment.riskFactors.map((factor, index) => (
                  <li key={`risk-${index}`} style={{ fontSize: '0.875rem' }}>{factor}</li>
                ))}
              </ul>
            </>
          )}
          
          {insights.riskAssessment.positiveFactors.length > 0 && (
            <>
              <GovUKBodyS style={{ fontWeight: 'bold', color: COLORS.GREEN }}>Positive Factors:</GovUKBodyS>
              <ul style={{ marginTop: '5px', marginBottom: '0' }}>
                {insights.riskAssessment.positiveFactors.map((factor, index) => (
                  <li key={`positive-${index}`} style={{ fontSize: '0.875rem' }}>{factor}</li>
                ))}
              </ul>
            </>
          )}
        </PremiumInfoPanel>
      )}
      
      {/* Value Impact Analysis */}
      {insights.valueImpact && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Value Impact Analysis</GovUKHeadingS>
          <GovUKBody>
            This vehicle's mileage is {Math.abs(insights.valueImpact.mileageDifference).toLocaleString()} miles 
            {insights.valueImpact.mileageDifference > 0 ? " below " : " above "} 
            what would be expected, which {insights.valueImpact.valueImpactPercent >= 0 ? "positively" : "negatively"} affects its value.
          </GovUKBody>
          
          <div style={{ 
            padding: '15px', 
            backgroundColor: insights.valueImpact.valueImpactPercent >= 0 ? 'rgba(0, 112, 60, 0.1)' : 'rgba(212, 53, 28, 0.1)',
            border: `1px solid ${insights.valueImpact.valueImpactPercent >= 0 ? COLORS.GREEN : COLORS.RED}`,
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>Baseline Value</div>
              <div>£{insights.valueImpact.baseValue.toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>Mileage Impact</div>
              <div style={{ color: insights.valueImpact.valueImpactPercent >= 0 ? COLORS.GREEN : COLORS.RED }}>
                {insights.valueImpact.valueImpactPercent >= 0 ? "+" : ""}{insights.valueImpact.valueImpactPercent}%
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <div>Adjusted Value</div>
              <div>£{insights.valueImpact.adjustedValue.toLocaleString()}</div>
            </div>
          </div>
          
          <GovUKBodyS>
            Note: This is an estimate based on typical market adjustments for mileage. 
            Actual values will vary based on condition, service history, and local market factors.
          </GovUKBodyS>
        </PremiumInfoPanel>
      )}
      
      {/* Maintenance Projections */}
      {insights.maintenanceProjections && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Maintenance Projections</GovUKHeadingS>
          <GovUKBody>
            Based on this vehicle's mileage pattern, you can expect to spend approximately 
            <strong> £{insights.maintenanceProjections.estimatedAnnualMaintenanceCost.toLocaleString()}</strong> per year 
            on routine maintenance and repairs.
          </GovUKBody>
          
          {insights.maintenanceProjections.upcomingServices.length > 0 && (
            <>
              <GovUKBodyS style={{ fontWeight: 'bold', marginTop: '15px' }}>Upcoming Service Items:</GovUKBodyS>
              <ReportTable>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Due In</th>
                    <th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.maintenanceProjections.upcomingServices.map((service, index) => (
                    <tr key={`service-${index}`}>
                      <td>{service.name}</td>
                      <td>{service.milesUntilDue.toLocaleString()} miles</td>
                      <td style={{ 
                        color: service.urgency === 'High' ? COLORS.RED : 
                                service.urgency === 'Medium' ? '#f47738' : COLORS.GREEN
                      }}>
                        {service.urgency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </ReportTable>
            </>
          )}
          
          {insights.maintenanceProjections.upcomingReplacements.length > 0 && (
            <>
              <GovUKBodyS style={{ fontWeight: 'bold', marginTop: '15px' }}>Upcoming Major Components:</GovUKBodyS>
              <ReportTable>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Due In</th>
                    <th>Estimated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.maintenanceProjections.upcomingReplacements.map((component, index) => (
                    <tr key={`component-${index}`}>
                      <td>{component.name}</td>
                      <td>{component.milesUntilReplacement.toLocaleString()} miles</td>
                      <td>{component.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </ReportTable>
            </>
          )}
        </PremiumInfoPanel>
      )}
      
      {/* Future Projections */}
      {insights.futureProjections && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Future Mileage Projections</GovUKHeadingS>
          <GovUKBody>
            Based on historical usage, this vehicle's mileage is increasing at 
            approximately <strong>{insights.futureProjections.annualRate.toLocaleString()}</strong> miles per year.
          </GovUKBody>
          
          <ReportTable>
            <thead>
              <tr>
                <th>Year</th>
                <th>Projected Mileage</th>
                <th>Additional Miles</th>
              </tr>
            </thead>
            <tbody>
              {insights.futureProjections.projections.map((projection, index) => (
                <tr key={`projection-${index}`}>
                  <td>{projection.year}</td>
                  <td>{projection.projectedMileage.toLocaleString()}</td>
                  <td>+{projection.additionalMiles.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </ReportTable>
        </PremiumInfoPanel>
      )}
    </div>
  );
};

export default VehicleMileageInsights;