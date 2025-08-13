import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

// Minimal Clean Design System - Ultra Restrained (from DVLADataHeader)
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
    --space-xs: 0.25rem;    /* 4px */
    --space-sm: 0.5rem;     /* 8px */
    --space-md: 1rem;       /* 16px */
    --space-lg: 1.5rem;     /* 24px */
    --space-xl: 2rem;       /* 32px */
    --space-2xl: 3rem;      /* 48px */
    --space-3xl: 4rem;      /* 64px */

    /* Typography - Clean Hierarchy */
    --text-xs: 0.75rem;     /* 12px */
    --text-sm: 0.875rem;    /* 14px */
    --text-base: 1rem;      /* 16px */
    --text-lg: 1.125rem;    /* 18px */
    --text-xl: 1.25rem;     /* 20px */
    --text-2xl: 1.5rem;     /* 24px */
    --text-3xl: 1.875rem;   /* 30px */

    /* Clean Typography */
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;

    /* Minimal Transitions */
    --transition: all 0.15s ease;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Ultra Clean Modal - No decorative elements (following DVLADataHeader patterns)
export const PremiumModal = styled(Dialog)`
  ${MinimalTokens}
  
  & .MuiDialog-paper {
    background: var(--white);
    max-width: 600px;
    width: 100%;
    margin: var(--space-lg);
    /* No borders, shadows, or decorative elements - pure minimal */
  }
  
  & .MuiBackdrop-root {
    background: rgba(0, 0, 0, 0.5);
  }
`;

export const ModalHeader = styled(DialogTitle)`
  ${MinimalTokens}
  
  background: var(--white);
  padding: var(--space-2xl) var(--space-2xl) var(--space-xl);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  line-height: 1.2;
  
  .title-content {
    /* Typography-first - no decorative icons */
  }
  
  .close-button {
    color: var(--gray-400);
    transition: var(--transition);
    
    &:hover {
      color: var(--gray-600);
    }
  }
  
  @media (max-width: 767px) {
    padding: var(--space-xl) var(--space-md) var(--space-lg);
    font-size: var(--text-xl);
  }
`;

export const ModalContent = styled(DialogContent)`
  ${MinimalTokens}
  
  padding: 0 var(--space-2xl) var(--space-2xl);
  background: var(--white);
  
  @media (max-width: 767px) {
    padding: 0 var(--space-md) var(--space-xl);
  }
`;

export const PremiumSection = styled('div')`
  ${MinimalTokens}
  
  margin-bottom: var(--space-3xl);
  /* No background, borders, or shadows - pure minimal */
  
  .section-title {
    font-family: var(--font-main);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--gray-900);
    margin: 0 0 var(--space-lg) 0;
    line-height: 1.3;
    /* Typography-first - no decorative icons */
  }
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

export const FeatureList = styled('div')`
  ${MinimalTokens}
  
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin: var(--space-lg) 0 0 0;
  
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    padding: var(--space-xs) 0;
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-700);
    line-height: 1.4;
    
    .check-icon {
      width: 16px;
      height: 16px;
      color: var(--positive);
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
`;

export const PricingBanner = styled('div')`
  ${MinimalTokens}
  
  padding: var(--space-xl) 0;
  text-align: center;
  margin: var(--space-2xl) 0;
  /* No background or borders - pure minimal */
  
  .price-content {
    /* Clean typography-only approach */
  }
  
  .price-value {
    font-family: var(--font-main);
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--gray-900);
    margin: var(--space-sm) 0;
    line-height: 1.2;
  }
  
  .price-description {
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-600);
    font-weight: 400;
    margin: 0;
    line-height: 1.4;
    
    &:first-child {
      margin-bottom: var(--space-xs);
    }
    
    &:last-child {
      margin-top: var(--space-xs);
    }
  }
`;

export const PaymentFormContainer = styled('form')`
  ${MinimalTokens}
  
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
  margin-top: var(--space-2xl);
`;

export const FormSection = styled('div')`
  ${MinimalTokens}
  
  .form-title {
    font-family: var(--font-main);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--gray-900);
    margin: 0 0 var(--space-lg) 0;
    line-height: 1.3;
    /* Typography-first - no decorative icons or borders */
  }
`;

export const FormField = styled('div')`
  ${MinimalTokens}
  
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  
  label {
    font-family: var(--font-main);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--gray-600);
    margin-bottom: var(--space-xs);
    line-height: 1.3;
  }
  
  input {
    font-family: var(--font-main);
    font-size: var(--text-base);
    padding: var(--space-md);
    border: 1px solid var(--gray-300);
    background: var(--white);
    color: var(--gray-900);
    transition: var(--transition);
    min-height: 48px;
    line-height: 1.4;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    &::placeholder {
      color: var(--gray-400);
    }
    
    &.error {
      border-color: var(--negative);
    }
  }
`;

export const CardElementContainer = styled('div')`
  ${MinimalTokens}
  
  padding: var(--space-md);
  border: 1px solid var(--gray-300);
  background: var(--white);
  transition: var(--transition);
  min-height: 48px;
  display: flex;
  align-items: center;
  
  &:focus-within {
    border-color: var(--primary);
  }
  
  &.error {
    border-color: var(--negative);
  }
`;

export const ErrorMessage = styled('div')`
  ${MinimalTokens}
  
  padding: var(--space-sm) 0;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--negative);
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  line-height: 1.4;
  
  .error-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

export const ActionButtons = styled('div')`
  ${MinimalTokens}
  
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-2xl);
  
  @media (max-width: 767px) {
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-xl);
  }
`;

export const PrimaryButton = styled('button')`
  ${MinimalTokens}
  
  flex: 1;
  padding: var(--space-md) var(--space-xl);
  background: var(--primary);
  color: var(--white);
  border: none;
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 48px;
  line-height: 1.4;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background: var(--primary);
    }
  }
  
  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--white);
    animation: spin 1s linear infinite;
  }
`;

export const SecondaryButton = styled('button')`
  ${MinimalTokens}
  
  flex: 0.5;
  padding: var(--space-md) var(--space-xl);
  background: var(--white);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 400;
  cursor: pointer;
  transition: var(--transition);
  min-height: 48px;
  line-height: 1.4;
  
  &:hover {
    color: var(--gray-900);
  }
`;

export const SecurityBadge = styled('div')`
  ${MinimalTokens}
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) 0;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-top: var(--space-lg);
  line-height: 1.4;
  
  .security-icon {
    width: 14px;
    height: 14px;
    color: var(--positive);
  }
`;

// Additional components needed for legacy compatibility
export const GovUKButton = styled('button')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-700);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 48px;
  line-height: 1.4;
  
  &:hover {
    color: var(--gray-900);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

export const GovUKBody = styled('p')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: 1.4;
  color: var(--gray-700);
  margin-bottom: var(--space-md);
  
  @media (max-width: 767px) {
    font-size: var(--text-base);
    margin-bottom: var(--space-lg);
  }
`;

export const PayButtonPrimary = styled('button')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  padding: var(--space-md) var(--space-lg);
  background: var(--primary);
  color: var(--white);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 48px;
  line-height: 1.4;
  
  &:hover {
    background: #2563eb;
  }
`;

export const BaseButton = styled('button')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-700);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: 48px;
  line-height: 1.4;
  
  /* Variant styles */
  ${props => props.variant === 'blue' && `
    background: var(--primary);
    color: var(--white);
    border-color: var(--primary);
    
    &:hover {
      background: #2563eb;
    }
  `}
  
  ${props => props.variant === 'primary' && `
    background: var(--primary);
    color: var(--white);
    border-color: var(--primary);
    
    &:hover {
      background: #2563eb;
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: var(--white);
    color: var(--gray-700);
    border-color: var(--gray-300);
    
    &:hover {
      color: var(--gray-900);
    }
  `}
  
  &:hover {
    color: var(--gray-900);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: var(--white);
      color: var(--gray-700);
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
    padding: 'var(--space-sm) 0'
  },
  
  cardBrandText: {
    fontFamily: 'var(--font-main)',
    fontSize: 'var(--text-sm)',
    color: 'var(--gray-600)',
    fontWeight: '400'
  },
  
  cardBrandList: {
    display: 'flex',
    gap: 'var(--space-sm)',
    alignItems: 'center'
  },
  
  cardBrand: {
    padding: '2px 6px',
    background: 'var(--gray-100)',
    fontSize: 'var(--text-xs)',
    fontWeight: '500',
    fontFamily: 'var(--font-mono)',
    color: 'var(--gray-700)'
  },
  
  visaStyle: {
    color: 'var(--gray-700)'
  },
  
  mastercardStyle: {
    color: 'var(--gray-700)'
  },
  
  amexStyle: {
    color: 'var(--gray-700)'
  },
  
  textStyles: {
    base: {
      fontFamily: 'var(--font-main)', 
      fontSize: 'var(--text-base)', 
      color: 'var(--gray-700)', 
      marginBottom: 'var(--space-md)',
      lineHeight: '1.4'
    },
    
    small: {
      fontFamily: 'var(--font-main)', 
      fontSize: 'var(--text-sm)', 
      color: 'var(--gray-600)', 
      marginBottom: 'var(--space-lg)',
      lineHeight: '1.4'
    },
    
    emphasis: {
      color: 'var(--gray-900)',
      fontWeight: '500'
    }
  },
  
  priceContentStyles: {
    free: {
      /* Pure minimal - no special styling */
    },
    
    freePriceValue: {
      color: 'var(--positive)'
    }
  },
  
  buttonStyles: {
    success: {
      background: 'var(--positive)'
    }
  },
  
  infoPanel: {
    padding: 'var(--space-md)',
    background: 'var(--gray-50)',
    marginBottom: 'var(--space-lg)'
  },
  
  infoHighlight: {
    padding: 'var(--space-md)',
    background: 'var(--gray-50)',
    marginBottom: 'var(--space-lg)'
  }
};