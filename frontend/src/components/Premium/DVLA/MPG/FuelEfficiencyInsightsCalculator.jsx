import React from 'react';

/**
 * FuelEfficiencyInsightsCalculator
 * Calculates fuel efficiency insights based on the vehicle's specifications
 * Updated with data from UK government sources on fuel consumption
 * 
 * @param {Object} vehicleData - The vehicle data object
 * @returns {Object|null} - Fuel efficiency insights or null if insufficient data
 */
const FuelEfficiencyInsightsCalculator = (vehicleData) => {
  if (!vehicleData || !vehicleData.fuelType || !vehicleData.engineCapacity || !vehicleData.yearOfManufacture) return null;
  
  const make = vehicleData.make || "Unknown";
  const fuelType = vehicleData.fuelType || "Unknown";
  const engineSize = vehicleData.engineCapacity ? parseInt(vehicleData.engineCapacity) : null;
  const makeYear = vehicleData.yearOfManufacture ? parseInt(vehicleData.yearOfManufacture) : null;
  
  if (!engineSize || !makeYear) return null;
  
  // Estimate MPG based on vehicle characteristics and UK government data
  let estimatedMPGCombined = 0;
  let estimatedMPGUrban = 0;
  let estimatedMPGExtraUrban = 0;
  
  // Baseline MPG values for newer vehicles (2018+) based on UK government data
  // Source: Road fuel consumption and the UK motor vehicle fleet (BEIS)
  if (fuelType.toUpperCase().includes("DIESEL")) {
    // Base values for modern diesel (2018+)
    // UK govt data indicates new diesel cars achieve around 61 mpg
    if (engineSize <= 1600) {
      estimatedMPGCombined = 61;
      estimatedMPGUrban = 55;
      estimatedMPGExtraUrban = 70;
    } else if (engineSize <= 2000) {
      estimatedMPGCombined = 58;
      estimatedMPGUrban = 50;
      estimatedMPGExtraUrban = 65;
    } else if (engineSize <= 2500) {
      estimatedMPGCombined = 48;
      estimatedMPGUrban = 40;
      estimatedMPGExtraUrban = 55;
    } else {
      estimatedMPGCombined = 40;
      estimatedMPGUrban = 33;
      estimatedMPGExtraUrban = 46;
    }
    
    // Adjust for age - new diesel cars are 34% more efficient than older models
    // Based on UK government data stating 34% efficiency increase
    if (makeYear < 2010) {
      // Vehicles before 2010 could be up to 34% less efficient
      estimatedMPGCombined = Math.round(estimatedMPGCombined * 0.75);
      estimatedMPGUrban = Math.round(estimatedMPGUrban * 0.75);
      estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 0.75);
    } else if (makeYear < 2015) {
      estimatedMPGCombined = Math.round(estimatedMPGCombined * 0.85);
      estimatedMPGUrban = Math.round(estimatedMPGUrban * 0.85);
      estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 0.85);
    }
  } else if (fuelType.toUpperCase().includes("PETROL")) {
    // Base values for modern petrol (2018+)
    // UK govt data indicates new petrol cars achieve around 52 mpg
    if (engineSize <= 1200) {
      estimatedMPGCombined = 56;
      estimatedMPGUrban = 48;
      estimatedMPGExtraUrban = 64;
    } else if (engineSize <= 1600) {
      estimatedMPGCombined = 52;
      estimatedMPGUrban = 44;
      estimatedMPGExtraUrban = 60;
    } else if (engineSize <= 2000) {
      estimatedMPGCombined = 45;
      estimatedMPGUrban = 38;
      estimatedMPGExtraUrban = 52;
    } else if (engineSize <= 3000) {
      estimatedMPGCombined = 36;
      estimatedMPGUrban = 30;
      estimatedMPGExtraUrban = 42;
    } else {
      estimatedMPGCombined = 28;
      estimatedMPGUrban = 22;
      estimatedMPGExtraUrban = 34;
    }
    
    // Adjust for age - new petrol cars are 44% more efficient than older models
    // Based on UK government data stating 44% efficiency increase
    if (makeYear < 2010) {
      // Vehicles before 2010 could be up to 44% less efficient
      estimatedMPGCombined = Math.round(estimatedMPGCombined * 0.7);
      estimatedMPGUrban = Math.round(estimatedMPGUrban * 0.7);
      estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 0.7);
    } else if (makeYear < 2015) {
      estimatedMPGCombined = Math.round(estimatedMPGCombined * 0.8);
      estimatedMPGUrban = Math.round(estimatedMPGUrban * 0.8);
      estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 0.8);
    }
  } else if (fuelType.toUpperCase().includes("HYBRID")) {
    // Base values for hybrid, which can exceed conventional fuel efficiency
    if (engineSize <= 1600) {
      estimatedMPGCombined = 80;
      estimatedMPGUrban = 90; // Hybrids often better in urban
      estimatedMPGExtraUrban = 75;
    } else if (engineSize <= 2000) {
      estimatedMPGCombined = 70;
      estimatedMPGUrban = 80;
      estimatedMPGExtraUrban = 65;
    } else if (engineSize <= 3000) {
      estimatedMPGCombined = 55;
      estimatedMPGUrban = 60;
      estimatedMPGExtraUrban = 50;
    } else {
      estimatedMPGCombined = 45;
      estimatedMPGUrban = 50;
      estimatedMPGExtraUrban = 40;
    }
    
    // Adjust for age - older hybrids are less efficient
    if (makeYear < 2015) {
      estimatedMPGCombined = Math.round(estimatedMPGCombined * 0.85);
      estimatedMPGUrban = Math.round(estimatedMPGUrban * 0.85);
      estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 0.85);
    }
  } else if (fuelType.toUpperCase().includes("ELECTRIC")) {
    // For electric vehicles, using miles per kWh and more accurate ranges
    // Based on evolution of EV technology over recent years
    let batteryCapacityEstimate;
    let estimatedRange;
    let estimatedMilesPerKWh;

    if (makeYear >= 2022) {
      estimatedMilesPerKWh = 4.0;
      batteryCapacityEstimate = "60-100 kWh";
      estimatedRange = "250-380 miles";
    } else if (makeYear >= 2018) {
      estimatedMilesPerKWh = 3.7;
      batteryCapacityEstimate = "50-80 kWh";
      estimatedRange = "200-300 miles";
    } else if (makeYear >= 2015) {
      estimatedMilesPerKWh = 3.3;
      batteryCapacityEstimate = "30-60 kWh";
      estimatedRange = "120-200 miles";
    } else {
      estimatedMilesPerKWh = 3.0;
      batteryCapacityEstimate = "24-40 kWh";
      estimatedRange = "80-130 miles";
    }

    return {
      isElectric: true,
      estimatedMilesPerKWh,
      estimatedCostPerMile: 0.06, // Based on average UK electricity costs in 2025
      annualSavingsVsPetrol: "£900-£1,500",
      batteryCapacityEstimate,
      estimatedRange,
      annualCO2Savings: "1.5-2.0 tonnes", // Compared to average petrol vehicle
      evMarketGrowthInfo: "ULEVs increased by nearly 40% in 2018 compared to 2017, with 64,000 new registrations"
    };
  }
  
  // Further adjust for specific makes based on their efficiency reputations
  if (make.toUpperCase().includes("TOYOTA") || 
      make.toUpperCase().includes("HONDA") || 
      make.toUpperCase().includes("SUZUKI") || 
      make.toUpperCase().includes("MAZDA")) {
    // Japanese brands often have better efficiency
    estimatedMPGCombined = Math.round(estimatedMPGCombined * 1.05);
    estimatedMPGUrban = Math.round(estimatedMPGUrban * 1.05);
    estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 1.05);
  } else if (make.toUpperCase().includes("LAND ROVER") || 
            make.toUpperCase().includes("RANGE ROVER") || 
            make.toUpperCase().includes("JEEP")) {
    // Large SUVs often have worse efficiency
    estimatedMPGCombined = Math.round(estimatedMPGCombined * 0.85);
    estimatedMPGUrban = Math.round(estimatedMPGUrban * 0.85);
    estimatedMPGExtraUrban = Math.round(estimatedMPGExtraUrban * 0.85);
  }
  
  // Calculate cost per mile based on current fuel prices
  // Data from UK government document indicates recent pricing trends
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
    // Hybrid uses petrol prices but with better efficiency
    const fuelCostPerLiter = 1.45;
    costPerMile = (fuelCostPerLiter * 4.54609) / (estimatedMPGCombined);
  }
  
  // Calculate annual fuel cost based on average UK mileage
  // UK government data confirms average annual mileage
  const averageAnnualMileage = 7200; // Updated 2024 figure
  const annualFuelCost = costPerMile * averageAnnualMileage;
  
  // Calculate CO2 emissions
  let co2EmissionsGPKM = 0;
  if (fuelType.toUpperCase().includes("DIESEL")) {
    co2EmissionsGPKM = Math.round(2640 / estimatedMPGCombined);
  } else if (fuelType.toUpperCase().includes("PETROL")) {
    co2EmissionsGPKM = Math.round(2392 / estimatedMPGCombined);
  } else if (fuelType.toUpperCase().includes("HYBRID")) {
    co2EmissionsGPKM = Math.round(2392 / estimatedMPGCombined * 0.85); // 15% less than equivalent petrol
  }
  
  return {
    estimatedMPGCombined,
    estimatedMPGUrban,
    estimatedMPGExtraUrban,
    costPerMile: Math.round(costPerMile * 100) / 100,
    annualFuelCost: Math.round(annualFuelCost),
    co2EmissionsGPerKM: co2EmissionsGPKM,
    isElectric: false,
    fuelTypeEfficiencyNote: getFuelTypeNote(fuelType, makeYear),
    marketTrends: getMarketTrends(fuelType, makeYear)
  };
};

// Helper function to provide contextual information based on fuel type and year
const getFuelTypeNote = (fuelType, year) => {
  if (fuelType.toUpperCase().includes("DIESEL")) {
    if (year >= 2018) {
      return "Modern diesel engines achieve about 61 MPG on average and emit up to 20% less CO2 than equivalent petrol models, but may face restrictions in some urban low emission zones.";
    } else if (year >= 2015) {
      return "Euro 6 diesel engines have significantly reduced NOx emissions compared to older models, but may still face restrictions in some urban areas.";
    } else {
      return "Older diesel engines offer good fuel economy but higher emissions of particulates and NOx, which may lead to higher charges in urban areas.";
    }
  } else if (fuelType.toUpperCase().includes("PETROL")) {
    if (year >= 2018) {
      return "Modern petrol engines achieve about 52 MPG on average with significantly improved efficiency (44% better than early 2000s models).";
    } else if (year >= 2015) {
      return "Euro 6 petrol engines offer improved efficiency and emissions control compared to older models.";
    } else {
      return "Older petrol engines typically have higher fuel consumption but lower NOx emissions than equivalent diesel models.";
    }
  } else if (fuelType.toUpperCase().includes("HYBRID")) {
    return "Hybrid vehicles combine a conventional engine with an electric motor, offering improved fuel efficiency especially in urban driving conditions.";
  } else if (fuelType.toUpperCase().includes("ELECTRIC")) {
    return "Electric vehicles have zero tailpipe emissions and significantly lower running costs, with average electricity costs around 6p per mile compared to 15-20p for conventional fuels.";
  }
  
  return "";
};

// Helper function to provide market trend information
const getMarketTrends = (fuelType, year) => {
  if (fuelType.toUpperCase().includes("DIESEL")) {
    return "Diesel car registrations have fallen by nearly a third in 2018 following concerns about emissions and potential urban restrictions.";
  } else if (fuelType.toUpperCase().includes("PETROL")) {
    return "Petrol car registrations increased by 9% in 2018, reversing previous trends as consumers shifted away from diesel.";
  } else if (fuelType.toUpperCase().includes("HYBRID") || fuelType.toUpperCase().includes("ELECTRIC")) {
    return "Alternative fuel vehicles are rapidly growing, with ULEV registrations increasing by nearly 40% in 2018 compared to 2017.";
  }
  
  return "";
};

export default FuelEfficiencyInsightsCalculator;