import React, { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { COLORS, commonFontStyles, BREAKPOINTS } from '../../styles/theme'; // Adjust import path as needed
import TechnicalSpecificationsPage from './TechnicalSpecificationsPage';
import VehicleRepairTimesComponent from './LabourTimes';

// Styled components aligned with GOV.UK design
const StyledTabs = styled('div')`
  ${commonFontStyles}
  border-bottom: 1px solid ${COLORS.MID_GREY};
  margin-bottom: 20px;
`;

const StyledTabList = styled('div')`
  display: flex;
  width: 100%;
  
  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    flex-direction: column;
  }
`;

const StyledTab = styled('button')`
  ${commonFontStyles}
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  padding: 10px 15px;
  background: ${props => props.selected ? COLORS.LIGHT_GREY : 'transparent'};
  border: none;
  border-bottom: 4px solid ${props => props.selected ? COLORS.BLUE : 'transparent'};
  flex-grow: 1;
  text-align: center;
  cursor: pointer;
  color: ${COLORS.BLACK};
  text-transform: none;
  
  @media (min-width: ${BREAKPOINTS.MOBILE}) {
    font-size: 1.1875rem;
    line-height: 1.3157894737;
    padding: 15px 20px;
  }
  
  &:hover {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  &:focus {
    outline: 3px solid ${COLORS.YELLOW};
    outline-offset: 0;
    background-color: ${COLORS.YELLOW};
    box-shadow: 0 -2px ${COLORS.YELLOW}, 0 4px ${COLORS.BLACK};
    color: ${COLORS.BLACK};
  }
`;

const StyledTabPanel = styled('div')`
  padding-top: 20px;
  display: ${props => props.hidden ? 'none' : 'block'};
`;

// TabPanel component
const TabPanel = React.memo(function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <StyledTabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index ? children : null}
    </StyledTabPanel>
  );
});

// Extract year from various possible date fields in vehicleData
const extractManufactureYear = (vehicleData) => {
  if (!vehicleData) return null;
  
  // First check if we already have a year field
  if (vehicleData.year && typeof vehicleData.year === 'number') {
    return vehicleData.year;
  }
  
  // Try different date fields that might contain year information
  const dateFields = [
    'manufactureDate',
    'yearOfManufacture',
    'registrationDate',
    'firstRegisteredDate',
    'firstRegistrationDate'
  ];
  
  for (const field of dateFields) {
    if (vehicleData[field]) {
      // If it's a string, try to extract a 4-digit year
      if (typeof vehicleData[field] === 'string') {
        const yearMatch = /(\d{4})/.exec(vehicleData[field]);
        if (yearMatch) {
          return parseInt(yearMatch[1], 10);
        }
      }
      
      // If it's a number in a reasonable year range
      if (typeof vehicleData[field] === 'number' && 
          vehicleData[field] > 1900 && 
          vehicleData[field] < 2100) {
        return vehicleData[field];
      }
    }
  }
  
  return null;
};

// NEW - Normalize fuel type
const normalizeFuelType = (fuelType) => {
  if (!fuelType) return null;
  
  // Convert to lowercase and trim
  const normalized = fuelType.toLowerCase().trim();
  
  // Map common variations to standard values
  if (['gasoline', 'unleaded', 'gas', 'petrol'].includes(normalized)) {
    return 'petrol';
  } else if (['diesel', 'gasoil', 'derv'].includes(normalized)) {
    return 'diesel';
  } else if (['hybrid', 'phev', 'hev'].includes(normalized)) {
    return 'hybrid';
  } else if (['electric', 'ev', 'bev'].includes(normalized)) {
    return 'electric';
  }
  
  // Return as-is for other values
  return normalized;
};

// Main component
const AutoDataSection = ({ vehicleData, loading, error, registration }) => {
  const [tabValue, setTabValue] = useState(0);
  const [techSpecsData, setTechSpecsData] = useState(null);
  const [labourTimesData, setLabourTimesData] = useState(null);

  // Extract year from vehicle data
  const vehicleYear = useMemo(() => {
    return vehicleData ? extractManufactureYear(vehicleData) : null;
  }, [vehicleData]);

  // NEW - Extract and normalize fuel type
  const vehicleFuelType = useMemo(() => {
    if (!vehicleData) return null;
    
    // Try to get fuel type from various possible field names
    const possibleFuelTypeFields = ['fuelType', 'fuel', 'engineFuel', 'engineType'];
    
    for (const field of possibleFuelTypeFields) {
      if (vehicleData[field]) {
        return normalizeFuelType(vehicleData[field]);
      }
    }
    
    // Try to determine from model name
    const model = (vehicleData.model || '').toLowerCase();
    if (/tdi|cdi|hdi|dci|crdi|d4d|jtd|tdci/.test(model)) {
      return 'diesel';
    }
    
    // Try to determine from variant
    const variant = (vehicleData.variant || '').toLowerCase();
    if (/diesel|tdi|cdi|hdi|dci|crdi/.test(variant)) {
      return 'diesel';
    }
    if (/petrol|tsi|gti|vti|mpi/.test(variant)) {
      return 'petrol';
    }
    
    return null;
  }, [vehicleData]);

  // Create enhanced vehicle data object with explicit year and fuel type
  const enhancedVehicleData = useMemo(() => {
    if (!vehicleData) return null;
    
    return {
      ...vehicleData,
      // Only add year if we have one
      ...(vehicleYear && { year: vehicleYear }),
      // Only add fuel type if we have one
      ...(vehicleFuelType && { fuelType: vehicleFuelType })
    };
  }, [vehicleData, vehicleYear, vehicleFuelType]);

  // Tab change handler
  const handleTabChange = React.useCallback((newValue) => {
    setTabValue(newValue);
  }, []);

  // Handle data load from child components
  const handleTechSpecsDataLoad = React.useCallback((data) => {
    setTechSpecsData(data);
  }, []);

  const handleLabourTimesDataLoad = React.useCallback((data) => {
    setLabourTimesData(data);
  }, []);

  // Log information about the vehicle for debugging
  useEffect(() => {
    if (enhancedVehicleData) {
      console.log('Enhanced vehicle data:', {
        make: enhancedVehicleData.make,
        model: enhancedVehicleData.model,
        year: enhancedVehicleData.year,
        fuelType: enhancedVehicleData.fuelType
      });
    }
  }, [enhancedVehicleData]);

  return (
    <StyledTabs>
      <StyledTabList>
        <StyledTab
          selected={tabValue === 0}
          onClick={() => handleTabChange(0)}
          aria-selected={tabValue === 0}
          role="tab"
          id="tab-0"
          aria-controls="tabpanel-0"
        >
          Technical Specifications
        </StyledTab>
        <StyledTab
          selected={tabValue === 1}
          onClick={() => handleTabChange(1)}
          aria-selected={tabValue === 1}
          role="tab"
          id="tab-1"
          aria-controls="tabpanel-1"
        >
          Repair Times
        </StyledTab>
      </StyledTabList>

      <TabPanel value={tabValue} index={0}>
        {/* Only render when tab is active and we have vehicle data */}
        {enhancedVehicleData && (
          <TechnicalSpecificationsPage
            registration={registration}
            vehicleData={enhancedVehicleData}
            onDataLoad={handleTechSpecsDataLoad}
          />
        )}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {/* Only render when tab is active and we have vehicle data */}
        {enhancedVehicleData && (
          <VehicleRepairTimesComponent
            registration={registration}
            vehicleData={enhancedVehicleData}
            onDataLoad={handleLabourTimesDataLoad}
          />
        )}
      </TabPanel>
    </StyledTabs>
  );
};

// Use memo to prevent unnecessary re-renders of the entire component
export default React.memo(AutoDataSection);