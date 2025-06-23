// EnhancedInsightStyles.js
// Enhanced styled components for vehicle insights matching tech specs design

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { COLORS, BREAKPOINTS } from '../../../../../styles/theme';

// Container Components
export const InsightsContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    padding: '10px'
  }
}));

export const InsightPanel = styled(Box)(({ theme }) => ({
  backgroundColor: COLORS.WHITE,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  borderRadius: '5px',
  marginBottom: '30px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
  }
}));

// Panel Variants
export const OwnershipPanel = styled(InsightPanel)(({ theme }) => ({
  borderTopColor: COLORS.BLUE,
  borderTopWidth: '5px'
}));

export const StatusPanel = styled(InsightPanel)(({ theme }) => ({
  borderTopColor: COLORS.PURPLE,
  borderTopWidth: '5px'
}));

export const EmissionsPanel = styled(InsightPanel)(({ theme }) => ({
  borderTopColor: COLORS.GREEN,
  borderTopWidth: '5px'
}));

export const FuelEfficiencyPanel = styled(InsightPanel)(({ theme }) => ({
  borderTopColor: COLORS.GREEN,
  borderTopWidth: '5px'
}));

// Content Components
export const InsightBody = styled(Box)(({ theme }) => ({
  fontSize: '19px',
  lineHeight: 1.5,
  color: COLORS.BLACK,
  marginBottom: '20px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    fontSize: '16px'
  }
}));

export const InsightTable = styled('table')(({ theme }) => ({
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '20px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  '& th, & td': {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: `1px solid ${COLORS.BORDER_COLOUR}`,
    fontSize: '16px',
    
    [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
      padding: '10px',
      fontSize: '14px'
    }
  },
  
  '& th': {
    fontWeight: 700,
    backgroundColor: COLORS.LIGHT_GREY,
    color: COLORS.BLACK
  },
  
  '& tr:hover': {
    backgroundColor: '#f8f8f8'
  }
}));

// Status Components
export const StatusIndicator = styled(Box)(({ status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '3px',
  fontWeight: 700,
  fontSize: '14px',
  textTransform: 'uppercase',
  fontFamily: '"GDS Transport", arial, sans-serif',
  backgroundColor: 
    status === 'Low' || status === 'Compliant' || status === 'good' ? COLORS.LIGHT_GREEN :
    status === 'Medium' || status === 'warning' ? '#fff7ed' :
    status === 'High' || status === 'Non-Compliant' || status === 'critical' ? '#fef2f2' :
    status === 'Exempt' ? '#e6f3ff' :
    COLORS.LIGHT_GREY,
  color: 
    status === 'Low' || status === 'Compliant' || status === 'good' ? COLORS.GREEN :
    status === 'Medium' || status === 'warning' ? COLORS.ORANGE :
    status === 'High' || status === 'Non-Compliant' || status === 'critical' ? COLORS.RED :
    status === 'Exempt' ? COLORS.BLUE :
    COLORS.DARK_GREY,
  border: `1px solid ${
    status === 'Low' || status === 'Compliant' || status === 'good' ? COLORS.GREEN :
    status === 'Medium' || status === 'warning' ? COLORS.ORANGE :
    status === 'High' || status === 'Non-Compliant' || status === 'critical' ? COLORS.RED :
    status === 'Exempt' ? COLORS.BLUE :
    COLORS.DARK_GREY
  }`,
  
  '& svg': {
    fontSize: '16px'
  }
}));

// Value Highlighting
export const ValueHighlight = styled('strong')(({ color }) => ({
  color: color || COLORS.BLUE,
  fontWeight: 700,
  fontSize: 'inherit'
}));

// Factor Lists
export const FactorsSection = styled(Box)(({ theme }) => ({
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: `1px solid ${COLORS.BORDER_COLOUR}`
}));

export const FactorsTitle = styled(Box)(({ color }) => ({
  fontSize: '19px',
  fontWeight: 700,
  color: color || COLORS.BLACK,
  marginBottom: '15px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

export const FactorList = styled('ul')(({ theme }) => ({
  listStyle: 'none',
  padding: 0,
  margin: 0
}));

export const FactorItem = styled('li')(({ iconColor }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '10px 0',
  fontSize: '16px',
  lineHeight: 1.5,
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  '& svg': {
    flexShrink: 0,
    marginTop: '2px',
    color: iconColor || COLORS.DARK_GREY
  },
  
  '& strong': {
    fontWeight: 700
  },
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    fontSize: '14px'
  }
}));

// Metric Display Components
export const MetricDisplay = styled(Box)(({ iconColor }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  
  '& svg': {
    color: iconColor || COLORS.BLUE,
    fontSize: '20px'
  }
}));

export const MetricLabel = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  color: COLORS.DARK_GREY,
  marginTop: '4px',
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

export const MetricValue = styled('span')(({ color }) => ({
  fontSize: '19px',
  fontWeight: 700,
  color: color || COLORS.BLACK,
  fontFamily: '"GDS Transport", arial, sans-serif'
}));

// Notes and Warnings
export const InsightNote = styled(Box)(({ variant = 'info' }) => ({
  backgroundColor: 
    variant === 'warning' ? '#fff7ed' :
    variant === 'success' ? '#f0fdf4' :
    variant === 'error' ? '#fef2f2' :
    COLORS.LIGHT_GREY,
  borderLeft: `4px solid ${
    variant === 'warning' ? COLORS.ORANGE :
    variant === 'success' ? COLORS.GREEN :
    variant === 'error' ? COLORS.RED :
    COLORS.BLUE
  }`,
  padding: '15px 20px',
  marginTop: '20px',
  fontSize: '14px',
  lineHeight: 1.5,
  fontFamily: '"GDS Transport", arial, sans-serif',
  
  '& svg': {
    verticalAlign: 'middle',
    marginRight: '8px'
  }
}));

// Loading and Empty States
export const EnhancedLoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  minHeight: '400px',
  backgroundColor: COLORS.WHITE,
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  
  '& .govuk-loading-spinner': {
    marginBottom: '20px'
  }
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  minHeight: '300px',
  backgroundColor: COLORS.WHITE,
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textAlign: 'center',
  
  '& svg': {
    marginBottom: '20px'
  }
}));

// Visual Elements for Enhanced Design
export const VisualCard = styled(Box)(({ variant = 'default', status }) => ({
  backgroundColor: COLORS.WHITE,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  borderRadius: '5px',
  padding: '24px',
  position: 'relative',
  transition: 'all 0.2s ease',
  height: '100%',
  
  ...(variant === 'gauge' && {
    textAlign: 'center',
    minHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }),
  
  ...(variant === 'progress' && {
    minHeight: '160px'
  }),
  
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
      status === 'good' ? COLORS.GREEN :
      status === 'warning' ? COLORS.ORANGE :
      status === 'critical' ? COLORS.RED :
      COLORS.BLUE,
    borderRadius: '5px 0 0 5px'
  }
}));

// Grid Layout
export const InsightGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '30px',
  
  [`@media (max-width: ${BREAKPOINTS.tablet})`]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '15px'
  },
  
  [`@media (max-width: ${BREAKPOINTS.mobile})`]: {
    gridTemplateColumns: '1fr',
    gap: '15px'
  }
}));

// Section Headers
export const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  marginBottom: '25px',
  paddingBottom: '15px',
  borderBottom: `2px solid ${COLORS.BORDER_COLOUR}`,
  
  '& h2, & h3': {
    margin: 0
  }
}));

export const SectionIcon = styled(Box)(({ color }) => ({
  width: '40px',
  height: '40px',
  backgroundColor: color || COLORS.BLUE,
  color: COLORS.WHITE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: 700,
  borderRadius: '5px',
  flexShrink: 0
}));

// Enhanced Badge
export const Badge = styled('span')(({ variant = 'default', size = 'medium' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: size === 'large' ? '8px 16px' : '4px 10px',
  fontSize: size === 'large' ? '16px' : '14px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  fontFamily: '"GDS Transport", arial, sans-serif',
  borderRadius: '3px',
  backgroundColor: 
    variant === 'success' ? COLORS.GREEN :
    variant === 'warning' ? COLORS.ORANGE :
    variant === 'error' ? COLORS.RED :
    variant === 'info' ? COLORS.BLUE :
    COLORS.DARK_GREY,
  color: COLORS.WHITE,
  
  '& svg': {
    fontSize: size === 'large' ? '20px' : '16px'
  }
}));

// Progress Components
export const ProgressWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: '15px'
}));

export const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '24px',
  backgroundColor: COLORS.LIGHT_GREY,
  border: `1px solid ${COLORS.BORDER_COLOUR}`,
  borderRadius: '3px',
  overflow: 'hidden',
  position: 'relative'
}));

export const ProgressFill = styled(Box)(({ color, width }) => ({
  height: '100%',
  width: `${width}%`,
  backgroundColor: color || COLORS.BLUE,
  transition: 'width 0.5s ease',
  position: 'relative',
  
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: 'shimmer 2s infinite'
  },
  
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  }
}));

// Visual Divider
export const Divider = styled(Box)(({ theme }) => ({
  height: '2px',
  backgroundColor: COLORS.BORDER_COLOUR,
  margin: '30px 0'
}));