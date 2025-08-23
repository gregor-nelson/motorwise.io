import { styled } from '@mui/material/styles';

// Ultra Clean Container - Matches DVLADataHeader pattern
export const MileageInsightsContainer = styled('div')`
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
export const SectionTitleContainer = styled('div')`
  margin-bottom: var(--space-3xl);

  & h2 {
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
    
    & h2 {
      font-size: var(--text-xl);
    }
  }
`;

// Clean Grid - Simple Layout (matches DVLADataHeader pattern)
export const MileageInsightsGrid = styled('div')`
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

// Minimal Section - Clean spacing (matches DVLADataHeader pattern)
export const MileageInsightSection = styled('section')`
  margin-bottom: var(--space-3xl);
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

// Minimal Panel - No borders, shadows or decorations (matches DVLADataHeader pattern)
export const MileageInsightPanel = styled('div')`
  /* No background, borders, or shadows - pure minimal */
  margin-bottom: var(--space-3xl);
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

// Clean Section Heading - Typography only (matches DVLADataHeader pattern)
export const MileageSectionHeading = styled('h3')`
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-lg) 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
  
  @media (max-width: 767px) {
    font-size: var(--text-lg);
  }
`;

// Clean Table - Minimal styling (matches DVLADataHeader approach)
export const MileageTable = styled('table')`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-lg);
  
  & th {
    font-family: var(--font-main);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--gray-600);
    padding: var(--space-sm) 0;
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
  }
  
  & td {
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-900);
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--gray-200);
  }
  
  & tr:last-child td {
    border-bottom: none;
  }
  
  @media (max-width: 767px) {
    & th, & td {
      font-size: var(--text-sm);
    }
  }
`;

// Minimal Risk Display - Clean layout (matches DVLADataHeader grid pattern)
export const RiskScoreDisplay = styled('div')`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
  
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    text-align: center;
  }
`;

// Minimal Score Display - Simple text (matches DVLADataHeader StatusIndicator pattern)
export const RiskScoreCircle = styled('div', {
  shouldForwardProp: prop => prop !== 'riskCategory',
})`
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: ${({ riskCategory }) => {
    if (riskCategory === 'Low') return 'var(--positive)';
    if (riskCategory === 'Medium') return 'var(--warning)';
    return 'var(--negative)';
  }};
  
  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`;

// Risk Text Content - Clean typography (matches DVLADataHeader pattern)
export const RiskScoreText = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
`;

// Risk Category - Minimal styling (matches DVLADataHeader StatusIndicator pattern)
export const RiskCategory = styled('h4', {
  shouldForwardProp: prop => prop !== 'riskCategory',
})`
  margin: 0;
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 600;
  color: ${({ riskCategory }) => {
    if (riskCategory === 'Low') return 'var(--positive)';
    if (riskCategory === 'Medium') return 'var(--warning)';
    return 'var(--negative)';
  }};
  line-height: 1.2;
  
  @media (max-width: 767px) {
    font-size: var(--text-lg);
  }
`;

// Risk Description - Clean text (matches DVLADataHeader MetricValue pattern)
export const RiskDescription = styled('p')`
  margin: 0;
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-600);
  line-height: 1.4;
  
  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

// Clean Factors Heading - Typography only (matches DVLADataHeader pattern)
export const FactorsHeading = styled('h5', {
  shouldForwardProp: prop => prop !== 'color',
})`
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: ${({ color }) => color || 'var(--gray-800)'};
  margin: var(--space-lg) 0 var(--space-md) 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  
  @media (max-width: 767px) {
    font-size: var(--text-base);
  }
`;

// Clean Factors List - Simple layout (matches DVLADataHeader pattern)
export const FactorsList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-lg) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

// Minimal Factor Item - Clean styling (matches DVLADataHeader MetricItem pattern)
export const FactorItem = styled('li', {
  shouldForwardProp: prop => prop !== 'borderColor' && prop !== '_iconColor',
})`
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-800);
  line-height: 1.4;
  
  & svg {
    color: ${({ _iconColor, borderColor }) => _iconColor || borderColor || 'var(--primary)'};
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  @media (max-width: 767px) {
    font-size: var(--text-xs);
  }
`;

// Clean Value Display - Minimal styling (matches DVLADataHeader MetricValue pattern)
export const ValueDisplay = styled('span', {
  shouldForwardProp: prop => prop !== 'color',
})`
  font-family: var(--font-mono);
  font-weight: 600;
  color: ${({ color }) => color || 'var(--gray-900)'};
`;

// Clean Footer Note - Minimal text (matches DVLADataHeader pattern)
export const FooterNote = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  color: var(--gray-500);
  text-align: center;
  margin: var(--space-2xl) 0 0 0;
  line-height: 1.4;
`;

// Ultra Clean Loading State (matches DVLADataHeader pattern)
export const LoadingContainer = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  flex-direction: column;
  gap: var(--space-lg);
`;

// Minimal Error State (matches DVLADataHeader pattern)
export const ErrorContainer = styled('div')`
  text-align: center;
  padding: var(--space-xl);
`;

// Minimal Empty State (matches DVLADataHeader pattern)
export const EmptyContainer = styled('div')`
  text-align: center;
  padding: var(--space-xl);
`;

// Minimal Metric Card - No decorations (matches DVLADataHeader MetricGroup pattern)
export const MileageMetricCard = styled('div')`
  /* No background, borders, or shadows - pure minimal */
`;

// Metric Label - Clean typography (matches DVLADataHeader MetricLabel pattern)
export const MileageMetricLabel = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
`;

// Metric Value - Clean display (matches DVLADataHeader MetricValue pattern)
export const MileageMetricValue = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--gray-900);
  line-height: 1.4;
  word-break: break-word;

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

// Metric Subtext - Clean description (matches DVLADataHeader pattern)
export const MileageMetricSubtext = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  line-height: 1.4;
  margin-top: var(--space-xs);
`;

// Minimal Data Quality Badge - Semantic colors only (matches DVLADataHeader StatusIndicator pattern)
export const DataQualityBadge = styled('div', {
  shouldForwardProp: prop => prop !== 'quality',
})`
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  
  color: ${({ quality }) => {
    if (quality === 'high') return 'var(--positive)';
    if (quality === 'medium') return 'var(--warning)';
    if (quality === 'poor') return 'var(--negative)';
    return 'var(--gray-700)';
  }};
`;