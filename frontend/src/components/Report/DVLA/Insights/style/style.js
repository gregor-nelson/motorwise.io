import { styled } from '@mui/material/styles';
import { 
  GovUKHeadingS, 
  GovUKBody, 
  GovUKBodyS, 
  PremiumInfoPanel,
  COLORS 
} from '../../../../../styles/theme';

// GOV.UK Breakpoints
const BREAKPOINTS = {
  mobile: '20rem',        // 320px
  tablet: '40.0625rem',   // 641px
  desktop: '48.0625rem',  // 769px
};

// GOV.UK Colors (aligned with provided CSS)
const GOVUK_COLORS = {
  BLACK: '#0b0c0c',
  GREY: '#b1b4b6',
  DARK_GREY: '#505a5f',
  LIGHT_GREY: '#f3f2f1',
  BLUE: '#1d70b8',
  PURPLE: '#4c2c92',
  GREEN: '#00703c',
  RED: '#d4351c',
  YELLOW: '#fd0',
  ORANGE: '#f47738',
  TURQUOISE: '#28a197',
};

// Main container for all insights
export const InsightsContainer = styled('div')({
  marginBottom: '20px',
  '@media (min-width: 40.0625rem)': {
    marginBottom: '30px',
  }
});

// Enhanced panel styling with customizable left border color
export const InsightPanel = styled(PremiumInfoPanel, {
  shouldForwardProp: prop => prop !== 'borderColor',
})(({ borderColor }) => ({
  borderLeft: `5px solid ${borderColor || GOVUK_COLORS.BLUE}`,
  paddingLeft: '15px',
  marginBottom: '20px',
  position: 'relative',
  backgroundColor: GOVUK_COLORS.LIGHT_GREY,

  '@media (min-width: 40.0625rem)': {
    marginBottom: '30px',
  },

  '&:hover': {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  },

  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '5px',
    height: '100%',
    backgroundColor: borderColor || GOVUK_COLORS.BLUE,
  }
}));

// Panel types with predefined colors
export const OwnershipPanel = styled(InsightPanel)({
  borderLeftColor: GOVUK_COLORS.BLUE,
  '&:before': { backgroundColor: GOVUK_COLORS.BLUE }
});

export const StatusPanel = styled(InsightPanel)({
  borderLeftColor: '#6e3894',
  '&:before': { backgroundColor: '#6e3894' }
});

export const EmissionsPanel = styled(InsightPanel)({
  borderLeftColor: GOVUK_COLORS.TURQUOISE,
  '&:before': { backgroundColor: GOVUK_COLORS.TURQUOISE }
});

export const AgeValuePanel = styled(InsightPanel)({
  borderLeftColor: GOVUK_COLORS.ORANGE,
  '&:before': { backgroundColor: GOVUK_COLORS.ORANGE }
});

export const FuelEfficiencyPanel = styled(InsightPanel)({
  borderLeftColor: GOVUK_COLORS.GREEN,
  '&:before': { backgroundColor: GOVUK_COLORS.GREEN }
});

// Enhanced headings for insights
export const InsightHeading = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.25,
  color: GOVUK_COLORS.BLACK,

  '@media (min-width: 40.0625rem)': {
    fontSize: '1.1875rem',
    lineHeight: 1.3157894737,
    marginBottom: '20px',
  },

  '& svg': {
    marginRight: '10px',
    color: iconColor || GOVUK_COLORS.BLUE,
  }
}));

// Body text with optional emphasis
export const InsightBody = styled(GovUKBody)({
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.25,
  color: GOVUK_COLORS.BLACK,
  marginBottom: '15px',

  '@media (min-width: 40.0625rem)': {
    fontSize: '1.1875rem',
    lineHeight: 1.3157894737,
    marginBottom: '20px',
  },

  '& strong': {
    fontWeight: 700,
    color: GOVUK_COLORS.BLACK,
  }
});

// Enhanced table styling
export const InsightTable = styled('table')({
  width: '100%',
  borderSpacing: 0,
  borderCollapse: 'collapse',
  marginBottom: '20px',
  fontFamily: '"GDS Transport", arial, sans-serif',

  '@media (min-width: 40.0625rem)': {
    marginBottom: '30px',
  },

  '& th': {
    padding: '10px 20px 10px 0',
    textAlign: 'left',
    borderBottom: `1px solid ${GOVUK_COLORS.GREY}`,
    fontWeight: 700,
    fontSize: '1rem',
    color: GOVUK_COLORS.BLACK,

    '@media (min-width: 40.0625rem)': {
      fontSize: '1.1875rem',
    }
  },

  '& td': {
    padding: '10px 20px 10px 0',
    borderBottom: `1px solid ${GOVUK_COLORS.GREY}`,
    fontSize: '1rem',
    color: GOVUK_COLORS.BLACK,

    '@media (min-width: 40.0625rem)': {
      fontSize: '1.1875rem',
    },

    '&:first-of-type': {
      fontWeight: 700,
    }
  },
  
  // Using nth-of-type instead of nth-child for better SSR compatibility
  '& tr:nth-of-type(even)': {
    backgroundColor: GOVUK_COLORS.LIGHT_GREY,
  }
});

// Status indicators (Low, Medium, High risk)
export const StatusIndicator = styled('span', {
  shouldForwardProp: prop => prop !== 'status',
})(({ status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  fontWeight: 700,
  fontSize: '1rem',
  color: status === 'Low' ? GOVUK_COLORS.GREEN : 
         status === 'Medium' ? GOVUK_COLORS.ORANGE : 
         status === 'High' ? GOVUK_COLORS.RED : 
         GOVUK_COLORS.BLACK,

  '@media (min-width: 40.0625rem)': {
    fontSize: '1.1875rem',
  },

  '& svg': {
    marginRight: '5px',
  }
}));

// Special value highlight
export const ValueHighlight = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  color: color || GOVUK_COLORS.BLUE,

  '@media (min-width: 40.0625rem)': {
    fontSize: '1.1875rem',
  }
}));

// Better list styling for factors
export const FactorList = styled('ul')({
  listStyleType: 'none',
  paddingLeft: 0,
  margin: '0 0 15px',

  '@media (min-width: 40.0625rem)': {
    marginBottom: '20px',
  }
});

export const FactorItem = styled('li', {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '5px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.25,
  color: GOVUK_COLORS.BLACK,

  '@media (min-width: 40.0625rem)': {
    fontSize: '1.1875rem',
    lineHeight: 1.3157894737,
    marginBottom: '5px',
  },

  '& svg': {
    marginRight: '10px',
    marginTop: '2px',
    minWidth: '20px',
    color: iconColor || GOVUK_COLORS.DARK_GREY,
  }
}));

// Section for factors with title
export const FactorsSection = styled('div')({
  marginTop: '15px',
  paddingTop: '15px',
  borderTop: `1px solid ${GOVUK_COLORS.GREY}`,

  '@media (min-width: 40.0625rem)': {
    marginTop: '20px',
  }
});

export const FactorsTitle = styled(GovUKBodyS, {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => ({
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.25,
  color: color || GOVUK_COLORS.BLACK,
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',

  '@media (min-width: 40.0625rem)': {
    fontSize: '1.1875rem',
    lineHeight: 1.3157894737,
  },

  '& svg': {
    marginRight: '5px',
  }
}));

// Key metric display
export const MetricDisplay = styled('div', {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px',
  
  '& svg': {
    color: iconColor,
    marginRight: '8px'
  }
}));

export const MetricLabel = styled('span')({
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.25,
  color: GOVUK_COLORS.BLACK,
  marginRight: '10px',

  '@media (min-width: 40.0625rem)': {
    fontSize: '1.1875rem',
    lineHeight: 1.3157894737,
  }
});

export const MetricValue = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => ({
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700,
  fontSize: '1.125rem',
  lineHeight: 1.1111111111,
  color: color || GOVUK_COLORS.BLACK,

  '@media (min-width: 40.0625rem)': {
    fontSize: '1.5rem',
    lineHeight: 1.25,
  }
}));

// Compliance badge
export const ComplianceBadge = styled('span', {
  shouldForwardProp: prop => prop !== 'status',
})(({ status }) => ({
  display: 'inline-block',
  padding: '5px 10px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700,
  fontSize: '0.875rem',
  lineHeight: 1.1428571429,
  backgroundColor: status === 'Compliant' ? `${GOVUK_COLORS.GREEN}1A` : `${GOVUK_COLORS.RED}1A`,
  color: status === 'Compliant' ? GOVUK_COLORS.GREEN : GOVUK_COLORS.RED,
  marginLeft: '5px',

  '@media (min-width: 40.0625rem)': {
    fontSize: '1rem',
    lineHeight: 1.25,
  }
}));

// Note section for additional information
export const InsightNote = styled(GovUKBodyS)({
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontStyle: 'italic',
  fontSize: '0.875rem',
  lineHeight: 1.1428571429,
  color: GOVUK_COLORS.DARK_GREY,
  marginTop: '15px',
  paddingTop: '15px',
  borderTop: `1px solid ${GOVUK_COLORS.GREY}`,

  '@media (min-width: 40.0625rem)': {
    fontSize: '1rem',
    lineHeight: 1.25,
  }
});

// Loading states
export const EnhancedLoadingContainer = styled('div')({
  textAlign: 'center',
  padding: '20px',
  backgroundColor: GOVUK_COLORS.LIGHT_GREY,
  margin: '15px 0',

  '@media (min-width: 40.0625rem)': {
    padding: '30px',
    margin: '20px 0',
  }
});

export const EmptyStateContainer = styled('div')({
  textAlign: 'center',
  padding: '20px',
  backgroundColor: GOVUK_COLORS.LIGHT_GREY,
  margin: '15px 0',

  '@media (min-width: 40.0625rem)': {
    padding: '30px',
    margin: '20px 0',
  }
});

// Report Table - Fixed for SSR compatibility
export const ReportTable = styled('table')({
  width: '100%',
  borderSpacing: 0,
  borderCollapse: 'collapse',
  marginBottom: '20px',
  
  '& th': {
    fontFamily: '"GDS Transport", arial, sans-serif',
    fontWeight: 700,
    padding: '10px',
    textAlign: 'left',
    backgroundColor: GOVUK_COLORS.LIGHT_GREY,
    border: `1px solid ${GOVUK_COLORS.GREY}`,
  },
  
  '& td': {
    fontFamily: '"GDS Transport", arial, sans-serif',
    padding: '10px',
    border: `1px solid ${GOVUK_COLORS.GREY}`,
    textAlign: 'left',
  },
  
  // Using nth-of-type instead of nth-child for better SSR compatibility
  '& tr:nth-of-type(even)': {
    backgroundColor: GOVUK_COLORS.LIGHT_GREY,
  }
});

// MotHistoryItem with proper SSR compatibility
export const MotHistoryItem = styled('div', {
  shouldForwardProp: prop => prop !== 'result',
})(({ result }) => ({
  fontFamily: '"GDS Transport", arial, sans-serif',
  padding: '15px',
  marginBottom: '15px',
  borderLeft: `5px solid ${result === 'PASS' ? GOVUK_COLORS.GREEN : GOVUK_COLORS.RED}`,
  backgroundColor: GOVUK_COLORS.LIGHT_GREY,
  
  '@media (min-width: 40.0625rem)': {
    padding: '20px',
  }
}));

// Premium Feature List with SSR-compatible selectors
export const PremiumFeatureList = styled('ul')({
  marginTop: '15px',
  listStyleType: 'none',
  paddingLeft: '1em',
  
  '& > li': {
    position: 'relative',
    marginBottom: '10px',
    paddingLeft: '1.5em',
    
    '&::before': {
      content: '"✓"',
      position: 'absolute',
      left: 0,
      color: GOVUK_COLORS.GREEN,
      fontWeight: 'bold',
    }
  },
  
  '@media (min-width: 40.0625rem)': {
    marginTop: '20px',
  }
});