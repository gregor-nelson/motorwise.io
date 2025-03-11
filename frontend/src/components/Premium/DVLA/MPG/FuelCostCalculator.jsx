import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { GovUKTooltip } from '../../../../styles/tooltip';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import MoneyIcon from '@mui/icons-material/Money';
import CalculateIcon from '@mui/icons-material/Calculate';

// Material UI styled components to match GOV.UK styling
const CalculatorContainer = styled('div')(({ theme }) => ({
  marginTop: '20px',
  padding: '20px',
  backgroundColor: '#f8f8f8',
  borderLeft: '5px solid #85994b',
  borderRadius: '0 4px 4px 0'
}));

const CalculatorTitle = styled('h3')(({ theme }) => ({
  fontSize: '19px',
  fontWeight: 700,
  marginBottom: '15px',
  color: '#0b0c0c',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const CalculatorDescription = styled('p')(({ theme }) => ({
  marginBottom: '15px',
  fontSize: '16px',
  color: '#0b0c0c',
  lineHeight: 1.5
}));

const InputGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  marginBottom: '20px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr'
  }
}));

const InputGroup = styled('div')(({ theme }) => ({
  marginBottom: '15px'
}));

const InputLabel = styled('label')(({ theme }) => ({
  display: 'block',
  fontSize: '16px',
  fontWeight: 600,
  marginBottom: '5px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const InputField = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '10px',
  border: '2px solid #0b0c0c',
  borderRadius: 0,
  fontSize: '16px',
  lineHeight: 1.25,
  '&:focus': {
    outline: '3px solid #ffdd00',
    boxShadow: '0 0 0 3px #ffdd00'
  }
}));

const InputWithAddon = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch'
}));

const InputAddon = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  backgroundColor: '#eee',
  border: '2px solid #0b0c0c',
  borderLeft: 'none',
  fontWeight: 600,
  fontSize: '16px'
}));

const ResultsContainer = styled('div')(({ theme }) => ({
  backgroundColor: '#ffffff',
  padding: '20px',
  border: '1px solid #b1b4b6',
  marginTop: '10px'
}));

const ResultTitle = styled('h4')(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 700,
  color: '#0b0c0c',
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const ResultValue = styled('div')(({ theme }) => ({
  fontSize: '36px',
  fontWeight: 700,
  color: '#00703c',
  marginBottom: '5px'
}));

const ResultDetails = styled('div')(({ theme }) => ({
  fontSize: '16px',
  color: '#505a5f'
}));

const ResetButton = styled('button')(({ theme }) => ({
  backgroundColor: '#f3f2f1',
  color: '#0b0c0c',
  fontSize: '16px',
  fontWeight: 600,
  padding: '8px 16px',
  border: '1px solid #505a5f',
  marginTop: '15px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#dbdad9'
  },
  '&:focus': {
    outline: '3px solid #ffdd00'
  }
}));

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
        <CalculateIcon /> Personalized Fuel Cost Calculator
      </CalculatorTitle>
      <CalculatorDescription>
        Customize the values below to calculate your own estimated annual fuel costs.
      </CalculatorDescription>
      
      <InputGrid>
        {!isElectric && (
          <InputGroup>
            <GovUKTooltip title="Enter your vehicle's actual or expected MPG" arrow placement="top">
              <InputLabel htmlFor="mpg-input">
                <SpeedIcon fontSize="small" /> Fuel Economy (MPG)
              </InputLabel>
            </GovUKTooltip>
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
          <GovUKTooltip 
            title={isElectric ? "Current electricity price per kWh" : "Current fuel price per liter"} 
            arrow 
            placement="top"
          >
            <InputLabel htmlFor="fuel-price-input">
              <LocalGasStationIcon fontSize="small" /> 
              {isElectric ? "Electricity Price" : "Fuel Price"}
            </InputLabel>
          </GovUKTooltip>
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
          <GovUKTooltip title="Your expected annual mileage" arrow placement="top">
            <InputLabel htmlFor="mileage-input">
              <DirectionsCarIcon fontSize="small" /> Annual Mileage
            </InputLabel>
          </GovUKTooltip>
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
          <MoneyIcon /> Your Estimated Fuel Costs
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