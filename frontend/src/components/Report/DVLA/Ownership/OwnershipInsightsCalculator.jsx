import React from 'react';

/**
 * OwnershipInsightsCalculator
 * Calculates ownership insights based on V5C and registration data
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
  
  return {
    v5cDate,
    yearsWithCurrentOwner,
    ownershipStability,
    ownershipRiskLevel,
    regGapYears,
    riskFactors,
    positiveFactors
  };
};

export default OwnershipInsightsCalculator;