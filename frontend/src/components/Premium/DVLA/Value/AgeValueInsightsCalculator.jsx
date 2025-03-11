import React from 'react';

/**
 * AgeValueInsightsCalculator
 * Calculates detailed age-related insights and value estimates
 * based on the vehicle's age, make, fuel type, and optional mileage
 * Maintenance issues are assumed to be handled dynamically elsewhere
 * 
 * @param {Object} vehicleData - The vehicle data object
 * @returns {Object|null} - Comprehensive age and value insights or null if insufficient data
 */
const AgeValueInsightsCalculator = (vehicleData) => {
  if (!vehicleData || !vehicleData.yearOfManufacture) return null;

  const currentYear = new Date().getFullYear();
  let manufactureYear = null;
  let vehicleAge = null;

  // Robust year parsing
  try {
    manufactureYear = typeof vehicleData.yearOfManufacture === 'string' 
      ? parseInt(vehicleData.yearOfManufacture, 10) 
      : Number(vehicleData.yearOfManufacture);
    if (isNaN(manufactureYear) || manufactureYear < 1900 || manufactureYear > currentYear + 1) {
      throw new Error('Invalid manufacture year');
    }
    vehicleAge = currentYear - manufactureYear;
  } catch (e) {
    console.warn('Error parsing vehicle age:', e.message);
    return null;
  }

  if (vehicleAge < 0) {
    console.warn('Vehicle appears to be from the future');
    return null;
  }

  // Normalize inputs
  const make = (vehicleData.make || 'Unknown').toUpperCase();
  const fuelType = (vehicleData.fuelType || 'Unknown').toUpperCase();
  const mileage = Number(vehicleData.mileage) || null;

  // Enhanced age categories with value context
  let ageCategory = 'Unknown';
  let ageCategoryDescription = '';
  let depreciationFactor = 0; // Rough % value loss per year

  if (vehicleAge <= 3) {
    ageCategory = 'Nearly New';
    ageCategoryDescription = 'Likely retains strong resale value and may have remaining warranty.';
    depreciationFactor = 15;
  } else if (vehicleAge <= 7) {
    ageCategory = 'Mid-Life';
    ageCategoryDescription = 'Balanced maintenance costs and value; ideal for practical use.';
    depreciationFactor = 10;
  } else if (vehicleAge <= 12) {
    ageCategory = 'Mature';
    ageCategoryDescription = 'Increased maintenance needs may offset lower purchase price.';
    depreciationFactor = 5;
  } else if (vehicleAge <= 20) {
    ageCategory = 'Veteran';
    ageCategoryDescription = 'Higher maintenance costs; value stabilizes for well-maintained examples.';
    depreciationFactor = 2;
  } else {
    ageCategory = 'Classic';
    ageCategoryDescription = 'Potential collector value if in good condition; specialized care required.';
    depreciationFactor = 0; // Value may increase
  }

  // Remaining service life with range and confidence
  let baseLife = 15; // Default years
  if (fuelType.includes('DIESEL')) baseLife = 18;
  else if (fuelType.includes('PETROL')) baseLife = 15;
  else if (fuelType.includes('HYBRID')) baseLife = 18;
  else if (fuelType.includes('ELECTRIC')) baseLife = 20;

  // Adjust for make reliability
  const reliableMakes = ['TOYOTA', 'LEXUS', 'HONDA'];
  const lessReliableMakes = ['LAND ROVER', 'JAGUAR', 'ALFA ROMEO'];
  let lifeAdjustment = 0;
  if (reliableMakes.some(m => make.includes(m))) lifeAdjustment = 2;
  else if (lessReliableMakes.some(m => make.includes(m))) lifeAdjustment = -2;

  // Adjust for mileage (rough estimate: 15,000 miles/year average)
  if (mileage) {
    const expectedMileage = vehicleAge * 15000;
    lifeAdjustment -= Math.floor((mileage - expectedMileage) / 50000); // -1 year per 50k excess miles
  }

  const typicalRemainingYears = {
    min: Math.max(0, baseLife - vehicleAge + lifeAdjustment - 2),
    max: Math.max(0, baseLife - vehicleAge + lifeAdjustment + 2),
    confidence: mileage ? 0.9 : 0.7 // Higher confidence with mileage data
  };

  // Rough value estimate (simplified)
  const baseValue = 30000; // Starting value in GBP (could be dynamic)
  const currentValueEstimate = baseValue * Math.pow(1 - depreciationFactor / 100, vehicleAge);

  return {
    vehicleAge,
    ageCategory,    
    ageCategoryDescription,
    typicalRemainingYears,
    valueEstimate: {
      current: Math.round(currentValueEstimate),
      currency: 'GBP',
      note: 'Estimate based on typical depreciation; condition and market factors may vary.'
    }
  };
};

export default AgeValueInsightsCalculator;