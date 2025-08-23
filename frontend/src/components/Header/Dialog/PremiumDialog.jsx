import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Custom hook for intersection observer animations
const useScrollAnimation = (threshold = 0.3) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

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

  // Update mobile state on resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          
          <div className={`
            w-full px-3 py-2 text-sm rounded-lg bg-neutral-50 border-none
            focus-within:ring-2 focus-within:ring-blue-500 shadow-sm
            ${(error || cardError) ? 'ring-2 ring-red-500' : ''}
            min-h-[44px] flex items-center
          `}>
            <CardElement
              id="card-element"
              onChange={handleCardChange}
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: '400',
                    letterSpacing: '0.025em',
                    '::placeholder': {
                      color: '#9ca3af',
                      fontWeight: '400',
                    },
                    iconColor: '#6b7280',
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
          </div>
        </div>
        
        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 py-3 text-neutral-600 text-xs">
          <i className="ph ph-shield-check text-green-600"></i>
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>
        
        {/* Payment Method Icons */}
        <div className="flex items-center justify-center space-x-4 py-2">
          <span className="text-xs text-neutral-600">We accept:</span>
          <div className="flex space-x-2">
            <div className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">VISA</div>
            <div className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">MC</div>
            <div className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">AMEX</div>
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

// Enhanced Premium Report Features with card-based design and animations
const PremiumReportFeatures = ({ showAll = false, onToggle }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [animationRef, isVisible] = useScrollAnimation(0.2);
  
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
      title: 'DVLA Identity Verification',
      description: isMobile ? 'Official government records' : 'Official government records - police & agency access'
    },
    {
      title: 'Mileage Fraud Protection',
      description: isMobile ? 'Forensic odometer detection' : 'Forensic-level odometer tampering detection'
    },
    {
      title: 'Professional Repair Database',
      description: isMobile ? 'BMW, Mercedes dealer data' : 'Technical data trusted by BMW, Mercedes dealerships'
    }
  ];

  const additionalFeatures = [
    {
      title: 'Advanced Usage History',
      description: isMobile ? '3D visualization & hidden patterns' : '3D visualization exposing hidden patterns traditional reports miss'
    },
    {
      title: 'Market Intelligence & Risk Assessment',
      description: isMobile ? '40+ million UK vehicle records' : 'Compare against 40+ million UK vehicle records for confident decisions'
    },
    {
      title: 'Complete Documentation Package',
      description: isMobile ? 'Bank & insurance standards' : 'Professional-grade reports meeting bank and insurance standards'
    }
  ];

  const featuresToShow = showAll ? [...coreFeatures, ...additionalFeatures] : coreFeatures;

  return (
    <div ref={animationRef} className="space-y-4">
      {featuresToShow.map((feature, index) => (
        <div 
          key={index} 
          className={`
            bg-white rounded-lg p-4 shadow-sm hover:shadow-lg
            transition-colors duration-200 cursor-pointer
            transform
            ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }
          `}
          style={{ 
            transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <i className="ph ph-check-circle text-lg text-green-600 mt-0.5 flex-shrink-0"></i>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-neutral-900 mb-1">
                {feature.title}
              </div>
              <div className="text-xs text-neutral-600 leading-relaxed">
                {feature.description}
              </div>
            </div>
          </div>
        </div>
      ))}
      
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

// Enhanced MarketDash Payment Dialog Component with Two-Column Layout and Animations
export const PaymentDialog = ({ open, onClose, registration }) => {
  const navigate = useNavigate();
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [leftColumnRef, leftColumnVisible] = useScrollAnimation(0.2);
  const [rightColumnRef, rightColumnVisible] = useScrollAnimation(0.2);

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
        <div 
          ref={leftColumnRef}
          className={`
            space-y-8 transform transition-colors duration-200 ease-out
            ${leftColumnVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          `}
        >
          {/* Trust Hero Section */}
          <div className={`
            bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg
            transition-colors duration-200 cursor-pointer transform
            ${leftColumnVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `} style={{ transitionDelay: '200ms' }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <i className="ph ph-shield-check text-2xl text-blue-600 mt-1 flex-shrink-0"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-neutral-900 mb-2 leading-tight">
                  {isMobile ? 'Protecting from £2.3B Fraud' : 'Protecting from £2.3B UK Vehicle Fraud'}
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {isMobile ? 'BMW, Mercedes & government agency database' : 'Same comprehensive database used by BMW, Mercedes dealerships and government agencies'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Professional Positioning */}
          <div className={`
            text-center py-6 transform transition-colors duration-200 ease-out
            ${leftColumnVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `} style={{ transitionDelay: '300ms' }}>
            <div className="text-sm text-neutral-600 mb-2">
              {isMobile ? 'Professional Intelligence for' : 'Professional-Grade Intelligence for'}
            </div>
            <div className="text-2xl font-bold text-blue-600 tracking-wider font-mono">
              {registration}
            </div>
          </div>
          
          {/* Features */}
          <div className={`
            transform transition-colors duration-200 ease-out
            ${leftColumnVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `} style={{ transitionDelay: '400ms' }}>
            <PremiumReportFeatures 
              showAll={showAllFeatures}
              onToggle={toggleFeatures}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Action & Payment */}
        <div 
          ref={rightColumnRef}
          className={`
            space-y-6 lg:border-l lg:border-neutral-200 lg:pl-8
            transform transition-colors duration-200 ease-out
            ${rightColumnVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
          `}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Pricing Section */}
          <div className={`
            bg-neutral-50 rounded-lg p-6 text-center shadow-sm hover:shadow-lg
            hover:scale-[1.02] transition-colors duration-200 cursor-pointer
            transform ${rightColumnVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `} style={{ transitionDelay: '400ms' }}>
            <div className="text-sm text-neutral-600 mb-2">One-time payment</div>
            <div className={`
              text-3xl font-bold text-neutral-900 mb-2 transition-all duration-500
              ${rightColumnVisible ? 'scale-100' : 'scale-0'}
            `} style={{ transitionDelay: '600ms' }}>£4.95</div>
            <div className="text-sm text-neutral-600">Instant access • No subscription</div>
          </div>
          
          {/* Payment Form */}
          <div className={`
            space-y-4 transform transition-all duration-500 ease-out
            ${rightColumnVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `} style={{ transitionDelay: '500ms' }}>
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
          <div className="bg-green-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <i className="ph ph-gift text-2xl text-green-600 mt-1"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-neutral-900 mb-2 leading-tight">
                  {isMobile ? 'Complimentary Access' : 'Complimentary Professional Access'}
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                  The comprehensive report for <strong className="text-neutral-900 font-medium">{registration}</strong> is available at no cost.
                </p>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {explanationText}
                </p>
              </div>
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
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <i className={`ph ${reason.icon} text-blue-600 text-lg mt-0.5 flex-shrink-0`}></i>
                      <div>
                        <div className="text-xs font-medium text-neutral-900 mb-1">{reason.title}</div>
                        <div className="text-xs text-neutral-600 leading-relaxed">{reason.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Trust Signal */}
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <i className="ph ph-shield-check text-blue-600 text-lg"></i>
              <div className="text-xs text-neutral-700">
                <strong>Professional Standards:</strong> Same database access and verification processes used for premium commercial reports
              </div>
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
          <div className="bg-neutral-50 rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">FREE</div>
            <div className="text-sm text-neutral-600">No payment • No registration • Instant access</div>
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
        <div className="bg-green-50 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <i className="ph ph-check-circle text-2xl text-green-600"></i>
            <h3 className="text-lg font-medium text-neutral-900">Transaction Complete</h3>
          </div>
          
          <p className="text-sm text-neutral-700 mb-4 leading-relaxed">
            Your premium report for <strong className="text-neutral-900 font-medium">{registration}</strong> has been successfully purchased.
          </p>
        </div>
        
        {/* Payment Details */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="space-y-2">
            <p className="text-xs text-neutral-700 font-mono">
              <strong>Payment Reference:</strong> {paymentId}
            </p>
            {email && (
              <p className="text-xs text-neutral-700 font-mono">
                <strong>Receipt sent to:</strong> {email}
              </p>
            )}
          </div>
        </div>
        
        {/* Important Notice */}
        {email && (
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-start space-x-3">
              <i className="ph ph-info text-blue-600 text-lg mt-0.5 flex-shrink-0"></i>
              <p className="text-xs text-neutral-700 leading-relaxed">
                <strong>Important:</strong> Your receipt email contains a unique link to access your premium vehicle report.
                Please save this email for future reference.
              </p>
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
        hover:bg-blue-700 hover:scale-[1.02] transition-colors duration-200
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
              hover:bg-blue-700 hover:scale-[1.02] transition-colors duration-200
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
          hover:bg-blue-700 hover:scale-[1.02] transition-colors duration-200
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