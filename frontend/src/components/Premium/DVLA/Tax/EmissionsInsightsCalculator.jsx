import React from 'react';

/**
 * Enhanced EmissionsInsightsCalculator 
 * A specialized component to calculate emissions and compliance insights for vehicles
 * based on Euro emissions standards, UK and Scottish LEZ regulations
 * 
 * Features:
 * - Accurate vehicle tax calculations (April 2025)
 * - Enhanced vehicle type detection using DVLA API fields
 * - Advanced CO2 emissions estimation using Euro standards
 * - Improved motorcycle and light goods vehicle handling
 * - Scottish LEZ and UK ULEZ compliance determination
 * 
 * References:
 * - RAC Euro Emissions Guide: https://www.rac.co.uk/drive/advice/emissions/euro-emissions-standards/
 * - UK Government: https://www.gov.uk/emissions-tax
 * - Transport for London ULEZ: https://tfl.gov.uk/modes/driving/ultra-low-emission-zone
 * - DVLA Vehicle Tax Rates (V149): https://www.gov.uk/government/publications/vehicle-tax-rates-v149
 */

// Define constants to replace magic values
const CONSTANTS = {
  // Vehicle classification thresholds
  VEHICLE_WEIGHT: {
    MOTORCYCLE_MAX: 450,
    LGV_MAX: 3500,
    HGV_N2_MAX: 12000
  },
  
  // Tax thresholds
  TAX: {
    HIGH_VALUE_THRESHOLD: 40000,
    ADDITIONAL_RATE: 425,
    ENGINE_SIZE_THRESHOLD: 1549
  },
  
  // Date thresholds for emissions standards
  EURO_DATES: {
    EURO_1_START: { year: 1993 },
    EURO_2_START: { year: 1997 },
    EURO_3_START: { year: 2001 },
    EURO_4_START: { year: 2006 },
    EURO_4_PETROL: { year: 2006, month: 1 },
    EURO_5_START: { year: 2011 },
    EURO_5_END: { year: 2015, month: 8 },
    EURO_6_START: { year: 2015, month: 9 },
    EURO_6_DIESEL: { year: 2015, month: 9 },
    EURO_6B_END: { year: 2018 },
    EURO_6C_END: { year: 2019 },
    EURO_6D_TEMP_END: { year: 2021 },
    EURO_7_START: { year: 2026 }
  },
  
  // VED tax dates
  VED_DATES: {
    PRE_2001: { year: 2001, month: 3 },
    POST_2017: { year: 2017, month: 4 },
    POST_2025: { year: 2025, month: 4 }
  },
  
  // Historic vehicle thresholds
  HISTORIC: {
    TAX_EXEMPT_AGE: 40,
    LEZ_EXEMPT_AGE: 30
  },
  
  // Import detection
  IMPORT: {
    YEAR_GAP_THRESHOLD: 5  // Years between manufacture and registration
  }
};

/**
 * Helper function to safely access nested properties
 */
const getProperty = (obj, path, defaultValue = null) => {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return (result === undefined || result === null) ? defaultValue : result;
};

/**
 * Helper function for defensive error handling
 */
const safeCalculate = (calculationFn, fallbackValue, ...args) => {
  try {
    return calculationFn(...args);
  } catch (error) {
    console.error(`Calculation error: ${error.message}`);
    return fallbackValue;
  }
};

/**
 * Input data sanitization and validation
 */
const sanitizeVehicleData = (vehicleData) => {
  if (!vehicleData || typeof vehicleData !== 'object') {
    return {}; // Return empty object if invalid input
  }
  
  // Create a clean copy to avoid mutating the original object
  const sanitized = { ...vehicleData };
  
  // Normalize string fields - ensure they're strings
  const stringFields = [
    'fuelType', 'euroStatus', 'make', 'typeApproval', 
    'wheelplan', 'taxStatus', 'monthOfFirstRegistration'
  ];
  
  stringFields.forEach(field => {
    sanitized[field] = vehicleData[field] ? String(vehicleData[field]).trim() : null;
  });
  
  // Normalize number fields - ensure they're valid numbers
  const numberFields = [
    'co2Emissions', 'engineCapacity', 'yearOfManufacture', 
    'revenueWeight', 'listPrice'
  ];
  
  numberFields.forEach(field => {
    const value = vehicleData[field];
    sanitized[field] = (value !== null && value !== undefined) 
      ? (isNaN(Number(value)) ? null : Number(value))
      : null;
  });
  
  // Normalize date fields
  if (vehicleData.monthOfFirstRegistration) {
    try {
      // Ensure valid date format YYYY-MM
      const dateParts = vehicleData.monthOfFirstRegistration.split('-');
      if (dateParts.length >= 2) {
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
          sanitized.monthOfFirstRegistration = `${year}-${month.toString().padStart(2, '0')}`;
        } else {
          sanitized.monthOfFirstRegistration = null;
        }
      } else {
        sanitized.monthOfFirstRegistration = null;
      }
    } catch (e) {
      sanitized.monthOfFirstRegistration = null;
    }
  }
  
  return sanitized;
};

/**
 * Parse registration date safely
 */
const parseRegistrationDate = (dateString) => {
  if (!dateString) return { year: null, month: null };
  
  try {
    const parts = dateString.split('-');
    if (parts.length < 2) return { year: parseInt(parts[0]) || null, month: null };
    
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    
    return {
      year: !isNaN(year) ? year : null,
      month: (!isNaN(month) && month >= 1 && month <= 12) ? month : null
    };
  } catch (e) {
    return { year: null, month: null };
  }
};

/**
 * Helper function to determine if a vehicle is electric or zero emission
 */
const isElectricVehicle = (fuelType) => {
  if (!fuelType) return false;
  
  const fuelTypeLower = fuelType.toLowerCase();
  return fuelTypeLower.includes('electric') || 
         fuelTypeLower.includes('ev') || 
         fuelTypeLower.includes('zero emission');
};

/**
 * Enhanced import detection function that uses the gap between manufacturing and registration
 * Much more reliable than looking for specific keywords
 */
const isImportedVehicle = (vehicleData) => {
  const yearOfManufacture = vehicleData.yearOfManufacture ? parseInt(vehicleData.yearOfManufacture) : null;
  const registrationDate = getProperty(vehicleData, 'monthOfFirstRegistration') || 
                          getProperty(vehicleData, 'monthOfFirstDvlaRegistration');
  const { year: regYear } = parseRegistrationDate(registrationDate);
  
  // Direct import markers from existing fields
  const directImportMarkers = [
    vehicleData.typeApproval?.includes('IVA'),
    vehicleData.typeApproval?.includes('IVSA'),
    vehicleData.typeApproval?.includes('foreign'),
    vehicleData.import === true,
    vehicleData.importDate
  ];
  
  // If any direct markers are found, it's an import
  if (directImportMarkers.some(marker => !!marker)) {
    return true;
  }
  
  // Check for significant gap between manufacture and registration
  // 5+ years typically indicates an imported used vehicle
  if (yearOfManufacture && regYear && (regYear - yearOfManufacture >= CONSTANTS.IMPORT.YEAR_GAP_THRESHOLD)) {
    return true;
  }
  
  return false;
};

/**
 * Helper to determine which tax regime applies based on vehicle history
 * Prioritizes manufacture date when it matters most (pre-2001 vehicles)
 */
const determineTaxRegime = (vehicleData) => {
  const yearOfManufacture = vehicleData.yearOfManufacture ? parseInt(vehicleData.yearOfManufacture) : null;
  const registrationDate = getProperty(vehicleData, 'monthOfFirstRegistration') || 
                         getProperty(vehicleData, 'monthOfFirstDvlaRegistration');
  const { year: regYear, month: regMonth } = parseRegistrationDate(registrationDate);
  
  // Define possible regimes
  const regimes = {
    PRE_2001: "pre-2001",           // Engine-size based (PLG)
    POST_2001_PRE_2017: "2001-2017", // CO2-based bands A-M
    POST_2017_PRE_2025: "2017-2025", // First year rate + standard rate
    POST_2025: "post-2025"           // Includes EV taxation
  };
  
  // No dates available - default to most common
  if (!yearOfManufacture && !regYear) {
    return regimes.POST_2001_PRE_2017;
  }
  
  // CRITICAL FIX: If manufactured before 2001, use pre-2001 regime REGARDLESS of registration date
  if (yearOfManufacture && yearOfManufacture < 2001) {
    return regimes.PRE_2001;
  }
  
  // For other cases, use registration date to determine regime
  if (regYear) {
    if (regYear < 2001 || (regYear === 2001 && regMonth && regMonth < 3)) {
      return regimes.PRE_2001;
    } else if (regYear < 2017 || (regYear === 2017 && regMonth && regMonth < 4)) {
      return regimes.POST_2001_PRE_2017;
    } else if (regYear < 2025 || (regYear === 2025 && regMonth && regMonth < 4)) {
      return regimes.POST_2017_PRE_2025;
    } else {
      return regimes.POST_2025;
    }
  }
  
  // If only manufacturing year is available
  if (yearOfManufacture) {
    if (yearOfManufacture < 2001) {
      return regimes.PRE_2001;
    } else if (yearOfManufacture < 2017) {
      return regimes.POST_2001_PRE_2017;
    } else if (yearOfManufacture < 2025) {
      return regimes.POST_2017_PRE_2025;
    } else {
      return regimes.POST_2025;
    }
  }
  
  // Default case
  return regimes.POST_2001_PRE_2017;
};

/**
 * Improved RDE2 detection logic
 */
const determineRDE2Compliance = (vehicleData) => {
  const { realDrivingEmissions, rdeCompliance, yearOfManufacture, euroStatus, typeApproval, monthOfFirstRegistration } = vehicleData;
  const fuelType = vehicleData.fuelType || "Unknown";
  const makeYear = yearOfManufacture ? parseInt(yearOfManufacture) : null;
  
  // Not a diesel vehicle - RDE2 doesn't apply
  if (!fuelType?.toUpperCase().includes("DIESEL")) {
    return false;
  }
  
  // Explicit RDE2 compliance indicators in vehicle data
  if (realDrivingEmissions === 'RDE2' || rdeCompliance === 'RDE2') {
    return true;
  }
  
  // Check if the vehicle has Euro 6d or Euro 6d-TEMP status which are RDE2 compliant
  if (euroStatus?.includes("Euro 6d") || typeApproval?.includes("Euro 6d")) {
    return true;
  }
  
  // More conservative estimate based on registration date
  // Mandatory RDE2 for all new diesel registrations from January 2021
  if (makeYear >= 2021) {
    return true;
  }
  
  // For 2019-2020 vehicles, require both Euro 6 and specific month cutoffs
  if (makeYear >= 2019 && (euroStatus === "Euro 6" || euroStatus?.includes("Euro 6"))) {
    // For 2020, after September mostly RDE2 compliant
    if (makeYear === 2020) {
      if (monthOfFirstRegistration) {
        const { month } = parseRegistrationDate(monthOfFirstRegistration);
        return month && month >= 9; // September 2020 onwards
      }
      return false; // Without month info, safer to assume non-RDE2
    }
    
    // Less likely to be RDE2 compliant in 2019
    return false;
  }
  
  return false;
};

/**
 * Get notes for imported vehicles
 */
const getImportedVehicleNotes = (vehicleData) => {
  if (!isImportedVehicle(vehicleData)) return [];
  
  return [
    "This appears to be an imported vehicle. Emissions standards may vary from UK standards.",
    "For imported vehicles, tax calculations are based on available data and may not reflect special import provisions.",
    "Consider checking with DVLA for official guidance on imported vehicle taxation."
  ];
};

/**
 * Validate final calculation results for consistency
 */
const validateResults = (results) => {
  const validationWarnings = [];
  
  // Check for impossible combinations
  if (results.co2Emissions === 0 && !isElectricVehicle(results.fuelType)) {
    validationWarnings.push("Warning: Non-electric vehicle showing zero CO2 emissions");
  }
  
  if (results.isULEZCompliant && !results.isScottishLEZCompliant) {
    validationWarnings.push("Warning: Vehicle is ULEZ compliant but not Scottish LEZ compliant (unusual scenario)");
  }
  
  const currentYear = new Date().getFullYear();
  if (results.euroStatus === "Euro 7" && currentYear < 2026) {
    validationWarnings.push("Warning: Euro 7 status detected before official implementation");
  }
  
  if (results.taxBand === "Unknown" && results.co2Emissions) {
    validationWarnings.push("Warning: CO2 emissions available but tax band undetermined");
  }
  
  return {
    ...results,
    validationWarnings: validationWarnings.length > 0 ? validationWarnings : null
  };
};

// Main calculation function
const EmissionsInsightsCalculator = (vehicleData) => {
  // Sanitize and validate input data
  const sanitizedData = sanitizeVehicleData(vehicleData);
  
  // Extract basic emissions data from DVLA API response with safe access
  const co2Emissions = getProperty(sanitizedData, 'co2Emissions');
  const euroStatus = getProperty(sanitizedData, 'euroStatus');
  const fuelType = getProperty(sanitizedData, 'fuelType', 'Unknown');
  const engineSize = sanitizedData.engineCapacity ? `${sanitizedData.engineCapacity}cc` : null;
  const makeYear = sanitizedData.yearOfManufacture ? parseInt(sanitizedData.yearOfManufacture) : null;
  const registrationDate = getProperty(sanitizedData, 'monthOfFirstRegistration') || 
                           getProperty(sanitizedData, 'monthOfFirstDvlaRegistration');
  const taxStatus = getProperty(sanitizedData, 'taxStatus');
  const revenueWeight = getProperty(sanitizedData, 'revenueWeight');
  const realDrivingEmissions = getProperty(sanitizedData, 'realDrivingEmissions');
  const typeApproval = getProperty(sanitizedData, 'typeApproval');
  const wheelplan = getProperty(sanitizedData, 'wheelplan');
  const make = getProperty(sanitizedData, 'make');
  
  // Parse registration date more precisely
  const { year: regYear, month: regMonth } = parseRegistrationDate(registrationDate);
  
  // Enhanced estimation tracking
  const estimationDetails = {
    isEstimated: false,
    co2Estimated: false,
    euroStatusEstimated: false,
    vehicleCategoryEstimated: false,
    taxCalculationEstimated: false
  };
  
  // Vehicle categorization using DVLA fields
  const vehicleCategory = safeCalculate(determineVehicleCategory, "light passenger vehicle", sanitizedData);
  const isCommercial = vehicleCategory === "light goods vehicle" || 
                       vehicleCategory === "heavy goods vehicle N2" || 
                       vehicleCategory === "heavy goods vehicle N3";
  const normalizedTaxClass = inferTaxClass(sanitizedData, vehicleCategory);
  const inferredTaxClass = normalizedTaxClass || (isCommercial ? "light goods" : "private car");
  
  // Check if imported vehicle with enhanced detection
  const isImported = isImportedVehicle(sanitizedData);
  const importNotes = isImported ? getImportedVehicleNotes(sanitizedData) : [];
  
  // Check if explicitly RDE2 compliant with enhanced detection
  const isDieselRDE2 = determineRDE2Compliance(sanitizedData);
  
  // Initialize variables
  let estimatedCO2 = null;
  let estimatedEuroStatus = null;
  let estimatedEuroSubcategory = null;
  
  // Enhanced CO2 emission estimation if not available in vehicle data
  if (!co2Emissions) {
    estimationDetails.isEstimated = true;
    estimationDetails.co2Estimated = true;
    estimatedCO2 = safeCalculate(estimateCO2Emissions, 150, sanitizedData);
  }
  
  // IMPROVED: Estimate Euro status based on both registration date and manufacturing year
  // Using official implementation dates from RAC article
  if (!euroStatus) {
    estimationDetails.isEstimated = true;
    estimationDetails.euroStatusEstimated = true;
    
    // Prefer registration date over manufacturing year when available
    const effectiveYear = regYear || makeYear;
    
    if (fuelType.toUpperCase().includes("DIESEL")) {
      if (effectiveYear < CONSTANTS.EURO_DATES.EURO_1_START.year) {
        estimatedEuroStatus = "Pre-Euro";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_2_START.year) {
        estimatedEuroStatus = "Euro 1";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_3_START.year) {
        estimatedEuroStatus = "Euro 2";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_4_START.year) {
        estimatedEuroStatus = "Euro 3";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_5_START.year) {
        estimatedEuroStatus = "Euro 4";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_6_START.year || 
                (effectiveYear === CONSTANTS.EURO_DATES.EURO_6_START.year && 
                 regMonth && regMonth < CONSTANTS.EURO_DATES.EURO_6_START.month)) {
        estimatedEuroStatus = "Euro 5";
        // Euro 5a/5b subcategory
        if (effectiveYear < 2013) {
          estimatedEuroSubcategory = "Euro 5a";
        } else {
          estimatedEuroSubcategory = "Euro 5b";
        }
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_7_START.year) {
        estimatedEuroStatus = "Euro 6";
        // Estimate Euro 6 subcategory based on RAC information
        if (effectiveYear < CONSTANTS.EURO_DATES.EURO_6B_END.year) {
          estimatedEuroSubcategory = "Euro 6b";
        } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_6C_END.year) {
          estimatedEuroSubcategory = "Euro 6c";
        } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_6D_TEMP_END.year) {
          estimatedEuroSubcategory = "Euro 6d-TEMP";
        } else {
          estimatedEuroSubcategory = "Euro 6d";
        }
      } else {
        estimatedEuroStatus = "Euro 7";
      }
    } else if (fuelType.toUpperCase().includes("PETROL")) {
      if (effectiveYear < CONSTANTS.EURO_DATES.EURO_1_START.year) {
        estimatedEuroStatus = "Pre-Euro";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_2_START.year) {
        estimatedEuroStatus = "Euro 1";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_3_START.year) {
        estimatedEuroStatus = "Euro 2";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_4_START.year) {
        estimatedEuroStatus = "Euro 3";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_5_START.year) {
        estimatedEuroStatus = "Euro 4";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_6_START.year || 
                (effectiveYear === CONSTANTS.EURO_DATES.EURO_6_START.year && 
                 regMonth && regMonth < CONSTANTS.EURO_DATES.EURO_6_START.month)) {
        estimatedEuroStatus = "Euro 5";
        // Euro 5a/5b subcategory
        if (effectiveYear < 2013) {
          estimatedEuroSubcategory = "Euro 5a";
        } else {
          estimatedEuroSubcategory = "Euro 5b";
        }
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_7_START.year) {
        estimatedEuroStatus = "Euro 6";
        // Estimate Euro 6 subcategory
        if (effectiveYear < CONSTANTS.EURO_DATES.EURO_6B_END.year) {
          estimatedEuroSubcategory = "Euro 6b";
        } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_6C_END.year) {
          estimatedEuroSubcategory = "Euro 6c";
        } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_6D_TEMP_END.year) {
          estimatedEuroSubcategory = "Euro 6d-TEMP";
        } else {
          estimatedEuroSubcategory = "Euro 6d";
        }
      } else {
        estimatedEuroStatus = "Euro 7";
      }
    } else if (isElectricVehicle(fuelType)) {
      // Electric vehicles are not categorized under Euro emissions standards
      estimatedEuroStatus = "Zero Emission";
    } else if (fuelType.toUpperCase().includes("HYBRID")) {
      // Use petrol standards for hybrids as they're primarily regulated like petrol vehicles
      if (effectiveYear < CONSTANTS.EURO_DATES.EURO_1_START.year) {
        estimatedEuroStatus = "Pre-Euro";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_2_START.year) {
        estimatedEuroStatus = "Euro 1";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_3_START.year) {
        estimatedEuroStatus = "Euro 2";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_4_START.year) {
        estimatedEuroStatus = "Euro 3";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_5_START.year) {
        estimatedEuroStatus = "Euro 4";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_6_START.year || 
                (effectiveYear === CONSTANTS.EURO_DATES.EURO_6_START.year && 
                 regMonth && regMonth < CONSTANTS.EURO_DATES.EURO_6_START.month)) {
        estimatedEuroStatus = "Euro 5";
      } else if (effectiveYear < CONSTANTS.EURO_DATES.EURO_7_START.year) {
        estimatedEuroStatus = "Euro 6";
      } else {
        estimatedEuroStatus = "Euro 7";
      }
    }
  }
  
  // Get the appropriate Euro status (actual or estimated)
  const effectiveEuroStatus = euroStatus || estimatedEuroStatus;
  const effectiveEuroSubcategory = euroStatus ? null : estimatedEuroSubcategory;
  const effectiveCO2 = co2Emissions || estimatedCO2 || 0;
  
  // IMPROVED: Euro 7 information with disclaimer about its preliminary nature
  let brakeParticulateInfo = null;
  if (effectiveEuroStatus === "Euro 7") {
    brakeParticulateInfo = "Euro 7 introduces new standards for non-exhaust emissions including brake particulates (PM10), with current draft setting limits at 0.007g/km for passenger vehicles, potentially dropping to 0.003g/km after 2035. Note: Euro 7 standards are forthcoming (scheduled for November 2026) and details may be subject to change.";
  }
  
  // Determine tax band and cost based on CO2 emissions and registration date
  let taxBand = "Unknown";
  let annualTaxCost = "Unknown";
  let annualTaxCostDirectDebit = "Unknown"; // Added for Direct Debit
  let firstYearTaxCost = "Unknown";
  let taxNotes = [];
  
  // Add imported vehicle notes if applicable
  if (importNotes.length > 0) {
    taxNotes = [...taxNotes, ...importNotes];
  }
  
  // Note current tax status if available
  if (taxStatus) {
    if (taxStatus.toLowerCase() === "untaxed") {
      taxNotes.push("Vehicle is currently untaxed per DVLA records.");
    } else if (taxStatus.toLowerCase() === "taxed") {
      taxNotes.push("Vehicle is currently taxed per DVLA records.");
    }
  }
  
  // Check for special exemption categories
  let hasSpecialExemption = false;
  
  // NHS vehicles
  if (normalizedTaxClass === 'national health service') {
    annualTaxCost = "£0 (NHS Vehicle - Exempt)";
    annualTaxCostDirectDebit = "£0 (NHS Vehicle - Exempt)";
    firstYearTaxCost = "£0 (NHS Vehicle - Exempt)";
    taxBand = "NHS Vehicle";
    taxNotes.push("Vehicle is exempt from vehicle tax as a National Health Service vehicle.");
    hasSpecialExemption = true;
  }
  
  // Crown vehicles
  else if (normalizedTaxClass === 'crown') {
    annualTaxCost = "£0 (Crown Vehicle - Exempt)";
    annualTaxCostDirectDebit = "£0 (Crown Vehicle - Exempt)";
    firstYearTaxCost = "£0 (Crown Vehicle - Exempt)";
    taxBand = "Crown Vehicle";
    taxNotes.push("Vehicle is exempt from vehicle tax as a Crown vehicle used solely for official purposes.");
    hasSpecialExemption = true;
  }
  
  // Emergency vehicles
  else if (normalizedTaxClass === 'emergency vehicle' || 
          (typeApproval && typeApproval.toLowerCase().includes('ambulance')) || 
          (wheelplan && wheelplan.toLowerCase().includes('ambulance'))) {
    annualTaxCost = "£0 (Emergency Vehicle - Exempt)";
    annualTaxCostDirectDebit = "£0 (Emergency Vehicle - Exempt)";
    firstYearTaxCost = "£0 (Emergency Vehicle - Exempt)";
    taxBand = "Emergency Vehicle";
    taxNotes.push("Vehicle is exempt from vehicle tax as an emergency vehicle.");
    hasSpecialExemption = true;
  }
  
  // Disabled vehicles
  else if (normalizedTaxClass === 'disabled') {
    annualTaxCost = "£0 (Disabled Vehicle - Exempt)";
    annualTaxCostDirectDebit = "£0 (Disabled Vehicle - Exempt)";
    firstYearTaxCost = "£0 (Disabled Vehicle - Exempt)";
    taxBand = "Disabled Vehicle";
    taxNotes.push("Vehicle is exempt from vehicle tax under the Disabled tax class.");
    hasSpecialExemption = true;
  }
  
  // Check for historic vehicle tax exemption (40+ years old)
  else if (isHistoricVehicle(sanitizedData, 'tax')) {
    annualTaxCost = "£0 (Historic Vehicle - Exempt)";
    annualTaxCostDirectDebit = "£0 (Historic Vehicle - Exempt)";
    firstYearTaxCost = "£0 (Historic Vehicle - Exempt)";
    taxBand = "Historic Vehicle";
    taxNotes.push("Vehicle qualifies for historic vehicle tax exemption (40+ years old).");
    taxNotes.push("To claim this exemption, the vehicle must be registered in the 'Historic Vehicle' tax class with the DVLA.");
    hasSpecialExemption = true;
  }
  
  // Skip other tax calculations if the vehicle has a special exemption
  if (!hasSpecialExemption && (registrationDate || makeYear)) {
    // Handle Motorcycles and Tricycles - updated to April 2025 rates
    if (vehicleCategory === "motorcycle or moped") {
      const cc = parseInt(engineSize) || 0;
      
      // Check for electric motorcycles - now taxed at £26 from April 2025
      if (isElectricVehicle(fuelType)) {
        annualTaxCost = "£26";
        annualTaxCostDirectDebit = "£27.30 (12 monthly installments)";
        taxBand = "N/A (Zero Emission Motorcycle)";
        taxNotes.push("From April 2025, zero-emission motorcycles are subject to vehicle tax (£26)");
      } else if (revenueWeight && revenueWeight <= CONSTANTS.VEHICLE_WEIGHT.MOTORCYCLE_MAX) {
        if (isThreeWheeler(sanitizedData)) {
          if (cc <= 150) {
            annualTaxCost = "£26";
            annualTaxCostDirectDebit = "£27.30 (12 monthly installments)";
            taxBand = "N/A (Tricycle ≤150cc)";
          } else {
            annualTaxCost = "£121";
            annualTaxCostDirectDebit = "£127.05 (12 monthly installments)";
            taxBand = "N/A (Tricycle >150cc)";
          }
        } else { // Standard Motorcycle
          if (cc <= 150) {
            annualTaxCost = "£26";
            annualTaxCostDirectDebit = "£27.30 (12 monthly installments)";
            taxBand = "N/A (Motorcycle ≤150cc)";
          } else if (cc <= 400) {
            annualTaxCost = "£57";
            annualTaxCostDirectDebit = "£59.85 (12 monthly installments)";
            taxBand = "N/A (Motorcycle 151-400cc)";
          } else if (cc <= 600) {
            annualTaxCost = "£87";
            annualTaxCostDirectDebit = "£91.35 (12 monthly installments)";
            taxBand = "N/A (Motorcycle 401-600cc)";
          } else {
            annualTaxCost = "£121";
            annualTaxCostDirectDebit = "£127.05 (12 monthly installments)";
            taxBand = "N/A (Motorcycle >600cc)";
          }
        }
        taxNotes.push("Motorcycles/tricycles over 450kg are taxed as private/light goods vehicles.");
      } else {
        // Treat as private/light goods if over 450kg
        const cc = parseInt(engineSize) || 0;
        annualTaxCost = cc <= CONSTANTS.TAX.ENGINE_SIZE_THRESHOLD ? "£220" : "£360";
        annualTaxCostDirectDebit = cc <= CONSTANTS.TAX.ENGINE_SIZE_THRESHOLD ? "£231 (12 monthly installments)" : "£378 (12 monthly installments)";
        taxBand = "N/A (Private/Light Goods)";
        taxNotes.push(`Taxed as private/light goods vehicle (engine size: ${engineSize})`);
      }
    }
    // Handle Light Goods Vehicles and Vans - updated to April 2025 rates
    else if (vehicleCategory === "light goods vehicle" || (inferredTaxClass && inferredTaxClass.includes("goods") && (!revenueWeight || revenueWeight <= CONSTANTS.VEHICLE_WEIGHT.LGV_MAX))) {
      // Check for historic vehicle exemption first - goods vehicles can be exempt if not used commercially
      if (isHistoricVehicle(sanitizedData, 'tax')) {
        annualTaxCost = "£0 (Historic Vehicle - Exempt)";
        annualTaxCostDirectDebit = "£0 (Historic Vehicle - Exempt)";
        firstYearTaxCost = "£0 (Historic Vehicle - Exempt)";
        taxBand = "Historic Vehicle";
        taxNotes.push("Vehicle qualifies for historic vehicle tax exemption (40+ years old).");
        taxNotes.push("To claim this exemption, the vehicle must be registered in the 'Historic Vehicle' tax class with the DVLA.");
        hasSpecialExemption = true;
      } else {
        // Get tax regime based on vehicle history - use improved helper function
        const taxRegime = determineTaxRegime(sanitizedData);
        
        if (taxRegime === "pre-2001") { // Pre-2001 manufactured vehicles
          const cc = parseInt(engineSize) || 0;
          annualTaxCost = cc <= CONSTANTS.TAX.ENGINE_SIZE_THRESHOLD ? "£220" : "£360";
          annualTaxCostDirectDebit = cc <= CONSTANTS.TAX.ENGINE_SIZE_THRESHOLD ? "£231 (12 monthly installments)" : "£378 (12 monthly installments)";
          taxBand = "N/A (Pre-2001 Goods)";
          taxNotes.push(`Taxed as private/light goods vehicle (engine size: ${engineSize})`);
          
          // Add note for imported or late-registered vintage vehicles
          if (regYear && regYear >= 2001) {
            taxNotes.push("Vehicle manufactured before 2001 but registered later - taxation based on manufacture date.");
          }
      } else if (regYear >= 2003 && regYear <= 2006 && effectiveEuroStatus === "Euro 4") {
        // Euro 4 Light Goods Vehicles registered between 1 March 2003 and 31 December 2006
        annualTaxCost = "£140";
        annualTaxCostDirectDebit = "£147 (12 monthly installments)";
        taxBand = "N/A (Euro 4 Light Goods)";
        taxNotes.push("Taxed as Euro 4 compliant light goods vehicle (tax class 36)");
      } else if (regYear >= 2009 && regYear <= 2010 && effectiveEuroStatus === "Euro 5" && fuelType.toUpperCase().includes("DIESEL")) {
        // Euro 5 Light Goods Vehicles registered between 1 January 2009 and 31 December 2010 (diesel only)
        annualTaxCost = "£140";
        annualTaxCostDirectDebit = "£147 (12 monthly installments)";
        taxBand = "N/A (Euro 5 Light Goods)";
        taxNotes.push("Taxed as Euro 5 compliant light goods vehicle (tax class 36)");
        } else { // Standard Light Goods (tax class 39, post-2001)
          annualTaxCost = "£345";
          annualTaxCostDirectDebit = "£362.25 (12 monthly installments)";
          taxBand = "N/A (Light Goods Vehicle)";
          taxNotes.push("Taxed as a light goods vehicle (tax class 39)");
        }
      }
    } else {
      // For passenger vehicles - use tax regime helper
      const taxRegime = determineTaxRegime(sanitizedData);
      
      if (taxRegime === "pre-2001") {
        // Pre-2001 manufactured vehicles - use engine size-based bands
        const cc = parseInt(engineSize) || 0;
        if (cc <= CONSTANTS.TAX.ENGINE_SIZE_THRESHOLD) {
          taxBand = "Lower Rate (pre-2001)";
          annualTaxCost = "£220";
          annualTaxCostDirectDebit = "£231 (12 monthly installments)";
          taxNotes.push("Vehicle taxation based on pre-2001 engine size bands (manufacture date).");
        } else {
          taxBand = "Higher Rate (pre-2001)";
          annualTaxCost = "£360";
          annualTaxCostDirectDebit = "£378 (12 monthly installments)";
          taxNotes.push("Vehicle taxation based on pre-2001 engine size bands (manufacture date).");
        }
        
        // Add note for imported or late-registered vintage vehicles
        if (regYear && regYear >= 2001) {
          taxNotes.push("Vehicle manufactured before 2001 but registered later - taxation based on manufacture date.");
        }
      }
      else if (taxRegime === "post-2025") {
        // April 2025 rates for all vehicles
        // Standard rate from second license onwards
        annualTaxCost = "£195 per year";
        annualTaxCostDirectDebit = "£204.75 (12 monthly installments)";
        
        // First year rate for 2025+ registrations - based on official April 2025 DVLA rates
        if (fuelType.toUpperCase().includes("DIESEL") && !isDieselRDE2) {
          // Diesel cars not meeting RDE2 standards (RDE standard)
          if (effectiveCO2 === 0) {
            firstYearTaxCost = "£10";
          } else if (effectiveCO2 <= 50) {
            firstYearTaxCost = "£130";
          } else if (effectiveCO2 <= 75) {
            firstYearTaxCost = "£270";
          } else if (effectiveCO2 <= 90) {
            firstYearTaxCost = "£350";
          } else if (effectiveCO2 <= 100) {
            firstYearTaxCost = "£390";
          } else if (effectiveCO2 <= 110) {
            firstYearTaxCost = "£440";
          } else if (effectiveCO2 <= 130) {
            firstYearTaxCost = "£540";
          } else if (effectiveCO2 <= 150) {
            firstYearTaxCost = "£1,360";
          } else if (effectiveCO2 <= 170) {
            firstYearTaxCost = "£2,190";
          } else if (effectiveCO2 <= 190) {
            firstYearTaxCost = "£3,300";
          } else if (effectiveCO2 <= 225) {
            firstYearTaxCost = "£4,680";
          } else if (effectiveCO2 <= 255) {
            firstYearTaxCost = "£5,490";
          } else {
            firstYearTaxCost = "£5,490";
          }
          taxNotes.push("Vehicle is taxed at the higher diesel rate as it does not meet RDE2 standards.");
        } else {
          // All other vehicles including petrol, diesel RDE2, alternative fuel and electric
          if (effectiveCO2 === 0) {
            firstYearTaxCost = "£10";
          } else if (effectiveCO2 <= 50) {
            firstYearTaxCost = "£110";
          } else if (effectiveCO2 <= 75) {
            firstYearTaxCost = "£130";
          } else if (effectiveCO2 <= 90) {
            firstYearTaxCost = "£270";
          } else if (effectiveCO2 <= 100) {
            firstYearTaxCost = "£350";
          } else if (effectiveCO2 <= 110) {
            firstYearTaxCost = "£390";
          } else if (effectiveCO2 <= 130) {
            firstYearTaxCost = "£440";
          } else if (effectiveCO2 <= 150) {
            firstYearTaxCost = "£540";
          } else if (effectiveCO2 <= 170) {
            firstYearTaxCost = "£1,360";
          } else if (effectiveCO2 <= 190) {
            firstYearTaxCost = "£2,190";
          } else if (effectiveCO2 <= 225) {
            firstYearTaxCost = "£3,300";
          } else if (effectiveCO2 <= 255) {
            firstYearTaxCost = "£4,680";
          } else {
            firstYearTaxCost = "£5,490";
          }
        }
        
        // Add note about zero emission vehicles no longer being exempt
        if (isElectricVehicle(fuelType)) {
          taxNotes.push("As of April 2025, zero-emission vehicles are no longer exempt from vehicle tax.");
        }
      }
      else if (taxRegime === "2017-2025") {
        // Post-April 2017 to March 2025 regime
        
        if (fuelType.toUpperCase().includes("DIESEL") && !isDieselRDE2) {
          // Diesel cars not meeting RDE2 standards pay higher rates
          // Standard rate from second licence onwards: £195 (updated to 2025 rates)
          annualTaxCost = "£195 per year";
          annualTaxCostDirectDebit = "£204.75 (12 monthly installments)";
          
          // First year rate depends on CO2 - using pre-2025 rates for vehicles registered before April 2025
          if (effectiveCO2 === 0) {
            firstYearTaxCost = "£0";
          } else if (effectiveCO2 <= 50) {
            firstYearTaxCost = "£30";
          } else if (effectiveCO2 <= 75) {
            firstYearTaxCost = "£135";
          } else if (effectiveCO2 <= 90) {
            firstYearTaxCost = "£175";
          } else if (effectiveCO2 <= 100) {
            firstYearTaxCost = "£195";
          } else if (effectiveCO2 <= 110) {
            firstYearTaxCost = "£220";
          } else if (effectiveCO2 <= 130) {
            firstYearTaxCost = "£270";
          } else if (effectiveCO2 <= 150) {
            firstYearTaxCost = "£680";
          } else if (effectiveCO2 <= 170) {
            firstYearTaxCost = "£1,095";
          } else if (effectiveCO2 <= 190) {
            firstYearTaxCost = "£1,650";
          } else if (effectiveCO2 <= 225) {
            firstYearTaxCost = "£2,340";
          } else if (effectiveCO2 <= 255) {
            firstYearTaxCost = "£2,745";
          } else {
            firstYearTaxCost = "£2,745";
          }
          
          taxNotes.push("Vehicle is taxed at the higher diesel rate as it does not meet RDE2 standards.");
        } else if (fuelType.toUpperCase().includes("DIESEL") || fuelType.toUpperCase().includes("PETROL")) {
          // Petrol cars and diesel cars meeting RDE2 standards
          // Standard rate from second licence onwards: £195 (updated to 2025 rates)
          annualTaxCost = "£195 per year";
          annualTaxCostDirectDebit = "£204.75 (12 monthly installments)";
          
          // First year rate depends on CO2 - using pre-2025 rates for vehicles registered before April 2025
          if (effectiveCO2 === 0) {
            firstYearTaxCost = "£0";
          } else if (effectiveCO2 <= 50) {
            firstYearTaxCost = "£10";
          } else if (effectiveCO2 <= 75) {
            firstYearTaxCost = "£30";
          } else if (effectiveCO2 <= 90) {
            firstYearTaxCost = "£135";
          } else if (effectiveCO2 <= 100) {
            firstYearTaxCost = "£175";
          } else if (effectiveCO2 <= 110) {
            firstYearTaxCost = "£195";
          } else if (effectiveCO2 <= 130) {
            firstYearTaxCost = "£220";
          } else if (effectiveCO2 <= 150) {
            firstYearTaxCost = "£270";
          } else if (effectiveCO2 <= 170) {
            firstYearTaxCost = "£680";
          } else if (effectiveCO2 <= 190) {
            firstYearTaxCost = "£1,095";
          } else if (effectiveCO2 <= 225) {
            firstYearTaxCost = "£1,650";
          } else if (effectiveCO2 <= 255) {
            firstYearTaxCost = "£2,340";
          } else {
            firstYearTaxCost = "£2,745";
          }
          
          if (isDieselRDE2) {
            taxNotes.push("Vehicle is taxed at the standard rate as it meets RDE2 standards.");
          }
        } else if (isElectricVehicle(fuelType)) {
          // Electric vehicles - now taxed at £195 from April 2025
          const currentDate = new Date();
          const april2025 = new Date(2025, 3, 1); // Month is 0-indexed, so 3 is April
          
          if (currentDate >= april2025) {
            annualTaxCost = "£195 per year";
            annualTaxCostDirectDebit = "£204.75 (12 monthly installments)";
            firstYearTaxCost = "£0"; // First-year cost still applies from when vehicle was registered
            taxNotes.push("As of April 2025, zero-emission vehicles are subject to standard rate vehicle tax.");
          } else {
            annualTaxCost = "£0 (zero-emission vehicles exempt until April 2025)";
            annualTaxCostDirectDebit = "£0 (zero-emission vehicles exempt until April 2025)";
            firstYearTaxCost = "£0";
            taxNotes.push("From April 2025, zero-emission vehicles will be subject to standard rate vehicle tax (£195).");
          }
        } else if (fuelType.toUpperCase().includes("HYBRID") || fuelType.toUpperCase().includes("ALTERNATIVE")) {
          // Alternative fuel vehicles (including hybrids) - updated to 2025 DVLA rates
          annualTaxCost = "£195 per year";
          annualTaxCostDirectDebit = "£204.75 (12 monthly installments)";
          
          // First year rate for alternative fuel vehicles depends on CO2 (pre-2025 rates)
          if (effectiveCO2 === 0) {
            firstYearTaxCost = "£0";
          } else if (effectiveCO2 <= 50) {
            firstYearTaxCost = "£0";
          } else if (effectiveCO2 <= 75) {
            firstYearTaxCost = "£20";
          } else if (effectiveCO2 <= 90) {
            firstYearTaxCost = "£125";
          } else if (effectiveCO2 <= 100) {
            firstYearTaxCost = "£165";
          } else if (effectiveCO2 <= 110) {
            firstYearTaxCost = "£185";
          } else if (effectiveCO2 <= 130) {
            firstYearTaxCost = "£210";
          } else if (effectiveCO2 <= 150) {
            firstYearTaxCost = "£260";
          } else if (effectiveCO2 <= 170) {
            firstYearTaxCost = "£670";
          } else if (effectiveCO2 <= 190) {
            firstYearTaxCost = "£1,085";
          } else if (effectiveCO2 <= 225) {
            firstYearTaxCost = "£1,640";
          } else if (effectiveCO2 <= 255) {
            firstYearTaxCost = "£2,330";
          } else {
            firstYearTaxCost = "£2,735";
          }
        }
      } 
      else {
        // 2001-2017 - CO2 emission bands
        // All fuel types now consolidated with the same rates according to DVLA April 2025 document
        
        // Standard rates for all fuel types including petrol, diesel, alternative and EVs
        if (effectiveCO2 <= 100) {
          taxBand = "A";
          annualTaxCost = "£20";
          annualTaxCostDirectDebit = "£21 (12 monthly installments)";
        } else if (effectiveCO2 <= 110) {
          taxBand = "B";
          annualTaxCost = "£20";
          annualTaxCostDirectDebit = "£21 (12 monthly installments)";
        } else if (effectiveCO2 <= 120) {
          taxBand = "C";
          annualTaxCost = "£35";
          annualTaxCostDirectDebit = "£36.75 (12 monthly installments)";
        } else if (effectiveCO2 <= 130) {
          taxBand = "D";
          annualTaxCost = "£165";
          annualTaxCostDirectDebit = "£173.25 (12 monthly installments)";
        } else if (effectiveCO2 <= 140) {
          taxBand = "E";
          annualTaxCost = "£195";
          annualTaxCostDirectDebit = "£204.75 (12 monthly installments)";
        } else if (effectiveCO2 <= 150) {
          taxBand = "F";
          annualTaxCost = "£215";
          annualTaxCostDirectDebit = "£225.75 (12 monthly installments)";
        } else if (effectiveCO2 <= 165) {
          taxBand = "G";
          annualTaxCost = "£265";
          annualTaxCostDirectDebit = "£278.25 (12 monthly installments)";
        } else if (effectiveCO2 <= 175) {
          taxBand = "H";
          annualTaxCost = "£315";
          annualTaxCostDirectDebit = "£330.75 (12 monthly installments)";
        } else if (effectiveCO2 <= 185) {
          taxBand = "I";
          annualTaxCost = "£345";
          annualTaxCostDirectDebit = "£362.25 (12 monthly installments)";
        } else if (effectiveCO2 <= 200) {
          taxBand = "J";
          annualTaxCost = "£395";
          annualTaxCostDirectDebit = "£414.75 (12 monthly installments)";
        } else if (effectiveCO2 <= 225 || 
                  (effectiveCO2 > 225 && regYear && 
                   ((regYear < 2006) || 
                    (regYear === 2006 && regMonth && regMonth < 3)))) {
          // Band K - includes cars with CO2 over 225g/km registered before 23 March 2006
          taxBand = "K";
          annualTaxCost = "£430";
          annualTaxCostDirectDebit = "£451.50 (12 monthly installments)";
          if (effectiveCO2 > 225) {
            taxNotes.push("Vehicle placed in Band K as it has CO2 emissions over 225g/km but was registered before 23 March 2006.");
          }
        } else if (effectiveCO2 <= 255) {
          taxBand = "L";
          annualTaxCost = "£735";
          annualTaxCostDirectDebit = "£771.75 (12 monthly installments)";
        } else {
          taxBand = "M";
          annualTaxCost = "£760";
          annualTaxCostDirectDebit = "£798 (12 monthly installments)";
        }
        
        // Special note for zero emission vehicles that now pay tax
        if (isElectricVehicle(fuelType)) {
          taxNotes.push("As of April 2025, zero-emission vehicles registered between 2001-2017 are subject to the same CO2-based bands as other vehicles.");
        }
      }

      // Additional rate for expensive vehicles - updated to 2025 rate of £425
      if (sanitizedData.listPrice && sanitizedData.listPrice > CONSTANTS.TAX.HIGH_VALUE_THRESHOLD) {
        const currentDate = new Date();
        const april2025 = new Date(2025, 3, 1); // Month is 0-indexed, so 3 is April
        
        if (isElectricVehicle(fuelType)) {
          if (currentDate >= april2025) {
            annualTaxCost = `£620 per year for 5 years from second licence, then £195`;
            annualTaxCostDirectDebit = `£651 (12 monthly installments) for 5 years from second licence, then £204.75`;
            taxNotes.push(`As a vehicle with a list price over £${CONSTANTS.TAX.HIGH_VALUE_THRESHOLD.toLocaleString()}, an additional rate of £${CONSTANTS.TAX.ADDITIONAL_RATE} applies for 5 years from the second licence.`);
          } else {
            taxNotes.push(`As a vehicle with a list price over £${CONSTANTS.TAX.HIGH_VALUE_THRESHOLD.toLocaleString()}, an additional rate of £${CONSTANTS.TAX.ADDITIONAL_RATE} will apply for 5 years from the second licence, but currently suspended for zero emission vehicles until April 2025.`);
          }
        } else {
          annualTaxCost = `£620 per year for 5 years from second licence, then £195`;
          annualTaxCostDirectDebit = `£651 (12 monthly installments) for 5 years from second licence, then £204.75`;
          taxNotes.push(`As a vehicle with a list price over £${CONSTANTS.TAX.HIGH_VALUE_THRESHOLD.toLocaleString()}, an additional rate of £${CONSTANTS.TAX.ADDITIONAL_RATE} applies for 5 years from the second licence.`);
        }
      }
    }
  }

  // Add estimation note if applicable
  if (estimationDetails.isEstimated) {
    if (estimationDetails.co2Estimated && !co2Emissions) {
      taxNotes.push("CO2 emissions estimated based on vehicle type, Euro standard, and engine size.");
    }
    if (estimationDetails.euroStatusEstimated && !euroStatus) {
      taxNotes.push("Euro status estimated based on vehicle age and registration date.");
    }
  }

  // Determine Scottish LEZ compliance based on the regulations
  const isScottishLEZCompliant = determineScottishLEZCompliance(fuelType, effectiveEuroStatus, vehicleCategory, sanitizedData);
  
  // Determine ULEZ compliance for other UK zones
  const isULEZCompliant = determineULEZCompliance(fuelType, makeYear, regYear, regMonth, effectiveEuroStatus, sanitizedData);
  
  // Determine clean air zone status
  let ukCleanAirZoneStatus = isULEZCompliant ? "Compliant" : "Non-Compliant";
  let scottishLEZStatus = isScottishLEZCompliant ? "Compliant" : "Non-Compliant";
  
  // Set impact message
  let cleanAirZoneImpact = "No charges in UK or Scottish Clean Air/Low Emission Zones";
  
  if (isHistoricVehicle(sanitizedData, 'lez')) {
    cleanAirZoneImpact = "Vehicle is exempt from ULEZ and LEZ charges as a historic vehicle (30+ years old)";
  } else if (!isScottishLEZCompliant && !isULEZCompliant) {
    cleanAirZoneImpact = "Vehicle is not compliant with UK ULEZ and Scottish LEZ standards";
  } else if (!isScottishLEZCompliant) {
    cleanAirZoneImpact = "Vehicle is not compliant with Scottish LEZ standards";
  } else if (!isULEZCompliant) {
    cleanAirZoneImpact = "Vehicle is not compliant with UK ULEZ standards";
  }
  
  // Add reference link for clean air zones
  cleanAirZoneImpact += ". For more details, see: https://www.gov.uk/clean-air-zones";
  
  // Scottish LEZ penalty information
  let scottishLEZPenaltyInfo = null;
  if (!isScottishLEZCompliant) {
    // Get penalty information based on vehicle type according to Scottish regulations
    scottishLEZPenaltyInfo = getScottishLEZPenaltyInfo(vehicleCategory);
  }
  
  // Exemption information for Scottish LEZ
  const scottishExemptions = getScottishLEZExemptions(sanitizedData);
  
  // Add specific information about Euro standard pollutant limits if available
  let pollutantLimits = getPollutantLimits(fuelType, effectiveEuroStatus, effectiveEuroSubcategory);
  
  // Check for MOT exemption (40+ years old)
  const isMotExempt = isHistoricVehicle(sanitizedData, 'tax'); // Uses same rule as tax (40+ years)
  
  // Create the comprehensive emissions insights object
  const results = {
    co2Emissions: effectiveCO2,
    euroStatus: effectiveEuroStatus,
    euroSubcategory: effectiveEuroSubcategory,
    rde2Compliant: isDieselRDE2,
    isEstimated: estimationDetails.isEstimated,
    estimationDetails, // Enhanced estimation tracking
    isImported,
    taxBand,
    annualTaxCost,
    annualTaxCostDirectDebit,
    firstYearTaxCost,
    taxNotes,
    isHistoricVehicle: isHistoricVehicle(sanitizedData, 'tax'),
    isMotExempt,
    
    // UK ULEZ Information
    ukCleanAirZoneStatus,
    isULEZCompliant,
    
    // Scottish LEZ Information
    scottishLEZStatus,
    isScottishLEZCompliant,
    scottishLEZPenaltyInfo,
    scottishExemptions,
    
    cleanAirZoneImpact,
    pollutantLimits,
    brakeParticulateInfo,
    
    // Add category specific information
    isCommercial,
    vehicleCategory,
    
    // Tax calculation effective date
    taxRatesEffectiveDate: "April 1, 2025",
    
    // Add reference links
    references: [
      {
        title: "RAC Euro Emissions Guide",
        url: "https://www.rac.co.uk/drive/advice/emissions/euro-emissions-standards/"
      },
      {
        title: "Transport for London ULEZ",
        url: "https://tfl.gov.uk/modes/driving/ultra-low-emission-zone"
      },
      {
        title: "UK Government Clean Air Zones",
        url: "https://www.gov.uk/clean-air-zones"
      },
      {
        title: "DVLA Vehicle Tax Rates (V149)",
        url: "https://www.gov.uk/government/publications/vehicle-tax-rates-v149"
      }
    ]
  };
  
  // Run final validation checks
  return validateResults(results);
};

/**
 * Determines the vehicle category based on official EU and DVLA classifications.
 * 
 * This function follows the standards set in Directive 2007/46/EC and classifies vehicles according to:
 * - Type approval code (M, N, L categories) 
 * - Special purpose designations
 * - Weight thresholds
 * - Vehicle characteristics
 * 
 * @param {Object} vehicleData - The vehicle data object from DVLA API
 * @returns {string} The determined vehicle category
 */
const determineVehicleCategory = (vehicleData) => {
  // Input validation with safe default
  if (!vehicleData || typeof vehicleData !== 'object') {
    console.warn('Invalid vehicleData provided to determineVehicleCategory');
    return "light passenger vehicle"; // Default to most common type on error
  }
  
  // Internal utility functions
  
  /**
   * Sanitizes a string value to prevent errors
   */
  const sanitizeString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };
  
  /**
   * Sanitizes a number value to prevent errors
   */
  const sanitizeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };
  
  /**
   * Extracts the EU type approval category from the typeApproval string
   */
  const extractTypeApprovalCategory = (typeApproval) => {
    if (!typeApproval) return null;
    const categoryMatch = typeApproval.match(/[LMN][1-7][a-e]?/i);
    return categoryMatch ? categoryMatch[0].toUpperCase() : null;
  };
  
  /**
   * Checks if the wheelplan indicates a motorcycle or moped
   */
  const isMotorcycleWheelplan = (wheelplan) => {
    if (!wheelplan) return false;
    return wheelplan.includes('motorcycle') || wheelplan.includes('moped');
  };
  
  /**
   * Checks if the wheelplan indicates a goods vehicle based on official DVLA descriptions
   * "2 AXLE RIGID BODY" applies to ALL 4-wheeled cars, taxis & light commercials (NOT goods vehicles)
   */
  const isGoodsVehicleWheelplan = (wheelplan) => {
    if (!wheelplan) return false;
    
    const wheelplanUpper = wheelplan.toUpperCase();
    
    // Only classify as goods vehicle for heavy commercial descriptions:
    return wheelplanUpper === '3 AXLE RIGID BODY' ||       // Heavy vehicles
           wheelplanUpper === 'MULTI-AXLE RIGID' ||        // Heavy vehicles (4+ axle)
           wheelplanUpper === '2-AXLE & ARTIC' ||          // Articulated trucks
           wheelplanUpper === '3-AXLE & ARTIC' ||          // Articulated trucks
           wheelplanUpper === 'MULTI-AXLE & ARTIC' ||      // Articulated trucks  
           wheelplanUpper === 'CRAWLER';                   // Tracked vehicles
    
    // "2 AXLE RIGID BODY" = standard cars/taxis (NOT goods vehicles)
    // "2 WHEELS" = motorcycle
    // "3 WHEELS" = tricycle  
    // "NON-STANDARD" = unknown
  };
  
  // ------------------------------------------------------------
  // Extract and sanitize vehicle data
  // ------------------------------------------------------------
  const typeApproval = sanitizeString(getProperty(vehicleData, 'typeApproval', ''));
  const wheelplan = sanitizeString(getProperty(vehicleData, 'wheelplan', '')).toLowerCase();
  const revenueWeight = sanitizeNumber(getProperty(vehicleData, 'revenueWeight', 0));
  const engineCapacity = sanitizeNumber(getProperty(vehicleData, 'engineCapacity', 0));
  const fuelType = sanitizeString(getProperty(vehicleData, 'fuelType', '')).toLowerCase();
  
  try {
    // ------------------------------------------------------------
    // 1. TYPE APPROVAL-BASED CLASSIFICATION (highest priority)
    // ------------------------------------------------------------
    const approvalCategory = extractTypeApprovalCategory(typeApproval);
    
    if (approvalCategory) {
      // Passenger vehicles (M-category)
      if (approvalCategory === 'M1') return "light passenger vehicle";
      if (approvalCategory === 'M2') return "minibus";
      if (approvalCategory === 'M3') return "bus or coach";
      
      // Goods vehicles (N-category)
      if (approvalCategory === 'N1') return "light goods vehicle";
      if (approvalCategory === 'N2') return "heavy goods vehicle N2";
      if (approvalCategory === 'N3') return "heavy goods vehicle N3";
      
      // Motorcycles, mopeds (L-category)
      if (approvalCategory.match(/^L[1-7]/)) return "motorcycle or moped";
    }
    
    // ------------------------------------------------------------
    // 2. SPECIAL PURPOSE VEHICLE CLASSIFICATION
    // ------------------------------------------------------------
    const typeApprovalLower = typeApproval.toLowerCase();
    
    // Check for special purpose vehicles in type approval or wheelplan
    if (typeApprovalLower.includes('ambulance') || wheelplan.includes('ambulance')) {
      return "ambulance";
    }
    
    if (typeApprovalLower.includes('hearse') || wheelplan.includes('hearse')) {
      return "hearse";
    }
    
    if (typeApprovalLower.includes('motor caravan') || 
        typeApprovalLower.includes('motorhome') || 
        typeApprovalLower.includes('camper') ||
        wheelplan.includes('motorhome') || 
        wheelplan.includes('motor caravan') || 
        wheelplan.includes('camper')) {
      return "motor caravan";
    }
    
    if (typeApprovalLower.includes('armoured') || typeApprovalLower.includes('armored')) {
      // Determine if passenger or goods based on other factors
      if (typeApprovalLower.includes('goods') || 
          wheelplan.includes('van') || 
          wheelplan.includes('goods')) {
        return "armored goods vehicle";
      }
      return "armored passenger vehicle";
    }
    
    if (typeApprovalLower.includes('wheelchair') || typeApprovalLower.includes('wav')) {
      return "wheelchair accessible vehicle";
    }
    
    // ------------------------------------------------------------
    // 3. WEIGHT-BASED CLASSIFICATION
    // ------------------------------------------------------------
    if (revenueWeight > 0) {
      // Goods vehicle classification
      if (isGoodsVehicleWheelplan(wheelplan)) {
        if (revenueWeight > CONSTANTS.VEHICLE_WEIGHT.HGV_N2_MAX) {  // > 12 tonnes
          return "heavy goods vehicle N3";
        } else if (revenueWeight > CONSTANTS.VEHICLE_WEIGHT.LGV_MAX) {  // > 3.5 tonnes but ≤ 12 tonnes
          return "heavy goods vehicle N2";
        } else {  // ≤ 3.5 tonnes
          return "light goods vehicle";
        }
      }
      
      // Passenger vehicle classification by weight
      if (revenueWeight > 5000) {  // > 5 tonnes
        return "bus or coach";  // M3 category
      } else if (revenueWeight > 3500) {  // > 3.5 tonnes but ≤ 5 tonnes
        return "minibus";  // M2 category
      }
      
      // Motorcycle weight classification
      if (revenueWeight < CONSTANTS.VEHICLE_WEIGHT.MOTORCYCLE_MAX) {
        if (isMotorcycleWheelplan(wheelplan) || (engineCapacity > 0 && engineCapacity <= 900)) {
          return "motorcycle or moped";
        }
      }
      
      // Standard passenger vehicles - weight is a reliable indicator
      if (revenueWeight >= 750 && revenueWeight <= CONSTANTS.VEHICLE_WEIGHT.LGV_MAX) {
        return "light passenger vehicle";
      }
    }
    
    // ------------------------------------------------------------
    // 4. WHEELPLAN-BASED CLASSIFICATION
    // ------------------------------------------------------------
    if (wheelplan) {
      if (isMotorcycleWheelplan(wheelplan)) {
        return "motorcycle or moped";
      }
      
      if (isGoodsVehicleWheelplan(wheelplan)) {
        return "light goods vehicle";
      }
    }
    
    // ------------------------------------------------------------
    // 5. ENGINE CAPACITY CLASSIFICATION
    // ------------------------------------------------------------
    if (engineCapacity > 0) {
      // Very small engines (< 125cc) are almost certainly motorcycles/mopeds
      if (engineCapacity < 125) {
        return "motorcycle or moped";
      }
      
      // Large engines (> 1000cc) in combination with certain types are passenger vehicles
      if (engineCapacity > 1000 && !isMotorcycleWheelplan(wheelplan)) {
        return "light passenger vehicle";
      }
    }
    
    // ------------------------------------------------------------
    // 6. DEFAULT CLASSIFICATION
    // ------------------------------------------------------------
    return "light passenger vehicle"; // Most common vehicle type
    
  } catch (error) {
    console.error('Error in determineVehicleCategory:', error.message);
    return "light passenger vehicle"; // Fail safely to most common type
  }
};


/**
 * Helper function to identify whether vehicle is a tricycle/three-wheeler
 */
const isThreeWheeler = (vehicleData) => {
  const wheelplan = getProperty(vehicleData, 'wheelplan', '').toLowerCase();
  const make = getProperty(vehicleData, 'make', '').toLowerCase();
  
  // Check if wheelplan indicates a three-wheeler
  if (wheelplan.includes('tricycle') || wheelplan.includes('three wheel')) {
    return true;
  }
  
  // Check for common three-wheeler models
  const threeWheelerModels = ['piaggio mp3', 'can-am', 'spyder', 'ryker', 'reliant', 'morgan 3'];
  
  return threeWheelerModels.some(model => make.includes(model));
};

/**
 * Helper function to infer tax class based on available DVLA API data
 */
const inferTaxClass = (vehicleData, vehicleCategory) => {
  const typeApproval = getProperty(vehicleData, 'typeApproval', '').toLowerCase();
  const fuelType = getProperty(vehicleData, 'fuelType', '').toLowerCase();
  const make = getProperty(vehicleData, 'make', '').toLowerCase();
  const wheelplan = getProperty(vehicleData, 'wheelplan', '').toLowerCase();
  
  // Check for ambulances and emergency vehicles
  if (typeApproval.includes('ambulance') || wheelplan.includes('ambulance') ||
      make.includes('ambulance') || wheelplan.includes('fire') || make.includes('fire engine')) {
    return 'emergency vehicle';
  }
  
  // Check for disabled vehicles
  if (typeApproval.includes('disabled') || wheelplan.includes('disabled')) {
    return 'disabled';
  }
  
  // Check for historic vehicles
  if (isHistoricVehicle(vehicleData, 'tax')) {
    return 'historic vehicle';
  }
  
  // Infer based on vehicle category
  if (vehicleCategory === "motorcycle or moped") {
    return isThreeWheeler(vehicleData) ? 'tricycle' : 'motorcycle';
  }
  
  if (vehicleCategory === "light goods vehicle") {
    return 'light goods vehicle';
  }
  
  // Infer based on fuel type for passenger vehicles
  if (vehicleCategory === "light passenger vehicle") {
    if (fuelType.includes('diesel')) {
      return 'diesel car';
    } else if (fuelType.includes('petrol')) {
      return 'petrol car';
    } else if (isElectricVehicle(fuelType) || fuelType.includes('hybrid')) {
      return 'alternative fuel car';
    }
  }
  
  // Default to private/light goods
  return 'private/light goods';
};

/**
 * Helper function to determine if a vehicle qualifies for historic status
 * Takes into account different age thresholds for different purposes
 */
const isHistoricVehicle = (vehicleData, purposeType = 'tax') => {
  const currentYear = new Date().getFullYear();
  const yearOfManufacture = vehicleData.yearOfManufacture ? parseInt(vehicleData.yearOfManufacture) : null;
  
  // Comprehensive validation for yearOfManufacture
  if (!yearOfManufacture || 
      isNaN(yearOfManufacture) || 
      yearOfManufacture < 1885 || // First car invented
      yearOfManufacture > currentYear + 1) { // Allow 1 year future for new models
    return false;
  }
  
  // For tax purposes, vehicles 40+ years old are exempt (rolling from April 1st each year)
  if (purposeType === 'tax') {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    
    // Historic vehicle exemption rolls over on April 1st each year
    // If we're before April 1st, use previous year as baseline
    let effectiveTaxYear = currentYear;
    if (currentMonth < 4) { // Before April
      effectiveTaxYear = currentYear - 1;
    }
    
    const cutoffYear = effectiveTaxYear - CONSTANTS.HISTORIC.TAX_EXEMPT_AGE;
    
    // Check base historic status
    const isHistoric = yearOfManufacture <= cutoffYear;
    
    // Exceptions: buses and goods vehicles used commercially are not exempt
    if (isHistoric) {
      const vehicleCategory = determineVehicleCategory(vehicleData);
      const isCommercialGoods = (vehicleCategory === "light goods vehicle" || 
                                vehicleCategory === "heavy goods vehicle N2" || 
                                vehicleCategory === "heavy goods vehicle N3");
      const isBus = vehicleCategory === "bus or coach" || vehicleCategory === "minibus";
      
      // Not exempt if a commercial goods vehicle or bus
      if (isCommercialGoods || isBus) {
        return false;
      }
    }
    
    return isHistoric;
  }
  
  // For ULEZ/LEZ purposes, vehicles 30+ years old that are in original state are exempt
  if (purposeType === 'lez' || purposeType === 'ulez') {
    const cutoffYear = currentYear - CONSTANTS.HISTORIC.LEZ_EXEMPT_AGE;
    return yearOfManufacture <= cutoffYear;
  }
  
  return false;
};

/**
 * Enhanced CO2 emission estimation based on Euro standards, engine size, and vehicle type
 * Uses improved formulas for commercial vehicles to prevent overestimation
 * 
 * @param {Object} vehicleData - The vehicle data object from DVLA API
 * @returns {number} - Estimated CO2 emissions in g/km
 */
const estimateCO2Emissions = (vehicleData) => {
  const engineSizeCC = getProperty(vehicleData, 'engineCapacity', 0);
  const makeYear = vehicleData.yearOfManufacture ? parseInt(vehicleData.yearOfManufacture) : 2010;
  const fuelType = getProperty(vehicleData, 'fuelType', 'unknown').toLowerCase();
  const vehicleCategory = safeCalculate(determineVehicleCategory, "light passenger vehicle", vehicleData);
  const revenueWeight = getProperty(vehicleData, 'revenueWeight', getEstimatedWeight(vehicleCategory));
  
  // For zero emission vehicles
  if (isElectricVehicle(fuelType) || fuelType.includes('hydrogen')) {
    return 0;
  }
  
  // Determine Euro standard
  let euroNumber = 0;
  if (vehicleData.euroStatus) {
    const match = vehicleData.euroStatus.match(/\d+/);
    if (match) {
      euroNumber = parseInt(match[0]);
    }
  } else {
    // Estimate Euro number based on year
    if (makeYear < CONSTANTS.EURO_DATES.EURO_1_START.year) euroNumber = 0; // Pre-Euro
    else if (makeYear < CONSTANTS.EURO_DATES.EURO_2_START.year) euroNumber = 1;
    else if (makeYear < CONSTANTS.EURO_DATES.EURO_3_START.year) euroNumber = 2;
    else if (makeYear < CONSTANTS.EURO_DATES.EURO_4_START.year) euroNumber = 3;
    else if (makeYear < CONSTANTS.EURO_DATES.EURO_5_START.year) euroNumber = 4;
    else if (makeYear < CONSTANTS.EURO_DATES.EURO_6_START.year) euroNumber = 5;
    else if (makeYear < CONSTANTS.EURO_DATES.EURO_7_START.year) euroNumber = 6;
    else euroNumber = 7;
  }
  
  // CO2 estimation for motorcycles - already accurate, keep as is
  if (vehicleCategory === "motorcycle or moped") {
    const baseMotorcycleEmission = Math.round(engineSizeCC * 0.045 + 20);
    const yearFactor = Math.max(0.7, 1 - ((makeYear - 2000) * 0.01));
    return Math.round(baseMotorcycleEmission * yearFactor);
  }
  
  // For hybrids, reduce emissions by 30%
  const isHybrid = fuelType.includes('hybrid');
  const hybridFactor = isHybrid ? 0.7 : 1.0;
  
  // If we don't have engine size, use categorical estimates
  if (engineSizeCC === 0) {
    // Default estimates based on vehicle category and fuel type
    let baseCO2 = 150; // Default for unknown passenger vehicle
    
    if (vehicleCategory === "light passenger vehicle") {
      baseCO2 = fuelType.includes('diesel') ? 140 : 160;
    } else if (vehicleCategory === "light goods vehicle") {
      // FIXED: More accurate base estimates for LGVs
      baseCO2 = fuelType.includes('diesel') ? 190 : 210;
    } else if (vehicleCategory.includes("heavy goods")) {
      return 250; // Heavy goods vehicles not typically measured in g/km
    }
    
    // Apply Euro standard efficiency improvements
    // FIXED: Corrected factors to reduce emissions for newer standards
    const euroFactorSimple = getEuroEfficiencyFactor(euroNumber);
    
    // Apply year-based improvement
    const yearFactorSimple = Math.max(0.7, 1 - ((makeYear - 2000) * 0.01));
    
    return Math.round(baseCO2 * euroFactorSimple * yearFactorSimple * hybridFactor);
  }
  
  // IMPROVED: Base CO2 calculation with better scaling for large engines
  let baseCO2;
  
  // FIXED: Different calculation paths for different vehicle categories
  if (vehicleCategory === "light goods vehicle") {
    // Special formula for light goods vehicles that produces more realistic values
    if (fuelType.includes('diesel')) {
      // Typical diesel van CO2 values range from 180-230 g/km
      baseCO2 = 180 + (engineSizeCC / 100);
      
      // Add small weight adjustment
      const weightFactor = Math.min(1.2, Math.sqrt(revenueWeight / 2500));
      baseCO2 *= weightFactor;
    } else {
      // Petrol vans typically emit about 10-15% more than diesel
      baseCO2 = 200 + (engineSizeCC / 90);
      
      // Add small weight adjustment
      const weightFactor = Math.min(1.2, Math.sqrt(revenueWeight / 2500));
      baseCO2 *= weightFactor;
    }
  } else {
    // Standard passenger vehicles
    if (fuelType.includes('diesel')) {
      // FIXED: Less aggressive formula for diesel passenger vehicles
      baseCO2 = 100 + (engineSizeCC * 0.04);
      
      // Add weight adjustment that doesn't overshoot for heavier vehicles
      const weightFactor = Math.min(1.3, Math.pow(revenueWeight / 1500, 0.4));
      baseCO2 *= weightFactor;
    } else if (fuelType.includes('petrol') || fuelType.includes('gas')) {
      // FIXED: Less aggressive formula for petrol passenger vehicles
      baseCO2 = 120 + (engineSizeCC * 0.035);
      
      // Add weight adjustment that doesn't overshoot for heavier vehicles
      const weightFactor = Math.min(1.3, Math.pow(revenueWeight / 1500, 0.4));
      baseCO2 *= weightFactor;
    } else {
      // Unknown fuel type - assume petrol-like
      baseCO2 = 130 + (engineSizeCC * 0.035);
      
      // Add weight adjustment
      const weightFactor = Math.min(1.3, Math.pow(revenueWeight / 1500, 0.4));
      baseCO2 *= weightFactor;
    }
  }
  
  // FIXED: Apply Euro standard efficiency factors with corrected values
  const euroFactor = getEuroEfficiencyFactor(euroNumber);
  
  // Apply technological improvement factor based on year
  // Approximately 1% improvement per year in engine efficiency (reduced from 1.5%)
  const yearFactor = Math.max(0.75, 1 - ((makeYear - 2000) * 0.01));
  
  // FIXED: More modest category adjustment factors
  let categoryFactor = 1.0;
  if (vehicleCategory === "light goods vehicle") {
    // Light goods already handled with special formula above, no additional factor needed
    categoryFactor = 1.0;
  } else if (vehicleCategory.includes("heavy goods")) {
    categoryFactor = 1.2;
  } else if (vehicleCategory === "bus or coach" || vehicleCategory === "minibus") {
    categoryFactor = 1.15;
  }
  
  // Final calculation with all factors applied
  const estimatedCO2 = Math.round(baseCO2 * euroFactor * yearFactor * categoryFactor * hybridFactor);
  
  // FIXED: More realistic upper bound for different vehicle types
  const upperBound = getUpperCO2Bound(vehicleCategory);
  
  // Apply bounds - ensure we don't go below 0 or above the category-specific upper bound
  return Math.max(0, Math.min(estimatedCO2, upperBound));
};

/**
 * Helper to get Euro efficiency factor based on Euro standard
 * FIXED: Corrected to reduce emissions for newer standards
 */
const getEuroEfficiencyFactor = (euroNumber) => {
  const factors = {
    0: 1.35,   // Pre-Euro
    1: 1.25,   // Euro 1
    2: 1.15,   // Euro 2
    3: 1.05,   // Euro 3
    4: 0.95,   // Euro 4
    5: 0.90,   // Euro 5
    6: 0.85,   // Euro 6
    7: 0.80    // Euro 7
  };
  
  return factors[euroNumber] || 1.0;
};

/**
 * Helper to get realistic upper CO2 bounds by vehicle category
 */
const getUpperCO2Bound = (vehicleCategory) => {
  switch (vehicleCategory) {
    case "motorcycle or moped":
      return 180;
    case "light passenger vehicle":
      return 350;  // Very high performance/large engine cars
    case "light goods vehicle":
      return 280;  // Large vans
    case "heavy goods vehicle N2":
    case "heavy goods vehicle N3":
      return 320;  // HGVs aren't typically measured in g/km
    case "bus or coach":
    case "minibus":
      return 300;
    default:
      return 300;
  }
};
/**
 * Estimates vehicle weight based on category if not available
 */
const getEstimatedWeight = (category) => {
  switch (category) {
    case "motorcycle or moped": return 200;
    case "light passenger vehicle": return 1500;
    case "light goods vehicle": return 2200;
    case "heavy goods vehicle N2": return 7500;
    case "heavy goods vehicle N3": return 18000;
    case "bus or coach": return 12000;
    case "minibus": return 3500;
    default: return 1500;
  }
};

/**
 * Determines if a vehicle is compliant with Scottish LEZ standards
 * Based on the Low Emission Zones (Scotland) Regulations 2021
 */
const determineScottishLEZCompliance = (fuelType, euroStatus, vehicleCategory, vehicleData) => {
  // Check for historic vehicle exemption first (vehicles over 30 years old)
  if (vehicleData && isHistoricVehicle(vehicleData, 'lez')) {
    return true; // Historic vehicles are exempt from Scottish LEZ restrictions
  }
  
  if (!fuelType || !euroStatus) return false;
  
  const fuelTypeLower = fuelType.toLowerCase();
  let euroNumber = 0;
  
  // Extract euro number if we have a euro status
  if (euroStatus && typeof euroStatus === 'string') {
    // For standard Euro format (Euro 4, Euro 6, etc.)
    const match = euroStatus.match(/\d+/);
    if (match) {
      euroNumber = parseInt(match[0]);
    }
    
    // For Roman numeral format (Euro IV, Euro VI, etc.)
    if (euroStatus.includes('IV')) {
      euroNumber = 4;
    } else if (euroStatus.includes('VI')) {
      euroNumber = 6;
    }
  }
  
  // Electric and hydrogen vehicles are always compliant
  if (isElectricVehicle(fuelTypeLower) || fuelTypeLower.includes('hydrogen')) {
    return true;
  }
  
  // Checking compliance based on the Scottish LEZ regulations
  if (fuelTypeLower.includes('diesel')) {
    // Diesel cars need to be Euro 6 according to Scottish regulations
    if (vehicleCategory === "light passenger vehicle" || 
        vehicleCategory === "light goods vehicle") {
      return euroNumber >= 6;
    }
    
    // Diesel heavy goods vehicles, buses need to be Euro VI
    if (vehicleCategory === "heavy goods vehicle N2" || 
        vehicleCategory === "heavy goods vehicle N3" || 
        vehicleCategory === "bus or coach" || 
        vehicleCategory === "minibus") {
      return euroNumber >= 6 || euroStatus.includes('VI');
    }
  }
  
  if (fuelTypeLower.includes('petrol')) {
    // Petrol vehicles need to be Euro 4 according to Scottish regulations
    return euroNumber >= 4;
  }
  
  // Hybrids follow the same rules as their primary fuel type
  if (fuelTypeLower.includes('hybrid')) {
    if (fuelTypeLower.includes('diesel')) {
      if (vehicleCategory === "light passenger vehicle" || 
          vehicleCategory === "light goods vehicle") {
        return euroNumber >= 6;
      } else {
        return euroNumber >= 6 || euroStatus.includes('VI');
      }
    } else {
      // Assume petrol hybrid if not specified
      return euroNumber >= 4;
    }
  }
  
  // Mopeds and motorcycles need to be Euro 3
  if (vehicleCategory === "motorcycle or moped") {
    return euroNumber >= 3;
  }
  
  // Default to non-compliant if we can't determine
  return false;
};

/**
 * ULEZ compliance for London and other UK zones
 * IMPROVED: Now considers both registration date and year of manufacture
 */
const determineULEZCompliance = (fuelType, makeYear, regYear, regMonth, euroStatus, vehicleData) => {
  // Check for historic vehicle exemption first (vehicles over 30 years old)
  if (vehicleData && isHistoricVehicle(vehicleData, 'ulez')) {
    return true; // Historic vehicles are exempt from ULEZ restrictions
  }
  
  if (!fuelType) return false;
  
  // Prefer registration date over manufacturing year
  const effectiveYear = regYear || makeYear;
  if (!effectiveYear) return false;
  
  const fuelTypeLower = fuelType.toLowerCase();
  let euroNumber = 0;
  
  // Extract euro number if we have a euro status
  if (euroStatus && typeof euroStatus === 'string') {
    const match = euroStatus.match(/\d+/);
    if (match) {
      euroNumber = parseInt(match[0]);
    }
  }
  
  // Electric and hydrogen vehicles are always compliant
  if (isElectricVehicle(fuelTypeLower) || fuelTypeLower.includes('hydrogen')) {
    return true;
  }
  
  // Diesel vehicles need to be Euro 6 
  if (fuelTypeLower.includes('diesel')) {
    // Per RAC article: Euro 6 mandatory for new registrations from September 2015
    if (euroNumber >= 6) return true;
    if (effectiveYear > CONSTANTS.EURO_DATES.EURO_6_START.year) return true;
    if (effectiveYear === CONSTANTS.EURO_DATES.EURO_6_START.year && regMonth && regMonth >= CONSTANTS.EURO_DATES.EURO_6_START.month) return true;
    return false;
  }
  
  // Petrol vehicles need to be Euro 4
  if (fuelTypeLower.includes('petrol')) {
    // Per RAC article: Euro 4 mandatory for new registrations from January 2006
    if (euroNumber >= 4) return true;
    if (effectiveYear >= CONSTANTS.EURO_DATES.EURO_4_START.year) return true;
    return false;
  }
  
  // Hybrids follow the same rules as their primary fuel type
  if (fuelTypeLower.includes('hybrid')) {
    if (fuelTypeLower.includes('diesel')) {
      if (euroNumber >= 6) return true;
      if (effectiveYear > CONSTANTS.EURO_DATES.EURO_6_START.year) return true;
      if (effectiveYear === CONSTANTS.EURO_DATES.EURO_6_START.year && regMonth && regMonth >= CONSTANTS.EURO_DATES.EURO_6_START.month) return true;
      return false;
    } else {
      // Assume petrol hybrid if not specified
      if (euroNumber >= 4) return true;
      if (effectiveYear >= CONSTANTS.EURO_DATES.EURO_4_START.year) return true;
      return false;
    }
  }
  
  // Motorcycles need to be Euro 3 for ULEZ
  if (fuelTypeLower.includes('motorcycle') || fuelTypeLower.includes('moped')) {
    if (euroNumber >= 3) return true;
    if (effectiveYear >= 2007) return true;
    return false;
  }
  
  // Default to non-compliant if we can't determine
  return false;
};

/**
 * Get Scottish LEZ exemptions information
 * Based on regulation 3 of the Scottish LEZ regulations
 */
const getScottishLEZExemptions = (vehicleData) => {
  const exemptions = [];
  const wheelplan = getProperty(vehicleData, 'wheelplan', '').toLowerCase();
  const typeApproval = getProperty(vehicleData, 'typeApproval', '').toLowerCase();
  
  // Check for potential exemptions
  
  // Emergency vehicles
  if (typeApproval.includes('ambulance') || wheelplan.includes('ambulance') ||
      typeApproval.includes('fire') || wheelplan.includes('fire')) {
    exemptions.push({
      type: "Emergency Vehicle Exemption",
      description: "Emergency vehicles including ambulance, fire and police are exempt from Scottish LEZ restrictions"
    });
  }
  
  // Added information about Blue Badge exemption (not detectable via API)
  exemptions.push({
    type: "Possible Blue Badge Exemption",
    description: "Vehicles used by a Blue Badge holder as a driver or passenger are exempt from Scottish LEZ restrictions. This cannot be automatically detected via the vehicle data. The registered keeper should check if they qualify for this exemption.",
    isAutoDetectable: false
  });
  
  // Historic vehicles (using our helper function for consistency)
  if (isHistoricVehicle(vehicleData, 'lez')) {
    exemptions.push({
      type: "Historic Vehicle Exemption",
      description: "Vehicles over 30 years old that are preserved in their original state are exempt from LEZ restrictions"
    });
  }
  
  // Military vehicles
  if (typeApproval.includes('military') || wheelplan.includes('military')) {
    exemptions.push({
      type: "Military Vehicle Exemption",
      description: "Vehicles being used for naval, military or air force purposes are exempt"
    });
  }
  
  // Showman's vehicles
  if (typeApproval.includes('showman') || wheelplan.includes('showman')) {
    exemptions.push({
      type: "Showman's Vehicle Exemption",
      description: "Showman's goods vehicles and showman's vehicles are exempt"
    });
  }
  
  return exemptions;
};

/**
 * Get Scottish LEZ penalty information based on vehicle type
 * Based on schedule 4 of the Scottish LEZ regulations
 */
const getScottishLEZPenaltyInfo = (vehicleCategory) => {
  // Penalties as defined in the Scottish LEZ regulations
  const baseCharge = 60; // £60 for all vehicle types
  
  let surcharges = {
    first: 60,
    second: 180,
    third: 420
  };
  
  // Larger vehicles have higher fourth surcharge
  if (vehicleCategory === "bus or coach" || 
      vehicleCategory === "minibus" || 
      vehicleCategory === "heavy goods vehicle N2" || 
      vehicleCategory === "heavy goods vehicle N3") {
    surcharges.fourth = 900;
  } else {
    surcharges.fourth = 420;
  }
  
  return {
    baseCharge: `£${baseCharge}`,
    firstSurcharge: `£${surcharges.first}`,
    secondSurcharge: `£${surcharges.second}`,
    thirdSurcharge: `£${surcharges.third}`,
    fourthSurcharge: `£${surcharges.fourth}`,
    description: "Scottish LEZ penalties increase with repeated violations. The penalty is halved if paid within 14 days of notice.",
    resetPeriod: "If 90 days pass since your last violation, the next violation is treated as a first offense."
  };
};

/**
 * Get pollutant limits based on Euro standard
 * UPDATED: Corrected values to match RAC article exactly
 */
const getPollutantLimits = (fuelType, euroStatus, euroSubcategory) => {
  const pollutantLimits = [];
  
  // Only populate this for diesel or petrol vehicles
  if (fuelType.toUpperCase().includes("DIESEL") || fuelType.toUpperCase().includes("PETROL")) {
    if (euroStatus === "Euro 6" || euroSubcategory?.includes("Euro 6")) {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        return [
          "CO: 0.50 g/km",
          "NOx: 0.08 g/km",
          "PM: 0.005 g/km",
          "PN: 6.0x10^11 #/km"
        ];
      } else { // Petrol
        return [
          "CO: 1.0 g/km",
          "NOx: 0.06 g/km",
          "NMHC: 0.068 g/km",
          "THC: 0.10 g/km",
          "PM: 0.005 g/km (direct injection only)",
          "PN: 6.0x10^11 #/km (direct injection only)"
        ];
      }
    } else if (euroStatus === "Euro 4" || euroStatus === "Euro IV") {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        return [
          "CO: 0.50 g/km",
          "NOx: 0.25 g/km",
          "HC+NOx: 0.30 g/km",
          "PM: 0.025 g/km"
        ];
      } else { // Petrol
        return [
          "CO: 1.0 g/km",
          "NOx: 0.08 g/km",
          "HC: 0.10 g/km"
        ];
      }
    } else if (euroStatus === "Euro 5" || euroStatus === "Euro V") {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        return [
          "CO: 0.50 g/km",
          "NOx: 0.18 g/km",
          "HC+NOx: 0.23 g/km",
          "PM: 0.005 g/km",
          "PN: 6.0x10^11 #/km"
        ];
      } else { // Petrol
        return [
          "CO: 1.0 g/km",
          "NOx: 0.06 g/km",
          "HC: 0.10 g/km",
          "NMHC: 0.068 g/km",
          "PM: 0.005 g/km (direct injection only)"
        ];
      }
    } else if (euroStatus === "Euro 3" || euroStatus === "Euro III") {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        return [
          "CO: 0.66 g/km", // Corrected from 0.64 g/km to match RAC article
          "NOx: 0.50 g/km",
          "HC+NOx: 0.56 g/km",
          "PM: 0.05 g/km"
        ];
      } else { // Petrol
        return [
          "CO: 2.3 g/km",
          "NOx: 0.15 g/km",
          "HC: 0.20 g/km"
        ];
      }
    } else if (euroStatus === "Euro 2" || euroStatus === "Euro II") {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        return [
          "CO: 1.0 g/km",
          "HC+NOx: 0.7 g/km",
          "PM: 0.08 g/km"
        ];
      } else { // Petrol
        return [
          "CO: 2.2 g/km",
          "HC+NOx: 0.5 g/km"
        ];
      }
    } else if (euroStatus === "Euro 1" || euroStatus === "Euro I") {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        return [
          "CO: 2.72 g/km",
          "HC+NOx: 0.97 g/km",
          "PM: 0.14 g/km"
        ];
      } else { // Petrol
        return [
          "CO: 2.72 g/km",
          "HC+NOx: 0.97 g/km"
        ];
      }
    } else if (euroStatus === "Euro 7") {
      return [
        "Euro 7 standards are forthcoming (scheduled for November 2026).",
        "Primary focus on non-exhaust emissions including brake dust (PM10).",
        "Will address both exhaust and non-exhaust emissions with extended compliance periods.",
        "Note: Final emission limits may be adjusted before implementation."
      ];
    }
  } else if (fuelType.toUpperCase().includes("MOTORCYCLE") || fuelType.toUpperCase().includes("MOPED")) {
    if (euroStatus === "Euro 3") {
      return [
        "CO: 2.0 g/km",
        "HC: 0.3 g/km (for engines >150cc)",
        "HC: 0.8 g/km (for engines ≤150cc)",
        "NOx: 0.15 g/km"
      ];
    } else if (euroStatus === "Euro 4") {
      return [
        "CO: 1.14 g/km",
        "HC: 0.17 g/km",
        "NOx: 0.09 g/km"
      ];
    } else if (euroStatus === "Euro 5") {
      return [
        "CO: 1.0 g/km",
        "HC: 0.1 g/km",
        "NOx: 0.06 g/km",
        "PM: 0.0045 g/km (only for direct injection engines)"
      ];
    }
  } else if (isElectricVehicle(fuelType)) {
    return [
      "Zero direct emissions at the tailpipe.",
      "Not classified under traditional Euro emissions standards."
    ];
  }
  
  return pollutantLimits;
};

export default EmissionsInsightsCalculator;
