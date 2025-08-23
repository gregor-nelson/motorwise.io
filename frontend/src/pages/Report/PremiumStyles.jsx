import { styled } from '@mui/material/styles';
/* ============================================
   MarketDash Premium Report Styles
   ============================================ */


// Premium Container - Clean & Minimal
export const PremiumContainer = styled('div')`
  background: var(--white);
  color: var(--gray-900);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  animation: fadeIn 0.6s ease-out;

  @media (min-width: 768px) {
    padding: var(--space-2xl);
  }

  @media (max-width: 767px) {
    padding: var(--space-lg);
  }
`;

// Report Header Section - Clean
export const ReportHeader = styled('div')`
  background: var(--white);
  padding: var(--space-2xl) 0;
  margin-bottom: var(--space-2xl);
  border-bottom: 1px solid var(--gray-100);
`;

export const PremiumBadgeContainer = styled('div')`
  display: inline-block;
  background: var(--gray-900);
  color: var(--white);
  padding: var(--space-xs) var(--space-md);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  margin-bottom: var(--space-lg);
`;

export const ReportTitle = styled('h1')`
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 300;
  color: var(--gray-900);
  margin: 0 0 var(--space-lg) 0;
  line-height: var(--leading-tight);

  @media (max-width: 767px) {
    font-size: var(--text-3xl);
  }
`;

export const VehicleRegistration = styled('div')`
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-sm);
  letter-spacing: var(--tracking-wide);
`;

export const VehicleMakeModel = styled('h2')`
  font-size: var(--text-xl);
  font-weight: 400;
  color: var(--gray-600);
  margin: 0;
  line-height: var(--leading-relaxed);
`;

// Section Components - Minimal & Clean
export const ReportSection = styled('section')`
  background: var(--white);
  padding: var(--space-2xl) 0;
  margin-bottom: var(--space-2xl);

  &:not(:last-child) {
    border-bottom: 1px solid var(--gray-100);
  }

  @media (max-width: 767px) {
    padding: var(--space-xl) 0;
    margin-bottom: var(--space-xl);
  }
`;

export const SectionHeader = styled('div')`
  margin-bottom: var(--space-2xl);

  & h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--gray-900);
    line-height: var(--leading-tight);
  }

  @media (max-width: 767px) {
    margin-bottom: var(--space-xl);

    & h2 {
      font-size: var(--text-xl);
    }
  }
`;

// Data Panel System - Minimal
export const DataPanel = styled('div')`
  background: var(--white);
  padding: var(--space-lg) 0;
  margin-bottom: var(--space-lg);
`;

// Data Table System - Clean & Minimal
export const DataTable = styled('table')`
  width: 100%;
  border-collapse: collapse;
  background: var(--white);
  margin-bottom: var(--space-lg);

  & th {
    color: var(--gray-600);
    font-weight: 500;
    font-size: var(--text-sm);
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--gray-200);
    text-align: left;
  }

  & td {
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--gray-100);
    font-size: var(--text-base);
    color: var(--gray-900);
  }

  & tr:last-child td {
    border-bottom: none;
  }

  @media (max-width: 767px) {
    font-size: var(--text-sm);

    & th,
    & td {
      padding: var(--space-sm) 0;
    }
  }
`;

// Grid Layout System - Minimal
export const MetricsGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
`;

export const MetricCard = styled('div')`
  background: var(--white);
  padding: var(--space-lg) 0;
`;

export const MetricLabel = styled('div')`
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--gray-600);
  margin-bottom: var(--space-xs);
`;

export const MetricValue = styled('div')`
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-sm);
`;

export const MetricDescription = styled('div')`
  font-size: var(--text-sm);
  color: var(--gray-500);
  line-height: var(--leading-relaxed);
`;

// Status Indicators - Minimal
export const StatusIndicator = styled('div', {
  shouldForwardProp: prop => !['status', 'size'].includes(prop),
})`
  display: inline-block;
  font-size: var(--text-sm);
  font-weight: 500;
  
  ${({ status }) => {
    switch (status) {
      case 'valid':
      case 'pass':
      case 'good':
        return `color: var(--positive);`;
      case 'warning':
      case 'advisory':
      case 'medium':
        return `color: var(--warning);`;
      case 'invalid':
      case 'fail':
      case 'critical':
      case 'high':
        return `color: var(--negative);`;
      default:
        return `color: var(--gray-600);`;
    }
  }}
`;

// Risk Assessment Components - Minimal
export const RiskScore = styled('div')`
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
`;

// Alert System - Minimal
export const Alert = styled('div', {
  shouldForwardProp: prop => prop !== 'variant',
})`
  padding: var(--space-lg) 0;
  margin-bottom: var(--space-lg);
  
  ${({ variant = 'info' }) => {
    switch (variant) {
      case 'success':
        return `color: var(--positive);`;
      case 'warning':
        return `color: var(--warning);`;
      case 'error':
        return `color: var(--negative);`;
      default:
        return `color: var(--gray-600);`;
    }
  }}
  
  & .alert-content {
    width: 100%;
  }
  
  & .alert-message {
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
  }
`;

// Loading States - Minimal
export const LoadingContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
  min-height: 200px;
`;

export const LoadingSpinner = styled('div')`
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-200);
  border-top: 2px solid var(--gray-900);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-md);
`;

export const LoadingText = styled('p')`
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin: 0;
`;

// Footer - Minimal
export const ReportFooter = styled('div')`
  margin-top: var(--space-2xl);
  padding-top: var(--space-2xl);
  border-top: 1px solid var(--gray-100);
  text-align: center;
  
  & a {
    color: var(--gray-600);
    text-decoration: none;
    font-size: var(--text-sm);
    
    &:hover {
      color: var(--gray-900);
    }
  }
`;