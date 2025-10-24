import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js';


// Determine if we're in development or production
export const isDevelopment = window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// Configure API URL based on environment - UPDATED WITH NEW PORT STRIPE API PORT 8001
export const PAYMENT_API_BASE_URL = isDevelopment
  ? 'http://localhost:8001/api/payment/v1'   // Development - pointing to port 8001
  : '/api/payment/v1';                       // Production - use relative URL for Nginx proxy

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe('pk_test_51R0JFMP4qnmsLm0yBZ8WKNQ6jNsYigLRELdUhSMIEf4qWlEaQeWU7EIyIHySGTaqeR5BFup1XDNMDOEqmhynmkTi00ndP8XolL');


// Custom Modal Component with Tailwind
const BaseDialog = ({ open, onClose, title, children, maxWidth = "sm", headerIcon, fullScreen = false }) => {
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  const getModalClasses = () => {
    if (fullScreen) {
      return 'w-full h-full max-w-none max-h-none m-0 rounded-none bg-white flex flex-col';
    }
    
    let classes = 'bg-white rounded-lg shadow-lg transition-colors duration-200 ease-out relative max-h-[90vh] overflow-hidden flex flex-col';
    
    switch (maxWidth) {
      case 'md':
        classes += ' max-w-4xl w-full mx-4';
        break;
      case 'sm':
      default:
        classes += ' max-w-md w-full mx-4';
        break;
    }
    
    return classes;
  };

  return (
    <div 
      className={`
        fixed inset-0 z-50 
        ${fullScreen ? '' : 'flex items-center justify-center p-4 md:p-6'}
        bg-black bg-opacity-30 backdrop-blur-sm
        transition-colors duration-200 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div 
        ref={modalRef}
        className={`
          ${getModalClasses()}
          transform transition-colors duration-200 ease-out
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`
          flex items-center justify-between flex-shrink-0
          ${fullScreen ? 'p-4 md:p-6' : 'p-6 md:p-8'}
        `}>
          <div className="flex items-center space-x-3">
            {headerIcon && (
              <div className="text-blue-600">
                {headerIcon}
              </div>
            )}
            <h2 
              id="dialog-title"
              className={`
                text-neutral-900 leading-tight tracking-tight
                ${fullScreen ? 'text-lg md:text-xl font-medium' : 'text-2xl font-semibold'}
              `}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="
              p-2 text-neutral-400 hover:text-neutral-600
              transition-colors duration-200 rounded-full
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
            aria-label="Close dialog"
          >
            <i className="ph ph-x text-lg"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className={`
          flex-1 overflow-hidden
          ${fullScreen ? 'flex flex-col' : 'overflow-y-auto px-6 pb-6 md:px-8 md:pb-8'}
        `}>
          {children}
        </div>
      </div>
    </div>
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
  const [processing, setProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'payment_request'

  // Update mobile state on resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Setup Payment Request for Apple Pay/Google Pay
  React.useEffect(() => {
    // Only enable Payment Request API on HTTPS (required for Apple Pay/Google Pay)
    const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    if (stripe && isHTTPS) {
      const pr = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: {
          label: 'Premium Vehicle Report',
          amount: 495, // £4.95 in pence
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      // Check if payment request is available
      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        }
      });

      // Handle payment method event
      pr.on('paymentmethod', async (ev) => {
        try {
          setLoading(true);
          setProcessing(true);
          setError(null);

          // Generate the unique report URL
          const reportUrl = `${window.location.origin}/premium-report/${registration}`;
          
          // Get email from payment request
          const customerEmail = ev.payerEmail || email;

          // Create payment intent
          const response = await fetch(`${PAYMENT_API_BASE_URL}/create-payment-intent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              registration,
              amount: 495,
              email: customerEmail,
              receipt_email: customerEmail,
              report_url: reportUrl
            }),
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin'
          });

          if (!response.ok) {
            throw new Error('Failed to create payment intent');
          }

          const { clientSecret } = await response.json();

          // Confirm payment
          const confirmResult = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmResult.error) {
            ev.complete('fail');
            setError(confirmResult.error.message);
          } else {
            ev.complete('success');
            // Call onSuccess with the payment intent and email
            onSuccess(confirmResult.paymentIntent, customerEmail);
          }
        } catch (err) {
          console.error('Payment Request error:', err);
          ev.complete('fail');
          setError(err.message || 'Payment failed');
        } finally {
          setLoading(false);
          setProcessing(false);
        }
      });
    }
  }, [stripe, registration, email, onSuccess]);

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
    // Card completion state handled by Stripe
    
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Information Section */}
      <div className="space-y-4">
        <div className="text-lg font-medium text-neutral-900 mb-4">
          Contact Information
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-neutral-900">
            Email Address
          </label>
          
          {emailError && (
            <div 
              id="email-error"
              role="alert"
              aria-live="polite"
              className="flex items-start space-x-2 text-red-600 text-xs"
            >
              <i className="ph ph-warning text-sm mt-0.5" aria-hidden="true"></i>
              <span>{emailError}</span>
            </div>
          )}
          
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="your.email@example.com"
            className={`
              w-full px-3 py-2 text-sm rounded-lg bg-neutral-50 border-none
              focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm
              ${emailError ? 'ring-2 ring-red-500' : ''}
            `}
            aria-describedby={emailError ? "email-error" : undefined}
            inputMode="email"
            autoComplete="email"
          />
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="space-y-4">
        <div className="text-lg font-medium text-neutral-900 mb-4">
          Payment Details
        </div>

        {/* Apple Pay / Google Pay Button */}
        {canMakePayment && paymentRequest && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900">
              Quick Payment
            </label>
            <div className="w-full">
              <PaymentRequestButtonElement
                options={{ paymentRequest }}
                className="w-full"
              />
            </div>
            
            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-neutral-200"></div>
              <span className="px-3 text-xs text-neutral-500 bg-white">or pay with card</span>
              <div className="flex-1 border-t border-neutral-200"></div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="card-element" className="text-sm font-medium text-neutral-900">
            Card Information
          </label>
          
          {(error || cardError) && (
            <div 
              id="payment-error"
              role="alert"
              aria-live="polite"
              className="flex items-start space-x-2 text-red-600 text-xs"
            >
              <i className="ph ph-warning text-sm mt-0.5" aria-hidden="true"></i>
              <span>{error || cardError}</span>
            </div>
          )}
          
          <CardElement
            id="card-element"
            onChange={handleCardChange}
            options={{
              hidePostalCode: false,
              style: {
                base: {
                  fontSize: '14px',
                  color: '#374151',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
                invalid: {
                  color: '#EF4444',
                },
              },
            }}
          />
        </div>
        
        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 py-3 text-neutral-600 text-xs">
          <i className="ph ph-shield-check text-green-600"></i>
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>
        
        {/* Payment Method Icons */}
        <div className="space-y-3 py-2">
          <div className="text-xs text-neutral-600 text-center font-medium">We accept:</div>
          <div className="flex space-x-2 flex-wrap justify-center">
            {/* VISA Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
              <div className="relative px-3 py-2 bg-white border-2 border-neutral-200 hover:border-blue-300 text-neutral-700 hover:text-blue-600 text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                <i className="ph ph-credit-card mr-1"></i>VISA
              </div>
            </div>

            {/* Mastercard */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-200 to-red-300 rounded-lg opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
              <div className="relative px-3 py-2 bg-white border-2 border-neutral-200 hover:border-orange-300 text-neutral-700 hover:text-orange-600 text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                <i className="ph ph-credit-card mr-1"></i>MC
              </div>
            </div>

            {/* AMEX */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-lg opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
              <div className="relative px-3 py-2 bg-white border-2 border-neutral-200 hover:border-cyan-300 text-neutral-700 hover:text-cyan-600 text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                <i className="ph ph-credit-card mr-1"></i>AMEX
              </div>
            </div>

            {canMakePayment && (
              <>
                {/* Apple Pay */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-neutral-300 to-neutral-400 rounded-lg opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                  <div className="relative px-3 py-2 bg-white border-2 border-neutral-200 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                    <i className="ph ph-apple-logo mr-1"></i>Pay
                  </div>
                </div>

                {/* Google Pay */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-200 to-green-300 rounded-lg opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                  <div className="relative px-3 py-2 bg-white border-2 border-neutral-200 hover:border-green-300 text-neutral-700 hover:text-green-600 text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                    <i className="ph ph-google-logo mr-1"></i>Pay
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 mt-8">
        <button
          type="submit"
          disabled={!stripe || loading}
          aria-busy={loading}
          aria-describedby={error ? "payment-error" : undefined}
          className={`
            w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg
            hover:bg-blue-700 transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center space-x-2
          `}
        >
          {loading ? (
            <>
              <div 
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" 
                aria-hidden="true"
              />
              <span aria-live="polite">
                {processing ? (isMobile ? 'Processing...' : 'Processing Payment...') : 'Preparing...'}
              </span>
            </>
          ) : (
            <>
              <i className="ph ph-shield-check" aria-hidden="true"></i>
              <span>{isMobile ? 'Pay £4.95' : 'Pay £4.95 Securely'}</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onClose}
          className="
            w-full px-4 py-3 bg-white text-neutral-700 text-sm font-medium rounded-lg
            border border-neutral-300 hover:bg-neutral-50
            transition-colors duration-200 focus:outline-none focus:ring-2
            focus:ring-blue-500 focus:ring-offset-2
          "
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Enhanced Premium Report Features with card-based design matching Hero/Pipeline
const PremiumReportFeatures = ({ showAll = false, onToggle }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  // Update mobile state on resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const coreFeatures = [
    {
      icon: 'ph-shield-check',
      title: 'DVLA Identity Verification',
      description: isMobile ? 'Official government records' : 'Official government records - police & agency access',
      colorTheme: {
        bgPastel: 'from-purple-50 to-purple-50',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        iconHover: 'group-hover:text-purple-700',
        borderHover: 'hover:border-purple-300',
        glowColor: 'from-purple-200 to-purple-300',
        decorAccent: 'from-purple-400 to-purple-500'
      }
    },
    {
      icon: 'ph-detective',
      title: 'Mileage Fraud Protection',
      description: isMobile ? 'Forensic odometer detection' : 'Forensic-level odometer tampering detection',
      colorTheme: {
        bgPastel: 'from-cyan-50 to-cyan-50',
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
        iconHover: 'group-hover:text-cyan-700',
        borderHover: 'hover:border-cyan-300',
        glowColor: 'from-cyan-200 to-cyan-300',
        decorAccent: 'from-cyan-400 to-cyan-500'
      }
    },
    {
      icon: 'ph-wrench',
      title: 'Professional Repair Database',
      description: isMobile ? 'BMW, Mercedes dealer data' : 'Technical data trusted by BMW, Mercedes dealerships',
      colorTheme: {
        bgPastel: 'from-blue-50 to-cyan-50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        iconHover: 'group-hover:text-blue-700',
        borderHover: 'hover:border-blue-300',
        glowColor: 'from-blue-200 to-cyan-300',
        decorAccent: 'from-blue-400 to-cyan-500'
      }
    }
  ];

  const additionalFeatures = [
    {
      icon: 'ph-chart-line-up',
      title: 'Advanced Usage History',
      description: isMobile ? '3D visualization & hidden patterns' : '3D visualization exposing hidden patterns traditional reports miss',
      colorTheme: {
        bgPastel: 'from-green-50 to-emerald-50',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        iconHover: 'group-hover:text-green-700',
        borderHover: 'hover:border-green-300',
        glowColor: 'from-green-200 to-emerald-300',
        decorAccent: 'from-green-400 to-emerald-500'
      }
    },
    {
      icon: 'ph-database',
      title: 'Market Intelligence & Risk Assessment',
      description: isMobile ? '40+ million UK vehicle records' : 'Compare against 40+ million UK vehicle records for confident decisions',
      colorTheme: {
        bgPastel: 'from-amber-50 to-yellow-50',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        iconHover: 'group-hover:text-amber-700',
        borderHover: 'hover:border-amber-300',
        glowColor: 'from-amber-200 to-yellow-300',
        decorAccent: 'from-amber-400 to-yellow-500'
      }
    },
    {
      icon: 'ph-file-text',
      title: 'Complete Documentation Package',
      description: isMobile ? 'Bank & insurance standards' : 'Professional-grade reports meeting bank and insurance standards',
      colorTheme: {
        bgPastel: 'from-indigo-50 to-blue-50',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        iconHover: 'group-hover:text-indigo-700',
        borderHover: 'hover:border-indigo-300',
        glowColor: 'from-indigo-200 to-blue-300',
        decorAccent: 'from-indigo-400 to-blue-500'
      }
    }
  ];

  const featuresToShow = showAll ? [...coreFeatures, ...additionalFeatures] : coreFeatures;

  // Rotation classes for playful effect
  const rotationClasses = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1', '-rotate-1'];

  return (
    <div className="space-y-4">
      {featuresToShow.map((feature, index) => {
        const rotation = rotationClasses[index % rotationClasses.length];
        const theme = feature.colorTheme;

        return (
          <div
            key={index}
            className={`
              group relative transform ${rotation} hover:rotate-0
              transition-all duration-500 ease-out
            `}
          >
            {/* Outer glow effect */}
            <div className={`
              absolute -inset-1 bg-gradient-to-br ${theme.glowColor} rounded-2xl
              opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500
            `}></div>

            {/* Main card with pastel gradient background */}
            <div className={`
              relative bg-gradient-to-br ${theme.bgPastel} rounded-2xl p-5 shadow-2xl
              border-2 border-neutral-200 ${theme.borderHover}
              transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]
              overflow-hidden
            `}>
              {/* Content wrapper */}
              <div className="relative flex items-start space-x-4">
                {/* Icon container - enlarged and refined */}
                <div className="flex-shrink-0 relative">
                  {/* Icon glow layer */}
                  <div className={`
                    absolute -inset-1 bg-gradient-to-br ${theme.glowColor} rounded-xl
                    opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-300
                  `}></div>

                  {/* Icon container - larger square with rounded corners */}
                  <div className={`
                    relative w-16 h-16 rounded-xl ${theme.iconBg}
                    flex items-center justify-center shadow-sm
                    border-2 border-transparent ${theme.borderHover}
                    group-hover:scale-110 transition-all duration-300
                  `}>
                    <i className={`
                      ph ${feature.icon} text-4xl
                      ${theme.iconColor} ${theme.iconHover}
                      transition-colors duration-200
                    `}></i>
                  </div>
                </div>

                {/* Text content */}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neutral-900 mb-1.5 leading-tight">
                    {feature.title}
                  </div>
                  {/* Decorative gradient underline */}
                  <div className={`w-12 h-0.5 bg-gradient-to-r ${theme.glowColor} opacity-60 rounded-full mb-2`}></div>
                  <div className="text-xs text-neutral-600 leading-relaxed">
                    {feature.description}
                  </div>
                </div>
              </div>

              {/* Decorative blur accent - bottom right */}
              <div className={`
                absolute -bottom-2 -right-2 w-16 h-16
                bg-gradient-to-br ${theme.decorAccent} rounded-lg
                opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300
              `}></div>
            </div>
          </div>
        );
      })}

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="
            w-full text-left px-4 py-3 text-blue-600 hover:text-blue-700
            text-sm font-medium cursor-pointer transition-colors duration-200
            hover:bg-blue-50 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
        >
          <div className="flex items-center justify-between">
            <span>
              {showAll
                ? (isMobile ? '- Show less' : '- Show fewer features')
                : (isMobile ? '+ Show 3 more' : '+ Show 3 more professional features')
              }
            </span>
            <i className={`
              ph ph-caret-down transition-transform duration-200
              ${showAll ? 'rotate-180' : 'rotate-0'}
            `}></i>
          </div>
        </button>
      )}
    </div>
  );
};

// Enhanced MarketDash Payment Dialog Component with Two-Column Layout
export const PaymentDialog = ({ open, onClose, registration }) => {
  const navigate = useNavigate();
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  // Update mobile state on resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      maxWidth="md"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-[500px]">
        {/* LEFT COLUMN: Trust & Features */}
        <div className="space-y-8">
          {/* Trust Hero Section */}
          <div className="group relative transform hover:scale-[1.02] transition-all duration-500 ease-out">
            {/* Outer glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-2xl opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-500"></div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 md:p-8 shadow-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden">
              <div className="relative flex items-start space-x-5">
                <div className="flex-shrink-0 relative">
                  {/* Icon glow layer - enhanced */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-xl opacity-15 blur-md group-hover:opacity-30 transition-opacity duration-300"></div>

                  {/* Icon container - larger */}
                  <div className="relative w-20 h-20 rounded-xl bg-blue-100 flex items-center justify-center shadow-md border-2 border-blue-200 hover:border-blue-400 group-hover:scale-110 transition-all duration-300">
                    <i className="ph ph-shield-check text-5xl text-blue-600 group-hover:text-blue-700 transition-colors duration-200"></i>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-neutral-900 mb-2 leading-tight tracking-tight">
                    {isMobile ? 'Protecting from £2.3B Fraud' : 'Protecting from £2.3B UK Vehicle Fraud'}
                  </h3>
                  {/* Decorative gradient underline - enhanced */}
                  <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-transparent opacity-60 rounded-full mb-3"></div>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {isMobile ? 'BMW, Mercedes & government agency database' : 'Same comprehensive database used by BMW, Mercedes dealerships and government agencies'}
                  </p>
                </div>
              </div>

              {/* Decorative blur accent - enhanced */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-15 blur-2xl group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Professional Positioning */}
          <div className="relative text-center py-6 px-4 bg-gradient-to-br from-neutral-50 to-blue-50 rounded-2xl shadow-lg border-2 border-neutral-200">
            <div className="text-sm text-neutral-600 mb-2 font-medium">
              {isMobile ? 'Professional Intelligence for' : 'Professional-Grade Intelligence for'}
            </div>
            <div className="text-2xl font-bold text-blue-600 tracking-wider font-mono">
              {registration}
            </div>
            {/* Decorative gradient underline */}
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 rounded-full mx-auto mt-3"></div>
          </div>
          
          {/* Features */}
          <div>
            <PremiumReportFeatures 
              showAll={showAllFeatures}
              onToggle={toggleFeatures}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Action & Payment */}
        <div className="space-y-6 lg:border-l lg:border-neutral-200 lg:pl-8">
          {/* Pricing Section */}
          <div className="group relative transform hover:scale-[1.02] transition-all duration-500 ease-out">
            {/* Outer glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

            {/* Main pricing card */}
            <div className="relative bg-gradient-to-br from-neutral-50 to-blue-50 rounded-2xl p-8 text-center shadow-2xl border-2 border-neutral-200 hover:border-blue-300 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden">
              <div className="relative">
                {/* Icon badge */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 border-2 border-blue-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="ph ph-currency-gbp text-3xl text-blue-600"></i>
                </div>

                <div className="text-sm text-neutral-600 mb-3 font-medium">One-time payment</div>
                <div className="text-5xl font-bold text-blue-600 mb-3 group-hover:scale-105 transition-transform duration-300">£4.95</div>

                {/* Decorative gradient underline */}
                <div className="w-20 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 rounded-full mx-auto mb-3"></div>

                <div className="text-sm text-neutral-600 leading-relaxed">Instant access • No subscription</div>

                {/* Value indicators */}
                <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-center gap-4 text-xs text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <i className="ph ph-check-circle text-green-600"></i>
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="ph ph-check-circle text-green-600"></i>
                    <span>Full report</span>
                  </div>
                </div>
              </div>

              {/* Decorative blur accent */}
              <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Payment Form */}
          <div className="space-y-4">
            <Elements stripe={stripePromise}>
              <PaymentForm 
                registration={registration}
                onSuccess={handlePaymentSuccess}
                onClose={onClose}
              />
            </Elements>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
}

// Enhanced Free Report Dialog with MarketDash styling
export const FreeReportDialog = ({ open, onClose, registration, reportType = 'classic' }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [showDetails, setShowDetails] = useState(false);

  // Update mobile state on resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleViewFreeReport = () => {
    onClose();
    const paymentId = reportType === 'modern' ? 'free-modern-vehicle' : 'free-classic-vehicle';
    navigate(`/premium-report/${registration}?paymentId=${paymentId}`);
  };

  const dialogTitle = "Complimentary Vehicle Report";

  const explanationText = reportType === 'modern'
    ? "For vehicles registered from 2018 onwards, the comprehensive report is provided without charge as these vehicles have limited historical data available."
    : "For vehicles registered before 1996, the comprehensive report is provided without charge as part of our commitment to vehicle transparency.";

  const whyFreeReasons = [
    {
      icon: "ph-database",
      title: reportType === 'modern' ? "Limited Historical Data" : "Heritage Vehicle Support",
      description: reportType === 'modern' 
        ? "Newer vehicles have fewer recorded events, making comprehensive analysis more straightforward"
        : "Classic vehicles deserve the same level of transparency and verification as modern vehicles"
    },
    {
      icon: "ph-shield-check",
      title: "Same Professional Database",
      description: "Access to identical government and industry databases used for premium reports"
    },
    {
      icon: "ph-heart",
      title: "Service Commitment",
      description: "Supporting vehicle transparency across all age ranges and market segments"
    }
  ];

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={dialogTitle}
      headerIcon={<i className="ph ph-gift text-green-600"></i>}
      maxWidth="md"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT COLUMN: Value & Trust */}
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="group relative transform hover:scale-[1.02] transition-all duration-500 ease-out">
            {/* Outer glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-green-200 to-emerald-300 rounded-2xl opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-500"></div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 shadow-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden">
              <div className="relative flex items-start space-x-5">
                <div className="flex-shrink-0 relative">
                  {/* Icon glow layer - enhanced */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-green-300 to-emerald-400 rounded-xl opacity-15 blur-md group-hover:opacity-30 transition-opacity duration-300"></div>

                  {/* Icon container - larger */}
                  <div className="relative w-20 h-20 rounded-xl bg-green-100 flex items-center justify-center shadow-md border-2 border-green-200 hover:border-green-400 group-hover:scale-110 transition-all duration-300">
                    <i className="ph ph-gift text-5xl text-green-600 group-hover:text-green-700 transition-colors duration-200"></i>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-neutral-900 mb-2 leading-tight tracking-tight">
                    {isMobile ? 'Complimentary Access' : 'Complimentary Professional Access'}
                  </h3>
                  {/* Decorative gradient underline - enhanced */}
                  <div className="w-20 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-transparent opacity-60 rounded-full mb-3"></div>
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                    The comprehensive report for <strong className="text-neutral-900 font-medium">{registration}</strong> is available at no cost.
                  </p>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {explanationText}
                  </p>
                </div>
              </div>

              {/* Decorative blur accent - enhanced */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg opacity-15 blur-2xl group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Why Free Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-neutral-900">Why is this free?</h4>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center space-x-1"
              >
                <span>{showDetails ? 'Show less' : 'Learn more'}</span>
                <i className={`ph ph-caret-down transition-transform duration-200 ${
                  showDetails ? 'rotate-180' : 'rotate-0'
                }`}></i>
              </button>
            </div>
            
            {showDetails && (
              <div className="space-y-3 mb-4">
                {whyFreeReasons.map((reason, index) => (
                  <div key={index} className="group relative transform hover:rotate-0 transition-all duration-500 ease-out">
                    {/* Outer glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-2xl opacity-0 group-hover:opacity-15 blur-lg transition-opacity duration-500"></div>

                    {/* Main card */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 shadow-md border-2 border-neutral-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg overflow-hidden">
                      <div className="relative flex items-start space-x-3">
                        <div className="flex-shrink-0 relative">
                          {/* Icon glow */}
                          <div className="absolute -inset-1 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-lg opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-300"></div>
                          {/* Icon container */}
                          <div className="relative w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center border-2 border-transparent hover:border-blue-300 group-hover:scale-110 transition-all duration-300">
                            <i className={`ph ${reason.icon} text-blue-600 text-2xl group-hover:text-blue-700 transition-colors duration-200`}></i>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-neutral-900 mb-1">{reason.title}</div>
                          <div className="w-8 h-0.5 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-60 rounded-full mb-1.5"></div>
                          <div className="text-xs text-neutral-600 leading-relaxed">{reason.description}</div>
                        </div>
                      </div>

                      {/* Decorative blur accent */}
                      <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Trust Signal */}
          <div className="group relative">
            {/* Outer glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-2xl opacity-0 group-hover:opacity-15 blur-lg transition-opacity duration-500"></div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl overflow-hidden">
              <div className="relative flex items-center space-x-4">
                <div className="flex-shrink-0 relative">
                  {/* Icon glow */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-xl opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-300"></div>
                  {/* Icon container */}
                  <div className="relative w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center border-2 border-transparent hover:border-blue-300 group-hover:scale-110 transition-all duration-300">
                    <i className="ph ph-shield-check text-blue-600 text-3xl group-hover:text-blue-700 transition-colors duration-200"></i>
                  </div>
                </div>
                <div className="text-xs text-neutral-700 flex-1 leading-relaxed">
                  <strong className="font-semibold text-neutral-900">Professional Standards:</strong> Same database access and verification processes used for premium commercial reports
                </div>
              </div>

              {/* Decorative blur accent */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Features & Action */}
        <div className="space-y-6 lg:border-l lg:border-neutral-200 lg:pl-8">
          {/* Features */}
          <div>
            <div className="text-sm font-medium text-neutral-900 mb-4">
              Report includes:
            </div>
            <PremiumReportFeatures />
          </div>
          
          {/* Pricing Banner */}
          <div className="group relative transform hover:scale-[1.02] transition-all duration-500 ease-out">
            {/* Outer glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-green-200 to-emerald-300 rounded-2xl opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-500"></div>

            {/* Main pricing card */}
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center shadow-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden">
              <div className="relative">
                {/* Icon badge */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 border-2 border-green-200 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="ph ph-gift text-3xl text-green-600"></i>
                </div>

                <div className="text-5xl font-bold text-green-600 mb-3 group-hover:scale-105 transition-transform duration-300">FREE</div>

                {/* Decorative gradient underline */}
                <div className="w-20 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60 rounded-full mx-auto mb-3"></div>

                <div className="text-sm text-neutral-600 font-medium leading-relaxed">No payment • No registration • Instant access</div>
              </div>

              {/* Decorative blur accent */}
              <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg opacity-15 blur-2xl group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={handleViewFreeReport}
              className="
                w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg
                hover:bg-green-700 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                flex items-center justify-center space-x-2
              "
            >
              <i className="ph ph-arrow-right"></i>
              <span>View Report Now</span>
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="
                w-full px-4 py-3 bg-white text-neutral-700 text-sm font-medium rounded-lg
                border border-neutral-300 hover:bg-neutral-50
                transition-colors duration-200 focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:ring-offset-2
              "
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
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
      headerIcon={<i className="ph ph-check-circle text-green-600"></i>}
    >
      <div className="space-y-8">
        {/* Transaction Complete Section */}
        <div className="group relative transform hover:scale-[1.01] transition-all duration-500 ease-out">
          {/* Outer glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-br from-green-200 to-emerald-300 rounded-2xl opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-500"></div>

          {/* Main card */}
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="relative">
              <div className="flex items-center space-x-5 mb-4">
                <div className="flex-shrink-0 relative">
                  {/* Icon glow layer - enhanced */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-green-300 to-emerald-400 rounded-xl opacity-15 blur-md group-hover:opacity-30 transition-opacity duration-300"></div>
                  {/* Icon container - larger */}
                  <div className="relative w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center shadow-md border-2 border-green-200 hover:border-green-400 group-hover:scale-110 transition-all duration-300">
                    <i className="ph ph-check-circle text-4xl text-green-600 group-hover:text-green-700 transition-colors duration-200"></i>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 leading-tight tracking-tight">Transaction Complete</h3>
              </div>
              {/* Decorative gradient underline - enhanced */}
              <div className="w-20 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-transparent opacity-60 rounded-full mb-4"></div>

              <p className="text-sm text-neutral-700 leading-relaxed">
                Your premium report for <strong className="text-neutral-900 font-semibold">{registration}</strong> has been successfully purchased.
              </p>
            </div>

            {/* Decorative blur accent - enhanced */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg opacity-15 blur-2xl group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="group relative">
          {/* Outer glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-2xl opacity-0 group-hover:opacity-15 blur-lg transition-opacity duration-500"></div>

          {/* Main card */}
          <div className="relative bg-gradient-to-br from-neutral-50 to-blue-50 rounded-2xl p-5 shadow-lg border-2 border-neutral-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl overflow-hidden">
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <i className="ph ph-receipt text-blue-600 text-lg"></i>
                <span className="text-xs font-semibold text-neutral-900">Payment Details</span>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-60 rounded-full mb-2"></div>
              <p className="text-xs text-neutral-700 font-mono leading-relaxed">
                <strong className="font-semibold">Payment Reference:</strong> {paymentId}
              </p>
              {email && (
                <p className="text-xs text-neutral-700 font-mono leading-relaxed">
                  <strong className="font-semibold">Receipt sent to:</strong> {email}
                </p>
              )}
            </div>

            {/* Decorative blur accent */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Important Notice */}
        {email && (
          <div className="group relative">
            {/* Outer glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-2xl opacity-0 group-hover:opacity-15 blur-lg transition-opacity duration-500"></div>

            {/* Main card with left border accent */}
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 shadow-lg border-2 border-blue-200 hover:border-blue-300 border-l-4 border-l-blue-500 transition-all duration-300 hover:shadow-xl overflow-hidden">
              <div className="relative flex items-start space-x-4">
                <div className="flex-shrink-0 relative">
                  {/* Icon glow */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-xl opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-300"></div>
                  {/* Icon container */}
                  <div className="relative w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center border-2 border-transparent hover:border-blue-300 group-hover:scale-110 transition-all duration-300">
                    <i className="ph ph-info text-blue-600 text-3xl group-hover:text-blue-700 transition-colors duration-200"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-neutral-900 mb-1">Important Notice</div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-300 to-cyan-300 opacity-60 rounded-full mb-2"></div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Your receipt email contains a unique link to access your premium vehicle report.
                    Please save this email for future reference.
                  </p>
                </div>
              </div>

              {/* Decorative blur accent */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
          </div>
        )}
        
        <p className="text-sm text-neutral-700 leading-relaxed">
          You can now view your comprehensive vehicle report with all available information.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleViewReport}
            className="
              w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg
              hover:bg-green-700 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              flex items-center justify-center space-x-2
            "
          >
            <i className="ph ph-check-circle"></i>
            <span>View Report</span>
          </button>
          
          <button
            onClick={onClose}
            className="
              w-full px-4 py-3 bg-white text-neutral-700 text-sm font-medium rounded-lg
              border border-neutral-300 hover:bg-neutral-50               transition-colors duration-200 focus:outline-none focus:ring-2
              focus:ring-blue-500 focus:ring-offset-2
            "
          >
            Close
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}

// Sample Report Button Component - can be placed anywhere in your UI
export const SampleReportButton = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
        hover:bg-blue-700 transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        flex items-center justify-center space-x-2 mr-3
        ${className || ''}
      `}
    >
      <i className="ph ph-file-text"></i>
      <span>View Free Sample Report</span>
    </button>
  );
};

// Sample Report Dialog Component - UPDATED with fullscreen iframe functionality
export const SampleReportDialog = ({ open, onClose, onProceedToPayment }) => {
  // Use a fixed registration number for the sample
  const sampleRegistration = 'CN09JEJ';

  const handleProceedToPayment = () => {
    onClose();
    if (onProceedToPayment) {
      onProceedToPayment();
    }
  };

  // Get the full URL for the sample report to use in the iframe
  const sampleReportUrl = `${window.location.origin}/premium-report/${sampleRegistration}?paymentId=sample-report`;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={`Sample Vehicle Report - ${sampleRegistration}`}
      fullScreen={true}
    >
      {/* Iframe Container - takes remaining space after header */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={sampleReportUrl}
          className="w-full h-full border-none"
          title="Sample Vehicle Report"
        />
      </div>
      
      {/* Sticky Footer */}
      <div className="bg-neutral-50 border-t border-neutral-200 px-4 py-3 md:px-6 md:py-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-6">
          <p className="text-xs md:text-sm text-neutral-600 text-center md:text-left flex-1">
            This is a sample report. Purchase a premium report for your vehicle to access all features.
          </p>
          
          <button
            onClick={handleProceedToPayment}
            className="
              px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white text-xs md:text-sm font-medium rounded-lg
              hover:bg-blue-700 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              flex-shrink-0 flex items-center space-x-2
            "
          >
            <i className="ph ph-arrow-right"></i>
            <span>Get Premium Report</span>
          </button>
        </div>
      </div>
    </BaseDialog>
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
      <button
        onClick={handleOpen}
        className={`
          px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
          hover:bg-blue-700 transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          flex items-center justify-center space-x-2
          ${className || ''}
        `}
      >
        <i className="ph ph-file-text"></i>
        <span>View Free Sample Report</span>
      </button>
      
      <SampleReportDialog 
        open={open} 
        onClose={handleClose}
        onProceedToPayment={handleProceedToPayment}
      />
    </>
  );
};