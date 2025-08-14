import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { styled } from '@mui/material/styles';

// Import API client
import techSpecsApi from './api/TechSpecsApiClient';

// Import custom tooltip components
import {
  HeadingWithTooltip,
} from '../../styles/tooltip';

// Import minimal clean styled components
import {
  TechSpecsContainer,
  SectionHeader,
  SectionDivider,
  InsightPanel,
  InsightBody,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorHeader,
  ErrorMessage,
  EmptyStateContainer,
  MinimalTabs,
  MinimalTab,
  TabPanel,
  SpecGrid,
  SpecCategoryHeader,
  CategoryIcon,
  CategoryTitle,
  CategorySubtitle,
  SpecCard,
  SpecCardHeader,
  SpecCardTitle,
  SpecCardIcon,
  SpecValue,
  SpecUnit,
  SpecSubtext,
  StatusBadge,
  WarningPanel,
  WarningTitle,
  WarningText,
  NoticePanel,
  FuelTypeBadge,
  FooterNote,
  GovUKHeadingS,
  GovUKBody,
  ProgressLabel,
  StatusContainer,
  SectionSpacing,
  ErrorSpan,
  RetryButton,
  FlexContainer,
  ConditionalPanel,
  MarginContainer,
  CollapsibleSectionContainer,
  CollapsibleHeader,
  CollapsibleHeaderContent,
  CollapsibleChevron,
  CollapsibleContent,
  CollapsibleContentInner,
  TabContentContainer
} from './styles/TechnicalSpecificationsStyles';

// Browser cache configuration
const BROWSER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BROWSER_CACHE_PREFIX = 'tech_specs_';
const STORAGE_VERSION = 'v1'; // Use this to invalidate all caches if data structure changes
const MAX_CACHE_SIZE = 1000000; // ~1MB max size for cache entries

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

// Visual divider
const VisualDivider = styled('div')(() => ({
  height: '3px',
  backgroundColor: 'var(--gray-200)',
  margin: '40px 0'
}));


// Helper functions
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
          <GaugeTrack
            cx="50"
            cy="50"
            r="45"
          />
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

// Visual spec renderer
const renderVisualSpecs = (items, sectionTitle) => {
  if (!items || !Array.isArray(items) || items.length === 0) return null;
  
  return (
    <SpecGrid>
      {items.map((item, index) => {
        const label = item.label || item.name || '';
        let value = item.value !== undefined ? item.value : '';
        const unit = item.unit || '';
        
        // Determine spec type
        const specType = getSpecType(label, unit);
        const color = getSpecColor(specType);
        const icon = getSpecIcon(specType);
        
        // Parse numeric values
        const numericValue = parseFloat(value);
        const hasNumericValue = !isNaN(numericValue);
        
        // Determine card variant
        let variant = 'default';
        if (hasNumericValue && (unit.includes('bar') || unit.includes('psi'))) {
          variant = 'gauge';
        } else if (hasNumericValue && items.length > 6) {
          variant = 'compact';
        }
        
        // Handle special cases
        if (typeof value === 'string' && value.includes('Not adjustable')) {
          const parts = value.split(/(Not adjustable)/i);
          value = parts[0].trim();
        }
        
        // Render gauge for pressure values
        if (variant === 'gauge' && hasNumericValue) {
          const maxValue = unit.includes('bar') ? 10 : 150; // Approximate max values
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
        
        // Render progress bar for percentage or range values
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
        
        // Default card layout
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

// Browser storage utility functions (keep existing)
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


// NoticePanel and FuelTypeBadge are imported from styles file

// Using TabPanel from styles with simple show/hide logic

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
    <NoticePanel>
      <GovUKHeadingS>Important notes</GovUKHeadingS>
      <ul className="govuk-list govuk-list--bullet">
        {notes.map((note, index) => (
          <li key={`note-${index}`}>{note || ''}</li>
        ))}
      </ul>
    </NoticePanel>
  );
};

// Collapsible Section Component (minimal design following DVLADataHeader patterns)
const CollapsibleSection = ({ title, icon, children, defaultExpanded = false, priority = 'medium' }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <CollapsibleSectionContainer>
      <CollapsibleHeader onClick={toggleExpanded} aria-expanded={isExpanded}>
        <CollapsibleHeaderContent>
          <CategoryIcon>{icon}</CategoryIcon>
          <div>
            <CategoryTitle>{title}</CategoryTitle>
            <CategorySubtitle>
              {priority === 'high' ? 'Essential information' : 
               priority === 'low' ? 'Reference data' : 
               'Technical specifications and measurements'}
            </CategorySubtitle>
          </div>
        </CollapsibleHeaderContent>
        <CollapsibleChevron expanded={isExpanded}>
          ▼
        </CollapsibleChevron>
      </CollapsibleHeader>
      
      <CollapsibleContent expanded={isExpanded}>
        <CollapsibleContentInner>
          {children}
        </CollapsibleContentInner>
      </CollapsibleContent>
    </CollapsibleSectionContainer>
  );
};

const TechnicalSpecificationsPage = ({ vehicleData = null, loading: initialLoading = false, error: initialError = null, onDataLoad }) => {
  // States
  const [tabValue, setTabValue] = useState(0);
  const [techSpecsData, setTechSpecsData] = useState(null);
  const [loading, setLoading] = useState(initialLoading || true);
  const [error, setError] = useState(initialError);
  const [matchConfidence, setMatchConfidence] = useState('none');
  // Note: expandedSections state can be added later for advanced accordion management
  // const [expandedSections, setExpandedSections] = useState(new Set());
  
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

  // Note: handleTabChange removed as we use direct onClick for minimal tabs
  // const handleTabChange = useCallback((event, newValue) => {
  //   setTabValue(newValue);
  // }, []);

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

  // Match warning component
  const MatchWarning = useMemo(() => {
    if (!techSpecsData?.vehicleIdentification || !vehicleData) return null;
    
    const { vehicleIdentification } = techSpecsData;
    
    if (matchConfidence === 'fuzzy' && vehicleIdentification?.matchedTo) {
      const matchedYearInfo = vehicleIdentification.matchedTo.yearRange 
        ? ` (${vehicleIdentification.matchedTo.yearRange.startYear}-${
            vehicleIdentification.matchedTo.yearRange.endYear === 'present' 
              ? 'present' 
              : vehicleIdentification.matchedTo.yearRange.endYear
          })`
        : '';
      
      const matchedFuelType = vehicleIdentification.matchedTo.fuelType && 
                             vehicleIdentification.matchedTo.fuelType !== 'unknown'
        ? ` - ${vehicleIdentification.matchedTo.fuelType.charAt(0).toUpperCase() + 
             vehicleIdentification.matchedTo.fuelType.slice(1)} Engine`
        : '';
      
      const year = extractVehicleYear(vehicleData);
      const requestedYear = year ? ` (${year})` : '';
      
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

  // Visual tabs configuration
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
              <SectionSpacing>
                <GovUKHeadingS>
                  Engine Oil Options
                </GovUKHeadingS>
                {renderVisualSpecs(engineOilOptions, "Lubricants & Capacities")}
              </SectionSpacing>
            )}
            
            {hasLubricantSpecs && (
              <>
                {hasEngineOilOptions && <VisualDivider />}
                <SectionSpacing>
                  <GovUKHeadingS>
                    Other Lubricants & Capacities
                  </GovUKHeadingS>
                  {renderVisualSpecs(lubricantSpecs, "Lubricants & Capacities")}
                </SectionSpacing>
              </>
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
              <SectionSpacing>
                <InsightBody>
                  {headInstructions.map((instruction, index) => (
                    <p key={`instr-${index}`}>{instruction}</p>
                  ))}
                </InsightBody>
              </SectionSpacing>
              
              {hasTorqueSequence && (
                <SpecCard>
                  <GovUKHeadingS>Tightening sequence</GovUKHeadingS>
                  <ol className="govuk-list govuk-list--number">
                    {headTorques.map((step, index) => (
                      <li key={`step-${index}`}>{step}</li>
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

  // Loading state
  if (loading) {
    return (
      <TechSpecsContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading vehicle specifications</LoadingText>
          <FooterNote>
            We are retrieving the technical information for your {vehicleData?.make || ''} {vehicleData?.model || ''}
          </FooterNote>
        </LoadingContainer>
      </TechSpecsContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <TechSpecsContainer>
        <ErrorContainer>
          <ErrorHeader>
            <ErrorSpan>There is a problem</ErrorSpan>
          </ErrorHeader>
          <SectionSpacing>
            <ErrorMessage>
              We cannot retrieve the technical specifications at the moment. {error}
            </ErrorMessage>
          </SectionSpacing>
          <RetryButton onClick={() => window.location.reload()}>
            Try again
          </RetryButton>
        </ErrorContainer>
      </TechSpecsContainer>
    );
  }

  // No data state
  if (!techSpecsData) {
    return (
      <TechSpecsContainer>
        <ErrorContainer>
          <ErrorHeader>
            Technical specifications not available
          </ErrorHeader>
          <ErrorMessage>
            We do not have technical specifications for this vehicle.
          </ErrorMessage>
          <FooterNote>
            This may be because the vehicle is a recent model, a classic vehicle, or a specialist variant.
          </FooterNote>
        </ErrorContainer>
      </TechSpecsContainer>
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
    <TechSpecsContainer>
      <SectionHeader>
        <HeadingWithTooltip 
          tooltip="Technical specifications for your vehicle, based on manufacturer data"
        >
          <h2>Technical Specifications for {displayMake} {displayModel}</h2>
        </HeadingWithTooltip>
        
        <InsightBody>
          These specifications provide detailed technical information for servicing and maintaining your vehicle.
        </InsightBody>
      </SectionHeader>
          
      {MatchWarning}
          
      <WarningPanel>
        <WarningTitle>Important</WarningTitle>
        <WarningText>
          These specifications are for reference only. Always consult the manufacturer's documentation for definitive technical information.
        </WarningText>
      </WarningPanel>
          
      {displayFuelType && displayFuelType !== 'unknown' && (
        <FlexContainer className="justify-start">
          <FuelTypeBadge>
            {displayFuelType.charAt(0).toUpperCase() + displayFuelType.slice(1)} Engine
          </FuelTypeBadge>
        </FlexContainer>
      )}
      
      <SectionDivider />
        
      {hasTabs ? (
        <TabContentContainer>
          <MinimalTabs>
            <FlexContainer className="tabs">
              {tabs.map((tab, index) => (
                <MinimalTab
                  key={`tab-${index}`}
                  className={tabValue === index ? 'active' : ''}
                  onClick={() => setTabValue(index)}
                >
                  {tab.label}
                </MinimalTab>
                ))}
            </FlexContainer>
          </MinimalTabs>
          
          {tabs.map((tab, tabIndex) => (
            <TabPanel key={`panel-${tabIndex}`} style={{ display: tabValue === tabIndex ? 'block' : 'none' }}>
                  {tab.sections.map((section, sectionIndex) => {
                    const isLastSection = sectionIndex === tab.sections.length - 1;
                    const sectionKey = `${tabIndex}-${sectionIndex}`;
                    const defaultExpanded = section.priority === 'high' || sectionIndex === 0;
                    
                    return (
                      <div key={`section-${sectionKey}`}>
                        <CollapsibleSection
                          title={section.title}
                          icon={section.icon}
                          defaultExpanded={defaultExpanded}
                          priority={section.priority || 'medium'}
                        >
                          {section.content}
                        </CollapsibleSection>
                        {!isLastSection && <SectionDivider />}
                      </div>
                    );
                  })}
            </TabPanel>
          ))}
        </TabContentContainer>
      ) : (
            <MarginContainer>
              <NoticePanel>
                <InsightBody>
                  Limited specifications available for this vehicle. Try checking the manufacturer's website for more details.
                </InsightBody>
              </NoticePanel>
            </MarginContainer>
          )}
          
          <NoticePanel>
            <FooterNote>
              Technical specifications sourced from industry standard databases.
              <br />
              Last updated: {lastUpdated}
            </FooterNote>
          </NoticePanel>
    </TechSpecsContainer>
  );
};

export default React.memo(TechnicalSpecificationsPage);