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

// GDS-aligned Visual Tech Specs Styled Components
const VisualSpecsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  minHeight: '600px'
}));

const SpecCategoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '30px',
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
  flexShrink: 0
}));

const SpecGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '40px',
  
  [`@media (max-width: ${BREAKPOINTS.tablet})`]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '15px'
  },
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    gridTemplateColumns: '1fr',
    gap: '15px'
  }
}));

const VisualSpecCard = styled(Box)(({ variant = 'default' }) => ({
  backgroundColor: COLORS.WHITE,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  padding: '24px',
  position: 'relative',
  transition: 'all 0.2s ease',
  
  ...(variant === 'gauge' && {
    textAlign: 'center',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }),
  
  ...(variant === 'bar' && {
    minHeight: '160px'
  }),
  
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
    backgroundColor: COLORS.BLUE,
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },
  
  '&:hover:before': {
    opacity: 1
  }
}));

const SpecCardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px'
}));

const SpecCardTitle = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 700,
  color: COLORS.DARK_GREY,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  lineHeight: 1.4,
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

const SpecCardIcon = styled(Box)(({ color }) => ({
  width: '30px',
  height: '30px',
  backgroundColor: color || COLORS.BLUE,
  color: COLORS.WHITE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 700,
  flexShrink: 0
}));

const SpecValue = styled(Box)(({ size = 'large' }) => ({
  fontSize: size === 'large' ? '36px' : size === 'medium' ? '27px' : '19px',
  fontWeight: 700,
  color: COLORS.BLACK,
  lineHeight: 1.1,
  marginBottom: '8px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    fontSize: size === 'large' ? '27px' : size === 'medium' ? '24px' : '16px'
  }
}));

const SpecUnit = styled('span')(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 400,
  color: COLORS.DARK_GREY,
  marginLeft: '8px',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

const SpecSubtext = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  color: COLORS.DARK_GREY,
  marginTop: '4px',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

// GDS-aligned gauge component
const GaugeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '120px',
  height: '120px',
  margin: '0 auto 16px'
}));

const GaugeSvg = styled('svg')(({ theme }) => ({
  transform: 'rotate(-90deg)'
}));

const GaugeTrack = styled('circle')(({ theme }) => ({
  fill: 'none',
  stroke: COLORS.MID_GREY,
  strokeWidth: '10'
}));

const GaugeFill = styled('circle')(({ color }) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: '10',
  strokeLinecap: 'square',
  transition: 'stroke-dashoffset 0.5s ease'
}));

const GaugeCenterText = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center'
}));

// GDS-aligned progress bar component
const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: '16px'
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '20px',
  backgroundColor: COLORS.LIGHT_GREY,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  position: 'relative'
}));

const ProgressFill = styled(Box)(({ color, width }) => ({
  height: '100%',
  width: `${width}%`,
  backgroundColor: color || COLORS.BLUE,
  transition: 'width 0.5s ease',
  position: 'relative'
}));

const ProgressLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '16px',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

// Icon grid for multiple values
const IconGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px',
  marginTop: '16px'
}));

const IconItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const IconIndicator = styled(Box)(({ color }) => ({
  width: '24px',
  height: '24px',
  backgroundColor: color || COLORS.BLUE,
  color: COLORS.WHITE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 600
}));

// GDS-aligned status indicator
const StatusBadge = styled('strong')(({ status }) => ({
  display: 'inline-block',
  padding: '5px 10px 4px',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontFamily: '"GDS Transport", arial, sans-serif',
  backgroundColor: 
    status === 'good' ? COLORS.GREEN :
    status === 'warning' ? COLORS.ORANGE :
    status === 'critical' ? COLORS.RED :
    COLORS.BLUE,
  color: COLORS.WHITE
}));

// Visual divider
const VisualDivider = styled(Box)(({ theme }) => ({
  height: '3px',
  backgroundColor: COLORS.BORDER_COLOUR,
  margin: '40px 0'
}));

// GDS-aligned tabs
const VisualTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `2px solid ${COLORS.BORDER_COLOUR}`,
  marginBottom: '40px',
  
  '& .MuiTabs-indicator': {
    height: '5px',
    backgroundColor: COLORS.BLUE
  }
}));

const VisualTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '19px',
  color: COLORS.BLACK,
  padding: '20px 20px',
  minHeight: '60px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  '&.Mui-selected': {
    color: COLORS.BLUE,
    backgroundColor: COLORS.LIGHT_GREY
  },
  
  '&:hover': {
    color: COLORS.BLUE,
    backgroundColor: COLORS.LIGHT_GREY
  },
  
  '&:focus': {
    outline: `3px solid ${COLORS.FOCUS}`,
    outlineOffset: 0
  }
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
    pressure: COLORS.BLUE,
    temperature: COLORS.RED,
    volume: COLORS.GREEN,
    torque: COLORS.PURPLE,
    electrical: COLORS.ORANGE,
    time: COLORS.PINK,
    distance: COLORS.DARK_BLUE,
    speed: COLORS.BRIGHT_PURPLE,
    default: COLORS.DARK_GREY
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
    'Engine Details': COLORS.BLUE,
    'Service Information': COLORS.GREEN,
    'Torque Specifications': COLORS.PURPLE,
    'Brakes & A/C': COLORS.ORANGE
  };
  return colors[category] || COLORS.DARK_GREY;
};

// Gauge component
const Gauge = ({ value, max, unit, label, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <Box>
      <GaugeContainer>
        <GaugeSvg width="120" height="120" viewBox="0 0 120 120">
          <GaugeTrack
            cx="60"
            cy="60"
            r="50"
          />
          <GaugeFill
            cx="60"
            cy="60"
            r="50"
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
    </Box>
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
            <VisualSpecCard key={index} variant="gauge">
              <Gauge
                value={numericValue}
                max={maxValue}
                unit={unit}
                label={label}
                color={color}
              />
            </VisualSpecCard>
          );
        }
        
        // Render progress bar for percentage or range values
        if (hasNumericValue && (unit === '%' || label.toLowerCase().includes('range'))) {
          return (
            <VisualSpecCard key={index} variant="bar">
              <SpecCardHeader>
                <SpecCardTitle>{label}</SpecCardTitle>
                <SpecCardIcon color={color}>{icon}</SpecCardIcon>
              </SpecCardHeader>
              <ProgressContainer>
                <ProgressLabel>
                  <span style={{ fontWeight: 700 }}>{value} {unit}</span>
                  <StatusBadge status={numericValue > 70 ? 'good' : numericValue > 40 ? 'warning' : 'critical'}>
                    {numericValue > 70 ? 'Optimal' : numericValue > 40 ? 'Acceptable' : 'Low'}
                  </StatusBadge>
                </ProgressLabel>
                <ProgressBar>
                  <ProgressFill color={color} width={numericValue} />
                </ProgressBar>
              </ProgressContainer>
            </VisualSpecCard>
          );
        }
        
        // Default card layout
        return (
          <VisualSpecCard key={index}>
            <SpecCardHeader>
              <SpecCardTitle>{label}</SpecCardTitle>
              <SpecCardIcon color={color}>{icon}</SpecCardIcon>
            </SpecCardHeader>
            <SpecValue size={variant === 'compact' ? 'medium' : 'large'}>
              {value}
              {unit && <SpecUnit>{unit}</SpecUnit>}
            </SpecValue>
            {sectionTitle === 'Lubricants & Capacities' && (
              <Box mt={2}>
                <StatusBadge status="good">Recommended</StatusBadge>
              </Box>
            )}
          </VisualSpecCard>
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
    } catch (e) {
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

// Important panels
const WarningPanel = styled(InsightNote)(() => ({
  backgroundColor: '#fff7ed',
  borderColor: COLORS.ORANGE,
  marginBottom: '20px',
  padding: '20px',
  borderLeftWidth: '10px',
  position: 'relative',
  
  '&:before': {
    content: '"!"',
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '30px',
    height: '30px',
    backgroundColor: COLORS.ORANGE,
    color: COLORS.WHITE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '19px'
  },
  
  '& > *': {
    paddingLeft: '40px'
  }
}));

const NoticePanel = styled(InsightNote)(() => ({
  backgroundColor: COLORS.LIGHT_GREY,
  borderColor: COLORS.BLUE,
  marginBottom: '20px',
  padding: '15px',
  borderLeftWidth: '10px'
}));

const FuelTypeBadge = styled('strong')(({ theme }) => ({
  display: 'inline-block',
  backgroundColor: COLORS.BLUE,
  color: COLORS.WHITE,
  padding: '5px 10px 4px',
  fontWeight: 700,
  fontSize: '14px',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontFamily: '"GDS Transport", arial, sans-serif',
  marginTop: '10px',
  marginBottom: '15px'
}));

// Tab Panel function component
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`specs-tabpanel-${index}`}
      aria-labelledby={`specs-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </Box>
  );
}

// Tab props accessor function
function a11yProps(index) {
  return {
    id: `specs-tab-${index}`,
    'aria-controls': `specs-tabpanel-${index}`,
  };
}

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
        content: renderVisualSpecs(engineDetails, "Vehicle Identification")
      });
    }
    
    const injectionSpecs = safeGet(techSpecsData, 'injectionSystem.specifications', []) || 
                          safeGet(techSpecsData, 'injectionSystem.details', []);
    
    if (Array.isArray(injectionSpecs) && injectionSpecs.length > 0) {
      engineSections.push({
        title: "Injection System",
        icon: getCategoryIcon("Injection System"),
        content: renderVisualSpecs(injectionSpecs, "Injection System")
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
          content: renderVisualSpecs(specs, section.title)
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
        content: renderVisualSpecs(serviceChecksSpecs, "Service Checks & Adjustments")
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
        content: (
          <>
            {hasEngineOilOptions && (
              <>
                <GovUKHeadingS style={{ marginBottom: '20px' }}>
                  Engine Oil Options
                </GovUKHeadingS>
                {renderVisualSpecs(engineOilOptions, "Lubricants & Capacities")}
              </>
            )}
            
            {hasLubricantSpecs && (
              <>
                {hasEngineOilOptions && <VisualDivider />}
                <GovUKHeadingS style={{ marginBottom: '20px' }}>
                  Other Lubricants & Capacities
                </GovUKHeadingS>
                {renderVisualSpecs(lubricantSpecs, "Lubricants & Capacities")}
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
              <InsightBody style={{ marginBottom: '20px' }}>
                {headInstructions.map((instruction, index) => (
                  <p key={`instr-${index}`}>{instruction}</p>
                ))}
              </InsightBody>
              
              {hasTorqueSequence && (
                <VisualSpecCard>
                  <GovUKHeadingS>Tightening sequence</GovUKHeadingS>
                  <ol className="govuk-list govuk-list--number">
                    {headTorques.map((step, index) => (
                      <li key={`step-${index}`}>{step}</li>
                    ))}
                  </ol>
                </VisualSpecCard>
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

  // Error state
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

  // No data state
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
    <GovUKContainer>
      <InsightsContainer>
        <InsightPanel>
          <HeadingWithTooltip 
            tooltip="Technical specifications for your vehicle, based on manufacturer data"
            iconColor={COLORS.BLUE}
          >
            <GovUKHeadingM>Technical Specifications for {displayMake} {displayModel}</GovUKHeadingM>
          </HeadingWithTooltip>
          
          <InsightBody>
            These specifications provide detailed technical information for servicing and maintaining your vehicle.
          </InsightBody>
          
          {MatchWarning}
          
          <WarningPanel>
            <GovUKHeadingS>Important</GovUKHeadingS>
            <GovUKBody>
              These specifications are for reference only. Always consult the manufacturer's documentation for definitive technical information.
            </GovUKBody>
          </WarningPanel>
          
          {displayFuelType && displayFuelType !== 'unknown' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: 2, marginBottom: 2 }}>
              <FuelTypeBadge>
                {displayFuelType.charAt(0).toUpperCase() + displayFuelType.slice(1)} Engine
              </FuelTypeBadge>
            </Box>
          )}
        </InsightPanel>
        
        <VisualSpecsContainer>
          {hasTabs ? (
            <>
              <VisualTabs 
                value={tabValue < tabs.length ? tabValue : 0}
                onChange={handleTabChange} 
                aria-label="technical specifications tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabs.map((tab, index) => (
                  <VisualTab 
                    key={`tab-${index}`}
                    label={tab.label}
                    {...a11yProps(index)} 
                  />
                ))}
              </VisualTabs>
              
              {tabs.map((tab, tabIndex) => (
                <CustomTabPanel key={`panel-${tabIndex}`} value={tabValue} index={tabIndex}>
                  {tab.sections.map((section, sectionIndex) => {
                    const isLastSection = sectionIndex === tab.sections.length - 1;
                    
                    return (
                      <Box key={`section-${tabIndex}-${sectionIndex}`}>
                        <SpecCategoryHeader>
                          <CategoryIcon color={tab.color}>
                            {section.icon}
                          </CategoryIcon>
                          <Box>
                            <GovUKHeadingM style={{ margin: 0 }}>{section.title}</GovUKHeadingM>
                            <GovUKBodyS style={{ margin: 0, marginTop: '4px' }}>
                              Technical specifications and measurements
                            </GovUKBodyS>
                          </Box>
                        </SpecCategoryHeader>
                        {section.content}
                        {!isLastSection && <VisualDivider />}
                      </Box>
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
          
          <NoticePanel>
            <GovUKBodyS>
              Technical specifications sourced from industry standard databases.
              <br />
              Last updated: {lastUpdated}
            </GovUKBodyS>
          </NoticePanel>
        </VisualSpecsContainer>
      </InsightsContainer>
    </GovUKContainer>
  );
};

export default React.memo(TechnicalSpecificationsPage);