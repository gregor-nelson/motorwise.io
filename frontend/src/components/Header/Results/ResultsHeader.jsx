import React, { useState, useEffect, useCallback, useRef } from 'react';

// Import the refactored dialog components, including the new FullScreenSampleReportButton
import { 
  PaymentDialog, 
  FreeReportDialog,
  SuccessDialog,
  FullScreenSampleReportButton
} from '../Dialog/PremiumDialog';

// Determine if we're in development or production
const isDevelopment = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000/api/v1'   // Development - direct to API port
  : '/api/v1';                       // Production - use relative URL for Nginx proxy 

// Cache for storing vehicle data
const vehicleCache = {};

// Configure the stale time in milliseconds (5 minutes)
const CACHE_STALE_TIME = 5 * 60 * 1000;

// Constants for free report eligibility
const CLASSIC_VEHICLE_YEAR_THRESHOLD = 1996; // Vehicles older than this get free reports
const MODERN_VEHICLE_YEAR_THRESHOLD = 2018;  // Vehicles newer than or equal to this get free reports

// Helper function for StatusIndicator styling
const getStatusClassName = (status) => {
  const baseClasses = "text-sm font-medium";
  switch (status?.toLowerCase()) {
    case 'valid':
    case 'taxed':
    case 'no action required':
    case 'no':
      return `${baseClasses} text-green-600`;
    case 'expired':
    case 'sorn':
    case 'untaxed':
    case 'yes':
      return `${baseClasses} text-red-600`;
    case 'due soon':
    case 'advisory':
      return `${baseClasses} text-yellow-600`;
    default:
      return `${baseClasses} text-neutral-700`;
  }
};

const VehicleHeader = ({ registration }) => {
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  
  // Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [freeReportDialogOpen, setFreeReportDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [reportType, setReportType] = useState('classic'); // Default to classic

  // Enhanced formatRegistration function to handle multiple UK plate formats
  const formatRegistration = (reg) => {
    if (!reg || typeof reg !== 'string') return 'Not available';

    // Normalize by removing existing spaces and converting to uppercase
    const normalized = reg.replace(/\s/g, '').toUpperCase();

    // Modern format: 2 letters, 2 numbers, 3 letters (e.g., "SV57GVL" -> "SV57 GVL")
    if (/^[A-Z]{2}\d{2}[A-Z]{3}$/.test(normalized)) {
      return `${normalized.slice(0, 4)} ${normalized.slice(4)}`;
    }

    // Prefix format: 1 letter, 1-3 numbers, 3 letters (e.g., "A123ABC" -> "A123 ABC")
    if (/^[A-Z]\d{1,3}[A-Z]{3}$/.test(normalized)) {
      const letterPart = normalized.match(/^[A-Z]/)[0];
      const numberPart = normalized.match(/\d{1,3}/)[0];
      const finalLetters = normalized.slice(letterPart.length + numberPart.length);
      return `${letterPart}${numberPart} ${finalLetters}`;
    }

    // Suffix format: 3 letters, 1-3 numbers, 1 letter (e.g., "ABC123A" -> "ABC 123A")
    if (/^[A-Z]{3}\d{1,3}[A-Z]$/.test(normalized)) {
      const initialLetters = normalized.slice(0, 3);
      const numberPart = normalized.match(/\d{1,3}/)[0];
      const finalLetter = normalized.slice(3 + numberPart.length);
      return `${initialLetters} ${numberPart}${finalLetter}`;
    }

    // Return unchanged if no known format matches
    return normalized;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Function to check if a vehicle qualifies for a free premium report
  const isEligibleForFreeReport = (vehicleData) => {
    if (!vehicleData) return false;

    // Try to determine the vehicle's year
    let vehicleYear = null;
    try {
      // Try manufacture date first
      if (vehicleData.manufactureDate) {
        vehicleYear = new Date(vehicleData.manufactureDate).getFullYear();
      }
      // If not available, try registration date
      else if (vehicleData.registrationDate) {
        vehicleYear = new Date(vehicleData.registrationDate).getFullYear();
      }
      // If not available, try firstUsedDate
      else if (vehicleData.firstUsedDate) {
        vehicleYear = new Date(vehicleData.firstUsedDate).getFullYear();
      }
      
      // If we can't determine the year, default to paid report
      if (vehicleYear === null) return false;
      
      // Check if it's an older vehicle (classic) or a newer vehicle (limited history)
      return vehicleYear < CLASSIC_VEHICLE_YEAR_THRESHOLD || vehicleYear >= MODERN_VEHICLE_YEAR_THRESHOLD;
    } catch (e) {
      console.warn('Error determining vehicle age:', e);
      return false;
    }
  };
  
  // Function to determine type of free report (classic or modern)
  const getFreeReportType = (vehicleData) => {
    if (!vehicleData) return null;
    
    try {
      let vehicleYear = null;
      
      // Determine vehicle year using the same logic as above
      if (vehicleData.manufactureDate) {
        vehicleYear = new Date(vehicleData.manufactureDate).getFullYear();
      } else if (vehicleData.registrationDate) {
        vehicleYear = new Date(vehicleData.registrationDate).getFullYear();
      } else if (vehicleData.firstUsedDate) {
        vehicleYear = new Date(vehicleData.firstUsedDate).getFullYear();
      }
      
      if (vehicleYear === null) return null;
      
      // Return the type of free report
      if (vehicleYear < CLASSIC_VEHICLE_YEAR_THRESHOLD) {
        return 'classic';
      } else if (vehicleYear >= MODERN_VEHICLE_YEAR_THRESHOLD) {
        return 'modern';
      }
      
      return null;
    } catch (e) {
      console.warn('Error determining vehicle report type:', e);
      return null;
    }
  };

  const transformVehicleData = useCallback((apiData) => {
    if (!apiData) return null;

    const safeGet = (obj, path, defaultValue) => {
      try {
        const result = path.split('.').reduce((o, k) => (o || {})[k], obj);
        return (result !== undefined && result !== null) ? result : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    };

    let motDueDate = 'Not available';
    try {
      if (safeGet(apiData, 'motTests', []).length > 0 && safeGet(apiData, 'motTests.0.expiryDate', null)) {
        motDueDate = formatDate(apiData.motTests[0].expiryDate);
      } else if (safeGet(apiData, 'motTestDueDate', null)) {
        motDueDate = formatDate(apiData.motTestDueDate);
      }
    } catch (e) {
      motDueDate = 'Not available';
    }

    let recallStatus = 'Not available';
    const recall = safeGet(apiData, 'hasOutstandingRecall', null);
    if (recall !== null) {
      if (typeof recall === 'boolean') {
        recallStatus = recall ? 'Yes' : 'No';
      } else if (typeof recall === 'string') {
        recallStatus = recall.toLowerCase() === 'true' ? 'Yes' : 
                       recall.toLowerCase() === 'false' ? 'No' : recall;
      } else {
        recallStatus = String(recall);
      }
    }

    return {
      registration: safeGet(apiData, 'registration', 'Not available'),
      makeModel: `${safeGet(apiData, 'make', '')} ${safeGet(apiData, 'model', '')}`.trim() || 'Not available',
      colour: safeGet(apiData, 'primaryColour', 'Not available'),
      fuelType: safeGet(apiData, 'fuelType', 'Not available'),
      dateRegistered: formatDate(safeGet(apiData, 'registrationDate', null) || safeGet(apiData, 'firstUsedDate', null)),
      motDueDate: motDueDate,
      engineSize: safeGet(apiData, 'engineSize', 'Not available'),
      manufactureDate: formatDate(safeGet(apiData, 'manufactureDate', null)),
      registrationDate: safeGet(apiData, 'registrationDate', null),
      firstUsedDate: safeGet(apiData, 'firstUsedDate', null),
      hasOutstandingRecall: recallStatus,
    };
  }, []);

  const isCacheValid = (cachedTime) => {
    const timeDifference = Date.now() - cachedTime;
    return timeDifference < CACHE_STALE_TIME;
  };

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!registration) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const cacheKey = `vehicle_${registration}`;
      const cachedData = vehicleCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        setVehicleData(cachedData.data);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching vehicle data from: ${API_BASE_URL}/vehicle/registration/${registration}`);
        
        const response = await fetch(
          `${API_BASE_URL}/vehicle/registration/${registration}`,
          { 
            signal: abortControllerRef.current.signal,
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin'
          }
        );
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          throw new Error('Received non-JSON response from server');
        }
        
        if (!response.ok) {
          if (data.errorMessage || (data.detail && data.detail.errorMessage)) {
            throw new Error(data.errorMessage || data.detail.errorMessage);
          }
          if (typeof data.detail === 'string') {
            throw new Error(data.detail);
          }
          throw new Error(`Failed to fetch vehicle data (Status: ${response.status})`);
        }
        
        const transformedData = transformVehicleData(data);
        
        vehicleCache[cacheKey] = {
          data: transformedData,
          timestamp: Date.now()
        };
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: transformedData,
            timestamp: Date.now()
          }));
        } catch (storageErr) {
          console.warn('Failed to store in localStorage:', storageErr);
        }
        
        setVehicleData(transformedData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          const message = err.message || 'An error occurred while fetching vehicle data';
          console.error('API error:', err);
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    const tryRestoreFromStorage = () => {
      if (!registration) return;
      
      try {
        const cacheKey = `vehicle_${registration}`;
        const storedData = localStorage.getItem(cacheKey);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (isCacheValid(parsedData.timestamp)) {
            vehicleCache[cacheKey] = parsedData;
            setVehicleData(parsedData.data);
            setLoading(false);
            return true;
          }
        }
      } catch (err) {
        console.warn('Failed to restore from localStorage:', err);
      }
      return false;
    };

    const restored = tryRestoreFromStorage();
    if (!restored) {
      fetchVehicleData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [registration, transformVehicleData]);

  // Enhanced premium button click handler that checks vehicle eligibility
  const handlePremiumButtonClick = () => {
    if (vehicleData && isEligibleForFreeReport(vehicleData)) {
      // Get the type of free report (classic or modern)
      const reportType = getFreeReportType(vehicleData);
      
      // Show the free report dialog with the appropriate type
      setFreeReportDialogOpen(true);
      
      // Store the report type in state to pass to the dialog
      setReportType(reportType);
    } else {
      // For vehicles between thresholds, show the payment dialog
      setPaymentDialogOpen(true);
    }
  };
  
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
  };
  
  const handleCloseFreeReportDialog = () => {
    setFreeReportDialogOpen(false);
  };
  
  const handlePaymentSuccess = (paymentIntent, email) => {
    setPaymentDialogOpen(false);
    setPaymentInfo({
      paymentId: paymentIntent.id,
      registration: registration,
      email: email,
      timestamp: Date.now()
    });
    setSuccessDialogOpen(true);
  };
  
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 bg-white text-neutral-900">
        {loading && (
          <div className="flex justify-center items-center min-h-[200px] flex-col gap-4">
            <div className="w-6 h-6 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-neutral-600 text-sm text-center">Loading vehicle information...</div>
          </div>
        )}
        
        {error && (
          <div className="text-center p-8">
            <div className="text-red-600 text-base leading-relaxed">{error}</div>
          </div>
        )}
        
        {vehicleData && !loading && (
          <>
            <div className="mb-12 md:mb-16">
              <div className="font-mono text-2xl font-bold text-neutral-900 uppercase mb-4 tracking-tight leading-tight" data-test-id="vehicle-registration">
                {formatRegistration(vehicleData.registration)}
              </div>

              <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3" data-test-id="vehicle-make-model">
                {vehicleData.makeModel}
              </h1>
            </div>

            <div className="flex gap-4 my-8 flex-wrap md:flex-row flex-col">
              <FullScreenSampleReportButton 
                onProceedToPayment={handlePremiumButtonClick}
              />
              
              <button
                onClick={handlePremiumButtonClick}
                data-test-id="premium-report-button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto"
              >
                {isEligibleForFreeReport(vehicleData) 
                  ? "View Enhanced Vehicle Report" 
                  : "Get Premium Vehicle Report - £4.95"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="relative bg-white rounded-2xl p-6 shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-neutral-200 hover:border-blue-300 group overflow-hidden" data-test-id="colour-fuel-date-details">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-cyan-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      {/* Icon glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-cyan-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                      {/* Icon container */}
                      <div className="relative w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm border-2 border-transparent hover:border-blue-300 group-hover:scale-110 transition-all duration-300">
                        <i className="ph ph-info text-3xl text-neutral-700 group-hover:text-blue-600 transition-colors duration-200"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-neutral-900 mb-1">Vehicle Details</div>
                      {/* Decorative gradient underline */}
                      <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-transparent opacity-60 rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <div className="text-xs font-medium text-neutral-600">Colour</div>
                      <div className="text-sm text-neutral-900 font-semibold" data-test-id="vehicle-colour">
                        {vehicleData.colour}
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <div className="text-xs font-medium text-neutral-600">Fuel type</div>
                      <div className="text-sm text-neutral-900 font-semibold" data-test-id="vehicle-fuel-type">
                        {vehicleData.fuelType}
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div className="text-xs font-medium text-neutral-600">Date registered</div>
                      <div className="text-sm text-neutral-900 font-semibold" data-test-id="vehicle-date-registered">
                        {vehicleData.dateRegistered}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative blur accent */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>

              <div className="relative bg-white rounded-2xl p-6 shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-neutral-200 hover:border-purple-300 group overflow-hidden" data-test-id="additional-details">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-200 to-pink-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      {/* Icon glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 to-pink-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                      {/* Icon container */}
                      <div className="relative w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm border-2 border-transparent hover:border-purple-300 group-hover:scale-110 transition-all duration-300">
                        <i className="ph ph-gear text-3xl text-neutral-700 group-hover:text-purple-600 transition-colors duration-200"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-neutral-900 mb-1">Technical Details</div>
                      {/* Decorative gradient underline */}
                      <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-transparent opacity-60 rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <div className="text-xs font-medium text-neutral-600">Engine size</div>
                      <div className="text-sm text-neutral-900 font-semibold" data-test-id="vehicle-engine-size">
                        {vehicleData.engineSize}
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <div className="text-xs font-medium text-neutral-600">Manufacture date</div>
                      <div className="text-sm text-neutral-900 font-semibold" data-test-id="vehicle-manufacture-date">
                        {vehicleData.manufactureDate}
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div className="text-xs font-medium text-neutral-600">Outstanding recall</div>
                      <div className="flex items-center" data-test-id="vehicle-recall-status">
                        <span className={getStatusClassName(vehicleData.hasOutstandingRecall)}>
                          <i className={`ph ${vehicleData.hasOutstandingRecall?.toLowerCase() === 'yes' ? 'ph-warning-circle' : 'ph-check-circle'} mr-1`}></i>
                          {vehicleData.hasOutstandingRecall}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative blur accent */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
            </div>

            <div className="my-12 md:my-16">
              <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 group overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-300"></div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {/* Icon glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-cyan-400 rounded-xl opacity-10 blur-sm group-hover:opacity-20 transition-opacity duration-300"></div>
                      {/* Icon container */}
                      <div className="relative w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm border-2 border-blue-200 hover:border-blue-400 group-hover:scale-110 transition-all duration-300">
                        <i className="ph ph-shield-check text-3xl text-blue-600 group-hover:text-blue-700 transition-colors duration-200"></i>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900 mb-1">MOT Status</div>
                      {/* Decorative gradient underline */}
                      <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-transparent opacity-60 rounded-full mb-1"></div>
                      <div className="text-xs text-neutral-600">Ministry of Transport test validity</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-lg font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-200" data-test-id="mot-due-date">
                      {vehicleData.motDueDate}
                    </div>
                    <div className="text-xs text-blue-600 font-medium" data-test-id="mot-expiry-text">
                      Valid until
                    </div>
                  </div>
                </div>

                {/* Decorative blur accent */}
                <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg opacity-15 blur-xl group-hover:opacity-25 transition-opacity duration-300"></div>
              </div>
            </div>

            <div className="mt-8 md:mt-10 pt-6 border-t border-neutral-200">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-neutral-900 mb-2">What would you like to do next?</h2>
                <p className="text-sm text-neutral-600">Choose from the options below to continue</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="/"
                  className="relative bg-white rounded-2xl p-6 shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-neutral-200 hover:border-blue-300 group overflow-hidden"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

                  <div className="relative space-y-4">
                    {/* Icon + Header */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {/* Icon glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                        {/* Icon container */}
                        <div className="relative w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm border-2 border-transparent hover:border-blue-300 group-hover:scale-110 transition-all duration-300">
                          <i className="ph ph-magnifying-glass text-3xl text-neutral-700 group-hover:text-blue-600 transition-colors duration-200"></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors duration-300 mb-1">Check another vehicle</div>
                        {/* Decorative gradient underline */}
                        <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-transparent opacity-60 rounded-full"></div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-600 leading-relaxed">Search for a different vehicle registration and view its complete history</p>
                  </div>

                  {/* Decorative blur accent */}
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
                </a>

                <a
                  href="https://www.gov.uk/mot-reminder"
                  className="relative bg-white rounded-2xl p-6 shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-neutral-200 hover:border-green-300 group overflow-hidden"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-200 to-green-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

                  <div className="relative space-y-4">
                    {/* Icon + Header */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {/* Icon glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-200 to-green-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                        {/* Icon container */}
                        <div className="relative w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center shadow-sm border-2 border-transparent hover:border-green-300 group-hover:scale-110 transition-all duration-300">
                          <i className="ph ph-bell text-3xl text-neutral-700 group-hover:text-green-600 transition-colors duration-200"></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-neutral-900 group-hover:text-green-600 transition-colors duration-300 mb-1">Get an MOT reminder</div>
                        {/* Decorative gradient underline */}
                        <div className="w-12 h-0.5 bg-gradient-to-r from-green-400 to-transparent opacity-60 rounded-full"></div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-600 leading-relaxed">Set up email or text reminders so you never miss your MOT date</p>
                  </div>

                  {/* Decorative blur accent */}
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
                </a>

                <a
                  href={`/enter-document-reference?registration=${vehicleData.registration}`}
                  data-test-id="download-certificates-link"
                  className="relative bg-white rounded-2xl p-6 shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-neutral-200 hover:border-purple-300 group overflow-hidden"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-200 to-purple-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

                  <div className="relative space-y-4">
                    {/* Icon + Header */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {/* Icon glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 to-purple-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                        {/* Icon container */}
                        <div className="relative w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm border-2 border-transparent hover:border-purple-300 group-hover:scale-110 transition-all duration-300">
                          <i className="ph ph-download text-3xl text-neutral-700 group-hover:text-purple-600 transition-colors duration-200"></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-neutral-900 group-hover:text-purple-600 transition-colors duration-300 mb-1">Download test certificates</div>
                        {/* Decorative gradient underline */}
                        <div className="w-12 h-0.5 bg-gradient-to-r from-purple-400 to-transparent opacity-60 rounded-full"></div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-600 leading-relaxed">Get official MOT certificates for your vehicle history records</p>
                  </div>

                  {/* Decorative blur accent */}
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
                </a>

                <a
                  href="https://www.gov.uk/getting-an-mot/correcting-mot-certificate-mistakes"
                  data-test-id="expiry-date-guidance"
                  className="relative bg-white rounded-2xl p-6 shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-neutral-200 hover:border-orange-300 group overflow-hidden"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-200 to-orange-300 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>

                  <div className="relative space-y-4">
                    {/* Icon + Header */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {/* Icon glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl opacity-5 blur-sm group-hover:opacity-10 transition-opacity duration-300"></div>
                        {/* Icon container */}
                        <div className="relative w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center shadow-sm border-2 border-transparent hover:border-orange-300 group-hover:scale-110 transition-all duration-300">
                          <i className="ph ph-envelope text-3xl text-neutral-700 group-hover:text-orange-600 transition-colors duration-200"></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors duration-300 mb-1">Contact DVSA</div>
                        {/* Decorative gradient underline */}
                        <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-transparent opacity-60 rounded-full"></div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-600 leading-relaxed">Report incorrect details or get help with MOT certificate issues</p>
                  </div>

                  {/* Decorative blur accent */}
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
            
            {/* Payment Dialog for non-classic vehicles */}
            <PaymentDialog 
              open={paymentDialogOpen}
              onClose={handleClosePaymentDialog}
              registration={vehicleData?.registration}
              onSuccess={handlePaymentSuccess}
            />
            
            {/* Free Report Dialog for classic/newer vehicles */}
            <FreeReportDialog
              open={freeReportDialogOpen}
              onClose={handleCloseFreeReportDialog}
              registration={vehicleData?.registration}
              reportType={reportType}
            />
            
            {/* Success Dialog shown after payment */}
            <SuccessDialog
              open={successDialogOpen}
              onClose={handleCloseSuccessDialog}
              registration={vehicleData?.registration}
              paymentId={paymentInfo?.paymentId}
              email={paymentInfo?.email}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleHeader;