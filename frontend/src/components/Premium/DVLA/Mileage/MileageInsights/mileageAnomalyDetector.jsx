/**
 * Enhanced anomaly detection for vehicle mileage data
 * Provides more accurate detection of clocking and unusual usage patterns
 * @param {Array} mileageData - Array of mileage readings from MOT tests
 * @returns {Array} List of detected anomalies with severity ratings
 */
const findMileageAnomalies = (mileageData) => {
    const anomalyList = [];
    if (!mileageData || mileageData.length < 2) {
      return anomalyList;
    }
  
    // Constants for anomaly detection thresholds
    const ANNUAL_MILEAGE_THRESHOLD = 40000; // Very high annual mileage (UK avg is ~8,000)
    const SHORT_INTERVAL_DAILY_THRESHOLD = 250; // Very high daily mileage
    const UK_AVG_DAILY_MILEAGE = 8000 / 365; // ~22 miles per day
  
    // Dynamic expected range based on interval length
    const getExpectedMileageRange = (daysDiff) => {
      if (daysDiff <= 30) return 5.0; // Short intervals can have more variability
      if (daysDiff <= 90) return 4.0;
      if (daysDiff <= 180) return 3.0;
      if (daysDiff <= 365) return 2.5;
      return 2.0; // Long intervals should be more stable
    };
  
    for (let i = 1; i < mileageData.length; i++) {
      const prevReading = mileageData[i - 1];
      const currentReading = mileageData[i];
  
      // Ensure we have at least 1 day difference to avoid division by zero
      const daysDiff = Math.max(1, (currentReading.date.getTime() - prevReading.date.getTime()) / (1000 * 60 * 60 * 24));
      const mileageDiff = currentReading.mileage - prevReading.mileage;
  
      // 1. Handle negative mileage (clocking) as high severity anomaly
      if (mileageDiff < 0) {
        let severity = "high"; // All mileage decreases are high severity
        
        // But we can still categorize for UI purposes
        let severityDetail = "critical";
        if (Math.abs(mileageDiff) < 1000) {
          severityDetail = "major";
        } else if (Math.abs(mileageDiff) < 100) {
          severityDetail = "minor";
        }
  
        const anomaly = {
          index: i,
          date: currentReading.date,
          type: 'decrease',
          severity,
          severityDetail,
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
      // 2. Check for unusual mileage increases
      else if (mileageDiff > 0 && daysDiff > 0) {
        const dailyAverage = mileageDiff / daysDiff;
        const expectedMaxDaily = UK_AVG_DAILY_MILEAGE * getExpectedMileageRange(daysDiff);
        const annualizedMileage = dailyAverage * 365;
  
        // Detect anomalies based on different criteria
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
   * Detect periods of vehicle inactivity or very low usage
   * @param {Array} mileageData - Array of mileage readings from MOT tests
   * @returns {Array} List of inactivity periods with severity ratings
   */
  const findInactivityPeriods = (mileageData) => {
    const inactivityList = [];
    if (!mileageData || mileageData.length < 2) {
      return inactivityList;
    }
  
    const UK_AVG_DAILY_MILEAGE = 8000 / 365;
    const LOW_ACTIVITY_THRESHOLD = UK_AVG_DAILY_MILEAGE * 0.25; // 25% of average is considered low
    const MIN_INACTIVITY_DAYS = 60; // Only consider periods of at least 2 months
  
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
   * Calculate accurate mileage statistics for a vehicle, handling clocking properly
   * @param {Array} mileageData - Array of mileage readings from MOT tests
   * @param {Array} anomalies - Array of detected anomalies
   * @returns {Object} Accurate mileage statistics
   */
  const calculateAccurateMileageStats = (mileageData, anomalies) => {
    if (!mileageData || mileageData.length < 2) {
      return {
        hasBeenClocked: false,
        totalMileage: 0,
        averageAnnualMileage: null,
        adjustedValues: false
      };
    }
    
    // Check if vehicle has been clocked
    const hasBeenClocked = anomalies?.some(a => a.type === 'decrease') || false;
    
    // Calculate unadjusted total and annual mileage
    const firstRecord = mileageData[0];
    const lastRecord = mileageData[mileageData.length - 1];
    
    const unadjustedTotalMileage = lastRecord.mileage - firstRecord.mileage;
    const timeSpanMs = lastRecord.date.getTime() - firstRecord.date.getTime();
    const timeSpanYears = timeSpanMs / (1000 * 60 * 60 * 24 * 365.25);
    
    let unadjustedAnnualMileage = null;
    if (timeSpanYears >= 0.5) {
      unadjustedAnnualMileage = Math.round(unadjustedTotalMileage / timeSpanYears);
    }
    
    // If vehicle hasn't been clocked, return simple calculations
    if (!hasBeenClocked) {
      return {
        hasBeenClocked,
        totalMileage: unadjustedTotalMileage,
        averageAnnualMileage: unadjustedAnnualMileage,
        adjustedValues: false
      };
    }
    
    // For clocked vehicles, recalculate by summing only positive increments
    let actualTotalMileage = 0;
    for (let i = 1; i < mileageData.length; i++) {
      const diff = mileageData[i].mileage - mileageData[i-1].mileage;
      if (diff > 0) actualTotalMileage += diff;
    }
    
    // Calculate adjusted annual mileage
    let adjustedAnnualMileage = null;
    if (timeSpanYears >= 0.5) {
      adjustedAnnualMileage = Math.round(actualTotalMileage / timeSpanYears);
    }
    
    return {
      hasBeenClocked,
      totalMileage: actualTotalMileage,
      averageAnnualMileage: adjustedAnnualMileage,
      unadjustedTotalMileage,
      unadjustedAnnualMileage,
      adjustedValues: true
    };
  };
  
  export { findMileageAnomalies, findInactivityPeriods, calculateAccurateMileageStats };