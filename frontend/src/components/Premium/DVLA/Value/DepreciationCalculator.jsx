import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  GovUKButton, 
  GovUKInput, 
  GovUKFormGroup, 
  GovUKDetails, 
  GovUKBodyS,
  COLORS
} from '../../../../styles/theme';

// Material UI imports
import BuildIcon from '@mui/icons-material/Build';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';

// Styled components for the calculator using MUI styled API
const CalculatorContainer = styled('div')({
  marginTop: '20px',
  padding: '15px',
  background: '#f8f8f8',
  border: '1px solid #b1b4b6',
  borderLeft: '5px solid #1d70b8'
});

// Create a styled select component to replace GovUKSelect
const StyledSelect = styled('select')({
  fontFamily: '"GDS Transport", arial, sans-serif',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: 1.25,
  boxSizing: 'border-box',
  width: '100%',
  height: '40px',
  padding: '5px',
  border: '2px solid #0b0c0c',
  borderRadius: 0,
  appearance: 'none',
  backgroundColor: '#fff',
  backgroundImage: `url("data:image/svg+xml,%3Csvg class='govuk-select__icon' xmlns='http://www.w3.org/2000/svg' width='17' height='10' viewBox='0 0 17 10' fill='none'%3E%3Cpath d='M1 1L8.5 8.5L16 1' stroke='%230b0c0c' stroke-width='2'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  '@media (min-width: 40.0625em)': {
    fontSize: '1.1875rem',
    lineHeight: 1.31579
  },
  '&:focus': {
    outline: '3px solid #fd0',
    outlineOffset: 0,
    boxShadow: 'inset 0 0 0 2px'
  }
});

const CalculatorHeading = styled('h3')({
  fontSize: '19px',
  fontWeight: 600,
  marginTop: 0,
  marginBottom: '15px',
  color: '#0b0c0c',
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: '8px',
    color: '#1d70b8'
  }
});

const CalculatorInputsGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  marginBottom: '20px',
  '@media (max-width: 640px)': {
    gridTemplateColumns: '1fr'
  }
});

const InputColumn = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
});

const CalculatorActions = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '15px',
  marginBottom: '20px',
  '@media (max-width: 640px)': {
    flexDirection: 'column',
    gap: '10px'
  }
});

const ResultsSection = styled('div')({
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid #b1b4b6'
});

const ResultsTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '20px',
  '& th, & td': {
    padding: '10px',
    borderBottom: '1px solid #b1b4b6',
    textAlign: 'left'
  },
  '& th': {
    fontWeight: 600,
    backgroundColor: '#f3f2f1'
  },
  '& tr:last-child td': {
    borderBottom: 'none'
  }
});

const MaintenanceCostsSection = styled('div')({
  marginTop: '20px',
  padding: '15px',
  background: '#f3f2f1',
  borderLeft: '5px solid #85994b'
});

const MaintenanceHeading = styled('h4')({
  fontSize: '16px',
  fontWeight: 600,
  marginTop: 0,
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: '8px',
    color: '#85994b'
  }
});

const MaintenanceTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '15px',
  '& th, & td': {
    padding: '8px',
    borderBottom: '1px solid #b1b4b6',
    textAlign: 'left'
  },
  '& th': {
    fontWeight: 600,
    backgroundColor: '#fff'
  }
});

const InfoText = styled(GovUKBodyS)({
  color: '#505a5f',
  marginTop: '5px'
});

const ResultValue = styled('span')(({ color }) => ({
  fontWeight: 600,
  color: color || '#0b0c0c'
}));

const ComparisonValue = styled('div')(({ color }) => ({
  marginTop: '5px',
  fontSize: '14px',
  color: color || '#505a5f',
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    fontSize: '16px',
    marginRight: '4px'
  }
}));

const FactorBadge = styled('span')(({ color }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: 600,
  marginRight: '5px',
  backgroundColor: color || '#1d70b8',
  color: 'white'
}));

/**
 * Depreciation & Value Calculator Component (Passenger Vehicles Only)
 * 
 * An interactive calculator that allows users to input custom parameters for
 * passenger vehicle valuation and see projected depreciation based on UK vehicle lifecycle data.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial data from AgeValueInsightsCalculator
 * @param {Object} props.vehicleData - Basic vehicle data from API
 * @returns {JSX.Element} - Rendered component
 */
const DepreciationCalculator = ({ initialData, vehicleData }) => {
  // Get default values from initial data or set sensible defaults
  const getDefaultValue = () => {
    if (!initialData || !initialData.valueEstimate) {
      return {
        baseValue: 30000,
        vehicleType: 'CAR',
        fuelType: 'PETROL',
        condition: 'GOOD',
        vehicleAge: 3,
        mileage: 30000,
        annualMileage: 10000,
        projectionYears: 5
      };
    }
    
    return {
      baseValue: initialData.valueEstimate?.current || 30000,
      vehicleType: (vehicleData?.vehicleType === 'SUV' ? 'SUV' : 'CAR'),
      fuelType: (vehicleData?.fuelType || 'PETROL').toUpperCase(),
      condition: 'GOOD',
      vehicleAge: initialData.vehicleAge || 3,
      mileage: vehicleData?.mileage || 30000,
      annualMileage: 10000,
      projectionYears: 5
    };
  };

  // State for calculator values
  const [values, setValues] = useState(getDefaultValue());
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if (['baseValue', 'vehicleAge', 'mileage', 'annualMileage', 'projectionYears'].includes(name)) {
      setValues(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setValues(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Reset to default values
  const handleReset = () => {
    setValues(getDefaultValue());
    setShowResults(false);
  };
  
  // Calculate and display results
  const handleCalculate = () => {
    // Basic validation
    if (values.baseValue <= 0) {
      alert("Base value must be greater than zero");
      return;
    }
    
    if (values.projectionYears <= 0 || values.projectionYears > 15) {
      alert("Projection years must be between 1 and 15");
      return;
    }
    
    const calculationResults = calculateDepreciation(values);
    setResults(calculationResults);
    setShowResults(true);
  };
  
  // Return vehicle type reference data based on the specific vehicle type
  const getVehicleTypeData = (vehicleType) => {
    const vehicleData = {
      'CAR': {
        expectedLife: 14, // years
        lifetimeMileage: 200000, // km
        baseValue: 30000, // Starting value for calculation in GBP
        maintenanceCostPerYear: 550, // Average maintenance cost per year
        maintenanceProfile: [0.7, 0.8, 0.9, 1.0, 1.1, 1.3, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0] // Multiplier by age
      },
      'SUV': {
        expectedLife: 14,
        lifetimeMileage: 200000,
        baseValue: 40000,
        maintenanceCostPerYear: 750,
        maintenanceProfile: [0.7, 0.8, 0.9, 1.0, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3, 2.6, 2.9, 3.2]
      }
    };

    return vehicleData[vehicleType] || vehicleData['CAR']; // Default to car if type not found
  };
  
  // Calculate age-specific depreciation rates based on lifecycle analysis for different vehicle types and fuel types
  const getDepreciationRates = (vehicleType, fuelType, currentAge) => {
    // Base depreciation values derived from UK government lifecycle analysis - passenger vehicles only
    const baseDepreciationRates = {
      'CAR': {
        'PETROL': [17, 15, 11, 8, 6, 4, 3, 2, 2, 2, 2, 1, 1, 0],
        'DIESEL': [15, 14, 10, 7, 5, 4, 3, 2, 2, 2, 1, 1, 1, 0],
        'HYBRID': [20, 18, 13, 9, 6, 5, 4, 3, 2, 2, 1, 1, 1, 0],
        'ELECTRIC': [25, 22, 15, 10, 8, 6, 5, 4, 3, 2, 2, 1, 1, 0]
      },
      'SUV': {
        'PETROL': [18, 16, 12, 9, 7, 5, 4, 3, 2, 2, 2, 1, 1, 0],
        'DIESEL': [16, 15, 11, 8, 6, 5, 4, 3, 2, 2, 1, 1, 1, 0],
        'HYBRID': [21, 19, 14, 10, 7, 6, 5, 4, 3, 2, 2, 1, 1, 0],
        'ELECTRIC': [26, 23, 16, 11, 9, 7, 6, 5, 3, 2, 2, 1, 1, 0]
      }
    };
    
    // Handle unrecognized fuel types by mapping to the closest recognized type
    const normalizeFuelType = (ft) => {
      if (ft.includes('PETROL') || ft.includes('GASOLINE')) return 'PETROL';
      if (ft.includes('DIESEL') || ft.includes('DERV')) return 'DIESEL';
      if (ft.includes('HYBRID') || ft.includes('HEV') || ft.includes('PHEV')) return 'HYBRID';
      if (ft.includes('ELECTRIC') || ft.includes('EV') || ft.includes('BEV')) return 'ELECTRIC';
      return 'PETROL'; // Default
    };
    
    const normalizedFuelType = normalizeFuelType(fuelType);
    
    // Get the appropriate depreciation rates or fallback to a reasonable default
    const typeRates = baseDepreciationRates[vehicleType] || baseDepreciationRates['CAR'];
    const rates = typeRates[normalizedFuelType] || typeRates['PETROL'] || baseDepreciationRates['CAR']['PETROL'];
    
    // Return the current depreciation rate based on age (capped at array length)
    const ageIndex = Math.min(currentAge, rates.length - 1);
    return rates[ageIndex];
  };
  
  // Calculate condition factor based on vehicle condition
  const getConditionFactor = (condition) => {
    switch (condition) {
      case 'EXCELLENT': return 0.1; // 10% premium
      case 'GOOD': return 0.05; // 5% premium
      case 'FAIR': return -0.05; // 5% discount
      case 'POOR': return -0.15; // 15% discount
      default: return 0; // No adjustment for AVERAGE
    }
  };
  
  // Calculate mileage adjustment factor
  const getMileageAdjustment = (vehicleType, actualMileage, expectedMileage) => {
    const mileageRatio = actualMileage / expectedMileage;
    
    if (mileageRatio < 0.7) {
      return 0.08; // 8% premium for very low mileage
    } else if (mileageRatio < 0.9) {
      return 0.04; // 4% premium for low mileage
    } else if (mileageRatio > 1.5) {
      return -0.08; // 8% discount for very high mileage
    } else if (mileageRatio > 1.2) {
      return -0.04; // 4% discount for high mileage
    }
    
    return 0; // No adjustment for average mileage
  };
  
  // Main calculation function
  const calculateDepreciation = (inputValues) => {
    const {
      baseValue,
      vehicleType,
      fuelType,
      condition,
      vehicleAge,
      mileage,
      annualMileage,
      projectionYears
    } = inputValues;
    
    const vehicleTypeData = getVehicleTypeData(vehicleType);
    const conditionFactor = getConditionFactor(condition);
    
    // Calculate expected mileage based on age
    const expectedMileage = vehicleAge * (vehicleTypeData.lifetimeMileage / vehicleTypeData.expectedLife);
    const mileageAdjustment = getMileageAdjustment(vehicleType, mileage, expectedMileage);
    
    // Apply year-by-year depreciation for more accurate calculation
    let calculatedValue = baseValue;
    for (let year = 0; year < vehicleAge; year++) {
      const yearlyRate = getDepreciationRates(vehicleType, fuelType, year);
      calculatedValue = calculatedValue * (1 - yearlyRate / 100);
    }
    
    // Apply condition and mileage adjustments to current value
    const currentValue = calculatedValue * (1 + conditionFactor + mileageAdjustment);
    
    // Generate projected values for each future year
    const projections = [];
    let projectedValue = currentValue;
    let totalMileage = mileage;
    
    // Value factors that affected the calculation
    const valueFactors = [];
    
    // Add relevant value factors
    if (conditionFactor > 0) {
      valueFactors.push({
        name: condition.toLowerCase(),
        impact: `+${Math.round(conditionFactor * 100)}%`,
        color: '#00703c'
      });
    } else if (conditionFactor < 0) {
      valueFactors.push({
        name: condition.toLowerCase(),
        impact: `${Math.round(conditionFactor * 100)}%`,
        color: '#d4351c'
      });
    }
    
    if (mileageAdjustment > 0) {
      valueFactors.push({
        name: 'low mileage',
        impact: `+${Math.round(mileageAdjustment * 100)}%`,
        color: '#00703c'
      });
    } else if (mileageAdjustment < 0) {
      valueFactors.push({
        name: 'high mileage',
        impact: `${Math.round(mileageAdjustment * 100)}%`,
        color: '#d4351c'
      });
    }
    
    // Special factors based on vehicle type and fuel type
    if (fuelType.includes('ELECTRIC')) {
      // Potential battery degradation factor for older EVs
      if (vehicleAge > 5) {
        valueFactors.push({
          name: 'battery age',
          impact: '-5%',
          color: '#f47738'
        });
        projectedValue *= 0.95;
      }
    }
    
    if (fuelType.includes('DIESEL') && vehicleAge >= 10) {
      // Older diesel penalty due to emissions regulations
      valueFactors.push({
        name: 'emissions regulations',
        impact: '-8%',
        color: '#d4351c'
      });
      projectedValue *= 0.92;
    }
    
    // Calculate maintenance costs projection
    const maintenanceCosts = [];
    let totalMaintenanceCost = 0;
    
    for (let year = 1; year <= projectionYears; year++) {
      const futureAge = vehicleAge + year;
      const depreciationRate = getDepreciationRates(vehicleType, fuelType, futureAge - 1);
      
      // Apply yearly depreciation to get new value
      projectedValue = projectedValue * (1 - depreciationRate / 100);
      totalMileage += annualMileage;
      
      // Maintenance cost calculation
      const maintenanceProfileIndex = Math.min(futureAge - 1, vehicleTypeData.maintenanceProfile.length - 1);
      const yearMaintenanceMultiplier = vehicleTypeData.maintenanceProfile[maintenanceProfileIndex];
      const yearMaintenanceCost = vehicleTypeData.maintenanceCostPerYear * yearMaintenanceMultiplier;
      
      // Add maintenance cost to total
      totalMaintenanceCost += yearMaintenanceCost;
      
      // Add battery replacement costs for older EVs if applicable
      let batteryReplacementCost = 0;
      if (fuelType.includes('ELECTRIC') && futureAge >= 8 && futureAge <= 10) {
        // Approximate battery cost based on vehicle type
        batteryReplacementCost = vehicleType === 'SUV' ? 9000 : 7000;
        
        // Only apply to one year in the range
        if (futureAge === 9) {
          maintenanceCosts.push({
            year: futureAge,
            cost: yearMaintenanceCost + batteryReplacementCost,
            baseMaintenanceCost: yearMaintenanceCost,
            batteryReplacement: true,
            batteryReplacementCost
          });
        } else {
          maintenanceCosts.push({
            year: futureAge,
            cost: yearMaintenanceCost,
            baseMaintenanceCost: yearMaintenanceCost,
            batteryReplacement: false
          });
        }
      } else {
        maintenanceCosts.push({
          year: futureAge,
          cost: yearMaintenanceCost,
          baseMaintenanceCost: yearMaintenanceCost,
          batteryReplacement: false
        });
      }
      
      // Add to projections array
      projections.push({
        year: futureAge,
        value: Math.round(projectedValue),
        depreciationRate,
        mileage: totalMileage
      });
    }
    
    // Calculate value retention
    const valueRetention = (projections[projections.length - 1].value / baseValue) * 100;
    
    // Calculate annual cost of ownership (depreciation + maintenance)
    const totalDepreciation = currentValue - projections[projections.length - 1].value;
    const annualCostOfOwnership = (totalDepreciation + totalMaintenanceCost) / projectionYears;
    
    return {
      currentValue: Math.round(currentValue),
      projections,
      valueRetention: Math.round(valueRetention * 10) / 10, // One decimal place
      maintenanceCosts,
      valueFactors,
      totalMaintenanceCost: Math.round(totalMaintenanceCost),
      annualCostOfOwnership: Math.round(annualCostOfOwnership)
    };
  };
  
  return (
    <CalculatorContainer>
      <CalculatorHeading>
        <TrendingDownIcon /> Passenger Vehicle Depreciation Calculator
      </CalculatorHeading>
      
      <GovUKBodyS>
        Customize the parameters below to calculate projected passenger vehicle values and maintenance costs
        over time. Values are based on UK government vehicle lifecycle analysis data.
      </GovUKBodyS>
      
      <CalculatorInputsGrid>
        <InputColumn>
          <GovUKFormGroup>
            <label htmlFor="baseValue">Base Vehicle Value (£)</label>
            <GovUKInput
              type="number"
              id="baseValue"
              name="baseValue"
              value={values.baseValue}
              onChange={handleChange}
              min="0"
              step="100"
            />
            <InfoText>The current or initial value of the vehicle</InfoText>
          </GovUKFormGroup>
          
          <GovUKFormGroup>
            <label htmlFor="vehicleType">Vehicle Type</label>
            <StyledSelect
              id="vehicleType"
              name="vehicleType"
              value={values.vehicleType}
              onChange={handleChange}
            >
              <option value="CAR">Car</option>
              <option value="SUV">SUV</option>
            </StyledSelect>
          </GovUKFormGroup>
          
          <GovUKFormGroup>
            <label htmlFor="fuelType">Fuel Type</label>
            <StyledSelect
              id="fuelType"
              name="fuelType"
              value={values.fuelType}
              onChange={handleChange}
            >
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ELECTRIC">Electric</option>
            </StyledSelect>
          </GovUKFormGroup>
          
          <GovUKFormGroup>
            <label htmlFor="condition">Condition</label>
            <StyledSelect
              id="condition"
              name="condition"
              value={values.condition}
              onChange={handleChange}
            >
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="AVERAGE">Average</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </StyledSelect>
          </GovUKFormGroup>
        </InputColumn>
        
        <InputColumn>
          <GovUKFormGroup>
            <label htmlFor="vehicleAge">Current Age (years)</label>
            <GovUKInput
              type="number"
              id="vehicleAge"
              name="vehicleAge"
              value={values.vehicleAge}
              onChange={handleChange}
              min="0"
              max="25"
            />
          </GovUKFormGroup>
          
          <GovUKFormGroup>
            <label htmlFor="mileage">Current Mileage</label>
            <GovUKInput
              type="number"
              id="mileage"
              name="mileage"
              value={values.mileage}
              onChange={handleChange}
              min="0"
              step="1000"
            />
          </GovUKFormGroup>
          
          <GovUKFormGroup>
            <label htmlFor="annualMileage">Estimated Annual Mileage</label>
            <GovUKInput
              type="number"
              id="annualMileage"
              name="annualMileage"
              value={values.annualMileage}
              onChange={handleChange}
              min="0"
              step="1000"
            />
          </GovUKFormGroup>
          
          <GovUKFormGroup>
            <label htmlFor="projectionYears">Project for (years)</label>
            <GovUKInput
              type="number"
              id="projectionYears"
              name="projectionYears"
              value={values.projectionYears}
              onChange={handleChange}
              min="1"
              max="15"
            />
            <InfoText>Maximum projection period is 15 years</InfoText>
          </GovUKFormGroup>
        </InputColumn>
      </CalculatorInputsGrid>
      
      <CalculatorActions>
        <GovUKButton onClick={handleCalculate} data-testid="calculate-btn">
          Calculate Depreciation
        </GovUKButton>
        <GovUKButton 
          onClick={handleReset} 
          buttonStyle="secondary"
          data-testid="reset-btn"
        >
          Reset Values
        </GovUKButton>
      </CalculatorActions>
      
      {showResults && results && (
        <ResultsSection>
          <CalculatorHeading>
            <LocalAtmIcon /> Estimated Value & Depreciation
          </CalculatorHeading>
          
          <ResultsTable>
            <tbody>
              <tr>
                <th>Current Estimated Value</th>
                <td>
                  <ResultValue color="#1d70b8">£{results.currentValue.toLocaleString()}</ResultValue>
                  {results.valueFactors.length > 0 && (
                    <div style={{ marginTop: '5px' }}>
                      Value factors: {results.valueFactors.map((factor, index) => (
                        <FactorBadge key={index} color={factor.color}>
                          {factor.name} {factor.impact}
                        </FactorBadge>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <th>Value after {values.projectionYears} years</th>
                <td>
                  <ResultValue color="#1d70b8">
                    £{results.projections[results.projections.length - 1].value.toLocaleString()}
                  </ResultValue>
                  <ComparisonValue color="#505a5f">
                    <TrendingDownIcon />
                    {results.valueRetention}% of original value retained
                  </ComparisonValue>
                </td>
              </tr>
              <tr>
                <th>Total Maintenance Costs</th>
                <td>
                  <ResultValue color="#85994b">
                    £{results.totalMaintenanceCost.toLocaleString()}
                  </ResultValue>
                  <ComparisonValue color="#505a5f">
                    <BuildIcon />
                    £{Math.round(results.totalMaintenanceCost / values.projectionYears).toLocaleString()} per year
                  </ComparisonValue>
                </td>
              </tr>
              <tr>
                <th>Annual Cost of Ownership</th>
                <td>
                  <ResultValue color="#d4351c">
                    £{results.annualCostOfOwnership.toLocaleString()}
                  </ResultValue>
                  <ComparisonValue color="#505a5f">
                    Includes depreciation and maintenance
                  </ComparisonValue>
                </td>
              </tr>
            </tbody>
          </ResultsTable>
          
          <MaintenanceCostsSection>
            <MaintenanceHeading>
              <BuildIcon /> Projected Maintenance Costs
            </MaintenanceHeading>
            
            <MaintenanceTable>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Age</th>
                  <th>Estimated Cost</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {results.maintenanceCosts.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date().getFullYear() + index + 1}</td>
                    <td>{item.year} years</td>
                    <td>
                      <ResultValue color={item.batteryReplacement ? "#d4351c" : "#0b0c0c"}>
                        £{Math.round(item.cost).toLocaleString()}
                      </ResultValue>
                    </td>
                    <td>
                      {item.batteryReplacement && (
                        <span style={{ color: '#d4351c', fontWeight: 600 }}>
                          Includes potential battery replacement (£{item.batteryReplacementCost.toLocaleString()})
                        </span>
                      )}
                      {!item.batteryReplacement && item.year > 10 && (
                        <span>Higher costs due to vehicle age</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </MaintenanceTable>
            
            <GovUKDetails summary="About maintenance cost estimates">
              <p>
                Maintenance costs are estimated based on analysis of typical UK passenger vehicle maintenance patterns 
                by age, type, and powertrain. These estimates include:
              </p>
              <ul>
                <li>Regular servicing costs</li>
                <li>Component replacements (e.g., brakes, suspension)</li>
                <li>Age-related repairs</li>
                <li>For electric vehicles, potential battery replacement costs after 8-10 years</li>
              </ul>
              <p>
                Note that actual maintenance costs will vary based on vehicle condition, usage patterns, 
                and specific model reliability. These projections are meant to provide a reasonable
                estimate for financial planning purposes.
              </p>
            </GovUKDetails>
          </MaintenanceCostsSection>
        </ResultsSection>
      )}
    </CalculatorContainer>
  );
};

export default DepreciationCalculator;