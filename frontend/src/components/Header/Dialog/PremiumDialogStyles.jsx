import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

// Complete MarketDash Design System - Self-contained
const MarketDashTokens = `
  /* Complete MarketDash Design System */
  :root {
    /* Ultra Clean Color Palette */
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

    /* Professional Brand Colors */
    --primary: #3b82f6;
    --primary-hover: #2563eb;
    --primary-light: #dbeafe;

    /* Financial Data Colors */
    --positive: #10b981;
    --positive-light: #d1fae5;
    --negative: #ef4444;
    --negative-light: #fee2e2;
    --warning: #f59e0b;
    --warning-light: #fef3c7;
    --neutral: #6b7280;
    --neutral-light: #f3f4f6;

    /* Modern Spacing Scale */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;

    /* Typography Scale */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --text-4xl: 2.25rem;

    /* Professional Font Stack */
    --font-main: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'JetBrains Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
    --font-display: 'Jost', sans-serif;

    /* Line Heights */
    --leading-none: 1;
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
    --leading-loose: 2;

    /* Letter Spacing */
    --tracking-tighter: -0.05em;
    --tracking-tight: -0.025em;
    --tracking-normal: 0;
    --tracking-wide: 0.025em;
    --tracking-wider: 0.05em;
    --tracking-widest: 0.1em;

    /* Clean Shadow System */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

    /* Professional Transitions */
    --transition: all 0.2s ease;
    --transition-fast: all 0.15s ease;
    --transition-slow: all 0.3s ease;
    --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    /* Clean Border System */
    --border-width: 1px;
    --radius-none: 0;
    --radius-sm: 0.125rem;
    --radius-base: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-full: 9999px;
  }

  /* Essential Animation Keyframes */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Clean Professional MarketDash Payment Modal Components
export const PremiumModal = styled(Dialog)`
  ${MarketDashTokens}
  
  & .MuiDialog-paper {
    background: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--gray-200);
    overflow: visible;
    max-width: 580px;
    width: 100%;
    margin: var(--space-lg);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary) 0%, var(--primary-hover) 100%);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }
  }
  
  & .MuiDialog-container {
    backdrop-filter: blur(4px);
  }
  
  & .MuiBackdrop-root {
    background: rgba(15, 23, 42, 0.6);
  }
`;

export const ModalHeader = styled(DialogTitle)`
  ${MarketDashTokens}
  
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  padding: var(--space-xl) var(--space-2xl);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-800);
  
  .title-content {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  
  .header-icon {
    width: 24px;
    height: 24px;
    color: var(--primary);
  }
  
  .close-button {
    color: var(--gray-400);
    transition: var(--transition);
    border-radius: var(--radius-base);
    
    &:hover {
      color: var(--gray-600);
      background: var(--gray-100);
    }
  }
  
  @media (max-width: 768px) {
    padding: var(--space-lg);
    
    .title-content {
      font-size: var(--text-xl);
    }
  }
  
  @media (max-width: 480px) {
    padding: var(--space-md);
    
    .title-content {
      font-size: var(--text-lg);
    }
  }
`;

export const ModalContent = styled(DialogContent)`
  ${MarketDashTokens}
  
  padding: var(--space-2xl);
  background: var(--white);
  min-height: 400px;
  
  @media (max-width: 768px) {
    padding: var(--space-lg);
    min-height: auto;
  }
  
  @media (max-width: 480px) {
    padding: var(--space-md);
  }
`;

export const PremiumSection = styled('div')`
  ${MarketDashTokens}
  
  margin-bottom: var(--space-xl);
  padding: var(--space-xl);
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-base);
  position: relative;
  transition: var(--transition);
  
  &:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--gray-300);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--primary);
    border-radius: var(--radius-base) var(--radius-base) 0 0;
  }
  
  .section-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--gray-800);
    margin: 0 0 var(--space-lg) 0;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  
  .section-icon {
    width: 20px;
    height: 20px;
    color: var(--primary);
  }
`;

export const FeatureList = styled('div')`
  ${MarketDashTokens}
  
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin: var(--space-lg) 0 0 0;
  
  .feature-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) 0;
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-700);
    line-height: var(--leading-relaxed);
    transition: var(--transition);
    
    &:hover {
      color: var(--gray-800);
    }
    
    .check-icon {
      width: 18px;
      height: 18px;
      color: var(--positive);
      flex-shrink: 0;
    }
  }
`;

export const PricingBanner = styled('div')`
  ${MarketDashTokens}
  
  background: var(--primary-light);
  border: 1px solid var(--primary);
  border-radius: var(--radius-base);
  padding: var(--space-xl);
  text-align: center;
  margin: var(--space-xl) 0;
  
  .price-content {
    /* No positioning needed - keep clean */
  }
  
  .price-value {
    font-family: var(--font-mono);
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--primary);
    margin: var(--space-sm) 0;
    line-height: var(--leading-none);
  }
  
  .price-description {
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-600);
    font-weight: 500;
    margin: 0;
    
    &:first-child {
      margin-bottom: var(--space-xs);
    }
    
    &:last-child {
      margin-top: var(--space-xs);
    }
  }
`;

export const PaymentFormContainer = styled('form')`
  ${MarketDashTokens}
  
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-top: var(--space-xl);
`;

export const FormSection = styled('div')`
  ${MarketDashTokens}
  
  .form-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--gray-800);
    margin: 0 0 var(--space-lg) 0;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--gray-200);
  }
  
  .form-icon {
    width: 18px;
    height: 18px;
    color: var(--primary);
  }
`;

export const FormField = styled('div')`
  ${MarketDashTokens}
  
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  
  label {
    font-family: var(--font-main);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--gray-700);
    margin-bottom: var(--space-xs);
  }
  
  input {
    font-family: var(--font-main);
    font-size: var(--text-base);
    padding: var(--space-md);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-base);
    background: var(--white);
    color: var(--gray-900);
    transition: var(--transition);
    min-height: 44px;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &:hover {
      border-color: var(--gray-400);
    }
    
    &::placeholder {
      color: var(--gray-400);
    }
    
    &.error {
      border-color: var(--negative);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }
`;

export const CardElementContainer = styled('div')`
  ${MarketDashTokens}
  
  padding: var(--space-md);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-base);
  background: var(--white);
  transition: var(--transition);
  min-height: 48px;
  display: flex;
  align-items: center;
  
  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:hover {
    border-color: var(--gray-400);
  }
  
  &.error {
    border-color: var(--negative);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
`;

export const ErrorMessage = styled('div')`
  ${MarketDashTokens}
  
  background: var(--negative-light);
  border: 1px solid var(--negative);
  border-radius: var(--radius-base);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--negative);
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  
  .error-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

export const ActionButtons = styled('div')`
  ${MarketDashTokens}
  
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--gray-200);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  @media (max-width: 480px) {
    margin-top: var(--space-lg);
    padding-top: var(--space-md);
  }
`;

export const PrimaryButton = styled('button')`
  ${MarketDashTokens}
  
  flex: 1;
  padding: var(--space-md) var(--space-xl);
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: var(--radius-base);
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 52px;
  
  &:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      background: var(--primary);
      transform: none;
      box-shadow: none;
    }
  }
  
  .loading-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--white);
    animation: spin 1s linear infinite;
  }
`;

export const SecondaryButton = styled('button')`
  ${MarketDashTokens}
  
  flex: 0.5;
  padding: var(--space-md) var(--space-xl);
  background: var(--white);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-base);
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  min-height: 52px;
  
  &:hover {
    border-color: var(--gray-400);
    background: var(--gray-50);
    color: var(--gray-800);
  }
  
  &:active {
    background: var(--gray-100);
  }
`;

export const SecurityBadge = styled('div')`
  ${MarketDashTokens}
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--positive-light);
  border: 1px solid var(--positive);
  border-radius: var(--radius-base);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-700);
  margin-top: var(--space-lg);
  
  .security-icon {
    width: 16px;
    height: 16px;
    color: var(--positive);
  }
`;

// Additional components needed for legacy compatibility
export const GovUKButton = styled('button')`
  ${MarketDashTokens}
  
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 600;
  padding: var(--space-md) var(--space-lg);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-base);
  background: var(--white);
  color: var(--gray-700);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 48px;
  
  &:hover {
    background: var(--gray-50);
    border-color: var(--gray-400);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const GovUKBody = styled('p')`
  ${MarketDashTokens}
  
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--gray-700);
  margin-bottom: var(--space-md);
  
  @media (max-width: 768px) {
    font-size: var(--text-lg);
    margin-bottom: var(--space-lg);
  }
`;

export const PayButtonPrimary = styled('button')`
  ${MarketDashTokens}
  
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 600;
  padding: var(--space-md) var(--space-lg);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--white);
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 48px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const BaseButton = styled('button')`
  ${MarketDashTokens}
  
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 600;
  padding: var(--space-md) var(--space-lg);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-base);
  background: var(--white);
  color: var(--gray-700);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 48px;
  
  /* Variant styles */
  ${props => props.variant === 'blue' && `
    background: var(--primary);
    color: var(--white);
    border-color: var(--primary);
    
    &:hover {
      background: var(--primary-hover);
      border-color: var(--primary-hover);
    }
  `}
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
    color: var(--white);
    border-color: var(--primary);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: var(--white);
    color: var(--gray-700);
    border-color: var(--gray-300);
    
    &:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }
  `}
  
  &:hover {
    background: var(--gray-50);
    border-color: var(--gray-400);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: var(--white);
      border-color: var(--gray-300);
      transform: none;
    }
  }
`;

// Self-contained style utilities for inline use
export const inlineStyles = {
  cardBrandContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-md)',
    marginTop: 'var(--space-lg)',
    padding: 'var(--space-md)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-base)',
    border: '1px solid var(--gray-200)'
  },
  
  cardBrandText: {
    fontFamily: 'var(--font-main)',
    fontSize: 'var(--text-sm)',
    color: 'var(--gray-600)',
    fontWeight: '500'
  },
  
  cardBrandList: {
    display: 'flex',
    gap: 'var(--space-sm)',
    alignItems: 'center'
  },
  
  cardBrand: {
    padding: '4px 8px',
    background: 'var(--white)',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    fontFamily: 'var(--font-mono)'
  },
  
  visaStyle: {
    color: '#1a365d'
  },
  
  mastercardStyle: {
    color: '#eb001b'
  },
  
  amexStyle: {
    color: '#006fcf'
  },
  
  textStyles: {
    base: {
      fontFamily: 'var(--font-main)', 
      fontSize: 'var(--text-base)', 
      color: 'var(--gray-700)', 
      marginBottom: 'var(--space-md)',
      lineHeight: 'var(--leading-relaxed)'
    },
    
    small: {
      fontFamily: 'var(--font-main)', 
      fontSize: 'var(--text-sm)', 
      color: 'var(--gray-600)', 
      marginBottom: 'var(--space-lg)',
      lineHeight: 'var(--leading-relaxed)',
      fontStyle: 'italic'
    },
    
    emphasis: {
      color: 'var(--gray-800)',
      fontWeight: '600'
    }
  },
  
  priceContentStyles: {
    free: {
      background: 'linear-gradient(135deg, var(--positive-light) 0%, var(--white) 100%)', 
      borderColor: 'var(--positive)'
    },
    
    freePriceValue: {
      color: 'var(--positive)'
    }
  },
  
  buttonStyles: {
    success: {
      background: 'linear-gradient(135deg, var(--positive) 0%, #059669 100%)'
    }
  },
  
  infoPanel: {
    padding: 'var(--space-md)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-base)',
    border: '1px solid var(--gray-200)',
    marginBottom: 'var(--space-lg)'
  },
  
  infoHighlight: {
    padding: 'var(--space-md)',
    background: 'var(--primary-light)',
    borderRadius: 'var(--radius-base)',
    border: '1px solid var(--primary)',
    borderLeft: '4px solid var(--primary)',
    marginBottom: 'var(--space-lg)'
  }
};