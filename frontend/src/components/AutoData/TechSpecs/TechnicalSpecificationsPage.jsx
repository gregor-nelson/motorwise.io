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

// Helper to convert to Title Case
const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
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

// Visual spec renderer - Grid card layout (CarVertical style)
const renderVisualSpecs = (items, sectionTitle) => {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, idx) => {
        const label = item.label || item.name || '';
        const value = item.value !== undefined ? item.value : '';
        const unit = item.unit || '';
        const specType = getSpecType(label, unit);
        const icon = getSpecIcon(specType);

        return (
          <div
            key={`spec-${idx}`}
            data-spec-card
            className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors duration-200"
          >
            {/* Icon + Label row */}
            <div className="flex items-center gap-2 mb-3">
              <i className={`${icon} text-neutral-400 text-lg`}></i>
              <span className="text-xs text-neutral-600 font-medium uppercase tracking-wide">
                {toTitleCase(label)}
              </span>
            </div>

            {/* Value */}
            <div className="text-base font-semibold text-neutral-900">
              {value}{unit ? ` ${unit}` : ''}
            </div>
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
    <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
      <div className="flex items-start gap-3">
        <i className="ph ph-info text-neutral-400 text-lg flex-shrink-0"></i>
        <div>
          <p className="text-sm font-medium text-neutral-900 mb-3">Important Notes</p>
          <ul className="space-y-2">
            {notes.map((note, index) => (
              <li key={`note-${index}`} className="flex items-start gap-2">
                <i className="ph ph-check-circle text-neutral-400 mt-0.5 flex-shrink-0 text-sm"></i>
                <span className="text-sm text-neutral-700">{note || ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
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
                <h4 className="text-sm font-medium text-neutral-900 mb-4">
                  Engine Oil Options
                </h4>
                {renderVisualSpecs(engineOilOptions, "Lubricants & Capacities")}
              </div>
            )}

            {hasLubricantSpecs && (
              <div>
                {hasEngineOilOptions && (
                  <div className="h-px bg-neutral-200 my-8" />
                )}
                <h4 className="text-sm font-medium text-neutral-900 mb-4">
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
                <div className="bg-white border border-neutral-200 rounded-lg p-5">
                  <h4 className="text-sm font-medium text-neutral-900 mb-4">
                    Tightening Sequence
                  </h4>
                  <ol className="list-decimal pl-6 m-0 space-y-2">
                    {headTorques.map((step, index) => (
                      <li key={`step-${index}`} className="text-sm text-neutral-700">
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
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-neutral-600">Loading technical specifications...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    if (errorType === 'nodata') {
      return (
        <div className="min-h-screen bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <i className="ph ph-database text-neutral-400 text-xl flex-shrink-0"></i>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-1">No Data Available</h3>
                  <p className="text-sm text-neutral-700">
                    We don't currently have technical specifications information for this {vehicleData?.make} {vehicleData?.model}.
                    This doesn't necessarily mean there are no specifications - we may not have this vehicle in our database yet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Service error
      return (
        <div className="min-h-screen bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
            <div className="bg-white border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <i className="ph ph-warning text-red-600 text-xl flex-shrink-0"></i>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-1">Unable to Load Specifications</h3>
                  <p className="text-sm text-neutral-700 mb-4">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
                  >
                    <i className="ph ph-arrow-clockwise mr-2"></i>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // No data state
  if (!techSpecsData) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <i className="ph ph-database text-neutral-400 text-xl flex-shrink-0"></i>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">No Data Available</h3>
                <p className="text-sm text-neutral-700">
                  We don't currently have technical specifications information for this vehicle.
                  This doesn't necessarily mean there are no specifications - we may not have this vehicle in our database yet.
                </p>
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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div ref={headerRef} className="mb-16">
          <HeadingWithTooltip
            tooltip="Technical specifications for your vehicle, based on manufacturer data"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Technical Specifications
            </h1>
          </HeadingWithTooltip>
          <p className="text-sm text-neutral-600">
            {displayMake} {displayModel} - Detailed technical information for servicing and maintenance
          </p>
        </div>

        {matchConfidence !== 'exact' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6">
            <div className="flex items-start gap-3">
              <i className="ph ph-warning text-yellow-600 text-lg flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-yellow-900 mb-1">Vehicle Match Information</p>
                <p className="text-sm text-yellow-800">
                  {matchConfidence === 'fuzzy' ?
                    'These specifications are based on a similar vehicle variant. Please verify compatibility.' :
                    'Unable to find exact specifications for this vehicle configuration.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ph ph-info text-white text-xs"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Summary</p>
              <p className="text-sm text-blue-800">
                Make sure the vehicle's specs and equipment match what the seller told you. These specifications are for reference only. Always consult the manufacturer's documentation for definitive technical information.
              </p>
            </div>
          </div>
        </div>

        {displayFuelType && displayFuelType !== 'unknown' && (
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 rounded-full">
              <i className="ph ph-drop text-neutral-600 text-base"></i>
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
                    className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-neutral-200 rounded-lg focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors duration-200"
                  />
                </div>
                {searchTerm && (
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-3.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-white rounded-lg p-1 border border-neutral-200 shadow-sm">
                {tabs.map((tab, tabIndex) => (
                  <button
                    key={tabIndex}
                    onClick={() => handleTabChange(tabIndex)}
                    className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      tabValue === tabIndex
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {tabs.map((tab, tabIndex) => {
              return (
                <div key={`content-${tabIndex}`} ref={tabValue === tabIndex ? tabContentRef : null} className={tabValue === tabIndex ? 'block' : 'hidden'}>
                  <div className="mb-8">
                    <div className="mb-12">
                      <h2 className="text-lg font-semibold text-neutral-900 mb-1">{tab.label}</h2>
                      <p className="text-sm text-neutral-600">
                        Technical specifications and measurements for {tab.label.toLowerCase()}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {tab.sections.map((section, sectionIndex) => {
                        const sectionId = `${tabIndex}-${sectionIndex}`;
                        const isExpanded = expandedSections[sectionId] ?? (section.priority === 'high' || sectionIndex === 0);

                        return (
                          <div key={sectionId}>
                            <button
                              onClick={() => handleAccordionToggle(sectionId)}
                              className="w-full flex items-center justify-between bg-white border-b border-neutral-200 py-6 hover:bg-neutral-50 transition-colors duration-200"
                            >
                              <span className="text-lg font-semibold text-neutral-900">{section.title}</span>
                              <i className={`ph ph-caret-down text-neutral-400 text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}></i>
                            </button>

                            {isExpanded && (
                              <div className="py-6">
                                {section.content}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
            <div className="flex items-start gap-3">
              <i className="ph ph-info text-neutral-400 text-lg flex-shrink-0"></i>
              <div>
                <p className="text-sm font-medium text-neutral-900 mb-1">Limited Information</p>
                <p className="text-sm text-neutral-700">
                  Limited specifications available for this vehicle. Try checking the manufacturer's website for more details.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-24 pt-8 border-t border-neutral-200">
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <i className="ph ph-database text-neutral-400 text-sm"></i>
            <span>Technical specifications sourced from industry databases • Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TechnicalSpecificationsPage);