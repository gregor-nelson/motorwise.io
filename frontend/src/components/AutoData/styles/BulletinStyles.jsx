import { styled } from '@mui/material/styles';

// ======================================================
// BULLETINS COMPONENT - CLEAN DESIGN SYSTEM STYLES
// ======================================================
// 
// This file contains ALL styling for the BulletinsComponent
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
export const BulletinsContainer = styled('div')`
  font-family: var(--font-main);
  max-width: var(--container-max);
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
 * Main bulletin panel - Clean card design with primary accent
 */
export const BulletinPanel = styled('div')`
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-sm);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  margin-bottom: var(--space-lg);
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
  
  @media (max-width: 767px) {
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
  }
`;

/**
 * Detail panels with customizable accent colors
 */
export const BulletinDetailPanel = styled('div', {
  shouldForwardProp: prop => prop !== 'color',
})`
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-left: 4px solid ${props => props.color || 'var(--primary)'};
  border-radius: var(--radius-sm);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  margin-bottom: var(--space-lg);
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
  
  @media (max-width: 767px) {
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
  }
`;

/**
 * Warning panel - Clean alert styling with negative colors
 */
export const WarningPanel = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  background: var(--negative-light);
  border: 1px solid var(--negative);
  border-left: 4px solid var(--negative);
  border-radius: var(--radius-sm);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  font-family: var(--font-main);
  
  svg {
    color: var(--negative);
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
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-lg);
  }
`;

/**
 * Sidebar - Clean filtering interface
 */
export const Sidebar = styled('div')`
  flex: 0 0 280px;
  max-height: 600px;
  overflow: auto;
  padding-right: var(--space-sm);
  
  /* Clean scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-400);
    border-radius: var(--radius-sm);
    transition: var(--transition);
    
    &:hover {
      background: var(--gray-500);
    }
  }
  
  @media (max-width: 768px) {
    flex: 1 1 auto;
    max-height: none;
    padding-right: 0;
    margin-bottom: var(--space-xl);
  }
`;

/**
 * Content area - Scrollable bulletin list
 */
export const ContentArea = styled('div')`
  flex: 1 1 auto;
  max-height: 600px;
  overflow: auto;
  padding-right: var(--space-sm);
  
  /* Clean scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-400);
    border-radius: var(--radius-sm);
    transition: var(--transition);
    
    &:hover {
      background: var(--gray-500);
    }
  }
  
  @media (max-width: 768px) {
    max-height: none;
    padding-right: 0;
  }
`;

// ======================================================
// Category Components
// ======================================================

/**
 * Category container and navigation
 */
export const CategoryContainer = styled('div')`
  font-family: var(--font-main);
  margin-bottom: var(--space-xl);
`;

export const CategoryTitle = styled('h3')`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-800);
  margin: 0 0 var(--space-md) 0;
  line-height: var(--leading-tight);
`;

export const CategoryList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const CategoryItem = styled('li', {
  shouldForwardProp: prop => prop !== 'isActive',
})`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: ${props => props.isActive ? 'var(--font-semibold)' : 'var(--font-regular)'};
  color: ${props => props.isActive ? 'var(--primary)' : 'var(--gray-600)'};
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-xs);
  cursor: pointer;
  background: ${props => props.isActive ? 'var(--primary-light)' : 'transparent'};
  border-left: ${props => props.isActive ? '3px solid var(--primary)' : '3px solid transparent'};
  border-radius: var(--radius-sm);
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: var(--gray-50);
    color: var(--primary-hover);
    border-left-color: var(--primary-hover);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

export const CategoryCount = styled('span')`
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--gray-500);
  background: var(--gray-100);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-weight: var(--font-medium);
`;

// ======================================================
// Search Components
// ======================================================

/**
 * Search interface - Clean modern forms
 */
export const SearchContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  font-family: var(--font-main);
  
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-lg);
    margin-bottom: var(--space-2xl);
  }
`;

export const SearchInput = styled('input')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  padding: var(--space-md) var(--space-lg);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-sm);
  background: var(--white);
  color: var(--gray-900);
  width: 100%;
  max-width: 320px;
  transition: var(--transition);
  
  &:hover {
    border-color: var(--gray-400);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-500);
  }
  
  @media (max-width: 767px) {
    max-width: 100%;
  }
`;

// ======================================================
// Button Components
// ======================================================

/**
 * Button components - Clean modern design
 */
export const GovButton = styled('button')`
  font-family: var(--font-main);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-900);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  cursor: pointer;
  margin: 0;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    border-color: var(--gray-400);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  &.govuk-button--secondary {
    background: var(--gray-100);
    border-color: var(--gray-200);
    color: var(--gray-700);
    
    &:hover {
      background: var(--gray-50);
      color: var(--gray-900);
      border-color: var(--gray-300);
    }
  }
`;

export const BackButton = styled(GovButton)`
  background: var(--gray-100);
  border-color: var(--gray-200);
  color: var(--gray-700);
  margin-bottom: var(--space-lg);
  
  &:hover {
    background: var(--gray-50);
    color: var(--gray-900);
    border-color: var(--gray-300);
  }
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-xl);
  }
`;

export const ActionButton = styled('button')`
  font-family: var(--font-main);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--primary);
  border: 1px solid var(--primary);
  color: var(--white);
  border-radius: var(--radius-sm);
  transition: var(--transition);
  cursor: pointer;
  min-height: 36px;
  
  &:hover {
    background: var(--primary-hover);
    border-color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

// ======================================================
// Bulletin List Components
// ======================================================

/**
 * Bulletin list and items - Clean card design
 */
export const BulletinsList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
`;

export const BulletinItem = styled('li')`
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
    border-color: var(--gray-300);
  }
  
  @media (max-width: 767px) {
    padding: var(--space-lg);
  }
`;

export const BulletinTitle = styled('h3')`
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--gray-800);
  margin: 0 0 var(--space-md) 0;
  line-height: var(--leading-tight);
  
  @media (max-width: 767px) {
    font-size: var(--text-lg);
  }
`;

export const BulletinDescription = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-md) 0;
`;

// ======================================================
// Metadata Components
// ======================================================

/**
 * Metadata display - Clean badge styling
 */
export const MetadataContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
`;

export const MetadataItem = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--gray-600);
  background: var(--gray-50);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

// ======================================================
// Detail Components
// ======================================================

/**
 * Components for detailed bulletin content
 */
export const DetailList = styled('ul')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--gray-700);
  margin: 0 0 var(--space-xl) var(--space-lg);
  padding: 0;
  
  li {
    margin-bottom: var(--space-md);
  }
`;

export const OrderedList = styled('ol')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--gray-700);
  margin-bottom: var(--space-xl);
  padding-left: 20px;
  
  li {
    margin-bottom: var(--space-md);
  }
`;

export const SubSectionHeading = styled('h4')`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-800);
  margin: 0 0 var(--space-md) 0;
  margin-top: var(--space-lg);
  
  @media (max-width: 767px) {
    font-size: var(--text-base);
    margin-bottom: var(--space-lg);
  }
`;

// ======================================================
// Typography Components
// ======================================================

/**
 * Clean typography following design system
 */
export const CleanContainer = styled('div')`
  font-family: var(--font-main);
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  width: 100%;
  
  @media (max-width: 767px) {
    padding: 0 var(--space-md);
  }
`;

export const CleanHeadingM = styled('h2')`
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--gray-800);
  margin: 0 0 var(--space-lg) 0;
  
  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`;

export const CleanHeadingS = styled('h3')`
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--gray-800);
  margin: 0 0 var(--space-md) 0;
`;

export const CleanBody = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--gray-600);
  margin: 0 0 var(--space-md) 0;
`;

export const CleanBodyS = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--gray-600);
  margin: 0 0 var(--space-sm) 0;
`;

export const CleanLoadingSpinner = styled('div')`
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: cleanSpin 1s linear infinite;
  
  @keyframes cleanSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// ======================================================
// State Components
// ======================================================

/**
 * Loading and empty states
 */
export const EnhancedLoadingContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl) 0;
  margin: var(--space-xl) 0;
  text-align: center;
  gap: var(--space-lg);
`;

export const StyledEmptyStateContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  text-align: center;
  min-height: 400px;
  
  svg {
    margin-bottom: var(--space-lg);
    color: var(--gray-400);
  }
  
  h3 {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--gray-700);
    margin: 0 0 var(--space-md) 0;
  }
  
  p {
    font-family: var(--font-main);
    color: var(--gray-600);
    margin: 0;
  }
`;

// ======================================================
// Shared Components from VehicleAnalysis
// ======================================================

/**
 * Components that maintain consistency with other parts of the app
 */
export const InsightBody = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--gray-600);
  margin: 0 0 var(--space-lg) 0;
`;

export const InsightTable = styled('table')`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  margin-bottom: var(--space-xl);
  
  th {
    background: var(--primary);
    color: var(--white);
    font-weight: var(--font-semibold);
    padding: var(--space-md);
    text-align: left;
    border: 1px solid var(--primary);
  }
  
  td {
    padding: var(--space-md);
    border: 1px solid var(--gray-200);
    color: var(--gray-700);
    
    &:first-child {
      font-weight: var(--font-semibold);
    }
  }
  
  tr:nth-child(even) {
    background: var(--gray-50);
  }
`;

export const ValueHighlight = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})`
  font-family: var(--font-main);
  font-weight: var(--font-semibold);
  color: ${props => props.color || 'var(--primary)'};
`;

export const FactorList = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
`;

export const FactorItem = styled('div', {
  shouldForwardProp: prop => prop !== 'iconColor',
})`
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--gray-700);
  
  svg {
    color: ${props => props.iconColor || 'var(--primary)'};
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }
`;

export const InsightNote = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  background: var(--primary-light);
  border: 1px solid var(--primary);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-sm);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  font-family: var(--font-main);
  
  svg {
    color: var(--primary);
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }
`;

export const StyledFooterNote = styled('div')`
  font-family: var(--font-main);
  background: var(--gray-50);
  padding: var(--space-lg);
  margin-top: var(--space-xl);
  border-top: 4px solid var(--primary);
  font-size: var(--text-sm);
  color: var(--gray-600);
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  
  svg {
    color: var(--primary);
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }
  
  @media (max-width: 767px) {
    padding: var(--space-xl);
    font-size: var(--text-base);
    margin-top: var(--space-2xl);
  }
`;