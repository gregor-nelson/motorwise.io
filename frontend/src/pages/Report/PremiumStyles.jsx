import { styled } from '@mui/material/styles';

/* ============================================
   MarketDash Premium Report Styles
   ============================================ */

/* Complete MarketDash Design System - Always Include */
const MarketDashTokens = `
:root {
  /* Ultra Clean Color Palette */
  --gray-900: #0f172a;
  --gray-800: #1e293b;
  --gray-700: #334155;
  --gray-600: #475569;
  --gray-500: #64748b;
  --gray-400: #94a3b8;
  --gray-300: #cbd5e1;
  --gray-200: #e2e8f0;
  --gray-100: #f1f5f9;
  --gray-50: #f8fafc;
  --white: #ffffff;

  /* Professional Brand Colors */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-light: #dbeafe;

  /* Financial Data Colors */
  --positive: #10b981;
  --positive-light: #d1fae5;
  --negative: #ef4444;
  --negative-light: #fee2e2;
  --warning: #f59e0b;
  --warning-light: #fef3c7;
  --neutral: #6b7280;
  --neutral-light: #f3f4f6;

  /* Modern Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* Typography Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  /* Professional Font Stack */
  --font-main: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  --font-display: 'Jost', sans-serif;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;

  /* Clean Shadow System */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Professional Transitions */
  --transition: all 0.2s ease;
  --transition-fast: all 0.15s ease;
  --transition-slow: all 0.3s ease;
  --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  /* Clean Border System */
  --border-width: 1px;
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}

/* Essential Animation Keyframes */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// Premium Container - Clean & Minimal
export const PremiumContainer = styled('div')`
  ${MarketDashTokens}
  
  font-family: var(--font-main);
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
  font-family: var(--font-main);
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
  font-family: var(--font-main);
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
    font-family: var(--font-main);
    font-weight: 500;
    font-size: var(--text-sm);
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--gray-200);
    text-align: left;
  }

  & td {
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--gray-100);
    font-family: var(--font-main);
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
  font-family: var(--font-main);
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
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-500);
  line-height: var(--leading-relaxed);
`;

// Status Indicators - Minimal
export const StatusIndicator = styled('div', {
  shouldForwardProp: prop => !['status', 'size'].includes(prop),
})`
  display: inline-block;
  font-family: var(--font-main);
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
  font-family: var(--font-main);
  
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
  font-family: var(--font-main);
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