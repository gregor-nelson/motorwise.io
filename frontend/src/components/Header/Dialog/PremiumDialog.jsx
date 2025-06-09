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
import {
  // Form structure components
  GovUKFormGroup,
  GovUKInput,
  GovUKErrorMessage,
  
  // Payment specific components
  PaymentLabel,
  StyledCardElement,
  PayButtonPrimary,
  PayButtonSecondary,
  PaymentFormActions,
  GovUKBody,
  PremiumBanner,
  PremiumPrice,
  PremiumHeading,
  GovUKButton,
  GovUKList,
  GovUKListBullet,
  BaseButton
} from '../../../styles/theme'

// Determine if we're in development or production
export const isDevelopment = window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// Configure API URL based on environment - UPDATED WITH NEW PORT STRIPE API PORT 8001
export const PAYMENT_API_BASE_URL = isDevelopment
  ? 'http://localhost:8001/api/payment/v1'   // Development - pointing to port 8001
  : '/api/payment/v1';                       // Production - use relative URL for Nginx proxy

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe('pk_test_51R0JFMP4qnmsLm0yBZ8WKNQ6jNsYigLRELdUhSMIEf4qWlEaQeWU7EIyIHySGTaqeR5BFup1XDNMDOEqmhynmkTi00ndP8XolL');

// Base Dialog Component - Common structure for all dialogs
const BaseDialog = ({ open, onClose, title, children, maxWidth = "sm" }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      <DialogTitle
        style={{
          fontFamily: '"GDS Transport", arial, sans-serif',
          fontWeight: 700,
          fontSize: '1.5rem',
          padding: '20px 24px',
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent style={{ padding: '0 24px 20px' }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

// Streamlined Payment Form Component with GovUK theme consistency
const PaymentForm = ({ registration, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);

  // Email validation function
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(null); // Clear error when user types
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
    setError(null);
    setEmailError(null);

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
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Email input field using GovUK form styling */}
      <GovUKFormGroup>
        <PaymentLabel htmlFor="email">
          Email address
        </PaymentLabel>
        
        {emailError && (
          <GovUKErrorMessage>
            {emailError}
          </GovUKErrorMessage>
        )}
        
        <GovUKInput
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="example@domain.com"
          error={emailError ? true : false}
          aria-describedby={emailError ? "email-error" : undefined}
        />
      </GovUKFormGroup>

      <GovUKFormGroup>
        <PaymentLabel htmlFor="card-element">
          Enter your card details
        </PaymentLabel>
        
        <StyledCardElement id="card-element">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#0b0c0c',
                  fontFamily: '"GDS Transport", arial, sans-serif',
                  '::placeholder': {
                    color: '#505a5f',
                  },
                },
                invalid: {
                  color: '#d4351c',
                },
              }
            }}
          />
        </StyledCardElement>

        {error && (
          <GovUKErrorMessage>
            {error}
          </GovUKErrorMessage>
        )}
      </GovUKFormGroup>
      
      <PaymentFormActions>
        <PayButtonPrimary 
          type="submit" 
          disabled={!stripe || loading}
        >
          {loading ? 'Processing...' : 'Pay now'}
        </PayButtonPrimary>
        
        <PayButtonSecondary 
          type="button"
          onClick={onClose}
        >
          Cancel
        </PayButtonSecondary>
      </PaymentFormActions>
    </form>
  );
};

// Common premium report features
const PremiumReportFeatures = () => {
  return (
    <GovUKListBullet>
      <li>Full MOT history with advisories</li>
      <li>Previous owners count</li>
      <li>Mileage history and verification</li>
      <li>Detailed technical specifications</li>
      <li>Insurance write-off status</li>
      <li>Import/Export status</li>
    </GovUKListBullet>
  );
};

// Enhanced Payment Dialog Component
export const PaymentDialog = ({ open, onClose, registration }) => {
  const navigate = useNavigate();

  // Updated to include email parameter
  const handlePaymentSuccess = (paymentIntent, email) => {
    // Close the payment dialog
    onClose();

    // Navigate to the premium report page with the payment ID and email
    navigate(`/premium-report/${registration}?paymentId=${paymentIntent.id}&email=${encodeURIComponent(email)}`);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Premium Vehicle Report"
    >
      <GovUKBody>
        Get a comprehensive premium report for <strong>{registration}</strong> including:
      </GovUKBody>
      <PremiumReportFeatures />

      <PremiumBanner>
        <GovUKBody style={{ marginBottom: '0' }}>
          One-time payment of <PremiumPrice>£4.95</PremiumPrice>
        </GovUKBody>
      </PremiumBanner>
      
      <PremiumHeading>Payment Details</PremiumHeading>
      <Elements stripe={stripePromise}>
        <PaymentForm 
          registration={registration}
          onSuccess={handlePaymentSuccess}
          onClose={onClose}
        />
      </Elements>
    </BaseDialog>
  );
};

// Free Report Dialog Component for eligible vehicles
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
  const dialogTitle = "Vehicle Report Information";

  // Different explanations based on report type
  const explanationText = reportType === 'modern'
    ? "For vehicles registered from 2018 onwards, the enhanced vehicle report is provided without charge as these vehicles have limited historical data."
    : "For vehicles registered before 1996, the enhanced vehicle report is provided without charge as part of this service.";

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={dialogTitle}
    >
      <GovUKBody>
        The comprehensive report for vehicle <strong>{registration}</strong> is available at no cost.
      </GovUKBody>

      <GovUKBody>
        {explanationText}
      </GovUKBody>
      
      <GovUKBody>
        The report includes:
      </GovUKBody>
      
      <PremiumReportFeatures />
      
      <PremiumBanner>
        <GovUKBody style={{ marginBottom: '0' }}>
          No payment required
        </GovUKBody>
      </PremiumBanner>
      
      <div style={{ marginTop: '20px' }}>
        <GovUKButton 
          onClick={handleViewFreeReport}
          style={{ backgroundColor: '#00703c', marginRight: '10px' }}
        >
          Continue to Report
        </GovUKButton>
        
        <GovUKButton 
          onClick={onClose}
          style={{ 
            backgroundColor: '#b1b4b6',
            color: '#0b0c0c'
          }}
        >
          Cancel
        </GovUKButton>
      </div>
    </BaseDialog>
  );
};

// Enhanced Success Dialog Component
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
    >
      <GovUKBody>
        Your premium report for <strong>{registration}</strong> has been successfully purchased.
      </GovUKBody>
      <GovUKBody>
        Payment reference: <strong>{paymentId}</strong>
      </GovUKBody>
      {email && (
        <>
          <GovUKBody>
            A receipt has been sent to: <strong>{email}</strong>
          </GovUKBody>
          <GovUKBody>
            <strong>Important:</strong> Your receipt email contains a unique link to access your premium vehicle report.
            Please save this email for future reference.
          </GovUKBody>
        </>
      )}
      <GovUKBody>
        You can now view your comprehensive vehicle report with all available information.
      </GovUKBody>

      <DialogActions style={{ padding: '0 24px 20px' }}>
        <GovUKButton 
          onClick={handleViewReport}
          style={{ backgroundColor: '#00703c', marginRight: '10px' }}
        >
          View Report
        </GovUKButton>
        
        <GovUKButton 
          onClick={onClose}
          style={{ 
            backgroundColor: '#b1b4b6',
            color: '#0b0c0c'
          }}
        >
          Close
        </GovUKButton>
      </DialogActions>
    </BaseDialog>
  );
};

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
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        style: {
          backgroundColor: '#f8f8f8'
        }
      }}
    >
      <DialogTitle
        style={{
          fontFamily: '"GDS Transport", arial, sans-serif',
          fontWeight: 700,
          fontSize: '1.5rem',
          padding: '20px 24px',
          backgroundColor: '#1d70b8',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        Sample Vehicle Report - {sampleRegistration}
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent style={{ padding: 0, height: 'calc(100vh - 180px)' }}>
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
      </DialogContent>
      
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: '#f3f2f1',
          borderTop: '1px solid #b1b4b6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <GovUKBody style={{ margin: 0 }}>
          This is a sample report. Purchase a premium report for your vehicle to access all features.
        </GovUKBody>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <GovUKButton
            onClick={onClose}
            style={{
              backgroundColor: '#b1b4b6',
              color: '#0b0c0c'
            }}
          >
            Close
          </GovUKButton>
          
          <PayButtonPrimary
            onClick={handleProceedToPayment}
          >
            Proceed to Payment
          </PayButtonPrimary>
        </div>
      </div>
    </Dialog>
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