import { styled } from '@mui/material/styles';

// Ultra Clean Container - No decorative elements (EXACT copy from DVLADataHeader)
export const CleanContainer = styled('div')`
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

// Minimal Section Header - Clean Typography Only (from DVLADataHeader)
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

// Clean Grid - Invisible Layout (from DVLADataHeader)
export const DataGrid = styled('div')`
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

// Minimal Metric Group - No Cards, Just Clean Spacing (from DVLADataHeader)
export const MetricGroup = styled('div')`
  /* No background, borders, or shadows - pure minimal */
`;

// Minimal Registration Display - Typography Only
export const VehicleRegistrationDisplay = styled('div')`
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--gray-900);
  margin-bottom: var(--space-lg);
  line-height: 1.2;

  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`;

// Clean Vehicle Title - Typography First
export const VehicleTitle = styled('h1')`
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--space-xl) 0;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`;

// Clean Action Buttons - Minimal Container
export const ActionButtonsContainer = styled('div')`
  display: flex;
  gap: var(--space-md);
  margin: var(--space-xl) 0;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: var(--space-sm);
  }
`;

// Minimal Action Button - Clean Design
export const PremiumActionButton = styled('button')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: var(--primary);
  color: var(--white);
  border: none;
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    opacity: 0.9;
  }

  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    width: 100%;
    padding: var(--space-md);
  }
`;

export const SecondaryActionButton = styled(PremiumActionButton)`
  background: var(--white);
  color: var(--primary);
  border: 1px solid var(--primary);

  &:hover {
    background: var(--gray-50);
  }
`;

// Clean Metric Rows - Invisible Grid (from DVLADataHeader)
export const MetricRow = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-xl);
  
  &:not(:last-child) {
    margin-bottom: var(--space-xl);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    
    &:not(:last-child) {
      margin-bottom: var(--space-lg);
    }
  }
`;

// Ultra Clean Metric Item - No Visual Elements
export const MetricItem = styled('div')`
  /* Pure minimal - no styling */
`;

// Restrained Label Typography (from DVLADataHeader)
export const MetricLabel = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
`;

// Clean Value Display (from DVLADataHeader)
export const MetricValue = styled('div')`
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

// Clean MOT Section - No Visual Containers
export const MOTSection = styled('div')`
  margin: var(--space-3xl) 0;

  @media (max-width: 767px) {
    margin: var(--space-2xl) 0;
  }
`;

export const MOTCaption = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
`;

export const MOTDate = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--gray-900);
  line-height: 1.4;
  margin-bottom: var(--space-lg);

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

// Minimal Navigation - Clean Spacing Only
export const NavigationLinks = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-3xl);
  padding-top: var(--space-xl);

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 767px) {
    margin-top: var(--space-2xl);
  }
`;

export const NavigationLink = styled('a')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--primary);
  text-decoration: underline;
  transition: var(--transition);

  &:hover {
    opacity: 0.8;
  }

  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
`;

// Ultra Clean Loading State (from DVLADataHeader)
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

// Minimal Error State
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

// Minimal Status Indicators - Just Color, No Borders (EXACT copy from DVLADataHeader)
export const StatusIndicator = styled('span', {
  shouldForwardProp: prop => prop !== 'status',
})`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  
  ${({ status }) => {
    switch (status?.toLowerCase()) {
      case 'valid':
      case 'taxed':
      case 'no action required':
      case 'no':
        return `color: var(--positive);`;
      case 'expired':
      case 'sorn':
      case 'untaxed':
      case 'yes':
        return `color: var(--negative);`;
      case 'due soon':
      case 'advisory':
        return `color: var(--warning);`;
      default:
        return `color: var(--gray-700);`;
    }
  }}
`;

// Clean Section Spacing - No Visual Dividers (from DVLADataHeader)
export const SectionDivider = styled('div')`
  height: var(--space-3xl);

  @media (max-width: 767px) {
    height: var(--space-2xl);
  }
`;

// Responsive Wrapper - Minimal (from DVLADataHeader)
export const ResponsiveWrapper = styled('div')`
  /* Pure wrapper - no styling */
`;