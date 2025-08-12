/* ============================================
   Results Components - MarketDash Design System
   Self-Contained Styling for Results Folder
   ============================================ */

import { styled } from '@mui/material/styles';

/* ===== MARKETDASH DESIGN TOKENS ===== */
// These tokens are self-contained and don't depend on external theme files

export const MarketDashContainer = styled('div')`
  /* MarketDash Design Tokens - Inline Definition */
  --gray-900: #0f172a;
  --gray-800: #1e293b;
  --gray-700: #334155;
  --gray-600: #475569;
  --gray-500: #64748b;
  --gray-400: #94a3b8;
  --gray-300: #cbd5e1;
  --gray-200: #e2e8f0;
  --gray-100: #f1f5f9;
  --gray-50: #f8fafc;
  --white: #ffffff;
  
  /* Professional Colors */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --positive: #10b981;
  --negative: #ef4444;
  --warning: #f59e0b;
  
  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Typography */
  --font-main: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  
  /* Effects */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --transition: all 0.2s ease;
  --transition-fast: all 0.15s ease;
  --transition-slow: all 0.3s ease;
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  
  /* Base Styling */
  font-family: var(--font-main);
  background: var(--gray-50);
  color: var(--gray-900);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-xl);
  min-height: 100vh;
`;

/* ===== TYPOGRAPHY COMPONENTS ===== */

export const PageTitle = styled('h1')`
  font-family: var(--font-main);
  font-size: var(--text-4xl);
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 var(--space-2xl) 0;
  line-height: var(--leading-tight);
`;

export const SectionTitle = styled('h2')`
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 var(--space-lg) 0;
  line-height: var(--leading-tight);
`;

export const SubTitle = styled('h3')`
  font-family: var(--font-main);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--gray-700);
  margin: 0 0 var(--space-md) 0;
  line-height: var(--leading-tight);
`;

export const BodyText = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-md) 0;
`;

export const SmallText = styled('span')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-500);
  line-height: var(--leading-normal);
`;

export const MonoText = styled('span')`
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--gray-700);
  background: var(--gray-100);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
`;

export const Link = styled('a')`
  color: var(--primary);
  text-decoration: none;
  font-family: var(--font-main);
  transition: var(--transition);
  
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

/* ===== LAYOUT COMPONENTS ===== */

export const ResultsSection = styled('section')`
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

export const GridContainer = styled('div')`
  display: grid;
  gap: var(--space-lg);
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
  }
`;

export const GridColumn = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

export const FlexRow = styled('div')`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
`;

export const FlexColumn = styled('div')`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

/* ===== MOT HISTORY SPECIFIC COMPONENTS ===== */

export const MotResultCard = styled('div')(({ show, index = 0 }) => ({
  background: 'var(--white)',
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-xl)',
  marginBottom: 'var(--space-xl)',
  boxShadow: 'var(--shadow-sm)',
  transition: 'var(--transition)',
  opacity: show ? 1 : 0,
  transform: show ? 'translateY(0)' : 'translateY(20px)',
  transitionDelay: `${index * 100}ms`,
  
  '&:hover': {
    boxShadow: 'var(--shadow-md)',
  }
}));

export const CollapsibleSection = styled('div')(({ expanded }) => ({
  background: 'var(--white)',
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-sm)',
  marginBottom: 'var(--space-xl)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-sm)',
  transition: 'var(--transition)',
  
  '&:hover': {
    boxShadow: 'var(--shadow-md)',
  }
}));

export const CollapsibleHeader = styled('button')(({ expanded }) => ({
  width: '100%',
  padding: 'var(--space-lg) var(--space-xl)',
  background: 'var(--gray-50)',
  border: 'none',
  borderBottom: '1px solid var(--gray-200)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: 'var(--text-lg)',
  fontWeight: '600',
  fontFamily: 'var(--font-main)',
  color: 'var(--gray-800)',
  textAlign: 'left',
  transition: 'var(--transition)',
  
  '&:hover': {
    background: 'var(--gray-100)',
  },
  
  '&:focus': {
    outline: '3px solid var(--primary)',
    outlineOffset: '-3px',
    background: 'var(--gray-100)',
  },
}));

export const CollapsibleIcon = styled('span')(({ expanded }) => ({
  fontSize: 'var(--text-sm)',
  fontWeight: '500',
  color: 'var(--primary)',
  display: 'inline-block',
  flexShrink: 0,
  padding: 'var(--space-xs) var(--space-sm)',
  background: 'var(--white)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--gray-300)',
  transition: 'var(--transition)',
}));

export const CollapsibleContent = styled('div')(({ expanded }) => ({
  maxHeight: expanded ? 'none' : '0',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  padding: expanded ? 'var(--space-xl)' : '0 var(--space-xl)',
  opacity: expanded ? 1 : 0,
  background: 'var(--white)',
}));

export const ResultsSummary = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--space-md)',
  fontSize: 'var(--text-base)',
  lineHeight: 'var(--leading-normal)',
  color: 'var(--gray-600)',
  
  '& .summary-item': {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
  },
  
  '& .count': {
    fontWeight: '600',
    color: 'var(--gray-800)',
  },
  
  '& .label': {
    color: 'var(--gray-600)',
  },
  
  '& .divider': {
    width: '1px',
    height: '16px',
    background: 'var(--gray-300)',
    margin: '0 var(--space-xs)',
  },
  
  '& .status-tag': {
    display: 'inline-block',
    padding: 'var(--space-xs) var(--space-sm)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    lineHeight: '1.2',
    fontFamily: 'var(--font-mono)',
  },
  
  '& .status-tag.pass': {
    background: 'var(--positive)',
    borderColor: 'var(--positive)',
    color: 'var(--white)',
  },
  
  '& .status-tag.fail': {
    background: 'var(--negative)',
    borderColor: 'var(--negative)',
    color: 'var(--white)',
  },
  
  '& .issue-tag': {
    display: 'inline-block',
    padding: 'var(--space-xs) var(--space-sm)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    background: 'var(--warning)',
    color: 'var(--white)',
    borderRadius: 'var(--radius-sm)',
    lineHeight: '1.2',
    fontFamily: 'var(--font-mono)',
    marginLeft: 'var(--space-xs)',
  }
});

export const VehicleRegistration = styled('div')`
  display: inline-block;
  min-width: 150px;
  font: 28px var(--font-mono);
  padding: var(--space-md) var(--space-lg);
  text-align: center;
  background: var(--warning);
  color: var(--white);
  border-radius: var(--radius-base);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
  border: 2px solid var(--gray-800);
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

export const ClickableDefectItem = styled('div')(({ expanded }) => ({
  cursor: 'pointer',
  position: 'relative',
  padding: 'var(--space-md)',
  borderLeft: expanded ? `4px solid var(--primary)` : '4px solid transparent',
  background: expanded ? 'var(--gray-50)' : 'transparent',
  borderRadius: 'var(--radius-sm)',
  transition: 'var(--transition)',
  marginBottom: 'var(--space-sm)',
  width: '100%',
  
  '&:hover': {
    background: 'var(--gray-50)',
    borderLeftColor: 'var(--primary)',
    color: 'var(--primary)',
  },
  
  '& strong': {
    display: 'block',
    width: '100%',
    fontWeight: '500',
    color: 'inherit',
    lineHeight: 'var(--leading-relaxed)',
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
  
  ...(error && {
    borderLeft: '4px solid var(--negative)',
    paddingLeft: 'var(--space-md)',
  })
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
  border: `2px solid ${error ? 'var(--negative)' : 'var(--gray-300)'}`,
  borderRadius: 'var(--radius-sm)',
  transition: 'var(--transition)',
  
  '&:hover': {
    borderColor: error ? 'var(--negative)' : 'var(--gray-400)',
  },
  
  '&:focus': {
    outline: 'none',
    borderColor: error ? 'var(--negative)' : 'var(--primary)',
    boxShadow: `0 0 0 3px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`,
  },
}));

export const Button = styled('button')(({ variant = 'primary', size = 'normal' }) => ({
  fontFamily: 'var(--font-main)',
  fontSize: size === 'large' ? 'var(--text-lg)' : 'var(--text-base)',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-sm)',
  padding: size === 'large' ? 'var(--space-lg) var(--space-xl)' : 'var(--space-md) var(--space-lg)',
  border: '2px solid',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  transition: 'var(--transition)',
  textDecoration: 'none',
  
  ...(variant === 'primary' && {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'var(--white)',
    
    '&:hover': {
      background: 'var(--primary-hover)',
      borderColor: 'var(--primary-hover)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-md)',
    },
  }),
  
  ...(variant === 'secondary' && {
    background: 'var(--white)',
    borderColor: 'var(--gray-300)',
    color: 'var(--gray-700)',
    
    '&:hover': {
      background: 'var(--gray-50)',
      borderColor: 'var(--gray-400)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-md)',
    },
  }),
  
  '&:focus': {
    outline: '3px solid var(--primary)',
    outlineOffset: '2px',
  },
  
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
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

/* ===== LOADING & ERROR STATES ===== */

export const LoadingContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  text-align: center;
`;

export const LoadingSpinner = styled('div')`
  width: 24px;
  height: 24px;
  border: 3px solid var(--gray-200);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled('p')`
  font-family: var(--font-main);
  color: var(--gray-500);
  font-size: var(--text-sm);
  margin: 0;
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
  background: var(--negative);
  color: var(--white);
  padding: var(--space-lg);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-xl);
  
  h2 {
    font-size: var(--text-lg);
    font-weight: 600;
    margin: 0 0 var(--space-md) 0;
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
    color: var(--white);
    text-decoration: underline;
    
    &:hover {
      text-decoration: none;
    }
  }
`;

/* ===== DEFECT DETAIL SPECIFIC COMPONENTS ===== */

export const DetailContent = styled('div')`
  margin-top: var(--space-lg);
  margin-bottom: var(--space-lg);
  padding: 0;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

export const BreadcrumbPath = styled('div')`
  padding: var(--space-md) var(--space-lg);
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  font-size: var(--text-sm);
  color: var(--gray-600);
  
  span {
    margin: 0 var(--space-xs);
    color: var(--gray-400);
  }
  
  strong {
    color: var(--gray-800);
    font-weight: 600;
  }
`;

export const DefectContent = styled('div')`
  padding: var(--space-lg);
`;

export const DefectSection = styled('div')`
  margin-bottom: var(--space-lg);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const CategoryTag = styled('span')(({ category }) => {
  let bgColor = 'var(--primary)';
  let textColor = 'var(--white)';
  
  switch(category?.toLowerCase()) {
    case 'dangerous':
      bgColor = 'var(--negative)';
      break;
    case 'major':
      bgColor = 'var(--warning)';
      break;
    case 'minor':
      bgColor = 'var(--positive)';
      break;
    case 'advisory':
      bgColor = 'var(--gray-500)';
      break;
  }
  
  return {
    backgroundColor: bgColor,
    color: textColor,
    padding: 'var(--space-xs) var(--space-sm)',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    marginRight: 'var(--space-sm)',
    marginBottom: 'var(--space-xs)',
  };
});

export const InsetText = styled('div')`
  background: var(--gray-50);
  border-left: 4px solid var(--primary);
  padding: var(--space-lg);
  margin: var(--space-lg) 0;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  
  p {
    margin: 0;
    
    &:not(:last-child) {
      margin-bottom: var(--space-md);
    }
  }
  
  strong {
    font-weight: 600;
    color: var(--gray-800);
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