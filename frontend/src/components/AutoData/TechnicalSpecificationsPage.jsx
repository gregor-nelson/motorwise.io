import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GovUKContainer,
  GovUKMainWrapper,
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKLoadingContainer,
  GovUKLoadingSpinner,
  PremiumInfoPanel,
  BREAKPOINTS,
  COLORS
} from '../../styles/theme';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Import Material-UI icons
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WarningIcon from '@mui/icons-material/Warning';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';

// Import API client
import techSpecsApi from './api/TechSpecsApiClient';

// Styled components
// Specification table styling
const SpecificationTable = styled('table')(({ theme }) => ({
  marginBottom: '20px',
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '16px',
  
  '& th': {
    width: '40%',
    fontWeight: 700,
    padding: '10px 20px 10px 0',
    textAlign: 'left',
    borderBottom: `1px solid ${COLORS.MID_GREY}`,
    color: COLORS.BLACK,
  },
  
  '& td': {
    width: '60%',
    padding: '10px 20px 10px 0',
    borderBottom: `1px solid ${COLORS.MID_GREY}`,
    color: COLORS.BLACK,
  },

  '& tr:last-child th, & tr:last-child td': {
    borderBottom: `2px solid ${COLORS.BLACK}`,
  },

  '& tr:first-child th, & tr:first-child td': {
    borderTop: `2px solid ${COLORS.BLACK}`,
  }
}));

// Styled Tab Panel component
const TabPanel = styled(Box)(({ theme }) => ({
  padding: '30px 0',
}));

// Styled Tabs
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${COLORS.MID_GREY}`,
  
  '& .MuiTabs-indicator': {
    backgroundColor: COLORS.BLUE,
    height: '5px',
  },
  
  '& .MuiTabs-flexContainer': {
    borderBottom: `2px solid ${COLORS.MID_GREY}`,
  }
}));

// Styled Tab
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '16px',
  color: COLORS.BLACK,
  padding: '15px 20px',
  minHeight: '60px',
  
  '&.Mui-selected': {
    color: COLORS.BLUE,
    backgroundColor: COLORS.LIGHT_GREY,
  },
  
  '&:hover': {
    color: COLORS.BLUE,
    backgroundColor: COLORS.LIGHT_GREY,
    opacity: 0.9,
  },
  
  '&:focus': {
    outline: `3px solid ${COLORS.FOCUS}`,
    outlineOffset: 0,
  }
}));

// Section Header
const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
  borderBottom: `2px solid ${COLORS.BLUE}`,
  paddingBottom: '10px',
  
  '& svg': {
    marginRight: '10px',
    color: COLORS.BLUE,
  }
}));

// Section Container
const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: '40px',
  
  '&:last-child': {
    marginBottom: 0,
  }
}));

// Warning panel
const WarningPanel = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.LIGHT_GREY,
  padding: '15px',
  marginBottom: '20px',
  borderLeft: `5px solid ${COLORS.RED}`,
  display: 'flex',
  
  '& svg': {
    marginRight: '15px',
    marginTop: '3px',
    color: COLORS.RED,
    flexShrink: 0,
  }
}));

// Info panel
const InfoPanel = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.LIGHT_GREY,
  padding: '15px',
  marginBottom: '20px',
  borderLeft: `5px solid ${COLORS.BLUE}`,
  
  '& svg': {
    marginRight: '10px',
    color: COLORS.BLUE,
    verticalAlign: 'middle',
  }
}));

// Highlight value
const StyledValueHighlight = styled('span')(({ theme }) => ({
  fontWeight: 700,
  color: COLORS.BLUE,
}));

// Styled fact list
const StyledFactorList = styled('ul')(({ theme }) => ({
  listStyleType: 'none',
  padding: 0,
  margin: '15px 0',
}));

// Styled fact item
const StyledFactorItem = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '10px',
  
  '& svg': {
    marginRight: '10px',
    marginTop: '3px',
    color: COLORS.BLUE,
    flexShrink: 0,
  },
  
  '& span': {
    flex: 1,
  }
}));

// Footer note
const StyledFooterNote = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.LIGHT_GREY,
  padding: '15px',
  marginTop: '30px',
  borderTop: `5px solid ${COLORS.BLUE}`,
  fontSize: '16px',
  
  '& svg': {
    marginRight: '10px',
    color: COLORS.BLUE,
    verticalAlign: 'middle',
  }
}));

// Fuel type badge
const FuelTypeBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: COLORS.BLUE,
  color: COLORS.WHITE,
  padding: '5px 10px',
  borderRadius: '4px',
  marginTop: '10px',
  marginBottom: '15px',
  fontWeight: 600,
  
  '& svg': {
    marginRight: '5px',
  }
}));

// Extract year from various possible date fields in vehicleData
const extractVehicleYear = (vehicleData) => {
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

// Determine fuel type from vehicle data if not explicitly provided
const determineFuelType = (vehicleData) => {
  if (!vehicleData) return null;
  
  // First check for explicit fuel type
  if (vehicleData.fuelType) {
    const normalizedFuelType = vehicleData.fuelType.toLowerCase().trim();
    
    // Map common variations
    if (['gasoline', 'unleaded', 'gas'].includes(normalizedFuelType)) {
      return 'petrol';
    } else if (['gasoil', 'derv'].includes(normalizedFuelType)) {
      return 'diesel';
    }
    
    return normalizedFuelType;
  }
  
  // Look for clues in model name
  const model = (vehicleData.model || '').toLowerCase();
  if (/tdi|cdi|hdi|dci|crdi|d4d|jtd|tdci/.test(model)) {
    return 'diesel';
  }
  
  // Check variant for fuel type indicators
  const variant = (vehicleData.variant || '').toLowerCase();
  if (/diesel|tdi|cdi|hdi|dci|crdi/.test(variant)) {
    return 'diesel';
  }
  if (/petrol|tsi|gti|vti|mpi/.test(variant)) {
    return 'petrol';
  }
  
  // Check engine size - rough heuristic
  const engineSize = parseInt(vehicleData.engineCapacity || 0, 10);
  if (engineSize > 0) {
    // In the UK, diesel engines usually don't come in really small displacements
    if (engineSize < 1000) {
      return 'petrol';
    }
  }
  
  // Return null if we can't determine
  return null;
};

// Tab Panel function component
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <TabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`specs-tabpanel-${index}`}
      aria-labelledby={`specs-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </TabPanel>
  );
}

// Tab props accessor function
function a11yProps(index) {
  return {
    id: `specs-tab-${index}`,
    'aria-controls': `specs-tabpanel-${index}`,
  };
}

const TechnicalSpecificationsPage = ({ vehicleData = null, loading: initialLoading = false, error: initialError = null, onDataLoad }) => {
  // States
  const [tabValue, setTabValue] = useState(0);
  const [techSpecsData, setTechSpecsData] = useState(null);
  const [loading, setLoading] = useState(initialLoading || true);
  const [error, setError] = useState(initialError);
  const [matchConfidence, setMatchConfidence] = useState('none');

  // Extract year from vehicle data - memoized
  const vehicleYear = useMemo(() => {
    return vehicleData ? extractVehicleYear(vehicleData) : null;
  }, [vehicleData]);

  // Extract and normalize fuel type - memoized
  const vehicleFuelType = useMemo(() => {
    return vehicleData ? determineFuelType(vehicleData) : null;
  }, [vehicleData]);

  // Memoized tab change handler
  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  // Data fetching effect - enhanced with fuel type support
  useEffect(() => {
    // Don't do anything if no vehicle data
    if (!vehicleData) return;
    
    // Cancel flag for cleanup
    let isMounted = true;
    
    const fetchTechSpecs = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const make = vehicleData.make;
        const model = vehicleData.model || vehicleData.vehicleModel;
  
        if (!make || !model) {
          throw new Error("Vehicle make and model required");
        }
        
        console.log(`Fetching tech specs for ${make} ${model} (Year: ${vehicleYear}, Fuel: ${vehicleFuelType})`);
        
        // Use the API client for data fetching with fuel type
        const data = await techSpecsApi.lookupTechSpecs({
          make,
          model,
          year: vehicleYear,
          fuelType: vehicleFuelType
        });
        
        // Only update state if component is still mounted
        if (isMounted) {
          setTechSpecsData(data);
          // Get match confidence from API client's _matchConfidence property
          setMatchConfidence(data._matchConfidence || (data.vehicleIdentification?.matchedTo ? 'fuzzy' : 'exact'));
          
          // Call onDataLoad with the new data
          if (onDataLoad) onDataLoad(data);
        }
      } catch (err) {
        if (isMounted) {
          // Don't log AbortError (happens during normal cleanup)
          if (err.name !== 'AbortError') {
            console.error("Error fetching technical specifications:", err);
            setError(err.message || "Failed to load technical specifications");
          }
          setMatchConfidence('none');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    fetchTechSpecs();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
      // Cancel any pending requests
      techSpecsApi.cancelAllRequests();
    };
    
  }, [vehicleData?.make, vehicleData?.model, vehicleYear, vehicleFuelType, onDataLoad]);

  // Memoized match warning component - enhanced with fuel type
  const MatchWarning = useMemo(() => {
    if (!techSpecsData || !vehicleData) return null;
    
    const { vehicleIdentification } = techSpecsData;
    
    if (matchConfidence === 'fuzzy' && vehicleIdentification?.matchedTo) {
      // Get matched vehicle year range for display
      const matchedYearInfo = vehicleIdentification.matchedTo.yearRange 
        ? ` (${vehicleIdentification.matchedTo.yearRange.startYear}-${
            vehicleIdentification.matchedTo.yearRange.endYear === 'present' 
              ? 'present' 
              : vehicleIdentification.matchedTo.yearRange.endYear
          })`
        : '';
      
      // Get matched fuel type info
      const matchedFuelType = vehicleIdentification.matchedTo.fuelType && 
                             vehicleIdentification.matchedTo.fuelType !== 'unknown'
        ? ` - ${vehicleIdentification.matchedTo.fuelType.charAt(0).toUpperCase() + 
             vehicleIdentification.matchedTo.fuelType.slice(1)} Engine`
        : '';
      
      // Get requested vehicle year for display
      const year = extractVehicleYear(vehicleData);
      const requestedYear = year ? ` (${year})` : '';
      
      // Get requested fuel type for display
      const requestedFuelType = vehicleFuelType 
        ? ` - ${vehicleFuelType.charAt(0).toUpperCase() + vehicleFuelType.slice(1)} Engine`
        : '';
      
      return (
        <WarningPanel>
          <WarningIcon />
          <div>
            <GovUKHeadingS>Approximate Match</GovUKHeadingS>
            <GovUKBody>
              We don't have exact data for your <strong>{vehicleIdentification.make} {vehicleIdentification.model}{requestedYear}{requestedFuelType}</strong>. 
              The specifications shown are based on <strong>{vehicleIdentification.matchedTo.make} {vehicleIdentification.matchedTo.model}{matchedYearInfo}{matchedFuelType}</strong>, 
              which is the closest match to your vehicle.
            </GovUKBody>
          </div>
        </WarningPanel>
      );
    } else if (matchConfidence === 'year-match' && vehicleIdentification?.matchedTo) {
      // It's the right year range but not exact model variant
      return (
        <PremiumInfoPanel>
          <InfoIcon style={{ marginRight: '15px', marginTop: '3px', flexShrink: 0, color: COLORS.BLUE }} />
          <div>
            <GovUKHeadingS>Compatible Model Match</GovUKHeadingS>
            <GovUKBody>
              The specifications shown are for <strong>{vehicleIdentification.matchedTo.make} {vehicleIdentification.matchedTo.model} {vehicleIdentification.matchedTo.modelType}</strong>, 
              which is compatible with your specific vehicle variant.
            </GovUKBody>
          </div>
        </PremiumInfoPanel>
      );
    }
    return null;
  }, [techSpecsData, vehicleData, matchConfidence, vehicleFuelType]);

  // Helper function to render a specification table
  const renderSpecTable = useCallback((items) => {
    if (!items || items.length === 0) return null;
    
    return (
      <SpecificationTable>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <th scope="row">
                {item.label || item.name}
              </th>
              <td>
                <StyledValueHighlight>{item.value}</StyledValueHighlight> {item.unit && <span>{item.unit}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </SpecificationTable>
    );
  }, []);

  // Helper function to render notes as styled factor items
  const renderNotes = useCallback((notes) => {
    if (!notes || notes.length === 0) return null;
    
    return (
      <InfoPanel>
        <GovUKHeadingS>
          <InfoIcon fontSize="small" /> Important notes
        </GovUKHeadingS>
        <StyledFactorList>
          {notes.map((note, index) => (
            <StyledFactorItem key={index}>
              <InfoIcon fontSize="small" />
              <span>{note}</span>
            </StyledFactorItem>
          ))}
        </StyledFactorList>
      </InfoPanel>
    );
  }, []);

  // Memoized tabs configuration based on available data
  const tabs = useMemo(() => {
    if (!techSpecsData) return [];
    
    const tabsConfig = [];
    
    // Engine Details Tab
    const engineSections = [];
    
    if (techSpecsData.vehicleIdentification) {
      engineSections.push({
        title: "Vehicle Identification",
        icon: <DirectionsCarIcon />,
        content: techSpecsData.vehicleIdentification.engineDetails && (
          <>
            <GovUKBody>
              Key specifications for this <StyledValueHighlight>{techSpecsData.vehicleIdentification.make} {techSpecsData.vehicleIdentification.model}</StyledValueHighlight> engine.
            </GovUKBody>
            {renderSpecTable(techSpecsData.vehicleIdentification.engineDetails)}
          </>
        )
      });
    }
    
    if (techSpecsData.injectionSystem) {
      engineSections.push({
        title: "Injection System",
        icon: <LocalGasStationIcon />,
        content: renderSpecTable(techSpecsData.injectionSystem.specifications || techSpecsData.injectionSystem.details)
      });
    }
    
    if (techSpecsData.tuningEmissions) {
      engineSections.push({
        title: "Tuning & Emissions",
        icon: <SettingsIcon />,
        content: (
          <>
            <GovUKBody>
              These specifications are important for emissions testing and engine tuning operations.
            </GovUKBody>
            {renderSpecTable(techSpecsData.tuningEmissions.specifications || techSpecsData.tuningEmissions.details)}
          </>
        )
      });
    }
    
    if (techSpecsData.spark_plugs) {
      engineSections.push({
        title: "Spark Plugs",
        icon: <BuildIcon />,
        content: renderSpecTable(techSpecsData.spark_plugs.specifications || techSpecsData.spark_plugs.details)
      });
    }
    
    if (techSpecsData.fuel_system) {
      engineSections.push({
        title: "Fuel System",
        icon: <LocalGasStationIcon />,
        content: renderSpecTable(techSpecsData.fuel_system.specifications || techSpecsData.fuel_system.details)
      });
    }
    
    if (techSpecsData.startingCharging) {
      engineSections.push({
        title: "Starting & Charging",
        icon: <BatteryChargingFullIcon />,
        content: renderSpecTable(techSpecsData.startingCharging.specifications || techSpecsData.startingCharging.details)
      });
    }
    
    if (engineSections.length > 0) {
      tabsConfig.push({
        label: "Engine Details",
        icon: <SettingsIcon />,
        sections: engineSections
      });
    }
    
    // Service Information Tab
    const serviceSections = [];
    
    if (techSpecsData.serviceChecks) {
      serviceSections.push({
        title: "Service Checks & Adjustments",
        icon: <SpeedIcon />,
        content: (
          <>
            <GovUKBody>
              Reference values for maintenance and diagnostics.
            </GovUKBody>
            {renderSpecTable(techSpecsData.serviceChecks.specifications || techSpecsData.serviceChecks.details)}
          </>
        )
      });
    }
    
    if (techSpecsData.lubricantsCapacities) {
      serviceSections.push({
        title: "Lubricants & Capacities",
        icon: <OilBarrelIcon />,
        content: (
          <>
            {techSpecsData.lubricantsCapacities.engine_oil_options && (
              <Box mb={4}>
                <GovUKHeadingS>
                  Engine Oil Options
                </GovUKHeadingS>
                {renderSpecTable(techSpecsData.lubricantsCapacities.engine_oil_options.specifications || 
                                 techSpecsData.lubricantsCapacities.engine_oil_options.details)}
              </Box>
            )}
            
            <Box>
              <GovUKHeadingS>
                Other Lubricants & Capacities
              </GovUKHeadingS>
              {renderSpecTable(techSpecsData.lubricantsCapacities.specifications || 
                               techSpecsData.lubricantsCapacities.details)}
            </Box>
          </>
        )
      });
    }
    
    if (serviceSections.length > 0) {
      tabsConfig.push({
        label: "Service Information",
        icon: <BuildIcon />,
        sections: serviceSections
      });
    }
    
    // Torque Specifications Tab
    const torqueSections = [];
    
    if (techSpecsData.tighteningTorques) {
      if (techSpecsData.tighteningTorques.cylinder_head_instructions) {
        torqueSections.push({
          title: "Cylinder Head Instructions",
          icon: <BuildIcon />,
          content: (
            <>
              <GovUKBody>
                {techSpecsData.tighteningTorques.cylinder_head_instructions.map((instruction, index) => (
                  <p key={index}>{instruction}</p>
                ))}
              </GovUKBody>
              
              {techSpecsData.tighteningTorques.cylinder_head_torques && (
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} mb={4}>
                  <Box flex={1}>
                    <GovUKHeadingS>Tightening sequence</GovUKHeadingS>
                    <StyledFactorList>
                      {techSpecsData.tighteningTorques.cylinder_head_torques.map((step, index) => (
                        <StyledFactorItem key={index}>
                          <BuildIcon fontSize="small" />
                          <span>{step}</span>
                        </StyledFactorItem>
                      ))}
                    </StyledFactorList>
                  </Box>
                </Box>
              )}
            </>
          )
        });
      }
      
      if (techSpecsData.tighteningTorques.engine_torques) {
        torqueSections.push({
          title: "Engine Tightening Torques",
          icon: <BuildIcon />,
          content: (
            <>
              {renderSpecTable(techSpecsData.tighteningTorques.engine_torques)}
              {techSpecsData.tighteningTorques.engine_notes && renderNotes(techSpecsData.tighteningTorques.engine_notes)}
            </>
          )
        });
      }
      
      if (techSpecsData.tighteningTorques.chassis_tightening_torques) {
        torqueSections.push({
          title: "Chassis Tightening Torques",
          icon: <BuildIcon />,
          content: (
            <>
              {renderSpecTable(techSpecsData.tighteningTorques.chassis_tightening_torques)}
              {techSpecsData.tighteningTorques.chassis_notes && renderNotes(techSpecsData.tighteningTorques.chassis_notes)}
            </>
          )
        });
      }
    }
    
    if (torqueSections.length > 0) {
      tabsConfig.push({
        label: "Torque Specifications",
        icon: <BuildIcon />,
        sections: torqueSections
      });
    }
    
    // Brakes & A/C Tab
    const otherSections = [];
    
    if (techSpecsData.brakeDimensions) {
      otherSections.push({
        title: "Brake Disc & Drum Dimensions",
        icon: <BuildIcon />,
        content: (
          <>
            <GovUKBody>
              Reference measurements for brake component service and replacement.
            </GovUKBody>
            {renderSpecTable(techSpecsData.brakeDimensions.specifications || techSpecsData.brakeDimensions.details)}
          </>
        )
      });
    }
    
    if (techSpecsData.airConditioning) {
      otherSections.push({
        title: "Air Conditioning",
        icon: <AcUnitIcon />,
        content: renderSpecTable(techSpecsData.airConditioning.specifications || techSpecsData.airConditioning.details)
      });
    }
    
    if (otherSections.length > 0) {
      tabsConfig.push({
        label: "Brakes & A/C",
        icon: <AcUnitIcon />,
        sections: otherSections
      });
    }
    
    return tabsConfig.filter(tab => tab.sections.length > 0);
  }, [techSpecsData, renderSpecTable, renderNotes]);

  // Last updated date
  const lastUpdated = useMemo(() => {
    // You could fetch this from the API or set a default
    return "March 2025";
  }, []);

  // Loading state
  if (loading) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
          <GovUKLoadingContainer>
            <GovUKLoadingSpinner />
            <GovUKBody>Loading technical specifications...</GovUKBody>
          </GovUKLoadingContainer>
        </GovUKMainWrapper>
      </GovUKContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
          <Alert 
            severity="error" 
            icon={<WarningIcon />}
            style={{ 
              marginBottom: '20px', 
              borderRadius: 0, 
              borderLeft: `5px solid ${COLORS.RED}`,
              padding: '20px'
            }}
          >
            <GovUKHeadingS>There was a problem</GovUKHeadingS>
            <GovUKBody>{error}</GovUKBody>
          </Alert>
        </GovUKMainWrapper>
      </GovUKContainer>
    );
  }

  // No data state
  if (!techSpecsData) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
          <PremiumInfoPanel>
            <InfoIcon style={{ marginRight: '15px', marginTop: '3px', flexShrink: 0, color: COLORS.BLUE }} />
            <div>
              <GovUKHeadingS>No specifications available</GovUKHeadingS>
              <GovUKBody>
                We don't currently have technical specifications for this vehicle. This could be because the vehicle is too new, too old, or a rare model.
              </GovUKBody>
            </div>
          </PremiumInfoPanel>
        </GovUKMainWrapper>
      </GovUKContainer>
    );
  }

  // Extract display info from vehicle identification
  const { vehicleIdentification } = techSpecsData;
  const displayMake = vehicleIdentification.make;
  const displayModel = vehicleIdentification.model;
  const displayModelType = vehicleIdentification.modelType || '';
  
  // Extract fuel type for display
  const displayFuelType = vehicleIdentification.matchedTo?.fuelType || vehicleIdentification.fuelType || vehicleFuelType;

  return (
    <GovUKContainer>
      <GovUKMainWrapper>
        {/* Main content */}
        <Box>
          {/* Match warning - memoized component */}
          {MatchWarning}
          
          {/* Important notice */}
          <WarningPanel>
            <WarningIcon />
            <div>
              <GovUKHeadingS>Important</GovUKHeadingS>
              <GovUKBody>
                These specifications are for reference only. Always consult the manufacturer's documentation for definitive technical information.
              </GovUKBody>
            </div>
          </WarningPanel>
          
          {/* Display fuel type */}
          {displayFuelType && displayFuelType !== 'unknown' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: 2, marginBottom: 2 }}>
              <FuelTypeBadge>
                <LocalGasStationIcon fontSize="small" />
                {displayFuelType.charAt(0).toUpperCase() + displayFuelType.slice(1)} Engine
              </FuelTypeBadge>
            </Box>
          )}
          
          {/* Tabs Navigation */}
          <Box>
            <StyledTabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="technical specifications tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab, index) => (
                <StyledTab 
                  key={index}
                  label={tab.label} 
                  {...a11yProps(index)} 
                />
              ))}
            </StyledTabs>
          </Box>
          
          {/* Tab Content */}
          {tabs.map((tab, tabIndex) => (
            <CustomTabPanel key={tabIndex} value={tabValue} index={tabIndex}>
              {tab.sections.map((section, sectionIndex) => (
                section.content && (
                  <SectionContainer key={sectionIndex}>
                    <SectionHeader>
                      {section.icon}
                      <GovUKHeadingM>{section.title}</GovUKHeadingM>
                    </SectionHeader>
                    {section.content}
                  </SectionContainer>
                )
              ))}
            </CustomTabPanel>
          ))}
          
          {/* Footer Note */}
          <StyledFooterNote>
            <InfoIcon fontSize="small" /> Technical specifications sourced from industry standard databases. Last updated: {lastUpdated}
          </StyledFooterNote>
        </Box>
      </GovUKMainWrapper>
    </GovUKContainer>
  );
};

export default React.memo(TechnicalSpecificationsPage);