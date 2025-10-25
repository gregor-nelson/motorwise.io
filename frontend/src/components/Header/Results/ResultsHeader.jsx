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

const VehicleHeader = ({ registration, onLoadingComplete, onError: onErrorCallback }) => {
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
        if (onLoadingComplete) {
          onLoadingComplete();
        }
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
          if (onErrorCallback) {
            onErrorCallback(message);
          }
        }
      } finally {
        setLoading(false);
        if (onLoadingComplete) {
          onLoadingComplete();
        }
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
            if (onLoadingComplete) {
              onLoadingComplete();
            }
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
            {/* Header Section */}
            <div className="mb-8">
              <div className="font-mono text-2xl font-bold text-gray-900 uppercase mb-2 tracking-tight" data-test-id="vehicle-registration">
                {formatRegistration(vehicleData.registration)}
              </div>
              <h1 className="text-xl font-semibold text-gray-900" data-test-id="vehicle-make-model">
                {vehicleData.makeModel}
              </h1>
            </div>

            {/* Status Alert Boxes */}
            {vehicleData.hasOutstandingRecall?.toLowerCase() === 'yes' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg mb-6 border border-red-200">
                <i className="ph ph-warning-circle text-red-600 text-xl flex-shrink-0 mt-0.5"></i>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Outstanding Recall</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This vehicle has an outstanding safety recall. Contact the manufacturer for details.
                  </p>
                </div>
              </div>
            )}

            {vehicleData.hasOutstandingRecall?.toLowerCase() === 'no' && (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg mb-6 border border-green-200">
                <i className="ph ph-check-circle text-green-600 text-xl flex-shrink-0 mt-0.5"></i>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">No Outstanding Recalls</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    No safety recalls currently registered for this vehicle.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-8 flex-wrap md:flex-row flex-col">
              <FullScreenSampleReportButton
                onProceedToPayment={handlePremiumButtonClick}
              />

              <button
                onClick={handlePremiumButtonClick}
                data-test-id="premium-report-button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto"
              >
                {isEligibleForFreeReport(vehicleData)
                  ? "View Enhanced Vehicle Report"
                  : "Get Premium Vehicle Report - £4.95"}
              </button>
            </div>

            {/* Vehicle Information Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Vehicle identification and specifications
              </h2>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-test-id="colour-fuel-date-details">
                  {/* Colour */}
                  <div className="flex items-start gap-3">
                    <i className="ph ph-palette text-gray-400 text-xl flex-shrink-0 mt-1"></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-0.5">Colour</p>
                      <p className="text-base font-medium text-gray-900" data-test-id="vehicle-colour">
                        {vehicleData.colour}
                      </p>
                    </div>
                  </div>

                  {/* Fuel Type */}
                  <div className="flex items-start gap-3">
                    <i className="ph ph-gas-pump text-gray-400 text-xl flex-shrink-0 mt-1"></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-0.5">Fuel type</p>
                      <p className="text-base font-medium text-gray-900" data-test-id="vehicle-fuel-type">
                        {vehicleData.fuelType}
                      </p>
                    </div>
                  </div>

                  {/* Date Registered */}
                  <div className="flex items-start gap-3">
                    <i className="ph ph-calendar text-gray-400 text-xl flex-shrink-0 mt-1"></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-0.5">Date registered</p>
                      <p className="text-base font-medium text-gray-900" data-test-id="vehicle-date-registered">
                        {vehicleData.dateRegistered}
                      </p>
                    </div>
                  </div>

                  {/* Engine Size */}
                  <div className="flex items-start gap-3" data-test-id="additional-details">
                    <i className="ph ph-engine text-gray-400 text-xl flex-shrink-0 mt-1"></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-0.5">Engine size</p>
                      <p className="text-base font-medium text-gray-900" data-test-id="vehicle-engine-size">
                        {vehicleData.engineSize}
                      </p>
                    </div>
                  </div>

                  {/* Manufacture Date */}
                  <div className="flex items-start gap-3">
                    <i className="ph ph-calendar-check text-gray-400 text-xl flex-shrink-0 mt-1"></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-0.5">Manufacture date</p>
                      <p className="text-base font-medium text-gray-900" data-test-id="vehicle-manufacture-date">
                        {vehicleData.manufactureDate}
                      </p>
                    </div>
                  </div>

                  {/* Outstanding Recall */}
                  <div className="flex items-start gap-3">
                    <i className="ph ph-shield-warning text-gray-400 text-xl flex-shrink-0 mt-1"></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-1.5">Outstanding recall</p>
                      <span
                        className={`inline-flex items-center gap-1 ${
                          vehicleData.hasOutstandingRecall?.toLowerCase() === 'yes'
                            ? 'px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-full font-medium'
                            : vehicleData.hasOutstandingRecall?.toLowerCase() === 'no'
                            ? 'px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-full font-medium'
                            : 'px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium'
                        }`}
                        data-test-id="vehicle-recall-status"
                      >
                        {vehicleData.hasOutstandingRecall}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MOT Status Section */}
            <div className="mb-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                MOT status
              </h2>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <i className="ph ph-shield-check text-gray-400 text-xl flex-shrink-0 mt-1"></i>
                    <div>
                      <p className="text-sm text-gray-600 mb-0.5">MOT expiry date</p>
                      <p className="text-base font-medium text-gray-900" data-test-id="mot-due-date">
                        {vehicleData.motDueDate}
                      </p>
                      <p className="text-xs text-gray-500 mt-1" data-test-id="mot-expiry-text">
                        Ministry of Transport test validity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Actions Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">What would you like to do next?</h2>
                <p className="text-sm text-gray-600">Choose from the options below to continue</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/"
                  className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <i className="ph ph-magnifying-glass text-blue-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Check another vehicle</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">Search for a different vehicle registration and view its complete history</p>
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.gov.uk/mot-reminder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <i className="ph ph-bell text-green-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Get an MOT reminder</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">Set up email or text reminders so you never miss your MOT date</p>
                    </div>
                  </div>
                </a>

                <a
                  href={`https://www.check-mot.service.gov.uk/enter-document-reference?registration=${vehicleData.registration}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-test-id="download-certificates-link"
                  className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <i className="ph ph-download text-purple-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Download test certificates</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">Get official MOT certificates for your vehicle history records</p>
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.gov.uk/getting-an-mot/correcting-mot-certificate-mistakes"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-test-id="expiry-date-guidance"
                  className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <i className="ph ph-envelope text-orange-600 text-xl flex-shrink-0 mt-0.5"></i>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Contact DVSA</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">Report incorrect details or get help with MOT certificate issues</p>
                    </div>
                  </div>
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