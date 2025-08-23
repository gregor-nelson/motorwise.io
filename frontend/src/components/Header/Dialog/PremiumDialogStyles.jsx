import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

// Ultra Clean Modal System - No Decorative Elements (DVLADataHeader Pattern)
export const PremiumModal = styled(Dialog)`
  & .MuiDialog-paper {
    background: var(--white);
    border-radius: 0;
    box-shadow: none;
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
        height: 100vh;
        max-height: 100vh;
        margin: 0;
        border-radius: 0;
        box-shadow: none;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
    
    /* Standard dialogs - mobile full-screen */
    &[class*="MuiDialog-paperWidthSm"] {
      max-width: 500px;
      width: 100%;
      
      @media (max-width: 767px) {
        max-width: 100%;
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        margin: 0;
        border-radius: 0;
        box-shadow: none;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
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
      background: var(--white);
    }
  }
  
  & .MuiBackdrop-root {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: none;
  }

  /* Ensure proper z-index for Stripe elements */
  z-index: 1300;
  
  & .MuiDialog-container {
    z-index: 1300;
  }
`;

export const ModalHeader = styled(DialogTitle)`
  background: var(--white);
  padding: var(--space-3xl) var(--space-2xl) var(--space-2xl);
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
    /* Typography-first - no decorative icons (DVLADataHeader pattern) */
  }
  
  .close-button {
    color: var(--gray-400);
    transition: var(--transition);
    
    &:hover {
      color: var(--gray-600);
    }
    
    /* Enhanced mobile touch target and accessibility (Phase 4) */
    @media (max-width: 767px) {
      min-height: 44px;
      min-width: 44px;
      padding: var(--space-sm);
      
      &:active {
        transform: scale(0.95);
      }
      
      /* Enhanced focus states */
      &:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
        border-radius: 50%;
      }
      
      /* ARIA labels for screen readers */
      &[aria-label] {
        /* Ensure screen reader accessibility */
      }
    }
    
    @media (max-width: 480px) {
      min-height: 40px;
      min-width: 40px;
    }
  }
  
  @media (max-width: 767px) {
    padding: var(--space-lg) var(--space-md) var(--space-md);
    font-size: var(--text-lg);
    min-height: 60px;
  }
  
  @media (max-width: 480px) {
    padding: var(--space-md) var(--space-sm) var(--space-sm);
    font-size: var(--text-base);
    min-height: 56px;
  }
`;

export const ModalContent = styled(DialogContent)`
  padding: 0 var(--space-2xl) var(--space-3xl);
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
      padding: var(--space-lg) 0;
      background: var(--white);
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
      padding: var(--space-xl) 0;
      background: var(--white);
      border-left: none;
      
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
        border-top: none;
      }
    }
  }
  
  @media (max-width: 767px) {
    padding: 0 var(--space-md) var(--space-lg);
    
    .two-column-layout {
      gap: var(--space-lg);
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
  
  @media (max-width: 480px) {
    padding: 0 var(--space-sm) var(--space-md);
    
    .two-column-layout {
      gap: var(--space-md);
    }
  }
`;

export const PremiumSection = styled('div')`
  margin-bottom: var(--space-3xl);
  /* No background, borders, or shadows - pure minimal (DVLADataHeader pattern) */
  
  .section-title {
    font-family: var(--font-main);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--gray-900);
    margin: 0 0 var(--space-lg) 0;
    line-height: 1.3;
    /* Typography-first - no decorative icons (DVLADataHeader pattern) */
  }
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-2xl);
  }
`;

export const FeatureList = styled('div')`
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
  padding: var(--space-xl) 0;
  text-align: center;
  margin: var(--space-2xl) 0;
  /* No background or borders - pure minimal (DVLADataHeader pattern) */
  
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
  .form-title {
    font-family: var(--font-main);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--gray-900);
    margin: 0 0 var(--space-lg) 0;
    line-height: 1.3;
    /* Typography-first - no decorative icons or borders (DVLADataHeader pattern) */
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
    border-radius: 0;
    background: var(--white);
    color: var(--gray-900);
    transition: var(--transition);
    min-height: 48px;
    line-height: 1.4;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    /* Enhanced accessibility for screen readers (Phase 4) */
    &:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
    
    /* Better touch feedback and mobile optimization */
    @media (max-width: 767px) {
      &:active {
        transform: scale(0.995);
        transition: transform 0.1s ease;
      }
      
      font-size: var(--text-base);
      min-height: 44px;
    }
    
    @media (max-width: 480px) {
      font-size: var(--text-sm);
      min-height: 40px;
    }
    
    &::placeholder {
      color: var(--gray-400);
    }
    
    &.error {
      border-color: var(--negative);
      
      /* Enhanced error indication for accessibility */
      &:focus {
        outline: 2px solid var(--negative);
        outline-offset: 2px;
      }
    }
  }
`;

export const CardElementContainer = styled('div')`
  padding: var(--space-md);
  border: 1px solid var(--gray-300);
  border-radius: 0;
  background: var(--white);
  transition: var(--transition);
  min-height: 48px;
  display: flex;
  align-items: center;
  position: relative;
  
  &:focus-within {
    border-color: var(--primary);
  }
  
  /* Enhanced focus states for Stripe CardElement (Phase 4) */
  &:focus-within:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  &.error {
    border-color: var(--negative);
    
    /* Enhanced error indication */
    &:focus-within {
      outline: 2px solid var(--negative);
      outline-offset: 2px;
    }
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
  
  /* Progressive typography scaling for mobile (Phase 3) */
  @media (max-width: 767px) {
    font-size: var(--text-xs);
    line-height: 1.3;
    padding: var(--space-xs) 0;
    
    .error-icon {
      width: 12px;
      height: 12px;
      margin-top: 1px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    line-height: 1.2;
    
    .error-icon {
      width: 10px;
      height: 10px;
    }
  }
`;

export const ActionButtons = styled('div')`
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-2xl);
  
  /* Compact version for two-column layout */
  .two-column-layout & {
    margin-top: var(--space-lg);
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  /* Enhanced mobile layout optimization (Phase 3) */
  @media (max-width: 767px) {
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-xl);
    
    /* Better touch spacing */
    padding: 0 var(--space-xs);
  }
  
  @media (max-width: 480px) {
    gap: var(--space-xs);
    margin-top: var(--space-lg);
    padding: 0;
  }
`;

export const PrimaryButton = styled('button')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--gray-900);
  color: var(--white);
  border: none;
  border-radius: 0;
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
    
    /* Mobile optimized spinner (Phase 3) */
    @media (max-width: 767px) {
      width: 14px;
      height: 14px;
      border-width: 1.5px;
    }
    
    @media (max-width: 480px) {
      width: 12px;
      height: 12px;
      border-width: 1px;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Enhanced mobile touch targets and accessibility (Phase 4) */
  @media (max-width: 767px) {
    width: 100%;
    min-height: 44px;
    padding: var(--space-md);
    font-size: var(--text-sm);
    transition: all 0.15s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    /* Enhanced focus states for mobile */
    &:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
      border-radius: 2px;
    }
    
    /* Loading state accessibility */
    &[aria-busy="true"] {
      pointer-events: none;
    }
  }
  
  @media (max-width: 480px) {
    min-height: 40px;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-xs);
  }
`;

export const SecondaryButton = styled('button')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--white);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: 0;
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
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  /* Enhanced mobile touch targets and accessibility (Phase 4) */
  @media (max-width: 767px) {
    width: 100%;
    min-height: 44px;
    padding: var(--space-md);
    font-size: var(--text-sm);
    transition: all 0.15s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    /* Enhanced focus states for mobile */
    &:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
      border-radius: 2px;
    }
    
    /* Better hover states on touch devices */
    @media (hover: hover) {
      &:hover {
        background: var(--gray-100);
        transform: translateY(-1px);
      }
    }
  }
  
  @media (max-width: 480px) {
    min-height: 40px;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-xs);
  }
`;

export const SecurityBadge = styled('div')`
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
  
  /* Progressive typography scaling for mobile (Phase 3) */
  @media (max-width: 767px) {
    font-size: var(--text-xs);
    line-height: 1.3;
    padding: var(--space-sm) 0;
    margin-top: var(--space-md);
    gap: var(--space-xs);
    
    .security-icon {
      width: 12px;
      height: 12px;
    }
    
    /* Enhanced touch feedback (Phase 4) */
    &:active {
      transform: scale(0.99);
      transition: transform 0.1s ease;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    line-height: 1.2;
    padding: var(--space-xs) 0;
    margin-top: var(--space-sm);
    
    .security-icon {
      width: 10px;
      height: 10px;
    }
  }
`;

// Additional components needed for legacy compatibility
export const GovUKButton = styled('button')`
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
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

// Ultra Clean Modal Footer - DVLADataHeader Pattern
export const SimpleModalFooter = styled('div')`
  /* Clean minimal footer with generous spacing */
  padding: var(--space-2xl) var(--space-2xl);
  background: var(--white);
  border-top: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: auto;
  gap: var(--space-2xl);
  
  .footer-text {
    margin: 0;
    font-family: var(--font-main);
    font-size: var(--text-base);
    color: var(--gray-600);
    line-height: 1.4;
    flex: 1;
    font-weight: 400;
  }
  
  .footer-action {
    flex: 0 0 auto;
    min-height: auto;
    padding: var(--space-sm) var(--space-xl);
    font-size: var(--text-base);
    background: var(--gray-900);
    color: var(--white);
    border: none;
    font-weight: 500;
    transition: var(--transition);
    
    &:hover {
      background: var(--gray-800);
    }
    
    &:focus {
      outline: 2px solid var(--gray-700);
      outline-offset: 2px;
    }
  }
  
  /* Progressive mobile optimization - maintaining professional look */
  @media (max-width: 767px) {
    padding: var(--space-xl) var(--space-lg);
    flex-direction: column;
    gap: var(--space-lg);
    align-items: stretch;
    
    .footer-text {
      font-size: var(--text-sm);
      text-align: center;
      line-height: 1.3;
      order: 1;
    }
    
    .footer-action {
      width: 100%;
      min-height: 44px;
      padding: var(--space-md) var(--space-lg);
      font-size: var(--text-sm);
      order: 2;
      
      /* Enhanced mobile touch feedback */
      &:active {
        transform: scale(0.98);
      }
      
      &:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }
    }
  }
  
  @media (max-width: 480px) {
    padding: var(--space-lg) var(--space-md);
    gap: var(--space-md);
    
    .footer-text {
      font-size: var(--text-xs);
      line-height: 1.3;
    }
    
    .footer-action {
      min-height: 40px;
      padding: var(--space-sm) var(--space-lg);
      font-size: var(--text-xs);
    }
  }
`;

export const CompactButton = styled('button')`
  font-family: var(--font-main);
  font-size: var(--text-sm);
  padding: var(--space-xs) var(--space-sm);
  background: ${props => props.variant === 'primary' ? 'var(--gray-900)' : 'var(--white)'};
  color: ${props => props.variant === 'primary' ? 'var(--white)' : 'var(--gray-700)'};
  border: ${props => props.variant === 'primary' ? 'none' : '1px solid var(--gray-300)'};
  border-radius: 0;
  cursor: pointer;
  min-height: 36px;
  min-width: ${props => props.variant === 'primary' ? '100px' : '60px'};
  transition: all 0.15s ease;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? 'var(--gray-800)' : 'var(--gray-100)'};
  }
  
  @media (max-width: 767px) {
    min-height: 40px;
    font-size: var(--text-xs);
    padding: var(--space-xs);
  }
  
  @media (max-width: 480px) {
    min-height: 36px;
    padding: var(--space-xs);
  }
`;

export const BaseButton = styled('button')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
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