import React from 'react';

/**
 * Enhanced EmissionsInsightsCalculator 
 * A specialized component to calculate emissions and compliance insights for vehicles
 * based on Euro emissions standards, UK and Scottish LEZ regulations
 * 
 * Incorporates Scottish Low Emission Zones (Emission Standards, Exemptions and Enforcement)
 * (Scotland) Regulations 2021 requirements
 */
const EmissionsInsightsCalculator = (vehicleData) => {
  // Extract basic emissions data
  const co2Emissions = vehicleData.co2Emissions || null;
  const euroStatus = vehicleData.euroStatus || null;
  const fuelType = vehicleData.fuelType || "Unknown";
  const engineSize = vehicleData.engineCapacity ? `${vehicleData.engineCapacity}cc` : null;
  const makeYear = vehicleData.yearOfManufacture ? parseInt(vehicleData.yearOfManufacture) : null;
  const vehicleCategory = determineVehicleCategory(vehicleData);
  const isCommercial = vehicleData.taxClass?.toLowerCase().includes('goods') || false;
  const registrationDate = vehicleData.monthOfFirstRegistration || null;
  
  // Check if explicitly RDE2 compliant (if available in data)
  // This is important for diesel tax rates
  const isDieselRDE2 = fuelType?.toUpperCase().includes("DIESEL") && 
                       vehicleData.rdeCompliance === 'RDE2';
  
  // Initialize variables
  let estimatedCO2 = null;
  let estimatedEuroStatus = null;
  let estimatedEuroSubcategory = null;
  let isEstimated = false;
  
  // Estimate emissions if not available based on vehicle type
  if (!co2Emissions && makeYear && fuelType && engineSize) {
    isEstimated = true;
    
    // Simple heuristic for estimating CO2 emissions based on fuel type, year and engine size
    const engineSizeCC = parseInt(engineSize);
    
    if (fuelType.toUpperCase().includes("DIESEL")) {
      if (makeYear < 2010) {
        estimatedCO2 = Math.round(engineSizeCC * 0.085 + 60);
      } else if (makeYear < 2015) {
        estimatedCO2 = Math.round(engineSizeCC * 0.075 + 50);
      } else {
        estimatedCO2 = Math.round(engineSizeCC * 0.065 + 40);
      }
    } else if (fuelType.toUpperCase().includes("PETROL")) {
      if (makeYear < 2010) {
        estimatedCO2 = Math.round(engineSizeCC * 0.095 + 80);
      } else if (makeYear < 2015) {
        estimatedCO2 = Math.round(engineSizeCC * 0.085 + 70);
      } else {
        estimatedCO2 = Math.round(engineSizeCC * 0.075 + 60);
      }
    }
  }
  
  // Estimate Euro status if not available based on the Scottish LEZ legislation requirements
  if (!euroStatus && makeYear) {
    isEstimated = true;
    
    if (fuelType.toUpperCase().includes("DIESEL")) {
      if (makeYear < 1993) {
        estimatedEuroStatus = "Pre-Euro";
      } else if (makeYear < 1997) {
        estimatedEuroStatus = "Euro 1";
      } else if (makeYear < 2001) {
        estimatedEuroStatus = "Euro 2";
      } else if (makeYear < 2006) {
        estimatedEuroStatus = "Euro 3";
      } else if (makeYear < 2011) {
        estimatedEuroStatus = "Euro 4";
      } else if (makeYear < 2015) {
        estimatedEuroStatus = "Euro 5";
        // Euro 5a/5b subcategory
        estimatedEuroSubcategory = makeYear < 2013 ? "Euro 5a" : "Euro 5b";
      } else if (makeYear < 2020) {
        estimatedEuroStatus = "Euro 6";
        // Estimate Euro 6 subcategory
        if (makeYear < 2018) {
          estimatedEuroSubcategory = "Euro 6b";
        } else if (makeYear < 2019) {
          estimatedEuroSubcategory = "Euro 6c";
        } else if (makeYear < 2021) {
          estimatedEuroSubcategory = "Euro 6d-Temp";
        } else {
          estimatedEuroSubcategory = "Euro 6d";
        }
      } else if (makeYear < 2024) {
        estimatedEuroStatus = "Euro 6";
        estimatedEuroSubcategory = "Euro 6d";
      } else if (makeYear < 2026) {
        estimatedEuroStatus = "Euro 6";
        estimatedEuroSubcategory = "Euro 6e";
      } else {
        estimatedEuroStatus = "Euro 7";
      }
    } else if (fuelType.toUpperCase().includes("PETROL")) {
      if (makeYear < 1993) {
        estimatedEuroStatus = "Pre-Euro";
      } else if (makeYear < 1997) {
        estimatedEuroStatus = "Euro 1";
      } else if (makeYear < 2001) {
        estimatedEuroStatus = "Euro 2";
      } else if (makeYear < 2006) {
        estimatedEuroStatus = "Euro 3";
      } else if (makeYear < 2011) {
        estimatedEuroStatus = "Euro 4";
      } else if (makeYear < 2015) {
        estimatedEuroStatus = "Euro 5";
        // Euro 5a/5b subcategory
        estimatedEuroSubcategory = makeYear < 2013 ? "Euro 5a" : "Euro 5b";
      } else if (makeYear < 2020) {
        estimatedEuroStatus = "Euro 6";
        // Estimate Euro 6 subcategory
        if (makeYear < 2018) {
          estimatedEuroSubcategory = "Euro 6b";
        } else if (makeYear < 2019) {
          estimatedEuroSubcategory = "Euro 6c";
        } else if (makeYear < 2021) {
          estimatedEuroSubcategory = "Euro 6d-Temp";
        } else {
          estimatedEuroSubcategory = "Euro 6d";
        }
      } else if (makeYear < 2024) {
        estimatedEuroStatus = "Euro 6";
        estimatedEuroSubcategory = "Euro 6d";
      } else if (makeYear < 2026) {
        estimatedEuroStatus = "Euro 6";
        estimatedEuroSubcategory = "Euro 6e";
      } else {
        estimatedEuroStatus = "Euro 7";
      }
    } else if (fuelType.toUpperCase().includes("ELECTRIC") || fuelType.toUpperCase().includes("EV")) {
      // Electric vehicles are not categorized under Euro emissions standards
      estimatedEuroStatus = "Zero Emission";
    } else if (fuelType.toUpperCase().includes("HYBRID")) {
      // Use petrol standards for hybrids as they're primarily regulated like petrol vehicles
      if (makeYear < 1993) {
        estimatedEuroStatus = "Pre-Euro";
      } else if (makeYear < 1997) {
        estimatedEuroStatus = "Euro 1";
      } else if (makeYear < 2001) {
        estimatedEuroStatus = "Euro 2";
      } else if (makeYear < 2006) {
        estimatedEuroStatus = "Euro 3";
      } else if (makeYear < 2011) {
        estimatedEuroStatus = "Euro 4";
      } else if (makeYear < 2015) {
        estimatedEuroStatus = "Euro 5";
      } else if (makeYear < 2026) {
        estimatedEuroStatus = "Euro 6";
      } else {
        estimatedEuroStatus = "Euro 7";
      }
    }
  }
  
  // Get the appropriate Euro status (actual or estimated)
  const effectiveEuroStatus = euroStatus || estimatedEuroStatus;
  const effectiveEuroSubcategory = euroStatus ? null : estimatedEuroSubcategory;
  
  // Added information about Euro 7 brake particulate standards
  let brakeParticulateInfo = null;
  if (effectiveEuroStatus === "Euro 7") {
    brakeParticulateInfo = "Euro 7 introduces new standards for non-exhaust emissions including brake particulates (PM10). Currently set at 0.007g/km for passenger vehicles, dropping to 0.003g/km after 2035.";
  }
  
  // Determine tax band and cost based on CO2 emissions and registration date
  let taxBand = "Unknown";
  let annualTaxCost = "Unknown";
  let firstYearTaxCost = "Unknown";
  let taxNotes = [];
  
  // Determine if vehicle qualifies for the flat fee (vehicles registered after April 2017)
  let registrationDateObj = null;
  if (registrationDate) {
    const regParts = registrationDate.split('-');
    if (regParts.length === 2) {
      const regYear = parseInt(regParts[0]);
      const regMonth = parseInt(regParts[1]);
      
      if (regYear > 2017 || (regYear === 2017 && regMonth >= 4)) {
        // Post-April 2017 regime - updated to 2024 DVLA rates
        const effectiveCO2 = co2Emissions || estimatedCO2 || 0;
        
        if (fuelType.toUpperCase().includes("DIESEL") && !isDieselRDE2) {
          // Diesel cars not meeting RDE2 standards pay higher rates
          // Standard rate from second licence onwards: £190
          annualTaxCost = "£190 per year";
          
          // First year rate depends on CO2 - updated to April 2024 rates
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
          // Standard rate from second licence onwards: £190
          annualTaxCost = "£190 per year";
          
          // First year rate depends on CO2 - updated to April 2024 rates
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
        } else if (fuelType.toUpperCase().includes("ELECTRIC") || fuelType.toUpperCase().includes("EV")) {
          // Electric vehicles - zero tax until April 2025
          annualTaxCost = "£0 (zero-emission vehicles exempt until April 2025)";
          firstYearTaxCost = "£0";
          taxNotes.push("From April 2025, zero-emission vehicles will be subject to standard rate vehicle tax.");
        } else if (fuelType.toUpperCase().includes("HYBRID") || fuelType.toUpperCase().includes("ALTERNATIVE")) {
          // Alternative fuel vehicles (including hybrids) - updated to April 2024 rates
          annualTaxCost = "£180 per year";
          
          // First year rate for alternative fuel vehicles depends on CO2
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
        
        // Additional rate for expensive vehicles
        if (vehicleData.listPrice && vehicleData.listPrice > 40000) {
          if (fuelType.toUpperCase().includes("ELECTRIC") || fuelType.toUpperCase().includes("EV")) {
            taxNotes.push("As a vehicle with a list price over £40,000, an additional rate of £410 will apply for 5 years from the second licence, but currently suspended for zero emission vehicles until April 2025.");
          } else if (fuelType.toUpperCase().includes("HYBRID") || fuelType.toUpperCase().includes("ALTERNATIVE")) {
            annualTaxCost = "£590 per year for 5 years from second licence, then £180";
            taxNotes.push("As a vehicle with a list price over £40,000, an additional rate of £410 applies for 5 years from the second licence.");
          } else {
            annualTaxCost = "£600 per year for 5 years from second licence, then £190";
            taxNotes.push("As a vehicle with a list price over £40,000, an additional rate of £410 applies for 5 years from the second licence.");
          }
        }
      } else {
        // Pre-April 2017 - Based on CO2 emissions
        // Updated to match April 2024 rates
        const effectiveCO2 = co2Emissions || estimatedCO2 || 0;
        
        if (fuelType.toUpperCase().includes("ALTERNATIVE") || 
            fuelType.toUpperCase().includes("HYBRID")) {
          // Alternative fuel rates
          if (effectiveCO2 <= 100) {
            taxBand = "A";
            annualTaxCost = "£0";
          } else if (effectiveCO2 <= 110) {
            taxBand = "B";
            annualTaxCost = "£10";
          } else if (effectiveCO2 <= 120) {
            taxBand = "C";
            annualTaxCost = "£25";
          } else if (effectiveCO2 <= 130) {
            taxBand = "D";
            annualTaxCost = "£150";
          } else if (effectiveCO2 <= 140) {
            taxBand = "E";
            annualTaxCost = "£180";
          } else if (effectiveCO2 <= 150) {
            taxBand = "F";
            annualTaxCost = "£200";
          } else if (effectiveCO2 <= 165) {
            taxBand = "G";
            annualTaxCost = "£245";
          } else if (effectiveCO2 <= 175) {
            taxBand = "H";
            annualTaxCost = "£295";
          } else if (effectiveCO2 <= 185) {
            taxBand = "I";
            annualTaxCost = "£325";
          } else if (effectiveCO2 <= 200) {
            taxBand = "J";
            annualTaxCost = "£375";
          } else if (effectiveCO2 <= 225) {
            taxBand = "K";
            annualTaxCost = "£405";
          } else if (effectiveCO2 <= 255) {
            taxBand = "L";
            annualTaxCost = "£700";
          } else {
            taxBand = "M";
            annualTaxCost = "£725";
          }
        } else {
          // Standard petrol and diesel rates
          if (effectiveCO2 <= 100) {
            taxBand = "A";
            annualTaxCost = "£0";
          } else if (effectiveCO2 <= 110) {
            taxBand = "B";
            annualTaxCost = "£20";
          } else if (effectiveCO2 <= 120) {
            taxBand = "C";
            annualTaxCost = "£35";
          } else if (effectiveCO2 <= 130) {
            taxBand = "D";
            annualTaxCost = "£160";
          } else if (effectiveCO2 <= 140) {
            taxBand = "E";
            annualTaxCost = "£190";
          } else if (effectiveCO2 <= 150) {
            taxBand = "F";
            annualTaxCost = "£210";
          } else if (effectiveCO2 <= 165) {
            taxBand = "G";
            annualTaxCost = "£255";
          } else if (effectiveCO2 <= 175) {
            taxBand = "H";
            annualTaxCost = "£305";
          } else if (effectiveCO2 <= 185) {
            taxBand = "I";
            annualTaxCost = "£335";
          } else if (effectiveCO2 <= 200) {
            taxBand = "J";
            annualTaxCost = "£385";
          } else if (effectiveCO2 <= 225) {
            taxBand = "K";
            annualTaxCost = "£415";
          } else if (effectiveCO2 <= 255) {
            taxBand = "L";
            annualTaxCost = "£710";
          } else {
            taxBand = "M";
            annualTaxCost = "£735";
          }
        }
      }
    }
  }

  // Determine Scottish LEZ compliance based on the regulations
  const isScottishLEZCompliant = determineScottishLEZCompliance(fuelType, effectiveEuroStatus, vehicleCategory);
  
  // Determine ULEZ compliance for other UK zones
  const isULEZCompliant = determineULEZCompliance(fuelType, makeYear, effectiveEuroStatus);
  
  // Determine clean air zone status
  let ukCleanAirZoneStatus = isULEZCompliant ? "Compliant" : "Non-Compliant";
  let scottishLEZStatus = isScottishLEZCompliant ? "Compliant" : "Non-Compliant";
  
  // Set impact message
  let cleanAirZoneImpact = "No charges in UK or Scottish Clean Air/Low Emission Zones";
  
  if (!isScottishLEZCompliant && !isULEZCompliant) {
    cleanAirZoneImpact = "Vehicle is not compliant with UK ULEZ and Scottish LEZ standards";
  } else if (!isScottishLEZCompliant) {
    cleanAirZoneImpact = "Vehicle is not compliant with Scottish LEZ standards";
  } else if (!isULEZCompliant) {
    cleanAirZoneImpact = "Vehicle is not compliant with UK ULEZ standards";
  }
  
  // Scottish LEZ penalty information
  let scottishLEZPenaltyInfo = null;
  if (!isScottishLEZCompliant) {
    // Get penalty information based on vehicle type according to Scottish regulations
    scottishLEZPenaltyInfo = getScottishLEZPenaltyInfo(vehicleCategory);
  }
  
  // Exemption information for Scottish LEZ
  const scottishExemptions = getScottishLEZExemptions(vehicleData);
  
  // Add specific information about Euro standard pollutant limits if available
  let pollutantLimits = getPollutantLimits(fuelType, effectiveEuroStatus, effectiveEuroSubcategory);
  
  // Return the comprehensive emissions insights
  return {
    co2Emissions: co2Emissions || estimatedCO2,
    euroStatus: effectiveEuroStatus,
    euroSubcategory: effectiveEuroSubcategory,
    rde2Compliant: isDieselRDE2,
    isEstimated,
    taxBand,
    annualTaxCost,
    firstYearTaxCost,
    taxNotes,
    
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
    vehicleCategory
  };
};

/**
 * Determines the vehicle category based on the Scottish LEZ regulations
 */
const determineVehicleCategory = (vehicleData) => {
  const bodyType = vehicleData.bodyType || "";
  const seats = vehicleData.seats ? parseInt(vehicleData.seats) : 0;
  const weight = vehicleData.weight ? parseInt(vehicleData.weight) : 0;
  
  // Scottish LEZ regulations use these categories
  if (bodyType.toLowerCase().includes("motorcycle") || 
      bodyType.toLowerCase().includes("moped")) {
    return "motorcycle or moped";
  }
  
  if (bodyType.toLowerCase().includes("bus") || 
      bodyType.toLowerCase().includes("coach") || 
      (seats > 8 && weight > 5000)) {
    return "bus or coach"; // M3 in Scottish regulations
  }
  
  if (seats > 8 && weight <= 5000) {
    return "minibus"; // M2 in Scottish regulations
  }
  
  if (bodyType.toLowerCase().includes("ambulance")) {
    return "ambulance";
  }
  
  if (bodyType.toLowerCase().includes("hearse")) {
    return "hearse";
  }
  
  if (bodyType.toLowerCase().includes("motor caravan") || 
      bodyType.toLowerCase().includes("camper")) {
    return "motor caravan";
  }
  
  if (weight > 12000 && !bodyType.toLowerCase().includes("passenger")) {
    return "heavy goods vehicle N3";
  }
  
  if (weight > 3500 && weight <= 12000 && !bodyType.toLowerCase().includes("passenger")) {
    return "heavy goods vehicle N2";
  }
  
  if (weight <= 3500 && !bodyType.toLowerCase().includes("passenger")) {
    return "light goods vehicle";
  }
  
  // Default to light passenger vehicle (M1)
  return "light passenger vehicle";
};

/**
 * Determines if a vehicle is compliant with Scottish LEZ standards
 * Based on the Low Emission Zones (Scotland) Regulations 2021
 */
const determineScottishLEZCompliance = (fuelType, euroStatus, vehicleCategory) => {
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
  if (fuelTypeLower.includes('electric') || 
      fuelTypeLower.includes('ev') || 
      fuelTypeLower.includes('hydrogen')) {
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
 */
const determineULEZCompliance = (fuelType, makeYear, euroStatus) => {
  if (!fuelType || !makeYear) return false;
  
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
  if (fuelTypeLower.includes('electric') || 
      fuelTypeLower.includes('ev') || 
      fuelTypeLower.includes('hydrogen')) {
    return true;
  }
  
  // Diesel vehicles need to be Euro 6 (generally post-2015)
  if (fuelTypeLower.includes('diesel')) {
    // Euro 6 became mandatory for new model approvals in Sept 2014
    // And for all new registrations in Sept 2015
    return euroNumber >= 6 || makeYear >= 2015;
  }
  
  // Petrol vehicles need to be Euro 4 (generally post-2006)
  if (fuelTypeLower.includes('petrol')) {
    // Euro 4 became mandatory for new registrations in Jan 2006
    return euroNumber >= 4 || makeYear >= 2006;
  }
  
  // Hybrids follow the same rules as their primary fuel type
  if (fuelTypeLower.includes('hybrid')) {
    if (fuelTypeLower.includes('diesel')) {
      return euroNumber >= 6 || makeYear >= 2015;
    } else {
      // Assume petrol hybrid if not specified
      return euroNumber >= 4 || makeYear >= 2006;
    }
  }
  
  // Motorcycles need to be Euro 3 for ULEZ
  if (fuelTypeLower.includes('motorcycle') || fuelTypeLower.includes('moped')) {
    return euroNumber >= 3 || makeYear >= 2007;
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
  
  // Check for potential exemptions
  
  // Emergency vehicles
  if (vehicleData.taxClass?.toLowerCase().includes('emergency') || 
      vehicleData.bodyType?.toLowerCase().includes('ambulance') ||
      vehicleData.bodyType?.toLowerCase().includes('fire')) {
    exemptions.push({
      type: "Emergency Vehicle Exemption",
      description: "Emergency vehicles including ambulance, fire and police are exempt from Scottish LEZ restrictions"
    });
  }
  
  // Blue badge holders
  if (vehicleData.blueBadgeHolder) {
    exemptions.push({
      type: "Blue Badge Exemption",
      description: "Vehicles used by a Blue Badge holder as a driver or passenger are exempt from Scottish LEZ restrictions"
    });
  }
  
  // Historic vehicles
  if (vehicleData.yearOfManufacture && parseInt(vehicleData.yearOfManufacture) <= (new Date().getFullYear() - 30)) {
    exemptions.push({
      type: "Historic Vehicle Exemption",
      description: "Vehicles over 30 years old that are preserved in their original state are exempt"
    });
  }
  
  // Military vehicles
  if (vehicleData.taxClass?.toLowerCase().includes('military')) {
    exemptions.push({
      type: "Military Vehicle Exemption",
      description: "Vehicles being used for naval, military or air force purposes are exempt"
    });
  }
  
  // Showman's vehicles
  if (vehicleData.taxClass?.toLowerCase().includes('showman')) {
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
 */
const getPollutantLimits = (fuelType, euroStatus, euroSubcategory) => {
  const pollutantLimits = [];
  
  // Only populate this for diesel or petrol vehicles
  if (fuelType.toUpperCase().includes("DIESEL") || fuelType.toUpperCase().includes("PETROL")) {
    if (euroStatus === "Euro 6" || euroSubcategory?.includes("Euro 6")) {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        return [
          "CO: 0.50 g/km",
          "NOx: 0.080 g/km",
          "PM: 0.0045 g/km",
          "PN: 6×10¹¹ #/km"
        ];
      } else { // Petrol
        return [
          "CO: 1.0 g/km",
          "NOx: 0.060 g/km",
          "NMHC: 0.068 g/km",
          "THC: 0.10 g/km",
          "PM: 0.0045 g/km (direct injection only)",
          "PN: 6×10¹¹ #/km (direct injection only)"
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
          "NOx: 0.180 g/km",
          "HC+NOx: 0.230 g/km",
          "PM: 0.005 g/km",
          "PN: 6×10¹¹ #/km"
        ];
      } else { // Petrol
        return [
          "CO: 1.0 g/km",
          "NOx: 0.060 g/km",
          "HC: 0.10 g/km",
          "NMHC: 0.068 g/km",
          "PM: 0.005 g/km (direct injection only)"
        ];
      }
    } else if (euroStatus === "Euro 3" || euroStatus === "Euro III") {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        return [
          "CO: 0.64 g/km",
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
    } else if (euroStatus === "Euro 7") {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        return [
          "CO: 0.50 g/km",
          "NOx: 0.080 g/km",
          "PM: 0.0045 g/km",
          "PN: 6×10¹¹ #/km (includes particles down to 10nm)",
          "Brake PM10: 0.007 g/km"
        ];
      } else { // Petrol
        return [
          "CO: 1.0 g/km",
          "NOx: 0.060 g/km",
          "NMHC: 0.068 g/km",
          "THC: 0.10 g/km",
          "PM: 0.0045 g/km",
          "PN: 6×10¹¹ #/km (includes particles down to 10nm)",
          "Brake PM10: 0.007 g/km"
        ];
      }
    }
  } else if (fuelType.toUpperCase().includes("MOTORCYCLE") || fuelType.toUpperCase().includes("MOPED")) {
    if (euroStatus === "Euro 3") {
      return [
        "CO: 2.0 g/km",
        "HC: 0.3 g/km (for engines >150cc)",
        "HC: 0.8 g/km (for engines ≤150cc)",
        "NOx: 0.15 g/km"
      ];
    }
  }
  
  return pollutantLimits;
};

export default EmissionsInsightsCalculator;