import { styled } from '@mui/material/styles';

// Minimal Clean Design System - Ultra Restrained (exact copy from reference)
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
    --text-4xl: 2.25rem;

    /* Clean Typography */
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;

    /* Minimal Transitions */
    --transition: all 0.15s ease;
  }
`;

// =============== MAIN CONTAINER ===============

// Ultra Clean Detail Container - Advanced grid breakout strategy
export const DefectDetailContainer = styled('div')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  background: var(--white);
  margin-top: var(--space-xl);
  margin-bottom: var(--space-xl);
  color: var(--gray-900);
  
  /* Advanced grid breakout - escapes CSS Grid column constraints completely */
  position: relative;
  
  /* Break out of grid column by spanning all columns and repositioning */
  grid-column: 1 / -1;
  margin-left: calc(-100vw + 50%);
  margin-right: calc(-100vw + 50%);
  left: 50%;
  right: 50%;
  width: 100vw;
  max-width: 100vw;
  
  /* Ensure content is accessible and doesn't break layout */
  overflow-x: auto;
  z-index: 10;
  
  /* Visual distinction */
  border-top: 1px solid var(--gray-200);
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
  
  /* Smooth reveal animation */
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 767px) {
    margin-top: var(--space-lg);
    margin-bottom: var(--space-lg);
    /* On mobile, use simpler breakout */
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
`;

// =============== SECTION COMPONENTS ===============

// Clean Section Header - Typography Only, more compact for content
export const DefectSectionHeader = styled('div')`
  margin-bottom: var(--space-xl);

  & h1, & h2, & h3 {
    margin: 0;
    font-family: var(--font-main);
    color: var(--gray-900);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  & h1 {
    font-size: var(--text-2xl);
    font-weight: 600;
  }

  & h2 {
    font-size: var(--text-xl);
    font-weight: 600;
  }

  & h3 {
    font-size: var(--text-lg);
    font-weight: 500;
  }

  @media (max-width: 767px) {
    margin-bottom: var(--space-lg);
    
    & h1 {
      font-size: var(--text-xl);
    }

    & h2 {
      font-size: var(--text-lg);
    }
  }
`;

// Minimal Defect Section - No cards, more compact spacing for content
export const DefectSection = styled('div')`
  margin-bottom: var(--space-2xl);
  
  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 767px) {
    margin-bottom: var(--space-xl);
  }
`;

// =============== CONTENT COMPONENTS ===============

// Clean Content Area - No visual containers
export const DefectContent = styled('div')`
  /* Pure minimal - no styling, just content flow */
`;

// Clean Detail Content - Centered within full-width container
export const DetailContent = styled('div')`
  margin: var(--space-lg) auto;
  padding: var(--space-xl);
  max-width: 1200px;
  width: 100%;
  box-sizing: border-box;
  background: var(--white);
  
  @media (max-width: 767px) {
    margin: var(--space-md) auto;
    padding: var(--space-lg);
  }
  
  @media (max-width: 480px) {
    padding: var(--space-md);
  }
`;

// =============== TYPOGRAPHY COMPONENTS ===============

// Main Section Title - more compact for detailed content
export const SectionTitle = styled('h1')`
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-xl) 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 767px) {
    font-size: var(--text-xl);
    margin-bottom: var(--space-lg);
  }
`;

// Sub Title for sections - more compact
export const SubTitle = styled('h2')`
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 767px) {
    font-size: var(--text-lg);
    margin-bottom: var(--space-md);
  }
`;

// Body text for paragraphs - optimized for detailed content
export const BodyText = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--gray-700);
  line-height: 1.5;
  margin: 0 0 var(--space-md) 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 767px) {
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

  @media (max-width: 767px) {
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

// Minimal Status Badge - Color only, no decoration (from reference pattern)
export const CategoryTag = styled('span', {
  shouldForwardProp: prop => prop !== 'category',
})`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 600;
  display: inline-block;
  margin-bottom: var(--space-lg);
  
  ${({ category }) => {
    switch (category?.toLowerCase()) {
      case 'dangerous':
        return `color: var(--negative);`;
      case 'major':
        return `color: var(--warning);`;
      case 'minor':
        return `color: var(--positive);`;
      case 'advisory':
        return `color: var(--gray-600);`;
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

  @media (max-width: 767px) {
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

  @media (max-width: 767px) {
    padding-left: var(--space-lg);
    
    & li {
      font-size: var(--text-sm);
      margin-bottom: var(--space-xs);
    }
  }
`;

// =============== BREADCRUMB COMPONENTS ===============

// Clean breadcrumb path - more compact
export const BreadcrumbPath = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--space-lg);
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

  @media (max-width: 767px) {
    margin-bottom: var(--space-md);
    font-size: var(--text-xs);
  }
`;

// =============== CONTENT FORMATTING COMPONENTS ===============

// Clean inset text - more compact for content
export const InsetText = styled('div')`
  background: var(--gray-50);
  padding: var(--space-lg);
  margin: var(--space-lg) 0;
  width: 100%;
  overflow-x: auto;
  
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

  @media (max-width: 767px) {
    padding: var(--space-md);
    margin: var(--space-md) 0;
    
    & p {
      font-size: var(--text-sm);
    }
  }
`;

// Clean code block styling - better for detailed content
export const CodeBlock = styled('pre')`
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--gray-50);
  padding: var(--space-lg);
  margin: var(--space-md) 0;
  overflow-x: auto;
  line-height: 1.5;
  color: var(--gray-900);
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;

  @media (max-width: 767px) {
    padding: var(--space-md);
    font-size: var(--text-xs);
    margin: var(--space-sm) 0;
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

// Clean Section Spacing - More compact for content
export const SectionDivider = styled('div')`
  height: var(--space-xl);

  @media (max-width: 767px) {
    height: var(--space-lg);
  }
`;

// =============== FORM STYLING COMPATIBILITY ===============

// Clean inline elements for formatted text
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

// Minimal responsive wrapper - optimized for content flow
export const ResponsiveWrapper = styled('div')`
  width: 100%;
  overflow-x: auto;
  /* Pure wrapper - no styling, just ensure content can flow */
`;