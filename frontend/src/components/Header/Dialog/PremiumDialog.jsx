import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentIcon from '@mui/icons-material/Payment';
import EmailIcon from '@mui/icons-material/Email';
import {
  PremiumModal,
  ModalHeader,
  ModalContent,
  PremiumSection,
  FeatureList,
  PricingBanner,
  PaymentFormContainer,
  FormSection,
  FormField,
  CardElementContainer,
  ErrorMessage,
  ActionButtons,
  PrimaryButton,
  SecondaryButton,
  SecurityBadge,
  GovUKButton,
  GovUKBody,
  PayButtonPrimary,
  BaseButton,
  inlineStyles
} from './PremiumDialogStyles';

// Determine if we're in development or production
export const isDevelopment = window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// Configure API URL based on environment - UPDATED WITH NEW PORT STRIPE API PORT 8001
export const PAYMENT_API_BASE_URL = isDevelopment
  ? 'http://localhost:8001/api/payment/v1'   // Development - pointing to port 8001
  : '/api/payment/v1';                       // Production - use relative URL for Nginx proxy

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe('pk_test_51R0JFMP4qnmsLm0yBZ8WKNQ6jNsYigLRELdUhSMIEf4qWlEaQeWU7EIyIHySGTaqeR5BFup1XDNMDOEqmhynmkTi00ndP8XolL');


// Enhanced MarketDash Base Dialog Component
const BaseDialog = ({ open, onClose, title, children, maxWidth = "sm", headerIcon }) => {
  return (
    <PremiumModal 
      open={open} 
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      <ModalHeader>
        <div className="title-content">
          {headerIcon && <span className="header-icon">{headerIcon}</span>}
          {title}
        </div>
        <IconButton
          className="close-button"
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </ModalHeader>
      <ModalContent>
        {children}
      </ModalContent>
    </PremiumModal>
  );
};

// Enhanced MarketDash Payment Form Component
const PaymentForm = ({ registration, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Email validation function
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(null); // Clear error when user types
  };

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
    
    // Clear general errors when user types in card field
    if (event.error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!stripe || !elements) {
      return;
    }

    // Email validation
    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setProcessing(true);
    setError(null);
    setEmailError(null);
    setCardError(null);

    try {
      // Generate the unique report URL that will be accessed after payment
      const reportUrl = `${window.location.origin}/premium-report/${registration}`;
      
      // Call your backend API to create a payment intent
      const response = await fetch(`${PAYMENT_API_BASE_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          registration,
          amount: 495, // £04.95 in pence
          email: email,
          receipt_email: email,
          report_url: reportUrl
        }),
        credentials: isDevelopment ? 'include' : 'same-origin',
        mode: isDevelopment ? 'cors' : 'same-origin'
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to create payment intent';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const { clientSecret } = await response.json();
      
      if (!clientSecret) {
        throw new Error('No client secret returned from the server');
      }
      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: email,
            // Set country to UK but don't require specific address details
            address: {
              country: 'GB'
            }
          },
        },
        receipt_email: email // Request Stripe to send an email receipt
      });
      
      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Call onSuccess which will now handle navigation
        onSuccess(result.paymentIntent, email);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  return (
    <PaymentFormContainer onSubmit={handleSubmit}>
      <FormSection>
        <div className="form-title">
          Contact Information
        </div>
        
        <FormField>
          <label htmlFor="email">
            Email Address
          </label>
          
          {emailError && (
            <ErrorMessage>
              <span className="error-icon">⚠</span>
              {emailError}
            </ErrorMessage>
          )}
          
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="your.email@example.com"
            className={emailError ? 'error' : ''}
            aria-describedby={emailError ? "email-error" : undefined}
          />
        </FormField>
      </FormSection>

      <FormSection>
        <div className="form-title">
          Payment Details
        </div>
        
        <FormField>
          <label htmlFor="card-element">
            Card Information
          </label>
          
          {(error || cardError) && (
            <ErrorMessage>
              <span className="error-icon">⚠</span>
              {error || cardError}
            </ErrorMessage>
          )}
          
          <CardElementContainer className={(error || cardError) ? 'error' : ''}>
            <CardElement
              id="card-element"
              onChange={handleCardChange}
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1e293b',
                    fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: '400',
                    letterSpacing: '0.025em',
                    '::placeholder': {
                      color: '#94a3b8',
                      fontWeight: '400',
                    },
                    iconColor: '#64748b',
                  },
                  invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444',
                  },
                  complete: {
                    color: '#10b981',
                    iconColor: '#10b981',
                  }
                },
                hidePostalCode: true,
                fields: {
                  number: {
                    placeholder: '1234 1234 1234 1234'
                  },
                  expirationDate: {
                    placeholder: 'MM/YY'
                  },
                  cvc: {
                    placeholder: '123'
                  }
                }
              }}
            />
          </CardElementContainer>
        </FormField>
        
        <SecurityBadge>
          <SecurityIcon className="security-icon" />
          Your payment is secured with 256-bit SSL encryption
        </SecurityBadge>
        
        {/* Payment Method Icons */}
        <div style={inlineStyles.cardBrandContainer}>
          <span style={inlineStyles.cardBrandText}>
            We accept:
          </span>
          <div style={inlineStyles.cardBrandList}>
            <div style={{...inlineStyles.cardBrand, ...inlineStyles.visaStyle}}>VISA</div>
            <div style={{...inlineStyles.cardBrand, ...inlineStyles.mastercardStyle}}>MC</div>
            <div style={{...inlineStyles.cardBrand, ...inlineStyles.amexStyle}}>AMEX</div>
          </div>
        </div>
      </FormSection>
      
      <ActionButtons>
        <PrimaryButton 
          type="submit" 
          disabled={!stripe || loading}
        >
          {loading ? (
            <>
              <div className="loading-spinner" />
              {processing ? 'Processing Payment...' : 'Preparing...'}
            </>
          ) : (
            <>
              <SecurityIcon />
              Pay £4.95 Securely
            </>
          )}
        </PrimaryButton>
        
        <SecondaryButton 
          type="button"
          onClick={onClose}
        >
          Cancel
        </SecondaryButton>
      </ActionButtons>
    </PaymentFormContainer>
  );
};

// Enhanced Premium Report Features with progressive disclosure
const PremiumReportFeatures = ({ showAll = false, onToggle }) => {
  const coreFeatures = [
    {
      title: 'DVLA Identity Verification',
      description: 'Official government records - police & agency access'
    },
    {
      title: 'Mileage Fraud Protection',
      description: 'Forensic-level odometer tampering detection'
    },
    {
      title: 'Professional Repair Database',
      description: 'Technical data trusted by BMW, Mercedes dealerships'
    }
  ];

  const additionalFeatures = [
    {
      title: 'Advanced Usage History',
      description: '3D visualization exposing hidden patterns traditional reports miss'
    },
    {
      title: 'Market Intelligence & Risk Assessment',
      description: 'Compare against 40+ million UK vehicle records for confident decisions'
    },
    {
      title: 'Complete Documentation Package',
      description: 'Professional-grade reports meeting bank and insurance standards'
    }
  ];

  const featuresToShow = showAll ? [...coreFeatures, ...additionalFeatures] : coreFeatures;

  return (
    <FeatureList>
      {featuresToShow.map((feature, index) => (
        <div key={index} className="feature-item">
          <CheckCircleIcon className="check-icon" />
          <div className="feature-content">
            <div className="feature-title">{feature.title}</div>
            <div className="feature-description">{feature.description}</div>
          </div>
        </div>
      ))}
      
      {onToggle && (
        <button 
          type="button" 
          className="toggle-features"
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-main)',
            fontWeight: '500',
            cursor: 'pointer',
            padding: 'var(--space-sm) 0',
            textAlign: 'left',
            marginTop: 'var(--space-sm)'
          }}
        >
          {showAll ? '- Show fewer features' : '+ Show 3 more professional features'}
        </button>
      )}
    </FeatureList>
  );
};

// Enhanced MarketDash Payment Dialog Component with Two-Column Layout
export const PaymentDialog = ({ open, onClose, registration }) => {
  const navigate = useNavigate();
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Updated to include email parameter
  const handlePaymentSuccess = (paymentIntent, email) => {
    // Close the payment dialog
    onClose();

    // Navigate to the premium report page with the payment ID and email
    navigate(`/premium-report/${registration}?paymentId=${paymentIntent.id}&email=${encodeURIComponent(email)}`);
  };

  const toggleFeatures = () => {
    setShowAllFeatures(!showAllFeatures);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Premium Vehicle Report"
      headerIcon={<PaymentIcon />}
      maxWidth="md"
    >
      <div className="two-column-layout">
        {/* LEFT COLUMN: Trust & Features */}
        <div className="trust-column">
          <div className="trust-hero">
            <SecurityIcon className="security-icon" />
            <div className="trust-content">
              <h3>Protecting from £2.3B UK Vehicle Fraud</h3>
              <p>Same comprehensive database used by BMW, Mercedes dealerships and government agencies</p>
            </div>
          </div>
          
          <div className="professional-positioning">
            <span className="positioning-label">Professional-Grade Intelligence for</span>
            <strong className="vehicle-reg">{registration}</strong>
          </div>
          
          <PremiumReportFeatures 
            showAll={showAllFeatures}
            onToggle={toggleFeatures}
          />
        </div>

        {/* RIGHT COLUMN: Action & Payment */}
        <div className="action-column">
          <div className="pricing-section">
            <div className="price-label">One-time payment</div>
            <div className="price-value">£4.95</div>
            <div className="price-features">Instant access • No subscription</div>
          </div>
          
          <Elements stripe={stripePromise}>
            <PaymentForm 
              registration={registration}
              onSuccess={handlePaymentSuccess}
              onClose={onClose}
            />
          </Elements>
        </div>
      </div>
    </BaseDialog>
  );
}

// Enhanced Free Report Dialog with MarketDash styling
export const FreeReportDialog = ({ open, onClose, registration, reportType = 'classic' }) => {
  const navigate = useNavigate();

  const handleViewFreeReport = () => {
    // Close the dialog
    onClose();

    // Navigate to the premium report page with a special free report parameter
    // We'll use different paymentId values to indicate report type
    const paymentId = reportType === 'modern' ? 'free-modern-vehicle' : 'free-classic-vehicle';
    navigate(`/premium-report/${registration}?paymentId=${paymentId}`);
  };

  // Set content based on report type
  const dialogTitle = "Free Vehicle Report";

  // Different explanations based on report type
  const explanationText = reportType === 'modern'
    ? "For vehicles registered from 2018 onwards, the enhanced vehicle report is provided without charge as these vehicles have limited historical data."
    : "For vehicles registered before 1996, the enhanced vehicle report is provided without charge as part of this service.";

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={dialogTitle}
      headerIcon={<CheckCircleIcon />}
    >
      <PremiumSection>
        <div className="section-title">
          <CheckCircleIcon className="section-icon" />
          Complimentary Access
        </div>
        <p style={inlineStyles.textStyles.base}>
          The comprehensive report for vehicle <strong style={inlineStyles.textStyles.emphasis}>{registration}</strong> is available at no cost.
        </p>
        
        <p style={inlineStyles.textStyles.small}>
          {explanationText}
        </p>
        
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <span style={inlineStyles.textStyles.emphasis}>
            The report includes:
          </span>
        </div>
        
        <PremiumReportFeatures />
      </PremiumSection>
      
      <PricingBanner style={inlineStyles.priceContentStyles.free}>
        <div className="price-content">
          <div className="price-value" style={inlineStyles.priceContentStyles.freePriceValue}>FREE</div>
          <p className="price-description">No payment required • Instant access</p>
        </div>
      </PricingBanner>
      
      <ActionButtons>
        <PrimaryButton 
          type="button"
          onClick={handleViewFreeReport}
          style={inlineStyles.buttonStyles.success}
        >
          <CheckCircleIcon />
          Continue to Report
        </PrimaryButton>
        
        <SecondaryButton 
          type="button"
          onClick={onClose}
        >
          Cancel
        </SecondaryButton>
      </ActionButtons>
    </BaseDialog>
  );
};

// Enhanced Success Dialog with MarketDash styling
export const SuccessDialog = ({ open, onClose, registration, paymentId, email }) => {
  const navigate = useNavigate();

  const handleViewReport = () => {
    // Close the dialog
    onClose();

    // Navigate to the premium report page with the payment ID and email
    const navPath = email 
      ? `/premium-report/${registration}?paymentId=${paymentId}&email=${encodeURIComponent(email)}`
      : `/premium-report/${registration}?paymentId=${paymentId}`;
    
    navigate(navPath);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Payment Successful"
      headerIcon={<CheckCircleIcon />}
    >
      <PremiumSection>
        <div className="section-title">
          <CheckCircleIcon className="section-icon" />
          Transaction Complete
        </div>
        <p style={inlineStyles.textStyles.base}>
          Your premium report for <strong style={inlineStyles.textStyles.emphasis}>{registration}</strong> has been successfully purchased.
        </p>
        
        <div style={inlineStyles.infoPanel}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--gray-700)',
            margin: '0 0 var(--space-xs) 0'
          }}>
            <strong>Payment Reference:</strong> {paymentId}
          </p>
          {email && (
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--gray-700)',
              margin: '0'
            }}>
              <strong>Receipt sent to:</strong> {email}
            </p>
          )}
        </div>
        
        {email && (
          <div style={inlineStyles.infoHighlight}>
            <p style={{
              fontFamily: 'var(--font-main)',
              fontSize: 'var(--text-sm)',
              color: 'var(--gray-800)',
              margin: '0',
              lineHeight: 'var(--leading-relaxed)'
            }}>
              <strong>Important:</strong> Your receipt email contains a unique link to access your premium vehicle report.
              Please save this email for future reference.
            </p>
          </div>
        )}
        
        <p style={inlineStyles.textStyles.base}>
          You can now view your comprehensive vehicle report with all available information.
        </p>
      </PremiumSection>

      <ActionButtons>
        <PrimaryButton 
          onClick={handleViewReport}
          style={inlineStyles.buttonStyles.success}
        >
          <CheckCircleIcon />
          View Report
        </PrimaryButton>
        
        <SecondaryButton 
          onClick={onClose}
        >
          Close
        </SecondaryButton>
      </ActionButtons>
    </BaseDialog>
  );
}

// Sample Report Button Component - can be placed anywhere in your UI
export const SampleReportButton = ({ onClick, className }) => {
  return (
    <GovUKButton
      onClick={onClick}
      className={className}
      style={{
        backgroundColor: '#1d70b8', // Blue color to differentiate from green payment button
        marginRight: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <span>View Free Sample Report</span>
    </GovUKButton>
  );
};

// Sample Report Dialog Component - UPDATED with fullscreen iframe functionality
export const SampleReportDialog = ({ open, onClose, onProceedToPayment }) => {
  const navigate = useNavigate();
  // Use a fixed registration number for the sample
  const sampleRegistration = 'CN09JEJ';

  const handleViewSampleReport = () => {
    // Close the dialog
    onClose();

    // Navigate to the premium report page with a special parameter indicating it's a sample
    navigate(`/premium-report/${sampleRegistration}?paymentId=sample-report`);
  };

  const handleProceedToPayment = () => {
    onClose();
    if (onProceedToPayment) {
      onProceedToPayment();
    }
  };

  // Get the full URL for the sample report to use in the iframe
  const sampleReportUrl = `${window.location.origin}/premium-report/${sampleRegistration}?paymentId=sample-report`;

  return (
    <PremiumModal
      open={open}
      onClose={onClose}
      fullScreen
    >
      <ModalHeader
        style={{
          fontFamily: 'var(--font-main)',
          fontWeight: 600,
          fontSize: 'var(--text-xl)',
          padding: 'var(--space-xl) var(--space-2xl)',
          backgroundColor: 'var(--accent-blue)',
          color: 'var(--white)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        Sample Vehicle Report - {sampleRegistration}
        <IconButton
          className="close-button"
          onClick={onClose}
          size="small"
          style={{ color: 'var(--white)' }}
        >
          <CloseIcon />
        </IconButton>
      </ModalHeader>
      
      <ModalContent style={{ padding: 0, height: 'calc(100vh - 180px)' }}>
        {/* Render the sample report in an iframe */}
        <iframe
          src={sampleReportUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="Sample Vehicle Report"
        />
      </ModalContent>
      
      <div
        style={{
          padding: 'var(--space-md) var(--space-2xl)',
          backgroundColor: 'var(--white)',
          borderTop: '1px solid var(--gray-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        <p style={{ 
          margin: 0,
          fontFamily: 'var(--font-main)',
          fontSize: 'var(--text-base)',
          color: 'var(--gray-700)',
          lineHeight: 1.4
        }}>
          This is a sample report. Purchase a premium report for your vehicle to access all features.
        </p>
        
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <SecondaryButton
            onClick={onClose}
          >
            Close
          </SecondaryButton>
          
          <PrimaryButton
            onClick={handleProceedToPayment}
          >
            Proceed to Payment
          </PrimaryButton>
        </div>
      </div>
    </PremiumModal>
  );
};

export const FullScreenSampleReportButton = ({ className, onProceedToPayment }) => {
  const [open, setOpen] = useState(false);
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleProceedToPayment = () => {
    setOpen(false);
    if (onProceedToPayment) onProceedToPayment();
  };
  
  return (
    <>
      <BaseButton
        onClick={handleOpen}
        variant="blue"
        className={className}
      >
        View Free Sample Report
      </BaseButton>
      
      <SampleReportDialog 
        open={open} 
        onClose={handleClose}
        onProceedToPayment={handleProceedToPayment}
      />
    </>
  );
};