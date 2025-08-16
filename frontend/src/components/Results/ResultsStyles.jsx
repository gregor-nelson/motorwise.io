/* ============================================
   Results Components - Ultra-Clean Minimal Design System
   Matches DVLADataHeader PRIMARY Reference Implementation
   ============================================ */

import { styled } from '@mui/material/styles';
import{ MarketDashTokens as MinimalTokens } from '../../styles/styles';

// Ultra Clean Container - Transparent background, no borders, minimal styling (matches DVLADataHeader pattern)
export const MarketDashContainer = styled('div')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  background: transparent;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--gray-900);

  @media (max-width: 767px) {
    padding: var(--space-xl) var(--space-md);
  }
`;

/* ===== TYPOGRAPHY COMPONENTS (MATCHES DVLADataHeader) ===== */

// Clean Section Header Pattern (from DVLADataHeader)
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

export const PageTitle = styled('h1')`
  margin: 0;
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    font-size: var(--text-xl);
    margin-bottom: var(--space-2xl);
  }
`;

export const SectionTitle = styled('h2')`
  margin: 0;
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: var(--space-lg);

  @media (max-width: 767px) {
    font-size: var(--text-lg);
    margin-bottom: var(--space-md);
  }
`;

export const SubTitle = styled('h3')`
  margin: 0;
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: var(--space-md);

  @media (max-width: 767px) {
    font-size: var(--text-base);
    margin-bottom: var(--space-sm);
  }
`;

// Metric Label Pattern (from DVLADataHeader)
export const MetricLabel = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-600);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
`;

// Metric Value Pattern (from DVLADataHeader)
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

export const BodyText = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--gray-700);
  line-height: 1.5;
  margin: 0 0 var(--space-md) 0;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 767px) {
    font-size: var(--text-sm);
  }
`;

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

export const MonoText = styled('span')`
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--gray-900);
  background: var(--gray-50);
  padding: var(--space-xs) var(--space-sm);

  @media (max-width: 767px) {
    font-size: var(--text-xs);
  }
`;

// Clean link styling (semantic color only, matches DVLADataHeader)
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

/* ===== LAYOUT COMPONENTS (INVISIBLE ARCHITECTURE - MATCHES DVLADataHeader) ===== */

// Report Section Pattern (from Premium.jsx)
export const ReportSection = styled('div')`
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

// Results Section - Minimal version (no visual containers)
export const ResultsSection = styled('section')`
  margin-bottom: var(--space-3xl);

  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

// Clean Grid System Pattern (from DVLADataHeader)
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

export const GridContainer = styled('div')`
  display: grid;
  gap: var(--space-xl);
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
  }

  @media (max-width: 767px) {
    gap: var(--space-lg);
    grid-template-columns: 1fr;
  }
`;

export const GridColumn = styled('div')`
  /* Pure minimal - no styling */
`;

// Minimal Metric Group - No Cards, Just Clean Spacing (from DVLADataHeader)
export const MetricGroup = styled('div')`
  /* No background, borders, or shadows - pure minimal */
`;

// Clean Metric Rows (from DVLADataHeader)
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

// Ultra Clean Metric Item (from DVLADataHeader)
export const MetricItem = styled('div')`
  /* Pure minimal - no styling */
`;

export const FlexRow = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  flex-wrap: wrap;

  @media (max-width: 767px) {
    gap: var(--space-md);
  }
`;

export const FlexColumn = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);

  @media (max-width: 767px) {
    gap: var(--space-sm);
  }
`;

/* ===== MOT HISTORY SPECIFIC COMPONENTS (MINIMAL - NO VISUAL CONTAINERS) ===== */

// Minimal MOT Result Card - No borders or shadows (invisible architecture)
export const MotResultCard = styled('div')(({ show, index = 0 }) => ({
  marginBottom: 'var(--space-3xl)',
  opacity: show ? 1 : 0,
  transform: show ? 'translateY(0)' : 'translateY(10px)',
  transition: 'all 0.3s ease',
  transitionDelay: `${index * 100}ms`,
  
  '@media (max-width: 767px)': {
    marginBottom: 'var(--space-2xl)',
  }
}));

// Clean collapsible section - no visual containers
export const CollapsibleSection = styled('div')(({ expanded }) => ({
  marginBottom: 'var(--space-3xl)',
  
  '@media (max-width: 767px)': {
    marginBottom: 'var(--space-2xl)',
  }
}));

// Clean collapsible header - minimal styling
export const CollapsibleHeader = styled('button')(({ expanded }) => ({
  width: '100%',
  padding: 'var(--space-lg) 0',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: 'var(--text-lg)',
  fontWeight: '600',
  fontFamily: 'var(--font-main)',
  color: 'var(--gray-900)',
  textAlign: 'left',
  transition: 'var(--transition)',
  
  '&:hover': {
    color: 'var(--primary)',
  },
  
  '&:focus': {
    outline: '2px solid var(--primary)',
    outlineOffset: '2px',
    borderRadius: '2px',
  },
  
  '@media (max-width: 767px)': {
    fontSize: 'var(--text-base)',
    padding: 'var(--space-md) 0',
  }
}));

// Minimal collapsible icon - no decorative containers
export const CollapsibleIcon = styled('span')(({ expanded }) => ({
  fontSize: 'var(--text-sm)',
  fontWeight: '500',
  color: 'var(--primary)',
  display: 'inline-block',
  flexShrink: 0,
  transition: 'var(--transition)',
}));

// Clean collapsible content
export const CollapsibleContent = styled('div')(({ expanded }) => ({
  maxHeight: expanded ? 'none' : '0',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  opacity: expanded ? 1 : 0,
}));

// Results Summary - Minimal (matches DVLADataHeader StatusIndicator approach)
export const ResultsSummary = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--space-lg)',
  fontSize: 'var(--text-base)',
  lineHeight: 1.4,
  color: 'var(--gray-600)',
  fontFamily: 'var(--font-main)',
  
  '& .summary-item': {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
  },
  
  '& .count': {
    fontWeight: '600',
    color: 'var(--gray-900)',
  },
  
  '& .label': {
    color: 'var(--gray-600)',
  },
  
  '& .divider': {
    width: '1px',
    height: '16px',
    background: 'var(--gray-300)',
    margin: '0 var(--space-sm)',
  },
  
  // Minimal Status Indicators - Color only, no borders (matches DVLADataHeader)
  '& .status-tag': {
    fontFamily: 'var(--font-main)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
  },
  
  '& .status-tag.pass': {
    color: 'var(--positive)',
  },
  
  '& .status-tag.fail': {
    color: 'var(--negative)',
  },
  
  '& .issue-tag': {
    fontFamily: 'var(--font-main)',
    fontSize: 'var(--text-sm)',
    fontWeight: '500',
    color: 'var(--warning)',
    marginLeft: 'var(--space-xs)',
  }
});

// Vehicle Registration - Cleaner styling (less decorative)
export const VehicleRegistration = styled('div')`
  display: inline-block;
  min-width: 120px;
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  padding: var(--space-md) var(--space-lg);
  text-align: center;
  background: var(--gray-900);
  color: var(--white);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-xl);

  @media (max-width: 767px) {
    font-size: var(--text-xl);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-lg);
  }
`;

export const DefectLabel = styled('span')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--gray-700);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: var(--space-sm);
  display: block;
`;

export const DefectList = styled('ul')(({ show }) => ({
  listStyle: 'disc',
  paddingLeft: 'var(--space-lg)',
  margin: 'var(--space-md) 0',
  
  '& > li': {
    marginBottom: 'var(--space-sm)',
    color: 'var(--gray-700)',
    lineHeight: 'var(--leading-relaxed)',
    opacity: show ? 1 : 0,
    transform: show ? 'translateX(0)' : 'translateX(-10px)',
    transition: 'all 0.3s ease',
    transitionDelay: show ? '100ms' : '0ms',
  },
}));

export const AnimatedDefectList = styled('div')(({ show }) => ({
  opacity: show ? 1 : 0,
  maxHeight: show ? '500px' : '0',
  overflow: 'hidden',
  transition: 'opacity 0.3s ease, max-height 0.3s ease',
}));

// Minimal Clickable Defect Item - No visual containers (matches DVLADataHeader approach)
export const ClickableDefectItem = styled('div')(({ expanded }) => ({
  cursor: 'pointer',
  position: 'relative',
  padding: 'var(--space-sm) 0',
  transition: 'var(--transition)',
  marginBottom: 'var(--space-sm)',
  width: '100%',
  
  '&:hover': {
    color: 'var(--primary)',
  },
  
  '&:focus': {
    outline: '2px solid var(--primary)',
    outlineOffset: '2px',
    borderRadius: '2px',
  },
  
  '& strong': {
    display: 'block',
    width: '100%',
    fontFamily: 'var(--font-main)',
    fontWeight: '500',
    color: 'inherit',
    lineHeight: 1.5,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
}));

export const FadeInContent = styled('div')(({ show, delay = 0 }) => ({
  opacity: show ? 1 : 0,
  transform: show ? 'translateY(0)' : 'translateY(10px)',
  transition: `all 0.3s ease ${delay}ms`,
}));

/* ===== FORM COMPONENTS ===== */

export const FormGroup = styled('div')(({ error }) => ({
  marginBottom: 'var(--space-lg)',
  /* Removed left border highlight for ultra-minimal design */
}));

export const Label = styled('label')`
  display: block;
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-xs);
  line-height: var(--leading-normal);
`;

export const HintText = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin-bottom: var(--space-sm);
  line-height: var(--leading-normal);
`;

export const Input = styled('input')(({ error }) => ({
  width: '100%',
  padding: 'var(--space-md)',
  fontSize: 'var(--text-base)',
  fontFamily: 'var(--font-main)',
  color: 'var(--gray-900)',
  background: 'var(--white)',
  border: `1px solid ${error ? 'var(--negative)' : 'var(--gray-300)'}`,
  transition: 'var(--transition)',
  
  '&:hover': {
    borderColor: error ? 'var(--negative)' : 'var(--gray-400)',
  },
  
  '&:focus': {
    outline: 'none',
    borderColor: error ? 'var(--negative)' : 'var(--primary)',
    /* Removed box shadow for ultra-minimal design */
  },
}));

// Minimal button - cleaner styling
export const Button = styled('button')(({ variant = 'primary', size = 'normal' }) => ({
  fontFamily: 'var(--font-main)',
  fontSize: size === 'large' ? 'var(--text-lg)' : 'var(--text-base)',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-sm)',
  padding: size === 'large' ? 'var(--space-lg) var(--space-xl)' : 'var(--space-md) var(--space-lg)',
  border: '1px solid',
  cursor: 'pointer',
  transition: 'var(--transition)',
  textDecoration: 'none',
  
  ...(variant === 'primary' && {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'var(--white)',
    
    '&:hover': {
      background: 'var(--gray-900)',
      borderColor: 'var(--gray-900)',
    },
  }),
  
  ...(variant === 'secondary' && {
    background: 'transparent',
    borderColor: 'var(--gray-300)',
    color: 'var(--gray-900)',
    
    '&:hover': {
      background: 'var(--gray-50)',
      borderColor: 'var(--gray-400)',
    },
  }),
  
  '&:focus': {
    outline: '1px solid var(--primary)',
    outlineOffset: '1px',
  },
  
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
}));

export const BackLink = styled('a')`
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--primary);
  text-decoration: none;
  margin-bottom: var(--space-xl);
  transition: var(--transition);
  
  &:before {
    content: '←';
    font-size: var(--text-base);
  }
  
  &:hover {
    color: var(--primary-hover);
    text-decoration: underline;
  }
  
  &:focus {
    outline: 3px solid var(--primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
`;

/* ===== LOADING & ERROR STATES (MATCHES DVLADataHeader) ===== */

// Ultra Clean Loading State (exact copy from DVLADataHeader)
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

export const ErrorContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  text-align: center;
`;

export const ErrorText = styled('p')`
  color: var(--negative);
  font-family: var(--font-main);
  font-size: var(--text-base);
  margin: 0;
`;

export const ErrorMessage = styled('div')`
  color: var(--negative);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-top: var(--space-xs);
`;

export const ErrorSummary = styled('div')`
  background: transparent;
  color: var(--negative);
  padding: var(--space-lg) 0;
  margin-bottom: var(--space-xl);
  
  h2 {
    font-size: var(--text-lg);
    font-weight: 600;
    margin: 0 0 var(--space-md) 0;
    color: var(--negative);
  }
  
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  
  li {
    margin-bottom: var(--space-xs);
  }
  
  a {
    color: var(--negative);
    text-decoration: underline;
    
    &:hover {
      text-decoration: none;
    }
  }
`;

/* ===== DEFECT DETAIL SPECIFIC COMPONENTS ===== */

// Clean Detail Content - Minimal (no visual containers)
export const DetailContent = styled('div')`
  margin-top: var(--space-xl);
  margin-bottom: var(--space-xl);
  
  @media (max-width: 767px) {
    margin-top: var(--space-lg);
    margin-bottom: var(--space-lg);
  }
`;

// Clean breadcrumb path - minimal
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

// Clean defect content
export const DefectContent = styled('div')`
  /* Pure minimal - no styling, just content flow */
`;

export const DefectSection = styled('div')`
  margin-bottom: var(--space-lg);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Minimal Status Badge - Color only, no decoration (matches DVLADataHeader StatusIndicator)
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

// Clean inset text - minimal
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

export const SectionBreak = styled('hr')`
  border: none;
  border-top: 1px solid var(--gray-200);
  margin: var(--space-xl) 0;
`;

/* ===== DISCLOSURE/DETAILS COMPONENTS ===== */

export const Details = styled('details')`
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  margin: var(--space-md) 0;
  background: var(--white);
  
  &[open] {
    border-color: var(--primary);
  }
`;

export const DetailsSummary = styled('summary')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-800);
  cursor: pointer;
  padding: var(--space-sm) 0;
  list-style: none;
  position: relative;
  
  &::-webkit-details-marker {
    display: none;
  }
  
  &::after {
    content: '+';
    position: absolute;
    right: var(--space-sm);
    top: 50%;
    transform: translateY(-50%);
    font-size: var(--text-lg);
    color: var(--primary);
    transition: transform 0.2s ease;
  }
  
  details[open] & {
    border-bottom: 1px solid var(--gray-200);
    margin-bottom: var(--space-md);
    
    &::after {
      content: '−';
    }
  }
  
  &:hover {
    color: var(--primary);
  }
`;

export const DetailsText = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--gray-700);
`;

/* ===== RESPONSIVE UTILITIES ===== */

export const HideOnMobile = styled('div')`
  @media (max-width: 767px) {
    display: none;
  }
`;

export const ShowOnMobile = styled('div')`
  display: none;
  
  @media (max-width: 767px) {
    display: block;
  }
`;

/* ===== ACCESSIBILITY ===== */

export const ScreenReaderOnly = styled('span')`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;