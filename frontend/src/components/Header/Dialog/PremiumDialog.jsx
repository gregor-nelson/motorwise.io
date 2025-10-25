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

// Add global CSS for hiding scrollbars
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
if (!document.head.querySelector('style[data-scrollbar-hide]')) {
  styleSheet.setAttribute('data-scrollbar-hide', 'true');
  document.head.appendChild(styleSheet);
}

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
        {/* Header - mobile optimized */}
        <div className={`
          flex items-center justify-between flex-shrink-0
          ${fullScreen ? 'p-4 md:p-6' : 'p-4 md:p-6 lg:p-8'}
        `}>
          <div className="flex items-center space-x-2 md:space-x-3">
            {headerIcon && (
              <div className="text-blue-600 text-lg md:text-xl">
                {headerIcon}
              </div>
            )}
            <h2
              id="dialog-title"
              className={`
                text-neutral-900 leading-tight tracking-tight
                ${fullScreen ? 'text-lg md:text-xl font-medium' : 'text-lg md:text-xl lg:text-2xl font-semibold'}
              `}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="
              p-1.5 md:p-2 text-neutral-400 hover:text-neutral-600
              transition-colors duration-200 rounded-full
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              flex-shrink-0
            "
            aria-label="Close dialog"
          >
            <i className="ph ph-x text-base md:text-lg"></i>
          </button>
        </div>
        
        {/* Content - mobile optimized padding with hidden scrollbar */}
        <div className={`
          flex-1 overflow-hidden
          ${fullScreen ? 'flex flex-col' : 'overflow-y-auto px-4 pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8'}
          scrollbar-hide
        `}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
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

// Visual Report Preview - Stacked card mockup with minimalist design
const VisualReportPreview = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center">
      {/* Background decoration - subtle */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 rounded-xl"></div>

      {/* Stacked Cards Container */}
      <div className="relative w-full max-w-[280px] md:max-w-sm h-full flex items-center justify-center">

        {/* Card 3 - Back (Timeline) */}
        <div className="
          absolute
          w-[90%] md:w-[85%]
          bg-white
          rounded-lg md:rounded-xl
          shadow-lg
          p-4 md:p-5
          transform rotate-[-8deg] translate-y-[10px] md:translate-y-[15px]
          border border-neutral-200
        ">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
              <i className="ph ph-warning text-sm text-neutral-900"></i>
            </div>
            <span className="text-xs md:text-sm font-semibold text-neutral-900">Timeline</span>
          </div>
          <div className="space-y-2 opacity-60">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-neutral-600">2008-07 🇩🇪 Germany</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-neutral-600">2009-03 🇬🇧 United Kingdom</span>
            </div>
          </div>
        </div>

        {/* Card 2 - Middle (Damage Report) */}
        <div className="
          absolute
          w-[92%] md:w-[90%]
          bg-white
          rounded-lg md:rounded-xl
          shadow-xl
          p-4 md:p-5
          transform rotate-[4deg] translate-y-[5px] md:translate-y-[8px]
          border border-neutral-200
        ">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
              <i className="ph ph-warning text-sm text-neutral-900"></i>
            </div>
            <span className="text-xs md:text-sm font-semibold text-neutral-900">Damage Report</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center opacity-70">
              <i className="ph ph-car text-xl text-neutral-400"></i>
            </div>
            <div className="text-xs text-neutral-500 opacity-60">
              <div>2009</div>
              <div className="text-neutral-400">Unknown</div>
            </div>
          </div>
        </div>

        {/* Card 1 - Front (Mileage Warning) */}
        <div className="
          absolute
          w-full
          bg-white
          rounded-lg md:rounded-xl
          shadow-2xl
          p-4 md:p-6
          transform rotate-[0deg]
          border-2 border-blue-200
          z-10
        ">
          {/* Warning Header */}
          <div className="flex items-start gap-2 mb-4">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <i className="ph ph-warning text-base md:text-lg text-neutral-900 font-bold"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-semibold text-neutral-900 leading-tight">
                This vehicle may have a fake mileage!
              </p>
            </div>
          </div>

          {/* Info Items */}
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2 text-xs">
              <i className="ph ph-info text-blue-500 flex-shrink-0 mt-0.5"></i>
              <span className="text-neutral-600">The last known mileage is <strong className="text-neutral-900">137,000 mi</strong></span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <i className="ph ph-info text-blue-500 flex-shrink-0 mt-0.5"></i>
              <span className="text-neutral-600">3 mileage records found</span>
            </div>
          </div>

          {/* Mini Mileage Graph */}
          <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 md:p-4">
            <div className="text-xs text-neutral-500 mb-2 flex items-center justify-between">
              <span>Last known mileage</span>
              <span className="font-semibold text-neutral-900">150k</span>
            </div>

            {/* Simple line graph representation */}
            <div className="relative h-16 md:h-20">
              <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                {/* Grid line */}
                <line x1="0" y1="30" x2="200" y2="30" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2 2" />

                {/* Mileage line with rollback */}
                <polyline
                  points="0,50 40,40 80,30 120,18 140,15 160,35 180,25 200,22"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Rollback warning badge */}
                <circle cx="160" cy="35" r="6" fill="#fbbf24" stroke="white" strokeWidth="2"/>
              </svg>

              {/* Rollback label */}
              <div className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2">
                <div className="bg-yellow-400 text-neutral-900 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap">
                  <i className="ph ph-warning-circle text-xs"></i>
                  <span className="hidden md:inline">Rollback</span>
                </div>
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-neutral-400 mt-2">
              <span>2006-01</span>
              <span>2010-01</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium Payment Dialog - Visual-first, minimalist design
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
      maxWidth="md"
    >
      {/* Two-column layout on desktop, single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">

        {/* LEFT COLUMN: Visual Preview & Marketing */}
        <div className="space-y-4 md:space-y-6">
          {/* Visual Report Preview - Main focus */}
          <div>
            <VisualReportPreview />
          </div>

          {/* Text callout */}
          <div className="text-center lg:text-left space-y-2">
            <h3 className="text-base md:text-lg font-semibold text-neutral-900">
              Premium Report for <span className="text-blue-600 font-mono">{registration}</span>
            </h3>
            <p className="text-xs md:text-sm text-neutral-600">
              Uncover mileage fraud, damage history, and critical data from 900+ sources
            </p>
          </div>

          {/* Key benefits - desktop only */}
          <div className="hidden lg:block space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <i className="ph ph-check-circle text-green-600"></i>
              <span>Instant digital delivery</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <i className="ph ph-check-circle text-green-600"></i>
              <span>900+ verified data sources</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <i className="ph ph-check-circle text-green-600"></i>
              <span>Lifetime report access</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pricing & Payment */}
        <div className="space-y-4 md:space-y-6 lg:border-l lg:border-neutral-200 lg:pl-8">
          {/* Pricing */}
          <div className="
            bg-gradient-to-br from-neutral-50 to-blue-50
            rounded-lg md:rounded-xl
            p-4 md:p-6
            border border-neutral-200
            text-center
          ">
            <div className="space-y-3">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-600">£4.95</div>
                <div className="text-xs text-neutral-600 mt-1">One-time payment</div>
              </div>
              <div className="pt-3 border-t border-neutral-200 flex items-center justify-center gap-3 md:gap-4 text-xs text-neutral-600 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Instant access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>No subscription</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
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

// Free Report Dialog - Visual design matching PaymentDialog
export const FreeReportDialog = ({ open, onClose, registration, reportType = 'classic' }) => {
  const navigate = useNavigate();

  const handleViewFreeReport = () => {
    onClose();
    const paymentId = reportType === 'modern' ? 'free-modern-vehicle' : 'free-classic-vehicle';
    navigate(`/premium-report/${registration}?paymentId=${paymentId}`);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Complimentary Vehicle Report"
      headerIcon={<i className="ph ph-gift text-green-600"></i>}
      maxWidth="md"
    >
      {/* Two-column layout on desktop, single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">

        {/* LEFT COLUMN: Visual Preview & Marketing */}
        <div className="space-y-4 md:space-y-6">
          {/* Visual Report Preview - Main focus */}
          <div>
            <VisualReportPreview />
          </div>

          {/* Text callout */}
          <div className="text-center lg:text-left space-y-2">
            <h3 className="text-base md:text-lg font-semibold text-neutral-900">
              Free Report for <span className="text-green-600 font-mono">{registration}</span>
            </h3>
            <p className="text-xs md:text-sm text-neutral-600">
              This report is complimentary - same comprehensive data at no cost
            </p>
          </div>

          {/* Key benefits - desktop only */}
          <div className="hidden lg:block space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <i className="ph ph-check-circle text-green-600"></i>
              <span>No payment required</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <i className="ph ph-check-circle text-green-600"></i>
              <span>Full report access</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <i className="ph ph-check-circle text-green-600"></i>
              <span>Same professional data</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Free Badge & Actions */}
        <div className="space-y-4 md:space-y-6 lg:border-l lg:border-neutral-200 lg:pl-8">
          {/* Free Badge */}
          <div className="
            bg-gradient-to-br from-green-50 to-emerald-50
            rounded-lg md:rounded-xl
            p-4 md:p-6
            border border-green-200
            text-center
          ">
            <div className="space-y-3">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-600">FREE</div>
                <div className="text-xs text-neutral-600 mt-1">No payment required</div>
              </div>
              <div className="pt-3 border-t border-neutral-200 flex items-center justify-center gap-3 md:gap-4 text-xs text-neutral-600 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Instant access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Full report</span>
                </div>
              </div>
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