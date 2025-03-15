import { styled } from '@mui/material/styles';
import { COLORS } from '../../../../../../styles/theme';

// Base tooltip theme constants with fixed width settings
export const TOOLTIP_CONSTANTS = {
  BORDER_WIDTH: '4px',
  FONT_FAMILY: '"GDS Transport", arial, sans-serif',
  BORDER_RADIUS: '0',
  PADDING: {
    DESKTOP: '15px',
    MOBILE: '12px'
  },
  FONT_SIZE: {
    DESKTOP: '0.9rem',
    MOBILE: '0.8rem',
    TITLE: {
      DESKTOP: '16px',
      MOBILE: '14px'
    },
    SECTION_TITLE: {
      DESKTOP: '14px',
      MOBILE: '13px'
    },
    CONTENT: {
      DESKTOP: '0.9rem',
      MOBILE: '0.8rem'
    },
    NOTE: {
      DESKTOP: '0.85rem',
      MOBILE: '0.8rem'
    },
    BULLET: {
      DESKTOP: '0.85rem',
      MOBILE: '0.8rem'
    }
  },
  WIDTH: {
    MIN: '280px',
    OPTIMAL: '320px',
    MAX_DESKTOP: '350px',
    MAX_MOBILE: 'calc(100vw - 40px)'
  },
  SHADOWS: {
    DEFAULT: '0 2px 4px rgba(0,0,0,0.2)'
  },
  DIVIDER: {
    HEIGHT: '1px',
    MARGIN: '8px 0'
  },
  SPACING: {
    TITLE_MARGIN: '6px',
    ROW_MARGIN: '4px',
    SECTION_MARGIN: '10px'
  },
  GRID: {
    LABEL_WIDTH: '40%',
    VALUE_WIDTH: '60%',
    GAP: '8px'  // Increased from 4px
  }
};

// Tooltip container with fixed width constraints
export const TooltipWrapper = styled('div')({
  position: 'absolute',
  backgroundColor: COLORS.WHITE,
  borderLeft: `${TOOLTIP_CONSTANTS.BORDER_WIDTH} solid ${COLORS.BLUE}`,
  borderRadius: TOOLTIP_CONSTANTS.BORDER_RADIUS,
  padding: TOOLTIP_CONSTANTS.PADDING.DESKTOP,
  boxShadow: TOOLTIP_CONSTANTS.SHADOWS.DEFAULT,
  fontFamily: TOOLTIP_CONSTANTS.FONT_FAMILY,
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.DESKTOP,
  lineHeight: '1.4',
  fontWeight: '400',
  color: COLORS.BLACK,
  width: TOOLTIP_CONSTANTS.WIDTH.OPTIMAL,   // Set a fixed width
  minWidth: TOOLTIP_CONSTANTS.WIDTH.MIN,    // Enforce minimum width
  maxWidth: TOOLTIP_CONSTANTS.WIDTH.MAX_DESKTOP,
  wordBreak: 'break-word',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  '@media (max-width: 641px)': {
    padding: TOOLTIP_CONSTANTS.PADDING.MOBILE,
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.MOBILE,
    width: 'auto',  // Use auto for mobile
    minWidth: TOOLTIP_CONSTANTS.WIDTH.MIN,  // Still maintain minimum
    maxWidth: TOOLTIP_CONSTANTS.WIDTH.MAX_MOBILE
  }
});

// Tooltip title
export const TooltipTitle = styled('div')({
  fontWeight: '700',
  marginBottom: TOOLTIP_CONSTANTS.SPACING.TITLE_MARGIN,
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.TITLE.DESKTOP,
  '@media (max-width: 641px)': {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.TITLE.MOBILE
  }
});

// Tooltip row - fixed to prevent collapsing
export const TooltipRow = styled('div')({
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.DESKTOP,
  marginBottom: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN,
  display: 'grid',
  gridTemplateColumns: `${TOOLTIP_CONSTANTS.GRID.LABEL_WIDTH} ${TOOLTIP_CONSTANTS.GRID.VALUE_WIDTH}`,
  columnGap: TOOLTIP_CONSTANTS.GRID.GAP,
  rowGap: '2px',
  alignItems: 'baseline',
  width: '100%',  // Ensure it takes full width
  '@media (max-width: 641px)': {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.MOBILE
  }
});

// Label and value components with fixed min-width
export const TooltipLabel = styled('span')({
  fontWeight: 'bold',
  minWidth: '100px',  // Ensure minimum width for labels
  paddingRight: '4px'
});

export const TooltipValue = styled('span')({
  textAlign: 'left',
  minWidth: '120px',  // Ensure minimum width for values
  wordWrap: 'break-word'
});

// Section divider
export const TooltipDivider = styled('hr')({
  border: 0,
  height: TOOLTIP_CONSTANTS.DIVIDER.HEIGHT,
  backgroundColor: COLORS.MID_GREY || '#b1b4b6',
  margin: TOOLTIP_CONSTANTS.DIVIDER.MARGIN,
  width: '100%'  // Ensure full width
});

// Warning text
export const TooltipWarningText = styled('div')({
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.DESKTOP,
  color: COLORS.RED,
  fontWeight: '700',
  marginBottom: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN,
  width: '100%',  // Ensure full width
  '@media (max-width: 641px)': {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.CONTENT.MOBILE
  }
});

// Section title
export const TooltipSectionTitle = styled('div')({
  fontWeight: '700',
  marginBottom: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN,
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.SECTION_TITLE.DESKTOP,
  width: '100%',  // Ensure full width
  '@media (max-width: 641px)': {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.SECTION_TITLE.MOBILE
  }
});

// Additional note text
export const TooltipNote = styled('div')({
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.NOTE.DESKTOP,
  color: COLORS.BLACK,
  marginTop: TOOLTIP_CONSTANTS.SPACING.ROW_MARGIN + 2,
  width: '100%',  // Ensure full width
  '@media (max-width: 641px)': {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.NOTE.MOBILE
  }
});

// Bullet list and items
export const TooltipBulletList = styled('ul')({
  margin: '3px 0 0 14px',
  padding: 0,
  fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.BULLET.DESKTOP,
  width: '100%',  // Ensure full width
  '@media (max-width: 641px)': {
    fontSize: TOOLTIP_CONSTANTS.FONT_SIZE.BULLET.MOBILE
  }
});

export const TooltipBulletItem = styled('li')({
  marginBottom: '2px',
  paddingRight: '8px'
});

// Helper function for test result color
export const getTestResultColor = (status) => {
  return status && status.includes('PASS') ? COLORS.GREEN : COLORS.RED;
};

// Helper function to format mileage
export const formatMileage = (mileage) => {
  return mileage !== null ? Math.round(mileage).toLocaleString() : 'Not recorded';
};

// Helper function to calculate days between two dates
export const getDaysBetween = (date1, date2) => {
  return Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
};

// Helper to calculate mileage rates
export const calculateMileageRates = (currentDate, previousDate, currentMileage, previousMileage) => {
  if (!previousDate || currentMileage === null || previousMileage === null) {
    return { daily: null, annual: null };
  }
  
  const days = getDaysBetween(previousDate, currentDate);
  if (days === 0) return { daily: null, annual: null };
  
  const diff = currentMileage - previousMileage;
  const daily = diff / days;
  const annual = daily * 365.25;
  
  return { 
    daily: daily.toFixed(1), 
    annual: Math.round(annual).toLocaleString() 
  };
};


///Main Chart Styles////

export const ChartContainer = styled('div')({
  marginTop: '30px',
  marginBottom: '30px',
  fontFamily: '"GDS Transport", arial, sans-serif',
});

export const ChartLegend = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  marginBottom: '15px',
});

export const LegendItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '16px',
  color: '#0b0c0c',
});

export const ColorBox = styled('div')(({ color }) => ({
  width: '16px',
  height: '16px',
  backgroundColor: color,
  border: '1px solid #505a5f',
}));
