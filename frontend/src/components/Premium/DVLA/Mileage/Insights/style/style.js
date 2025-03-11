import { styled } from '@mui/material/styles';
import { 
  GovUKHeadingM,
  GovUKHeadingS, 
  GovUKBody, 
  GovUKBodyS, 
  GovUKList,
  PremiumInfoPanel,
  COLORS 
} from '../../../../../../styles/theme';

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

// Main container for mileage insights
export const MileageInsightsContainer = styled('div')({
  marginBottom: '20px',
  '@media (min-width: 40.0625rem)': {
    marginBottom: '30px',
  }
});

// Header container with flex layout
export const MileageInsightsHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  '@media (min-width: 40.0625rem)': {
    marginBottom: '20px',
  }
});

// Premium badge for mileage insights
export const MileageBadge = styled('div')({
  display: 'inline-block',
  padding: '5px 10px',
  backgroundColor: GOVUK_COLORS.BLUE,
  color: GOVUK_COLORS.LIGHT_GREY,
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700,
  fontSize: '0.875rem',
  lineHeight: 1.1428571429,
  '@media (min-width: 40.0625rem)': {
    fontSize: '1rem',
    lineHeight: 1.25,
  }
});

// Title for mileage insights
export const MileageInsightsTitle = styled(GovUKHeadingM)({
  margin: 0,
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700
});

// Description for mileage insights
export const MileageInsightsDescription = styled(GovUKBodyS)({
  marginBottom: '25px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  color: GOVUK_COLORS.DARK_GREY
});

// Section container for each insight area
export const MileageInsightSection = styled('div')({
  marginBottom: '30px'
});

// Panel with customizable border color
export const MileageInsightPanel = styled('div', {
  shouldForwardProp: prop => prop !== 'borderColor',
})(({ borderColor }) => ({
  padding: '20px',
  backgroundColor: GOVUK_COLORS.LIGHT_GREY,
  borderLeft: `5px solid ${borderColor || GOVUK_COLORS.BLUE}`,
  position: 'relative',
  transition: 'box-shadow 0.3s ease',

  '&:hover': {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
  }
}));

// Section heading with optional icon
export const MileageSectionHeading = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'iconColor',
})(({ iconColor }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700,
  
  '& svg': {
    marginRight: '10px',
    color: iconColor || GOVUK_COLORS.BLUE
  },

  '@media (min-width: 40.0625rem)': {
    marginBottom: '20px'
  }
}));

// Enhanced table for mileage data
export const MileageTable = styled('table')({
  width: '100%',
  borderSpacing: 0,
  borderCollapse: 'collapse',
  marginBottom: '20px',
  fontFamily: '"GDS Transport", arial, sans-serif',

  '& th': {
    padding: '10px',
    textAlign: 'left',
    backgroundColor: GOVUK_COLORS.LIGHT_GREY,
    border: `1px solid ${GOVUK_COLORS.GREY}`,
    fontWeight: 700,
    fontSize: '1rem',
    color: GOVUK_COLORS.BLACK,

    '@media (min-width: 40.0625rem)': {
      fontSize: '1.1875rem',
      padding: '12px'
    }
  },

  '& td': {
    padding: '10px',
    border: `1px solid ${GOVUK_COLORS.GREY}`,
    fontSize: '1rem',
    color: GOVUK_COLORS.BLACK,

    '@media (min-width: 40.0625rem)': {
      fontSize: '1.1875rem',
      padding: '12px'
    }
  },
  
  // Using nth-of-type for better compatibility
  '& tr:nth-of-type(even)': {
    backgroundColor: 'rgba(243, 242, 241, 0.5)'
  }
});

// Risk score display component
export const RiskScoreDisplay = styled('div', {
  shouldForwardProp: prop => prop !== 'riskCategory',
})(({ riskCategory }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '15px',
  border: `2px solid ${
    riskCategory === 'Low' ? GOVUK_COLORS.GREEN : 
    riskCategory === 'Medium' ? GOVUK_COLORS.ORANGE : 
    GOVUK_COLORS.RED
  }`,
  marginBottom: '20px',
  backgroundColor: 'rgba(243, 242, 241, 0.5)'
}));

// Circle for risk score
export const RiskScoreCircle = styled('div', {
  shouldForwardProp: prop => prop !== 'riskCategory',
})(({ riskCategory }) => ({
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  backgroundColor: riskCategory === 'Low' ? GOVUK_COLORS.GREEN : 
                 riskCategory === 'Medium' ? GOVUK_COLORS.ORANGE : 
                 GOVUK_COLORS.RED,
  color: GOVUK_COLORS.LIGHT_GREY,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  marginRight: '20px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

// Risk score text container
export const RiskScoreText = styled('div')({
  fontFamily: '"GDS Transport", arial, sans-serif'
});

// Risk category text
export const RiskCategory = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'riskCategory',
})(({ riskCategory }) => ({
  marginBottom: '5px',
  color: riskCategory === 'Low' ? GOVUK_COLORS.GREEN : 
       riskCategory === 'Medium' ? GOVUK_COLORS.ORANGE : 
       GOVUK_COLORS.RED,
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700
}));

// Risk description
export const RiskDescription = styled(GovUKBody)({
  marginBottom: 0,
  fontFamily: '"GDS Transport", arial, sans-serif'
});

// Factors section heading
export const FactorsHeading = styled(GovUKHeadingS, {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => ({
  fontSize: '1.1rem',
  marginBottom: '10px',
  color: color || GOVUK_COLORS.BLACK,
  borderBottom: `2px solid ${color || GOVUK_COLORS.BLACK}`,
  paddingBottom: '5px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700
}));

// Factors list
export const FactorsList = styled(GovUKList)({
  listStyleType: 'none',
  paddingLeft: 0,
  marginTop: 0,
  marginBottom: '20px',
  fontFamily: '"GDS Transport", arial, sans-serif'
});

// Individual factor item
export const FactorItem = styled('li', {
  shouldForwardProp: prop => prop !== 'borderColor',
})(({ borderColor }) => ({
  marginBottom: '8px',
  paddingLeft: '8px',
  borderLeft: `3px solid ${borderColor || GOVUK_COLORS.BLUE}`,
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.25,

  '@media (min-width: 40.0625rem)': {
    fontSize: '1.1875rem',
    lineHeight: 1.3157894737
  }
}));

// Footer note
export const FooterNote = styled(GovUKBodyS)({
  textAlign: 'center',
  color: GOVUK_COLORS.DARK_GREY,
  marginTop: '20px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontSize: '0.875rem',
  
  '@media (min-width: 40.0625rem)': {
    fontSize: '1rem'
  }
});

// Enhanced value display with color
export const ValueDisplay = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})(({ color }) => ({
  fontWeight: 'bold',
  color: color || 'inherit'
}));

// Loading container
export const LoadingContainer = styled('div')({
  textAlign: 'center',
  padding: '30px 0',
  margin: '20px 0',
  backgroundColor: GOVUK_COLORS.LIGHT_GREY,
  borderLeft: `5px solid ${GOVUK_COLORS.BLUE}`
});

// Error container
export const ErrorContainer = styled('div')({
  padding: '20px',
  backgroundColor: 'rgba(212, 53, 28, 0.1)',
  borderLeft: `5px solid ${GOVUK_COLORS.RED}`,
  marginBottom: '20px'
});

// Empty state container
export const EmptyContainer = styled('div')({
  padding: '20px',
  backgroundColor: GOVUK_COLORS.LIGHT_GREY,
  borderLeft: `5px solid ${GOVUK_COLORS.DARK_GREY}`,
  marginBottom: '20px'
});