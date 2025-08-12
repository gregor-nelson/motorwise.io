import { styled } from '@mui/material/styles';

// ======================================================
// MarketDash Design System - Complete Token Injection
// ======================================================

const MarketDashTokens = `
  /* Complete MarketDash Design System - Always Include */
  
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
`;

// ======================================================
// Animation Keyframes
// ======================================================

const animationKeyframes = `
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

  @keyframes pulseGlow {
    0%, 100% { box-shadow: var(--shadow-sm); }
    50% { box-shadow: var(--shadow-lg); }
  }
`;

// ======================================================
// Premium Container - MarketDash Foundation
// ======================================================

export const PremiumContainer = styled('div')`
  /* Inject MarketDash tokens */
  ${MarketDashTokens}
  ${animationKeyframes}

  font-family: var(--font-main);
  background: var(--gray-50);
  color: var(--gray-900);
  border-radius: var(--radius-sm);
  max-width: 1200px;
  margin: 0 auto var(--space-2xl);
  width: 100%;
  animation: fadeIn 0.6s ease-out;

  @media (min-width: 768px) {
    padding: var(--space-xl);
  }

  @media (max-width: 767px) {
    padding: var(--space-lg) var(--space-md);
  }
`;

// ======================================================
// Vehicle Header Section - Premium Card Layout
// ======================================================

export const VehicleHeaderCard = styled('div')`
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-base);
  padding: var(--space-2xl);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-base);
  transition: var(--transition-smooth);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-hover) 100%);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  @media (max-width: 767px) {
    padding: var(--space-xl);
    margin-bottom: var(--space-lg);
  }
`;

// ======================================================
// Vehicle Registration Display - Enhanced Design
// ======================================================

export const VehicleRegistrationDisplay = styled('div')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  padding: var(--space-md) var(--space-lg);
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%);
  color: var(--gray-900);
  border-radius: var(--radius-lg);
  border: 3px solid var(--gray-900);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-lg);
  transition: var(--transition-smooth);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, var(--primary), var(--primary-hover));
    border-radius: var(--radius-lg);
    z-index: -1;
    opacity: 0;
    transition: var(--transition);
  }

  &:hover::after {
    opacity: 0.3;
  }

  @media (max-width: 767px) {
    font-size: var(--text-xl);
    min-width: 160px;
    padding: var(--space-sm) var(--space-md);
  }
`;

// ======================================================
// Vehicle Title Section - Enhanced Typography
// ======================================================

export const VehicleTitle = styled('h1')`
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 var(--space-lg) 0;
  line-height: var(--leading-tight);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -var(--space-lg);
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 100%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
    border-radius: var(--radius-full);
  }

  @media (max-width: 767px) {
    font-size: var(--text-3xl);
    
    &::before {
      left: -var(--space-md);
    }
  }
`;

// ======================================================
// Action Buttons Section - Premium Design
// ======================================================

export const ActionButtonsContainer = styled('div')`
  display: flex;
  gap: var(--space-md);
  margin: var(--space-xl) 0;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: var(--space-sm);
  }
`;

export const PremiumActionButton = styled('button')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--white);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-base);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: var(--transition-slow);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: var(--shadow-lg), 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  @media (max-width: 767px) {
    width: 100%;
    padding: var(--space-lg);
  }
`;

export const SecondaryActionButton = styled(PremiumActionButton)`
  background: var(--white);
  color: var(--primary);
  border: 2px solid var(--primary);

  &:hover {
    background: var(--primary-light);
    border-color: var(--primary-hover);
  }
`;

// ======================================================
// Vehicle Details Grid - Professional Metric Cards
// ======================================================

export const VehicleDetailsGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
  margin: var(--space-xl) 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-md);
    margin: var(--space-lg) 0;
  }
`;

export const MetricCard = styled('div')`
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-base);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-hover) 100%);
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);
  }
`;

export const MetricLabel = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--gray-500);
  margin-bottom: var(--space-xs);
`;

export const MetricValue = styled('div')`
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--gray-900);
  line-height: var(--leading-none);
  margin-bottom: var(--space-sm);
  word-break: break-word;
`;

// ======================================================
// MOT Section - Enhanced Information Display
// ======================================================

export const MOTSection = styled('div')`
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-base);
  padding: var(--space-2xl);
  margin: var(--space-xl) 0;
  box-shadow: var(--shadow-base);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--positive) 0%, #16a34a 100%);
  }
`;

export const MOTCaption = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: var(--space-sm);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);

  @media (min-width: 768px) {
    font-size: var(--text-lg);
  }
`;

export const MOTDate = styled('div')`
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--gray-900);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-lg);

  @media (min-width: 768px) {
    font-size: var(--text-3xl);
  }
`;

// ======================================================
// Navigation Links - Clean Design
// ======================================================

export const NavigationLinks = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--gray-200);

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

export const NavigationLink = styled('a')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary-hover);
    transition: var(--transition);
  }

  &:hover {
    color: var(--primary-hover);
    
    &::after {
      width: 100%;
    }
  }

  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

// ======================================================
// Loading States - Professional Design
// ======================================================

export const LoadingContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-lg);
  background: var(--white);
  border-radius: var(--radius-base);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
`;

export const LoadingSpinner = styled('div')`
  width: 40px;
  height: 40px;
  border: 4px solid var(--gray-200);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
`;

export const LoadingText = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-500);
  text-align: center;
`;

// ======================================================
// Error States - Clean Alert Design
// ======================================================

export const ErrorContainer = styled('div')`
  background: var(--negative-light);
  border: 1px solid var(--negative);
  border-left: 4px solid var(--negative);
  border-radius: var(--radius-base);
  padding: var(--space-xl);
  margin: var(--space-lg) 0;
  
  .MuiAlert-root {
    background: transparent;
    border: none;
    padding: 0;
    box-shadow: none;
    
    .MuiAlert-message {
      font-family: var(--font-main);
      font-size: var(--text-base);
      color: var(--negative);
    }
  }
`;

// ======================================================
// Responsive Utilities
// ======================================================

export const ResponsiveContainer = styled('div')`
  @media (max-width: 767px) {
    padding: var(--space-md);
    
    ${VehicleTitle} {
      font-size: var(--text-2xl);
    }
    
    ${MetricCard} {
      padding: var(--space-lg);
    }
    
    ${MOTSection} {
      padding: var(--space-lg);
    }
  }
`;

// ======================================================
// Animation Enhancement Components
// ======================================================

export const AnimatedElement = styled('div')`
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: ${props => props.delay || '0ms'};
`;

export const HoverGlow = styled('div')`
  transition: var(--transition-smooth);
  
  &:hover {
    animation: pulseGlow 2s ease-in-out infinite;
  }
`;