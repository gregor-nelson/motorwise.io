import React, { useState, useEffect } from 'react';

/**
 * Interactive Fuel Cost Calculator Component
 * Allows users to input their own values for MPG, fuel price, and annual mileage
 * to calculate personalized fuel costs
 * 
 * @param {Object} defaultValues - Default values from vehicle calculation
 * @param {string} fuelType - The fuel type of the vehicle
 * @param {boolean} isElectric - Whether the vehicle is electric
 */
const FuelCostCalculator = ({ defaultValues, fuelType, isElectric }) => {
  // Initialize default values
  const initialMPG = defaultValues?.estimatedMPGCombined || 0;
  const initialFuelPrice = isElectric 
    ? 0.30 // Default electricity price per kWh in £
    : fuelType?.toUpperCase().includes("DIESEL") 
      ? 1.50 // Default diesel price per liter in £
      : 1.45; // Default petrol price per liter in £
  const initialAnnualMileage = 7200; // UK average
  
  // State for user inputs
  const [mpg, setMpg] = useState(initialMPG);
  const [fuelPrice, setFuelPrice] = useState(initialFuelPrice);
  const [annualMileage, setAnnualMileage] = useState(initialAnnualMileage);
  const [annualCost, setAnnualCost] = useState(0);
  const [costPerMile, setCostPerMile] = useState(0);
  
  // Calculate costs when inputs change
  useEffect(() => {
    if (isElectric) {
      // For electric vehicles (using kWh per mile)
      const milesPerKWh = defaultValues?.estimatedMilesPerKWh || 3.5;
      const kwhPerMile = 1 / milesPerKWh;
      const costPerMile = kwhPerMile * fuelPrice;
      setCostPerMile(costPerMile);
      setAnnualCost(costPerMile * annualMileage);
    } else {
      // For petrol/diesel vehicles
      if (mpg > 0) {
        // Convert from MPG to cost per mile
        // UK gallon = 4.54609 liters
        const costPerMile = (fuelPrice * 4.54609) / mpg;
        setCostPerMile(costPerMile);
        setAnnualCost(costPerMile * annualMileage);
      }
    }
  }, [mpg, fuelPrice, annualMileage, isElectric, defaultValues]);
  
  // Reset to default values
  const handleReset = () => {
    setMpg(initialMPG);
    setFuelPrice(initialFuelPrice);
    setAnnualMileage(initialAnnualMileage);
  };
  
  return (
    <div className="mt-12 pt-8 border-t border-neutral-200">
      <div className="flex items-start mb-6">
        <i className="ph ph-calculator text-lg text-blue-600 mr-3 mt-0.5"></i>
        <div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Personalized Fuel Cost Calculator
          </h3>
          <p className="text-xs text-neutral-700 leading-relaxed">
            Customize the values below to calculate your own estimated annual fuel costs.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {!isElectric && (
          <div className="flex flex-col">
            <label htmlFor="mpg-input" className="flex items-center text-xs text-neutral-600 mb-2 cursor-pointer">
              <i className="ph ph-gauge text-sm text-blue-600 mr-2"></i>
              Fuel Economy (MPG)
            </label>
            <input
              id="mpg-input"
              type="number"
              min="1"
              step="0.1"
              value={mpg}
              onChange={(e) => setMpg(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-50 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-mono text-neutral-900"
            />
          </div>
        )}
        
        <div className="flex flex-col">
          <label htmlFor="fuel-price-input" className="flex items-center text-xs text-neutral-600 mb-2 cursor-pointer">
            <i className="ph ph-currency-pound text-sm text-blue-600 mr-2"></i>
            {isElectric ? "Electricity Price" : "Fuel Price"}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="fuel-price-input"
              type="number"
              min="0.01"
              step="0.01"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-neutral-50 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-mono text-neutral-900"
            />
            <span className="text-xs text-neutral-500">£ per {isElectric ? "kWh" : "liter"}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="mileage-input" className="flex items-center text-xs text-neutral-600 mb-2 cursor-pointer">
            <i className="ph ph-road-horizon text-sm text-blue-600 mr-2"></i>
            Annual Mileage
          </label>
          <input
            id="mileage-input"
            type="number"
            min="1"
            step="100"
            value={annualMileage}
            onChange={(e) => setAnnualMileage(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-50 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-mono text-neutral-900"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm mt-8">
        <div className="flex items-start mb-4">
          <i className="ph ph-chart-bar text-lg text-green-600 mr-3 mt-0.5"></i>
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-900 mb-3">
              Your Estimated Fuel Costs
            </div>
            <div className="text-2xl font-bold text-green-600 font-mono mb-2">
              £{Math.round(annualCost).toLocaleString()}
            </div>
            <div className="text-xs text-neutral-700 leading-relaxed">
              Approximately £{costPerMile.toFixed(2)} per mile based on your inputs
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleReset}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer mt-6 transition-colors duration-200"
      >
        Reset to Default Values
      </button>
    </div>
  );
};

export default FuelCostCalculator;