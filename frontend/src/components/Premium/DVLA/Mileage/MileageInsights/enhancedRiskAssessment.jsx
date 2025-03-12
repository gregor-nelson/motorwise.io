/**
 * Enhanced risk assessment calculator that properly accounts for clocking and anomalies
 * @param {Array} mileageData - Array of mileage readings
 * @param {Array} anomalies - Array of detected anomalies
 * @param {Array} inactivityPeriods - Array of inactivity periods
 * @param {Object} vehicleInfo - Vehicle information
 * @param {Object} benchmarks - Benchmark data
 * @returns {Object} Risk assessment
 */
const calculateRiskScore = (mileageData, anomalies, inactivityPeriods, vehicleInfo, benchmarks) => {
    if (!mileageData || mileageData.length < 2) return null;
    
    // Base risk score starts at 50 (neutral)
    let riskScore = 50;
    const riskFactors = [];
    const positiveFactors = [];
    
    // 1. Critical check: Detect clocking (mileage decreases) - Now with higher penalties
    const clockingAnomalies = anomalies.filter(a => a.type === 'decrease');
    if (clockingAnomalies.length > 0) {
      // Severe penalty for clocking - the most serious issue in vehicle history
      const basePenalty = clockingAnomalies.length === 1 ? 35 : 40; // More serious for multiple instances
      
      // Apply penalty for each clocking instance
      riskScore -= basePenalty * clockingAnomalies.length;
      
      // Calculate total magnitude of clocking
      const totalClockingMiles = clockingAnomalies.reduce((sum, anomaly) => 
        sum + Math.abs(anomaly.details.diff), 0);
      
      // Add specific risk factor based on severity of clocking
      if (totalClockingMiles > 50000) {
        riskFactors.push(`CRITICAL: Major mileage discrepancy detected - odometer appears to have been rolled back by ${totalClockingMiles.toLocaleString()} miles`);
      } else if (totalClockingMiles > 10000) {
        riskFactors.push(`SERIOUS: Significant mileage discrepancy detected - odometer appears to have been rolled back by ${totalClockingMiles.toLocaleString()} miles`);
      } else {
        riskFactors.push(`WARNING: Mileage discrepancy detected - odometer appears to have been rolled back by ${totalClockingMiles.toLocaleString()} miles`);
      }
      
      // Add contextual information about possible causes
      riskFactors.push("Possible causes: Odometer tampering, instrument cluster replacement, or MOT data entry errors");
      
      // Add legal risk factor
      riskFactors.push("Legal risk: Selling a vehicle with an incorrect mileage is illegal under the Consumer Protection from Unfair Trading Regulations");
    }
    
    // Check for other types of anomalies (unusual spikes)
    const spikeAnomalies = anomalies.filter(a => a.type === 'spike');
    if (spikeAnomalies.length > 0) {
      // Calculate penalty based on severity and number of spikes
      const highSeveritySpikes = spikeAnomalies.filter(a => a.severity === 'high').length;
      const mediumSeveritySpikes = spikeAnomalies.filter(a => a.severity === 'medium').length;
      const lowSeveritySpikes = spikeAnomalies.filter(a => a.severity === 'low').length;
      
      const spikePenalty = (highSeveritySpikes * 10) + (mediumSeveritySpikes * 6) + (lowSeveritySpikes * 3);
      riskScore -= spikePenalty;
      
      // Add appropriate risk factors
      if (highSeveritySpikes > 0) {
        riskFactors.push(`${highSeveritySpikes} instance(s) of extremely high mileage increases detected - may indicate commercial use or data errors`);
      }
      if (mediumSeveritySpikes > 0) {
        riskFactors.push(`${mediumSeveritySpikes} instance(s) of unusually high mileage increases detected`);
      }
      if (lowSeveritySpikes > 0) {
        riskFactors.push(`${lowSeveritySpikes} instance(s) of above-average mileage increases detected`);
      }
    }
    
    // 2. Recalculate accurate mileage if clocking detected
    let actualTotalMileage = 0;
    let adjustedAverageAnnualMileage = null;
    
    if (clockingAnomalies.length > 0) {
      // Instead of simple subtraction, sum all positive increments
      for (let i = 1; i < mileageData.length; i++) {
        const diff = mileageData[i].mileage - mileageData[i-1].mileage;
        if (diff > 0) actualTotalMileage += diff;
      }
      
      // Recalculate annual mileage using first and last record dates
      const firstRecord = mileageData[0];
      const lastRecord = mileageData[mileageData.length - 1];
      const timeSpanMs = lastRecord.date.getTime() - firstRecord.date.getTime();
      const timeSpanYears = timeSpanMs / (1000 * 60 * 60 * 24 * 365.25);
      
      if (timeSpanYears >= 0.5) {
        adjustedAverageAnnualMileage = Math.round(actualTotalMileage / timeSpanYears);
        
        // Add risk factor based on adjusted mileage
        if (adjustedAverageAnnualMileage > 25000) {
          riskScore -= 15;
          riskFactors.push(`Adjusted annual mileage (${adjustedAverageAnnualMileage.toLocaleString()} miles/year) suggests intense vehicle usage`);
        } else if (adjustedAverageAnnualMileage > 15000) {
          riskScore -= 8;
          riskFactors.push(`Adjusted annual mileage (${adjustedAverageAnnualMileage.toLocaleString()} miles/year) indicates above-average usage`);
        }
      }
    }
    
    // 3. Assess inactivity periods - use severity from chart component
    if (inactivityPeriods && inactivityPeriods.length > 0) {
      const highSeverityInactivity = inactivityPeriods.filter(p => p.severity === 'high').length;
      const mediumSeverityInactivity = inactivityPeriods.filter(p => p.severity === 'medium').length;
      
      // Calculate penalty based on severity and number of inactive periods
      const inactivityPenalty = (highSeverityInactivity * 12) + (mediumSeverityInactivity * 7);
      riskScore -= inactivityPenalty;
      
      // Add appropriate risk factors
      if (highSeverityInactivity > 0) {
        riskFactors.push(`${highSeverityInactivity} extended period(s) of vehicle inactivity detected - risk of deterioration from disuse`);
      }
      if (mediumSeverityInactivity > 0) {
        riskFactors.push(`${mediumSeverityInactivity} period(s) of low vehicle usage detected - may indicate seasonal use or secondary vehicle`);
      }
      
      // Check for very long inactivity (over 1 year)
      const veryLongInactivity = inactivityPeriods.filter(p => p.days > 365).length;
      if (veryLongInactivity > 0) {
        riskScore -= 10;
        riskFactors.push(`Vehicle has been inactive for more than a year at least once - high risk of mechanical issues from disuse`);
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
    
    // 4. Check mileage vs. age alignment using accurate mileage data
    if (benchmarks) {
      // If we have an adjusted annual mileage due to clocking, use that for assessment
      if (clockingAnomalies.length > 0 && adjustedAverageAnnualMileage !== null) {
        // Adjust benchmarks with our recalculated mileage
        const adjustedBenchmarkRatio = adjustedAverageAnnualMileage / benchmarks.typeSpecificAnnualMileage;
        
        if (adjustedBenchmarkRatio > 2.2) {
          riskScore -= 18;
          riskFactors.push(`After adjusting for mileage discrepancies, vehicle still shows extremely high usage (${adjustedAverageAnnualMileage.toLocaleString()} miles/year)`);
        } else if (adjustedBenchmarkRatio > 1.7) {
          riskScore -= 12;
          riskFactors.push(`After adjusting for mileage discrepancies, vehicle shows significantly higher than average usage (${adjustedAverageAnnualMileage.toLocaleString()} miles/year)`);
        } else if (adjustedBenchmarkRatio > 1.3) {
          riskScore -= 5;
          riskFactors.push(`After adjusting for mileage discrepancies, vehicle shows higher than average usage (${adjustedAverageAnnualMileage.toLocaleString()} miles/year)`);
        } else if (adjustedBenchmarkRatio < 0.7) {
          riskScore += 5;
          positiveFactors.push(`After adjusting for mileage discrepancies, vehicle shows lower than average usage (${adjustedAverageAnnualMileage.toLocaleString()} miles/year)`);
        }
      } 
      // If no clocking, use normal benchmark assessment
      else {
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
        
        // 5. Remaining lifespan
        if (benchmarks.remainingYearsEstimate > 10) {
          riskScore += 10;
          positiveFactors.push("Substantial estimated remaining vehicle lifespan based on current usage");
        } else if (benchmarks.remainingYearsEstimate < 3) {
          riskScore -= 12;
          riskFactors.push("Limited estimated remaining vehicle lifespan - approaching end of typical useful life");
        }
      }
    }
    
    // 6. Check for failed MOT tests with dangerous faults
    const failedTests = mileageData.filter(d => {
      const result = d.testResult ? String(d.testResult).trim().toUpperCase() : "";
      return result.includes('FAIL');
    });
    
    if (failedTests.length > 0) {
      const failRate = failedTests.length / mileageData.length;
      
      if (failRate > 0.5) {
        riskScore -= 15;
        riskFactors.push(`High MOT failure rate (${Math.round(failRate * 100)}%) - indicates potential neglect or recurring issues`);
      } else if (failRate > 0.25) {
        riskScore -= 8;
        riskFactors.push(`Above average MOT failure rate (${Math.round(failRate * 100)}%) - vehicle may have maintenance issues`);
      }
      
      // Check for consecutive failures which is especially concerning
      let consecutiveFailures = 0;
      let maxConsecutiveFailures = 0;
      for (let i = 0; i < mileageData.length; i++) {
        const result = mileageData[i].testResult ? String(mileageData[i].testResult).trim().toUpperCase() : "";
        if (result.includes('FAIL')) {
          consecutiveFailures++;
          maxConsecutiveFailures = Math.max(maxConsecutiveFailures, consecutiveFailures);
        } else {
          consecutiveFailures = 0;
        }
      }
      
      if (maxConsecutiveFailures >= 2) {
        riskScore -= 12;
        riskFactors.push(`Vehicle failed ${maxConsecutiveFailures} consecutive MOT tests - indicates unresolved mechanical issues`);
      }
    } else if (mileageData.length >= 3) {
      // Perfect MOT record is a positive
      riskScore += 12;
      positiveFactors.push("Perfect MOT pass history suggests excellent maintenance");
    }
    
    // 7. Check for gaps in MOT history
    const hasGaps = checkForMOTGaps(mileageData);
    if (hasGaps) {
      riskScore -= 15;
      riskFactors.push("Gaps detected in MOT testing history - vehicle may have been untested or unregistered for periods");
    }
    
    // 8. Consistency of mileage increases
    // Check if mileage increases are consistent (discounting any clocking)
    if (mileageData.length >= 4 && clockingAnomalies.length === 0) {
      const increases = [];
      for (let i = 1; i < mileageData.length; i++) {
        const diff = mileageData[i].mileage - mileageData[i-1].mileage;
        if (diff > 0) {
          const daysDiff = (mileageData[i].date - mileageData[i-1].date) / (1000 * 60 * 60 * 24);
          if (daysDiff > 0) {
            increases.push(diff / daysDiff); // daily rate
          }
        }
      }
      
      if (increases.length >= 3) {
        // Calculate coefficient of variation to measure consistency
        const mean = increases.reduce((a, b) => a + b, 0) / increases.length;
        const variance = increases.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / increases.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean; // coefficient of variation
        
        if (cv < 0.3) {
          riskScore += 8;
          positiveFactors.push("Highly consistent mileage increases suggest regular, predictable usage");
        } else if (cv > 0.8) {
          riskScore -= 5;
          riskFactors.push("Highly variable mileage increases suggest unpredictable or multiple-driver usage");
        }
      }
    }
    
    // 9. Final adjustments for very low test count
    if (mileageData.length < 3) {
      riskScore -= 5;
      riskFactors.push("Limited MOT history records available - reducing confidence in assessment");
    }
    
    // 10. Force high risk for clocked vehicles regardless of other factors
    if (clockingAnomalies.length > 0) {
      // Ensure score is in high risk range for any clocked vehicle
      riskScore = Math.min(riskScore, 30);
    }
    
    // Ensure score stays within 0-100 range
    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
    
    // Determine risk category with refined thresholds
    let riskCategory;
    if (riskScore >= 75) {
      riskCategory = "Low";
    } else if (riskScore >= 40) {
      riskCategory = "Medium";
    } else {
      riskCategory = "High";
    }
    
    // Force "High" risk category for clocked vehicles
    if (clockingAnomalies.length > 0) {
      riskCategory = "High";
    }
    
    return {
      riskScore,
      riskCategory,
      riskFactors,
      positiveFactors,
      hasClockingAnomalies: clockingAnomalies.length > 0,
      actualTotalMileage: clockingAnomalies.length > 0 ? actualTotalMileage : null,
      adjustedAverageAnnualMileage
    };
  };
  
  /**
   * Check for significant gaps in MOT testing history
   * @param {Array} mileageData - Array of mileage readings from MOT tests
   * @returns {Boolean} Whether significant gaps exist
   */
  const checkForMOTGaps = (mileageData) => {
    if (!mileageData || mileageData.length < 2) return false;
    
    // Sort by date to ensure chronological order
    const sortedData = [...mileageData].sort((a, b) => a.date - b.date);
    
    // Acceptable gap is 18 months (MOTs are required every 12 months, but allowing some flexibility)
    const ACCEPTABLE_GAP_DAYS = 548; // ~18 months
    
    for (let i = 1; i < sortedData.length; i++) {
      const daysBetweenTests = (sortedData[i].date - sortedData[i-1].date) / (1000 * 60 * 60 * 24);
      if (daysBetweenTests > ACCEPTABLE_GAP_DAYS) {
        return true;
      }
    }
    
    return false;
  };
  
  export { calculateRiskScore, checkForMOTGaps };