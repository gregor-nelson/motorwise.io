// Data processing and analysis utilities for vehicle mileage chart
import { COLORS } from '../../../../../styles/theme';

// Define ORANGE properly using the theme colors
const ORANGE = COLORS.YELLOW || '#fd0'; // Using proper GOV.UK yellow from theme

/**
 * Process MOT test data with added detection of close temporal events
 * @param {Array} motTests - Raw MOT test data
 * @returns {Object} Processed chart data
 */
export const processMotData = (motTests) => {
  if (!motTests || motTests.length === 0) {
    return {
      mileageData: [],
      anomalies: [],
      inactivityPeriods: [],
      averageAnnualMileage: null
    };
  }

  const formattedData = motTests.map(test => {
    let dateStr = '';
    let parsedDate = new Date(0);
    try {
      if (test.completedDate) {
        const date = new Date(test.completedDate);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        dateStr = `${day} ${month} ${year}`;
        parsedDate = date;
      }
    } catch (err) {
      console.warn('Error parsing date:', err);
      dateStr = test.completedDate || '';
    }

    let mileageStr = '0';
    let numericMileage = 0;
    try {
      if (test.odometerValue) {
        numericMileage = parseInt(test.odometerValue, 10);
        mileageStr = String(numericMileage);
      }
    } catch (err) {
      console.warn('Error formatting mileage:', err);
      mileageStr = test.odometerValue || '0';
    }

    let testStatus = 'UNKNOWN';
    if (test.testResult) {
      const normalizedResult = String(test.testResult).trim().toUpperCase();
      testStatus = normalizedResult;
    }

    return {
      date: parsedDate,
      formattedDate: parsedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      mileage: numericMileage,
      formattedMileage: mileageStr,
      testResult: testStatus,
      originalTest: test
    };
  })
    .filter(test => !isNaN(test.mileage) && test.mileage > 0 && test.date > new Date(1990, 0, 1))
    .sort((a, b) => a.date - b.date);

  // Identify close temporal events (tests within 14 days of each other)
  // We'll add vertical offsets to these points to make them more distinct
  const MIN_DAY_DIFF = 14; // 14 days threshold for considering events "close" in time
  const processedData = [...formattedData];
  
  // Initialize closeEvents and verticalOffset for all data points first
  for (let i = 0; i < processedData.length; i++) {
    processedData[i].closeEvents = [];
    processedData[i].verticalOffset = 0;
  }
  
  // Now identify close events
  for (let i = 0; i < processedData.length; i++) {
    // Look ahead to find close events
    for (let j = i + 1; j < processedData.length; j++) {
      const daysDiff = (processedData[j].date - processedData[i].date) / (1000 * 60 * 60 * 24);
      if (daysDiff <= MIN_DAY_DIFF) {
        processedData[i].closeEvents.push(j);
        processedData[j].closeEvents.push(i);
      } else {
        break; // No need to check further if we've passed the time window
      }
    }
  }
  
  // Second pass to assign offsets to close events
  // We'll use a simple algorithm to assign different vertical offsets
  for (let i = 0; i < processedData.length; i++) {
    if (processedData[i].closeEvents.length > 0) {
      // Group contains the current point and all its close neighbors
      const group = [i, ...processedData[i].closeEvents];
      
      // Sort by result to ensure consistent handling
      group.sort((a, b) => {
        // Sort by test result first (PASS before FAIL)
        const aPass = processedData[a].testResult.includes('PASS') ? 1 : 0;
        const bPass = processedData[b].testResult.includes('PASS') ? 1 : 0;
        if (aPass !== bPass) return bPass - aPass;
        
        // Then by date
        return processedData[a].date - processedData[b].date;
      });
      
      // Assign alternating offsets (positive for pass, negative for fail)
      for (let j = 0; j < group.length; j++) {
        const idx = group[j];
        if (processedData[idx].verticalOffset === 0) { // Only assign if not already assigned
          const isPassing = processedData[idx].testResult.includes('PASS');
          const offset = isPassing ? 0 : -20; // 20 units down for fails
          processedData[idx].verticalOffset = offset;
        }
      }
    }
  }

  const anomalies = findAnomalies(processedData);
  const inactivityPeriods = findInactivityPeriods(processedData);
  const ratesData = calculateMileageRates(processedData);

  // Calculate average annual mileage using linear regression for better accuracy
  let averageAnnualMileage = null;
  if (processedData.length >= 2) {
    const xValues = processedData.map(d => d.date.getTime());
    const yValues = processedData.map(d => d.mileage);
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.map((x, i) => x * yValues[i]).reduce((a, b) => a + b, 0);
    const sumXX = xValues.map(x => x * x).reduce((a, b) => a + b, 0);
    
    // Calculate slope - miles per millisecond
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Convert to annual mileage
    averageAnnualMileage = Math.round(slope * (365.25 * 24 * 60 * 60 * 1000));
    
    // Validate the result - if negative or unrealistically high, fall back to simpler calculation
    if (averageAnnualMileage < 0 || averageAnnualMileage > 100000) {
      const firstRecord = processedData[0];
      const lastRecord = processedData[processedData.length - 1];
      const totalMileage = lastRecord.mileage - firstRecord.mileage;
      const timeSpanMs = lastRecord.date.getTime() - firstRecord.date.getTime();
      const timeSpanYears = timeSpanMs / (1000 * 60 * 60 * 24 * 365.25);
      
      if (timeSpanYears >= 0.5) {
        averageAnnualMileage = Math.round(totalMileage / timeSpanYears);
      }
    }
  }

  // Pre-compute clocking points to avoid repeated calculations during rendering
  const clockingAnomalies = anomalies.filter(a => a.type === 'decrease');
  const formattedDataWithFlags = processedData.map(point => {
    const isClockingPoint = clockingAnomalies.some(a => 
      a.details.current.date.getTime() === point.date.getTime() || 
      a.details.previous.date.getTime() === point.date.getTime()
    );
    
    return {
      ...point,
      isClockingPoint
    };
  });

  return {
    mileageData: formattedDataWithFlags,
    anomalies,
    inactivityPeriods,
    averageAnnualMileage,
    ratesData,
    // Add a flag to indicate if vehicle has been clocked
    hasBeenClocked: anomalies.some(a => a.type === 'decrease')
  };
};

/**
 * Improved anomaly detection with better handling of negative mileage
 * @param {Array} mileageData - Processed mileage data
 * @returns {Array} List of anomalies
 */
export const findAnomalies = (mileageData) => {
  const anomalyList = [];
  if (mileageData.length < 2) {
    return anomalyList;
  }

  const ANNUAL_MILEAGE_THRESHOLD = 40000;
  const SHORT_INTERVAL_DAILY_THRESHOLD = 250;
  const UK_AVG_DAILY_MILEAGE = 8000 / 365;

  const getExpectedMileageRange = (daysDiff) => {
    if (daysDiff <= 30) return 5.0;
    if (daysDiff <= 90) return 4.0;
    if (daysDiff <= 180) return 3.0;
    if (daysDiff <= 365) return 2.5;
    return 2.0;
  };

  for (let i = 1; i < mileageData.length; i++) {
    const prevReading = mileageData[i - 1];
    const currentReading = mileageData[i];

    // Ensure we have at least 1 day difference to avoid division by zero
    const daysDiff = Math.max(1, (currentReading.date.getTime() - prevReading.date.getTime()) / (1000 * 60 * 60 * 24));
    const mileageDiff = currentReading.mileage - prevReading.mileage;

    // Handle negative mileage (clocking) as high severity anomaly
    if (mileageDiff < 0) {
      let severity = "high"; // All mileage decreases are high severity
      
      // Fixed the order of conditions for proper categorization
      let severityDetail = "critical";
      if (Math.abs(mileageDiff) < 100) {
        severityDetail = "minor";
      } else if (Math.abs(mileageDiff) < 1000) {
        severityDetail = "major";
      }

      const anomaly = {
        index: i,
        date: currentReading.date,
        type: 'decrease',
        severity, // Always high for UI
        severityDetail, // For potential further UI refinement
        message: `Mileage decreased by ${Math.abs(mileageDiff).toLocaleString()} miles from previous reading`,
        details: {
          current: currentReading,
          previous: prevReading,
          diff: mileageDiff,
          timeBetweenReadings: daysDiff
        }
      };
      anomalyList.push(anomaly);
    }
    else if (mileageDiff > 0 && daysDiff > 0) {
      const dailyAverage = mileageDiff / daysDiff;
      const expectedMaxDaily = UK_AVG_DAILY_MILEAGE * getExpectedMileageRange(daysDiff);
      const annualizedMileage = dailyAverage * 365;

      if (
        (daysDiff >= 300 && annualizedMileage > ANNUAL_MILEAGE_THRESHOLD) ||
        (daysDiff < 300 && daysDiff > 7 && dailyAverage > expectedMaxDaily) ||
        dailyAverage > SHORT_INTERVAL_DAILY_THRESHOLD
      ) {
        let severity = "medium";

        if (annualizedMileage > ANNUAL_MILEAGE_THRESHOLD * 1.5 ||
          dailyAverage > SHORT_INTERVAL_DAILY_THRESHOLD * 1.5) {
          severity = "high";
        } else if (annualizedMileage < ANNUAL_MILEAGE_THRESHOLD * 1.2 &&
          dailyAverage < SHORT_INTERVAL_DAILY_THRESHOLD * 1.2) {
          severity = "low";
        }

        let message = `Unusually high mileage increase (${Math.round(dailyAverage)} miles/day, ${Math.round(annualizedMileage).toLocaleString()} miles/year equivalent)`;

        if (annualizedMileage > ANNUAL_MILEAGE_THRESHOLD) {
          message += ` - well above typical UK average of 8,000 miles/year`;
        }

        const anomaly = {
          index: i,
          date: currentReading.date,
          type: 'spike',
          severity,
          message: message,
          details: {
            current: currentReading,
            previous: prevReading,
            diff: mileageDiff,
            days: daysDiff,
            dailyAvg: dailyAverage,
            annualizedMileage: annualizedMileage
          }
        };
        anomalyList.push(anomaly);
      }
    }
  }
  return anomalyList;
};

/**
 * Improved inactivity period detection that excludes negative mileage cases
 * @param {Array} mileageData - Processed mileage data
 * @returns {Array} List of inactivity periods
 */
export const findInactivityPeriods = (mileageData) => {
  const inactivityList = [];
  if (mileageData.length < 2) {
    return inactivityList;
  }

  const UK_AVG_DAILY_MILEAGE = 8000 / 365;
  const LOW_ACTIVITY_THRESHOLD = UK_AVG_DAILY_MILEAGE * 0.25;
  const MIN_INACTIVITY_DAYS = 60;

  for (let i = 1; i < mileageData.length; i++) {
    const prevReading = mileageData[i - 1];
    const currentReading = mileageData[i];

    const daysDiff = Math.max(1, (currentReading.date.getTime() - prevReading.date.getTime()) / (1000 * 60 * 60 * 24));
    const mileageDiff = currentReading.mileage - prevReading.mileage;

    // Skip negative mileage entries as these should be classified as anomalies, not inactivity
    if (mileageDiff < 0) continue;
    
    if (daysDiff < MIN_INACTIVITY_DAYS) continue;

    const dailyAverage = mileageDiff / daysDiff;

    if (dailyAverage < LOW_ACTIVITY_THRESHOLD) {
      const monthsDiff = Math.round(daysDiff / 30);
      let description;
      let severity = "medium";

      if (dailyAverage === 0) {
        description = `Vehicle appears to have been unused for ${monthsDiff} months`;
        severity = "high";
      } else if (dailyAverage < LOW_ACTIVITY_THRESHOLD * 0.5) {
        description = `Very low usage period (${Math.round(dailyAverage)} miles/day for ${monthsDiff} months)`;
        severity = "medium";
      } else {
        description = `Below average usage (${Math.round(dailyAverage)} miles/day for ${monthsDiff} months)`;
        severity = "low";
      }

      const inactivityPeriod = {
        start: prevReading,
        end: currentReading,
        days: daysDiff,
        dailyAverage: dailyAverage,
        description: description,
        severity: severity
      };
      inactivityList.push(inactivityPeriod);
    }
  }
  return inactivityList;
};

/**
 * Improved mileage rate calculation that handles negative values and short time periods
 * @param {Array} mileageData - Processed mileage data
 * @returns {Array} List of mileage rates
 */
export const calculateMileageRates = (mileageData) => {
  const rates = [];
  if (mileageData.length < 2) {
    return rates;
  }

  for (let i = 1; i < mileageData.length; i++) {
    const prevPoint = mileageData[i - 1];
    const currPoint = mileageData[i];

    const timeDiffMs = currPoint.date.getTime() - prevPoint.date.getTime();
    const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
    
    // Skip very short time periods (less than 12 hours) as they may produce unreliable rates
    if (timeDiffDays < 0.5) {
      continue;
    }
    
    const adjustedTimeDiffDays = Math.max(1, timeDiffDays); // Ensure at least 1 day to avoid division by zero
    const mileageDiff = currPoint.mileage - prevPoint.mileage;

    // Calculate rates including for negative mileage, but flag them
    const dailyRate = mileageDiff / adjustedTimeDiffDays;
    const annualizedRate = dailyRate * 365;
    const isNegative = mileageDiff < 0;
    const isReliable = timeDiffDays >= 7; // Mark as reliable only if at least a week of data

    const rateData = {
      startDate: prevPoint.date,
      endDate: currPoint.date,
      startMileage: prevPoint.mileage,
      endMileage: currPoint.mileage,
      periodDays: Math.round(timeDiffDays),
      adjustedPeriodDays: Math.round(adjustedTimeDiffDays),
      dailyRate: dailyRate,
      annualizedRate: annualizedRate,
      isNegative: isNegative,
      isReliable: isReliable,
      formattedPeriod: `${prevPoint.formattedDate} to ${currPoint.formattedDate}`
    };
    rates.push(rateData);
  }
  return rates;
};

/**
 * Filter data based on selected time range
 * @param {Object} chartData - Full chart data
 * @param {string} selectedTimeRange - Selected time range
 * @returns {Object} Filtered chart data
 */
export const getFilteredData = (chartData, selectedTimeRange) => {
  // Add defensive checks to ensure chartData has the expected structure
  if (!chartData || !chartData.mileageData || !Array.isArray(chartData.mileageData) || chartData.mileageData.length === 0) {
    console.log("Empty or invalid chartData:", chartData);
    return { 
      mileageData: [], 
      anomalies: [], 
      inactivityPeriods: [],
      ratesData: [] 
    };
  }

  if (selectedTimeRange === 'all') {
    // Make sure all properties are defined with fallbacks
    return {
      ...chartData,
      anomalies: chartData.anomalies || [],
      inactivityPeriods: chartData.inactivityPeriods || [],
      ratesData: chartData.ratesData || []
    };
  }

  const lastDate = chartData.mileageData[chartData.mileageData.length - 1].date;
  let startDate = new Date(lastDate);

  switch (selectedTimeRange) {
    case '2y':
      startDate.setFullYear(startDate.getFullYear() - 2);
      break;
    case '5y':
      startDate.setFullYear(startDate.getFullYear() - 5);
      break;
    case '10y':
      startDate.setFullYear(startDate.getFullYear() - 10);
      break;
    default:
      return chartData;
  }

  const filteredMileageData = chartData.mileageData.filter(d => d.date >= startDate);
  const filteredAnomalies = chartData.anomalies.filter(a => a.date >= startDate);
  const filteredInactivityPeriods = chartData.inactivityPeriods.filter(p =>
    p.end.date >= startDate
  );
  const filteredRatesData = chartData.ratesData ?
    chartData.ratesData.filter(r => r.endDate >= startDate) : [];

  return {
    ...chartData,
    mileageData: filteredMileageData,
    anomalies: filteredAnomalies,
    inactivityPeriods: filteredInactivityPeriods,
    ratesData: filteredRatesData
  };
};

/**
 * Fetch vehicle data from API
 * @param {string} registration - Vehicle registration
 * @param {string} vin - Vehicle identification number
 * @returns {Promise} Promise resolving to vehicle data
 */
export const fetchVehicleData = async (registration, vin) => {
  try {
    const endpoint = registration
      ? `/api/v1/vehicle/registration/${registration}`
      : `/api/v1/vehicle/vin/${vin}`;

    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000'
      : '';

    const response = await fetch(`${baseUrl}${endpoint}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.errorMessage || `Failed to fetch vehicle data: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const vehicleData = await response.json();

    if (!vehicleData || !vehicleData.motTests || !Array.isArray(vehicleData.motTests)) {
      throw new Error('Invalid data format received from server');
    }

    return processMotData(vehicleData.motTests);
  } catch (err) {
    throw new Error(err.message || 'Failed to fetch vehicle data');
  }
};