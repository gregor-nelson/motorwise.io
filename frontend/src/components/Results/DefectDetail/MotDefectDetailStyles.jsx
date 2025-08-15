import { styled } from '@mui/material/styles';

// Mobile-Ready Design System - Future-proof foundation
const MinimalTokens = `
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
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;

    /* Typography - Clean Hierarchy */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;

    /* Clean Typography */
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;

    /* Mobile-Ready Breakpoints - Future expansion ready */
    --mobile-max: 767px;
    --tablet-min: 768px;
    --desktop-min: 1024px;

    /* Touch Targets - Accessibility standard */
    --touch-target-min: 44px;
    --touch-target-comfortable: 48px;

    /* Minimal Transitions */
    --transition: all 0.15s ease;
    --transition-fast: all 0.1s ease;
  }
`;

// =============== MOBILE-READY MIXINS ===============

// Future-proof mobile mixin - easily extensible
const mobileStyles = `
  @media (max-width: var(--mobile-max)) {
    /* Mobile styles here - can be extended in future */
  }
`;

// =============== MAIN CONTAINER ===============

// Mobile-Ready Detail Container - Future enhancement ready
export const DefectDetailContainer = styled('div')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  background: var(--white);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--gray-900);

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-xl) var(--space-md);
    /* Future mobile enhancements can be added here */
  }
`;

// =============== SECTION COMPONENTS ===============

// Minimal Section Header - Following DVLADataHeader patterns exactly
export const DefectSectionHeader = styled('div')`
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

  @media (max-width: var(--mobile-max)) {
    margin-bottom: var(--space-2xl);
    
    & h1 {
      font-size: var(--text-xl);
    }
  }
`;

// Minimal Defect Section - Following DVLADataHeader patterns
export const DefectSection = styled('div')`
  margin-bottom: var(--space-3xl);
  
  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: var(--mobile-max)) {
    margin-bottom: var(--space-2xl);
  }
`;

// =============== CONTENT COMPONENTS ===============

// Clean Content Area - No visual containers
export const DefectContent = styled('div')`
  /* Pure minimal - no styling, just content flow */
`;

// Clean Detail Content - Following DVLADataHeader patterns
export const DetailContent = styled('div')`
  /* Pure minimal - no styling, following DVLADataHeader approach */
`;

// =============== TYPOGRAPHY COMPONENTS ===============

// Main Section Title - Following DVLADataHeader patterns exactly
export const SectionTitle = styled('h1')`
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xl);
    margin-bottom: var(--space-md);
  }
`;

// Sub Title for sections - Following DVLADataHeader patterns
export const SubTitle = styled('h2')`
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: var(--space-xl) 0 var(--space-lg) 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-lg);
    margin: var(--space-lg) 0 var(--space-md) 0;
  }
`;

// Body text for paragraphs - Following DVLADataHeader patterns
export const BodyText = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--gray-900);
  line-height: 1.4;
  margin: 0 0 var(--space-md) 0;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-sm);
    margin-bottom: var(--space-sm);
  }
`;

// Small text for annotations
export const SmallText = styled('span')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--gray-600);
  line-height: 1.4;

  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xs);
  }
`;

// =============== INTERACTIVE COMPONENTS ===============

// Clean link styling (semantic color only)
export const Link = styled('a')`
  font-family: var(--font-main);
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
  
  &:hover {
    color: var(--gray-900);
    text-decoration: underline;
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

// =============== STATUS INDICATORS ===============

// Minimal Status Badge - Following DVLADataHeader StatusIndicator pattern exactly
export const CategoryTag = styled('span', {
  shouldForwardProp: prop => prop !== 'category',
})`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  display: inline-block;
  margin-bottom: var(--space-lg);
  
  ${({ category }) => {
    switch (category?.toLowerCase()) {
      case 'dangerous':
        return `color: var(--negative);`;
      case 'major':
        return `color: var(--warning);`;
      case 'minor':
      case 'advisory':
        return `color: var(--positive);`;
      default:
        return `color: var(--gray-700);`;
    }
  }}
`;

// =============== LIST COMPONENTS ===============

// Clean list styling - optimized for content readability
export const DefectList = styled('ul')`
  list-style: disc;
  padding-left: var(--space-xl);
  margin: var(--space-md) 0;
  
  & li {
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-700);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  @media (max-width: var(--mobile-max)) {
    padding-left: var(--space-lg);
    
    & li {
      font-size: var(--text-sm);
      margin-bottom: var(--space-xs);
    }
  }
`;

// Clean ordered list - optimized for content
export const OrderedList = styled('ol')`
  list-style: decimal;
  padding-left: var(--space-xl);
  margin: var(--space-md) 0;
  
  & li {
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-700);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  @media (max-width: var(--mobile-max)) {
    padding-left: var(--space-lg);
    
    & li {
      font-size: var(--text-sm);
      margin-bottom: var(--space-xs);
    }
  }
`;

// =============== BREADCRUMB COMPONENTS ===============

// Clean breadcrumb path - Following DVLADataHeader spacing patterns
export const BreadcrumbPath = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--space-2xl);
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  & strong {
    color: var(--gray-900);
    font-weight: 600;
  }
  
  & span {
    margin: 0 var(--space-xs);
    color: var(--gray-400);
  }

  @media (max-width: var(--mobile-max)) {
    margin-bottom: var(--space-xl);
    font-size: var(--text-xs);
  }
`;

// =============== CONTENT FORMATTING COMPONENTS ===============

// Ultra Clean inset text - Pure minimal approach (no background like DVLADataHeader)
export const InsetText = styled('div')`
  /* Pure minimal - no background, no borders, following DVLADataHeader approach */
  margin: var(--space-lg) 0;
  
  & p {
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-700);
    line-height: 1.5;
    margin: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    
    &:not(:last-child) {
      margin-bottom: var(--space-sm);
    }
  }

  @media (max-width: var(--mobile-max)) {
    margin: var(--space-md) 0;
    
    & p {
      font-size: var(--text-sm);
    }
  }
`;

// Ultra Clean code block - Minimal background approach like DVLADataHeader
export const CodeBlock = styled('pre')`
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--gray-50);
  padding: var(--space-lg);
  margin: var(--space-lg) 0;
  overflow-x: auto;
  line-height: 1.5;
  color: var(--gray-900);
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    font-size: var(--text-xs);
    margin: var(--space-md) 0;
  }
`;

// =============== LOADING AND ERROR STATES ===============

// Ultra Clean Loading State (from reference pattern)
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

// Clean error state
export const ErrorContainer = styled('div')`
  text-align: center;
  padding: var(--space-xl);
`;

export const ErrorMessage = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--negative);
  line-height: 1.5;
`;

// =============== SECTION DIVIDERS ===============

// Clean Section Spacing - Following DVLADataHeader patterns exactly
export const SectionDivider = styled('div')`
  height: var(--space-3xl);

  @media (max-width: var(--mobile-max)) {
    height: var(--space-2xl);
  }
`;

// =============== INLINE ELEMENTS ===============

// Ultra Clean inline elements - Following DVLADataHeader minimal approach
export const InlineCode = styled('code')`
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--gray-100);
  padding: var(--space-xs) var(--space-sm);
  color: var(--gray-900);
`;

export const InlineStrong = styled('strong')`
  font-family: var(--font-main);
  font-weight: 600;
  color: var(--gray-900);
`;

export const InlineEmphasis = styled('em')`
  font-family: var(--font-main);
  font-style: italic;
  color: var(--gray-900);
`;

// =============== RESPONSIVE WRAPPER ===============

// Minimal responsive wrapper - Following DVLADataHeader patterns exactly
export const ResponsiveWrapper = styled('div')`
  /* Pure wrapper - no styling, following DVLADataHeader approach */
`;