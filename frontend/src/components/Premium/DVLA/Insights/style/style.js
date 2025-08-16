// Minimal Clean Design System for Vehicle Insights
// Ultra Restrained Design - Clean, Minimal, Professional

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import{ MarketDashTokens as MinimalTokens } from '../../../../../styles/styles';



// =============== MAIN LAYOUT COMPONENTS ===============

// Ultra Clean Main Wrapper
export const InsightsWrapper = styled(Box)(({ theme }) => `
  ${MinimalTokens}
  
  font-family: var(--font-main);
  background: var(--white);
  min-height: 100vh;
  padding: var(--space-3xl) var(--space-lg);
  color: var(--gray-900);

  @media (max-width: 767px) {
    padding: var(--space-2xl) var(--space-md);
  }
`);

// Clean Header - Typography Only
export const InsightsHeader = styled(Box)(({ theme }) => `
  padding: var(--space-2xl) 0;
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    padding: var(--space-xl) 0;
    margin-bottom: var(--space-2xl);
  }
`);

export const HeaderContent = styled(Box)(({ theme }) => `
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-xl);

  @media (max-width: 767px) {
    padding: 0 var(--space-md);
  }
`);

export const HeaderText = styled(Box)(({ theme }) => ({
  flex: 1
}));

export const InsightsContent = styled(Box)(({ theme }) => `
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-xl);

  @media (max-width: 767px) {
    padding: 0 var(--space-md);
  }
`);

export const InsightsContainer = styled(Box)(({ theme }) => `
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-xl);

  @media (max-width: 767px) {
    padding: var(--space-md);
  }
`);

// =============== LOADING AND ERROR STATES ===============

// Ultra Clean Loading State
export const LoadingContainer = styled(Box)(({ theme }) => `
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  flex-direction: column;
  gap: var(--space-lg);
`);

export const LoadingSpinner = styled(Box)(({ theme }) => `
  width: 24px;
  height: 24px;
  border: 2px solid var(--gray-200);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`);

export const EmptyStateContainer = styled(Box)(({ theme }) => `
  text-align: center;
  padding: var(--space-3xl);
  
  & svg {
    margin-bottom: var(--space-lg);
    color: var(--gray-400);
    font-size: 3rem;
  }
`);

export const ErrorContainer = styled(Box)(({ theme }) => `
  text-align: center;
  padding: var(--space-xl);
  
  & svg {
    color: var(--negative);
    margin-bottom: var(--space-lg);
    font-size: 3rem;
  }
`);

// =============== SUMMARY GRID AND CARDS ===============

// Clean Summary Grid - No Visual Noise
export const SummaryGrid = styled(Box)(({ theme }) => `
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-3xl);
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
    margin-bottom: var(--space-2xl);
  }
`);

// Minimal Summary Card - No Borders, Just Spacing
export const SummaryCard = styled(Box)(({ status }) => `
  padding: var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  min-height: 120px;

  @media (max-width: 767px) {
    padding: var(--space-lg);
    gap: var(--space-md);
    min-height: 100px;
  }
`);

export const SummaryContent = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0
}));

export const SummaryTitle = styled(Box)(({ theme }) => `
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
`);

export const SummaryValue = styled(Box)(({ theme }) => `
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.2;

  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`);

// =============== INSIGHT SECTIONS ===============

// Clean Insight Section - No Cards
export const InsightSection = styled(Box)(({ theme }) => `
  margin-bottom: var(--space-3xl);
  
  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`);

export const VisualInsightsContainer = styled(Box)(({ theme }) => `
  background: var(--white);
  min-height: 400px;
  padding: var(--space-2xl);

  @media (max-width: 767px) {
    padding: var(--space-xl);
  }
`);

// =============== HEADERS AND TITLES ===============

export const HeadingL = styled('h1')(({ theme }) => `
  font-family: var(--font-main);
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;

  @media (max-width: 767px) {
    font-size: var(--text-2xl);
  }
`);

export const HeadingM = styled('h2')(({ theme }) => `
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-2xl) 0;
  line-height: 1.2;
  letter-spacing: -0.02em;

  @media (max-width: 767px) {
    font-size: var(--text-xl);
    margin-bottom: var(--space-xl);
  }
`);

export const BodyText = styled('p')(({ theme }) => `
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-700);
  margin: 0;
  line-height: 1.5;

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`);

// =============== CATEGORY HEADERS ===============

export const InsightCategoryHeader = styled(Box)(({ theme }) => `
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`);

// Section Headers - Clean Typography
export const SectionHeader = styled(Box)(({ theme }) => `
  margin-bottom: var(--space-2xl);
  
  & h2, & h3 {
    margin: 0;
  }

  @media (max-width: 767px) {
    margin-bottom: var(--space-xl);
  }
`);

// =============== GRIDS AND CARDS ===============

export const InsightGrid = styled(Box)(({ theme }) => `
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-3xl);
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
    margin-bottom: var(--space-2xl);
  }
`);

// Minimal Visual Card - Clean Layout
export const VisualInsightCard = styled(Box)(({ variant = 'default', status }) => `
  padding: var(--space-xl);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  ${variant === 'gauge' ? `
    text-align: center;
    min-height: 220px;
    justify-content: center;
    align-items: center;
  ` : ''}
  
  ${variant === 'progress' ? `
    min-height: 160px;
    justify-content: space-between;
  ` : ''}
  
  ${variant === 'status' ? `
    min-height: 140px;
    justify-content: space-between;
  ` : ''}

  @media (max-width: 767px) {
    padding: var(--space-lg);
  }
`);

export const VisualCard = styled(Box)(({ variant = 'default', status }) => `
  padding: var(--space-xl);
  height: 100%;
  
  ${variant === 'gauge' && `
    text-align: center;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `}
  
  ${variant === 'progress' && `
    min-height: 140px;
  `}

  @media (max-width: 767px) {
    padding: var(--space-lg);
  }
`);

export const CardHeader = styled(Box)(({ theme }) => `
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
`);

export const CardTitle = styled(Box)(({ theme }) => `
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  line-height: 1.3;
  font-family: var(--font-main);
`);

// =============== METRICS AND VALUES ===============

export const MetricValue = styled(Box)(({ size = 'large', color }) => `
  font-size: ${size === 'large' ? 'var(--text-3xl)' : size === 'medium' ? 'var(--text-2xl)' : 'var(--text-xl)'};
  font-weight: 600;
  color: ${color || 'var(--gray-900)'};
  line-height: 1.1;
  margin-bottom: var(--space-xs);
  font-family: var(--font-main);

  @media (max-width: 767px) {
    font-size: ${size === 'large' ? 'var(--text-2xl)' : size === 'medium' ? 'var(--text-xl)' : 'var(--text-lg)'};
  }
`);

export const MetricUnit = styled('span')(({ theme }) => `
  font-size: var(--text-lg);
  font-weight: 400;
  color: var(--gray-600);
  margin-left: var(--space-sm);
  font-family: var(--font-main);
`);

export const MetricSubtext = styled(Box)(({ theme }) => `
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin-top: var(--space-sm);
  font-family: var(--font-main);
  line-height: 1.4;
`);

export const MetricDisplay = styled(Box)(({ iconColor }) => `
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  
  & svg {
    color: ${iconColor || 'var(--primary)'};
    font-size: var(--text-lg);
  }
`);

export const MetricLabel = styled(Box)(({ theme }) => `
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-top: var(--space-xs);
  font-family: var(--font-main);
`);

// =============== STATUS COMPONENTS ===============

// Minimal Status Indicators - Just Color, No Decorations
export const StatusIndicator = styled(Box)(({ status }) => `
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: 500;
  font-size: var(--text-sm);
  font-family: var(--font-main);
  color: ${
    status === 'Low' || status === 'Compliant' || status === 'good' ? 'var(--positive)' :
    status === 'Medium' || status === 'warning' ? 'var(--warning)' :
    status === 'High' || status === 'Non-Compliant' || status === 'critical' ? 'var(--negative)' :
    status === 'Exempt' ? 'var(--primary)' :
    'var(--gray-600)'
  };
  
  & svg {
    font-size: var(--text-base);
  }
`);

// Clean Status Badge - Minimal Styling
export const EnhancedStatusBadge = styled('strong')(({ status, size = 'medium' }) => `
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: ${size === 'large' ? 'var(--text-base)' : 'var(--text-sm)'};
  font-weight: 600;
  font-family: var(--font-main);
  color: ${
    status === 'good' || status === 'Compliant' || status === 'Low' ? 'var(--positive)' :
    status === 'warning' || status === 'Medium' ? 'var(--warning)' :
    status === 'critical' || status === 'Non-Compliant' || status === 'High' ? 'var(--negative)' :
    status === 'Exempt' ? 'var(--primary)' :
    'var(--gray-700)'
  };
  
  & svg {
    font-size: ${size === 'large' ? 'var(--text-lg)' : 'var(--text-base)'};
  }
`);

export const Badge = styled('span')(({ variant = 'default', size = 'medium' }) => `
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: ${size === 'large' ? 'var(--text-base)' : 'var(--text-sm)'};
  font-weight: 500;
  font-family: var(--font-main);
  color: ${
    variant === 'success' ? 'var(--positive)' :
    variant === 'warning' ? 'var(--warning)' :
    variant === 'error' ? 'var(--negative)' :
    variant === 'info' ? 'var(--primary)' :
    'var(--gray-600)'
  };
  
  & svg {
    font-size: ${size === 'large' ? 'var(--text-lg)' : 'var(--text-base)'};
  }
`);

// =============== CONTENT COMPONENTS ===============

export const InsightBody = styled(Box)(({ theme }) => `
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--gray-800);
  margin-bottom: var(--space-lg);
  font-family: var(--font-main);

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`);

export const InsightTable = styled('table')(({ theme }) => `
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-lg);
  font-family: var(--font-main);
  
  & th, & td {
    padding: var(--space-md) var(--space-lg);
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
    font-size: var(--text-base);
    
    @media (max-width: 767px) {
      padding: var(--space-sm);
      font-size: var(--text-sm);
    }
  }
  
  & th {
    font-weight: 600;
    background: var(--gray-50);
    color: var(--gray-900);
  }
  
  & tr:hover {
    background: var(--gray-50);
  }
`);

export const ValueHighlight = styled('strong')(({ color }) => `
  color: ${color || 'var(--primary)'};
  font-weight: 600;
  font-size: inherit;
`);

// =============== NOTES AND SECTIONS ===============

export const InsightNote = styled(Box)(({ variant = 'info' }) => `
  background: var(--gray-50);
  padding: var(--space-lg);
  margin-top: var(--space-lg);
  font-size: var(--text-sm);
  line-height: 1.5;
  color: ${
    variant === 'warning' ? 'var(--warning)' :
    variant === 'success' ? 'var(--positive)' :
    variant === 'error' ? 'var(--negative)' :
    'var(--gray-700)'
  };
  font-family: var(--font-main);
  
  & svg {
    vertical-align: middle;
    margin-right: var(--space-xs);
  }
`);

export const EnhancedInsightNote = styled(Box)(({ variant = 'info' }) => `
  background: var(--gray-50);
  padding: var(--space-lg) var(--space-xl);
  margin: var(--space-lg) 0;
  
  & p {
    margin: 0;
    font-size: var(--text-base);
    color: ${
      variant === 'warning' ? 'var(--warning)' :
      variant === 'success' ? 'var(--positive)' :
      variant === 'error' ? 'var(--negative)' :
      'var(--gray-700)'
    };
    line-height: 1.5;
    font-weight: 400;
  }
`);

export const FactorsSection = styled(Box)(({ theme }) => `
  margin-top: var(--space-2xl);
  padding-top: var(--space-lg);
`);

export const FactorsTitle = styled(Box)(({ color }) => `
  font-size: var(--text-lg);
  font-weight: 600;
  color: ${color || 'var(--gray-900)'};
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-main);
`);

export const FactorList = styled('ul')(({ theme }) => `
  list-style: none;
  padding: 0;
  margin: 0;
`);

export const FactorItem = styled('li')(({ iconColor }) => `
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  font-size: var(--text-base);
  line-height: 1.5;
  font-family: var(--font-main);
  
  & svg {
    flex-shrink: 0;
    margin-top: var(--space-xs);
    color: ${iconColor || 'var(--gray-600)'};
  }
  
  & strong {
    font-weight: 600;
  }

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`);

export const EnhancedFactorList = styled('ul')(({ theme }) => `
  list-style: none;
  padding: 0;
  margin: var(--space-lg) 0;
  
  & li {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
    font-size: var(--text-base);
    line-height: 1.5;
    font-weight: 400;
    color: var(--gray-700);
    padding: var(--space-sm) 0;
    
    &:last-child {
      border-bottom: none;
    }
    
    & svg {
      flex-shrink: 0;
      margin-top: var(--space-xs);
    }
  }
`);

// =============== PROGRESS COMPONENTS ===============

export const ProgressContainer = styled(Box)(({ theme }) => `
  margin-top: var(--space-lg);
  width: 100%;
`);

export const ProgressWrapper = styled(Box)(({ theme }) => `
  width: 100%;
  margin-top: var(--space-lg);
`);

export const ProgressBar = styled(Box)(({ theme }) => `
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  position: relative;
  border-radius: 4px;
  overflow: hidden;
`);

export const ProgressFill = styled(Box)(({ color, width }) => `
  height: 100%;
  width: ${width}%;
  background: ${color || 'var(--primary)'};
  transition: width 0.6s ease;
  border-radius: 4px;
`);

export const ProgressLabel = styled(Box)(({ theme }) => `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
  font-size: var(--text-base);
  font-family: var(--font-main);
  font-weight: 500;
`);

// =============== GAUGE COMPONENTS ===============

export const GaugeContainer = styled(Box)(({ theme }) => `
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto var(--space-lg);
`);

export const GaugeSvg = styled('svg')(({ theme }) => `
  transform: rotate(-90deg);
`);

export const GaugeTrack = styled('circle')(({ theme }) => `
  fill: none;
  stroke: var(--gray-200);
  stroke-width: 8;
`);

export const GaugeFill = styled('circle')(({ color }) => `
  fill: none;
  stroke: ${color || 'var(--primary)'};
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
`);

export const GaugeCenterText = styled(Box)(({ theme }) => `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`);

// =============== PANELS AND DIVIDERS ===============

export const InsightPanel = styled(Box)(({ theme }) => `
  background: var(--white);
  margin-bottom: var(--space-2xl);
  
  &:last-child {
    margin-bottom: 0;
  }
`);

export const OwnershipPanel = styled(InsightPanel)``;
export const StatusPanel = styled(InsightPanel)``;
export const EmissionsPanel = styled(InsightPanel)``;
export const FuelEfficiencyPanel = styled(InsightPanel)``;

// Clean Section Spacing - No Visual Dividers
export const VisualDivider = styled(Box)(({ theme }) => `
  height: var(--space-3xl);
  margin: var(--space-3xl) 0;

  @media (max-width: 767px) {
    height: var(--space-2xl);
    margin: var(--space-2xl) 0;
  }
`);

export const Divider = styled(Box)(({ theme }) => `
  height: var(--space-2xl);
  margin: var(--space-2xl) 0;

  @media (max-width: 767px) {
    height: var(--space-xl);
    margin: var(--space-xl) 0;
  }
`);

// =============== LEGACY COMPATIBILITY ===============

// Keep these for backward compatibility but with minimal styling
export const HeaderIcon = styled(Box)(({ theme }) => ({ display: 'none' }));
export const SummaryIcon = styled(Box)(({ theme }) => ({ display: 'none' }));
export const CategoryIcon = styled(Box)(({ theme }) => ({ display: 'none' }));
export const CardIcon = styled(Box)(({ theme }) => ({ display: 'none' }));
export const SectionIcon = styled(Box)(({ theme }) => ({ display: 'none' }));
export const EnhancedLoadingContainer = styled(LoadingContainer)``;