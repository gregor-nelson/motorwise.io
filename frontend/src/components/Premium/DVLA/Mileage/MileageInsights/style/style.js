// MarketDash MileageInsights Styled Components - Phase 2 Advanced Visual Polish
// Self-contained styling following MarketDash design system
// Reference: frontend/src/pages/Home/example_market_styles.css

import { styled } from '@mui/material/styles';

// MarketDash CSS Custom Properties - Complete Design System
const MarketDashStyles = `
  /* Core Design Tokens from MarketDash */
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
    
    /* Responsive Breakpoints */
    --screen-sm: 640px;
    --screen-md: 768px;
    --screen-lg: 1024px;
    --screen-xl: 1280px;
    --screen-2xl: 1536px;
  }
  
  /* Advanced Animation Keyframes */
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
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Main container with advanced MarketDash layout
export const MileageInsightsContainer = styled('div')`
  /* Inject MarketDash design tokens */
  ${MarketDashStyles}
  
  font-family: var(--font-main);
  background: var(--gray-50);
  color: var(--gray-900);
  border-radius: var(--radius-sm);
  max-width: 1200px;
  margin: 0 auto var(--space-2xl);
  width: 100%;
  animation: fadeIn 0.6s ease-out;
  
  /* Progressive Enhancement */
  @media (min-width: 768px) {
    padding: var(--space-xl);
  }
  
  @media (max-width: 767px) {
    padding: var(--space-lg) var(--space-md);
    margin: 0 auto var(--space-xl);
  }
`;

// Advanced Section Title Container with MarketDash styling
export const SectionTitleContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 2px solid var(--gray-200);
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  padding: var(--space-xl);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  
  & h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--gray-800);
    line-height: var(--leading-tight);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  
  & h2::before {
    content: '';
    width: 4px;
    height: 28px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
    border-radius: var(--radius-full);
  }
  
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-lg) var(--space-md);
    
    & h2 {
      font-size: var(--text-2xl);
    }
  }
`;

// Premium Badge with advanced styling
export const MileagePremiumBadge = styled('div')`
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--white);
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

// Advanced Mileage Insight Grid Layout
export const MileageInsightsGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
  
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
  }
`;

// Premium Section Container with Advanced Layout
export const MileageInsightSection = styled('section')`
  margin-bottom: var(--space-2xl);
  animation: slideInUp 0.6s ease-out;
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-xl);
  }
`;

// Advanced Panel with Sophisticated Styling
export const MileageInsightPanel = styled('div', {
  shouldForwardProp: prop => prop !== 'borderColor',
})`
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-base);
  padding: var(--space-2xl);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  
  /* Advanced top border accent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${({ borderColor }) => borderColor || 'var(--primary)'} 0%, 
      ${({ borderColor }) => borderColor ? `${borderColor}80` : 'var(--primary-hover)'} 100%);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  @media (max-width: 767px) {
    padding: var(--space-lg);
  }
`;

// Professional Section Heading with Advanced Typography
export const MileageSectionHeading = styled('h3', {
  shouldForwardProp: prop => prop !== 'iconColor',
})`
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-lg) 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  line-height: var(--leading-tight);
  
  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, 
      ${({ iconColor }) => iconColor || 'var(--primary)'} 0%, 
      ${({ iconColor }) => iconColor ? `${iconColor}CC` : 'var(--primary-hover)'} 100%);
    border-radius: var(--radius-full);
  }
  
  & svg {
    color: ${({ iconColor }) => iconColor || 'var(--primary)'};
    font-size: 1.5em;
  }
  
  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`;

// Professional Data Table with MarketDash Patterns
export const MileageTable = styled('table')`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--white);
  border-radius: var(--radius-base);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-lg);
  
  & thead {
    background: var(--gray-100);
  }
  
  & th {
    background: var(--gray-100);
    color: var(--gray-700);
    font-family: var(--font-main);
    font-weight: 600;
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--gray-200);
    text-align: left;
    
    &:first-child {
      border-top-left-radius: var(--radius-base);
    }
    
    &:last-child {
      border-top-right-radius: var(--radius-base);
    }
  }
  
  & td {
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--gray-200);
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-800);
    transition: var(--transition);
  }
  
  & tr:hover {
    background: var(--gray-50);
  }
  
  & tr:last-child td {
    border-bottom: none;
    
    &:first-child {
      border-bottom-left-radius: var(--radius-base);
    }
    
    &:last-child {
      border-bottom-right-radius: var(--radius-base);
    }
  }
  
  @media (max-width: 767px) {
    font-size: var(--text-sm);
    
    & th, & td {
      padding: var(--space-sm) var(--space-md);
    }
  }
`;

// Advanced Risk Assessment Display
export const RiskScoreDisplay = styled('div', {
  shouldForwardProp: prop => prop !== 'riskCategory',
})`
  display: flex;
  align-items: center;
  gap: var(--space-xl);
  padding: var(--space-2xl);
  margin-bottom: var(--space-xl);
  background: linear-gradient(135deg, 
    ${({ riskCategory }) => {
      if (riskCategory === 'Low') return 'rgba(16, 185, 129, 0.05)';
      if (riskCategory === 'Medium') return 'rgba(245, 158, 11, 0.05)';
      return 'rgba(239, 68, 68, 0.05)';
    }} 0%, 
    ${({ riskCategory }) => {
      if (riskCategory === 'Low') return 'rgba(16, 185, 129, 0.02)';
      if (riskCategory === 'Medium') return 'rgba(245, 158, 11, 0.02)';
      return 'rgba(239, 68, 68, 0.02)';
    }} 100%);
  border: 1px solid ${({ riskCategory }) => {
    if (riskCategory === 'Low') return 'var(--positive)';
    if (riskCategory === 'Medium') return 'var(--warning)';
    return 'var(--negative)';
  }};
  border-radius: var(--radius-base);
  position: relative;
  
  @media (max-width: 767px) {
    flex-direction: column;
    text-align: center;
    gap: var(--space-lg);
    padding: var(--space-lg);
  }
`;

// Premium Risk Score Circle
export const RiskScoreCircle = styled('div', {
  shouldForwardProp: prop => prop !== 'riskCategory',
})`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--white);
  position: relative;
  background: linear-gradient(135deg, 
    ${({ riskCategory }) => {
      if (riskCategory === 'Low') return 'var(--positive)';
      if (riskCategory === 'Medium') return 'var(--warning)';
      return 'var(--negative)';
    }} 0%, 
    ${({ riskCategory }) => {
      if (riskCategory === 'Low') return '#059669';
      if (riskCategory === 'Medium') return '#d97706';
      return '#dc2626';
    }} 100%);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-smooth);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-xl);
  }
  
  @media (max-width: 767px) {
    width: 100px;
    height: 100px;
    font-size: var(--text-2xl);
  }
`;

// Risk Score Text Content
export const RiskScoreText = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

// Risk Category with Advanced Typography
export const RiskCategory = styled('h4', {
  shouldForwardProp: prop => prop !== 'riskCategory',
})`
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: ${({ riskCategory }) => {
    if (riskCategory === 'Low') return 'var(--positive)';
    if (riskCategory === 'Medium') return 'var(--warning)';
    return 'var(--negative)';
  }};
  line-height: var(--leading-tight);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  
  @media (max-width: 767px) {
    font-size: var(--text-xl);
    justify-content: center;
  }
`;

// Risk Description with Professional Styling
export const RiskDescription = styled('p')`
  margin: 0;
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
  
  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

// Professional Factors Heading
export const FactorsHeading = styled('h5', {
  shouldForwardProp: prop => prop !== 'color',
})`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: ${({ color }) => color || 'var(--gray-800)'};
  margin: var(--space-lg) 0 var(--space-md) 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid ${({ color }) => color || 'var(--gray-300)'};
  position: relative;
  
  &::before {
    content: '';
    width: 3px;
    height: 20px;
    background: ${({ color }) => color || 'var(--gray-400)'};
    border-radius: var(--radius-full);
  }
  
  & svg {
    color: ${({ color }) => color || 'var(--gray-600)'};
  }
  
  @media (max-width: 767px) {
    font-size: var(--text-base);
  }
`;

// Professional Factors List
export const FactorsList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-lg) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

// Advanced Factor Item with Micro-interactions
export const FactorItem = styled('li', {
  shouldForwardProp: prop => prop !== 'borderColor' && prop !== '_iconColor',
})`
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(135deg, 
    ${({ borderColor }) => {
      if (!borderColor) return 'var(--gray-50)';
      return borderColor === 'var(--positive)' ? 'rgba(16, 185, 129, 0.05)' :
             borderColor === 'var(--warning)' ? 'rgba(245, 158, 11, 0.05)' :
             borderColor === 'var(--negative)' ? 'rgba(239, 68, 68, 0.05)' : 'var(--gray-50)';
    }} 0%, 
    transparent 100%);
  border-left: 3px solid ${({ borderColor }) => borderColor || 'var(--primary)'};
  border-radius: var(--radius-sm);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-800);
  line-height: var(--leading-relaxed);
  transition: var(--transition);
  
  &:hover {
    background: linear-gradient(135deg, 
      ${({ borderColor }) => {
        if (!borderColor) return 'var(--gray-100)';
        return borderColor === 'var(--positive)' ? 'rgba(16, 185, 129, 0.1)' :
               borderColor === 'var(--warning)' ? 'rgba(245, 158, 11, 0.1)' :
               borderColor === 'var(--negative)' ? 'rgba(239, 68, 68, 0.1)' : 'var(--gray-100)';
      }} 0%, 
      transparent 100%);
    transform: translateX(2px);
  }
  
  & svg {
    color: ${({ _iconColor, borderColor }) => _iconColor || borderColor || 'var(--primary)'};
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  @media (max-width: 767px) {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
  }
`;

// Professional Value Display with Advanced Styling
export const ValueDisplay = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})`
  font-family: var(--font-mono);
  font-weight: 600;
  color: ${({ color }) => color || 'var(--gray-900)'};
  background: linear-gradient(135deg, 
    ${({ color }) => color ? `${color}15` : 'var(--gray-100)'} 0%, 
    transparent 100%);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border-left: 2px solid ${({ color }) => color || 'var(--gray-400)'};
  transition: var(--transition);
  
  &:hover {
    background: linear-gradient(135deg, 
      ${({ color }) => color ? `${color}25` : 'var(--gray-200)'} 0%, 
      transparent 100%);
  }
`;

// Professional Footer Note
export const FooterNote = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  color: var(--gray-500);
  text-align: center;
  margin: var(--space-2xl) 0 0 0;
  padding: var(--space-lg);
  background: var(--gray-50);
  border-radius: var(--radius-sm);
  border: 1px solid var(--gray-200);
  line-height: var(--leading-relaxed);
`;

// Professional Loading State
export const LoadingContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-base);
  margin: var(--space-xl) 0;
  gap: var(--space-md);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-hover) 100%);
    border-radius: var(--radius-base) var(--radius-base) 0 0;
  }
`;

// Enhanced Error State
export const ErrorContainer = styled('div')`
  padding: var(--space-xl);
  background: linear-gradient(135deg, var(--negative-light) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 1px solid var(--negative);
  border-radius: var(--radius-base);
  margin-bottom: var(--space-lg);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--negative) 0%, #dc2626 100%);
    border-radius: var(--radius-base) var(--radius-base) 0 0;
  }
`;

// Professional Empty State
export const EmptyContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-2xl);
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-base);
  margin-bottom: var(--space-lg);
  gap: var(--space-md);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--neutral) 0%, var(--gray-500) 100%);
    border-radius: var(--radius-base) var(--radius-base) 0 0;
  }
`;


// Advanced Metric Card Components
export const MileageMetricCard = styled('div')`
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
  }
`;

export const MileageMetricLabel = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--gray-500);
  margin-bottom: var(--space-xs);
`;

export const MileageMetricValue = styled('div')`
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--gray-900);
  line-height: var(--leading-none);
  margin-bottom: var(--space-sm);
`;

export const MileageMetricSubtext = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
`;

// Professional Data Quality Indicators
export const DataQualityBadge = styled('div', {
  shouldForwardProp: prop => prop !== 'quality',
})`
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  
  background: ${({ quality }) => {
    if (quality === 'high') return 'var(--positive-light)';
    if (quality === 'medium') return 'var(--warning-light)';
    if (quality === 'poor') return 'var(--negative-light)';
    return 'var(--neutral-light)';
  }};
  
  color: ${({ quality }) => {
    if (quality === 'high') return 'var(--positive)';
    if (quality === 'medium') return 'var(--warning)';
    if (quality === 'poor') return 'var(--negative)';
    return 'var(--neutral)';
  }};
  
  border: 1px solid ${({ quality }) => {
    if (quality === 'high') return 'var(--positive)';
    if (quality === 'medium') return 'var(--warning)';
    if (quality === 'poor') return 'var(--negative)';
    return 'var(--neutral)';
  }};
`;

// Enhanced Loading Shimmer Effect
export const LoadingShimmer = styled('div')`
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
  height: 20px;
  margin-bottom: var(--space-sm);
`;