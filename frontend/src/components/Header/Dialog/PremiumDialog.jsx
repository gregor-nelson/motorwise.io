// File: VehicleDialogs.js
// This file contains all dialog components for the vehicle check application

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { 
  GovUKBody, 
  GovUKList, 
  GovUKButton,
  GovUKErrorMessage,
  PaymentLabel,
  StyledCardElement,
  PremiumBanner,
  PremiumHeading,
  PremiumPrice
} from '../../../styles/theme';

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

// Payment Form Component
const PaymentForm = ({ registration, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call your backend API to create a payment intent
      const response = await fetch(`${PAYMENT_API_BASE_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          registration,
          amount: 1995, // £19.95 in pence
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
            name: 'Vehicle Check Customer',
          },
        },
      });
      
      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Call onSuccess which will now handle navigation
        onSuccess(result.paymentIntent);
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
      <PaymentLabel htmlFor="card-element">Enter your card details</PaymentLabel>
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
            },
          }}
        />
      </StyledCardElement>
      
      {error && (
        <GovUKErrorMessage>
          {error}
        </GovUKErrorMessage>
      )}
      
      <GovUKButton 
        type="submit" 
        disabled={!stripe || loading}
        style={{ backgroundColor: '#00703c', marginRight: '10px' }}
      >
        {loading ? 'Processing...' : 'Pay now'}
      </GovUKButton>
      
      <GovUKButton 
        type="button"
        onClick={onClose}
        style={{ 
          backgroundColor: '#b1b4b6',
          color: '#0b0c0c'
        }}
      >
        Cancel
      </GovUKButton>
    </form>
  );
};

// Common premium report features
const PremiumReportFeatures = () => (
  <>
    <GovUKList style={{ paddingLeft: '20px', marginBottom: '20px' }}>
      <li>Full MOT history with advisories</li>
      <li>Previous owners count</li>
      <li>Mileage history and verification</li>
      <li>Detailed technical specifications</li>
      <li>Insurance write-off status</li>
      <li>Import/Export status</li>
    </GovUKList>
  </>
);

// Payment Dialog Component
export const PaymentDialog = ({ open, onClose, registration }) => {
  const navigate = useNavigate();

  // This function will be called after successful payment
  const handlePaymentSuccess = (paymentIntent) => {
    // Close the payment dialog
    onClose();
    
    // Navigate to the premium report page with the payment ID
    navigate(`/premium-report/${registration}?paymentId=${paymentIntent.id}`);
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
          One-time payment of <PremiumPrice>£19.95</PremiumPrice>
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

// Success Dialog Component
export const SuccessDialog = ({ open, onClose, registration, paymentId }) => {
  const navigate = useNavigate();

  const handleViewReport = () => {
    // Close the dialog
    onClose();
    
    // Navigate to the premium report page with the payment ID
    navigate(`/premium-report/${registration}?paymentId=${paymentId}`);
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