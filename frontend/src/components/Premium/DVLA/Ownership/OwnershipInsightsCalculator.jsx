import React from 'react';
import analyzeRegistrationRegion from './RegistrationAreaCodes';

/**
 * Enhanced OwnershipInsightsCalculator
 * Calculates ownership insights with enhanced regional analysis
 * 
 * @param {Object} vehicleData - The vehicle data object
 * @returns {Object|null} - Ownership insights or null if insufficient data
 */
const OwnershipInsightsCalculator = (vehicleData) => {
  if (!vehicleData || !vehicleData.dateOfLastV5CIssued) return null;
  
  // Calculate years with current owner (based on V5C)
  const currentYear = new Date().getFullYear();
  let v5cDate = new Date();
  let yearsWithCurrentOwner = 0;
  
  if (vehicleData.dateOfLastV5CIssued) {
    try {
      v5cDate = new Date(vehicleData.dateOfLastV5CIssued);
      yearsWithCurrentOwner = currentYear - v5cDate.getFullYear();
    } catch (e) {
      console.warn('Error calculating years with current owner');
    }
  }
  
  // Calculate registration gap (manufacturing to DVLA registration)
  let regGapYears = 0;
  
  if (vehicleData.yearOfManufacture && vehicleData.monthOfFirstDvlaRegistration) {
    try {
      const manufactureYear = parseInt(vehicleData.yearOfManufacture);
      const firstRegYear = parseInt(vehicleData.monthOfFirstDvlaRegistration.substring(0, 4));
      regGapYears = firstRegYear - manufactureYear;
    } catch (e) {
      console.warn('Error calculating registration gap');
    }
  }
  
  // Determine ownership stability
  let ownershipStability = "Unknown";
  let ownershipRiskLevel = "Medium";
  
  if (yearsWithCurrentOwner > 10) {
    ownershipStability = "Very Stable";
    ownershipRiskLevel = "Low";
  } else if (yearsWithCurrentOwner > 5) {
    ownershipStability = "Stable";
    ownershipRiskLevel = "Low";
  } else if (yearsWithCurrentOwner > 2) {
    ownershipStability = "Moderate";
    ownershipRiskLevel = "Medium";
  } else if (yearsWithCurrentOwner >= 1) {
    ownershipStability = "Recent";
    ownershipRiskLevel = "Medium";
  } else {
    ownershipStability = "Very Recent";
    ownershipRiskLevel = "High";
  }
  
  // Risk factors and positive factors
  const riskFactors = [];
  const positiveFactors = [];
  
  // Check for very recent ownership
  if (yearsWithCurrentOwner < 1) {
    riskFactors.push("Vehicle has changed ownership very recently - it may be a 'flipped' vehicle");
  }
  
  // Check for registration gap
  if (regGapYears > 1) {
    riskFactors.push(`${regGapYears}-year gap between manufacture and DVLA registration suggests possible import or late registration`);
  }
  
  // Add positive factors based on ownership length
  if (yearsWithCurrentOwner > 5) {
    positiveFactors.push("Long-term ownership suggests the vehicle has been well-maintained by a caring owner");
  }
  
  if (yearsWithCurrentOwner > 2 && yearsWithCurrentOwner <= 5) {
    positiveFactors.push("Stable ownership period suggests the vehicle has been well-cared for");
  }
  
  // Analyze registration region and integrate environmental features
  let regionInfo = null;
  let environmentalInsights = null;
  
  if (vehicleData.registrationNumber) {
    regionInfo = analyzeRegistrationRegion(vehicleData.registrationNumber);
    
    // Process standard regional factors
    if (regionInfo && regionInfo.regionalFactors) {
      regionInfo.regionalFactors.forEach(factor => {
        // Check if the factor indicates a risk
        if (factor.includes("salt-related corrosion") || 
            factor.includes("extreme weather") ||
            factor.includes("variable surfaces")) {
          riskFactors.push(factor);
        } 
        // Otherwise, it's just an informational factor
        else {
          // Add to positive factors if it's potentially benign
          if (factor.includes("urban area")) {
            // Urban driving might indicate more frequent servicing
            positiveFactors.push("Vehicle likely driven in urban environment with better access to maintenance services");
          }
        }
      });
    }
    
    // Add environmental insights if available
    if (regionInfo.environmentalInsights) {
      environmentalInsights = regionInfo.environmentalInsights;
      
      // Add flood risk factors
      if (environmentalInsights.floodRisk.riskLevel === "High") {
        riskFactors.push(`High flood risk area - ${environmentalInsights.floodRisk.details}`);
      } else if (environmentalInsights.floodRisk.riskLevel === "Medium") {
        riskFactors.push(`Medium flood risk area - ${environmentalInsights.floodRisk.details}`);
      }
      
      // Add air quality factors
      if (environmentalInsights.airQuality.qualityLevel === "Poor") {
        riskFactors.push(`Poor air quality impact - ${environmentalInsights.airQuality.catalyticConverterImpact}`);
      } else if (environmentalInsights.airQuality.qualityLevel === "Good") {
        positiveFactors.push(`Good air quality - ${environmentalInsights.airQuality.catalyticConverterImpact}`);
      }
      
      // Add road salt usage factors
      if (environmentalInsights.roadSaltUsage.usageLevel === "Heavy") {
        riskFactors.push(`Heavy road salt exposure - ${environmentalInsights.roadSaltUsage.details}`);
      } else if (environmentalInsights.roadSaltUsage.usageLevel === "Light") {
        positiveFactors.push(`Low road salt exposure - ${environmentalInsights.roadSaltUsage.details}`);
      }
      
      // Add accident blackspot factors
      if (environmentalInsights.accidentRisk.riskLevel === "High") {
        riskFactors.push(`High accident risk area - ${environmentalInsights.accidentRisk.details}`);
      } else if (environmentalInsights.accidentRisk.riskLevel === "Low") {
        positiveFactors.push(`Low accident risk area - ${environmentalInsights.accidentRisk.details}`);
      }
    }
  }
  
  return {
    v5cDate,
    yearsWithCurrentOwner,
    ownershipStability,
    ownershipRiskLevel,
    regGapYears,
    riskFactors,
    positiveFactors,
    // Include region information if available
    ...(regionInfo && {
      registrationRegion: regionInfo.registrationRegion,
      registrationArea: regionInfo.registrationArea,
      memoryTag: regionInfo.memoryTag,
    }),
    // Include environmental insights if available
    ...(environmentalInsights && { environmentalInsights })
  };
};

export default OwnershipInsightsCalculator;