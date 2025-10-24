import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { animate, stagger } from 'animejs';

// Import API client
import techSpecsApi from '../api/TechSpecsApiClient';

// Import custom tooltip components
import { HeadingWithTooltip } from '../../../styles/tooltip';

// Browser cache configuration
const BROWSER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BROWSER_CACHE_PREFIX = 'tech_specs_';
const STORAGE_VERSION = 'v1';
const MAX_CACHE_SIZE = 1000000; // ~1MB max size for cache entries


// Helper functions with Phosphor icons
const getSpecIcon = (type) => {
  const icons = {
    pressure: 'ph ph-gauge',
    temperature: 'ph ph-thermometer',
    volume: 'ph ph-flask',
    torque: 'ph ph-gear',
    electrical: 'ph ph-lightning',
    time: 'ph ph-clock',
    distance: 'ph ph-ruler',
    speed: 'ph ph-speedometer',
    default: 'ph ph-info'
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
    'Engine Details': 'ph ph-engine',
    'Service Information': 'ph ph-wrench',
    'Torque Specifications': 'ph ph-gear',
    'Brakes & A/C': 'ph ph-disc',
    'Vehicle Identification': 'ph ph-identification-card',
    'Injection System': 'ph ph-syringe',
    'Tuning & Emissions': 'ph ph-plant',
    'Spark Plugs': 'ph ph-lightning',
    'Fuel System': 'ph ph-drop',
    'Starting & Charging': 'ph ph-battery-charging',
    'Lubricants & Capacities': 'ph ph-drop',
    'Service Checks & Adjustments': 'ph ph-check-circle',
    'Cylinder Head Instructions': 'ph ph-list-numbers',
    'Engine Tightening Torques': 'ph ph-wrench',
    'Chassis Tightening Torques': 'ph ph-car',
    'Brake Disc & Drum Dimensions': 'ph ph-disc',
    'Air Conditioning': 'ph ph-snowflake'
  };
  return icons[category] || 'ph ph-question';
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
      <div className="relative w-36 h-36 mx-auto mb-6">
        <svg className="transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgb(229 231 235)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color || 'rgb(37 99 235)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: 'drop-shadow(0 0 4px rgba(37, 99, 235, 0.4))' }}
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-bold text-neutral-900">{value}</div>
          <div className="text-xs text-neutral-600 mt-1">{unit}</div>
        </div>
      </div>
      <div className="text-base font-semibold text-neutral-900 text-center">{label}</div>
    </div>
  );
};

// Visual spec renderer - Clean table format for all specs
const renderVisualSpecs = (items, sectionTitle) => {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* All Specs - Clean Table */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
          {/* Table for desktop/tablet */}
          <div className="hidden sm:block">
            <table className="w-full">
              <tbody>
                {items.map((item, idx) => {
                  const label = item.label || item.name || '';
                  const value = item.value !== undefined ? item.value : '';
                  const unit = item.unit || '';
                  const specType = getSpecType(label, unit);
                  const icon = getSpecIcon(specType);

                  // Helper to convert to Title Case
                  const toTitleCase = (str) => {
                    if (!str) return '';
                    return str.replace(/\w\S*/g, (txt) => {
                      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    });
                  };

                  // Pastel color palette (clean FAQ-style colors)
                  const colorPalette = [
                    { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-50' },
                    { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-50' },
                    { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-50' },
                    { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-50' },
                    { bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-50' },
                    { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:bg-rose-50' },
                    { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-50' },
                    { bg: 'bg-teal-100', text: 'text-teal-700', hover: 'hover:bg-teal-50' }
                  ];

                  const colorScheme = colorPalette[idx % colorPalette.length];

                  return (
                    <tr
                      key={`spec-${idx}`}
                      className={`border-b border-neutral-100 last:border-b-0 ${colorScheme.hover} transition-colors duration-200 ${
                        idx % 2 === 0 ? 'bg-neutral-50/30' : 'bg-white'
                      }`}
                    >
                      {/* Spec Name with Icon */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${colorScheme.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <i className={`${icon} text-base ${colorScheme.text}`}></i>
                          </div>
                          <span className="text-sm md:text-base font-medium text-neutral-700">{label}</span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-base md:text-lg font-bold ${colorScheme.text}`}>
                            {value}
                          </span>
                        </div>
                      </td>

                      {/* Unit */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {unit && (
                            <span className="text-xs md:text-sm text-neutral-600">{unit}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Definition list for mobile */}
          <div className="sm:hidden divide-y divide-neutral-200">
            {items.map((item, idx) => {
              const label = item.label || item.name || '';
              const value = item.value !== undefined ? item.value : '';
              const unit = item.unit || '';
              const specType = getSpecType(label, unit);
              const icon = getSpecIcon(specType);

              // Pastel color palette (clean FAQ-style colors)
              const colorPalette = [
                { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-50' },
                { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-50' },
                { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-50' },
                { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-50' },
                { bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-50' },
                { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:bg-rose-50' },
                { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-50' },
                { bg: 'bg-teal-100', text: 'text-teal-700', hover: 'hover:bg-teal-50' }
              ];

              const colorScheme = colorPalette[idx % colorPalette.length];

              return (
                <div
                  key={`spec-mobile-${idx}`}
                  className={`p-4 ${colorScheme.hover} transition-colors duration-200`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-8 h-8 ${colorScheme.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <i className={`${icon} text-base ${colorScheme.text}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-700 mb-1">{label}</div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-base font-bold ${colorScheme.text}`}>{value}</span>
                        {unit && <span className="text-xs text-neutral-600">{unit}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
    <div className="bg-white rounded-2xl p-6 shadow-2xl mb-8 border-l-4 border-blue-400">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <i className="ph ph-info text-blue-600 text-xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900">Important notes</h3>
      </div>
      <ul className="space-y-3 pl-1">
        {notes.map((note, index) => (
          <li key={`note-${index}`} className="flex items-start gap-2">
            <i className="ph ph-check-circle text-blue-600 mt-0.5 flex-shrink-0"></i>
            <span className="text-sm text-neutral-700">{note || ''}</span>
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
  const [errorType, setErrorType] = useState('service'); // 'service' or 'nodata'
  const [matchConfidence, setMatchConfidence] = useState('none');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  // Use refs for tracking requests and preventing race conditions
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Animation refs
  const decorativeRef = useRef(null);
  const headerRef = useRef(null);
  const tabContentRef = useRef(null);
  
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
        setErrorType('service');
  
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
        // Determine error type based on status code
        if (err.status === 404) {
          setErrorType('nodata');
          setError('No technical specifications data available for this vehicle');
        } else {
          setErrorType('service');
          setError(err.message || "Failed to load technical specifications");
        }
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

  // Animation effects
  useEffect(() => {
    // Animate decorative floating circles
    if (decorativeRef.current?.children) {
      animate(Array.from(decorativeRef.current.children), {
        translateY: [-8, 8],
        duration: 3000,
        ease: 'inOutSine',
        alternate: true,
        loop: true,
        delay: stagger(400)
      });
    }

    // Animate header entrance
    if (headerRef.current) {
      animate(headerRef.current, {
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
        ease: 'outQuad',
        delay: 200
      });
    }
  }, []);

  // Animate tab content when tab changes
  useEffect(() => {
    if (tabContentRef.current && !loading && techSpecsData) {
      const specCards = tabContentRef.current.querySelectorAll('[data-spec-card]');
      if (specCards.length > 0) {
        animate(Array.from(specCards), {
          opacity: [0, 1],
          translateY: [20, 0],
          scale: [0.95, 1],
          duration: 500,
          ease: 'outQuad',
          delay: stagger(60)
        });
      }
    }
  }, [tabValue, loading, techSpecsData]);

  // Visual tabs configuration (keeping existing implementation)
  const tabs = useMemo(() => {
    if (!techSpecsData) return [];

    const tabsConfig = [];

    // Service Information Tab (FIRST)
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
                <div className="flex items-center gap-2 mb-4">
                  <i className="ph ph-drop text-lg text-green-600"></i>
                  <h4 className="text-lg font-medium text-neutral-900">
                    Engine Oil Options
                  </h4>
                </div>
                {renderVisualSpecs(engineOilOptions, "Lubricants & Capacities")}
              </div>
            )}
            
            {hasLubricantSpecs && (
              <div>
                {hasEngineOilOptions && (
                  <div className="h-1 bg-neutral-200 my-8" />
                )}
                <div className="flex items-center gap-2 mb-4">
                  <i className="ph ph-flask text-lg text-blue-600"></i>
                  <h4 className="text-lg font-medium text-neutral-900">
                    Other Lubricants & Capacities
                  </h4>
                </div>
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
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ph ph-list-numbers text-lg text-blue-600"></i>
                    <h4 className="text-lg font-medium text-neutral-900">
                      Tightening Sequence
                    </h4>
                  </div>
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
        <div className="bg-blue-50 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center justify-center min-h-64 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="text-center max-w-md">
              <div className="text-2xl font-bold text-neutral-900 mb-3">Loading vehicle specifications</div>
              <div className="text-base text-neutral-700">We are retrieving the technical information for {vehicleData?.make} {vehicleData?.model}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    if (errorType === 'nodata') {
      return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="text-center py-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ph ph-database text-5xl text-blue-600"></i>
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mb-4">
                No Data Available
              </div>
              <div className="text-base text-neutral-700 mb-6 max-w-lg mx-auto leading-relaxed">
                We don't currently have technical specifications information for this {vehicleData?.make} {vehicleData?.model}.
                This doesn't necessarily mean there are no specifications - we may not have this vehicle in our database yet.
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                <i className="ph ph-info text-blue-600"></i>
                <span className="text-sm text-neutral-700">Data coverage varies by vehicle model and year</span>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Service error
      return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="text-center py-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="ph ph-clock text-5xl text-orange-600"></i>
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mb-4">
                Service Temporarily Unavailable
              </div>
              <div className="text-base text-neutral-700 mb-8 max-w-md mx-auto leading-relaxed">
                We're currently unable to retrieve technical specifications for your {vehicleData?.make} {vehicleData?.model}.
                This may be due to temporary maintenance or high demand.
              </div>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <i className="ph ph-arrow-clockwise"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // No data state
  if (!techSpecsData) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center justify-center min-h-64 gap-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ph ph-database text-5xl text-blue-600"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 mb-4">No Data Available</div>
              <div className="text-base text-neutral-700 mb-6 max-w-lg mx-auto leading-relaxed">
                We don't currently have technical specifications information for this vehicle.
                This doesn't necessarily mean there are no specifications - we may not have this vehicle in our database yet.
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                <i className="ph ph-info text-blue-600"></i>
                <span className="text-sm text-neutral-700">Data coverage varies by vehicle model and year</span>
              </div>
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
      <div className="relative bg-blue-50 rounded-2xl p-8 md:p-10 lg:p-12 shadow-2xl overflow-hidden">
        {/* Decorative floating elements */}
        <div ref={decorativeRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 right-10 w-3 h-3 bg-blue-200 rounded-full opacity-40"></div>
          <div className="absolute top-20 right-32 w-2 h-2 bg-purple-200 rounded-full opacity-30"></div>
          <div className="absolute bottom-20 left-12 w-2.5 h-2.5 bg-pink-200 rounded-full opacity-35"></div>
          <div className="absolute top-32 left-20 w-2 h-2 bg-cyan-200 rounded-full opacity-25"></div>
        </div>

        <div className="relative z-10">
          <div ref={headerRef} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="ph ph-wrench text-4xl text-white"></i>
              </div>
              <div>
                <HeadingWithTooltip
                  tooltip="Technical specifications for your vehicle, based on manufacturer data"
                >
                  <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight tracking-tight mb-2">
                    Technical Specifications
                  </h1>
                </HeadingWithTooltip>
                <p className="text-base text-neutral-700">
                  {displayMake} {displayModel} - Detailed technical information for servicing and maintenance
                </p>
              </div>
            </div>
          </div>

          {matchConfidence !== 'exact' && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 mb-6 border-l-4 border-yellow-400">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ph ph-warning text-2xl text-yellow-600"></i>
                </div>
                <div>
                  <div className="text-base font-semibold text-neutral-900 mb-2">Vehicle Match Information</div>
                  <div className="text-sm text-neutral-700">
                    {matchConfidence === 'fuzzy' ?
                      'These specifications are based on a similar vehicle variant. Please verify compatibility.' :
                      'Unable to find exact specifications for this vehicle configuration.'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 mb-8 border-l-4 border-blue-400">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ph ph-info text-2xl text-blue-600"></i>
              </div>
              <div>
                <div className="text-base font-semibold text-neutral-900 mb-2">Important Notice</div>
                <div className="text-sm text-neutral-700">
                  These specifications are for reference only. Always consult the manufacturer's documentation for definitive technical information.
                </div>
              </div>
            </div>
          </div>

          {displayFuelType && displayFuelType !== 'unknown' && (
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 text-sm font-semibold rounded-full shadow-lg">
                <i className="ph ph-drop text-lg"></i>
                <span>{displayFuelType.charAt(0).toUpperCase() + displayFuelType.slice(1)} Engine</span>
              </div>
            </div>
          )}

          {hasTabs ? (
            <>
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="ph ph-magnifying-glass text-neutral-400 text-lg"></i>
                    </div>
                    <input
                      type="text"
                      placeholder="Search specifications..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-sm rounded-xl bg-white border-2 border-transparent focus:border-blue-500 focus:outline-none shadow-lg transition-all duration-200"
                    />
                  </div>
                  {searchTerm && (
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-3 text-sm text-blue-600 hover:text-blue-700 font-semibold bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-center mb-12">
                <div className="inline-flex bg-white rounded-2xl p-2 shadow-2xl">
                  {tabs.map((tab, tabIndex) => (
                    <button
                      key={tabIndex}
                      onClick={() => handleTabChange(tabIndex)}
                      className={`
                        flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                        ${tabValue === tabIndex
                          ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                        }
                      `}
                    >
                      <i className={`${getCategoryIcon(tab.label)} text-xl`}></i>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            {tabs.map((tab, tabIndex) => {
              // Define pastel background based on tab type
              const tabPastels = {
                'Engine Details': 'bg-cyan-50',
                'Service Information': 'bg-green-50',
                'Torque Specifications': 'bg-amber-50',
                'Brakes & A/C': 'bg-purple-50'
              };
              const pastelClass = tabPastels[tab.label] || 'bg-neutral-50';

              return (
                <div key={`content-${tabIndex}`} ref={tabValue === tabIndex ? tabContentRef : null} className={tabValue === tabIndex ? 'block' : 'hidden'}>
                  <div className={`${pastelClass} rounded-2xl p-8 md:p-10 shadow-xl mb-8`}>
                    <div className="mb-12">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                          <i className={`${getCategoryIcon(tab.label)} text-3xl text-blue-600`}></i>
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-neutral-900 leading-tight tracking-tight mb-2">{tab.label}</h2>
                          <p className="text-base text-neutral-700">
                            Technical specifications and measurements for {tab.label.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                
                    {tab.sections.map((section, sectionIndex) => {
                      const sectionId = `${tabIndex}-${sectionIndex}`;
                      const isExpanded = expandedSections[sectionId] ?? (section.priority === 'high' || sectionIndex === 0);

                      return (
                        <div key={sectionId} className="mb-6">
                          <button
                            onClick={() => handleAccordionToggle(sectionId)}
                            className={`w-full flex items-center justify-between bg-white rounded-2xl p-6 text-left shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${isExpanded ? 'border-l-4 border-blue-500' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <i className={`${section.icon || 'ph-question'} text-2xl text-blue-600`}></i>
                              </div>
                              <span className="text-lg font-semibold text-neutral-900">{section.title}</span>
                            </div>
                            <div className={`w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-blue-600' : ''}`}>
                              <i className={`ph ph-caret-down text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : 'text-blue-600'}`}></i>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="mt-6">
                              {section.content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-blue-400">
              <div className="flex items-center gap-3">
                <i className="ph ph-info text-blue-600 text-2xl"></i>
                <p className="text-sm text-neutral-700">
                  Limited specifications available for this vehicle. Try checking the manufacturer's website for more details.
                </p>
              </div>
            </div>
          )}

          <div className="mt-16 pt-8 border-t-2 border-blue-200">
            <div className="flex items-center justify-center gap-3 text-sm text-neutral-600">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <i className="ph ph-database text-blue-600"></i>
              </div>
              <span>Technical specifications sourced from industry standard databases • Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TechnicalSpecificationsPage);