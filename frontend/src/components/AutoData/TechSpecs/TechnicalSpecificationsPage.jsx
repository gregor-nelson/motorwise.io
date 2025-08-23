import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// Import API client
import techSpecsApi from '../api/TechSpecsApiClient';

// Import custom tooltip components
import { HeadingWithTooltip } from '../../../styles/tooltip';

// Browser cache configuration
const BROWSER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BROWSER_CACHE_PREFIX = 'tech_specs_';
const STORAGE_VERSION = 'v1';
const MAX_CACHE_SIZE = 1000000; // ~1MB max size for cache entries


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
    pressure: 'rgb(37 99 235)',
    temperature: 'rgb(239 68 68)',
    volume: 'rgb(34 197 94)',
    torque: 'rgb(245 158 11)',
    electrical: 'rgb(245 158 11)',
    time: 'rgb(37 99 235)',
    distance: 'rgb(37 99 235)',
    speed: 'rgb(37 99 235)',
    default: 'rgb(75 85 99)'
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
    'Engine Details': 'rgb(37 99 235)',
    'Service Information': 'rgb(34 197 94)',
    'Torque Specifications': 'rgb(245 158 11)',
    'Brakes & A/C': 'rgb(245 158 11)'
  };
  return colors[category] || 'rgb(75 85 99)';
};

// Gauge component
const Gauge = ({ value, max, unit, label, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="transform -rotate-90" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="rgb(209 213 219)" 
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color || 'rgb(37 99 235)'}
            strokeWidth="10"
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-lg font-bold text-neutral-900">{value}</div>
          <div className="text-xs text-neutral-600">{unit}</div>
        </div>
      </div>
      <div className="text-sm font-medium text-neutral-900">{label}</div>
    </div>
  );
};

// Visual spec renderer
const renderVisualSpecs = (items, sectionTitle) => {
  if (!items || !Array.isArray(items) || items.length === 0) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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
            <div key={index} className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <Gauge
                value={numericValue}
                max={maxValue}
                unit={unit}
                label={label}
                color={color}
              />
            </div>
          );
        }
        
        if (hasNumericValue && (unit === '%' || label.toLowerCase().includes('range'))) {
          const statusColor = numericValue > 70 ? 'text-green-600' : numericValue > 40 ? 'text-yellow-600' : 'text-red-600';
          const statusText = numericValue > 70 ? 'Optimal' : numericValue > 40 ? 'Acceptable' : 'Low';
          
          return (
            <div key={index} className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="text-sm font-medium text-neutral-900">{label}</div>
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: color || 'rgb(37 99 235)' }}
                >
                  {icon}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{value} {unit}</span>
                  <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${numericValue}%`,
                      backgroundColor: color || 'rgb(37 99 235)'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div key={index} className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm font-medium text-neutral-900">{label}</div>
              <div 
                className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: color || 'rgb(37 99 235)' }}
              >
                {icon}
              </div>
            </div>
            <div className={`font-bold text-neutral-900 mb-1 ${variant === 'compact' ? 'text-lg' : 'text-2xl'}`}>
              {value}
              {unit && <span className="text-base font-normal text-neutral-600 ml-1">{unit}</span>}
            </div>
            {sectionTitle === 'Lubricants & Capacities' && (
              <div className="mt-4">
                <span className="text-sm font-medium text-green-600">Recommended</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
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
    <div className="bg-blue-50 rounded-lg p-4 shadow-sm mb-6">
      <h3 className="text-lg font-medium text-neutral-900 mb-4">Important notes</h3>
      <ul className="pl-6 m-0">
        {notes.map((note, index) => (
          <li key={`note-${index}`} className="text-xs text-neutral-700 mb-2">
            {note || ''}
          </li>
        ))}
      </ul>
    </div>
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
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">
                  Engine Oil Options
                </h4>
                {renderVisualSpecs(engineOilOptions, "Lubricants & Capacities")}
              </div>
            )}
            
            {hasLubricantSpecs && (
              <div>
                {hasEngineOilOptions && (
                  <div className="h-1 bg-neutral-200 my-8" />
                )}
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">
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
              <div className="mb-8">
                {headInstructions.map((instruction, index) => (
                  <p key={`instr-${index}`} className="text-sm text-neutral-700 mb-4">
                    {instruction}
                  </p>
                ))}
              </div>
              
              {hasTorqueSequence && (
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-neutral-900 mb-4">
                    Tightening sequence
                  </h4>
                  <ol className="list-decimal pl-6 m-0">
                    {headTorques.map((step, index) => (
                      <li key={`step-${index}`} className="text-xs text-neutral-700 mb-2">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
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
    // Try to count items in grid or similar structures
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
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center min-h-48 gap-4">
            <div className="w-6 h-6 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <div className="text-lg font-medium text-neutral-900 mb-2">Loading vehicle specifications</div>
              <div className="text-sm text-neutral-600">We are retrieving the technical information for {vehicleData?.make} {vehicleData?.model}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <div className="text-center py-8">
            <div className="text-lg font-medium text-neutral-900 mb-2 flex items-center justify-center gap-2">
              <i className="ph ph-warning text-red-600"></i>
              Cannot retrieve technical specifications
            </div>
            <div className="text-base text-red-600 mb-4">{error}</div>
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!techSpecsData) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center min-h-48 gap-4 text-center">
            <i className="ph ph-database text-4xl text-neutral-400"></i>
            <div>
              <div className="text-lg font-medium text-neutral-900 mb-2">Technical specifications not available</div>
              <div className="text-sm text-neutral-600">We do not have technical specifications for this vehicle. This may be because the vehicle is a recent model, a classic vehicle, or a specialist variant.</div>
            </div>
          </div>
        </div>
      </div>
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
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
        <div className="mb-8">
          <HeadingWithTooltip 
            tooltip="Technical specifications for your vehicle, based on manufacturer data"
          >
            <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
              Technical Specifications for {displayMake} {displayModel}
            </h1>
          </HeadingWithTooltip>
          <p className="text-sm text-neutral-600">
            These specifications provide detailed technical information for servicing and maintaining your vehicle.
          </p>
        </div>

        {matchConfidence !== 'exact' && (
          <div className="bg-yellow-50 rounded-lg p-4 shadow-sm mb-6">
            <div className="flex items-start gap-3">
              <i className="ph ph-warning text-yellow-600 text-lg mt-0.5"></i>
              <div>
                <div className="text-sm font-medium text-neutral-900 mb-1">Vehicle Match Information</div>
                <div className="text-xs text-neutral-700">
                  {matchConfidence === 'fuzzy' ? 
                    'These specifications are based on a similar vehicle variant. Please verify compatibility.' :
                    'Unable to find exact specifications for this vehicle configuration.'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4 shadow-sm mb-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Important</h3>
          <p className="text-xs text-neutral-700">
            These specifications are for reference only. Always consult the manufacturer's documentation for definitive technical information.
          </p>
        </div>

        {displayFuelType && displayFuelType !== 'unknown' && (
          <div className="mb-8">
            <span className="inline-block bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-full">
              {displayFuelType.charAt(0).toUpperCase() + displayFuelType.slice(1)} Engine
            </span>
          </div>
        )}

        {hasTabs ? (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search specifications..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border-none focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-neutral-100 rounded-lg p-1">
                {tabs.map((tab, tabIndex) => (
                  <button
                    key={tabIndex}
                    onClick={() => handleTabChange(tabIndex)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                      ${tabValue === tabIndex
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                      }
                    `}
                  >
                    <i className="ph ph-database text-lg"></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {tabs.map((tab, tabIndex) => (
              <div key={`content-${tabIndex}`} className={tabValue === tabIndex ? 'block' : 'hidden'}>
                <div className="mb-8 pb-4 border-b-2" style={{ borderColor: tab.color || 'rgb(37 99 235)' }}>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">{tab.label}</h3>
                  <p className="text-sm text-neutral-600">
                    Technical specifications and measurements for {tab.label.toLowerCase()}
                  </p>
                </div>
                
                {tab.sections.map((section, sectionIndex) => {
                  const sectionId = `${tabIndex}-${sectionIndex}`;
                  const isExpanded = expandedSections[sectionId] ?? (section.priority === 'high' || sectionIndex === 0);
                  
                  return (
                    <div key={sectionId} className="mb-8">
                      <button
                        onClick={() => handleAccordionToggle(sectionId)}
                        className="w-full flex items-center justify-between bg-neutral-50 rounded-lg p-4 text-left hover:bg-neutral-100 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center text-sm font-bold">
                            {section.icon || '•'}
                          </div>
                          <span className="text-lg font-medium text-neutral-900">{section.title}</span>
                        </div>
                        <i className={`ph ph-caret-down transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}></i>
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-4">
                          {section.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        ) : (
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
            <p className="text-xs text-neutral-700">
              Limited specifications available for this vehicle. Try checking the manufacturer's website for more details.
            </p>
          </div>
        )}

        <div className="mt-16 pt-4 border-t border-neutral-200 text-xs text-neutral-500 text-center">
          Technical specifications sourced from industry standard databases.<br />
          Last updated: {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TechnicalSpecificationsPage);