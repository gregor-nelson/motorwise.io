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
} from '../../../styles/theme';

import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8000/api/v1'   // Development - direct to API port
                    : '/api/v1';                       // Production - use relative URL for Nginx proxy

/**
 * VehicleInsights Component
 * Displays advanced analytics for vehicle data
 * - Self-contained with its own data fetching
 * - Matches the structure of the VehicleMileageInsights component
 */
const VehicleInsights = ({ registration, vin }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [insights, setInsights] = useState({
    ownershipInsights: null,
    statusInsights: null,
    emissionsInsights: null,
    ageValueInsights: null,
    fuelEfficiencyInsights: null
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
        
        const data = await response.json();
        console.log('Received vehicle data:', data);
        processVehicleData(data);
      } catch (err) {
        console.error("Error fetching vehicle data for insights:", err);
        setError(err.message || "Failed to load vehicle insights");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [registration, vin]);

  // Process vehicle data from API
  const processVehicleData = (data) => {
    console.log('Processing vehicle data for insights');
    
    // Store the vehicle data
    setVehicleData(data);
    
    // Generate insights based on the data
    calculateInsights(data);
  };

  // Calculate all insights based on the vehicle data
  const calculateInsights = (data) => {
    setInsights({
      ownershipInsights: calculateOwnershipInsights(data),
      statusInsights: calculateStatusInsights(data),
      emissionsInsights: calculateEmissionsInsights(data),
      ageValueInsights: calculateAgeValueInsights(data),
      fuelEfficiencyInsights: calculateFuelEfficiencyInsights(data)
    });
  };

  // Calculate ownership insights
  const calculateOwnershipInsights = (data) => {
    if (!data) return null;
    
    // Calculate years with current owner (based on V5C)
    const currentYear = new Date().getFullYear();
    let v5cDate = new Date();
    let yearsWithCurrentOwner = 0;
    
    if (data.dateOfLastV5CIssued) {
      try {
        v5cDate = new Date(data.dateOfLastV5CIssued);
        yearsWithCurrentOwner = currentYear - v5cDate.getFullYear();
      } catch (e) {
        console.warn('Error calculating years with current owner');
      }
    }
    
    // Calculate registration gap (manufacturing to DVLA registration)
    let regGapYears = 0;
    
    if (data.yearOfManufacture && data.monthOfFirstDvlaRegistration) {
      try {
        const manufactureYear = parseInt(data.yearOfManufacture);
        const firstRegYear = parseInt(data.monthOfFirstDvlaRegistration.substring(0, 4));
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

  // Calculate vehicle status insights
  const calculateStatusInsights = (data) => {
    if (!data) return null;
    
    // Extract status information
    const taxStatus = data.taxStatus || "Unknown";
    const motStatus = data.motStatus || "Unknown";
    let motExpiryDate = null;
    
    if (data.motExpiryDate) {
      try {
        motExpiryDate = new Date(data.motExpiryDate);
      } catch (e) {
        console.warn('Error parsing MOT expiry date');
      }
    }
    
    // Determine if the car is driveable (taxed and MOT valid)
    const isTaxed = taxStatus.toUpperCase() === "TAXED";
    const hasValidMot = motStatus.toUpperCase() === "VALID";
    const isSORNA = taxStatus.toUpperCase() === "SORN";
    
    let driveabilityStatus = "Unknown";
    let statusRiskLevel = "Medium";
    
    if (isTaxed && hasValidMot) {
      driveabilityStatus = "Fully Road Legal";
      statusRiskLevel = "Low";
    } else if (isSORNA && hasValidMot) {
      driveabilityStatus = "SORN but MOT Valid";
      statusRiskLevel = "Medium";
    } else if (!isTaxed && hasValidMot) {
      driveabilityStatus = "Requires Tax";
      statusRiskLevel = "Medium";
    } else if (isTaxed && !hasValidMot) {
      driveabilityStatus = "Requires MOT";
      statusRiskLevel = "Medium";
    } else {
      driveabilityStatus = "Not Road Legal";
      statusRiskLevel = "High";
    }
    
    // Check if MOT is expiring soon
    let motExpiringStatus = "Unknown";
    let daysUntilMotExpiry = 0;
    
    if (motExpiryDate) {
      const currentDate = new Date();
      daysUntilMotExpiry = Math.floor((motExpiryDate - currentDate) / (1000 * 60 * 60 * 24));
      
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
    
    // Risk factors and considerations
    const riskFactors = [];
    const considerations = [];
    
    if (isSORNA) {
      considerations.push("Vehicle is declared SORN - you'll need to tax it before driving on public roads");
    }
    
    if (motExpiringStatus === "Expired") {
      riskFactors.push("MOT has expired - vehicle cannot legally be driven on public roads");
    } else if (motExpiringStatus === "Very Soon" || motExpiringStatus === "Soon") {
      considerations.push(`MOT expires in ${daysUntilMotExpiry} days - consider arranging a new test soon`);
    }
    
    if (data.markedForExport === "Yes" || data.markedForExport === true) {
      riskFactors.push("Vehicle is marked for export - check documentation carefully");
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
      considerations
    };
  };

  // Calculate emissions and tax insights
  const calculateEmissionsInsights = (data) => {
    if (!data) return null;
    
    // Extract basic emissions data
    const co2Emissions = data.co2Emissions || null;
    const euroStatus = data.euroStatus || null;
    const fuelType = data.fuelType || "Unknown";
    const engineSize = data.engineCapacity ? `${data.engineCapacity}cc` : null;
    const makeYear = data.yearOfManufacture ? parseInt(data.yearOfManufacture) : null;
    
    // Estimate emissions if not available based on vehicle type
    let estimatedCO2 = null;
    let estimatedEuroStatus = null;
    let isEstimated = false;
    
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
    
    // Estimate Euro status if not available
    if (!euroStatus && makeYear) {
      isEstimated = true;
      
      if (fuelType.toUpperCase().includes("DIESEL")) {
        if (makeYear < 2001) {
          estimatedEuroStatus = "Euro 2";
        } else if (makeYear < 2006) {
          estimatedEuroStatus = "Euro 3";
        } else if (makeYear < 2011) {
          estimatedEuroStatus = "Euro 4";
        } else if (makeYear < 2015) {
          estimatedEuroStatus = "Euro 5";
        } else {
          estimatedEuroStatus = "Euro 6";
        }
      } else if (fuelType.toUpperCase().includes("PETROL")) {
        if (makeYear < 2001) {
          estimatedEuroStatus = "Euro 2";
        } else if (makeYear < 2006) {
          estimatedEuroStatus = "Euro 3";
        } else if (makeYear < 2011) {
          estimatedEuroStatus = "Euro 4";
        } else if (makeYear < 2015) {
          estimatedEuroStatus = "Euro 5";
        } else {
          estimatedEuroStatus = "Euro 6";
        }
      }
    }
    
    // Determine tax band and cost based on CO2 emissions and registration date
    let taxBand = "Unknown";
    let annualTaxCost = "Unknown";
    let firstYearTaxCost = "Unknown";
    
    // Determine if vehicle qualifies for the flat fee (vehicles registered after April 2017)
    let registrationDate = null;
    if (data.monthOfFirstRegistration) {
      const regParts = data.monthOfFirstRegistration.split('-');
      if (regParts.length === 2) {
        const regYear = parseInt(regParts[0]);
        const regMonth = parseInt(regParts[1]);
        
        if (regYear > 2017 || (regYear === 2017 && regMonth >= 4)) {
          // Post-April 2017 regime
          const effectiveCO2 = co2Emissions || estimatedCO2 || 0;
          
          if (fuelType.toUpperCase().includes("PETROL") || fuelType.toUpperCase().includes("DIESEL")) {
            // Standard rate £165 (2024 rates) plus £390 for vehicles over £40,000
            annualTaxCost = "£165 per year";
            
            // First year rate depends on CO2
            if (effectiveCO2 <= 50) {
              firstYearTaxCost = "£10";
            } else if (effectiveCO2 <= 75) {
              firstYearTaxCost = "£30";
            } else if (effectiveCO2 <= 90) {
              firstYearTaxCost = "£130";
            } else if (effectiveCO2 <= 100) {
              firstYearTaxCost = "£150";
            } else if (effectiveCO2 <= 110) {
              firstYearTaxCost = "£170";
            } else if (effectiveCO2 <= 130) {
              firstYearTaxCost = "£190";
            } else if (effectiveCO2 <= 150) {
              firstYearTaxCost = "£230";
            } else if (effectiveCO2 <= 170) {
              firstYearTaxCost = "£585";
            } else if (effectiveCO2 <= 190) {
              firstYearTaxCost = "£945";
            } else if (effectiveCO2 <= 225) {
              firstYearTaxCost = "£1,420";
            } else if (effectiveCO2 <= 255) {
              firstYearTaxCost = "£2,015";
            } else {
              firstYearTaxCost = "£2,365";
            }
          } else if (fuelType.toUpperCase().includes("ELECTRIC") || fuelType.toUpperCase().includes("EV")) {
            // Electric vehicles are exempt until 2025
            annualTaxCost = "£0 (zero-emission vehicles currently exempt)";
            firstYearTaxCost = "£0";
          } else if (fuelType.toUpperCase().includes("HYBRID")) {
            // Hybrids have the standard rate
            annualTaxCost = "£165 per year";
            
            // First year rate for hybrids depends on CO2
            if (effectiveCO2 <= 50) {
              firstYearTaxCost = "£10";
            } else if (effectiveCO2 <= 75) {
              firstYearTaxCost = "£30";
            } else {
              // Default to higher bands for higher emission hybrids
              firstYearTaxCost = "£130 to £190 depending on emissions";
            }
          }
        } else {
          // Pre-April 2017 - Based on CO2 emissions
          const effectiveCO2 = co2Emissions || estimatedCO2 || 0;
          
          if (effectiveCO2 <= 100) {
            taxBand = "A";
            annualTaxCost = "£0";
          } else if (effectiveCO2 <= 110) {
            taxBand = "B";
            annualTaxCost = "£20";
          } else if (effectiveCO2 <= 120) {
            taxBand = "C";
            annualTaxCost = "£30";
          } else if (effectiveCO2 <= 130) {
            taxBand = "D";
            annualTaxCost = "£135";
          } else if (effectiveCO2 <= 140) {
            taxBand = "E";
            annualTaxCost = "£160";
          } else if (effectiveCO2 <= 150) {
            taxBand = "F";
            annualTaxCost = "£180";
          } else if (effectiveCO2 <= 165) {
            taxBand = "G";
            annualTaxCost = "£220";
          } else if (effectiveCO2 <= 175) {
            taxBand = "H";
            annualTaxCost = "£265";
          } else if (effectiveCO2 <= 185) {
            taxBand = "I";
            annualTaxCost = "£290";
          } else if (effectiveCO2 <= 200) {
            taxBand = "J";
            annualTaxCost = "£330";
          } else if (effectiveCO2 <= 225) {
            taxBand = "K";
            annualTaxCost = "£345";
          } else if (effectiveCO2 <= 255) {
            taxBand = "L";
            annualTaxCost = "£585";
          } else {
            taxBand = "M";
            annualTaxCost = "£630";
          }
        }
      }
    }
    
    // Determine ULEZ compliance
    const isULEZCompliant = determineULEZCompliance(fuelType, makeYear, euroStatus || estimatedEuroStatus);
    let cleanAirZoneStatus = isULEZCompliant ? "Compliant" : "Non-Compliant";
    let cleanAirZoneImpact = "No significant impact";
    
    if (!isULEZCompliant) {
      if (fuelType.toUpperCase().includes("DIESEL")) {
        cleanAirZoneImpact = "Vehicle will incur daily charges in Ultra Low Emission Zones (£12.50 in London) and Clean Air Zones";
      } else {
        cleanAirZoneImpact = "Vehicle may incur charges in some Ultra Low Emission Zones including London (£12.50 per day)";
      }
    }
    
    return {
      co2Emissions: co2Emissions || estimatedCO2,
      euroStatus: euroStatus || estimatedEuroStatus,
      isEstimated,
      taxBand,
      annualTaxCost,
      firstYearTaxCost,
      cleanAirZoneStatus,
      cleanAirZoneImpact,
      isULEZCompliant
    };
  };

  // Helper function to determine ULEZ compliance
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
    
    // Diesel vehicles need to be Euro 6 (generally post-2015)
    if (fuelTypeLower.includes('diesel')) {
      return euroNumber >= 6 || makeYear >= 2015;
    }
    
    // Petrol vehicles need to be Euro 4 (generally post-2006)
    if (fuelTypeLower.includes('petrol')) {
      return euroNumber >= 4 || makeYear >= 2006;
    }
    
    // Electric and hydrogen vehicles are always compliant
    if (fuelTypeLower.includes('electric') || 
        fuelTypeLower.includes('ev') || 
        fuelTypeLower.includes('hydrogen')) {
      return true;
    }
    
    // Hybrids follow the same rules as their primary fuel type
    if (fuelTypeLower.includes('hybrid')) {
      if (fuelTypeLower.includes('diesel')) {
        return euroNumber >= 6 || makeYear >= 2015;
      } else {
        return euroNumber >= 4 || makeYear >= 2006;
      }
    }
    
    // Default to non-compliant if we can't determine
    return false;
  };

  // Calculate age and value insights
  const calculateAgeValueInsights = (data) => {
    if (!data) return null;
    
    // Calculate vehicle age
    const currentYear = new Date().getFullYear();
    let manufactureYear = null;
    let vehicleAge = null;
    
    if (data.yearOfManufacture) {
      try {
        manufactureYear = parseInt(data.yearOfManufacture);
        vehicleAge = currentYear - manufactureYear;
      } catch (e) {
        console.warn('Error calculating vehicle age');
      }
    }
    
    if (!vehicleAge) return null;
    
    // Determine age category
    let ageCategory = "Unknown";
    let ageCategoryDescription = "";
    
    if (vehicleAge <= 3) {
      ageCategory = "Nearly New";
      ageCategoryDescription = "Vehicle is still considered very recent and may have remaining manufacturer warranty";
    } else if (vehicleAge <= 7) {
      ageCategory = "Mid-Life";
      ageCategoryDescription = "Vehicle is in its mid-life period where maintenance costs typically remain reasonable";
    } else if (vehicleAge <= 12) {
      ageCategory = "Mature";
      ageCategoryDescription = "Vehicle is mature and may require more frequent maintenance";
    } else {
      ageCategory = "Veteran";
      ageCategoryDescription = "Vehicle is significantly older than the average UK car (8 years) and may require specialized maintenance";
    }
    
    // Common maintenance issues based on make and age
    const make = data.make || "Unknown";
    const fuelType = data.fuelType || "Unknown";
    
    let commonMaintenanceIssues = [];
    
    // Add general age-related issues
    if (vehicleAge > 10) {
      commonMaintenanceIssues.push("Suspension components");
      commonMaintenanceIssues.push("Cooling system");
      commonMaintenanceIssues.push("Electrical systems");
    } else if (vehicleAge > 5) {
      commonMaintenanceIssues.push("Timing belt/chain (if not already replaced)");
      commonMaintenanceIssues.push("Fluid leaks");
    }
    
    // Add fuel-type specific issues
    if (fuelType.toUpperCase().includes("DIESEL") && vehicleAge > 5) {
      commonMaintenanceIssues.push("DPF (Diesel Particulate Filter)");
      commonMaintenanceIssues.push("EGR valve");
      if (vehicleAge > 8) {
        commonMaintenanceIssues.push("Injectors");
        commonMaintenanceIssues.push("Turbocharger");
      }
    }
    
    // Add make-specific common issues (simplified for demo)
    if (make.toUpperCase().includes("LAND ROVER") || make.toUpperCase().includes("RANGE ROVER")) {
      commonMaintenanceIssues.push("Air suspension (if equipped)");
      commonMaintenanceIssues.push("Transfer case");
      commonMaintenanceIssues.push("Differential");
      if (vehicleAge > 7) {
        commonMaintenanceIssues.push("Sunroof drains");
        commonMaintenanceIssues.push("Electrical modules");
      }
    } else if (make.toUpperCase().includes("BMW") || make.toUpperCase().includes("MERCEDES")) {
      commonMaintenanceIssues.push("VANOS/VVT systems");
      if (vehicleAge > 8) {
        commonMaintenanceIssues.push("Air suspension (if equipped)");
        commonMaintenanceIssues.push("Electronic modules");
      }
    } else if (make.toUpperCase().includes("VOLKSWAGEN") || 
               make.toUpperCase().includes("AUDI") || 
               make.toUpperCase().includes("SKODA") || 
               make.toUpperCase().includes("SEAT")) {
      if (vehicleAge > 5 && fuelType.toUpperCase().includes("DIESEL")) {
        commonMaintenanceIssues.push("Timing chain tensioners");
        commonMaintenanceIssues.push("DSG transmission (if equipped)");
      }
    } else if (make.toUpperCase().includes("FORD") || make.toUpperCase().includes("VAUXHALL")) {
      if (vehicleAge > 7) {
        commonMaintenanceIssues.push("Clutch");
        commonMaintenanceIssues.push("Water pump");
      }
    }
    
    // Remove duplicates and limit to most important issues
    commonMaintenanceIssues = [...new Set(commonMaintenanceIssues)].slice(0, 5);
    
    // Estimate typical remaining service life
    let typicalRemainingYears = 0;
    
    if (fuelType.toUpperCase().includes("DIESEL")) {
      typicalRemainingYears = Math.max(0, 18 - vehicleAge);
    } else if (fuelType.toUpperCase().includes("PETROL")) {
      typicalRemainingYears = Math.max(0, 15 - vehicleAge);
    } else if (fuelType.toUpperCase().includes("HYBRID")) {
      typicalRemainingYears = Math.max(0, 18 - vehicleAge);
    } else if (fuelType.toUpperCase().includes("ELECTRIC")) {
      typicalRemainingYears = Math.max(0, 20 - vehicleAge);
    } else {
      typicalRemainingYears = Math.max(0, 15 - vehicleAge);
    }
    
    // Adjust based on make reputation for longevity
    if (make.toUpperCase().includes("TOYOTA") || 
        make.toUpperCase().includes("LEXUS") || 
        make.toUpperCase().includes("HONDA")) {
      typicalRemainingYears += 2;
    } else if (make.toUpperCase().includes("LAND ROVER") || 
              make.toUpperCase().includes("JAGUAR") || 
              make.toUpperCase().includes("ALFA ROMEO")) {
      typicalRemainingYears -= 2;
    }
    
    return {
      vehicleAge,
      ageCategory,
      ageCategoryDescription,
      commonMaintenanceIssues,
      typicalRemainingYears
    };
  };

  // Calculate fuel efficiency insights
  const calculateFuelEfficiencyInsights = (data) => {
    if (!data) return null;
    
    const make = data.make || "Unknown";
    const fuelType = data.fuelType || "Unknown";
    const engineSize = data.engineCapacity ? parseInt(data.engineCapacity) : null;
    const makeYear = data.yearOfManufacture ? parseInt(data.yearOfManufacture) : null;
    
    if (!engineSize || !makeYear) return null;
    
    // Estimate MPG based on vehicle characteristics
    let estimatedMPGCombined = 0;
    let estimatedMPGUrban = 0;
    let estimatedMPGExtraUrban = 0;
    
    if (fuelType.toUpperCase().includes("DIESEL")) {
      // Base values for diesel
      if (engineSize <= 1600) {
        estimatedMPGCombined = 65;
        estimatedMPGUrban = 55;
        estimatedMPGExtraUrban = 72;
      } else if (engineSize <= 2000) {
        estimatedMPGCombined = 55;
        estimatedMPGUrban = 45;
        estimatedMPGExtraUrban = 62;
      } else if (engineSize <= 2500) {
        estimatedMPGCombined = 38;
        estimatedMPGUrban = 30;
        estimatedMPGExtraUrban = 45;
      } else {
        estimatedMPGCombined = 32;
        estimatedMPGUrban = 25;
        estimatedMPGExtraUrban = 38;
      }
      
      // Adjust for age
      if (makeYear < 2010) {
        estimatedMPGCombined = Math.round(estimatedMPGCombined * 0.9);
        estimatedMPGUrban = Math.round(estimatedMPGUrban * 0.9);
        estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 0.9);
      } else if (makeYear > 2015) {
        estimatedMPGCombined = Math.round(estimatedMPGCombined * 1.1);
        estimatedMPGUrban = Math.round(estimatedMPGUrban * 1.1);
        estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 1.1);
      }
    } else if (fuelType.toUpperCase().includes("PETROL")) {
      // Base values for petrol
      if (engineSize <= 1200) {
        estimatedMPGCombined = 55;
        estimatedMPGUrban = 45;
        estimatedMPGExtraUrban = 62;
      } else if (engineSize <= 1600) {
        estimatedMPGCombined = 48;
        estimatedMPGUrban = 38;
        estimatedMPGExtraUrban = 55;
      } else if (engineSize <= 2000) {
        estimatedMPGCombined = 42;
        estimatedMPGUrban = 32;
        estimatedMPGExtraUrban = 48;
      } else if (engineSize <= 3000) {
        estimatedMPGCombined = 32;
        estimatedMPGUrban = 25;
        estimatedMPGExtraUrban = 38;
      } else {
        estimatedMPGCombined = 25;
        estimatedMPGUrban = 18;
        estimatedMPGExtraUrban = 30;
      }
      
      // Adjust for age
      if (makeYear < 2010) {
        estimatedMPGCombined = Math.round(estimatedMPGCombined * 0.9);
        estimatedMPGUrban = Math.round(estimatedMPGUrban * 0.9);
        estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 0.9);
      } else if (makeYear > 2015) {
        estimatedMPGCombined = Math.round(estimatedMPGCombined * 1.1);
        estimatedMPGUrban = Math.round(estimatedMPGUrban * 1.1);
        estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 1.1);
      }
    } else if (fuelType.toUpperCase().includes("HYBRID")) {
      // Base values for hybrid
      if (engineSize <= 1600) {
        estimatedMPGCombined = 75;
        estimatedMPGUrban = 85; // Hybrids often better in urban
        estimatedMPGExtraUrban = 70;
      } else if (engineSize <= 2000) {
        estimatedMPGCombined = 65;
        estimatedMPGUrban = 75;
        estimatedMPGExtraUrban = 60;
      } else if (engineSize <= 3000) {
        estimatedMPGCombined = 45;
        estimatedMPGUrban = 50;
        estimatedMPGExtraUrban = 42;
      } else {
        estimatedMPGCombined = 35;
        estimatedMPGUrban = 40;
        estimatedMPGExtraUrban = 32;
      }
    } else if (fuelType.toUpperCase().includes("ELECTRIC")) {
      // For electric, we'll use miles per kWh instead
      return {
        isElectric: true,
        estimatedMilesPerKWh: makeYear > 2018 ? 3.8 : 3.2,
        estimatedCostPerMile: 0.07, // Based on average UK electricity cost
        annualSavingsVsPetrol: "£800-£1,300",
        batteryCapacityEstimate: makeYear > 2018 ? "50-80 kWh" : "24-40 kWh",
        estimatedRange: makeYear > 2018 ? "200-280 miles" : "80-150 miles"
      };
    }
    
    // Further adjust for specific makes based on their efficiency reputations
    if (make.toUpperCase().includes("TOYOTA") || 
        make.toUpperCase().includes("HONDA") || 
        make.toUpperCase().includes("SUZUKI") || 
        make.toUpperCase().includes("MAZDA")) {
      // Japanese brands often have better efficiency
      estimatedMPGCombined = Math.round(estimatedMPGCombined * 1.08);
      estimatedMPGUrban = Math.round(estimatedMPGUrban * 1.08);
      estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 1.08);
    } else if (make.toUpperCase().includes("LAND ROVER") || 
              make.toUpperCase().includes("RANGE ROVER") || 
              make.toUpperCase().includes("JEEP")) {
      // Large SUVs often have worse efficiency
      estimatedMPGCombined = Math.round(estimatedMPGCombined * 0.85);
      estimatedMPGUrban = Math.round(estimatedMPGUrban * 0.85);
      estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 0.85);
    }
    
    // Calculate cost per mile based on current fuel prices
    let costPerMile = 0;
    
    if (fuelType.toUpperCase().includes("DIESEL")) {
      // Diesel price per liter (UK average March 2025)
      const fuelCostPerLiter = 1.50;
      costPerMile = (fuelCostPerLiter * 4.54609) / (estimatedMPGCombined);
    } else if (fuelType.toUpperCase().includes("PETROL")) {
      // Petrol price per liter (UK average March 2025)
      const fuelCostPerLiter = 1.45;
      costPerMile = (fuelCostPerLiter * 4.54609) / (estimatedMPGCombined);
    } else if (fuelType.toUpperCase().includes("HYBRID")) {
      // Hybrid uses petrol prices
      const fuelCostPerLiter = 1.45;
      costPerMile = (fuelCostPerLiter * 4.54609) / (estimatedMPGCombined);
    }
    
    // Calculate annual fuel cost based on average UK mileage
    const averageAnnualMileage = 7200; // Updated 2024 figure
    const annualFuelCost = costPerMile * averageAnnualMileage;
    
    return {
      estimatedMPGCombined,
      estimatedMPGUrban,
      estimatedMPGExtraUrban,
      costPerMile: Math.round(costPerMile * 100) / 100,
      annualFuelCost: Math.round(annualFuelCost),
      isElectric: false
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
        <GovUKHeadingM>Vehicle Insights</GovUKHeadingM>
        <PremiumInfoPanel>
          <GovUKHeadingS>Error Loading Insights</GovUKHeadingS>
          <GovUKBody>{error}</GovUKBody>
        </PremiumInfoPanel>
      </div>
    );
  }

  // Show empty state
  if (!vehicleData) {
    return (
      <div>
        <GovUKHeadingM>Vehicle Insights</GovUKHeadingM>
        <PremiumInfoPanel>
          <GovUKBody>No vehicle data available for analysis.</GovUKBody>
        </PremiumInfoPanel>
      </div>
    );
  }

  // Function to format factors for consistency
  const renderFactorsList = (factors, iconColor) => {
    if (!factors || factors.length === 0) return null;
    
    return (
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {factors.map((factor, index) => (
          <li key={index} style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            marginBottom: '8px',
            fontSize: '0.875rem'
          }}>
            <span style={{ 
              marginRight: '8px', 
              color: iconColor,
              flexShrink: 0,
              marginTop: '2px'
            }}>
              {iconColor === COLORS.RED ? <WarningIcon  size={16} /> : <InfoIcon  size={16} />}
            </span>
            <span>{factor}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Render insights
  return (
    <div>
      <GovUKHeadingM>Vehicle Insights</GovUKHeadingM>
      
      {/* Ownership Insights */}
      {insights.ownershipInsights && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Ownership & History Insights</GovUKHeadingS>
          <GovUKBody>
            This vehicle has been with the same keeper since <strong>
              {insights.ownershipInsights.v5cDate.toLocaleDateString('en-GB', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}
            </strong> ({insights.ownershipInsights.yearsWithCurrentOwner} years), 
            suggesting <strong>{insights.ownershipInsights.ownershipStability.toLowerCase()}</strong> ownership.
          </GovUKBody>
          
          <ReportTable>
            <tbody>
              <tr>
                <td>Ownership Status</td>
                <td>{insights.ownershipInsights.ownershipStability}</td>
              </tr>
              {insights.ownershipInsights.regGapYears > 0 && (
                <tr>
                  <td>Registration Gap</td>
                  <td>{insights.ownershipInsights.regGapYears} years between manufacture and DVLA registration</td>
                </tr>
              )}
              <tr>
                <td>Risk Level</td>
                <td style={{
                  color: insights.ownershipInsights.ownershipRiskLevel === 'Low' ? COLORS.GREEN :
                         insights.ownershipInsights.ownershipRiskLevel === 'Medium' ? '#f47738' : COLORS.RED
                }}>
                  {insights.ownershipInsights.ownershipRiskLevel}
                </td>
              </tr>
            </tbody>
          </ReportTable>
          
          {insights.ownershipInsights.riskFactors && insights.ownershipInsights.riskFactors.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <GovUKBodyS style={{ fontWeight: 'bold', color: COLORS.RED, marginBottom: '5px' }}>
                Risk Factors:
              </GovUKBodyS>
              {renderFactorsList(insights.ownershipInsights.riskFactors, COLORS.RED)}
            </div>
          )}
          
          {insights.ownershipInsights.positiveFactors && insights.ownershipInsights.positiveFactors.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <GovUKBodyS style={{ fontWeight: 'bold', color: COLORS.GREEN, marginBottom: '5px' }}>
                Positive Factors:
              </GovUKBodyS>
              {renderFactorsList(insights.ownershipInsights.positiveFactors, COLORS.GREEN)}
            </div>
          )}
        </PremiumInfoPanel>
      )}
      
      {/* Status Insights */}
      {insights.statusInsights && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Current Status Insights</GovUKHeadingS>
          <GovUKBody>
            This vehicle is currently <strong>{insights.statusInsights.taxStatus}</strong> with 
            a <strong>{insights.statusInsights.motStatus.toLowerCase()}</strong> MOT, 
            making its driveability status: <strong>{insights.statusInsights.driveabilityStatus}</strong>.
          </GovUKBody>
          
          <ReportTable>
            <tbody>
              <tr>
                <td>Driveability Status</td>
                <td>{insights.statusInsights.driveabilityStatus}</td>
              </tr>
              {insights.statusInsights.motExpiryDate && (
                <tr>
                  <td>MOT Expires</td>
                  <td>
                    {insights.statusInsights.motExpiryDate.toLocaleDateString('en-GB', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                    {insights.statusInsights.daysUntilMotExpiry > 0 ? 
                      ` (${insights.statusInsights.daysUntilMotExpiry} days)` : 
                      ' (Expired)'}
                  </td>
                </tr>
              )}
              <tr>
                <td>Risk Level</td>
                <td style={{
                  color: insights.statusInsights.statusRiskLevel === 'Low' ? COLORS.GREEN :
                         insights.statusInsights.statusRiskLevel === 'Medium' ? '#f47738' : COLORS.RED
                }}>
                  {insights.statusInsights.statusRiskLevel}
                </td>
              </tr>
            </tbody>
          </ReportTable>
          
          {insights.statusInsights.riskFactors && insights.statusInsights.riskFactors.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <GovUKBodyS style={{ fontWeight: 'bold', color: COLORS.RED, marginBottom: '5px' }}>
                Risk Factors:
              </GovUKBodyS>
              {renderFactorsList(insights.statusInsights.riskFactors, COLORS.RED)}
            </div>
          )}
          
          {insights.statusInsights.considerations && insights.statusInsights.considerations.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <GovUKBodyS style={{ fontWeight: 'bold', color: '#f47738', marginBottom: '5px' }}>
                Considerations:
              </GovUKBodyS>
              {renderFactorsList(insights.statusInsights.considerations, '#f47738')}
            </div>
          )}
        </PremiumInfoPanel>
      )}
      
      {/* Emissions & Tax Insights */}
      {insights.emissionsInsights && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Emissions & Tax Insights</GovUKHeadingS>
          <GovUKBody>
            {insights.emissionsInsights.isEstimated ? 
              `Based on this vehicle's specifications, we estimate its CO2 emissions to be approximately ${insights.emissionsInsights.co2Emissions}g/km.` :
              `This vehicle's CO2 emissions are ${insights.emissionsInsights.co2Emissions}g/km.`
            }
            {insights.emissionsInsights.euroStatus && ` It meets ${insights.emissionsInsights.euroStatus} emissions standards.`}
          </GovUKBody>
          
          <ReportTable>
            <tbody>
              <tr>
                <td>Annual Road Tax</td>
                <td>{insights.emissionsInsights.annualTaxCost}</td>
              </tr>
              {insights.emissionsInsights.taxBand && (
                <tr>
                  <td>Tax Band</td>
                  <td>{insights.emissionsInsights.taxBand}</td>
                </tr>
              )}
              {insights.emissionsInsights.firstYearTaxCost && (
                <tr>
                  <td>First Year Tax</td>
                  <td>{insights.emissionsInsights.firstYearTaxCost}</td>
                </tr>
              )}
              <tr>
                <td>ULEZ/CAZ Status</td>
                <td style={{
                  color: insights.emissionsInsights.isULEZCompliant ? COLORS.GREEN : COLORS.RED
                }}>
                  {insights.emissionsInsights.cleanAirZoneStatus}
                </td>
              </tr>
            </tbody>
          </ReportTable>
          
          {!insights.emissionsInsights.isULEZCompliant && (
            <div style={{ marginTop: '15px' }}>
              <GovUKBodyS style={{ fontWeight: 'bold', color: COLORS.RED, marginBottom: '5px' }}>
                Clean Air Zone Impact:
              </GovUKBodyS>
              {renderFactorsList([insights.emissionsInsights.cleanAirZoneImpact], COLORS.RED)}
            </div>
          )}
          
          {insights.emissionsInsights.isEstimated && (
            <GovUKBodyS style={{ marginTop: '15px', fontStyle: 'italic' }}>
              Note: Emissions and Euro status are estimated based on the vehicle's specifications as the official data is not available.
            </GovUKBodyS>
          )}
        </PremiumInfoPanel>
      )}
      
      {/* Age & Value Insights */}
      {insights.ageValueInsights && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Age & Maintenance Insights</GovUKHeadingS>
          <GovUKBody>
            At <strong>{insights.ageValueInsights.vehicleAge} years old</strong>, this vehicle is classified 
            as <strong>{insights.ageValueInsights.ageCategory}</strong>. 
            {insights.ageValueInsights.ageCategoryDescription}
          </GovUKBody>
          
          <ReportTable>
            <tbody>
              <tr>
                <td>Vehicle Age</td>
                <td>{insights.ageValueInsights.vehicleAge} years</td>
              </tr>
              <tr>
                <td>Age Category</td>
                <td>{insights.ageValueInsights.ageCategory}</td>
              </tr>
              <tr>
                <td>Typical Remaining Service Life</td>
                <td>Approximately {insights.ageValueInsights.typicalRemainingYears} years with proper maintenance</td>
              </tr>
            </tbody>
          </ReportTable>
          
          {insights.ageValueInsights.commonMaintenanceIssues && insights.ageValueInsights.commonMaintenanceIssues.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <GovUKBodyS style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Areas to Check During Inspection:
              </GovUKBodyS>
              {renderFactorsList(insights.ageValueInsights.commonMaintenanceIssues, '#f47738')}
              <GovUKBodyS style={{ marginTop: '10px', fontStyle: 'italic' }}>
                Note: These are common areas of concern for vehicles of this age, make and type. 
                A professional inspection is recommended before purchase.
              </GovUKBodyS>
            </div>
          )}
        </PremiumInfoPanel>
      )}
      
      {/* Fuel Efficiency Insights */}
      {insights.fuelEfficiencyInsights && (
        <PremiumInfoPanel>
          <GovUKHeadingS>Fuel Efficiency Insights</GovUKHeadingS>
          
          {insights.fuelEfficiencyInsights.isElectric ? (
            <>
              <GovUKBody>
                As an electric vehicle, this car has an estimated efficiency 
                of <strong>{insights.fuelEfficiencyInsights.estimatedMilesPerKWh} miles per kWh</strong>, 
                costing approximately <strong>£{insights.fuelEfficiencyInsights.estimatedCostPerMile} per mile</strong> to run.
              </GovUKBody>
              
              <ReportTable>
                <tbody>
                  <tr>
                    <td>Estimated Range</td>
                    <td>{insights.fuelEfficiencyInsights.estimatedRange}</td>
                  </tr>
                  <tr>
                    <td>Battery Capacity</td>
                    <td>{insights.fuelEfficiencyInsights.batteryCapacityEstimate}</td>
                  </tr>
                  <tr>
                    <td>Annual Savings vs Petrol</td>
                    <td style={{ color: COLORS.GREEN }}>{insights.fuelEfficiencyInsights.annualSavingsVsPetrol}</td>
                  </tr>
                </tbody>
              </ReportTable>
            </>
          ) : (
            <>
              <GovUKBody>
                Based on this vehicle's specifications, it has an estimated fuel efficiency 
                of <strong>{insights.fuelEfficiencyInsights.estimatedMPGCombined} MPG</strong> combined, 
                costing approximately <strong>£{insights.fuelEfficiencyInsights.costPerMile} per mile</strong> to run.
              </GovUKBody>
              
              <ReportTable>
                <tbody>
                  <tr>
                    <td>Estimated Urban MPG</td>
                    <td>{insights.fuelEfficiencyInsights.estimatedMPGUrban} MPG</td>
                  </tr>
                  <tr>
                    <td>Estimated Extra-Urban MPG</td>
                    <td>{insights.fuelEfficiencyInsights.estimatedMPGExtraUrban} MPG</td>
                  </tr>
                  <tr>
                    <td>Estimated Annual Fuel Cost</td>
                    <td>£{insights.fuelEfficiencyInsights.annualFuelCost} (based on average UK mileage)</td>
                  </tr>
                </tbody>
              </ReportTable>
            </>
          )}
          
          <GovUKBodyS style={{ marginTop: '15px', fontStyle: 'italic' }}>
            Note: Fuel efficiency estimates are based on typical figures for vehicles of this type, age, and engine size. 
            Actual performance may vary based on driving style, maintenance, and conditions.
          </GovUKBodyS>
        </PremiumInfoPanel>
      )}
    </div>
  );
};

export default VehicleInsights;