import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';

// Import API client
import repairTimesApi from '../api/RepairTimesApiClient';

// Browser cache configuration
const BROWSER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BROWSER_CACHE_PREFIX = 'repair_times_';
const STORAGE_VERSION = 'v1'; // Use this to invalidate all caches if data structure changes


// Browser storage utility functions (keep existing)
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatTime = (hours) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  return `${hours}h`;
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

// Helper function to determine operation complexity
const getOperationComplexity = (time) => {
  const hours = parseFloat(time);
  if (isNaN(hours)) return 'low';
  
  if (hours >= 4) return 'high';
  if (hours >= 2) return 'medium';
  return 'low';
};

// Helper function to get complexity color - now handled by Tailwind classes



// Clean visual components with enhanced filtering and search
const CleanSpecTable = memo(({ items, searchTerm, complexityFilter, sortBy }) => {
  if (!items || items.length === 0) return null;
  
  const processedItems = [];
  
  items.forEach((item, index) => {
    const operations = parseRepairOperations(item.label);
    if (!operations || operations.length === 0) return;
    const complexity = getOperationComplexity(item.value);
    
    // Apply search filter
    const matchesSearch = !searchTerm || 
      operations.some(op => op.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply complexity filter
    const matchesComplexity = complexityFilter === 'all' || complexity === complexityFilter;
    
    if (matchesSearch && matchesComplexity) {
      processedItems.push({
        id: `item-${index}`,
        operations: operations,
        value: item.value,
        unit: item.unit,
        isMultiOperation: operations.length > 1,
        complexity: complexity
      });
    }
  });
  
  // Apply sorting
  processedItems.sort((a, b) => {
    if (sortBy === 'complexity') {
      const complexityOrder = { high: 3, medium: 2, low: 1 };
      const complexityDiff = complexityOrder[b.complexity] - complexityOrder[a.complexity];
      if (complexityDiff !== 0) return complexityDiff;
      const aTime = parseFloat(a.value) || 0;
      const bTime = parseFloat(b.value) || 0;
      return bTime - aTime;
    } else if (sortBy === 'time') {
      const aTime = parseFloat(a.value) || 0;
      const bTime = parseFloat(b.value) || 0;
      return bTime - aTime;
    } else if (sortBy === 'alphabetical') {
      return a.operations[0].localeCompare(b.operations[0]);
    }
    return 0;
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
      {processedItems.map((item) => {
        const hours = parseFloat(item.value) || 0;
        const maxHours = 8;
        const percentage = Math.min((hours / maxHours) * 100, 100);
        
        return (
          <div key={item.id} className={`rounded-lg p-4 md:p-6 shadow-sm cursor-pointer ${
            item.complexity === 'high' ? 'bg-red-50' :
            item.complexity === 'medium' ? 'bg-yellow-50' :
            'bg-green-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-start">
                <i className={`ph ${
                  item.complexity === 'high' ? 'ph-warning-circle text-red-600' :
                  item.complexity === 'medium' ? 'ph-info text-yellow-600' :
                  'ph-check-circle text-green-600'
                } text-lg mr-3 mt-0.5 flex-shrink-0`}></i>
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-900">
                    {item.isMultiOperation ? (
                      <div className="space-y-1">
                        {item.operations.map((op, i) => (
                          <div 
                            key={`${item.id}-op-${i}`} 
                            className={i === 0 ? 'font-semibold' : 'font-normal'}
                          >
                            {op}
                          </div>
                        ))}
                      </div>
                    ) : (
                      item.operations[0]
                    )}
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">
                    {item.complexity} complexity
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-2xl font-bold ${
                  item.complexity === 'high' ? 'text-red-600' :
                  item.complexity === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {formatValue(item.value)}
                </div>
                <div className={`text-xs ${
                  item.complexity === 'high' ? 'text-red-600' :
                  item.complexity === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {item.unit || 'hours'}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  item.complexity === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  item.complexity === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-neutral-500">
              <span>0h</span>
              <span>{maxHours}h</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// CleanAccordion removed - now using SharedAccordion directly





/**
 * MatchWarning Component - Pure Tailwind design
 */
const MatchWarning = ({ matchConfidence, vehicleIdentification, vehicleData }) => {
  const year = extractVehicleYear(vehicleData);
  
  if (matchConfidence === 'exact' || matchConfidence === 'none') return null;
  
  return (
    <div className="bg-yellow-50 rounded-lg p-4 md:p-6 shadow-sm mb-8">
      <div className="flex items-start">
        <i className="ph ph-warning-circle text-yellow-600 text-lg mr-3 mt-0.5 flex-shrink-0"></i>
        <div className="flex-1">
          <div className="text-sm font-medium text-neutral-900 mb-2">
            Vehicle Match Information
          </div>
          <div className="text-xs text-neutral-700 leading-relaxed">
            The repair times shown are for a similar {vehicleIdentification?.make} {vehicleIdentification?.model} model.
            Actual times may vary based on your specific vehicle configuration.
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading State Component - Pure Tailwind design
 */
const LoadingState = ({ vehicleMake, vehicleModel }) => (
  <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-medium text-neutral-900 mb-2">
            Loading repair times data
          </div>
          <div className="text-xs text-neutral-600">
            Please wait while we compile repair times for {vehicleMake} {vehicleModel}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Error State Component - Pure Tailwind design
 */
const ErrorState = ({ error, onRetry }) => (
  <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
    <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm">
      <div className="flex items-start">
        <i className="ph ph-x-circle text-red-600 text-lg mr-3 mt-0.5 flex-shrink-0"></i>
        <div className="flex-1">
          <div className="text-sm font-medium text-neutral-900 mb-2">
            Error Loading Repair Times
          </div>
          <div className="text-xs text-neutral-700 leading-relaxed mb-4">
            {error || 'An unexpected error occurred while loading repair times data.'}
          </div>
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Empty State Component - Pure Tailwind design
 */
const EmptyState = ({ vehicleMake, vehicleModel }) => (
  <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
    <div className="bg-neutral-50 rounded-lg p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="ph ph-info text-4xl text-neutral-400 mb-4"></i>
          <div className="text-lg font-medium text-neutral-900 mb-2">
            No repair times data available for {vehicleMake} {vehicleModel}
          </div>
          <div className="text-xs text-neutral-600">
            This could be because the vehicle is too new, too old, or a rare model.
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main component - restructured for better alignment with bulletins component
const VehicleRepairTimesComponent = ({ registration, vehicleData, onDataLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairData, setRepairData] = useState(null);
  const [matchConfidence, setMatchConfidence] = useState('none');
  const [tabValue, setTabValue] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('complexity'); // 'complexity', 'time', 'alphabetical'
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

  
  

  // Handle retry when error occurs
  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => window.location.reload(), 500);
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((newValue) => {
    setTabValue(newValue);
  }, []);

  // Handle section toggle
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Handle search and filtering
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleComplexityFilter = useCallback((filterId) => {
    setComplexityFilter(filterId);
  }, []);

  const handleSortChange = useCallback((sortType) => {
    setSortBy(sortType);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setComplexityFilter('all');
    setSortBy('complexity');
  }, []);

  // Define filter options for shared component
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' }
  ];

  const activeFilters = complexityFilter === 'all' ? [] : [complexityFilter];

  // Helper function to count items in a section for accordion display
  const getItemCount = useCallback((content, searchTerm, complexityFilter) => {
    try {
      if (!content || !content.props || !content.props.items) return 0;
      
      const items = content.props.items;
      let filteredCount = 0;
      
      items.forEach((item) => {
        const operations = parseRepairOperations(item.label);
        const complexity = getOperationComplexity(item.value);
        
        const matchesSearch = !searchTerm || 
          operations.some(op => op.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesComplexity = complexityFilter === 'all' || complexity === complexityFilter;
        
        if (matchesSearch && matchesComplexity) {
          filteredCount++;
        }
      });
      
      return filteredCount;
    } catch (e) {
      console.warn('Error counting items:', e);
      return 0;
    }
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
        color: 'var(--primary)',
        sections: [
          { title: "Engine Assembly", content: repairData.engineData?.engineAssembly?.details && <CleanSpecTable items={repairData.engineData.engineAssembly.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Cylinder Head", content: repairData.engineData?.cylinderHead?.details && <CleanSpecTable items={repairData.engineData.cylinderHead.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Camshaft & Drive Gear", content: repairData.engineData?.camshaftDrive?.details && <CleanSpecTable items={repairData.engineData.camshaftDrive.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Crankshaft & Pistons", content: repairData.engineData?.crankshaft?.details && <CleanSpecTable items={repairData.engineData.crankshaft.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Lubrication", content: repairData.engineData?.lubrication?.details && <CleanSpecTable items={repairData.engineData.lubrication.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Auxiliary Drive", content: repairData.engineData?.auxiliaryDrive?.details && <CleanSpecTable items={repairData.engineData.auxiliaryDrive.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
        ].filter(section => section.content)
      },
      {
        label: "Fuel & Cooling",
        color: 'var(--positive)',
        sections: [
          { title: "Air Filter & Manifolds", content: repairData.fuelManagement?.airFilter?.details && <CleanSpecTable items={repairData.fuelManagement.airFilter.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Throttle Controls", content: repairData.fuelManagement?.throttleControls?.details && <CleanSpecTable items={repairData.fuelManagement.throttleControls.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Diesel Injection System", content: repairData.fuelManagement?.dieselInjection?.details && <CleanSpecTable items={repairData.fuelManagement.dieselInjection.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Fuel Supply", content: repairData.fuelManagement?.fuelSupply?.details && <CleanSpecTable items={repairData.fuelManagement.fuelSupply.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Turbocharger", content: repairData.fuelManagement?.turbocharger?.details && <CleanSpecTable items={repairData.fuelManagement.turbocharger.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Radiator & Cooling", content: repairData.cooling?.radiator?.details && <CleanSpecTable items={repairData.cooling.radiator.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Pump & Drive", content: repairData.cooling?.pumpDrive?.details && <CleanSpecTable items={repairData.cooling.pumpDrive.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Header Tank & Hoses", content: repairData.cooling?.headerTank?.details && <CleanSpecTable items={repairData.cooling.headerTank.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Exhaust Manifold & Pipes", content: repairData.exhaust?.manifold?.details && <CleanSpecTable items={repairData.exhaust.manifold.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Exhaust Gas Aftertreatment", content: repairData.exhaust?.exhaustGas?.details && <CleanSpecTable items={repairData.exhaust.exhaustGas.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
        ].filter(section => section.content)
      },
      {
        label: "Transmission & Drive",
        color: 'var(--warning)',
        sections: [
          { title: "Clutch Pedal & Hydraulics", content: repairData.drivetrain?.clutchControls?.details && <CleanSpecTable items={repairData.drivetrain.clutchControls.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Clutch Unit & Flywheel", content: repairData.drivetrain?.clutchUnit?.details && <CleanSpecTable items={repairData.drivetrain.clutchUnit.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Manual Transmission", content: repairData.drivetrain?.manualTransmission?.details && <CleanSpecTable items={repairData.drivetrain.manualTransmission.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Final Drive, Shaft & Axles", content: repairData.drivetrain?.finalDrive?.details && <CleanSpecTable items={repairData.drivetrain.finalDrive.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
        ].filter(section => section.content)
      },
      {
        label: "Suspension & Brakes",
        color: 'var(--negative)',
        sections: [
          { title: "Braking System Hydraulics", content: repairData.brakes?.brakingSystem?.details && <CleanSpecTable items={repairData.brakes.brakingSystem.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Footbrakes", content: repairData.brakes?.footbrakes?.details && <CleanSpecTable items={repairData.brakes.footbrakes.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Brake Pedal & Servo", content: repairData.brakes?.brakePedal?.details && <CleanSpecTable items={repairData.brakes.brakePedal.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "ABS or ABS/ESP", content: repairData.brakes?.absSystems?.details && <CleanSpecTable items={repairData.brakes.absSystems.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Parking Brake", content: repairData.brakes?.parkingBrake?.details && <CleanSpecTable items={repairData.brakes.parkingBrake.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
        ].filter(section => section.content)
      },
      {
        label: "Electrical & Body",
        color: 'var(--gray-600)',
        sections: [
          { title: "Heating & Ventilation", content: repairData.climate?.heating?.details && <CleanSpecTable items={repairData.climate.heating.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Air Conditioning", content: repairData.climate?.airConditioning?.details && <CleanSpecTable items={repairData.climate.airConditioning.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Battery & Cables", content: repairData.electrical?.batteryCables?.details && <CleanSpecTable items={repairData.electrical.batteryCables.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Charging System", content: repairData.electrical?.chargingSystem?.details && <CleanSpecTable items={repairData.electrical.chargingSystem.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Starting System", content: repairData.electrical?.startingSystem?.details && <CleanSpecTable items={repairData.electrical.startingSystem.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Bulbs & LEDs", content: repairData.electrical?.bulbsLeds?.details && <CleanSpecTable items={repairData.electrical.bulbsLeds.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Front Lamps", content: repairData.electrical?.frontLamps?.details && <CleanSpecTable items={repairData.electrical.frontLamps.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Rear Lamps", content: repairData.electrical?.rearLamps?.details && <CleanSpecTable items={repairData.electrical.rearLamps.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Interior Lamps", content: repairData.electrical?.interiorLamps?.details && <CleanSpecTable items={repairData.electrical.interiorLamps.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Switches", content: repairData.electrical?.switches?.details && <CleanSpecTable items={repairData.electrical.switches.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Instruments", content: repairData.electrical?.instruments?.details && <CleanSpecTable items={repairData.electrical.instruments.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Sensors & Transmitters", content: repairData.electrical?.sensors?.details && <CleanSpecTable items={repairData.electrical.sensors.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Fusebox & Relays", content: repairData.electrical?.fuseboxRelays?.details && <CleanSpecTable items={repairData.electrical.fuseboxRelays.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Motors", content: repairData.electrical?.motors?.details && <CleanSpecTable items={repairData.electrical.motors.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Control & Audio Units", content: repairData.electrical?.audioUnits?.details && <CleanSpecTable items={repairData.electrical.audioUnits.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Windscreen Wipers/Washers", content: repairData.electrical?.wipers?.details && <CleanSpecTable items={repairData.electrical.wipers.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Headlamp Wipers/Washers", content: repairData.electrical?.headlampWipers?.details && <CleanSpecTable items={repairData.electrical.headlampWipers.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Rear Screen Wipers/Washers", content: repairData.electrical?.rearScreenWipers?.details && <CleanSpecTable items={repairData.electrical.rearScreenWipers.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
          { title: "Interior/Seats/Seatbelts", content: repairData.body?.interiorSeats?.details && <CleanSpecTable items={repairData.body.interiorSeats.details} searchTerm={searchTerm} complexityFilter={complexityFilter} sortBy={sortBy} /> },
        ].filter(section => section.content)
      }
    ].filter(tab => tab.sections.length > 0);
  }, [repairData, searchTerm, complexityFilter, sortBy]);

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
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm mb-8">
        {/* Header */}
        <div className="mb-8 pb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
            Repair Times for {displayMake} {displayModel}{yearRangeDisplay}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Professional repair time estimates to help you plan service work for your {displayMake} {displayModel}.
          </p>
        </div>

        {/* Match warning */}
        <MatchWarning 
          matchConfidence={matchConfidence} 
          vehicleIdentification={vehicleIdentification}
          vehicleData={vehicleData}
        />

        {/* Important notice */}
        <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm mb-8">
          <div className="flex items-start">
            <i className="ph ph-info text-blue-600 text-lg mr-3 mt-0.5 flex-shrink-0"></i>
            <div className="flex-1">
              <div className="text-sm font-medium text-neutral-900 mb-2">
                Important
              </div>
              <div className="text-xs text-neutral-700 leading-relaxed">
                These repair times are industry estimates. Actual times may vary based on vehicle condition, workshop equipment, and technician experience. Always consult with a qualified professional.
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle summary */}
        {vehicleSummary && (
          <div className="bg-neutral-50 rounded-lg p-4 md:p-6 shadow-sm mb-8">
            <div className="flex items-start">
              <i className="ph ph-chart-bar text-blue-600 text-lg mr-3 mt-0.5 flex-shrink-0"></i>
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900 mb-4">
                  Repair Overview
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {vehicleSummary.totalOperations}
                    </div>
                    <div className="text-xs text-neutral-600">Total Operations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {vehicleSummary.avgTime}
                    </div>
                    <div className="text-xs text-neutral-600">Average Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-neutral-900">
                      {vehicleSummary.mostComplexSystem}
                    </div>
                    <div className="text-xs text-neutral-600">Most Common</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-neutral-50 rounded-lg p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <i className="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"></i>
                <input
                  type="text"
                  placeholder="Search repair operations..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleComplexityFilter(filter.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    complexityFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              {(searchTerm || complexityFilter !== 'all') && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 text-xs font-medium bg-neutral-200 text-neutral-700 rounded-full"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 p-4 bg-neutral-50 rounded-lg">
          <span className="text-sm text-neutral-700 font-medium">Sort by:</span>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => handleSortChange('complexity')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                sortBy === 'complexity'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600'
              }`}
            >
              Complexity
            </button>
            <button 
              onClick={() => handleSortChange('time')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                sortBy === 'time'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600'
              }`}
            >
              Time
            </button>
            <button 
              onClick={() => handleSortChange('alphabetical')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                sortBy === 'alphabetical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 mb-8">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab, tabIndex) => (
                <button
                  key={tabIndex}
                  onClick={() => handleTabChange(tabIndex)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                    tabValue === tabIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {tabs.map((tab, tabIndex) => (
            <div key={tabIndex} className={`${tabValue === tabIndex ? 'block' : 'hidden'}`}>
              <div className="mb-8 pb-4">
                <h3 className="text-lg font-medium text-neutral-900 mb-1">
                  {tab.label}
                </h3>
                <p className="text-xs text-neutral-600">
                  Standard repair times for {tab.label.toLowerCase()} operations
                </p>
              </div>
              
              {tab.sections.map((section, sectionIndex) => {
                const sectionId = `${tabIndex}-${sectionIndex}`;
                const isExpanded = !!expandedSections[sectionId];
                const itemCount = section.content ? getItemCount(section.content, searchTerm, complexityFilter) : 0;
                
                return (
                  <div key={sectionId} className="bg-neutral-50 rounded-lg mb-4">
                    <button
                      onClick={() => toggleSection(sectionId)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center">
                        <i className="ph ph-wrench text-blue-600 text-lg mr-3"></i>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {section.title}
                          </div>
                          <div className="text-xs text-neutral-600">
                            {itemCount} operations
                          </div>
                        </div>
                      </div>
                      <i className={`ph ph-caret-down text-blue-600 transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}></i>
                    </button>
                    
                    {isExpanded && section.content && (
                      <div className="px-4 pb-4">
                        {section.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-xs text-neutral-500 text-center py-4 mt-12 border-t border-neutral-200">
          Repair times sourced from industry standard databases. Last updated: {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default memo(VehicleRepairTimesComponent);