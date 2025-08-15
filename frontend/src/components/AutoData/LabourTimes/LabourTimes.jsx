import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';


// Import clean styled components
import {
  LabourTimesContainer,
  InsightsContainer,
  LabourTimesPanel,
  DetailPanel,
  WarningPanel,
  RepairGrid,
  RepairCard,
  RepairHeader,
  RepairTitle,
  RepairTime,
  TimeValue,
  TimeUnit,
  RepairMeta,
  ComplexityBadge,
  ActionButton,
  CleanHeadingM,
  CleanHeadingS,
  CleanBody,
  CleanBodyS,
  CleanLoadingSpinner,
  EnhancedLoadingContainer,
  EmptyStateContainer,
  InsightBody,
  ValueHighlight,
  InsightNote,
  StyledFooterNote,
  TabsContainer,
  TabsList,
  TabButton,
  TabContent,
  HeadingWithTooltip,
  SearchContainer,
  SearchInput,
  FilterContainer,
  FilterButton,
  ActiveFilters,
  FilterChip,
  SortContainer,
  SortButton
} from './LabourTimesStyles';


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

// Helper function to get complexity color
const getComplexityColor = (complexity) => {
  switch (complexity) {
    case 'high': return 'var(--negative)';
    case 'medium': return 'var(--warning)';
    case 'low': return 'var(--positive)';
    default: return 'var(--primary)';
  }
};



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
    <RepairGrid>
      {processedItems.map((item) => {
        const hours = parseFloat(item.value) || 0;
        const maxHours = 8;
        const percentage = Math.min((hours / maxHours) * 100, 100);
        
        return (
          <RepairCard key={item.id} complexity={item.complexity}>
            <RepairHeader>
              <RepairTitle>
                {item.isMultiOperation ? (
                  <div>
                    {item.operations.map((op, i) => (
                      <div key={`${item.id}-op-${i}`} style={{
                        fontWeight: i === 0 ? 'var(--font-bold)' : 'var(--font-regular)',
                        marginBottom: i < item.operations.length - 1 ? 'var(--space-xs)' : 0
                      }}>
                        {op}
                      </div>
                    ))}
                  </div>
                ) : (
                  item.operations[0]
                )}
              </RepairTitle>
              <RepairTime>
                <TimeValue>{formatValue(item.value)}</TimeValue>
                <TimeUnit>{item.unit || 'hours'}</TimeUnit>
              </RepairTime>
            </RepairHeader>
            
            <RepairMeta>
              <ComplexityBadge complexity={item.complexity}>
                {item.complexity} complexity
              </ComplexityBadge>
            </RepairMeta>
            
            <div style={{
              width: '100%',
              height: '4px',
              background: 'var(--gray-200)',
              marginTop: 'var(--space-lg)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${percentage}%`,
                background: getComplexityColor(item.complexity),
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'var(--space-sm)',
              fontSize: 'var(--text-xs)',
              color: 'var(--gray-500)',
              fontFamily: 'var(--font-main)'
            }}>
              <span>0h</span>
              <span>{maxHours}h</span>
            </div>
          </RepairCard>
        );
      })}
    </RepairGrid>
  );
});

// Clean Accordion component with filtered item count
const CleanAccordion = memo(({ title, children, expanded, onChange, id, searchTerm, complexityFilter }) => {
  const itemCount = useMemo(() => {
    try {
      const specTable = React.Children.toArray(children)
        .find(child => child && child.type === CleanSpecTable);
      
      if (specTable && specTable.props && specTable.props.items) {
        const items = specTable.props.items;
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
        
        return filteredCount.toString();
      }
      return '0';
    } catch (e) {
      console.warn('Error counting items:', e);
      return '0';
    }
  }, [children, searchTerm, complexityFilter]);

  return (
    <DetailPanel>
      <ActionButton 
        onClick={onChange}
        style={{ 
          width: '100%', 
          textAlign: 'left',
          justifyContent: 'space-between',
          padding: 'var(--space-xl) 0',
          border: 'none',
          background: 'transparent'
        }}
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
      >
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-md)',
          fontFamily: 'var(--font-main)',
          fontSize: 'var(--text-lg)',
          fontWeight: '500',
          color: 'var(--gray-900)'
        }}>
          {title}
          <span style={{
            fontFamily: 'var(--font-main)',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--primary)'
          }}>
            {itemCount} items
          </span>
        </span>
        <span style={{ 
          fontFamily: 'var(--font-main)',
          fontSize: 'var(--text-lg)',
          fontWeight: '400',
          color: 'var(--primary)'
        }}>
          {expanded ? '−' : '+'}
        </span>
      </ActionButton>
      {expanded && (
        <div 
          id={`${id}-content`}
          aria-labelledby={`${id}-header`}
          role="region"
          style={{ paddingTop: 'var(--space-lg)' }}
        >
          {children}
        </div>
      )}
    </DetailPanel>
  );
});





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
        <CleanHeadingS>Approximate Match</CleanHeadingS>
        <CleanBodyS>
          We don't have exact data for your <strong>{vehicleIdentification.make} {vehicleIdentification.model}{requestedYear}</strong>. 
          The times shown are based on <strong>{vehicleIdentification.matchedTo.make} {vehicleIdentification.matchedTo.model}{matchedYearInfo}</strong>, 
          which is the closest match to your vehicle.
        </CleanBodyS>
      </div>
    </WarningPanel>
  );
};

/**
 * Loading State Component - Following pattern from bulletins component
 */
const LoadingState = ({ vehicleMake, vehicleModel }) => (
  <LabourTimesContainer>
    <EnhancedLoadingContainer>
      <CleanLoadingSpinner />
      <InsightBody>Loading repair times data...</InsightBody>
      <CleanBodyS style={{ color: 'var(--gray-500)' }}>
        Please wait while we compile repair times for {vehicleMake} {vehicleModel}
      </CleanBodyS>
    </EnhancedLoadingContainer>
  </LabourTimesContainer>
);

/**
 * Error State Component - Following pattern from bulletins component
 */
const ErrorState = ({ error, onRetry }) => (
  <LabourTimesContainer>
    <EmptyStateContainer>
      <WarningIcon sx={{ fontSize: 40, color: 'var(--negative)', marginBottom: 'var(--space-md)' }} />
      <InsightBody>
        <ValueHighlight color="var(--negative)">Error Loading Repair Times:</ValueHighlight> {error}
      </InsightBody>
      <ActionButton className="primary" onClick={onRetry}>
        Try again
      </ActionButton>
    </EmptyStateContainer>
  </LabourTimesContainer>
);

/**
 * Empty State Component - Following pattern from bulletins component
 */
const EmptyState = ({ vehicleMake, vehicleModel }) => (
  <LabourTimesContainer>
    <EmptyStateContainer>
      <InfoIcon sx={{ fontSize: 40, color: 'var(--primary)', marginBottom: 'var(--space-md)' }} />
      <InsightBody>
        No repair times data available for {vehicleMake} {vehicleModel}
      </InsightBody>
      <CleanBodyS style={{ color: 'var(--gray-500)' }}>
        This could be because the vehicle is too new, too old, or a rare model.
      </CleanBodyS>
    </EmptyStateContainer>
  </LabourTimesContainer>
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
  const handleTabChange = useCallback((event, newValue) => {
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
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleComplexityFilter = useCallback((complexity) => {
    setComplexityFilter(complexity);
  }, []);

  const handleSortChange = useCallback((sortType) => {
    setSortBy(sortType);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setComplexityFilter('all');
    setSortBy('complexity');
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
    <LabourTimesContainer>
      <InsightsContainer>
        <LabourTimesPanel>
          <HeadingWithTooltip iconColor="var(--primary)">
            <CleanHeadingM>Repair Times for {displayMake} {displayModel}{yearRangeDisplay}</CleanHeadingM>
          </HeadingWithTooltip>

          <InsightBody>
            Professional repair time estimates to help you plan service work for your {displayMake} {displayModel}.
          </InsightBody>

          {/* Match warning - using shared component */}
          <MatchWarning 
            matchConfidence={matchConfidence} 
            vehicleIdentification={vehicleIdentification}
            vehicleData={vehicleData}
          />

          {/* Important notice - clean design system */}
          <InsightNote>
            <CleanHeadingS>Important</CleanHeadingS>
            <CleanBody>
              These repair times are industry estimates. Actual times may vary based on vehicle condition, workshop equipment, and technician experience. Always consult with a qualified professional.
            </CleanBody>
          </InsightNote>

          {/* Vehicle summary - clean design system */}
          {vehicleSummary && (
            <DetailPanel color="var(--primary)">
              <CleanHeadingS>Repair Overview</CleanHeadingS>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 'var(--space-lg)',
                marginTop: 'var(--space-md)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary)' }}>
                    {vehicleSummary.totalOperations}
                  </div>
                  <CleanBodyS>Total Operations</CleanBodyS>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary)' }}>
                    {vehicleSummary.avgTime}
                  </div>
                  <CleanBodyS>Average Time</CleanBodyS>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--gray-900)' }}>
                    {vehicleSummary.mostComplexSystem}
                  </div>
                  <CleanBodyS>Most Common</CleanBodyS>
                </div>
              </div>
            </DetailPanel>
          )}


          {/* Search and Filter Controls */}
          <SearchContainer>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flex: 1 }}>
              <SearchIcon style={{ color: 'var(--gray-500)' }} />
              <SearchInput
                type="text"
                placeholder="Search repair operations..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <ActionButton onClick={() => setSearchTerm('')}>
                  <ClearIcon style={{ fontSize: 'var(--text-sm)' }} />
                </ActionButton>
              )}
            </div>
          </SearchContainer>

          {/* Filter and Sort Controls */}
          <FilterContainer>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <FilterListIcon style={{ color: 'var(--gray-500)', fontSize: 'var(--text-lg)' }} />
                <CleanBodyS style={{ margin: 0, color: 'var(--gray-700)' }}>Filter:</CleanBodyS>
              </div>
              
              <FilterButton 
                active={complexityFilter === 'all'} 
                onClick={() => handleComplexityFilter('all')}
              >
                All
              </FilterButton>
              <FilterButton 
                active={complexityFilter === 'low'} 
                onClick={() => handleComplexityFilter('low')}
                style={{ color: complexityFilter === 'low' ? 'var(--positive)' : 'var(--gray-600)' }}
              >
                Low
              </FilterButton>
              <FilterButton 
                active={complexityFilter === 'medium'} 
                onClick={() => handleComplexityFilter('medium')}
                style={{ color: complexityFilter === 'medium' ? 'var(--warning)' : 'var(--gray-600)' }}
              >
                Medium
              </FilterButton>
              <FilterButton 
                active={complexityFilter === 'high'} 
                onClick={() => handleComplexityFilter('high')}
                style={{ color: complexityFilter === 'high' ? 'var(--negative)' : 'var(--gray-600)' }}
              >
                High
              </FilterButton>
            </div>
            
            <SortContainer>
              <CleanBodyS style={{ margin: 0, color: 'var(--gray-700)' }}>Sort by:</CleanBodyS>
              <SortButton active={sortBy === 'complexity'} onClick={() => handleSortChange('complexity')}>Complexity</SortButton>
              <SortButton active={sortBy === 'time'} onClick={() => handleSortChange('time')}>Time</SortButton>
              <SortButton active={sortBy === 'alphabetical'} onClick={() => handleSortChange('alphabetical')}>A-Z</SortButton>
            </SortContainer>
            
            {(searchTerm || complexityFilter !== 'all' || sortBy !== 'complexity') && (
              <ActionButton onClick={clearAllFilters} style={{ marginLeft: 'auto' }}>
                Clear Filters
              </ActionButton>
            )}
          </FilterContainer>

          {/* Tabs - clean design system */}
          <TabsContainer>
            <TabsList>
              {tabs.map((tab, index) => (
                <TabButton
                  key={index}
                  active={tabValue === index}
                  onClick={() => handleTabChange(null, index)}
                >
                  {tab.label}
                </TabButton>
              ))}
            </TabsList>
          </TabsContainer>

          {/* Tab content - clean design system */}
          {tabs.map((tab, tabIndex) => (
            <TabContent key={tabIndex} active={tabValue === tabIndex}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-xl)',
                paddingBottom: 'var(--space-lg)',
                borderBottom: `2px solid ${tab.color}`
              }}>
                <div>
                  <CleanHeadingM style={{ margin: 0 }}>{tab.label}</CleanHeadingM>
                  <CleanBodyS style={{ margin: 0, marginTop: 'var(--space-xs)' }}>
                    Standard repair times for {tab.label.toLowerCase()} operations
                  </CleanBodyS>
                </div>
              </div>
              
              {tab.sections.map((section, sectionIndex) => {
                const sectionId = `${tabIndex}-${sectionIndex}`;
                const isExpanded = !!expandedSections[sectionId];
                
                return (
                  <CleanAccordion
                    key={sectionId}
                    id={`section-${sectionId}`}
                    title={section.title}
                    expanded={isExpanded}
                    onChange={() => toggleSection(sectionId)}
                    searchTerm={searchTerm}
                    complexityFilter={complexityFilter}
                  >
                    {section.content}
                  </CleanAccordion>
                );
              })}
            </TabContent>
          ))}

          {/* Footer note - following GOV.UK pattern */}
          <StyledFooterNote>
            Repair times sourced from industry standard databases. Last updated: {lastUpdated}
          </StyledFooterNote>
        </LabourTimesPanel>
      </InsightsContainer>
    </LabourTimesContainer>
  );
};

export default memo(VehicleRepairTimesComponent);