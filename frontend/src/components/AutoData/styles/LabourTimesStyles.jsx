import { styled } from '@mui/material/styles';

// ======================================================
// LABOUR TIMES COMPONENT - CLEAN DESIGN SYSTEM STYLES
// ======================================================
// 
// This file contains ALL styling for the LabourTimesComponent
// using only CSS custom properties from the home.css design system.
// No external theme dependencies - completely self-contained.
//
// Design System Reference: /src/pages/Home/home.css
// ======================================================

// ======================================================
// Container Components
// ======================================================

/**
 * Main container - Clean responsive wrapper
 */
export const LabourTimesContainer = styled('div')`
  font-family: var(--font-main);
  max-width: var(--container-max, 1200px);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  width: 100%;
  
  @media (max-width: 767px) {
    padding: 0 var(--space-md);
  }
  
  @media (max-width: 480px) {
    padding: 0 var(--space-sm);
  }
`;

/**
 * Insights container - Reused from other components for consistency
 */
export const InsightsContainer = styled('div')`
  font-family: var(--font-main);
  width: 100%;
`;

// ======================================================
// Panel Components
// ======================================================

/**
 * Main labour times panel - Clean card design with primary accent
 * Matches Home page section styling exactly
 */
export const LabourTimesPanel = styled('div')`
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-sm);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  margin-bottom: var(--space-xl);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: var(--space-xl);
    margin-bottom: var(--space-2xl);
  }
  
  @media (max-width: 480px) {
    padding: var(--space-lg);
  }
`;

/**
 * Detail panels with customizable accent colors
 * Enhanced with smooth hover effects
 */
export const DetailPanel = styled('div', {
  shouldForwardProp: prop => prop !== 'color',
})`
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-left: 4px solid ${props => props.color || 'var(--primary)'};
  border-radius: var(--radius-sm);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  margin-bottom: var(--space-xl);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
    border-color: var(--gray-300);
  }
  
  @media (max-width: 768px) {
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
  }
  
  @media (max-width: 480px) {
    padding: var(--space-md);
  }
`;

/**
 * Warning panel - Clean alert styling with negative colors
 */
export const WarningPanel = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  background: var(--negative-light, #fee2e2);
  border: 1px solid var(--negative, #ef4444);
  border-left: 4px solid var(--negative, #ef4444);
  border-radius: var(--radius-sm, 8px);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  font-family: var(--font-main);
  
  svg {
    color: var(--negative, #ef4444);
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }
`;

// ======================================================
// Layout Components
// ======================================================

/**
 * Main layout - Responsive flex layout
 */
export const MainLayout = styled('div')`
  display: flex;
  gap: var(--space-xl);
  align-items: flex-start;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    gap: var(--space-lg);
  }
`;

/**
 * Content area - Main repair times display
 */
export const ContentArea = styled('div')`
  flex: 1;
  min-width: 0; /* Prevent flex overflow */
`;

/**
 * Quote sidebar - Desktop quote builder panel
 */
export const QuoteSidebar = styled('div')`
  flex: 0 0 320px;
  position: sticky;
  top: var(--space-lg);
  
  @media (max-width: 1024px) {
    flex: none;
    position: relative;
    top: 0;
  }
`;

// ======================================================
// Quick Services Components
// ======================================================

/**
 * Quick services section - Pre-built service packages
 */
export const QuickServicesSection = styled('div')`
  margin-bottom: var(--space-2xl);
`;

export const QuickServicesGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-lg);
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
`;

export const ServicePackageCard = styled('button')`
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-sm, 8px);
  padding: var(--space-lg);
  text-align: left;
  cursor: pointer;
  transition: var(--transition, all 0.2s ease);
  font-family: var(--font-main);
  
  &:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    transform: translateY(-2px);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

export const ServiceTitle = styled('div')`
  font-size: var(--text-lg);
  font-weight: var(--font-semibold, 600);
  color: var(--gray-900);
  margin-bottom: var(--space-sm);
`;

export const ServiceMeta = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-sm);
`;

export const ServiceTime = styled('span')`
  font-size: var(--text-2xl);
  font-weight: var(--font-bold, 700);
  color: var(--primary);
`;

export const ServiceCost = styled('span')`
  font-size: var(--text-lg);
  font-weight: var(--font-medium, 500);
  color: var(--gray-700);
`;

export const ServiceDescription = styled('div')`
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: var(--leading-relaxed, 1.625);
`;

// ======================================================
// Search & Filter Components
// ======================================================

/**
 * Search section - Find specific repairs
 */
export const SearchSection = styled('div')`
  background: var(--gray-50);
  border-radius: var(--radius-sm, 8px);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
`;

export const SearchContainer = styled('div')`
  display: flex;
  gap: var(--space-md);
  align-items: center;
  margin-bottom: var(--space-lg);
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchInput = styled('input')`
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-sm, 8px);
  font-size: var(--text-base);
  font-family: var(--font-main);
  background: var(--white);
  transition: var(--transition, all 0.2s ease);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light, #dbeafe);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
`;

export const FilterControls = styled('div')`
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    gap: var(--space-sm);
  }
`;

export const FilterSelect = styled('select')`
  padding: var(--space-md);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-sm, 8px);
  font-size: var(--text-sm);
  font-family: var(--font-main);
  background: var(--white);
  cursor: pointer;
  transition: var(--transition, all 0.2s ease);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light, #dbeafe);
  }
`;

export const ResultsHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-sm);
  }
`;

export const ResultsCount = styled('div')`
  font-size: var(--text-sm);
  color: var(--gray-600);
  font-weight: var(--font-medium, 500);
`;

// ======================================================
// Repair Display Components
// ======================================================

/**
 * Repair items grid - Main results display
 * Follows Home page market section grid patterns exactly
 */
export const RepairGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  @media (max-width: 480px) {
    gap: var(--space-md);
  }
`;

export const RepairCard = styled('div', {
  shouldForwardProp: prop => prop !== 'complexity',
})`
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-left: 4px solid ${props => 
    props.complexity === 'high' ? 'var(--negative)' :
    props.complexity === 'medium' ? 'var(--warning)' :
    props.complexity === 'low' ? 'var(--positive)' :
    'var(--primary)'
  };
  border-radius: var(--radius-sm);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--gray-300);
    border-left-color: ${props => 
      props.complexity === 'high' ? 'var(--negative-hover)' :
      props.complexity === 'medium' ? 'var(--warning-hover)' :
      props.complexity === 'low' ? 'var(--positive-hover)' :
      'var(--primary-hover)'
    };
  }
  
  &:focus-within {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  @media (max-width: 767px) {
    padding: var(--space-lg);
  }
`;

export const RepairHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
  gap: var(--space-md);
`;

export const RepairTitle = styled('h3')`
  font-size: var(--text-lg);
  font-weight: var(--font-semibold, 600);
  color: var(--gray-900);
  line-height: var(--leading-tight, 1.25);
  margin: 0;
  flex: 1;
`;

export const RepairTime = styled('div')`
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  flex-shrink: 0;
`;

export const TimeValue = styled('span')`
  font-size: var(--text-2xl);
  font-weight: var(--font-bold, 700);
  color: var(--gray-900);
  font-family: var(--font-mono);
`;

export const TimeUnit = styled('span')`
  font-size: var(--text-sm);
  color: var(--gray-600);
  font-weight: var(--font-medium, 500);
`;

export const RepairMeta = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
`;

export const ComplexityBadge = styled('span', {
  shouldForwardProp: prop => prop !== 'complexity',
})`
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  transition: var(--transition);
  
  background: ${props => 
    props.complexity === 'high' ? 'var(--negative-light)' :
    props.complexity === 'medium' ? 'var(--warning-light)' :
    props.complexity === 'low' ? 'var(--positive-light)' :
    'var(--primary-light)'
  };
  
  color: ${props => 
    props.complexity === 'high' ? 'var(--negative)' :
    props.complexity === 'medium' ? 'var(--warning)' :
    props.complexity === 'low' ? 'var(--positive)' :
    'var(--primary)'
  };
`;

export const TimeIndicator = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--gray-600);
`;

export const RepairActions = styled('div')`
  display: flex;
  gap: var(--space-sm);
  align-items: center;
`;

export const ActionButton = styled('button')`
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--primary);
  border-radius: var(--radius-sm, 8px);
  background: var(--white);
  color: var(--primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium, 500);
  font-family: var(--font-main);
  cursor: pointer;
  transition: var(--transition, all 0.2s ease);
  
  &:hover {
    background: var(--primary);
    color: var(--white);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  &.primary {
    background: var(--primary);
    color: var(--white);
    
    &:hover {
      background: var(--primary-hover, #2563eb);
    }
  }
`;

// ======================================================
// Quote Builder Components
// ======================================================

/**
 * Quote builder panel - Integrated cost estimation
 */
export const QuotePanel = styled('div')`
  background: var(--white);
  border: 2px solid var(--primary);
  border-radius: var(--radius-sm, 8px);
  overflow: hidden;
  box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
`;

export const QuoteHeader = styled('div')`
  background: var(--primary);
  color: var(--white);
  padding: var(--space-lg);
  
  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold, 600);
    margin: 0;
  }
`;

export const QuoteContent = styled('div')`
  padding: var(--space-lg);
`;

export const QuoteEmpty = styled('div')`
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--gray-500);
`;

export const QuoteItems = styled('div')`
  margin-bottom: var(--space-lg);
`;

export const QuoteItem = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--gray-200);
  
  &:last-child {
    border-bottom: none;
  }
`;

export const QuoteItemInfo = styled('div')`
  flex: 1;
  margin-right: var(--space-md);
`;

export const QuoteItemName = styled('div')`
  font-size: var(--text-sm);
  font-weight: var(--font-medium, 500);
  color: var(--gray-900);
  margin-bottom: var(--space-xs);
`;

export const QuoteItemTime = styled('div')`
  font-size: var(--text-xs);
  color: var(--gray-600);
`;

export const QuoteItemActions = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

export const RemoveButton = styled('button')`
  padding: var(--space-xs);
  background: none;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-sm, 8px);
  color: var(--gray-600);
  cursor: pointer;
  transition: var(--transition, all 0.2s ease);
  
  &:hover {
    background: var(--negative-light, #fee2e2);
    border-color: var(--negative, #ef4444);
    color: var(--negative, #ef4444);
  }
`;

export const QuoteSummary = styled('div')`
  border-top: 2px solid var(--gray-200);
  padding-top: var(--space-lg);
`;

export const SummaryRow = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
  
  &.total {
    font-size: var(--text-lg);
    font-weight: var(--font-bold, 700);
    border-top: 1px solid var(--gray-200);
    padding-top: var(--space-md);
    margin-top: var(--space-md);
  }
`;

export const QuoteActions = styled('div')`
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
`;

// ======================================================
// Mobile Components
// ======================================================

/**
 * Mobile quote bar - Collapsible mobile quote summary
 */
export const MobileQuoteBar = styled('div')`
  position: sticky;
  bottom: 0;
  background: var(--white);
  border-top: 1px solid var(--gray-200);
  padding: var(--space-md);
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 1025px) {
    display: none;
  }
`;

export const MobileQuoteSummary = styled('button')`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: var(--radius-sm, 8px);
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  transition: var(--transition, all 0.2s ease);
  
  &:hover {
    background: var(--primary-hover, #2563eb);
  }
`;

// ======================================================
// Typography Components  
// ======================================================

/**
 * Clean typography components using design system
 */
export const CleanContainer = styled('div')`
  font-family: var(--font-main);
  max-width: var(--container-max, 1200px);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  width: 100%;
`;

export const CleanHeadingM = styled('h2')`
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin: 0 0 var(--space-xl) 0;
  line-height: var(--leading-tight);
  
  @media (max-width: 768px) {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-lg);
  }
  
  @media (max-width: 480px) {
    font-size: var(--text-xl);
  }
`;

export const CleanHeadingS = styled('h3')`
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin: 0 0 var(--space-lg) 0;
  line-height: var(--leading-tight);
  
  @media (max-width: 768px) {
    font-size: var(--text-lg);
    margin-bottom: var(--space-md);
  }
`;

export const CleanBody = styled('p')`
  font-size: var(--text-base);
  color: var(--gray-700);
  line-height: var(--leading-relaxed, 1.625);
  margin: 0 0 var(--space-lg) 0;
`;

export const CleanBodyS = styled('p')`
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: var(--leading-normal, 1.5);
  margin: 0 0 var(--space-md) 0;
`;

// ======================================================
// Utility Components
// ======================================================

/**
 * Loading and empty states
 */
export const CleanLoadingSpinner = styled('div')`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid var(--gray-200);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const EnhancedLoadingContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4xl) var(--space-xl);
  text-align: center;
  gap: var(--space-lg);
`;

export const EmptyStateContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4xl) var(--space-xl);
  text-align: center;
  gap: var(--space-lg);
  color: var(--gray-500);
`;

/**
 * Shared insight components for consistency
 */
export const InsightBody = styled('div')`
  font-size: var(--text-base);
  color: var(--gray-700);
  line-height: var(--leading-relaxed, 1.625);
  margin-bottom: var(--space-lg);
`;

export const ValueHighlight = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})`
  font-weight: var(--font-semibold, 600);
  color: ${props => props.color || 'var(--primary)'};
`;

export const InsightNote = styled('div')`
  background: var(--primary-light, #dbeafe);
  border: 1px solid var(--primary);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-sm, 8px);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
`;

export const StyledFooterNote = styled('div')`
  font-size: var(--text-sm);
  color: var(--gray-500);
  text-align: center;
  padding: var(--space-lg) 0;
  border-top: 1px solid var(--gray-200);
  margin-top: var(--space-xl);
`;

// ======================================================
// Tab Components - Clean Tab Interface
// ======================================================

/**
 * Tab container - Clean tab interface
 * Professional tabbed navigation with enhanced styling
 */
export const TabsContainer = styled('div')`
  background: var(--gray-50);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  border: 1px solid var(--gray-200);
  border-bottom: 2px solid var(--primary);
  margin-bottom: var(--space-2xl);
  padding: var(--space-md) var(--space-lg) 0;
  
  @media (max-width: 768px) {
    padding: var(--space-sm) var(--space-md) 0;
    margin-bottom: var(--space-xl);
  }
`;

export const TabsList = styled('div')`
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  padding-bottom: var(--space-xs);
  margin-bottom: calc(-1 * var(--space-xs));
  
  /* Clean scrollbar for mobile */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-400);
    border-radius: var(--radius-sm);
    
    &:hover {
      background: var(--gray-500);
    }
  }
  
  @media (max-width: 768px) {
    gap: var(--space-xs);
    padding: 0 var(--space-sm);
  }
`;

export const TabButton = styled('button', {
  shouldForwardProp: prop => prop !== 'active',
})`
  padding: var(--space-lg) var(--space-xl);
  border: none;
  background: ${props => props.active ? 'var(--primary)' : 'var(--white)'};
  color: ${props => props.active ? 'var(--white)' : 'var(--gray-700)'};
  font-family: var(--font-main);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: var(--transition-smooth);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  border: 1px solid var(--gray-200);
  border-bottom: ${props => props.active ? '3px solid var(--primary)' : '1px solid var(--gray-200)'};
  white-space: nowrap;
  position: relative;
  
  &:hover {
    background: ${props => props.active ? 'var(--primary-hover)' : 'var(--gray-50)'};
    color: ${props => props.active ? 'var(--white)' : 'var(--primary)'};
    border-color: ${props => props.active ? 'var(--primary-hover)' : 'var(--primary-light)'};
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    padding: var(--space-md) var(--space-lg);
    font-size: var(--text-sm);
    
    &:hover {
      transform: none;
    }
  }
  
  @media (max-width: 480px) {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-xs);
  }
`;

export const TabContent = styled('div', {
  shouldForwardProp: prop => prop !== 'active',
})`
  display: ${props => props.active ? 'block' : 'none'};
`;

/**
 * Tooltip with heading - Clean tooltip component
 */
export const HeadingWithTooltip = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  
  svg {
    color: ${props => props.iconColor || 'var(--primary)'};
    cursor: help;
    transition: var(--transition, all 0.2s ease);
    
    &:hover {
      opacity: 0.8;
    }
  }
`;