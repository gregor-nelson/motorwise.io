import { styled } from '@mui/material/styles';
import{ MarketDashTokens as MinimalTokens } from '../../../styles/styles';

// Ultra Clean Container - No borders, minimal styling (matches DVLADataHeader pattern)
export const TechSpecsContainer = styled('div')`
  ${MinimalTokens}
  
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

// Minimal Section Header - Clean Typography Only (matches DVLADataHeader pattern)
export const SectionHeader = styled('div')`
  margin-bottom: var(--space-3xl);

  & h1, & h2 {
    margin: 0;
    font-family: var(--font-main);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--gray-900);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
    
    & h1, & h2 {
      font-size: var(--text-xl);
    }
  }
`;

// Clean Section Spacing - No Visual Dividers (matches DVLADataHeader pattern)
export const SectionDivider = styled('div')`
  height: var(--space-3xl);

  @media (max-width: 767px) {
    height: var(--space-2xl);
  }
`;

// Clean Insight Panel - No Cards, Just Clean Spacing (matches MileageInsights pattern)
export const InsightPanel = styled('div')`
  /* No background, borders, or shadows - pure minimal */
`;

// Clean Body Text (matches MileageInsights pattern)
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

// Ultra Clean Loading Container (matches DVLADataHeader pattern)
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

// Minimal Error State (matches DVLADataHeader pattern)
export const ErrorContainer = styled('div')`
  text-align: center;
  padding: var(--space-xl);
`;

export const ErrorHeader = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
`;

export const ErrorMessage = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--negative);
  line-height: 1.5;
`;

// Clean Empty State Container (matches MileageInsights pattern)
export const EmptyStateContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  gap: var(--space-md);
`;

// Ultra Clean Tabs - Invisible architecture (matches DVLADataHeader approach)
export const MinimalTabs = styled('div')`
  /* Pure minimal - no borders or visual decorations */
  margin-bottom: var(--space-3xl);
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

export const MinimalTab = styled('button')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--gray-700);
  background: none;
  border: none;
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  position: relative;
  transition: var(--transition);

  &:hover {
    color: var(--primary);
  }

  &.active {
    color: var(--primary);
    font-weight: 600;
  }

  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    font-size: var(--text-sm);
    padding: var(--space-sm) var(--space-md);
  }
`;

// Clean Tab Panel
export const TabPanel = styled('div')`
  /* Pure wrapper - no styling */
`;

// Clean Grid - Simple Layout (matches DVLADataHeader pattern)
export const SpecGrid = styled('div')`
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

// Minimal Spec Category Header - Clean Typography Only
export const SpecCategoryHeader = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
  
  @media (max-width: 767px) {
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }
`;

export const CategoryIcon = styled('div')`
  width: 48px;
  height: 48px;
  background: var(--primary);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: 700;
  flex-shrink: 0;
  
  @media (max-width: 767px) {
    width: 40px;
    height: 40px;
    font-size: var(--text-base);
  }
`;

export const CategoryTitle = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  line-height: 1.2;
  
  @media (max-width: 767px) {
    font-size: var(--text-lg);
  }
`;

export const CategorySubtitle = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-top: var(--space-xs);
`;

// Ultra Clean Spec Card - No Cards, Just Clean Layout
export const SpecCard = styled('div')`
  /* No background, borders, or shadows - pure minimal */
  margin-bottom: var(--space-xl);
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-lg);
  }
`;

export const SpecCardHeader = styled('div')`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-md);
`;

export const SpecCardTitle = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.4;
`;

export const SpecCardIcon = styled('div')`
  width: 30px;
  height: 30px;
  background: var(--primary);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: 700;
  flex-shrink: 0;
`;

// Clean Value Display (matches DVLADataHeader MetricValue pattern)
export const SpecValue = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.1;
  margin-bottom: var(--space-xs);

  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`;

export const SpecUnit = styled('span')`
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--gray-600);
  margin-left: var(--space-xs);
  
  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

export const SpecSubtext = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.4;
`;

// Minimal Status Indicators - Just Color, No Borders (matches DVLADataHeader pattern)
export const StatusBadge = styled('span')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  
  ${({ status }) => {
    switch (status?.toLowerCase()) {
      case 'good':
      case 'optimal':
        return `color: var(--positive);`;
      case 'warning':
      case 'acceptable':
        return `color: var(--warning);`;
      case 'critical':
      case 'low':
        return `color: var(--negative);`;
      default:
        return `color: var(--gray-700);`;
    }
  }}
`;

// Clean Warning Panel (matches MileageInsights approach)
export const WarningPanel = styled('div')`
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  position: relative;

  @media (max-width: 767px) {
    margin-bottom: var(--space-lg);
    padding: var(--space-md);
  }
`;

export const WarningTitle = styled('h3')`
  margin: 0 0 var(--space-sm) 0;
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

export const WarningText = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-700);
  line-height: 1.5;

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

// Clean Notice Panel (matches MileageInsights approach)
export const NoticePanel = styled('div')`
  margin-bottom: var(--space-lg);
  padding: var(--space-md);

  @media (max-width: 767px) {
    padding: var(--space-sm);
  }
`;

// Clean Fuel Type Badge (semantic color only)
export const FuelTypeBadge = styled('strong')`
  display: inline-block;
  background: var(--primary);
  color: var(--white);
  padding: var(--space-xs) var(--space-sm);
  font-weight: 700;
  font-size: var(--text-sm);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: var(--font-main);
  margin: var(--space-sm) 0;
`;

// GovUK Style Components for consistency with existing codebase
export const GovUKHeadingS = styled('h3')`
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  line-height: 1.2;
  
  @media (max-width: 767px) {
    font-size: var(--text-base);
  }
`;

export const GovUKBody = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-700);
  line-height: 1.5;
  
  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

// Footer Note (matches MileageInsights pattern)
export const FooterNote = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  text-align: center;
  margin-top: var(--space-2xl);
  line-height: 1.5;
`;

// New styled components to replace inline styles

// Progress Label for status indicators (replaces line 288 inline style)
export const ProgressLabel = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
  font-size: var(--text-base);
  font-family: var(--font-main);

  & span {
    font-weight: 700;
  }
`;

// Status Container for badge spacing (replaces line 313 inline style)
export const StatusContainer = styled('div')`
  margin-top: var(--space-lg);
`;

// Section Spacing for headers (replaces lines 824, 833, 870 inline styles)
export const SectionSpacing = styled('div')`
  margin-bottom: var(--space-lg);

  & ${GovUKHeadingS} {
    margin-bottom: var(--space-lg);
  }
`;

// Error Text Span (replaces line 987 inline style)
export const ErrorSpan = styled('span')`
  color: var(--negative);
  font-weight: 600;
`;

// Retry Button (replaces lines 994-1004 inline styles)
export const RetryButton = styled('button')`
  background-color: var(--positive);
  color: var(--white);
  border: none;
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-main);
  font-weight: 700;
  font-size: var(--text-base);
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background-color: var(--positive);
    filter: brightness(0.9);
  }

  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

// Flex Container for layout (replaces lines 1068, 1080 inline styles)
export const FlexContainer = styled('div')`
  display: flex;

  &.justify-start {
    justify-content: flex-start;
    margin: var(--space-lg) 0;
  }

  &.tabs {
    gap: var(--space-md);
    flex-wrap: wrap;
  }
`;

// Conditional Panel for tab display (replaces line 1094 inline style)
export const ConditionalPanel = styled(TabPanel)`
  /* Inherits from TabPanel - display controlled by parent */
`;

// Margin Container for spacing (replaces line 1120 inline style)
export const MarginContainer = styled('div')`
  margin: var(--space-xl) 0;
`;

// Collapsible Section Components (new accordion functionality)
export const CollapsibleSectionContainer = styled('div')`
  margin-bottom: var(--space-xl);
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-lg);
  }
`;

export const CollapsibleHeader = styled('button')`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  padding: var(--space-lg) 0;
  cursor: pointer;
  text-align: left;
  transition: var(--transition);
  
  &:hover {
    color: var(--primary);
  }

  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    padding: var(--space-md) 0;
  }
`;

export const CollapsibleHeaderContent = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  flex: 1;

  @media (max-width: 767px) {
    gap: var(--space-md);
  }
`;

export const CollapsibleChevron = styled('div')`
  font-size: var(--text-lg);
  color: var(--gray-500);
  transition: var(--transition);
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

export const CollapsibleContent = styled('div')`
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: ${props => props.expanded ? '5000px' : '0'};
  opacity: ${props => props.expanded ? '1' : '0'};
`;

export const CollapsibleContentInner = styled('div')`
  padding-bottom: var(--space-lg);
`;

// Additional styled components to complete minimal transformation

// Gauge Container (replaces lines 73-78 inline styles)
export const GaugeContainer = styled('div')`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto var(--space-md);
`;

// Gauge SVG (replaces lines 80-82 inline styles)
export const GaugeSvg = styled('svg')`
  transform: rotate(-90deg);
`;

// Gauge Track (replaces lines 84-88 inline styles)
export const GaugeTrack = styled('circle')`
  fill: none;
  stroke: var(--gray-300);
  stroke-width: 10;
`;

// Gauge Fill (replaces lines 90-96 inline styles)
export const GaugeFill = styled('circle', {
  shouldForwardProp: prop => prop !== 'color',
})`
  fill: none;
  stroke: ${({ color }) => color || 'var(--primary)'};
  stroke-width: 10;
  stroke-linecap: square;
  transition: var(--transition);
`;

// Gauge Center Text (replaces lines 98-104 inline styles)
export const GaugeCenterText = styled('div')`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

// Progress Bar (replaces lines 107-112 inline styles)
export const ProgressBar = styled('div')`
  width: 100%;
  height: 20px;
  background-color: var(--gray-100);
  position: relative;
`;

// Progress Fill (replaces lines 114-120 inline styles)
export const ProgressFill = styled('div', {
  shouldForwardProp: prop => prop !== 'color' && prop !== 'width',
})`
  height: 100%;
  width: ${({ width }) => width}%;
  background-color: ${({ color }) => color || 'var(--primary)'};
  transition: var(--transition);
  position: relative;
`;

// Progress Container (replaces lines 122-124 inline styles)
export const ProgressContainer = styled('div')`
  margin-top: var(--space-md);
`;

// Visual Divider (replaces lines 127-131 inline styles)
// Updated to match minimal approach - no visual borders
export const VisualDivider = styled('div')`
  height: var(--space-2xl);
  
  @media (max-width: 767px) {
    height: var(--space-xl);
  }
`;

// Ordered List - Clean GOV.UK style
export const OrderedList = styled('ol')`
  list-style: decimal;
  padding-left: var(--space-xl);
  margin: 0;
  
  & li {
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-700);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
    
    @media (max-width: 767px) {
      font-size: var(--text-sm);
    }
  }
  
  @media (max-width: 767px) {
    padding-left: var(--space-lg);
  }
`;

// Unordered List - Clean GOV.UK style  
export const UnorderedList = styled('ul')`
  list-style: disc;
  padding-left: var(--space-xl);
  margin: 0;
  
  & li {
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-700);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
    
    @media (max-width: 767px) {
      font-size: var(--text-sm);
    }
  }
  
  @media (max-width: 767px) {
    padding-left: var(--space-lg);
  }
`;

// Tab Content Container (for organized tab switching)
export const TabContentContainer = styled('div')`
  /* Invisible container for tab content */
`;

// Section Content Container (for consistent spacing)
export const SectionContentContainer = styled('div')`
  margin-bottom: var(--space-xl);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-lg);
  }
`;