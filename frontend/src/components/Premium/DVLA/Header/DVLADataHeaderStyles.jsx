import { styled } from '@mui/material/styles';
import{ MarketDashTokens as MinimalTokens } from '../../../../styles/styles';
// Ultra Clean Container - No borders, minimal styling
export const DVLADataContainer = styled('div')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  background: var(--white);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--gray-900);

  @media (max-width: 767px) {
    padding: var(--space-xl) var(--space-md);
  }
`;

// Minimal Section Header - Clean Typography Only
export const SectionHeader = styled('div')`
  margin-bottom: var(--space-3xl);

  & h1 {
    margin: 0;
    font-family: var(--font-main);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--gray-900);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
    
    & h1 {
      font-size: var(--text-xl);
    }
  }
`;

// Clean Grid - Simple Layout
export const DataGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-3xl);
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
    margin-bottom: var(--space-2xl);
  }
`;

// Minimal Metric Group - No Cards, Just Clean Spacing
export const MetricGroup = styled('div')`
  /* No background, borders, or shadows - pure minimal */
`;

// Clean Metric Rows
export const MetricRow = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-xl);
  
  &:not(:last-child) {
    margin-bottom: var(--space-xl);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    
    &:not(:last-child) {
      margin-bottom: var(--space-lg);
    }
  }
`;

// Ultra Clean Metric Item
export const MetricItem = styled('div')`
  /* Pure minimal - no styling */
`;

// Restrained Label Typography
export const MetricLabel = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
`;

// Clean Value Display
export const MetricValue = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--gray-900);
  line-height: 1.4;
  word-break: break-word;

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

// Minimal Status Indicators - Just Color, No Borders
export const StatusIndicator = styled('span', {
  shouldForwardProp: prop => prop !== 'status',
})`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  
  ${({ status }) => {
    switch (status?.toLowerCase()) {
      case 'valid':
      case 'taxed':
      case 'no action required':
        return `color: var(--positive);`;
      case 'expired':
      case 'sorn':
      case 'untaxed':
        return `color: var(--negative);`;
      case 'due soon':
      case 'advisory':
        return `color: var(--warning);`;
      default:
        return `color: var(--gray-700);`;
    }
  }}
`;

// Ultra Clean Loading State
export const LoadingContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  flex-direction: column;
  gap: var(--space-lg);
`;

export const LoadingSpinner = styled('div')`
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
`;

export const LoadingText = styled('div')`
  font-family: var(--font-main);
  color: var(--gray-600);
  font-size: var(--text-sm);
  text-align: center;
`;

// Minimal Error State
export const ErrorContainer = styled('div')`
  text-align: center;
  padding: var(--space-xl);
`;

export const ErrorHeader = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
`;

export const ErrorMessage = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--negative);
  line-height: 1.5;
`;

// Clean Section Spacing - No Visual Dividers
export const SectionDivider = styled('div')`
  height: var(--space-3xl);

  @media (max-width: 767px) {
    height: var(--space-2xl);
  }
`;

// Responsive Wrapper - Minimal
export const ResponsiveWrapper = styled('div')`
  /* Pure wrapper - no styling */
`;