import { styled } from '@mui/material/styles';

// Ultra Clean Container - No borders, minimal styling
export const LabourTimesContainer = styled('div')`
  font-family: var(--font-main);
  background: var(--white);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--gray-900);

  @media (max-width: 767px) {
    padding: var(--space-xl) var(--space-md);
  }
`;

// Clean Insights Container - Pure minimal
export const InsightsContainer = styled('div')`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-xl);

  @media (max-width: 767px) {
    padding: 0 var(--space-md);
  }
`;

// Minimal Labour Times Panel - No Borders, Just Clean Spacing
export const LabourTimesPanel = styled('div')`
  /* No background, borders, or shadows - pure minimal */
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

// Minimal Detail Panel - Clean Layout Without Visual Noise
export const DetailPanel = styled('div', {
  shouldForwardProp: prop => prop !== 'color',
})`
  /* Pure minimal - no styling, just clean spacing */
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

// Clean Warning Panel - Minimal Alert
export const WarningPanel = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  background: var(--gray-50);
  padding: var(--space-xl);
  margin-bottom: var(--space-3xl);
  font-family: var(--font-main);
  
  svg {
    color: var(--negative);
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }

  @media (max-width: 767px) {
    padding: var(--space-lg);
    margin-bottom: var(--space-2xl);
  }
`;


// ======================================================
// Repair Display Components
// ======================================================

// Clean Repair Grid - Simple Layout
export const RepairGrid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-3xl);
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
    margin-bottom: var(--space-2xl);
  }
`;

// Minimal Repair Card - No Borders, Just Clean Spacing
export const RepairCard = styled('div', {
  shouldForwardProp: prop => prop !== 'complexity',
})`
  /* No background, borders, or shadows - pure minimal */
  padding: var(--space-xl);
  
  @media (max-width: 767px) {
    padding: var(--space-lg);
  }
`;

// Clean Repair Header
export const RepairHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-lg);
  gap: var(--space-md);
`;

// Restrained Title Typography
export const RepairTitle = styled('h3')`
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--gray-900);
  line-height: 1.3;
  margin: 0;
  flex: 1;
`;

// Clean Time Display
export const RepairTime = styled('div')`
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  flex-shrink: 0;
`;

export const TimeValue = styled('span')`
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.2;
`;

export const TimeUnit = styled('span')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--gray-600);
`;

// Ultra Clean Repair Meta
export const RepairMeta = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
`;

// Minimal Complexity Badge - Just Color, No Decorations
export const ComplexityBadge = styled('span', {
  shouldForwardProp: prop => prop !== 'complexity',
})`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  
  color: ${
    props => {
      switch (props.complexity) {
        case 'high': return 'var(--negative)';
        case 'medium': return 'var(--warning)';
        case 'low': return 'var(--positive)';
        default: return 'var(--primary)';
      }
    }
  };
`;


// Minimal Action Button
export const ActionButton = styled('button')`
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: var(--primary);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-main);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    color: var(--gray-900);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  &.primary {
    background: var(--primary);
    color: var(--white);
    padding: var(--space-md) var(--space-lg);
    
    &:hover {
      opacity: 0.9;
    }
  }
`;


// ======================================================
// Typography Components  
// ======================================================

// Clean Typography - Minimal Hierarchy
export const CleanContainer = styled('div')`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-xl);

  @media (max-width: 767px) {
    padding: 0 var(--space-md);
  }
`;

export const CleanHeadingM = styled('h2')`
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-2xl) 0;
  line-height: 1.2;
  letter-spacing: -0.02em;

  @media (max-width: 767px) {
    font-size: var(--text-xl);
    margin-bottom: var(--space-xl);
  }
`;

export const CleanHeadingS = styled('h3')`
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.3;

  @media (max-width: 767px) {
    font-size: var(--text-base);
    margin-bottom: var(--space-md);
  }
`;

export const CleanBody = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-700);
  line-height: 1.5;
  margin: 0 0 var(--space-lg) 0;

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

export const CleanBodyS = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.4;
  margin: 0 0 var(--space-md) 0;
`;

// ======================================================
// Utility Components
// ======================================================

// Ultra Clean Loading State
export const CleanLoadingSpinner = styled('div')`
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

export const EnhancedLoadingContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  flex-direction: column;
  gap: var(--space-lg);
`;

export const EmptyStateContainer = styled('div')`
  text-align: center;
  padding: var(--space-xl);
`;

// Clean Content Components
export const InsightBody = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-700);
  line-height: 1.5;
  margin-bottom: var(--space-lg);

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

export const ValueHighlight = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})`
  font-weight: 600;
  color: ${props => props.color || 'var(--primary)'};
`;

export const InsightNote = styled('div')`
  background: var(--gray-50);
  padding: var(--space-xl);
  margin-bottom: var(--space-3xl);
  font-family: var(--font-main);

  @media (max-width: 767px) {
    padding: var(--space-lg);
    margin-bottom: var(--space-2xl);
  }
`;

export const StyledFooterNote = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-500);
  text-align: center;
  padding: var(--space-lg) 0;
  margin-top: var(--space-3xl);

  @media (max-width: 767px) {
    margin-top: var(--space-2xl);
  }
`;

// ======================================================
// Tab Components - Clean Tab Interface
// ======================================================

// Clean Tab System - Minimal Navigation
export const TabsContainer = styled('div')`
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

export const TabsList = styled('div')`
  display: flex;
  gap: var(--space-lg);
  overflow-x: auto;
  padding-bottom: var(--space-md);
  margin-bottom: var(--space-xl);
  
  &::-webkit-scrollbar {
    height: 2px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--gray-100);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-400);
  }
  
  @media (max-width: 767px) {
    gap: var(--space-md);
  }
`;

export const TabButton = styled('button', {
  shouldForwardProp: prop => prop !== 'active',
})`
  padding: var(--space-md) 0;
  border: none;
  background: transparent;
  color: ${props => props.active ? 'var(--gray-900)' : 'var(--gray-600)'};
  font-family: var(--font-main);
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: var(--text-base);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  border-bottom: ${props => props.active ? '2px solid var(--primary)' : '2px solid transparent'};
  
  &:hover {
    color: var(--gray-900);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

export const TabContent = styled('div', {
  shouldForwardProp: prop => prop !== 'active',
})`
  display: ${props => props.active ? 'block' : 'none'};
`;

// Clean Heading with Minimal Icon
export const HeadingWithTooltip = styled('div')`
  margin-bottom: var(--space-2xl);
  
  svg {
    display: none; /* Hide decorative icons for minimal design */
  }

  @media (max-width: 767px) {
    margin-bottom: var(--space-xl);
  }
`;

// Search and Filter Components - Minimal Design
export const SearchContainer = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  background: var(--gray-50);

  @media (max-width: 767px) {
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
  }
`;

export const SearchInput = styled('input')`
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  border: none;
  background: var(--white);
  font-size: var(--text-base);
  font-family: var(--font-main);
  color: var(--gray-900);
  transition: var(--transition);
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  &::placeholder {
    color: var(--gray-500);
  }

  @media (max-width: 767px) {
    font-size: var(--text-sm);
    padding: var(--space-sm) var(--space-md);
  }
`;

export const FilterContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
  padding: var(--space-lg);
  background: var(--gray-50);
  flex-wrap: wrap;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
    padding: var(--space-md);
    margin-bottom: var(--space-xl);
  }
`;

export const FilterButton = styled('button', {
  shouldForwardProp: prop => prop !== 'active',
})`
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: ${props => props.active ? 'var(--primary)' : 'var(--gray-600)'};
  font-size: var(--text-sm);
  font-weight: ${props => props.active ? '600' : '400'};
  font-family: var(--font-main);
  cursor: pointer;
  transition: var(--transition);
  border-bottom: ${props => props.active ? '2px solid var(--primary)' : '2px solid transparent'};
  
  &:hover {
    color: var(--gray-900);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

export const ActiveFilters = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
`;

export const FilterChip = styled('span')`
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: var(--text-xs);
  font-family: var(--font-main);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-200);
  }
`;

export const SortContainer = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  
  @media (max-width: 767px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

export const SortButton = styled('button', {
  shouldForwardProp: prop => prop !== 'active',
})`
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: ${props => props.active ? 'var(--gray-900)' : 'var(--gray-600)'};
  font-size: var(--text-sm);
  font-weight: ${props => props.active ? '600' : '400'};
  font-family: var(--font-main);
  cursor: pointer;
  transition: var(--transition);
  border-bottom: ${props => props.active ? '2px solid var(--primary)' : '2px solid transparent'};
  
  &:hover {
    color: var(--gray-900);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;