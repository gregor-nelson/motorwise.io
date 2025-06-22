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
  BREAKPOINTS,
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
  
  // Tab components
  StyledTabs,
  StyledTab,
  TabPanel,
  
  // Message components
  WarningPanel,
  StyledFooterNote,
} from './styles/style';

// Import Material-UI components (minimal usage)
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// Import Material-UI icons (reduced usage)
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

// Import RepairCalculator component
import RepairCalculator from './RepairTimes/RateCalc';

// Import API client
import repairTimesApi from './api/RepairTimesApiClient';

// Visual Repair Times Styled Components
const VisualRepairContainer = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  minHeight: '600px'
}));

// Enhanced Summary Panel
const VisualSummaryPanel = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.LIGHT_GREY,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  padding: '30px',
  marginBottom: '30px',
  
  '& dl': {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    margin: 0,
    
    [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
      gridTemplateColumns: '1fr'
    }
  },
  
  '& div': {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: COLORS.WHITE,
    border: `1px solid ${COLORS.BORDER_COLOUR}`,
    
    '&:hover': {
      boxShadow: '0 2px 0 0 rgba(0,0,0,0.1)',
      borderColor: COLORS.BLACK
    }
  },
  
  '& dt': {
    fontSize: '14px',
    fontWeight: 700,
    color: COLORS.DARK_GREY,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '10px',
    fontFamily: '"GDS Transport", arial, sans-serif'
  },
  
  '& dd': {
    margin: 0,
    fontSize: '36px',
    fontWeight: 700,
    color: COLORS.BLACK,
    fontFamily: '"GDS Transport", arial, sans-serif',
    
    [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
      fontSize: '27px'
    }
  }
}));

// Visual Accordion Components
const VisualAccordionSection = styled(Box)(({ theme }) => ({
  marginBottom: '20px',
  backgroundColor: COLORS.WHITE,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  
  '&:hover': {
    borderColor: COLORS.BLACK
  }
}));

const VisualAccordionHeader = styled('button')(({ expanded }) => ({
  width: '100%',
  padding: '20px',
  border: 'none',
  backgroundColor: expanded ? COLORS.LIGHT_GREY : COLORS.WHITE,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '19px',
  fontWeight: 700,
  fontFamily: '"GDS Transport", arial, sans-serif',
  textAlign: 'left',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: COLORS.LIGHT_GREY
  },
  
  '&:focus': {
    outline: `3px solid ${COLORS.FOCUS}`,
    outlineOffset: 0
  }
}));

const VisualAccordionContent = styled(Box)(({ theme }) => ({
  padding: '20px',
  borderTop: `1px solid ${COLORS.BORDER_COLOUR}`
}));

const OperationCountBadge = styled('span')(({ theme }) => ({
  display: 'inline-block',
  minWidth: '30px',
  padding: '2px 8px',
  marginLeft: '10px',
  backgroundColor: COLORS.BLUE,
  color: COLORS.WHITE,
  fontSize: '14px',
  fontWeight: 700,
  textAlign: 'center',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

const AccordionIconWrapper = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: COLORS.BLUE
}));

const GovUKChevron = styled('svg')(({ expanded }) => ({
  width: '24px',
  height: '24px',
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.2s ease',
  fill: 'currentColor'
}));

const GovUKToggleText = styled('span')(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 400,
  color: COLORS.BLUE,
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

// Visual Repair Operation Components
const RepairOperationGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  
  [`@media (max-width: ${BREAKPOINTS.tablet})`]: {
    gridTemplateColumns: '1fr',
    gap: '15px'
  }
}));

const RepairOperationCard = styled(Box)(({ complexity }) => ({
  backgroundColor: COLORS.WHITE,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  padding: '20px',
  position: 'relative',
  
  '&:hover': {
    boxShadow: '0 2px 0 0 rgba(0,0,0,0.1)',
    borderColor: COLORS.BLACK
  },
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '5px',
    backgroundColor: 
      complexity === 'high' ? COLORS.RED :
      complexity === 'medium' ? COLORS.ORANGE :
      complexity === 'low' ? COLORS.GREEN :
      COLORS.BLUE
  }
}));

const OperationTitle = styled(Box)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 700,
  color: COLORS.BLACK,
  marginBottom: '15px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  lineHeight: 1.4
}));

const TimeDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: '10px',
  marginBottom: '10px'
}));

const TimeValue = styled(Box)(({ size = 'large' }) => ({
  fontSize: size === 'large' ? '48px' : '36px',
  fontWeight: 700,
  color: COLORS.BLACK,
  lineHeight: 1,
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    fontSize: size === 'large' ? '36px' : '27px'
  }
}));

const TimeUnit = styled('span')(({ theme }) => ({
  fontSize: '19px',
  fontWeight: 400,
  color: COLORS.DARK_GREY,
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

const ComplexityIndicator = styled(Box)(({ complexity }) => ({
  display: 'inline-block',
  padding: '5px 10px 4px',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontFamily: '"GDS Transport", arial, sans-serif',
  backgroundColor: 
    complexity === 'high' ? COLORS.RED :
    complexity === 'medium' ? COLORS.ORANGE :
    complexity === 'low' ? COLORS.GREEN :
    COLORS.BLUE,
  color: COLORS.WHITE
}));

const OperationsGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
}));

const OperationItem = styled(Box)(({ theme }) => ({
  padding: '10px 0',
  borderBottom: `1px solid ${COLORS.LIGHT_GREY}`,
  fontSize: '16px',
  color: COLORS.BLACK,
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  '&:last-child': {
    borderBottom: 'none'
  },
  
  '&.first-operation': {
    fontWeight: 700
  }
}));

// Time Range Visual
const TimeRangeBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '30px',
  backgroundColor: COLORS.LIGHT_GREY,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  position: 'relative',
  marginTop: '15px'
}));

const TimeRangeFill = styled(Box)(({ percentage, complexity }) => ({
  height: '100%',
  width: `${percentage}%`,
  backgroundColor: 
    complexity === 'high' ? COLORS.RED :
    complexity === 'medium' ? COLORS.ORANGE :
    complexity === 'low' ? COLORS.GREEN :
    COLORS.BLUE,
  transition: 'width 0.5s ease'
}));

const TimeRangeLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '5px',
  fontSize: '14px',
  color: COLORS.DARK_GREY,
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

// Category Header
const CategoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '20px',
  padding: '20px',
  backgroundColor: COLORS.WHITE,
  borderLeft: `10px solid ${COLORS.BLUE}`,
  borderBottom: `1px solid ${COLORS.MID_GREY}`
}));

const CategoryIcon = styled(Box)(({ color }) => ({
  width: '48px',
  height: '48px',
  backgroundColor: color || COLORS.BLUE,
  color: COLORS.WHITE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 700,
  flexShrink: 0,
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

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

// Utility functions (keep existing)
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

// Helper function to determine operation complexity
const getOperationComplexity = (time) => {
  const hours = parseFloat(time);
  if (isNaN(hours)) return 'low';
  
  if (hours >= 4) return 'high';
  if (hours >= 2) return 'medium';
  return 'low';
};

// Visual SpecTable component
const VisualSpecTable = memo(({ items }) => {
  if (!items || items.length === 0) return null;
  
  const processedItems = [];
  
  items.forEach((item, index) => {
    const operations = parseRepairOperations(item.label);
    
    if (!operations || operations.length === 0) return;
    
    const complexity = getOperationComplexity(item.value);
    
    processedItems.push({
      id: `item-${index}`,
      operations: operations,
      value: item.value,
      unit: item.unit,
      isMultiOperation: operations.length > 1,
      complexity: complexity
    });
  });
  
  // Sort by complexity (high to low) and then by time
  processedItems.sort((a, b) => {
    const complexityOrder = { high: 3, medium: 2, low: 1 };
    const complexityDiff = complexityOrder[b.complexity] - complexityOrder[a.complexity];
    if (complexityDiff !== 0) return complexityDiff;
    
    const aTime = parseFloat(a.value) || 0;
    const bTime = parseFloat(b.value) || 0;
    return bTime - aTime;
  });
  
  return (
    <RepairOperationGrid>
      {processedItems.map((item) => {
        const hours = parseFloat(item.value) || 0;
        const maxHours = 8; // Maximum expected hours for visualization
        const percentage = Math.min((hours / maxHours) * 100, 100);
        
        return (
          <RepairOperationCard key={item.id} complexity={item.complexity}>
            <OperationTitle>
              {item.isMultiOperation ? (
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
              ) : (
                item.operations[0]
              )}
            </OperationTitle>
            
            <TimeDisplay>
              <TimeValue>{formatValue(item.value)}</TimeValue>
              <TimeUnit>{item.unit || 'hours'}</TimeUnit>
            </TimeDisplay>
            
            <ComplexityIndicator complexity={item.complexity}>
              {item.complexity} complexity
            </ComplexityIndicator>
            
            <TimeRangeBar>
              <TimeRangeFill percentage={percentage} complexity={item.complexity} />
            </TimeRangeBar>
            <TimeRangeLabel>
              <span>0 hours</span>
              <span>{maxHours} hours</span>
            </TimeRangeLabel>
          </RepairOperationCard>
        );
      })}
    </RepairOperationGrid>
  );
});

// Visual Accordion component
const VisualAccordion = memo(({ title, children, expanded, onChange, id }) => {
  const itemCount = useMemo(() => {
    try {
      const specTable = React.Children.toArray(children)
        .find(child => child && child.type === VisualSpecTable);
      
      if (specTable && specTable.props && specTable.props.items) {
        return specTable.props.items.length || '0';
      }
      
      return '0';
    } catch (e) {
      console.warn('Error counting items:', e);
      return '0';
    }
  }, [children]);

  return (
    <VisualAccordionSection>
      <VisualAccordionHeader 
        onClick={onChange}
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
        expanded={expanded}
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
      </VisualAccordionHeader>
      {expanded && (
        <VisualAccordionContent 
          id={`${id}-content`}
          aria-labelledby={`${id}-header`}
          role="region"
        >
          {children}
        </VisualAccordionContent>
      )}
    </VisualAccordionSection>
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

// Helper function to get category icons
const getCategoryIcon = (category) => {
  const icons = {
    'Engine': 'E',
    'Fuel & Cooling': 'F',
    'Transmission & Drive': 'T',
    'Suspension & Brakes': 'B',
    'Electrical & Body': 'E'
  };
  return icons[category] || '?';
};

// Helper function to get category colors
const getCategoryColor = (category) => {
  const colors = {
    'Engine': COLORS.BLUE,
    'Fuel & Cooling': COLORS.GREEN,
    'Transmission & Drive': COLORS.PURPLE,
    'Suspension & Brakes': COLORS.ORANGE,
    'Electrical & Body': COLORS.DARK_BLUE
  };
  return colors[category] || COLORS.DARK_GREY;
};

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
        icon: getCategoryIcon("Engine"),
        color: getCategoryColor("Engine"),
        sections: [
          { title: "Engine Assembly", content: repairData.engineData?.engineAssembly?.details && <VisualSpecTable items={repairData.engineData.engineAssembly.details} /> },
          { title: "Cylinder Head", content: repairData.engineData?.cylinderHead?.details && <VisualSpecTable items={repairData.engineData.cylinderHead.details} /> },
          { title: "Camshaft & Drive Gear", content: repairData.engineData?.camshaftDrive?.details && <VisualSpecTable items={repairData.engineData.camshaftDrive.details} /> },
          { title: "Crankshaft & Pistons", content: repairData.engineData?.crankshaft?.details && <VisualSpecTable items={repairData.engineData.crankshaft.details} /> },
          { title: "Lubrication", content: repairData.engineData?.lubrication?.details && <VisualSpecTable items={repairData.engineData.lubrication.details} /> },
          { title: "Auxiliary Drive", content: repairData.engineData?.auxiliaryDrive?.details && <VisualSpecTable items={repairData.engineData.auxiliaryDrive.details} /> },
        ].filter(section => section.content)
      },
      {
        label: "Fuel & Cooling",
        icon: getCategoryIcon("Fuel & Cooling"),
        color: getCategoryColor("Fuel & Cooling"),
        sections: [
          { title: "Air Filter & Manifolds", content: repairData.fuelManagement?.airFilter?.details && <VisualSpecTable items={repairData.fuelManagement.airFilter.details} /> },
          { title: "Throttle Controls", content: repairData.fuelManagement?.throttleControls?.details && <VisualSpecTable items={repairData.fuelManagement.throttleControls.details} /> },
          { title: "Diesel Injection System", content: repairData.fuelManagement?.dieselInjection?.details && <VisualSpecTable items={repairData.fuelManagement.dieselInjection.details} /> },
          { title: "Fuel Supply", content: repairData.fuelManagement?.fuelSupply?.details && <VisualSpecTable items={repairData.fuelManagement.fuelSupply.details} /> },
          { title: "Turbocharger", content: repairData.fuelManagement?.turbocharger?.details && <VisualSpecTable items={repairData.fuelManagement.turbocharger.details} /> },
          { title: "Radiator & Cooling", content: repairData.cooling?.radiator?.details && <VisualSpecTable items={repairData.cooling.radiator.details} /> },
          { title: "Pump & Drive", content: repairData.cooling?.pumpDrive?.details && <VisualSpecTable items={repairData.cooling.pumpDrive.details} /> },
          { title: "Header Tank & Hoses", content: repairData.cooling?.headerTank?.details && <VisualSpecTable items={repairData.cooling.headerTank.details} /> },
          { title: "Exhaust Manifold & Pipes", content: repairData.exhaust?.manifold?.details && <VisualSpecTable items={repairData.exhaust.manifold.details} /> },
          { title: "Exhaust Gas Aftertreatment", content: repairData.exhaust?.exhaustGas?.details && <VisualSpecTable items={repairData.exhaust.exhaustGas.details} /> },
        ].filter(section => section.content)
      },
      {
        label: "Transmission & Drive",
        icon: getCategoryIcon("Transmission & Drive"),
        color: getCategoryColor("Transmission & Drive"),
        sections: [
          { title: "Clutch Pedal & Hydraulics", content: repairData.drivetrain?.clutchControls?.details && <VisualSpecTable items={repairData.drivetrain.clutchControls.details} /> },
          { title: "Clutch Unit & Flywheel", content: repairData.drivetrain?.clutchUnit?.details && <VisualSpecTable items={repairData.drivetrain.clutchUnit.details} /> },
          { title: "Manual Transmission", content: repairData.drivetrain?.manualTransmission?.details && <VisualSpecTable items={repairData.drivetrain.manualTransmission.details} /> },
          { title: "Final Drive, Shaft & Axles", content: repairData.drivetrain?.finalDrive?.details && <VisualSpecTable items={repairData.drivetrain.finalDrive.details} /> },
        ].filter(section => section.content)
      },
      {
        label: "Suspension & Brakes",
        icon: getCategoryIcon("Suspension & Brakes"),
        color: getCategoryColor("Suspension & Brakes"),
        sections: [
          { title: "Braking System Hydraulics", content: repairData.brakes?.brakingSystem?.details && <VisualSpecTable items={repairData.brakes.brakingSystem.details} /> },
          { title: "Footbrakes", content: repairData.brakes?.footbrakes?.details && <VisualSpecTable items={repairData.brakes.footbrakes.details} /> },
          { title: "Brake Pedal & Servo", content: repairData.brakes?.brakePedal?.details && <VisualSpecTable items={repairData.brakes.brakePedal.details} /> },
          { title: "ABS or ABS/ESP", content: repairData.brakes?.absSystems?.details && <VisualSpecTable items={repairData.brakes.absSystems.details} /> },
          { title: "Parking Brake", content: repairData.brakes?.parkingBrake?.details && <VisualSpecTable items={repairData.brakes.parkingBrake.details} /> },
        ].filter(section => section.content)
      },
      {
        label: "Electrical & Body",
        icon: getCategoryIcon("Electrical & Body"),
        color: getCategoryColor("Electrical & Body"),
        sections: [
          { title: "Heating & Ventilation", content: repairData.climate?.heating?.details && <VisualSpecTable items={repairData.climate.heating.details} /> },
          { title: "Air Conditioning", content: repairData.climate?.airConditioning?.details && <VisualSpecTable items={repairData.climate.airConditioning.details} /> },
          { title: "Battery & Cables", content: repairData.electrical?.batteryCables?.details && <VisualSpecTable items={repairData.electrical.batteryCables.details} /> },
          { title: "Charging System", content: repairData.electrical?.chargingSystem?.details && <VisualSpecTable items={repairData.electrical.chargingSystem.details} /> },
          { title: "Starting System", content: repairData.electrical?.startingSystem?.details && <VisualSpecTable items={repairData.electrical.startingSystem.details} /> },
          { title: "Bulbs & LEDs", content: repairData.electrical?.bulbsLeds?.details && <VisualSpecTable items={repairData.electrical.bulbsLeds.details} /> },
          { title: "Front Lamps", content: repairData.electrical?.frontLamps?.details && <VisualSpecTable items={repairData.electrical.frontLamps.details} /> },
          { title: "Rear Lamps", content: repairData.electrical?.rearLamps?.details && <VisualSpecTable items={repairData.electrical.rearLamps.details} /> },
          { title: "Interior Lamps", content: repairData.electrical?.interiorLamps?.details && <VisualSpecTable items={repairData.electrical.interiorLamps.details} /> },
          { title: "Switches", content: repairData.electrical?.switches?.details && <VisualSpecTable items={repairData.electrical.switches.details} /> },
          { title: "Instruments", content: repairData.electrical?.instruments?.details && <VisualSpecTable items={repairData.electrical.instruments.details} /> },
          { title: "Sensors & Transmitters", content: repairData.electrical?.sensors?.details && <VisualSpecTable items={repairData.electrical.sensors.details} /> },
          { title: "Fusebox & Relays", content: repairData.electrical?.fuseboxRelays?.details && <VisualSpecTable items={repairData.electrical.fuseboxRelays.details} /> },
          { title: "Motors", content: repairData.electrical?.motors?.details && <VisualSpecTable items={repairData.electrical.motors.details} /> },
          { title: "Control & Audio Units", content: repairData.electrical?.audioUnits?.details && <VisualSpecTable items={repairData.electrical.audioUnits.details} /> },
          { title: "Windscreen Wipers/Washers", content: repairData.electrical?.wipers?.details && <VisualSpecTable items={repairData.electrical.wipers.details} /> },
          { title: "Headlamp Wipers/Washers", content: repairData.electrical?.headlampWipers?.details && <VisualSpecTable items={repairData.electrical.headlampWipers.details} /> },
          { title: "Rear Screen Wipers/Washers", content: repairData.electrical?.rearScreenWipers?.details && <VisualSpecTable items={repairData.electrical.rearScreenWipers.details} /> },
          { title: "Interior/Seats/Seatbelts", content: repairData.body?.interiorSeats?.details && <VisualSpecTable items={repairData.body.interiorSeats.details} /> },
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

          {/* Vehicle summary - enhanced visual style */}
          {vehicleSummary && (
            <VisualSummaryPanel>
              <Box>
                <GovUKHeadingS style={{ marginBottom: '20px' }}>Repair Overview</GovUKHeadingS>
                <dl>
                  <div>
                    <dt>Total Operations</dt>
                    <dd>{vehicleSummary.totalOperations}</dd>
                  </div>
                  <div>
                    <dt>Average Time</dt>
                    <dd>{vehicleSummary.avgTime} <span style={{ fontSize: '16px', fontWeight: 400 }}>hours</span></dd>
                  </div>
                  <div>
                    <dt>Most Complex</dt>
                    <dd>{vehicleSummary.mostComplexSystem}</dd>
                  </div>
                </dl>
              </Box>
            </VisualSummaryPanel>
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
          <VisualRepairContainer>
            {tabs.map((tab, tabIndex) => (
              <CustomTabPanel key={tabIndex} value={tabValue} index={tabIndex}>
                <CategoryHeader>
                  <CategoryIcon color={tab.color}>
                    {tab.icon}
                  </CategoryIcon>
                  <Box>
                    <GovUKHeadingM style={{ margin: 0 }}>{tab.label}</GovUKHeadingM>
                    <GovUKBodyS style={{ margin: 0, marginTop: '4px' }}>
                      Standard repair times for {tab.label.toLowerCase()} operations
                    </GovUKBodyS>
                  </Box>
                </CategoryHeader>
                
                {tab.sections.map((section, sectionIndex) => {
                  const sectionId = `${tabIndex}-${sectionIndex}`;
                  const isExpanded = !!expandedSections[sectionId];
                  
                  return (
                    <VisualAccordion
                      key={sectionId}
                      id={`section-${sectionId}`}
                      title={section.title}
                      expanded={isExpanded}
                      onChange={() => toggleSection(sectionId)}
                    >
                      {section.content}
                    </VisualAccordion>
                  );
                })}
              </CustomTabPanel>
            ))}
          </VisualRepairContainer>

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