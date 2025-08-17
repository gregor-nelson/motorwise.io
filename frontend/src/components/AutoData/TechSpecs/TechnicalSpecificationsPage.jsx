import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { styled } from '@mui/material/styles';

// Import API client
import techSpecsApi from '../api/TechSpecsApiClient';

// Import shared components
import {
  SharedContainer,
  SharedPanel,
  SharedHeader,
  SharedTitle,
  SharedSubtitle,
  SharedTabs,
  SharedTabContent,
  SharedAccordion,
  SharedSearchAndFilters,
  SharedLoadingState,
  SharedErrorState,
  SharedEmptyState,
  SharedMatchWarning,
  SharedNoticePanel,
  SharedButton
} from '../shared/CommonElements';

// Import custom tooltip components
import { HeadingWithTooltip } from '../../../styles/tooltip';

// Keep existing styled components for spec-specific UI
import {
  SpecGrid,
  SpecCard,
  SpecCardHeader,
  SpecCardTitle,
  SpecCardIcon,
  SpecValue,
  SpecUnit,
  SpecSubtext,
  StatusBadge,
  ProgressLabel,
  StatusContainer,
  FuelTypeBadge
} from './TechnicalSpecificationsStyles';

// Browser cache configuration
const BROWSER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BROWSER_CACHE_PREFIX = 'tech_specs_';
const STORAGE_VERSION = 'v1';
const MAX_CACHE_SIZE = 1000000; // ~1MB max size for cache entries

// Gauge components (keeping existing gauge implementation)
const GaugeContainer = styled('div')(() => ({
  position: 'relative',
  width: '120px',
  height: '120px',
  margin: '0 auto var(--space-md)'
}));

const GaugeSvg = styled('svg')(() => ({
  transform: 'rotate(-90deg)'
}));

const GaugeTrack = styled('circle')(() => ({
  fill: 'none',
  stroke: 'var(--gray-300)',
  strokeWidth: '10'
}));

const GaugeFill = styled('circle')(({ color }) => ({
  fill: 'none',
  stroke: color || 'var(--primary)',
  strokeWidth: '10',
  strokeLinecap: 'square',
  transition: 'var(--transition)'
}));

const GaugeCenterText = styled('div')(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center'
}));

const ProgressBar = styled('div')(() => ({
  width: '100%',
  height: '20px',
  backgroundColor: 'var(--gray-100)',
  position: 'relative'
}));

const ProgressFill = styled('div')(({ color, width }) => ({
  height: '100%',
  width: `${width}%`,
  backgroundColor: color || 'var(--primary)',
  transition: 'var(--transition)',
  position: 'relative'
}));

const ProgressContainer = styled('div')(() => ({
  marginTop: 'var(--space-md)'
}));

// Helper functions (keeping existing implementations)
const getSpecIcon = (type) => {
  const icons = {
    pressure: 'P',
    temperature: 'T',
    volume: 'V',
    torque: 'τ',
    electrical: 'E',
    time: 't',
    distance: 'D',
    speed: 'S',
    default: '•'
  };
  return icons[type] || icons.default;
};

const getSpecColor = (type) => {
  const colors = {
    pressure: 'var(--primary)',
    temperature: 'var(--negative)',
    volume: 'var(--positive)',
    torque: 'var(--warning)',
    electrical: 'var(--warning)',
    time: 'var(--primary)',
    distance: 'var(--primary)',
    speed: 'var(--primary)',
    default: 'var(--gray-600)'
  };
  return colors[type] || colors.default;
};

const getCategoryIcon = (category) => {
  const icons = {
    'Engine Details': 'E',
    'Service Information': 'S',
    'Torque Specifications': 'T',
    'Brakes & A/C': 'B',
    'Vehicle Identification': 'V',
    'Injection System': 'I',
    'Tuning & Emissions': 'TE',
    'Spark Plugs': 'SP',
    'Fuel System': 'F',
    'Starting & Charging': 'SC',
    'Lubricants & Capacities': 'L',
    'Service Checks & Adjustments': 'SA',
    'Cylinder Head Instructions': 'CH',
    'Engine Tightening Torques': 'ET',
    'Chassis Tightening Torques': 'CT',
    'Brake Disc & Drum Dimensions': 'BD',
    'Air Conditioning': 'AC'
  };
  return icons[category] || '?';
};

const getCategoryColor = (category) => {
  const colors = {
    'Engine Details': 'var(--primary)',
    'Service Information': 'var(--positive)',
    'Torque Specifications': 'var(--warning)',
    'Brakes & A/C': 'var(--warning)'
  };
  return colors[category] || 'var(--gray-600)';
};

// Gauge component
const Gauge = ({ value, max, unit, label, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div>
      <GaugeContainer>
        <GaugeSvg viewBox="0 0 100 100">
          <GaugeTrack cx="50" cy="50" r="45" />
          <GaugeFill
            cx="50"
            cy="50"
            r="45"
            color={color}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </GaugeSvg>
        <GaugeCenterText>
          <SpecValue size="medium">{value}</SpecValue>
          <SpecSubtext>{unit}</SpecSubtext>
        </GaugeCenterText>
      </GaugeContainer>
      <SpecCardTitle>{label}</SpecCardTitle>
    </div>
  );
};

// Visual spec renderer (keeping existing implementation)
const renderVisualSpecs = (items, sectionTitle) => {
  if (!items || !Array.isArray(items) || items.length === 0) return null;
  
  return (
    <SpecGrid>
      {items.map((item, index) => {
        const label = item.label || item.name || '';
        let value = item.value !== undefined ? item.value : '';
        const unit = item.unit || '';
        
        const specType = getSpecType(label, unit);
        const color = getSpecColor(specType);
        const icon = getSpecIcon(specType);
        
        const numericValue = parseFloat(value);
        const hasNumericValue = !isNaN(numericValue);
        
        let variant = 'default';
        if (hasNumericValue && (unit.includes('bar') || unit.includes('psi'))) {
          variant = 'gauge';
        } else if (hasNumericValue && items.length > 6) {
          variant = 'compact';
        }
        
        if (typeof value === 'string' && value.includes('Not adjustable')) {
          const parts = value.split(/(Not adjustable)/i);
          value = parts[0].trim();
        }
        
        if (variant === 'gauge' && hasNumericValue) {
          const maxValue = unit.includes('bar') ? 10 : 150;
          return (
            <SpecCard key={index} variant="gauge">
              <Gauge
                value={numericValue}
                max={maxValue}
                unit={unit}
                label={label}
                color={color}
              />
            </SpecCard>
          );
        }
        
        if (hasNumericValue && (unit === '%' || label.toLowerCase().includes('range'))) {
          return (
            <SpecCard key={index} variant="bar">
              <SpecCardHeader>
                <SpecCardTitle>{label}</SpecCardTitle>
                <SpecCardIcon color={color}>{icon}</SpecCardIcon>
              </SpecCardHeader>
              <ProgressContainer>
                <ProgressLabel>
                  <span>{value} {unit}</span>
                  <StatusBadge status={numericValue > 70 ? 'good' : numericValue > 40 ? 'warning' : 'critical'}>
                    {numericValue > 70 ? 'Optimal' : numericValue > 40 ? 'Acceptable' : 'Low'}
                  </StatusBadge>
                </ProgressLabel>
                <ProgressBar>
                  <ProgressFill color={color} width={numericValue} />
                </ProgressBar>
              </ProgressContainer>
            </SpecCard>
          );
        }
        
        return (
          <SpecCard key={index}>
            <SpecCardHeader>
              <SpecCardTitle>{label}</SpecCardTitle>
              <SpecCardIcon color={color}>{icon}</SpecCardIcon>
            </SpecCardHeader>
            <SpecValue size={variant === 'compact' ? 'medium' : 'large'}>
              {value}
              {unit && <SpecUnit>{unit}</SpecUnit>}
            </SpecValue>
            {sectionTitle === 'Lubricants & Capacities' && (
              <StatusContainer>
                <StatusBadge status="good">Recommended</StatusBadge>
              </StatusContainer>
            )}
          </SpecCard>
        );
      })}
    </SpecGrid>
  );
};

// Helper function for determining spec type
const getSpecType = (label, unit) => {
  const labelLower = (label || '').toLowerCase();
  const unitLower = (unit || '').toLowerCase();
  
  if (unitLower.includes('bar') || unitLower.includes('psi') || labelLower.includes('pressure')) return 'pressure';
  if (unitLower.includes('°c') || unitLower.includes('temp') || labelLower.includes('temperature')) return 'temperature';
  if (unitLower.includes('litre') || unitLower.includes('ml') || labelLower.includes('capacity')) return 'volume';
  if (unitLower.includes('nm') || labelLower.includes('torque')) return 'torque';
  if (unitLower.includes('v') || unitLower.includes('amp') || labelLower.includes('volt')) return 'electrical';
  if (unitLower.includes('min') || unitLower.includes('sec') || labelLower.includes('time')) return 'time';
  if (unitLower.includes('mm') || unitLower.includes('inch') || labelLower.includes('dimension')) return 'distance';
  if (unitLower.includes('rpm') || labelLower.includes('speed')) return 'speed';
  return 'default';
};

// Browser storage utility functions (keeping existing)
const browserCache = {
  isAvailable: () => {
    try {
      const testKey = `${BROWSER_CACHE_PREFIX}test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
  
  saveToCache: (key, data) => {
    if (!browserCache.isAvailable()) return false;
    
    try {
      const cacheKey = `${BROWSER_CACHE_PREFIX}${key.toLowerCase().replace(/\s+/g, '_')}`;
      
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        version: STORAGE_VERSION
      };
      
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
      const cacheKey = `${BROWSER_CACHE_PREFIX}${key.toLowerCase().replace(/\s+/g, '_')}`;
      const cachedItem = localStorage.getItem(cacheKey);
      
      if (!cachedItem) return null;
      
      const cacheEntry = JSON.parse(cachedItem);
      
      if (!cacheEntry || !cacheEntry.data || !cacheEntry.timestamp || 
          cacheEntry.version !== STORAGE_VERSION ||
          Date.now() - cacheEntry.timestamp > BROWSER_CACHE_TTL) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.error('Error retrieving from browser cache:', error.name, error.message);
      return null;
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

// Extract year function
const extractVehicleYear = (vehicleData) => {
  if (!vehicleData || typeof vehicleData !== 'object') return null;
  
  if (vehicleData.year && 
      typeof vehicleData.year === 'number' && 
      vehicleData.year > 1900 && 
      vehicleData.year < new Date().getFullYear() + 5) {
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
          const year = parseInt(yearMatch[1], 10);
          if (year > 1900 && year < new Date().getFullYear() + 5) {
            return year;
          }
        }
      }
      
      if (typeof vehicleData[field] === 'number' && 
          vehicleData[field] > 1900 && 
          vehicleData[field] < new Date().getFullYear() + 5) {
        return vehicleData[field];
      }
    }
  }
  
  return null;
};

// Determine fuel type function
const determineFuelType = (vehicleData) => {
  if (!vehicleData || typeof vehicleData !== 'object') return null;
  
  if (vehicleData.fuelType && typeof vehicleData.fuelType === 'string') {
    const normalizedFuelType = vehicleData.fuelType.toLowerCase().trim();
    
    if (['gasoline', 'unleaded', 'gas', 'petrol'].includes(normalizedFuelType)) {
      return 'petrol';
    } else if (['gasoil', 'derv', 'diesel'].includes(normalizedFuelType)) {
      return 'diesel';
    } else if (['hybrid', 'phev'].includes(normalizedFuelType)) {
      return 'hybrid';
    } else if (['electric', 'ev', 'bev'].includes(normalizedFuelType)) {
      return 'electric';
    }
    
    if (normalizedFuelType.length > 0) {
      return normalizedFuelType;
    }
  }
  
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
  
  return null;
};

// Helper render for notes
const renderNotes = (notes) => {
  if (!notes || !Array.isArray(notes) || notes.length === 0) return null;
  
  return (
    <SharedNoticePanel>
      <h3>Important notes</h3>
      <ul style={{ margin: 0, paddingLeft: 'var(--space-lg)' }}>
        {notes.map((note, index) => (
          <li key={`note-${index}`} style={{ marginBottom: 'var(--space-sm)' }}>
            {note || ''}
          </li>
        ))}
      </ul>
    </SharedNoticePanel>
  );
};

const TechnicalSpecificationsPage = ({ vehicleData = null, loading: initialLoading = false, error: initialError = null, onDataLoad }) => {
  // States
  const [tabValue, setTabValue] = useState(0);
  const [techSpecsData, setTechSpecsData] = useState(null);
  const [loading, setLoading] = useState(initialLoading || true);
  const [error, setError] = useState(initialError);
  const [matchConfidence, setMatchConfidence] = useState('none');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  
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

  // Handle tab change
  const handleTabChange = useCallback((newTabIndex) => {
    setTabValue(newTabIndex);
  }, []);

  // Handle accordion toggle
  const handleAccordionToggle = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Handle search
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Data fetching effect
  useEffect(() => {
    if (!vehicleData?.make || !vehicleData?.model) {
      setLoading(false);
      return;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New request started');
    }
    
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
        
        const cachedData = cacheKey ? browserCache.getFromCache(cacheKey) : null;
        if (cachedData) {
          if (currentRequestId !== requestIdRef.current) return;
          
          console.log('Found in browser cache:', cacheKey);
          setTechSpecsData(cachedData);
          setMatchConfidence(cachedData._matchConfidence || 
                          (cachedData.vehicleIdentification?.matchedTo ? 'fuzzy' : 'exact'));
          
          if (onDataLoad && typeof onDataLoad === 'function') {
            onDataLoad(cachedData);
          }
          
          setLoading(false);
          return;
        }
        
        console.log(`Fetching tech specs for ${make} ${model} (Year: ${vehicleYear}, Fuel: ${vehicleFuelType})`);
        
        const data = await techSpecsApi.lookupTechSpecs({
          make,
          model,
          year: vehicleYear,
          fuelType: vehicleFuelType
        }, { signal });
        
        if (currentRequestId !== requestIdRef.current) return;
        
        if (!data) {
          throw new Error("No data returned from API");
        }
        
        if (cacheKey && data.vehicleIdentification) {
          browserCache.saveToCache(cacheKey, data);
        }
        
        setTechSpecsData(data);
        setMatchConfidence(data._matchConfidence || 
                         (data.vehicleIdentification?.matchedTo ? 'fuzzy' : 'exact'));
        
        if (onDataLoad && typeof onDataLoad === 'function') {
          onDataLoad(data);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Request was aborted:', err.message);
          return;
        }
        
        if (currentRequestId !== requestIdRef.current) return;
        
        console.error("Error fetching technical specifications:", err);
        setError(err.message || "Failed to load technical specifications");
        setMatchConfidence('none');
        setTechSpecsData(null);
      } finally {
        if (currentRequestId === requestIdRef.current && !signal.aborted) {
          setLoading(false);
        }
      }
    };
  
    fetchTechSpecs();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted');
      }
    };
    
  }, [vehicleData?.make, vehicleData?.model, vehicleYear, vehicleFuelType, onDataLoad, cacheKey]);

  // Visual tabs configuration (keeping existing implementation)
  const tabs = useMemo(() => {
    if (!techSpecsData) return [];
    
    const tabsConfig = [];
    
    // Engine Details Tab
    const engineSections = [];
    
    const engineDetails = safeGet(techSpecsData, 'vehicleIdentification.engineDetails', []);
    if (Array.isArray(engineDetails) && engineDetails.length > 0) {
      engineSections.push({
        title: "Vehicle Identification",
        icon: getCategoryIcon("Vehicle Identification"),
        content: renderVisualSpecs(engineDetails, "Vehicle Identification"),
        priority: 'high'
      });
    }
    
    const injectionSpecs = safeGet(techSpecsData, 'injectionSystem.specifications', []) || 
                          safeGet(techSpecsData, 'injectionSystem.details', []);
    
    if (Array.isArray(injectionSpecs) && injectionSpecs.length > 0) {
      engineSections.push({
        title: "Injection System",
        icon: getCategoryIcon("Injection System"),
        content: renderVisualSpecs(injectionSpecs, "Injection System"),
        priority: 'medium'
      });
    }
    
    const tuningSpecs = safeGet(techSpecsData, 'tuningEmissions.specifications', []) || 
                       safeGet(techSpecsData, 'tuningEmissions.details', []);
    
    if (Array.isArray(tuningSpecs) && tuningSpecs.length > 0) {
      engineSections.push({
        title: "Tuning & Emissions",
        icon: getCategoryIcon("Tuning & Emissions"),
        content: renderVisualSpecs(tuningSpecs, "Tuning & Emissions")
      });
    }
    
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
          icon: getCategoryIcon(section.title),
          content: renderVisualSpecs(specs, section.title),
          priority: section.path === 'startingCharging' ? 'medium' : 'low'
        });
      }
    });
    
    if (engineSections.length > 0) {
      tabsConfig.push({
        label: "Engine Details",
        icon: getCategoryIcon("Engine Details"),
        color: getCategoryColor("Engine Details"),
        sections: engineSections
      });
    }
    
    // Service Information Tab
    const serviceSections = [];
    
    const serviceChecksSpecs = safeGet(techSpecsData, 'serviceChecks.specifications', []) || 
                             safeGet(techSpecsData, 'serviceChecks.details', []);
    
    if (Array.isArray(serviceChecksSpecs) && serviceChecksSpecs.length > 0) {
      serviceSections.push({
        title: "Service Checks & Adjustments",
        icon: getCategoryIcon("Service Checks & Adjustments"),
        content: renderVisualSpecs(serviceChecksSpecs, "Service Checks & Adjustments"),
        priority: 'high'
      });
    }
    
    const engineOilOptions = safeGet(techSpecsData, 'lubricantsCapacities.engine_oil_options.specifications', []) || 
                           safeGet(techSpecsData, 'lubricantsCapacities.engine_oil_options.details', []);
    
    const lubricantSpecs = safeGet(techSpecsData, 'lubricantsCapacities.specifications', []) || 
                         safeGet(techSpecsData, 'lubricantsCapacities.details', []);
    
    const hasEngineOilOptions = Array.isArray(engineOilOptions) && engineOilOptions.length > 0;
    const hasLubricantSpecs = Array.isArray(lubricantSpecs) && lubricantSpecs.length > 0;
    
    if (hasEngineOilOptions || hasLubricantSpecs) {
      serviceSections.push({
        title: "Lubricants & Capacities",
        icon: getCategoryIcon("Lubricants & Capacities"),
        priority: 'high',
        content: (
          <>
            {hasEngineOilOptions && (
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h4 style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: '600', 
                  color: 'var(--gray-900)', 
                  margin: '0 0 var(--space-md) 0' 
                }}>
                  Engine Oil Options
                </h4>
                {renderVisualSpecs(engineOilOptions, "Lubricants & Capacities")}
              </div>
            )}
            
            {hasLubricantSpecs && (
              <div>
                {hasEngineOilOptions && (
                  <div style={{ 
                    height: '3px', 
                    backgroundColor: 'var(--gray-200)', 
                    margin: 'var(--space-xl) 0' 
                  }} />
                )}
                <h4 style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: '600', 
                  color: 'var(--gray-900)', 
                  margin: '0 0 var(--space-md) 0' 
                }}>
                  Other Lubricants & Capacities
                </h4>
                {renderVisualSpecs(lubricantSpecs, "Lubricants & Capacities")}
              </div>
            )}
          </>
        )
      });
    }
    
    if (serviceSections.length > 0) {
      tabsConfig.push({
        label: "Service Information",
        icon: getCategoryIcon("Service Information"),
        color: getCategoryColor("Service Information"),
        sections: serviceSections
      });
    }
    
    // Torque Specifications Tab
    const torqueSections = [];
    
    if (techSpecsData.tighteningTorques) {
      const { tighteningTorques } = techSpecsData;
      
      const headInstructions = safeGet(tighteningTorques, 'cylinder_head_instructions', []);
      const headTorques = safeGet(tighteningTorques, 'cylinder_head_torques', []);
      
      if (Array.isArray(headInstructions) && headInstructions.length > 0) {
        const hasTorqueSequence = Array.isArray(headTorques) && headTorques.length > 0;
        
        torqueSections.push({
          title: "Cylinder Head Instructions",
          icon: getCategoryIcon("Cylinder Head Instructions"),
          content: (
            <>
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                {headInstructions.map((instruction, index) => (
                  <p key={`instr-${index}`} style={{ 
                    fontSize: 'var(--text-base)', 
                    color: 'var(--gray-700)', 
                    marginBottom: 'var(--space-md)' 
                  }}>
                    {instruction}
                  </p>
                ))}
              </div>
              
              {hasTorqueSequence && (
                <SpecCard>
                  <h4 style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: '600', 
                    color: 'var(--gray-900)', 
                    margin: '0 0 var(--space-md) 0' 
                  }}>
                    Tightening sequence
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: 'var(--space-lg)' }}>
                    {headTorques.map((step, index) => (
                      <li key={`step-${index}`} style={{ marginBottom: 'var(--space-sm)' }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </SpecCard>
              )}
            </>
          )
        });
      }
      
      const engineTorques = safeGet(tighteningTorques, 'engine_torques', []);
      if (Array.isArray(engineTorques) && engineTorques.length > 0) {
        torqueSections.push({
          title: "Engine Tightening Torques",
          icon: getCategoryIcon("Engine Tightening Torques"),
          content: (
            <>
              {renderVisualSpecs(engineTorques, "Engine Tightening Torques")}
              {tighteningTorques.engine_notes && renderNotes(tighteningTorques.engine_notes)}
            </>
          )
        });
      }
      
      const chassisTorques = safeGet(tighteningTorques, 'chassis_tightening_torques', []);
      if (Array.isArray(chassisTorques) && chassisTorques.length > 0) {
        torqueSections.push({
          title: "Chassis Tightening Torques",
          icon: getCategoryIcon("Chassis Tightening Torques"),
          content: (
            <>
              {renderVisualSpecs(chassisTorques, "Chassis Tightening Torques")}
              {tighteningTorques.chassis_notes && renderNotes(tighteningTorques.chassis_notes)}
            </>
          )
        });
      }
    }
    
    if (torqueSections.length > 0) {
      tabsConfig.push({
        label: "Torque Specifications",
        icon: getCategoryIcon("Torque Specifications"),
        color: getCategoryColor("Torque Specifications"),
        sections: torqueSections
      });
    }
    
    // Brakes & A/C Tab
    const otherSections = [];
    
    const brakeSpecs = safeGet(techSpecsData, 'brakeDimensions.specifications', []) || 
                      safeGet(techSpecsData, 'brakeDimensions.details', []);
    
    if (Array.isArray(brakeSpecs) && brakeSpecs.length > 0) {
      otherSections.push({
        title: "Brake Disc & Drum Dimensions",
        icon: getCategoryIcon("Brake Disc & Drum Dimensions"),
        content: renderVisualSpecs(brakeSpecs, "Brake Disc & Drum Dimensions")
      });
    }
    
    const acSpecs = safeGet(techSpecsData, 'airConditioning.specifications', []) || 
                   safeGet(techSpecsData, 'airConditioning.details', []);
    
    if (Array.isArray(acSpecs) && acSpecs.length > 0) {
      otherSections.push({
        title: "Air Conditioning",
        icon: getCategoryIcon("Air Conditioning"),
        content: renderVisualSpecs(acSpecs, "Air Conditioning")
      });
    }
    
    if (otherSections.length > 0) {
      tabsConfig.push({
        label: "Brakes & A/C",
        icon: getCategoryIcon("Brakes & A/C"),
        color: getCategoryColor("Brakes & A/C"),
        sections: otherSections
      });
    }
    
    return tabsConfig.filter(tab => tab.sections.length > 0);
  }, [techSpecsData]);

  // Helper function to count specs in content for accordion display
  const getSpecCount = useCallback((content) => {
    if (!content) return 0;
    // Try to count items in SpecGrid or similar structures
    if (typeof content === 'object' && content.props) {
      if (content.props.items && Array.isArray(content.props.items)) {
        return content.props.items.length;
      }
    }
    return 0;
  }, []);

  // Filter specs based on search term
  const filteredSpecsCount = useMemo(() => {
    if (!searchTerm || !tabs[tabValue]) return null;
    // This would need to be implemented based on the specific structure
    // For now, return null to hide the count
    return null;
  }, [searchTerm, tabs, tabValue]);

  // Loading state
  if (loading) {
    return (
      <SharedLoadingState
        title="Loading vehicle specifications"
        subtitle="We are retrieving the technical information for your vehicle"
        vehicleMake={vehicleData?.make}
        vehicleModel={vehicleData?.model}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <SharedErrorState
        error={error}
        onRetry={handleRetry}
        title="Cannot retrieve technical specifications"
      />
    );
  }

  // No data state
  if (!techSpecsData) {
    return (
      <SharedEmptyState
        title="Technical specifications not available"
        subtitle="We do not have technical specifications for this vehicle. This may be because the vehicle is a recent model, a classic vehicle, or a specialist variant."
      />
    );
  }

  // Extract display info
  const { vehicleIdentification } = techSpecsData;
  const displayMake = vehicleIdentification?.make || vehicleData?.make || 'Unknown';
  const displayModel = vehicleIdentification?.model || vehicleData?.model || 'Model';
  
  const displayFuelType = vehicleIdentification?.matchedTo?.fuelType || 
                         vehicleIdentification?.fuelType || 
                         vehicleFuelType;

  const hasTabs = tabs && tabs.length > 0;
  const lastUpdated = "March 2025";

  return (
    <SharedContainer>
      <SharedPanel>
        <SharedHeader>
          <HeadingWithTooltip 
            tooltip="Technical specifications for your vehicle, based on manufacturer data"
          >
            <SharedTitle>Technical Specifications for {displayMake} {displayModel}</SharedTitle>
          </HeadingWithTooltip>
          <SharedSubtitle>
            These specifications provide detailed technical information for servicing and maintaining your vehicle.
          </SharedSubtitle>
        </SharedHeader>

        <SharedMatchWarning
          matchConfidence={matchConfidence}
          metadata={techSpecsData?.vehicleIdentification}
          vehicleMake={displayMake}
          vehicleModel={displayModel}
          requestedYear={vehicleYear}
          requestedFuelType={vehicleFuelType}
        />

        <SharedNoticePanel>
          <h3>Important</h3>
          <p>
            These specifications are for reference only. Always consult the manufacturer's documentation for definitive technical information.
          </p>
        </SharedNoticePanel>

        {displayFuelType && displayFuelType !== 'unknown' && (
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <FuelTypeBadge>
              {displayFuelType.charAt(0).toUpperCase() + displayFuelType.slice(1)} Engine
            </FuelTypeBadge>
          </div>
        )}

        {hasTabs ? (
          <>
            <SharedSearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              placeholder="Search specifications..."
              onClearFilters={handleClearFilters}
              resultCount={filteredSpecsCount}
            />

            <SharedTabs
              tabs={tabs}
              activeTab={tabValue}
              onTabChange={handleTabChange}
            >
              {tabs.map((tab, tabIndex) => (
                <SharedTabContent key={`content-${tabIndex}`} active={tabValue === tabIndex}>
                  <div style={{
                    marginBottom: 'var(--space-xl)',
                    paddingBottom: 'var(--space-lg)',
                    borderBottom: `2px solid ${tab.color || 'var(--primary)'}`
                  }}>
                    <h3 style={{ 
                      fontSize: 'var(--text-xl)', 
                      fontWeight: '600', 
                      color: 'var(--gray-900)', 
                      margin: '0 0 var(--space-sm) 0' 
                    }}>
                      {tab.label}
                    </h3>
                    <p style={{ 
                      fontSize: 'var(--text-base)', 
                      color: 'var(--gray-600)', 
                      margin: 0 
                    }}>
                      Technical specifications and measurements for {tab.label.toLowerCase()}
                    </p>
                  </div>
                  
                  {tab.sections.map((section, sectionIndex) => {
                    const sectionId = `${tabIndex}-${sectionIndex}`;
                    const isExpanded = expandedSections[sectionId] ?? (section.priority === 'high' || sectionIndex === 0);
                    const itemCount = getSpecCount(section.content);
                    
                    return (
                      <SharedAccordion
                        key={sectionId}
                        id={sectionId}
                        title={section.title}
                        itemCount={itemCount}
                        expanded={isExpanded}
                        onToggle={handleAccordionToggle}
                      >
                        {section.content}
                      </SharedAccordion>
                    );
                  })}
                </SharedTabContent>
              ))}
            </SharedTabs>
          </>
        ) : (
          <SharedNoticePanel>
            <p>
              Limited specifications available for this vehicle. Try checking the manufacturer's website for more details.
            </p>
          </SharedNoticePanel>
        )}

        <div style={{ 
          marginTop: 'var(--space-2xl)', 
          paddingTop: 'var(--space-lg)', 
          borderTop: '1px solid var(--gray-200)', 
          fontSize: 'var(--text-sm)', 
          color: 'var(--gray-500)', 
          textAlign: 'center' 
        }}>
          Technical specifications sourced from industry standard databases.<br />
          Last updated: {lastUpdated}
        </div>
      </SharedPanel>
    </SharedContainer>
  );
};

export default React.memo(TechnicalSpecificationsPage);