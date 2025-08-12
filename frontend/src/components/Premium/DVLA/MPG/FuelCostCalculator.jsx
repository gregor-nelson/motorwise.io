import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

// Clean minimal styled components
const CalculatorContainer = styled('div')`
  font-family: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin-top: 3rem;
  padding: 2rem 0;
  border-top: 1px solid #f1f5f9;
`;

const CalculatorTitle = styled('h3')`
  font-family: 'Jost', sans-serif;
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  color: #0f172a;
  line-height: 1.25;
`;

const CalculatorDescription = styled('p')`
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.625;
  font-weight: 400;
`;

const InputGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const InputGroup = styled('div')`
  display: flex;
  flex-direction: column;
`;

const InputLabel = styled('label')`
  font-size: 0.875rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: #64748b;
  cursor: pointer;
`;

const InputField = styled('input')`
  width: 100%;
  padding: 0.75rem 0;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  background: transparent;
  font-size: 1rem;
  font-family: 'JetBrains Mono', Monaco, monospace;
  color: #0f172a;
  
  &:focus {
    outline: none;
    border-bottom-color: #0f172a;
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const InputWithAddon = styled('div')`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
`;

const InputAddon = styled('span')`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 400;
  padding-bottom: 0.75rem;
`;

const ResultsContainer = styled('div')`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #f1f5f9;
`;

const ResultTitle = styled('h4')`
  font-size: 1rem;
  font-weight: 400;
  color: #64748b;
  margin-bottom: 0.5rem;
`;

const ResultValue = styled('div')`
  font-family: 'JetBrains Mono', Monaco, monospace;
  font-size: 2rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
  line-height: 1;
`;

const ResultDetails = styled('div')`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.625;
`;

const ResetButton = styled('button')`
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 400;
  padding: 0;
  border: none;
  margin-top: 1.5rem;
  cursor: pointer;
  text-decoration: underline;
  font-family: inherit;
  
  &:hover {
    color: #0f172a;
  }
  
  &:focus {
    outline: none;
    color: #0f172a;
  }
`;

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
    <CalculatorContainer>
      <CalculatorTitle>
        Personalized Fuel Cost Calculator
      </CalculatorTitle>
      <CalculatorDescription>
        Customize the values below to calculate your own estimated annual fuel costs.
      </CalculatorDescription>
      
      <InputGrid>
        {!isElectric && (
          <InputGroup>
            <InputLabel htmlFor="mpg-input">
              Fuel Economy (MPG)
            </InputLabel>
            <InputField
              id="mpg-input"
              type="number"
              min="1"
              step="0.1"
              value={mpg}
              onChange={(e) => setMpg(parseFloat(e.target.value) || 0)}
            />
          </InputGroup>
        )}
        
        <InputGroup>
          <InputLabel htmlFor="fuel-price-input">
            {isElectric ? "Electricity Price" : "Fuel Price"}
          </InputLabel>
          <InputWithAddon>
            <InputField
              id="fuel-price-input"
              type="number"
              min="0.01"
              step="0.01"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
            />
            <InputAddon>£ per {isElectric ? "kWh" : "liter"}</InputAddon>
          </InputWithAddon>
        </InputGroup>
        
        <InputGroup>
          <InputLabel htmlFor="mileage-input">
            Annual Mileage
          </InputLabel>
          <InputField
            id="mileage-input"
            type="number"
            min="1"
            step="100"
            value={annualMileage}
            onChange={(e) => setAnnualMileage(parseInt(e.target.value) || 0)}
          />
        </InputGroup>
      </InputGrid>
      
      <ResultsContainer>
        <ResultTitle>
          Your Estimated Fuel Costs
        </ResultTitle>
        <ResultValue>£{Math.round(annualCost).toLocaleString()}</ResultValue>
        <ResultDetails>
          Approximately £{costPerMile.toFixed(2)} per mile based on your inputs
        </ResultDetails>
      </ResultsContainer>
      
      <ResetButton onClick={handleReset}>
        Reset to Default Values
      </ResetButton>
    </CalculatorContainer>
  );
};

export default FuelCostCalculator;