import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';

// Import API client
import repairTimesApi from '../api/RepairTimesApiClient';

// Import custom tooltip components
import { HeadingWithTooltip } from '../../../styles/tooltip';

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
        } catch (error) {
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

// Removed unused utility functions


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
    /\((\d{4})[-+](\d{4})\)/,
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



// Table row component for individual operations
const OperationRow = memo(({ item, isNested = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMultipleOperations = item.isMultiOperation && item.operations.length > 1;

  return (
    <>
      <div
        className={`bg-white border-b border-neutral-200 transition-colors duration-200 ${
          hasMultipleOperations ? 'hover:bg-neutral-50 cursor-pointer' : ''
        } ${isNested ? 'bg-neutral-50' : ''}`}
        onClick={() => hasMultipleOperations && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between py-2.5 px-4">
          {/* Operation Name Column */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0 pr-4">
            <i className={`ph ${
              item.complexity === 'high' ? 'ph-warning-circle text-red-600' :
              item.complexity === 'medium' ? 'ph-info text-yellow-600' :
              'ph-check-circle text-green-600'
            } text-base flex-shrink-0`}></i>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900">
                {item.operations[0]}
              </div>
              {hasMultipleOperations && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-neutral-500">
                    {item.operations.length} operations
                  </span>
                  <i className={`ph ph-caret-down text-neutral-400 text-xs transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}></i>
                </div>
              )}
            </div>
          </div>

          {/* Time Column */}
          <div className="flex-shrink-0 text-right">
            <div className={`text-lg font-bold ${
              item.complexity === 'high' ? 'text-red-600' :
              item.complexity === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {formatValue(item.value)}
            </div>
            <div className="text-xs text-neutral-600">
              {item.unit || 'hours'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded sub-operations */}
      {isExpanded && hasMultipleOperations && (
        <div className="bg-neutral-50 border-b border-neutral-200">
          <div className="py-2 px-4">
            <div className="ml-7 space-y-1.5">
              {item.operations.slice(1).map((operation, idx) => (
                <div key={`sub-${idx}`} className="flex items-start gap-2 text-sm text-neutral-700">
                  <i className="ph ph-dot text-neutral-400 mt-0.5 flex-shrink-0 text-xs"></i>
                  <span>{operation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

// Clean visual components with enhanced filtering and search - Table Layout
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
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-neutral-50 border-b border-neutral-200 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            Operation
          </div>
          <div className="flex-shrink-0 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            Time
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {processedItems.map((item) => (
          <OperationRow key={item.id} item={item} />
        ))}
      </div>

      {/* Empty state within table */}
      {processedItems.length === 0 && (
        <div className="py-12 text-center">
          <i className="ph ph-magnifying-glass text-neutral-300 text-3xl mb-3"></i>
          <p className="text-sm text-neutral-500">No operations match your filters</p>
        </div>
      )}
    </div>
  );
});

// CleanAccordion removed - now using SharedAccordion directly





/**
 * MatchWarning Component
 */
const MatchWarning = ({ matchConfidence, vehicleIdentification }) => {

  if (matchConfidence === 'exact' || matchConfidence === 'none') return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6">
      <div className="flex items-start gap-3">
        <i className="ph ph-warning text-yellow-600 text-lg flex-shrink-0"></i>
        <div>
          <p className="text-sm font-medium text-yellow-900 mb-1">Vehicle Match Information</p>
          <p className="text-sm text-yellow-800">
            The repair times shown are for a similar {vehicleIdentification?.make} {vehicleIdentification?.model} model.
            Actual times may vary based on your specific vehicle configuration.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading State Component
 */
const LoadingState = ({ vehicleMake, vehicleModel }) => (
  <div className="min-h-screen bg-neutral-50">
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-neutral-600">Loading repair times for {vehicleMake} {vehicleModel}...</p>
      </div>
    </div>
  </div>
);

/**
 * Error State Component
 */
const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-neutral-50">
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <i className="ph ph-warning text-red-600 text-xl flex-shrink-0"></i>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 mb-1">Unable to Load Repair Times</h3>
            <p className="text-sm text-neutral-700 mb-4">{error || 'An unexpected error occurred while loading repair times data.'}</p>
            <button
              onClick={onRetry}
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

/**
 * Empty State Component
 */
const EmptyState = ({ vehicleMake, vehicleModel }) => (
  <div className="min-h-screen bg-neutral-50">
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <i className="ph ph-database text-neutral-400 text-xl flex-shrink-0"></i>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 mb-1">No Data Available</h3>
            <p className="text-sm text-neutral-700">
              We don't currently have repair times information for {vehicleMake} {vehicleModel}. This could be because the vehicle is too new, too old, or a rare model.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main component - restructured for better alignment with bulletins component
const VehicleRepairTimesComponent = ({ vehicleData, onDataLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('service'); // 'service' or 'nodata'
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
    setErrorType('service');
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
    } catch (error) {
      console.warn('Error counting items:', error);
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
        setErrorType('service');
  
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
    
  }, [vehicleData, onDataLoad, checkBrowserCache]);

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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-16">
          <HeadingWithTooltip
            tooltip="Professional repair time estimates based on industry-standard data"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Repair Times
            </h1>
          </HeadingWithTooltip>
          <p className="text-sm text-neutral-600">
            {displayMake} {displayModel}{yearRangeDisplay} - Professional repair time estimates to help you plan service work
          </p>
        </div>

        {/* Match warning */}
        <MatchWarning 
          matchConfidence={matchConfidence} 
          vehicleIdentification={vehicleIdentification}
          vehicleData={vehicleData}
        />

        {/* Important notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ph ph-info text-white text-xs"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Important</p>
              <p className="text-sm text-blue-800">
                These repair times are industry estimates. Actual times may vary based on vehicle condition, workshop equipment, and technician experience. Always consult with a qualified professional.
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle summary */}
        {vehicleSummary && (
          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <i className="ph ph-database text-blue-600 text-xl flex-shrink-0"></i>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-600 font-medium uppercase tracking-wide mb-1">Total Operations</p>
                    <p className="text-xs text-neutral-500">Available repairs</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <div className="text-2xl font-bold text-blue-600">{vehicleSummary.totalOperations}</div>
                  <div className="text-sm text-neutral-600">procedures</div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <i className="ph ph-clock text-blue-600 text-xl flex-shrink-0"></i>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-600 font-medium uppercase tracking-wide mb-1">Average Time</p>
                    <p className="text-xs text-neutral-500">Per operation</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <div className="text-2xl font-bold text-blue-600">{vehicleSummary.avgTime}</div>
                  <div className="text-sm text-neutral-600">hours</div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <i className="ph ph-wrench text-blue-600 text-xl flex-shrink-0"></i>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-600 font-medium uppercase tracking-wide mb-1">Most Common</p>
                    <p className="text-xs text-neutral-500">System category</p>
                  </div>
                </div>
                <div className="text-base font-semibold text-neutral-900">{vehicleSummary.mostComplexSystem}</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <i className="ph ph-magnifying-glass text-neutral-400 text-lg"></i>
              </div>
              <input
                type="text"
                placeholder="Search repair operations..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-neutral-200 rounded-lg focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors duration-200"
              />
            </div>
            {(searchTerm || complexityFilter !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="px-5 py-3.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-neutral-600">Filter by complexity:</span>
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleComplexityFilter(filter.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  complexityFilter === filter.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort controls and Complexity Legend */}
        <div className="mb-12 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-neutral-600">Sort by:</span>
            <button
              onClick={() => handleSortChange('complexity')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                sortBy === 'complexity'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
              }`}
            >
              <i className="ph ph-warning-diamond mr-2"></i>
              Complexity
            </button>
            <button
              onClick={() => handleSortChange('time')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                sortBy === 'time'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
              }`}
            >
              <i className="ph ph-clock mr-2"></i>
              Time
            </button>
            <button
              onClick={() => handleSortChange('alphabetical')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                sortBy === 'alphabetical'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
              }`}
            >
              <i className="ph ph-sort-alphabetical mr-2"></i>
              A-Z
            </button>
          </div>

          {/* Complexity Legend */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-600">Complexity:</span>
            <div className="flex items-center gap-1.5">
              <i className="ph ph-check-circle text-green-600 text-base"></i>
              <span className="text-neutral-700">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="ph ph-info text-yellow-600 text-base"></i>
              <span className="text-neutral-700">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="ph ph-warning-circle text-red-600 text-base"></i>
              <span className="text-neutral-700">High</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
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

        {tabs.map((tab, tabIndex) => (
          <div key={`content-${tabIndex}`} className={tabValue === tabIndex ? 'block' : 'hidden'}>
            <div className="mb-8">
              <div className="mb-12">
                <h2 className="text-lg font-semibold text-neutral-900 mb-1">{tab.label}</h2>
                <p className="text-sm text-neutral-600">
                  Standard repair times for {tab.label.toLowerCase()} operations
                </p>
              </div>

              <div className="space-y-6">
                {tab.sections.map((section, sectionIndex) => {
                  const sectionId = `${tabIndex}-${sectionIndex}`;
                  const isExpanded = expandedSections[sectionId] ?? (sectionIndex === 0);
                  const itemCount = section.content ? getItemCount(section.content, searchTerm, complexityFilter) : 0;

                  if (itemCount === 0) return null;

                  return (
                    <div key={sectionId}>
                      <button
                        onClick={() => toggleSection(sectionId)}
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
        ))}

        {/* Footer note */}
        <div className="mt-24 pt-8 border-t border-neutral-200">
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <i className="ph ph-database text-neutral-400 text-sm"></i>
            <span>Repair times sourced from industry standard databases • Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(VehicleRepairTimesComponent);