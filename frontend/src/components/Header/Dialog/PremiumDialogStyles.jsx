import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import{ MarketDashTokens as TTSDesignTokens } from '../../../styles/styles';


// TTS Professional Modal System - Enhanced with depth and visual hierarchy
export const PremiumModal = styled(Dialog)`
  ${TTSDesignTokens}
  
  & .MuiDialog-paper {
    background: var(--white);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
    margin: var(--space-lg);
    position: relative;
    overflow: visible;
    
    /* Two-column specific sizing for payment flows */
    &[class*="MuiDialog-paperWidthMd"] {
      max-width: 900px;
      width: 90vw;
      
      @media (max-width: 1024px) {
        max-width: 600px;
        width: 95vw;
      }
      
      @media (max-width: 767px) {
        max-width: 100%;
        width: 100vw;
        margin: 0;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        box-shadow: none;
      }
    }
    
    /* Standard dialogs maintain TTS modal pattern */
    &[class*="MuiDialog-paperWidthSm"] {
      max-width: 500px;
      width: 100%;
    }
    
    /* Fullscreen dialogs - for sample reports and large content */
    &[class*="MuiDialog-paperFullScreen"] {
      max-width: 100%;
      width: 100vw;
      height: 100vh;
      max-height: 100vh;
      margin: 0;
      border-radius: 0;
      box-shadow: none;
      overflow: hidden;
      background: var(--gray-50);
    }
  }
  
  & .MuiBackdrop-root {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
  }

  /* Ensure proper z-index for Stripe elements */
  z-index: 1300;
  
  & .MuiDialog-container {
    z-index: 1300;
  }
`;

export const ModalHeader = styled(DialogTitle)`
  ${TTSDesignTokens}
  
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
  ${TTSDesignTokens}
  
  padding: 0 var(--space-2xl) var(--space-2xl);
  background: var(--white);
  
  /* Two-Column Layout for Premium Dialog */
  .two-column-layout {
    display: grid;
    grid-template-columns: 1.2fr 380px;
    gap: var(--space-3xl);
    min-height: 450px;
    align-items: start;
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: var(--space-2xl);
      min-height: auto;
    }
    
    @media (max-width: 767px) {
      gap: var(--space-xl);
    }
  }
  
  /* Trust Column (Left) */
  .trust-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    
    .trust-hero {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      
      .security-icon {
        width: 24px;
        height: 24px;
        color: var(--primary);
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      .trust-content {
        flex: 1;
        
        h3 {
          font-family: var(--font-main);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--gray-900);
          margin: 0 0 var(--space-sm) 0;
          line-height: 1.3;
        }
        
        p {
          font-family: var(--font-main);
          font-size: var(--text-base);
          color: var(--gray-600);
          margin: 0;
          line-height: 1.4;
        }
      }
    }
    
    .professional-positioning {
      padding: var(--space-md);
      background: var(--gray-50);
      text-align: center;
      
      .positioning-label {
        display: block;
        font-family: var(--font-main);
        font-size: var(--text-sm);
        color: var(--gray-600);
        margin-bottom: var(--space-xs);
      }
      
      .vehicle-reg {
        font-family: var(--font-mono);
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--gray-900);
        letter-spacing: 0.05em;
      }
    }
  }
  
  /* Action Column (Right) */
  .action-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    position: sticky;
    top: var(--space-lg);
    height: fit-content;
    
    .pricing-section {
      text-align: center;
      padding: var(--space-xl) var(--space-lg);
      background: var(--gray-50);
      border-left: 3px solid var(--primary);
      
      .price-label {
        font-family: var(--font-main);
        font-size: var(--text-sm);
        color: var(--gray-600);
        margin-bottom: var(--space-xs);
      }
      
      .price-value {
        font-family: var(--font-main);
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--gray-900);
        margin: var(--space-sm) 0;
        line-height: 1.2;
      }
      
      .price-features {
        font-family: var(--font-main);
        font-size: var(--text-sm);
        color: var(--gray-600);
        margin: 0;
      }
    }
    
    @media (max-width: 1024px) {
      position: static;
      
      .pricing-section {
        border-left: none;
        border-top: 3px solid var(--primary);
      }
    }
  }
  
  @media (max-width: 767px) {
    padding: 0 var(--space-md) var(--space-xl);
    
    .two-column-layout {
      gap: var(--space-xl);
    }
    
    .trust-column {
      .trust-hero {
        .trust-content {
          h3 {
            font-size: var(--text-lg);
          }
          
          p {
            font-size: var(--text-sm);
          }
        }
      }
      
      .professional-positioning {
        .vehicle-reg {
          font-size: var(--text-base);
        }
      }
    }
    
    .action-column {
      .pricing-section {
        padding: var(--space-lg);
        
        .price-value {
          font-size: var(--text-2xl);
        }
      }
    }
  }
`;

export const PremiumSection = styled('div')`
  ${TTSDesignTokens}
  
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
  ${TTSDesignTokens}
  
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin: var(--space-lg) 0 0 0;
  
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
    font-family: var(--font-main);
    line-height: 1.4;
    
    .check-icon {
      width: 16px;
      height: 16px;
      color: var(--positive);
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .feature-content {
      flex: 1;
    }
    
    .feature-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: var(--space-xs);
    }
    
    .feature-description {
      font-size: var(--text-sm);
      color: var(--gray-600);
      font-weight: 400;
    }
  }
  
  @media (max-width: 767px) {
    gap: var(--space-sm);
    
    .feature-item {
      padding: var(--space-xs) 0;
      
      .feature-title {
        font-size: var(--text-sm);
      }
      
      .feature-description {
        font-size: var(--text-xs);
      }
    }
  }
`;

export const PricingBanner = styled('div')`
  ${TTSDesignTokens}
  
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
  ${TTSDesignTokens}
  
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  margin-top: 0;
  
  /* Compact version for two-column layout */
  .two-column-layout & {
    gap: var(--space-lg);
  }
`;

export const FormSection = styled('div')`
  ${TTSDesignTokens}
  
  .form-title {
    font-family: var(--font-main);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--gray-900);
    margin: 0 0 var(--space-lg) 0;
    line-height: 1.3;
    /* Typography-first - no decorative icons or borders */
  }
  
  /* Compact version for two-column layout */
  .two-column-layout & {
    .form-title {
      font-size: var(--text-base);
      margin: 0 0 var(--space-md) 0;
    }
  }
`;

export const FormField = styled('div')`
  ${TTSDesignTokens}
  
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
  ${TTSDesignTokens}
  
  padding: var(--space-md);
  border: 1px solid var(--gray-300);
  background: var(--white);
  transition: var(--transition);
  min-height: 48px;
  display: flex;
  align-items: center;
  position: relative;
  
  &:focus-within {
    border-color: var(--primary);
  }
  
  &.error {
    border-color: var(--negative);
  }

  /* Ensure Stripe CardElement is properly interactive */
  & .StripeElement {
    width: 100%;
    padding: 0;
    position: relative;
    z-index: 1;
  }

  /* Ensure input fields within CardElement are clickable and accessible */
  & .StripeElement iframe {
    pointer-events: auto !important;
    z-index: 2 !important;
  }

  & .StripeElement--focus {
    outline: none;
  }

  & .StripeElement--invalid {
    /* Let the container handle error styling */
  }

  & .StripeElement--complete {
    /* Let the container handle complete styling */
  }
`;

export const ErrorMessage = styled('div')`
  ${TTSDesignTokens}
  
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
  ${TTSDesignTokens}
  
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-2xl);
  
  /* Compact version for two-column layout */
  .two-column-layout & {
    margin-top: var(--space-lg);
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  @media (max-width: 767px) {
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-xl);
  }
`;

export const PrimaryButton = styled('button')`
  ${TTSDesignTokens}
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: var(--gray-900);
  color: var(--white);
  border: none;
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  
  &:hover {
    background: var(--gray-800);
  }
  
  &:focus {
    outline: 2px solid var(--gray-700);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background: var(--gray-900);
      opacity: 0.6;
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
  
  @media (max-width: 767px) {
    width: 100%;
    padding: var(--space-md);
  }
`;

export const SecondaryButton = styled('button')`
  ${TTSDesignTokens}
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  
  &:hover {
    background: var(--gray-200);
    color: var(--gray-800);
  }
  
  &:focus {
    outline: 2px solid var(--accent-blue);
    outline-offset: 2px;
  }
  
  @media (max-width: 767px) {
    width: 100%;
    padding: var(--space-md);
  }
`;

export const SecurityBadge = styled('div')`
  ${TTSDesignTokens}
  
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
  ${TTSDesignTokens}
  
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
  ${TTSDesignTokens}
  
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
  ${TTSDesignTokens}
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: var(--gray-900);
  color: var(--white);
  border: none;
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  
  &:hover {
    background: var(--gray-800);
  }
  
  &:focus {
    outline: 2px solid var(--gray-700);
    outline-offset: 2px;
  }
  
  @media (max-width: 767px) {
    width: 100%;
    padding: var(--space-md);
  }
`;

export const BaseButton = styled('button')`
  ${TTSDesignTokens}
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  
  /* Variant styles */
  ${props => props.variant === 'blue' && `
    background: var(--gray-900);
    color: var(--white);
    border: none;
    
    &:hover {
      background: var(--gray-800);
    }
  `}
  
  ${props => props.variant === 'primary' && `
    background: var(--gray-900);
    color: var(--white);
    border: none;
    
    &:hover {
      background: var(--gray-800);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: var(--gray-100);
    color: var(--gray-700);
    border: 1px solid var(--gray-300);
    
    &:hover {
      background: var(--gray-200);
      color: var(--gray-800);
    }
  `}
  
  &:hover {
    background: var(--gray-200);
    color: var(--gray-800);
  }
  
  &:focus {
    outline: 2px solid var(--accent-blue);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background: var(--gray-100);
      color: var(--gray-700);
      opacity: 0.6;
    }
  }
  
  @media (max-width: 767px) {
    width: 100%;
    padding: var(--space-md);
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