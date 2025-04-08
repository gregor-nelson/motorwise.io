import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  GovUKContainer,
  GovUKMainWrapper,
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKBodyS,
  GovUKLoadingSpinner,
  PremiumInfoPanel,
  BREAKPOINTS,
  COLORS
} from '../../styles/theme';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Import API client
import techSpecsApi from './api/TechSpecsApiClient';

// Import custom tooltip components
import {
  HeadingWithTooltip,
} from '../../styles/tooltip';

// Import styled components from VehicleAnalysisComponent
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

// Browser cache configuration
const BROWSER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BROWSER_CACHE_PREFIX = 'tech_specs_';
const STORAGE_VERSION = 'v1'; // Use this to invalidate all caches if data structure changes
const MAX_CACHE_SIZE = 1000000; // ~1MB max size for cache entries

// Improved browser storage utility functions
const browserCache = {
  isAvailable: () => {
    try {
      const testKey = `${BROWSER_CACHE_PREFIX}test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  saveToCache: (key, data) => {
    if (!browserCache.isAvailable()) return false;
    
    try {
      // Standardize key format
      const cacheKey = `${BROWSER_CACHE_PREFIX}${key.toLowerCase().replace(/\s+/g, '_')}`;
      
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        version: STORAGE_VERSION
      };
      
      // Rough estimation of data size
      const serialized = JSON.stringify(cacheEntry);
      if (serialized.length > MAX_CACHE_SIZE) {
        console.warn(`Cache entry too large (${Math.round(serialized.length/1024)}KB), not caching`);
        return false;
      }
      
      localStorage.setItem(cacheKey, serialized);
      return true;
    } catch (error) {
      console.error('Error saving to browser cache:', error.name, error.message);
      return false;
    }
  },

  getFromCache: (key) => {
    if (!browserCache.isAvailable()) return null;
    
    try {
      // Standardize key format
      const cacheKey = `${BROWSER_CACHE_PREFIX}${key.toLowerCase().replace(/\s+/g, '_')}`;
      const cachedItem = localStorage.getItem(cacheKey);
      
      if (!cachedItem) return null;
      
      const cacheEntry = JSON.parse(cachedItem);
      
      // Simple validation
      if (!cacheEntry || !cacheEntry.data || !cacheEntry.timestamp || 
          cacheEntry.version !== STORAGE_VERSION ||
          Date.now() - cacheEntry.timestamp > BROWSER_CACHE_TTL) {
        // Invalid or expired entry
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.error('Error retrieving from browser cache:', error.name, error.message);
      return null;
    }
  },

  clearCache: (key) => {
    if (!browserCache.isAvailable()) return false;
    
    try {
      const cacheKey = `${BROWSER_CACHE_PREFIX}${key.toLowerCase().replace(/\s+/g, '_')}`;
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      console.error('Error clearing cache entry:', error);
      return false;
    }
  }
};

// Helper function for safe property access
const safeGet = (obj, path, defaultValue = null) => {
  if (!obj) return defaultValue;
  
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
};

// Specification table styling - fixed CSS with no problematic selectors
const SpecificationTable = styled(InsightTable)(({ theme }) => ({
  marginBottom: '20px',
  width: '100%',
  
  '& th': {
    width: '40%',
    fontWeight: 700,
    padding: '10px 20px 10px 0',
    textAlign: 'left',
    borderBottom: `1px solid ${COLORS.MID_GREY}`
  },
  
  '& td': {
    width: '60%',
    padding: '10px 20px 10px 0',
    borderBottom: `1px solid ${COLORS.MID_GREY}`,
    '& .unit': {
      paddingLeft: '5px',
      color: COLORS.DARK_GREY
    }
  },
  
  '& tr:last-child': {
    '& th, & td': {
      borderBottom: 'none'
    }
  }
}));

// Styled Tab Panel component
const TabPanel = styled(Box)(({ theme }) => ({
  padding: '30px 0',
}));

// Styled Tabs - GOV.UK style
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

// Styled Tab - GOV.UK style with no icon
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

// Section Header - aligned with other components, using no icons
const SectionHeader = styled(Box)(({ theme }) => ({
  marginBottom: '20px',
  borderBottom: `2px solid ${COLORS.BLUE}`,
  paddingBottom: '10px',
}));

// Section Container - removed problematic selectors
const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: '40px',
}));

// Warning panel - aligned with BulletinsComponent
const WarningPanel = styled(InsightNote)(() => ({
  backgroundColor: '#fff4f4',
  borderColor: COLORS.RED,
  marginBottom: '20px',
  padding: '15px',
  borderLeftWidth: '10px'
}));

// Important notice panel
const NoticePanel = styled(InsightNote)(() => ({
  backgroundColor: COLORS.LIGHT_GREY,
  borderColor: COLORS.BLUE,
  marginBottom: '20px',
  padding: '15px',
  borderLeftWidth: '10px'
}));

// Fuel type badge - revised to be more GOV.UK style
const FuelTypeBadge = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  backgroundColor: COLORS.BLUE,
  color: COLORS.WHITE,
  padding: '5px 10px',
  fontWeight: 600,
  marginTop: '10px',
  marginBottom: '15px'
}));

// Technical specs panel - aligned with other components
const TechSpecsPanel = styled(InsightPanel)(() => ({
  borderLeftColor: COLORS.BLUE
}));

// Improved year extraction with better validation
const extractVehicleYear = (vehicleData) => {
  if (!vehicleData || typeof vehicleData !== 'object') return null;
  
  // First check if we already have a valid year field
  if (vehicleData.year && 
      typeof vehicleData.year === 'number' && 
      vehicleData.year > 1900 && 
      vehicleData.year < new Date().getFullYear() + 5) {
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
          const year = parseInt(yearMatch[1], 10);
          if (year > 1900 && year < new Date().getFullYear() + 5) {
            return year;
          }
        }
      }
      
      // If it's a number in a reasonable year range
      if (typeof vehicleData[field] === 'number' && 
          vehicleData[field] > 1900 && 
          vehicleData[field] < new Date().getFullYear() + 5) {
        return vehicleData[field];
      }
    }
  }
  
  return null;
};

// Improved fuel type determination with better validation
const determineFuelType = (vehicleData) => {
  if (!vehicleData || typeof vehicleData !== 'object') return null;
  
  // First check for explicit fuel type
  if (vehicleData.fuelType && typeof vehicleData.fuelType === 'string') {
    const normalizedFuelType = vehicleData.fuelType.toLowerCase().trim();
    
    // Map common variations
    if (['gasoline', 'unleaded', 'gas', 'petrol'].includes(normalizedFuelType)) {
      return 'petrol';
    } else if (['gasoil', 'derv', 'diesel'].includes(normalizedFuelType)) {
      return 'diesel';
    } else if (['hybrid', 'phev'].includes(normalizedFuelType)) {
      return 'hybrid';
    } else if (['electric', 'ev', 'bev'].includes(normalizedFuelType)) {
      return 'electric';
    }
    
    // Return as-is if it's another valid type
    if (normalizedFuelType.length > 0) {
      return normalizedFuelType;
    }
  }
  
  // Check model and variant for fuel type indicators (simplified logic)
  const model = (vehicleData.model || '').toLowerCase();
  const variant = (vehicleData.variant || '').toLowerCase();
  
  if (/tdi|cdi|hdi|dci|crdi|d4d|jtd|tdci/.test(model + variant)) {
    return 'diesel';
  }
  if (/phev|hybrid/.test(model + variant)) {
    return 'hybrid';
  }
  if (/electric|ev|\be-\b/.test(model + variant)) {
    return 'electric';
  }
  if (/petrol|tsi|gti|vti|mpi/.test(variant)) {
    return 'petrol';
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
  
  // Use refs for tracking requests and preventing race conditions
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  
  // Extract year from vehicle data - memoized with improved validation
  const vehicleYear = useMemo(() => {
    return vehicleData ? extractVehicleYear(vehicleData) : null;
  }, [vehicleData]);

  // Extract and normalize fuel type - memoized with improved validation
  const vehicleFuelType = useMemo(() => {
    return vehicleData ? determineFuelType(vehicleData) : null;
  }, [vehicleData]);

  // Generate a consistent cache key - memoized
  const cacheKey = useMemo(() => {
    if (!vehicleData?.make || !vehicleData?.model) return null;
    
    return `${vehicleData.make}_${vehicleData.model}_${vehicleYear || ''}_${vehicleFuelType || ''}`;
  }, [vehicleData?.make, vehicleData?.model, vehicleYear, vehicleFuelType]);

  // Memoized tab change handler
  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  // Render spec table - improved with better unit handling
  const renderSpecTable = useCallback((items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    
    return (
      <SpecificationTable>
        <tbody>
          {items.map((item, index) => {
            // Handle complex values that might include status info
            let valueContent = item.value !== undefined ? item.value : '';
            let statusInfo = '';
            
            // Check if value contains status like "Not adjustable"
            if (typeof valueContent === 'string' && valueContent.includes('Not adjustable')) {
              const parts = valueContent.split(/(Not adjustable)/i);
              valueContent = parts[0].trim();
              statusInfo = parts[1] ? ` (${parts[1]})` : '';
            }
            
            // For percentage values, ensure proper formatting
            if (typeof valueContent === 'string' && valueContent.startsWith('%')) {
              valueContent = valueContent.replace('%', '').trim();
              statusInfo = `% ${statusInfo}`;
            }
            
            return (
              <tr key={index}>
                <th scope="row">
                  {item.label || item.name || ''}
                </th>
                <td>
                  <ValueHighlight>{valueContent}</ValueHighlight>
                  {statusInfo && <span style={{ color: COLORS.DARK_GREY }}>{statusInfo}</span>}
                  {item.unit && <span className="unit">{item.unit}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </SpecificationTable>
    );
  }, []);

  // Helper function to render notes - simplified and memoized
  const renderNotes = useCallback((notes) => {
    if (!notes || !Array.isArray(notes) || notes.length === 0) return null;
    
    return (
      <NoticePanel>
        <GovUKHeadingS>Important notes</GovUKHeadingS>
        <ul className="govuk-list govuk-list--bullet">
          {notes.map((note, index) => (
            <li key={`note-${index}`}>{note || ''}</li>
          ))}
        </ul>
      </NoticePanel>
    );
  }, []);

  // Data fetching effect - simplified with better error handling
  useEffect(() => {
    // Don't do anything if no vehicle data with required fields
    if (!vehicleData?.make || !vehicleData?.model) {
      setLoading(false);
      return;
    }
    
    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New request started');
    }
    
    // Create new abort controller and increment request ID
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    const currentRequestId = ++requestIdRef.current;
    
    const fetchTechSpecs = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const make = vehicleData.make;
        const model = vehicleData.model || vehicleData.vehicleModel;
  
        if (!make || !model) {
          throw new Error("Vehicle make and model required");
        }
        
        // Check browser cache first
        const cachedData = cacheKey ? browserCache.getFromCache(cacheKey) : null;
        if (cachedData) {
          // Ensure this is still the current request
          if (currentRequestId !== requestIdRef.current) return;
          
          console.log('Found in browser cache:', cacheKey);
          setTechSpecsData(cachedData);
          setMatchConfidence(cachedData._matchConfidence || 
                          (cachedData.vehicleIdentification?.matchedTo ? 'fuzzy' : 'exact'));
          
          // Still call onDataLoad with cached data
          if (onDataLoad && typeof onDataLoad === 'function') {
            onDataLoad(cachedData);
          }
          
          setLoading(false);
          return;
        }
        
        console.log(`Fetching tech specs for ${make} ${model} (Year: ${vehicleYear}, Fuel: ${vehicleFuelType})`);
        
        // Fetch data from API
        const data = await techSpecsApi.lookupTechSpecs({
          make,
          model,
          year: vehicleYear,
          fuelType: vehicleFuelType
        }, { signal });
        
        // Ensure this is still the current request
        if (currentRequestId !== requestIdRef.current) return;
        
        // Validate returned data
        if (!data) {
          throw new Error("No data returned from API");
        }
        
        // Store in browser cache if we have a valid response
        if (cacheKey && data.vehicleIdentification) {
          browserCache.saveToCache(cacheKey, data);
        }
        
        setTechSpecsData(data);
        setMatchConfidence(data._matchConfidence || 
                         (data.vehicleIdentification?.matchedTo ? 'fuzzy' : 'exact'));
        
        // Call onDataLoad with the new data
        if (onDataLoad && typeof onDataLoad === 'function') {
          onDataLoad(data);
        }
      } catch (err) {
        // Don't handle aborted requests as errors
        if (err.name === 'AbortError') {
          console.log('Request was aborted:', err.message);
          return;
        }
        
        // Ensure this is still the current request
        if (currentRequestId !== requestIdRef.current) return;
        
        console.error("Error fetching technical specifications:", err);
        setError(err.message || "Failed to load technical specifications");
        setMatchConfidence('none');
        setTechSpecsData(null);
      } finally {
        // Only update if this is still the current request and not aborted
        if (currentRequestId === requestIdRef.current && !signal.aborted) {
          setLoading(false);
        }
      }
    };
  
    fetchTechSpecs();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted');
      }
    };
    
  }, [vehicleData?.make, vehicleData?.model, vehicleYear, vehicleFuelType, onDataLoad, cacheKey]);

  // Improved match warning component - simplified and memoized
  const MatchWarning = useMemo(() => {
    if (!techSpecsData?.vehicleIdentification || !vehicleData) return null;
    
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
          <GovUKHeadingS>Approximate Match</GovUKHeadingS>
          <GovUKBody>
            We don't have exact data for your <strong>{vehicleIdentification.make} {vehicleIdentification.model}{requestedYear}{requestedFuelType}</strong>. 
            The specifications shown are based on <strong>{vehicleIdentification.matchedTo.make} {vehicleIdentification.matchedTo.model}{matchedYearInfo}{matchedFuelType}</strong>, 
            which is the closest match to your vehicle.
          </GovUKBody>
        </WarningPanel>
      );
    } else if (matchConfidence === 'year-match' && vehicleIdentification?.matchedTo) {
      // It's the right year range but not exact model variant
      return (
        <NoticePanel>
          <GovUKHeadingS>Compatible Model Match</GovUKHeadingS>
          <GovUKBody>
            The specifications shown are for <strong>{vehicleIdentification.matchedTo.make} {vehicleIdentification.matchedTo.model} {vehicleIdentification.matchedTo.modelType || ''}</strong>, 
            which is compatible with your specific vehicle variant.
          </GovUKBody>
        </NoticePanel>
      );
    }
    return null;
  }, [techSpecsData, vehicleData, matchConfidence, vehicleFuelType]);

  // Simplified tab configuration with better validation - removed icons
  const tabs = useMemo(() => {
    if (!techSpecsData) return [];
    
    const tabsConfig = [];
    
    // Engine Details Tab
    const engineSections = [];
    
    // Vehicle Identification section
    const engineDetails = safeGet(techSpecsData, 'vehicleIdentification.engineDetails', []);
    if (Array.isArray(engineDetails) && engineDetails.length > 0) {
      engineSections.push({
        title: "Vehicle Identification",
        content: (
          <>
            <InsightBody>
              Key specifications for this <ValueHighlight>{safeGet(techSpecsData, 'vehicleIdentification.make', '')} {safeGet(techSpecsData, 'vehicleIdentification.model', '')}</ValueHighlight> engine.
            </InsightBody>
            {renderSpecTable(engineDetails)}
          </>
        )
      });
    }
    
    // Injection System section
    const injectionSpecs = safeGet(techSpecsData, 'injectionSystem.specifications', []) || 
                          safeGet(techSpecsData, 'injectionSystem.details', []);
    
    if (Array.isArray(injectionSpecs) && injectionSpecs.length > 0) {
      engineSections.push({
        title: "Injection System",
        content: renderSpecTable(injectionSpecs)
      });
    }
    
    // Tuning & Emissions section
    const tuningSpecs = safeGet(techSpecsData, 'tuningEmissions.specifications', []) || 
                       safeGet(techSpecsData, 'tuningEmissions.details', []);
    
    if (Array.isArray(tuningSpecs) && tuningSpecs.length > 0) {
      engineSections.push({
        title: "Tuning & Emissions",
        content: (
          <>
            <InsightBody>
              These specifications are important for emissions testing and engine tuning operations.
            </InsightBody>
            {renderSpecTable(tuningSpecs)}
          </>
        )
      });
    }
    
    // Other engine sections (simplified)
    const engineSectionMap = [
      { path: 'spark_plugs', title: 'Spark Plugs' },
      { path: 'fuel_system', title: 'Fuel System' },
      { path: 'startingCharging', title: 'Starting & Charging' }
    ];
    
    engineSectionMap.forEach(section => {
      const specs = safeGet(techSpecsData, `${section.path}.specifications`, []) || 
                   safeGet(techSpecsData, `${section.path}.details`, []);
      
      if (Array.isArray(specs) && specs.length > 0) {
        engineSections.push({
          title: section.title,
          content: renderSpecTable(specs)
        });
      }
    });
    
    if (engineSections.length > 0) {
      tabsConfig.push({
        label: "Engine Details",
        sections: engineSections
      });
    }
    
    // Service Information Tab
    const serviceSections = [];
    
    // Service Checks section
    const serviceChecksSpecs = safeGet(techSpecsData, 'serviceChecks.specifications', []) || 
                             safeGet(techSpecsData, 'serviceChecks.details', []);
    
    if (Array.isArray(serviceChecksSpecs) && serviceChecksSpecs.length > 0) {
      serviceSections.push({
        title: "Service Checks & Adjustments",
        content: (
          <>
            <InsightBody>
              Reference values for maintenance and diagnostics.
            </InsightBody>
            {renderSpecTable(serviceChecksSpecs)}
          </>
        )
      });
    }
    
    // Lubricants & Capacities section
    const engineOilOptions = safeGet(techSpecsData, 'lubricantsCapacities.engine_oil_options.specifications', []) || 
                           safeGet(techSpecsData, 'lubricantsCapacities.engine_oil_options.details', []);
    
    const lubricantSpecs = safeGet(techSpecsData, 'lubricantsCapacities.specifications', []) || 
                         safeGet(techSpecsData, 'lubricantsCapacities.details', []);
    
    const hasEngineOilOptions = Array.isArray(engineOilOptions) && engineOilOptions.length > 0;
    const hasLubricantSpecs = Array.isArray(lubricantSpecs) && lubricantSpecs.length > 0;
    
    if (hasEngineOilOptions || hasLubricantSpecs) {
      serviceSections.push({
        title: "Lubricants & Capacities",
        content: (
          <>
            {hasEngineOilOptions && (
              <Box mb={4}>
                <GovUKHeadingS>
                  Engine Oil Options
                </GovUKHeadingS>
                {renderSpecTable(engineOilOptions)}
              </Box>
            )}
            
            {hasLubricantSpecs && (
              <Box>
                <GovUKHeadingS>
                  Other Lubricants & Capacities
                </GovUKHeadingS>
                {renderSpecTable(lubricantSpecs)}
              </Box>
            )}
          </>
        )
      });
    }
    
    if (serviceSections.length > 0) {
      tabsConfig.push({
        label: "Service Information",
        sections: serviceSections
      });
    }
    
    // Torque Specifications Tab (simplified)
    const torqueSections = [];
    
    if (techSpecsData.tighteningTorques) {
      const { tighteningTorques } = techSpecsData;
      
      // Cylinder head instructions
      const headInstructions = safeGet(tighteningTorques, 'cylinder_head_instructions', []);
      const headTorques = safeGet(tighteningTorques, 'cylinder_head_torques', []);
      
      if (Array.isArray(headInstructions) && headInstructions.length > 0) {
        const hasTorqueSequence = Array.isArray(headTorques) && headTorques.length > 0;
        
        torqueSections.push({
          title: "Cylinder Head Instructions",
          content: (
            <>
              <InsightBody>
                {headInstructions.map((instruction, index) => (
                  <p key={`instr-${index}`}>{instruction}</p>
                ))}
              </InsightBody>
              
              {hasTorqueSequence && (
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} mb={4}>
                  <Box flex={1}>
                    <GovUKHeadingS>Tightening sequence</GovUKHeadingS>
                    <ol className="govuk-list govuk-list--number">
                      {headTorques.map((step, index) => (
                        <li key={`step-${index}`}>{step}</li>
                      ))}
                    </ol>
                  </Box>
                </Box>
              )}
            </>
          )
        });
      }
      
      // Engine torques
      const engineTorques = safeGet(tighteningTorques, 'engine_torques', []);
      if (Array.isArray(engineTorques) && engineTorques.length > 0) {
        torqueSections.push({
          title: "Engine Tightening Torques",
          content: (
            <>
              {renderSpecTable(engineTorques)}
              {tighteningTorques.engine_notes && renderNotes(tighteningTorques.engine_notes)}
            </>
          )
        });
      }
      
      // Chassis torques
      const chassisTorques = safeGet(tighteningTorques, 'chassis_tightening_torques', []);
      if (Array.isArray(chassisTorques) && chassisTorques.length > 0) {
        torqueSections.push({
          title: "Chassis Tightening Torques",
          content: (
            <>
              {renderSpecTable(chassisTorques)}
              {tighteningTorques.chassis_notes && renderNotes(tighteningTorques.chassis_notes)}
            </>
          )
        });
      }
    }
    
    if (torqueSections.length > 0) {
      tabsConfig.push({
        label: "Torque Specifications",
        sections: torqueSections
      });
    }
    
    // Brakes & A/C Tab (simplified)
    const otherSections = [];
    
    // Brake Dimensions section
    const brakeSpecs = safeGet(techSpecsData, 'brakeDimensions.specifications', []) || 
                      safeGet(techSpecsData, 'brakeDimensions.details', []);
    
    if (Array.isArray(brakeSpecs) && brakeSpecs.length > 0) {
      otherSections.push({
        title: "Brake Disc & Drum Dimensions",
        content: (
          <>
            <InsightBody>
              Reference measurements for brake component service and replacement.
            </InsightBody>
            {renderSpecTable(brakeSpecs)}
          </>
        )
      });
    }
    
    // Air Conditioning section
    const acSpecs = safeGet(techSpecsData, 'airConditioning.specifications', []) || 
                   safeGet(techSpecsData, 'airConditioning.details', []);
    
    if (Array.isArray(acSpecs) && acSpecs.length > 0) {
      otherSections.push({
        title: "Air Conditioning",
        content: renderSpecTable(acSpecs)
      });
    }
    
    if (otherSections.length > 0) {
      tabsConfig.push({
        label: "Brakes & A/C",
        sections: otherSections
      });
    }
    
    return tabsConfig.filter(tab => tab.sections.length > 0);
  }, [techSpecsData, renderSpecTable, renderNotes]);

  // Loading state - aligned with GOV.UK style
  if (loading) {
    return (
      <GovUKContainer>
        <EnhancedLoadingContainer>
          <GovUKLoadingSpinner />
          <InsightBody>Loading vehicle specifications</InsightBody>
          <GovUKBodyS style={{ color: COLORS.DARK_GREY }}>
            We are retrieving the technical information for your {vehicleData?.make || ''} {vehicleData?.model || ''}
          </GovUKBodyS>
        </EnhancedLoadingContainer>
      </GovUKContainer>
    );
  }

  // Error state - aligned with GOV.UK style
  if (error) {
    return (
      <GovUKContainer>
        <EmptyStateContainer>
          <InsightBody>
            <ValueHighlight color={COLORS.RED}>There is a problem</ValueHighlight>
          </InsightBody>
          <GovUKBody style={{ marginBottom: '20px' }}>
            We cannot retrieve the technical specifications at the moment. {error}
          </GovUKBody>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: COLORS.BUTTON_COLOUR || COLORS.GREEN,
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              fontFamily: '"GDS Transport", arial, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </EmptyStateContainer>
      </GovUKContainer>
    );
  }

  // No data state - aligned with GOV.UK style
  if (!techSpecsData) {
    return (
      <GovUKContainer>
        <EmptyStateContainer>
          <InsightBody>
            Technical specifications not available
          </InsightBody>
          <GovUKBody style={{ color: COLORS.BLACK, marginBottom: '10px' }}>
            We do not have technical specifications for this vehicle.
          </GovUKBody>
          <GovUKBodyS style={{ color: COLORS.DARK_GREY }}>
            This may be because the vehicle is a recent model, a classic vehicle, or a specialist variant.
          </GovUKBodyS>
        </EmptyStateContainer>
      </GovUKContainer>
    );
  }

  // Extract display info from vehicle identification with better validation
  const { vehicleIdentification } = techSpecsData;
  const displayMake = vehicleIdentification?.make || vehicleData?.make || 'Unknown';
  const displayModel = vehicleIdentification?.model || vehicleData?.model || 'Model';
  
  // Extract fuel type for display with better validation
  const displayFuelType = vehicleIdentification?.matchedTo?.fuelType || 
                         vehicleIdentification?.fuelType || 
                         vehicleFuelType;

  // Ensure we don't render tabs if there are none
  const hasTabs = tabs && tabs.length > 0;
  
  // Last updated date - hardcoded for now
  const lastUpdated = "March 2025";

  return (
    <GovUKContainer>
      <InsightsContainer>
        <TechSpecsPanel>
          <HeadingWithTooltip 
            tooltip="Technical specifications for your vehicle, based on manufacturer data"
            iconColor={COLORS.BLUE}
          >
            <GovUKHeadingM>Technical Specifications for {displayMake} {displayModel}</GovUKHeadingM>
          </HeadingWithTooltip>
          
          <InsightBody>
            These specifications provide detailed technical information for servicing and maintaining your vehicle.
          </InsightBody>
          
          {/* Match warning - memoized component */}
          {MatchWarning}
          
          {/* Important notice */}
          <WarningPanel>
            <GovUKHeadingS>Important</GovUKHeadingS>
            <GovUKBody>
              These specifications are for reference only. Always consult the manufacturer's documentation for definitive technical information.
            </GovUKBody>
          </WarningPanel>
          
          {/* Display fuel type if available */}
          {displayFuelType && displayFuelType !== 'unknown' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: 2, marginBottom: 2 }}>
              <FuelTypeBadge>
                {displayFuelType.charAt(0).toUpperCase() + displayFuelType.slice(1)} Engine
              </FuelTypeBadge>
            </Box>
          )}
          
          {/* Only render tabs if we have data */}
          {hasTabs ? (
            <>
              {/* Tabs Navigation */}
              <Box>
                <StyledTabs 
                  value={tabValue < tabs.length ? tabValue : 0} // Ensure valid tab
                  onChange={handleTabChange} 
                  aria-label="technical specifications tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {tabs.map((tab, index) => (
                    <StyledTab 
                      key={`tab-${index}`}
                      label={tab.label} 
                      {...a11yProps(index)} 
                    />
                  ))}
                </StyledTabs>
              </Box>
              
              {/* Tab Content */}
              {tabs.map((tab, tabIndex) => (
                <CustomTabPanel key={`panel-${tabIndex}`} value={tabValue} index={tabIndex}>
                  {tab.sections.map((section, sectionIndex) => {
                    const isLastSection = sectionIndex === tab.sections.length - 1;
                    
                    return (
                      <SectionContainer 
                        key={`section-${tabIndex}-${sectionIndex}`}
                        style={isLastSection ? { marginBottom: 0 } : {}}
                      >
                        <SectionHeader>
                          <GovUKHeadingM>{section.title}</GovUKHeadingM>
                        </SectionHeader>
                        {section.content}
                      </SectionContainer>
                    );
                  })}
                </CustomTabPanel>
              ))}
            </>
          ) : (
            <Box my={4}>
              <NoticePanel>
                <GovUKBody>
                  Limited specifications available for this vehicle. Try checking the manufacturer's website for more details.
                </GovUKBody>
              </NoticePanel>
            </Box>
          )}
          
          {/* Footer Note */}
          <NoticePanel>
            <GovUKBodyS>
              Technical specifications sourced from industry standard databases.
              <br />
              Last updated: {lastUpdated}
            </GovUKBodyS>
          </NoticePanel>
        </TechSpecsPanel>
      </InsightsContainer>
    </GovUKContainer>
  );
};

export default React.memo(TechnicalSpecificationsPage);