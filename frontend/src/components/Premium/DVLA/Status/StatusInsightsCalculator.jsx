import React from 'react';

/**
 * StatusInsightsCalculator
 * Calculates the current legal status of a vehicle based on official DVLA tax and MOT information
 * 
 * @param {Object} vehicleData - The vehicle data object
 * @returns {Object|null} - Status insights or null if insufficient data
 */
const StatusInsightsCalculator = (vehicleData) => {
  if (!vehicleData || (!vehicleData.taxStatus && !vehicleData.motStatus)) return null;
  
  // Extract status information using official DVLA status values
  const taxStatus = vehicleData.taxStatus || "Unknown";
  const motStatus = vehicleData.motStatus || "Unknown";
  let motExpiryDate = null;
  
  // Parse MOT expiry date - DVLA provides date in ISO format
  if (vehicleData.motExpiryDate) {
    try {
      motExpiryDate = new Date(vehicleData.motExpiryDate);
      // Check if date is valid
      if (isNaN(motExpiryDate.getTime())) {
        motExpiryDate = null;
        console.warn('Invalid MOT expiry date format');
      }
    } catch (e) {
      console.warn('Error parsing MOT expiry date:', e);
    }
  }
  
  // Official DVLA tax statuses
  const OFFICIAL_TAX_STATUSES = {
    TAXED: "TAXED",
    SORN: "SORN", 
    NOT_TAXED: "NOT TAXED FOR USE ON THE ROAD",
    UNTAXED: "UNTAXED",
    EXEMPT: "EXEMPT FROM TAX"
  };
  
  // Official MOT statuses
  const OFFICIAL_MOT_STATUSES = {
    VALID: "VALID",
    NOT_VALID: "NOT VALID",
    NO_RESULT: "NO RESULT",
    EXPIRED: "EXPIRED"
  };
  
  // Standardize input values to official DVLA values for reliable comparison
  const normalizedTaxStatus = taxStatus.toUpperCase().trim();
  const normalizedMotStatus = motStatus.toUpperCase().trim();
  
  // Determine tax status using more precise matching
  const isTaxed = normalizedTaxStatus === OFFICIAL_TAX_STATUSES.TAXED;
  const isSORNA = normalizedTaxStatus === OFFICIAL_TAX_STATUSES.SORN;
  const isTaxExempt = normalizedTaxStatus === OFFICIAL_TAX_STATUSES.EXEMPT;
  
  // Determine MOT status more precisely
  const hasValidMot = normalizedMotStatus === OFFICIAL_MOT_STATUSES.VALID;
  const motNotApplicable = normalizedMotStatus === OFFICIAL_MOT_STATUSES.NO_RESULT;
  
  // Helper function to validate year of manufacture
  const isValidManufactureYear = (year) => {
    const currentYear = new Date().getFullYear();
    const numYear = parseInt(year);
    return !isNaN(numYear) && numYear >= 1885 && numYear <= currentYear + 1;
  };

  // Vehicle may be exempt from MOT (check criteria based on gov.uk guidelines)
  const possiblyExemptFromMot = motNotApplicable && (
    // Historic vehicles (manufactured 40+ years ago - rolling exemption)
    (vehicleData.yearOfManufacture && 
     isValidManufactureYear(vehicleData.yearOfManufacture) &&
     parseInt(vehicleData.yearOfManufacture) <= (new Date().getFullYear() - 40)) ||
    // Electric vehicles (specific rules apply)
    (vehicleData.fuelType && vehicleData.fuelType.toUpperCase().includes('ELECTRIC') && 
     vehicleData.yearOfManufacture && 
     isValidManufactureYear(vehicleData.yearOfManufacture) &&
     parseInt(vehicleData.yearOfManufacture) > 2015)
  );
  
  // Determine driveability status according to official DVLA rules
  let driveabilityStatus = "Unknown";
  let statusRiskLevel = "Medium";
  
  if ((isTaxed || isTaxExempt) && (hasValidMot || possiblyExemptFromMot)) {
    driveabilityStatus = "Fully Road Legal";
    statusRiskLevel = "Low";
  } else if (isSORNA) {
    driveabilityStatus = "SORN - Not Road Legal";
    statusRiskLevel = "High";
  } else if ((!isTaxed && !isTaxExempt) && hasValidMot) {
    driveabilityStatus = "Requires Tax";
    statusRiskLevel = "Medium";
  } else if ((isTaxed || isTaxExempt) && !hasValidMot && !possiblyExemptFromMot) {
    driveabilityStatus = "Requires MOT";
    statusRiskLevel = "Medium";
  } else {
    driveabilityStatus = "Not Road Legal";
    statusRiskLevel = "High";
  }
  
  // Precise MOT expiry status calculation
  let motExpiringStatus = "Unknown";
  let daysUntilMotExpiry = 0;
  
  if (motExpiryDate) {
    // Use UTC dates to avoid timezone issues
    const currentDate = new Date();
    daysUntilMotExpiry = Math.floor((motExpiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilMotExpiry < 0) {
      motExpiringStatus = "Expired";
    } else if (daysUntilMotExpiry < 14) {
      motExpiringStatus = "Very Soon";
    } else if (daysUntilMotExpiry < 30) {
      motExpiringStatus = "Soon";
    } else {
      motExpiringStatus = "Not Soon";
    }
  }
  
  // Risk factors and considerations according to DVLA guidance
  const riskFactors = [];
  const considerations = [];
  
  // SORN considerations - official DVLA requirements
  if (isSORNA) {
    riskFactors.push("Vehicle is declared SORN - it cannot legally be driven on public roads");
    considerations.push("You must tax the vehicle before using it on public roads");
    considerations.push("Vehicle must be kept off public roads while SORN is in effect");
  }
  
  // MOT considerations based on official DVLA/DVSA guidance
  if (motNotApplicable) {
    if (possiblyExemptFromMot) {
      considerations.push("Vehicle may be exempt from MOT requirements - verify exemption status");
    } else {
      considerations.push("No MOT information available - verify MOT status before purchase");
    }
  } else if (motExpiringStatus === "Expired") {
    riskFactors.push("MOT has expired - vehicle cannot legally be driven on public roads except to a pre-booked MOT test");
  } else if (motExpiringStatus === "Very Soon") {
    considerations.push(`MOT expires in ${daysUntilMotExpiry} days - book a test as soon as possible`);
  } else if (motExpiringStatus === "Soon") {
    considerations.push(`MOT expires in ${daysUntilMotExpiry} days - consider arranging a test soon`);
  }
  
  // Additional official risk factors
  if (vehicleData.markedForExport === "Yes" || vehicleData.markedForExport === true) {
    riskFactors.push("Vehicle is marked for export - special documentation requirements apply");
  }
  
  if (vehicleData.v5c) {
    if (vehicleData.v5c.toLowerCase() === "missing" || vehicleData.v5c.toLowerCase() === "none") {
      riskFactors.push("V5C (log book) is missing - this is required for legal ownership transfer");
    }
  }
  
  // Check for scrapped status
  if (vehicleData.scrapped === "Yes" || vehicleData.scrapped === true) {
    riskFactors.push("Vehicle is recorded as scrapped - cannot be legally driven or sold");
  }
  
  // Check for stolen status
  if (vehicleData.stolen === "Yes" || vehicleData.stolen === true) {
    riskFactors.push("Vehicle is recorded as stolen - contact police if encountered");
  }
  
  // Insurance write-off status
  if (vehicleData.insuranceWriteOff) {
    riskFactors.push(`Vehicle is an insurance category ${vehicleData.insuranceWriteOff} write-off - check structural integrity`);
  }
  
  return {
    taxStatus,
    motStatus,
    motExpiryDate,
    driveabilityStatus,
    statusRiskLevel,
    motExpiringStatus,
    daysUntilMotExpiry,
    riskFactors,
    considerations,
    isTaxExempt: isTaxExempt || false,
    isPossiblyMotExempt: possiblyExemptFromMot || false
  };
};

export default StatusInsightsCalculator;