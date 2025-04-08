import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import {
  // Import theme components and styles
  COLORS,
  GovUKContainer,
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKBodyS,
  GovUKLoadingSpinner,
  GovUKButton,
} from '../../styles/theme';

// Import custom tooltip components
import { HeadingWithTooltip } from '../../styles/tooltip';

// Import styled components from shared components
import {
  InsightsContainer,
  InsightPanel,
  InsightBody,
  InsightTable,
  ValueHighlight,
  FactorList,
  FactorItem,
  InsightNote,
  EnhancedLoadingContainer,
  EmptyStateContainer
} from '../Premium/DVLA/Insights/style/style';

// Import styled components specifically for repair times
import {
  // Layout components
  MainLayout,
  ContentArea,
  
  // Section components
  BulletinDetailPanel,
  DetailSectionTitle,
  SubSectionHeading,
  
  // Accordion components
  AccordionSection,
  AccordionHeader,
  AccordionContent,
  AccordionIconWrapper,
  OperationCountBadge,
  GovUKChevron,
  GovUKToggleText,
  
  // Tab components
  StyledTabs,
  StyledTab,
  TabPanel,
  
  // Summary components
  SummaryPanel,
  
  // Operation components
  OperationsGroup,
  OperationItem,
  
  // Message components
  WarningPanel,
  StyledFooterNote,
} from './styles/style';

// Import Material-UI components (minimal usage)
import Box from '@mui/material/Box';

// Import Material-UI icons (reduced usage)
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

// Import RepairCalculator component
import RepairCalculator from './RepairTimes/RateCalc';

// Import API client
import repairTimesApi from './api/RepairTimesApiClient';

// Browser cache configuration
const BROWSER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BROWSER_CACHE_PREFIX = 'repair_times_';
const STORAGE_VERSION = 'v1'; // Use this to invalidate all caches if data structure changes

// Browser storage utility functions
const browserCache = {
  saveToCache: (key, data) => {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        version: STORAGE_VERSION
      };
      localStorage.setItem(`${BROWSER_CACHE_PREFIX}${key}`, JSON.stringify(cacheEntry));
      return true;
    } catch (error) {
      console.error('Error saving to browser cache:', error);
      // Handle quota exceeded errors
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Try to clear old entries if storage is full
        browserCache.clearOldEntries();
        return false;
      }
      return false;
    }
  },

  getFromCache: (key) => {
    try {
      const cachedItem = localStorage.getItem(`${BROWSER_CACHE_PREFIX}${key}`);
      if (!cachedItem) return null;
      
      const cacheEntry = JSON.parse(cachedItem);
      
      // Check version
      if (cacheEntry.version !== STORAGE_VERSION) {
        localStorage.removeItem(`${BROWSER_CACHE_PREFIX}${key}`);
        return null;
      }
      
      // Check if expired
      if (Date.now() - cacheEntry.timestamp > BROWSER_CACHE_TTL) {
        localStorage.removeItem(`${BROWSER_CACHE_PREFIX}${key}`);
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.error('Error retrieving from browser cache:', error);
      return null;
    }
  },

  clearCache: (key) => {
    localStorage.removeItem(`${BROWSER_CACHE_PREFIX}${key}`);
  },
  
  clearAllCache: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith(BROWSER_CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  },
  
  clearOldEntries: () => {
    const cacheKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(BROWSER_CACHE_PREFIX));
    
    if (cacheKeys.length === 0) return;
    
    // Get all cache entries with timestamps
    const cacheEntries = cacheKeys
      .map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          return { key, timestamp: item.timestamp };
        } catch (e) {
          return { key, timestamp: 0 };
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Sort oldest first
    
    // Remove oldest 20% of entries
    const entriesToRemove = Math.max(1, Math.floor(cacheEntries.length * 0.2));
    cacheEntries.slice(0, entriesToRemove).forEach(entry => {
      localStorage.removeItem(entry.key);
    });
  }
};

// Utility functions
const formatValue = (value) => {
  if (!value) return '';
  return value.replace(/([a-z\)])([A-Z])/g, '$1 $2');
};

const parseRepairOperations = (text) => {
  if (!text) return [text];
  
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
  
  if (!operationPrefixes.some(prefix => text.includes(` - ${prefix}`))) {
    return [text];
  }
  
  let operations = [];
  let currentOp = "";
  let remainingText = text;
  
  for (const prefix of operationPrefixes) {
    if (text.startsWith(prefix)) {
      currentOp = prefix;
      remainingText = text.substring(prefix.length);
      break;
    }
  }
  
  if (!currentOp) {
    return [text];
  }
  
  const parts = remainingText.split(/ - (?=(?:Remove and |Check and |Strip and |Renew|Drain and |Bleed|Disconnect|Partially remove|Remove and Replace))/);
  
  operations.push(`${currentOp}${parts[0]}`);
  
  for (let i = 1; i < parts.length; i++) {
    for (const prefix of operationPrefixes) {
      if (parts[i].startsWith(prefix)) {
        operations.push(parts[i]);
        break;
      }
    }
  }
  
  return operations;
};

const extractYearRangeFromModelType = (modelType) => {
  if (!modelType) return { startYear: null, endYear: null };
  
  const yearPatterns = [
    /\((\d{2})-(\d{2})\)/,
    /\((\d{4})-(\d{4})\)/,
    /\((\d{4})[\-\+](\d{4})\)/,
    /(\d{4})-(\d{4})/,
    /\((\d{4})\+\)/,
    /(\d{4})\+/,
  ];
  
  for (const pattern of yearPatterns) {
    const match = pattern.exec(modelType);
    if (match) {
      let startYear = match[1];
      
      if (startYear.length === 2) {
        startYear = parseInt(`20${startYear}`, 10);
      } else {
        startYear = parseInt(startYear, 10);
      }
      
      let endYear = null;
      if (match[2]) {
        endYear = match[2];
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

const extractVehicleYear = (vehicleData) => {
  if (!vehicleData) return null;
  
  if (vehicleData.year && typeof vehicleData.year === 'number') {
    return vehicleData.year;
  }
  
  const dateFields = [
    'manufactureDate', 
    'yearOfManufacture', 
    'registrationDate',
    'firstRegisteredDate',
    'firstRegistrationDate'
  ];
  
  for (const field of dateFields) {
    if (vehicleData[field]) {
      if (typeof vehicleData[field] === 'string') {
        const yearMatch = /(\d{4})/.exec(vehicleData[field]);
        if (yearMatch) {
          return parseInt(yearMatch[1], 10);
        }
      }
      
      if (typeof vehicleData[field] === 'number' && 
          vehicleData[field] > 1900 && 
          vehicleData[field] < 2100) {
        return vehicleData[field];
      }
    }
  }
  
  return null;
};

const getMostComplexSystem = (data) => {
  if (!data) return 'Engine';
  
  const systemCounts = {};
  
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

// SpecTable component - using InsightTable as base
const SpecTable = memo(({ items }) => {
  if (!items || items.length === 0) return null;
  
  const processedItems = [];
  
  items.forEach((item, index) => {
    const operations = parseRepairOperations(item.label);
    
    if (!operations || operations.length === 0) return;
    
    if (operations.length === 1) {
      processedItems.push({
        id: `item-${index}`,
        operations: [operations[0]],
        value: item.value,
        unit: item.unit,
        isMultiOperation: false
      });
    } else {
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
    <InsightTable>
      <tbody>
        {processedItems.map((item) => {
          if (!item.isMultiOperation) {
            return (
              <tr key={item.id}>
                <th scope="row">{item.operations[0]}</th>
                <td>
                  <ValueHighlight>{formatValue(item.value)}</ValueHighlight>
                  {item.unit && <span> {item.unit}</span>}
                </td>
              </tr>
            );
          } else {
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
                  <ValueHighlight>{formatValue(item.value)}</ValueHighlight>
                  {item.unit && <span> {item.unit}</span>}
                </td>
              </tr>
            );
          }
        })}
      </tbody>
    </InsightTable>
  );
});

// Accordion component - simplified styling
const Accordion = memo(({ title, children, expanded, onChange, id }) => {
  const itemCount = useMemo(() => {
    try {
      const specTable = React.Children.toArray(children)
        .find(child => child && child.type === SpecTable);
      
      if (specTable && specTable.props && specTable.props.items) {
        return specTable.props.items.length || '0';
      }
      
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
        <AccordionIconWrapper>
          <GovUKChevron 
            expanded={expanded}
            viewBox="0 0 24 24"
          >
            <path d={expanded ? "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" : "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"} />
          </GovUKChevron>
          <GovUKToggleText>
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

// Tab Panel component
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

// Tab props function
function a11yProps(index) {
  return {
    id: `specs-tab-${index}`,
    'aria-controls': `specs-tabpanel-${index}`,
  };
}

/**
 * MatchWarning Component - Following pattern from bulletins component
 */
const MatchWarning = ({ matchConfidence, vehicleIdentification, vehicleData }) => {
  if (matchConfidence !== 'fuzzy' || !vehicleIdentification?.matchedTo) return null;
  
  const matchedYearInfo = vehicleIdentification.matchedTo.yearRange 
    ? ` (${vehicleIdentification.matchedTo.yearRange.startYear}-${
        vehicleIdentification.matchedTo.yearRange.endYear === 'present' 
          ? 'present' 
          : vehicleIdentification.matchedTo.yearRange.endYear
      })`
    : '';
  
  const year = extractVehicleYear(vehicleData);
  const requestedYear = year ? ` (${year})` : '';
  
  return (
    <WarningPanel>
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
};

/**
 * Loading State Component - Following pattern from bulletins component
 */
const LoadingState = ({ vehicleMake, vehicleModel }) => (
  <GovUKContainer>
    <EnhancedLoadingContainer>
      <GovUKLoadingSpinner />
      <InsightBody>Loading repair times data...</InsightBody>
      <GovUKBodyS style={{ color: COLORS.DARK_GREY }}>
        Please wait while we compile repair times for {vehicleMake} {vehicleModel}
      </GovUKBodyS>
    </EnhancedLoadingContainer>
  </GovUKContainer>
);

/**
 * Error State Component - Following pattern from bulletins component
 */
const ErrorState = ({ error, onRetry }) => (
  <GovUKContainer>
    <EmptyStateContainer>
      <InsightBody>
        <ValueHighlight color={COLORS.RED}>Error Loading Repair Times:</ValueHighlight> {error}
      </InsightBody>
      <GovUKButton onClick={onRetry}>
        Try again
      </GovUKButton>
    </EmptyStateContainer>
  </GovUKContainer>
);

/**
 * Empty State Component - Following pattern from bulletins component
 */
const EmptyState = ({ vehicleMake, vehicleModel }) => (
  <GovUKContainer>
    <EmptyStateContainer>
      <InsightBody>
        No repair times data available for {vehicleMake} {vehicleModel}
      </InsightBody>
      <GovUKBodyS style={{ color: COLORS.DARK_GREY }}>
        This could be because the vehicle is too new, too old, or a rare model.
      </GovUKBodyS>
    </EmptyStateContainer>
  </GovUKContainer>
);

// Main component - restructured for better alignment with bulletins component
const VehicleRepairTimesComponent = ({ registration, vehicleData, onDataLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairData, setRepairData] = useState(null);
  const [matchConfidence, setMatchConfidence] = useState('none');
  const [tabValue, setTabValue] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const abortControllerRef = useRef(null);

  // Function to check browser cache
  const checkBrowserCache = useCallback(() => {
    if (!vehicleData || !vehicleData.make || !vehicleData.model) return null;
    
    const vehicleYear = extractVehicleYear(vehicleData);
    const cacheKey = `${vehicleData.make}_${vehicleData.model}_${vehicleYear || ''}`.toLowerCase().replace(/\s+/g, '_');
    const cachedData = browserCache.getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('Found in browser cache:', cacheKey);
      return cachedData;
    }
    
    return null;
  }, [vehicleData]);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
    setExpandedSections({});
  }, []);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Handle retry when error occurs
  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => window.location.reload(), 500);
  }, []);

  useEffect(() => {
    if (!vehicleData || !vehicleData.make || !vehicleData.model) return;
    
    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    const fetchRepairTimes = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const make = vehicleData.make;
        const model = vehicleData.model || vehicleData.vehicleModel;
  
        if (!make || !model) {
          throw new Error("Vehicle make and model required");
        }
        
        // Check browser cache first
        const cachedData = checkBrowserCache();
        if (cachedData) {
          setRepairData(cachedData);
          setMatchConfidence(cachedData._matchConfidence || (cachedData.vehicleIdentification?.matchedTo ? 'fuzzy' : 'exact'));
          setLoading(false);
          
          // Still call onDataLoad with cached data
          if (onDataLoad && typeof onDataLoad === 'function') {
            onDataLoad(cachedData);
          }
          
          return;
        }
        
        const data = await repairTimesApi.lookupRepairTimes(vehicleData, { signal });
        
        // Store in browser cache
        const vehicleYear = extractVehicleYear(vehicleData);
        const cacheKey = `${make}_${model}_${vehicleYear || ''}`.toLowerCase().replace(/\s+/g, '_');
        browserCache.saveToCache(cacheKey, data);
        
        setRepairData(data);
        setMatchConfidence(data._matchConfidence || (data.vehicleIdentification?.matchedTo ? 'fuzzy' : 'exact'));
        
        if (onDataLoad && typeof onDataLoad === 'function') {
          onDataLoad(data);
        }
      } catch (err) {
        // Don't handle aborted requests as errors
        if (err.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        
        console.error("Error fetching repair times:", err);
        setError(err.message || "Failed to load repair times");
        setMatchConfidence('none');
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };
  
    fetchRepairTimes();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    
  }, [vehicleData?.make, vehicleData?.model, onDataLoad, checkBrowserCache]);

  const getYearRangeDisplay = useCallback(() => {
    if (!repairData || !repairData.vehicleIdentification) return '';
    
    const { vehicleIdentification } = repairData;
    
    if (vehicleIdentification.matchedTo?.yearRange) {
      const { startYear, endYear } = vehicleIdentification.matchedTo.yearRange;
      return ` (${startYear}-${endYear === 'present' ? 'present' : endYear})`;
    }
    
    const modelType = vehicleIdentification.modelType || '';
    const { startYear, endYear } = extractYearRangeFromModelType(modelType);
    
    if (startYear) {
      return ` (${startYear}${endYear ? `-${endYear}` : '+'})`;
    }
    
    const year = vehicleData ? extractVehicleYear(vehicleData) : null;
    if (year) {
      return ` (${year})`;
    }
    
    return '';
  }, [repairData, vehicleData]);

  const vehicleSummary = useMemo(() => {
    if (!repairData) return null;
    
    const totalOperations = Object.values(repairData).reduce((count, section) => {
      if (typeof section !== 'object' || section === null) return count;
      
      return count + Object.values(section).reduce((subCount, subSection) => {
        if (subSection && subSection.details && Array.isArray(subSection.details)) {
          return subCount + subSection.details.length;
        }
        return subCount;
      }, 0);
    }, 0);
    
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

  // Loading state
  if (loading) {
    return <LoadingState vehicleMake={vehicleData?.make} vehicleModel={vehicleData?.model} />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // No data state
  if (!repairData) {
    return <EmptyState vehicleMake={vehicleData?.make} vehicleModel={vehicleData?.model} />;
  }

  const { vehicleIdentification } = repairData;
  const displayMake = vehicleIdentification.make;
  const displayModel = vehicleIdentification.model;
  const yearRangeDisplay = getYearRangeDisplay();
  const lastUpdated = "March 2025";

  return (
    <GovUKContainer>
      <InsightsContainer>
        <InsightPanel>
          <HeadingWithTooltip 
            tooltip="Repair time information based on industry standards"
            iconColor={COLORS.BLUE}
          >
            <GovUKHeadingM>Repair Times for {displayMake} {displayModel}{yearRangeDisplay}</GovUKHeadingM>
          </HeadingWithTooltip>

          <InsightBody>
            These repair times represent the industry standard labor times for common repair operations 
            and can help you estimate repair costs for your {displayMake} {displayModel}.
          </InsightBody>

          {/* Match warning - using shared component */}
          <MatchWarning 
            matchConfidence={matchConfidence} 
            vehicleIdentification={vehicleIdentification}
            vehicleData={vehicleData}
          />

          {/* Important notice - following GOV.UK pattern */}
          <InsightNote>
            <GovUKHeadingS>Important</GovUKHeadingS>
            <GovUKBody>
              These repair times are for reference only. Actual repair time may vary depending on workshop conditions, equipment, and technician experience.
            </GovUKBody>
          </InsightNote>

          {/* Vehicle summary - similar to bulletins pattern */}
          {vehicleSummary && (
            <SummaryPanel>
              <Box>
                <GovUKHeadingS>Repair Overview</GovUKHeadingS>
                <dl>
                  <div>
                    <dt>Total Operations</dt>
                    <dd>
                      <ValueHighlight>
                        {vehicleSummary.totalOperations}
                      </ValueHighlight>
                    </dd>
                  </div>
                  <div>
                    <dt>Average Time</dt>
                    <dd>
                      <ValueHighlight>
                        {vehicleSummary.avgTime}
                      </ValueHighlight> hours
                    </dd>
                  </div>
                  <div>
                    <dt>Most Complex System</dt>
                    <dd>
                      <ValueHighlight>
                        {vehicleSummary.mostComplexSystem}
                      </ValueHighlight>
                    </dd>
                  </div>
                </dl>
              </Box>
            </SummaryPanel>
          )}

          <RepairCalculator />

          {/* Tabs - simplified with no icons */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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

          {/* Tab content */}
          <MainLayout>
            <ContentArea>
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
            </ContentArea>
          </MainLayout>

          {/* Footer note - following GOV.UK pattern */}
          <StyledFooterNote>
            Repair times sourced from industry standard databases. Last updated: {lastUpdated}
          </StyledFooterNote>
        </InsightPanel>
      </InsightsContainer>
    </GovUKContainer>
  );
};

export default memo(VehicleRepairTimesComponent);