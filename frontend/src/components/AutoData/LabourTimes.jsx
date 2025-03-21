import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  // Import theme components and styles
  COLORS,
  GovUKContainer,
  GovUKMainWrapper,
  GovUKHeadingS,
  GovUKBody,
  GovUKLoadingContainer,
  GovUKLoadingSpinner,
  PremiumInfoPanel,
  GovUKHeadingM
} from '../../styles/theme';

// Import layout components
import {
  RepairTimesContainer,
  ValueHighlight,
  GovUKToggleText,
  SpecificationTable,
  StyledTabs,
  StyledTab,
  AccordionSection,
  AccordionHeader,
  AccordionContent,
  AccordionIconWrapper,
  OperationCountBadge,
  GovUKChevron,
  WarningPanel,
  FooterNote,
  SummaryPanel,
  TabPanel,
  OperationItem,
  OperationsGroup
} from './styles/style';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

// Import Material-UI icons
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import RepairCalculator from './RepairTimes/RateCalc';

// Import API client
import repairTimesApi from './api/RepairTimesApiClient';

// Utility functions moved outside component to prevent recreation on render
const formatValue = (value) => {
  if (!value) return '';
  // Insert a space before an uppercase letter that follows a lowercase letter or closing parenthesis
  return value.replace(/([a-z\)])([A-Z])/g, '$1 $2');
};

// Memoized function to parse repair operations
const parseRepairOperations = (text) => {
  if (!text) return [text];
  
  // Common operation prefixes to look for
  const operationPrefixes = [
    "Remove and Install", 
    "Check and Adjust", 
    "Strip and Rebuild", 
    "Renew", 
    "Drain and Refill", 
    "Bleed", 
    "Disconnect", 
    "Partially remove",
    "Remove and Replace"
  ];
  
  // If text doesn't contain multiple operations, return as is
  if (!operationPrefixes.some(prefix => text.includes(` - ${prefix}`))) {
    return [text];
  }
  
  // Initialize with the first operation
  let operations = [];
  let currentOp = "";
  let remainingText = text;
  
  // Find the first operation prefix
  for (const prefix of operationPrefixes) {
    if (text.startsWith(prefix)) {
      currentOp = prefix;
      remainingText = text.substring(prefix.length);
      break;
    }
  }
  
  if (!currentOp) {
    return [text]; // No recognized operation found
  }
  
  // Split the remaining text by recognized operation prefixes
  const parts = remainingText.split(/ - (?=(?:Remove and |Check and |Strip and |Renew|Drain and |Bleed|Disconnect|Partially remove|Remove and Replace))/);
  
  // Add the first operation with its target
  operations.push(`${currentOp}${parts[0]}`);
  
  // Process the rest of the operations
  for (let i = 1; i < parts.length; i++) {
    // Find which prefix this part starts with
    for (const prefix of operationPrefixes) {
      if (parts[i].startsWith(prefix)) {
        operations.push(parts[i]);
        break;
      }
    }
  }
  
  return operations;
};

// Extract year range from model type string - Outside component
const extractYearRangeFromModelType = (modelType) => {
  if (!modelType) return { startYear: null, endYear: null };
  
  // Look for patterns like (07-14), (2007-2014), (2007+)
  const yearPatterns = [
    /\((\d{2})-(\d{2})\)/,             // (07-14)
    /\((\d{4})-(\d{4})\)/,             // (2007-2014)
    /\((\d{4})[\-\+](\d{4})\)/,        // (2007-2014) with different dash
    /(\d{4})-(\d{4})/,                 // 2007-2014
    /\((\d{4})\+\)/,                   // (2007+)
    /(\d{4})\+/,                       // 2007+
  ];
  
  for (const pattern of yearPatterns) {
    const match = pattern.exec(modelType);
    if (match) {
      let startYear = match[1];
      
      // Convert 2-digit years to 4-digit
      if (startYear.length === 2) {
        startYear = parseInt(`20${startYear}`, 10);  // Assuming 20xx for modern vehicles
      } else {
        startYear = parseInt(startYear, 10);
      }
      
      // Handle end year if it exists
      let endYear = null;
      if (match[2]) {
        endYear = match[2];
        // Convert 2-digit years to 4-digit
        if (endYear.length === 2) {
          endYear = parseInt(`20${endYear}`, 10);
        } else {
          endYear = parseInt(endYear, 10);
        }
      }
      
      return { startYear, endYear };
    }
  }
  
  return { startYear: null, endYear: null };
};

// Extract year from various date fields in vehicleData - Outside component
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

// Helper to find the most complex system (most operations)
const getMostComplexSystem = (data) => {
  if (!data) return 'Engine';
  
  const systemCounts = {};
  
  // Map category names to display names
  const categoryMap = {
    'engineData': 'Engine',
    'fuelManagement': 'Fuel System',
    'cooling': 'Cooling System',
    'exhaust': 'Exhaust',
    'drivetrain': 'Transmission',
    'brakes': 'Brakes',
    'electrical': 'Electrical',
    'climate': 'Climate Control',
    'body': 'Body'
  };
  
  // Count operations per system
  Object.entries(data).forEach(([key, section]) => {
    if (typeof section !== 'object' || section === null || key === 'vehicleIdentification') return;
    
    const displayName = categoryMap[key] || key;
    systemCounts[displayName] = 0;
    
    Object.values(section).forEach(subSection => {
      if (subSection && subSection.details && Array.isArray(subSection.details)) {
        systemCounts[displayName] += subSection.details.length;
      }
    });
  });
  
  // Find system with most operations
  let maxSystem = 'Engine';
  let maxCount = 0;
  
  Object.entries(systemCounts).forEach(([system, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxSystem = system;
    }
  });
  
  return maxSystem;
};


// SpecTable component - Using styled components for multi-operation items
const SpecTable = memo(({ items }) => {
  // Return early if no items to avoid empty table
  if (!items || items.length === 0) return null;
  
  // Create a processed array of all operations with grouping info
  const processedItems = [];
  
  items.forEach((item, index) => {
    // Parse operations for each item
    const operations = parseRepairOperations(item.label);
    
    // Skip if no valid operations
    if (!operations || operations.length === 0) return;
    
    if (operations.length === 1) {
      // Single operation - simple case
      processedItems.push({
        id: `item-${index}`,
        operations: [operations[0]],
        value: item.value,
        unit: item.unit,
        isMultiOperation: false
      });
    } else {
      // Multiple operations - group them
      processedItems.push({
        id: `item-${index}`,
        operations: operations,
        value: item.value,
        unit: item.unit,
        isMultiOperation: true
      });
    }
  });
  
  return (
    <SpecificationTable>
      <tbody>
        {processedItems.map((item) => {
          if (!item.isMultiOperation) {
            // Single operation row - standard display
            return (
              <tr key={item.id}>
                <th scope="row">{item.operations[0]}</th>
                <td>
                  <ValueHighlight color={COLORS.BLUE}>{formatValue(item.value)}</ValueHighlight>
                  {item.unit && <span> {item.unit}</span>}
                </td>
              </tr>
            );
          } else {
            // Multiple operations - create a row with custom styling
            return (
              <tr key={item.id}>
                <th scope="row">
                  <OperationsGroup>
                    {item.operations.map((op, i) => (
                      <OperationItem 
                        key={`${item.id}-op-${i}`} 
                        className={i === 0 ? 'first-operation' : ''}
                      >
                        {op}
                      </OperationItem>
                    ))}
                  </OperationsGroup>
                </th>
                <td>
                  <ValueHighlight color={COLORS.BLUE}>{formatValue(item.value)}</ValueHighlight>
                  {item.unit && <span> {item.unit}</span>}
                </td>
              </tr>
            );
          }
        })}
      </tbody>
    </SpecificationTable>
  );
});

// LongLabel component just returns the text for single operations
// For multiple operations, the handling is moved to the SpecTable component
const LongLabel = memo(({ text }) => {
  return <span>{text}</span>;
});

const Accordion = memo(({ title, children, expanded, onChange, id }) => {
  // Count the number of items in the children - more direct approach
  const itemCount = useMemo(() => {
    try {
      // Find the SpecTable in children
      const specTable = React.Children.toArray(children)
        .find(child => child && child.type === SpecTable);
      
      if (specTable && specTable.props && specTable.props.items) {
        // Directly count items property if available
        return specTable.props.items.length || '0';
      }
      
      // Fallback to scanning for tbody rows as before
      let items = 0;
      React.Children.forEach(children, child => {
        if (child && child.props && child.props.children) {
          React.Children.forEach(child.props.children, subChild => {
            if (subChild && subChild.type === 'tbody') {
              items = React.Children.count(subChild.props.children);
            }
          });
        }
      });
      return items || '0';
    } catch (e) {
      console.warn('Error counting items:', e);
      return '0';
    }
  }, [children]);

  return (
    <AccordionSection>
      <AccordionHeader 
        onClick={onChange}
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
      >
        <span>{title} <OperationCountBadge>{itemCount}</OperationCountBadge></span>
        <AccordionIconWrapper style={{ transform: expanded ? 'translateY(2px)' : 'none' }}>
          <GovUKChevron 
            className="govuk-accordion-nav__chevron" 
            expanded={expanded}
          />
          <GovUKToggleText style={{ color: expanded ? COLORS.BLACK : COLORS.BLUE }}>
            {expanded ? "Hide" : "Show"}
          </GovUKToggleText>
        </AccordionIconWrapper>
      </AccordionHeader>
      {expanded && (
        <AccordionContent 
          id={`${id}-content`}
          aria-labelledby={`${id}-header`}
          role="region"
        >
          {children}
        </AccordionContent>
      )}
    </AccordionSection>
  );
});

// Tab Panel function component - Memoized
const CustomTabPanel = memo(function CustomTabPanel(props) {
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
});

// Tab props accessor function - Outside component
function a11yProps(index) {
  return {
    id: `specs-tab-${index}`,
    'aria-controls': `specs-tabpanel-${index}`,
  };
}

// Main component - with all optimizations and fixes
const VehicleRepairTimesComponent = ({ registration, vehicleData, onDataLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairData, setRepairData] = useState(null);
  const [matchConfidence, setMatchConfidence] = useState('none');
  const [tabValue, setTabValue] = useState(0);
  // Track expanded accordion sections
  const [expandedSections, setExpandedSections] = useState({});

  // Memoized tab change handler
  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
    // Reset expanded sections when changing tabs
    setExpandedSections({});
  }, []);

  // Memoized section toggle function to avoid recreation on render
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Data fetching effect - optimized to only run when essential data changes
  useEffect(() => {
    // Don't do anything if no vehicle data
    if (!vehicleData) return;
    
    // Cancel flag for cleanup
    let isMounted = true;
    
    const fetchRepairTimes = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const make = vehicleData.make;
        const model = vehicleData.model || vehicleData.vehicleModel;
  
        if (!make || !model) {
          throw new Error("Vehicle make and model required");
        }
        
        // Use the API client for data fetching with fallback logic
        const data = await repairTimesApi.lookupRepairTimes(vehicleData);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setRepairData(data);
          // Get match confidence from API client's _matchConfidence property
          setMatchConfidence(data._matchConfidence || (data.vehicleIdentification?.matchedTo ? 'fuzzy' : 'exact'));
          
          // Call onDataLoad with the new data, not stale state
          if (onDataLoad) onDataLoad(data);
        }
      } catch (err) {
        if (isMounted) {
          // Don't log AbortError (happens during normal cleanup)
          if (err.name !== 'AbortError') {
            console.error("Error fetching repair times:", err);
            setError(err.message || "Failed to load repair times");
          }
          setMatchConfidence('none');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    fetchRepairTimes();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
      // Cancel any pending requests
      repairTimesApi.cancelAllRequests();
    };
    
  }, [vehicleData?.make, vehicleData?.model, vehicleData?.year, onDataLoad]);

  // Memoized function to generate year range display
  const getYearRangeDisplay = useCallback(() => {
    if (!repairData || !repairData.vehicleIdentification) return '';
    
    const { vehicleIdentification } = repairData;
    
    // First check if API returned year range in matchedTo
    if (vehicleIdentification.matchedTo?.yearRange) {
      const { startYear, endYear } = vehicleIdentification.matchedTo.yearRange;
      return ` (${startYear}-${endYear === 'present' ? 'present' : endYear})`;
    }
    
    // Otherwise, try to extract from model type
    const modelType = vehicleIdentification.modelType || '';
    const { startYear, endYear } = extractYearRangeFromModelType(modelType);
    
    if (startYear) {
      return ` (${startYear}${endYear ? `-${endYear}` : '+'})`;
    }
    
    // Last resort - use vehicle's actual year if available
    const year = vehicleData ? extractVehicleYear(vehicleData) : null;
    if (year) {
      return ` (${year})`;
    }
    
    return ''; // No year info available
  }, [repairData, vehicleData]);

  // Memoized match warning component
  const MatchWarning = useMemo(() => {
    if (!repairData || !vehicleData) return null;
    
    const { vehicleIdentification } = repairData;
    
    if (matchConfidence === 'fuzzy' && vehicleIdentification?.matchedTo) {
      // Get matched vehicle year range for display
      const matchedYearInfo = vehicleIdentification.matchedTo.yearRange 
        ? ` (${vehicleIdentification.matchedTo.yearRange.startYear}-${
            vehicleIdentification.matchedTo.yearRange.endYear === 'present' 
              ? 'present' 
              : vehicleIdentification.matchedTo.yearRange.endYear
          })`
        : '';
      
      // Get requested vehicle year for display
      const year = extractVehicleYear(vehicleData);
      const requestedYear = year ? ` (${year})` : '';
      
      return (
        <WarningPanel>
          <WarningIcon />
          <div>
            <GovUKHeadingS>Approximate Match</GovUKHeadingS>
            <GovUKBody>
              We don't have exact data for your <strong>{vehicleIdentification.make} {vehicleIdentification.model}{requestedYear}</strong>. 
              The times shown are based on <strong>{vehicleIdentification.matchedTo.make} {vehicleIdentification.matchedTo.model}{matchedYearInfo}</strong>, 
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
              The repair times shown are for <strong>{vehicleIdentification.matchedTo.make} {vehicleIdentification.matchedTo.model} {vehicleIdentification.matchedTo.modelType}</strong>, 
              which is compatible with your specific vehicle variant.
            </GovUKBody>
          </div>
        </PremiumInfoPanel>
      );
    }
    return null;
  }, [repairData, vehicleData, matchConfidence]);

  // Memoized tabs configuration
  const tabs = useMemo(() => {
    if (!repairData) return [];
    
    return [
      {
        label: "Engine",
        sections: [
          { title: "Engine Assembly", content: repairData.engineData?.engineAssembly?.details && <SpecTable items={repairData.engineData.engineAssembly.details} /> },
          { title: "Cylinder Head", content: repairData.engineData?.cylinderHead?.details && <SpecTable items={repairData.engineData.cylinderHead.details} /> },
          { title: "Camshaft & Drive Gear", content: repairData.engineData?.camshaftDrive?.details && <SpecTable items={repairData.engineData.camshaftDrive.details} /> },
          { title: "Crankshaft & Pistons", content: repairData.engineData?.crankshaft?.details && <SpecTable items={repairData.engineData.crankshaft.details} /> },
          { title: "Lubrication", content: repairData.engineData?.lubrication?.details && <SpecTable items={repairData.engineData.lubrication.details} /> },
          { title: "Auxiliary Drive", content: repairData.engineData?.auxiliaryDrive?.details && <SpecTable items={repairData.engineData.auxiliaryDrive.details} /> },
        ].filter(section => section.content)
      },
      {
        label: "Fuel & Cooling",
        sections: [
          { title: "Air Filter & Manifolds", content: repairData.fuelManagement?.airFilter?.details && <SpecTable items={repairData.fuelManagement.airFilter.details} /> },
          { title: "Throttle Controls", content: repairData.fuelManagement?.throttleControls?.details && <SpecTable items={repairData.fuelManagement.throttleControls.details} /> },
          { title: "Diesel Injection System", content: repairData.fuelManagement?.dieselInjection?.details && <SpecTable items={repairData.fuelManagement.dieselInjection.details} /> },
          { title: "Fuel Supply", content: repairData.fuelManagement?.fuelSupply?.details && <SpecTable items={repairData.fuelManagement.fuelSupply.details} /> },
          { title: "Turbocharger", content: repairData.fuelManagement?.turbocharger?.details && <SpecTable items={repairData.fuelManagement.turbocharger.details} /> },
          { title: "Radiator & Cooling", content: repairData.cooling?.radiator?.details && <SpecTable items={repairData.cooling.radiator.details} /> },
          { title: "Pump & Drive", content: repairData.cooling?.pumpDrive?.details && <SpecTable items={repairData.cooling.pumpDrive.details} /> },
          { title: "Header Tank & Hoses", content: repairData.cooling?.headerTank?.details && <SpecTable items={repairData.cooling.headerTank.details} /> },
          { title: "Exhaust Manifold & Pipes", content: repairData.exhaust?.manifold?.details && <SpecTable items={repairData.exhaust.manifold.details} /> },
          { title: "Exhaust Gas Aftertreatment", content: repairData.exhaust?.exhaustGas?.details && <SpecTable items={repairData.exhaust.exhaustGas.details} /> },
        ].filter(section => section.content)
      },
      {
        label: "Transmission & Drive",
        sections: [
          { title: "Clutch Pedal & Hydraulics", content: repairData.drivetrain?.clutchControls?.details && <SpecTable items={repairData.drivetrain.clutchControls.details} /> },
          { title: "Clutch Unit & Flywheel", content: repairData.drivetrain?.clutchUnit?.details && <SpecTable items={repairData.drivetrain.clutchUnit.details} /> },
          { title: "Manual Transmission", content: repairData.drivetrain?.manualTransmission?.details && <SpecTable items={repairData.drivetrain.manualTransmission.details} /> },
          { title: "Final Drive, Shaft & Axles", content: repairData.drivetrain?.finalDrive?.details && <SpecTable items={repairData.drivetrain.finalDrive.details} /> },
        ].filter(section => section.content)
      },
      {
        label: "Suspension & Brakes",
        sections: [
          { title: "Braking System Hydraulics", content: repairData.brakes?.brakingSystem?.details && <SpecTable items={repairData.brakes.brakingSystem.details} /> },
          { title: "Footbrakes", content: repairData.brakes?.footbrakes?.details && <SpecTable items={repairData.brakes.footbrakes.details} /> },
          { title: "Brake Pedal & Servo", content: repairData.brakes?.brakePedal?.details && <SpecTable items={repairData.brakes.brakePedal.details} /> },
          { title: "ABS or ABS/ESP", content: repairData.brakes?.absSystems?.details && <SpecTable items={repairData.brakes.absSystems.details} /> },
          { title: "Parking Brake", content: repairData.brakes?.parkingBrake?.details && <SpecTable items={repairData.brakes.parkingBrake.details} /> },
        ].filter(section => section.content)
      },
      {
        label: "Electrical & Body",
        sections: [
          { title: "Heating & Ventilation", content: repairData.climate?.heating?.details && <SpecTable items={repairData.climate.heating.details} /> },
          { title: "Air Conditioning", content: repairData.climate?.airConditioning?.details && <SpecTable items={repairData.climate.airConditioning.details} /> },
          { title: "Battery & Cables", content: repairData.electrical?.batteryCables?.details && <SpecTable items={repairData.electrical.batteryCables.details} /> },
          { title: "Charging System", content: repairData.electrical?.chargingSystem?.details && <SpecTable items={repairData.electrical.chargingSystem.details} /> },
          { title: "Starting System", content: repairData.electrical?.startingSystem?.details && <SpecTable items={repairData.electrical.startingSystem.details} /> },
          { title: "Bulbs & LEDs", content: repairData.electrical?.bulbsLeds?.details && <SpecTable items={repairData.electrical.bulbsLeds.details} /> },
          { title: "Front Lamps", content: repairData.electrical?.frontLamps?.details && <SpecTable items={repairData.electrical.frontLamps.details} /> },
          { title: "Rear Lamps", content: repairData.electrical?.rearLamps?.details && <SpecTable items={repairData.electrical.rearLamps.details} /> },
          { title: "Interior Lamps", content: repairData.electrical?.interiorLamps?.details && <SpecTable items={repairData.electrical.interiorLamps.details} /> },
          { title: "Switches", content: repairData.electrical?.switches?.details && <SpecTable items={repairData.electrical.switches.details} /> },
          { title: "Instruments", content: repairData.electrical?.instruments?.details && <SpecTable items={repairData.electrical.instruments.details} /> },
          { title: "Sensors & Transmitters", content: repairData.electrical?.sensors?.details && <SpecTable items={repairData.electrical.sensors.details} /> },
          { title: "Fusebox & Relays", content: repairData.electrical?.fuseboxRelays?.details && <SpecTable items={repairData.electrical.fuseboxRelays.details} /> },
          { title: "Motors", content: repairData.electrical?.motors?.details && <SpecTable items={repairData.electrical.motors.details} /> },
          { title: "Control & Audio Units", content: repairData.electrical?.audioUnits?.details && <SpecTable items={repairData.electrical.audioUnits.details} /> },
          { title: "Windscreen Wipers/Washers", content: repairData.electrical?.wipers?.details && <SpecTable items={repairData.electrical.wipers.details} /> },
          { title: "Headlamp Wipers/Washers", content: repairData.electrical?.headlampWipers?.details && <SpecTable items={repairData.electrical.headlampWipers.details} /> },
          { title: "Rear Screen Wipers/Washers", content: repairData.electrical?.rearScreenWipers?.details && <SpecTable items={repairData.electrical.rearScreenWipers.details} /> },
          { title: "Interior/Seats/Seatbelts", content: repairData.body?.interiorSeats?.details && <SpecTable items={repairData.body.interiorSeats.details} /> },
        ].filter(section => section.content)
      }
    ].filter(tab => tab.sections.length > 0);
  }, [repairData]);

  // Memoized vehicle summary calculation
  const vehicleSummary = useMemo(() => {
    if (!repairData) return null;
    
    // Use the original, proven algorithm for counting operations
    const totalOperations = Object.values(repairData).reduce((count, section) => {
      if (typeof section !== 'object' || section === null) return count;
      
      return count + Object.values(section).reduce((subCount, subSection) => {
        if (subSection && subSection.details && Array.isArray(subSection.details)) {
          return subCount + subSection.details.length;
        }
        return subCount;
      }, 0);
    }, 0);
    
    // Continue with the time calculations as in the optimized version
    let totalTime = 0;
    let timeCount = 0;
    
    Object.values(repairData).forEach(section => {
      if (typeof section !== 'object' || section === null) return;
      
      Object.values(section).forEach(subSection => {
        if (subSection && subSection.details && Array.isArray(subSection.details)) {
          subSection.details.forEach(item => {
            if (item.value && !isNaN(parseFloat(item.value))) {
              totalTime += parseFloat(item.value);
              timeCount++;
            }
          });
        }
      });
    });
    
    const avgTime = timeCount > 0 ? (totalTime / timeCount).toFixed(1) : 'N/A';
    
    return {
      totalOperations,
      avgTime,
      mostComplexSystem: getMostComplexSystem(repairData)
    };
  }, [repairData]);

  // Bail out early for loading and error states
  if (loading) return (
    <GovUKContainer>
      <GovUKMainWrapper>
        <GovUKLoadingContainer>
          <GovUKLoadingSpinner />
          <GovUKHeadingS>Loading repair times data</GovUKHeadingS>
          <GovUKBody>Please wait while we retrieve the information for your vehicle.</GovUKBody>
        </GovUKLoadingContainer>
      </GovUKMainWrapper>
    </GovUKContainer>
  );

  if (error) return (
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

  if (!repairData) return (
    <GovUKContainer>
      <GovUKMainWrapper>
        <PremiumInfoPanel>
          <InfoIcon style={{ marginRight: '15px', marginTop: '3px', flexShrink: 0, color: COLORS.BLUE }} />
          <div>
            <GovUKHeadingS>No repair times available</GovUKHeadingS>
            <GovUKBody>
              We don't currently have repair times data for this vehicle. This could be because the vehicle is too new, too old, or a rare model.
            </GovUKBody>
          </div>
        </PremiumInfoPanel>
      </GovUKMainWrapper>
    </GovUKContainer>
  );

  // Extract display info from vehicle identification
  const { vehicleIdentification } = repairData;
  const displayMake = vehicleIdentification.make;
  const displayModel = vehicleIdentification.model;
  const yearRangeDisplay = getYearRangeDisplay();

  // Last updated date
  const lastUpdated = "March 2025";

  return (
    <GovUKContainer>
      <GovUKMainWrapper>
        {/* Main content */}
        <RepairTimesContainer>
     

          {vehicleSummary && (
            <SummaryPanel>
              <GovUKHeadingM>Repair Overview</GovUKHeadingM>
              <dl>
                <div>
                  <dt>Total Operations</dt>
                  <dd>
                    <ValueHighlight color={COLORS.BLUE}>
                      {vehicleSummary.totalOperations}
                    </ValueHighlight>
                  </dd>
                </div>
                <div>
                  <dt>Average Time</dt>
                  <dd>
                    <ValueHighlight color={COLORS.BLUE}>
                      {vehicleSummary.avgTime}
                    </ValueHighlight> hours
                  </dd>
                </div>
                <div>
                  <dt>Most Complex System</dt>
                  <dd>
                    <ValueHighlight color={COLORS.BLUE}>
                      {vehicleSummary.mostComplexSystem}
                    </ValueHighlight>
                  </dd>
                </div>
              </dl>
            </SummaryPanel>
          )}
          {/* Match warning - memoized component */}
          {MatchWarning}

          {/* Important notice */}
          <WarningPanel>
            <WarningIcon />
            <div>
              <GovUKHeadingS>Important</GovUKHeadingS>
              <GovUKBody>
                These repair times are for reference only. Actual repair time may vary depending on workshop conditions, equipment, and technician experience.
              </GovUKBody>
            </div>
          </WarningPanel>

          <RepairCalculator />

          {/* Tabs Navigation */}
          <Box>
            <StyledTabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="repair times tabs"
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
              {tab.sections.map((section, sectionIndex) => {
                const sectionId = `${tabIndex}-${sectionIndex}`;
                const isExpanded = !!expandedSections[sectionId];
                
                return (
                  <Accordion
                    key={sectionId}
                    id={`section-${sectionId}`}
                    title={section.title}
                    expanded={isExpanded}
                    onChange={() => toggleSection(sectionId)}
                  >
                    
                    {section.content}
                  </Accordion>
                );
              })}
            </CustomTabPanel>
          ))}

          {/* Footer Note */}
          <FooterNote>
            <InfoIcon fontSize="small" /> Repair times sourced from industry standard databases. Last updated: {lastUpdated}
          </FooterNote>
        </RepairTimesContainer>
      </GovUKMainWrapper>
    </GovUKContainer>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default memo(VehicleRepairTimesComponent);