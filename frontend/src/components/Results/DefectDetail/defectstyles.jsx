import { styled } from '@mui/material/styles';
import{ MarketDashTokens as MinimalTokens } from '../../../styles/styles';


export const DefectDetailContainer = styled('div')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  background: var(--white);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--gray-900);
  line-height: 1.4;

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-xl) var(--space-md);
  }
`;

// Generic container for different content areas
export const ContentContainer = styled('div')`
  font-family: var(--font-main);
  background: var(--white);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--gray-900);
  line-height: 1.6;

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-xl) var(--space-md);
  }
`;

// =============== TYPOGRAPHY COMPONENTS ===============

// Main section header
export const SectionHeader = styled('div')`
  margin-bottom: var(--space-3xl);

  @media (max-width: var(--mobile-max)) {
    margin-bottom: var(--space-2xl);
  }
`;

// Primary title
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

// Secondary title
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

// Tertiary title
export const CardTitle = styled('h3')`
  margin: 0 0 var(--space-sm) 0;
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-base);
  }
`;

// Body text
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

// Small text for descriptions
export const SmallText = styled('p')`
  margin: 0 0 var(--space-md) 0;
  color: var(--gray-600);
  font-size: var(--text-sm);
  font-family: var(--font-main);
  line-height: 1.4;

  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xs);
  }
`;

// Extra small text for annotations
export const TinyText = styled('span')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 400;
  color: var(--gray-600);
  line-height: 1.4;
`;

// =============== ENHANCED DEFECT DETAIL COMPONENTS ===============

// Expandable section container
export const ExpandableSection = styled('div')`
  margin-bottom: var(--space-xl);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  overflow: hidden;
  background: var(--white);
`;

// Expandable section header (clickable)
export const SectionToggle = styled('button')`
  width: 100%;
  padding: var(--space-lg);
  background: var(--gray-50);
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  transition: var(--transition);
  text-align: left;
  min-height: var(--touch-target-min);
  
  &:hover {
    background: var(--gray-100);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
  }

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    font-size: var(--text-base);
  }
`;

// Expandable section content
export const SectionContent = styled('div')`
  padding: var(--space-lg);
  border-top: 1px solid var(--gray-200);
  line-height: 1.6;

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
  }
`;

// Defect categories grid
export const DefectCategoriesGrid = styled('div')`
  display: grid;
  gap: var(--space-lg);
  margin-top: var(--space-lg);

  @media (max-width: var(--mobile-max)) {
    gap: var(--space-md);
  }
`;

// Individual defect category card
export const DefectCategoryCard = styled('div', {
  shouldForwardProp: prop => prop !== 'category',
})`
  padding: var(--space-lg);
  border-radius: 8px;
  border-left: 4px solid ${props => {
    switch (props.category?.toLowerCase()) {
      case 'dangerous': return 'var(--negative)';
      case 'major': return 'var(--warning)';
      case 'minor': return 'var(--positive)';
      case 'advisory': return 'var(--primary)';
      default: return 'var(--gray-400)';
    }
  }};
  background: ${props => {
    switch (props.category?.toLowerCase()) {
      case 'dangerous': return 'rgba(220, 38, 38, 0.05)';
      case 'major': return 'rgba(217, 119, 6, 0.05)';
      case 'minor': return 'rgba(5, 150, 105, 0.05)';
      case 'advisory': return 'rgba(59, 130, 246, 0.05)';
      default: return 'var(--gray-50)';
    }
  }};

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
  }
`;

// Category header with icon
export const CategoryHeader = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
`;

// Category icon
export const CategoryIcon = styled('span', {
  shouldForwardProp: prop => prop !== 'category',
})`
  font-size: var(--text-lg);
  ${props => {
    switch (props.category?.toLowerCase()) {
      case 'dangerous': return 'content: "🔴";';
      case 'major': return 'content: "🟠";';
      case 'minor': return 'content: "🟡";';
      case 'advisory': return 'content: "🔵";';
      default: return 'content: "⚪";';
    }
  }}
`;

// Category title
export const CategoryTitle = styled('h4')`
  margin: 0;
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-900);
`;

// Procedure step container
export const ProcedureStep = styled('div')`
  margin-bottom: var(--space-lg);
  padding-left: var(--space-lg);
  border-left: 2px solid var(--gray-200);
  position: relative;

  &::before {
    content: attr(data-step);
    position: absolute;
    left: -12px;
    top: 0;
    background: var(--primary);
    color: var(--white);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    font-weight: 600;
  }

  @media (max-width: var(--mobile-max)) {
    padding-left: var(--space-md);
    margin-bottom: var(--space-md);
  }
`;

// Technical specification box
export const TechnicalBox = styled('div')`
  background: var(--gray-50);
  padding: var(--space-lg);
  border-radius: 8px;
  margin: var(--space-lg) 0;
  border: 1px solid var(--gray-200);

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    margin: var(--space-md) 0;
  }
`;

// Cross-reference link
export const CrossReference = styled('button')`
  background: none;
  border: none;
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
  font-family: var(--font-main);
  font-size: inherit;
  padding: 0;
  transition: var(--transition);
  
  &:hover {
    color: var(--gray-700);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

// Alert box for important information
export const AlertBox = styled('div', {
  shouldForwardProp: prop => prop !== 'type',
})`
  padding: var(--space-lg);
  border-radius: 8px;
  margin: var(--space-lg) 0;
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--negative)';
      case 'info': return 'var(--primary)';
      default: return 'var(--gray-400)';
    }
  }};
  background: ${props => {
    switch (props.type) {
      case 'warning': return 'rgba(217, 119, 6, 0.1)';
      case 'danger': return 'rgba(220, 38, 38, 0.1)';
      case 'info': return 'rgba(59, 130, 246, 0.1)';
      default: return 'var(--gray-50)';
    }
  }};

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    margin: var(--space-md) 0;
  }
`;

// =============== INTERACTIVE COMPONENTS ===============

// Standard button
export const Button = styled('button')`
  padding: var(--space-sm) var(--space-lg);
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 4px;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  min-height: var(--touch-target-min);
  
  &:hover {
    background: var(--gray-800);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--gray-400);
  }
`;

// Secondary button style
export const SecondaryButton = styled('button')`
  background: none;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  padding: var(--space-xs) var(--space-sm);
  color: var(--gray-700);
  cursor: pointer;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  transition: var(--transition);
  min-height: var(--touch-target-min);
  
  &:hover {
    background: var(--gray-100);
    border-color: var(--gray-400);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 4px;
  }

  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xs);
    padding: var(--space-xs);
  }
`;

// Link button style
export const LinkButton = styled('button')`
  background: none;
  border: none;
  font-family: var(--font-main);
  color: var(--primary);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 400;
  font-size: var(--text-sm);
  padding: 0;
  transition: var(--transition);
  
  &:hover {
    color: var(--gray-700);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 2px;
  }

  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xs);
    min-height: var(--touch-target-min);
  }
`;

// Standard input
export const Input = styled('input')`
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-900);
  background: var(--white);
  transition: var(--transition);
  min-height: var(--touch-target-min);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
  
  &:disabled {
    background: var(--gray-50);
    color: var(--gray-500);
    cursor: not-allowed;
  }

  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-base);
  }
`;

// =============== CARD AND LIST COMPONENTS ===============

// Standard card component
export const Card = styled('div')`
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  padding: var(--space-lg);
  cursor: pointer;
  transition: var(--transition);
  background: var(--white);
  min-height: var(--touch-target-min);
  
  &:hover {
    border-color: var(--primary);
    background: var(--gray-50);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
  }
`;

// Grid layout for cards
export const CardGrid = styled('div')`
  display: grid;
  gap: var(--space-lg);

  @media (max-width: var(--mobile-max)) {
    gap: var(--space-md);
  }
`;

// Standard list components
export const List = styled('ul')`
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

// =============== STATUS AND BADGE COMPONENTS ===============

// Category badge with semantic colors
export const CategoryBadge = styled('span', {
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

// Type badge for search results
export const TypeBadge = styled('span', {
  shouldForwardProp: prop => prop !== 'type',
})`
  display: inline-block;
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: capitalize;
  margin-bottom: var(--space-sm);
  
  color: ${props => {
    switch(props.type) {
      case 'section': return 'var(--warning)';
      case 'subsection': return 'var(--primary)';
      case 'item': return 'var(--positive)';
      default: return 'var(--gray-700)';
    }
  }};
`;

// Small category badge
export const SmallCategoryBadge = styled('span', {
  shouldForwardProp: prop => prop !== 'category',
})`
  display: inline-block;
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: uppercase;
  margin-right: var(--space-sm);
  margin-bottom: var(--space-xs);
  
  color: ${props => {
    switch(props.category?.toLowerCase()) {
      case 'dangerous': return 'var(--negative)';
      case 'major': return 'var(--warning)';
      case 'minor':
      case 'advisory': return 'var(--positive)';
      default: return 'var(--gray-700)';
    }
  }};
`;

// =============== LAYOUT COMPONENTS ===============

// Header with border
export const HeaderSection = styled('div')`
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--gray-200);

  @media (max-width: var(--mobile-max)) {
    margin-bottom: var(--space-xl);
  }
`;

// Flex container
export const FlexContainer = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
`;

// Section spacing
export const Section = styled('div')`
  margin-bottom: var(--space-3xl);
  
  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: var(--mobile-max)) {
    margin-bottom: var(--space-2xl);
  }
`;

// =============== BREADCRUMB COMPONENTS ===============

// Breadcrumb container
export const BreadcrumbContainer = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  
  @media (max-width: var(--mobile-max)) {
    margin-bottom: var(--space-md);
    font-size: var(--text-xs);
  }
`;

// Breadcrumb path text
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

// Breadcrumb separator
export const BreadcrumbSeparator = styled('span')`
  color: var(--gray-400);
  user-select: none;
  font-family: var(--font-main);
`;

// =============== LOADING AND ERROR STATES ===============

// Loading container
export const LoadingContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  flex-direction: column;
  gap: var(--space-lg);
`;

// Loading spinner
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

// Loading text
export const LoadingText = styled('div')`
  font-family: var(--font-main);
  color: var(--gray-600);
  font-size: var(--text-sm);
  text-align: center;
`;

// Error container
export const ErrorContainer = styled('div')`
  text-align: center;
  padding: var(--space-xl);
`;

// Error message
export const ErrorMessage = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--negative);
  line-height: 1.5;
`;

// =============== MODAL COMPONENTS ===============

// Modal overlay
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
  padding: var(--space-2xl);
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    align-items: stretch;
  }
`;

// Modal content
export const ModalContent = styled('div')`
  background: var(--white);
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease;
  font-family: var(--font-main);
  
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--gray-400);
  }

  @media (max-width: var(--mobile-max)) {
    max-height: 100vh;
  }
`;

// Modal close button
export const ModalCloseButton = styled('button')`
  position: absolute;
  top: var(--space-2xl);
  right: var(--space-2xl);
  background: var(--white);
  border: none;
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  color: var(--gray-600);
  z-index: 1;
  transition: var(--transition);
  font-family: var(--font-main);
  
  &:hover {
    color: var(--gray-900);
    background: var(--gray-50);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  @media (max-width: var(--mobile-max)) {
    top: var(--space-xl);
    right: var(--space-xl);
    width: var(--touch-target-comfortable);
    height: var(--touch-target-comfortable);
    font-size: 20px;
  }
`;

// =============== SPECIAL CONTENT COMPONENTS ===============

// Highlighted text/search results
export const HighlightText = styled('mark')`
  background: var(--gray-100);
  padding: var(--space-xs);
  font-weight: 600;
  color: var(--gray-900);
`;

// Preview containers
export const PreviewContainer = styled('div')`
  margin-top: var(--space-sm);
  padding: var(--space-lg);
  background: var(--gray-50);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-700);
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    font-size: var(--text-xs);
  }
`;

// Code block
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

// Inline code
export const InlineCode = styled('code')`
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--gray-100);
  padding: var(--space-xs) var(--space-sm);
  color: var(--gray-900);
`;

// =============== UTILITY COMPONENTS ===============

// Responsive wrapper
export const ResponsiveWrapper = styled('div')`
  /* Pure wrapper - no styling, for responsive containers */
`;

// Section divider
export const SectionDivider = styled('div')`
  height: var(--space-3xl);

  @media (max-width: var(--mobile-max)) {
    height: var(--space-2xl);
  }
`;

// Context hint for forms
export const ContextHint = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  color: var(--gray-600);
  margin-top: var(--space-xs);
`;

// Count display
export const CountDisplay = styled('div')`
  font-size: var(--text-xs);
  color: var(--gray-500);
  font-weight: 500;
  font-family: var(--font-main);
`;

// Match type display
export const MatchType = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  color: var(--gray-500);
  margin-bottom: var(--space-sm);
`;

// No results state
export const NoResults = styled('div')`
  text-align: center;
  padding: var(--space-3xl) var(--space-2xl);
  font-family: var(--font-main);
  color: var(--gray-600);
  
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-2xl) var(--space-lg);
  }
`;