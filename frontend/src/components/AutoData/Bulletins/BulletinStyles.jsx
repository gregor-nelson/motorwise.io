import { styled } from '@mui/material/styles';

// ======================================================
// BULLETINS COMPONENT - ULTRA CLEAN MINIMAL DESIGN
// ======================================================
// 
// This file contains ALL styling for the BulletinsComponent
// using Ultra Clean Minimal design tokens - content-first design
// with generous white space and invisible architecture.
// Complete self-containment with no external dependencies.
//
// Design System: Ultra Clean Minimal
// ======================================================

// Ultra Clean Minimal Design Tokens - Complete System
const MinimalTokens = `
  /* Ultra Clean Minimal Design System - Always Include Exactly */
  :root {
    /* Ultra Clean Color Palette - Minimal */
    --gray-900: #1a1a1a;
    --gray-800: #2d2d2d;
    --gray-700: #404040;
    --gray-600: #525252;
    --gray-500: #737373;
    --gray-400: #a3a3a3;
    --gray-300: #d4d4d4;
    --gray-200: #e5e5e5;
    --gray-100: #f5f5f5;
    --gray-50: #fafafa;
    --white: #ffffff;

    /* Minimal Accent Colors */
    --primary: #3b82f6;
    --positive: #059669;
    --negative: #dc2626;
    --warning: #d97706;

    /* Clean Spacing - Generous White Space */
    --space-xs: 0.25rem;    /* 4px */
    --space-sm: 0.5rem;     /* 8px */
    --space-md: 1rem;       /* 16px */
    --space-lg: 1.5rem;     /* 24px */
    --space-xl: 2rem;       /* 32px */
    --space-2xl: 3rem;      /* 48px */
    --space-3xl: 4rem;      /* 64px */

    /* Typography - Clean Hierarchy */
    --text-xs: 0.75rem;     /* 12px */
    --text-sm: 0.875rem;    /* 14px */
    --text-base: 1rem;      /* 16px */
    --text-lg: 1.125rem;    /* 18px */
    --text-xl: 1.25rem;     /* 20px */
    --text-2xl: 1.5rem;     /* 24px */
    --text-3xl: 1.875rem;   /* 30px */
    --text-4xl: 2.25rem;    /* 36px */

    /* Clean Typography */
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;

    /* Minimal Transitions */
    --transition: all 0.15s ease;
  }

  /* Essential Animations Only */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// ======================================================
// Container Components - Ultra Clean Minimal
// ======================================================

/**
 * Clean Container Pattern - Ultra Minimal
 */
export const BulletinsContainer = styled('div')`
  ${MinimalTokens}

  font-family: var(--font-main);
  background: var(--white);
  color: var(--gray-900);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-3xl) var(--space-lg);
  animation: fadeIn 0.3s ease;

  @media (max-width: 767px) {
    padding: var(--space-2xl) var(--space-md);
  }
`;

/**
 * Clean Content Structure
 */
export const InsightsContainer = styled('div')`
  font-family: var(--font-main);
  width: 100%;
`;

// ======================================================
// Panel Components - Invisible Architecture
// ======================================================

/**
 * Clean Main Panel - No Visual Noise
 */
export const BulletinPanel = styled('div')`
  /* Pure minimal - no backgrounds, borders, or shadows */
  padding: var(--space-3xl);
  margin-bottom: var(--space-3xl);
  
  @media (max-width: 767px) {
    padding: var(--space-2xl);
  }
`;

/**
 * Clean Content Group - No Cards
 */
export const BulletinDetailPanel = styled('div')`
  /* No visual containers - pure content */
  padding: var(--space-xl);
  margin-bottom: var(--space-3xl);
  
  @media (max-width: 767px) {
    padding: var(--space-lg);
  }
`;

/**
 * Minimal Warning - Color Only
 */
export const WarningPanel = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-2xl);
  font-family: var(--font-main);
  
  svg {
    color: var(--negative);
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }
`;

/**
 * Full Screen Modal - Clean Overlay
 */
export const ModalOverlay = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  animation: fadeIn 0.2s ease;
`;

/**
 * Modal Content Container
 */
export const ModalContent = styled('div')`
  background: var(--white);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease;
  
  /* Clean scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    
    &:hover {
      background: var(--primary);
    }
  }
`;

/**
 * Modal Close Button
 */
export const ModalCloseButton = styled('button')`
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  background: var(--white);
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--text-xl);
  color: var(--gray-600);
  transition: var(--transition);
  z-index: 1;
  
  &:hover {
    color: var(--gray-900);
    background: var(--gray-50);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

// ======================================================
// Layout Components - Invisible Grid
// ======================================================

/**
 * Clean Grid Layout - No Visual Containers
 */
export const MainLayout = styled('div')`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-3xl);
  margin-bottom: var(--space-3xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
  }
`;

/**
 * Clean Sidebar - Pure Content
 */
export const Sidebar = styled('div')`
  /* No backgrounds or borders - pure minimal */
  padding: var(--space-xl);
  
  @media (max-width: 768px) {
    margin-bottom: var(--space-2xl);
  }
`;

/**
 * Clean Content Area - No Visual Noise
 */
export const ContentArea = styled('div')`
  /* Pure content - no decorations */
`;

// ======================================================
// Category Components - Minimal Design
// ======================================================

/**
 * Clean Category Container
 */
export const CategoryContainer = styled('div')`
  font-family: var(--font-main);
`;

export const CategoryTitle = styled('h3')`
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-2xl) 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
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
  font-size: var(--text-base);
  font-weight: ${props => props.isActive ? '500' : '400'};
  color: ${props => props.isActive ? 'var(--primary)' : 'var(--gray-700)'};
  padding: var(--space-md) 0;
  margin-bottom: var(--space-sm);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    color: var(--primary);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

export const CategoryCount = styled('span')`
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--gray-500);
  font-weight: 400;
`;

// ======================================================
// Search Components - Clean Interface
// ======================================================

/**
 * Clean Search Interface - No Visual Containers
 */
export const SearchContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
  font-family: var(--font-main);
  padding: var(--space-xl) 0;
  
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-lg);
  }
`;

export const SearchInput = styled('input')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-900);
  width: 100%;
  max-width: 320px;
  transition: var(--transition);
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-color: var(--primary);
  }
  
  &::placeholder {
    color: var(--gray-500);
  }
  
  @media (max-width: 767px) {
    max-width: 100%;
  }
`;

// ======================================================
// Button Components - Minimal Design
// ======================================================

/**
 * Clean Button - System Design
 */
export const GovButton = styled('button')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-900);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-50);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  &.govuk-button--secondary {
    background: var(--gray-100);
    color: var(--gray-700);
    
    &:hover {
      background: var(--gray-200);
    }
  }
`;

export const BackButton = styled(GovButton)`
  margin-bottom: var(--space-2xl);
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-xl);
  }
`;

export const ActionButton = styled('button')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: var(--primary);
  border: 1px solid var(--primary);
  color: var(--white);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-900);
    border-color: var(--gray-900);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

// ======================================================
// Bulletin List Components - Clean Lists
// ======================================================

/**
 * Clean Bulletin List - No Visual Containers
 */
export const BulletinsList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
`;

export const BulletinItem = styled('li')`
  /* No borders or backgrounds - pure content */
  padding: var(--space-xl) 0;
  border-bottom: 1px solid var(--gray-200);
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 767px) {
    padding: var(--space-lg) 0;
  }
`;

export const BulletinTitle = styled('h3')`
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  
  @media (max-width: 767px) {
    font-size: var(--text-lg);
  }
`;

export const BulletinDescription = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-700);
  line-height: 1.5;
  margin: 0 0 var(--space-lg) 0;
`;

// ======================================================
// Metadata Components - Minimal Display
// ======================================================

/**
 * Clean Metadata Display
 */
export const MetadataContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
`;

export const MetadataItem = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  
  svg {
    width: 16px;
    height: 16px;
    color: var(--gray-500);
  }
`;

// ======================================================
// Detail Components - Clean Content
// ======================================================

/**
 * Clean Content Lists
 */
export const DetailList = styled('ul')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: 1.5;
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
  line-height: 1.5;
  color: var(--gray-700);
  margin-bottom: var(--space-xl);
  padding-left: var(--space-lg);
  
  li {
    margin-bottom: var(--space-md);
  }
`;

export const SubSectionHeading = styled('h4')`
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin: var(--space-xl) 0 var(--space-lg) 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  
  @media (max-width: 767px) {
    font-size: var(--text-base);
  }
`;

// ======================================================
// Typography Components - System Design
// ======================================================

/**
 * Clean Container
 */
export const CleanContainer = styled('div')`
  font-family: var(--font-main);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-3xl) var(--space-lg);
  
  @media (max-width: 767px) {
    padding: var(--space-2xl) var(--space-md);
  }
`;

export const CleanHeadingM = styled('h2')`
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--gray-900);
  margin: 0 0 var(--space-2xl) 0;
  
  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`;

export const CleanHeadingS = styled('h3')`
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--gray-900);
  margin: 0 0 var(--space-lg) 0;
`;

export const CleanBody = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--gray-700);
  margin: 0 0 var(--space-lg) 0;
`;

export const CleanBodyS = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  line-height: 1.4;
  color: var(--gray-600);
  margin: 0 0 var(--space-md) 0;
`;

export const CleanLoadingSpinner = styled('div')`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid var(--gray-200);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

// ======================================================
// State Components - Clean States
// ======================================================

/**
 * Clean Loading State
 */
export const EnhancedLoadingContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl) 0;
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
  min-height: 300px;
  
  svg {
    margin-bottom: var(--space-lg);
    color: var(--gray-500);
  }
  
  h3 {
    font-family: var(--font-main);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--gray-900);
    margin: 0 0 var(--space-md) 0;
    line-height: 1.2;
  }
  
  p {
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-700);
    margin: 0;
    line-height: 1.5;
  }
`;

// ======================================================
// Shared Components - Clean Content
// ======================================================

/**
 * Clean Content Components
 */
export const InsightBody = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--gray-700);
  margin: 0 0 var(--space-2xl) 0;
`;

export const InsightTable = styled('table')`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  margin-bottom: var(--space-xl);
  
  th {
    background: var(--gray-900);
    color: var(--white);
    font-weight: 500;
    padding: var(--space-md);
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
  }
  
  td {
    padding: var(--space-md);
    border-bottom: 1px solid var(--gray-200);
    color: var(--gray-700);
    
    &:first-child {
      font-weight: 500;
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
  font-weight: 500;
  color: ${props => props.color || 'var(--primary)'};
`;

export const FactorList = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
`;

export const FactorItem = styled('div', {
  shouldForwardProp: prop => prop !== 'iconColor',
})`
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: 1.5;
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
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  font-family: var(--font-main);
  border-left: 3px solid var(--primary);
  
  svg {
    color: var(--primary);
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }
`;

export const StyledFooterNote = styled('div')`
  font-family: var(--font-main);
  padding: var(--space-xl);
  margin-top: var(--space-3xl);
  font-size: var(--text-sm);
  color: var(--gray-600);
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  border-top: 1px solid var(--gray-200);
  
  svg {
    color: var(--primary);
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }
  
  @media (max-width: 767px) {
    padding: var(--space-lg);
    margin-top: var(--space-2xl);
  }
`;