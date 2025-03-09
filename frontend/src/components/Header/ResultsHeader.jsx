import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GovUKContainer,
  GovUKMainWrapper,
  GovUKLink,
  GovUKBody,
  GovUKGridRow,
  GovUKGridColumnOneThird,
  VehicleRegistration,
  VehicleHeading,
  DetailCaption,
  DetailHeading,
  MOTCaption,
  MOTDueDate,
  GovUKLoadingContainer,
  GovUKLoadingSpinner,
  PremiumButton,
} from '../../styles/theme';
import Alert from '@mui/material/Alert';
import { 
  PaymentDialog, 
  SuccessDialog, 
} from './StripePayment';

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

const VehicleHeader = ({ registration }) => {
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  
  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

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

  const handleOpenPaymentDialog = () => {
    setPaymentDialogOpen(true);
  };
  
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
  };
  
  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentDialogOpen(false);
    setPaymentInfo({
      paymentId: paymentIntent.id,
      registration: registration,
      timestamp: Date.now()
    });
    setSuccessDialogOpen(true);
  };
  
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  return (
    <GovUKContainer>
      <GovUKMainWrapper>
        {loading && (
          <GovUKLoadingContainer>
            <GovUKLoadingSpinner />
          </GovUKLoadingContainer>
        )}
        
        {error && (
          <Alert severity="error" style={{ marginBottom: '20px' }}>
            {error}
          </Alert>
        )}
        
        {vehicleData && !loading && (
          <>
            <VehicleRegistration data-test-id="vehicle-registration">
              {formatRegistration(vehicleData.registration)}
            </VehicleRegistration>

            <VehicleHeading data-test-id="vehicle-make-model">
              {vehicleData.makeModel}
            </VehicleHeading>

            <GovUKBody>
              <GovUKLink href="/" noVisitedState>
                Check another vehicle
              </GovUKLink>
            </GovUKBody>
            
            <PremiumButton 
              onClick={handleOpenPaymentDialog}
              data-test-id="premium-report-button"
            >
              Get Premium Vehicle Report - £19.95
            </PremiumButton>
            
            <GovUKGridRow data-test-id="colour-fuel-date-details">
              <GovUKGridColumnOneThird>
                <DetailCaption>Colour</DetailCaption>
                <DetailHeading data-test-id="vehicle-colour">
                  {vehicleData.colour}
                </DetailHeading>
              </GovUKGridColumnOneThird>
              <GovUKGridColumnOneThird>
                <DetailCaption>Fuel type</DetailCaption>
                <DetailHeading data-test-id="vehicle-fuel-type">
                  {vehicleData.fuelType}
                </DetailHeading>
              </GovUKGridColumnOneThird>
              <GovUKGridColumnOneThird>
                <DetailCaption>Date registered</DetailCaption>
                <DetailHeading data-test-id="vehicle-date-registered">
                  {vehicleData.dateRegistered}
                </DetailHeading>
              </GovUKGridColumnOneThird>
            </GovUKGridRow>

            <GovUKGridRow data-test-id="additional-details">
              <GovUKGridColumnOneThird>
                <DetailCaption>Engine size</DetailCaption>
                <DetailHeading data-test-id="vehicle-engine-size">
                  {vehicleData.engineSize}
                </DetailHeading>
              </GovUKGridColumnOneThird>
              <GovUKGridColumnOneThird>
                <DetailCaption>Manufacture date</DetailCaption>
                <DetailHeading data-test-id="vehicle-manufacture-date">
                  {vehicleData.manufactureDate}
                </DetailHeading>
              </GovUKGridColumnOneThird>
              <GovUKGridColumnOneThird>
                <DetailCaption>Outstanding recall</DetailCaption>
                <DetailHeading data-test-id="vehicle-recall-status">
                  {vehicleData.hasOutstandingRecall}
                </DetailHeading>
              </GovUKGridColumnOneThird>
            </GovUKGridRow>

            <MOTCaption data-test-id="mot-expiry-text">
              MOT valid until
            </MOTCaption>
            
            <MOTDueDate data-test-id="mot-due-date">
              {vehicleData.motDueDate}
            </MOTDueDate>

            <GovUKBody>
              <GovUKLink href="https://www.gov.uk/mot-reminder" noVisitedState>
                Get an MOT reminder
              </GovUKLink>
              {' '}by email or text.
            </GovUKBody>

            <GovUKBody>
              <GovUKLink 
                href={`/enter-document-reference?registration=${vehicleData.registration}`} 
                noVisitedState 
                data-test-id="download-certificates-link"
              >
                Download test certificates
              </GovUKLink>
            </GovUKBody>

            <GovUKBody data-test-id="expiry-date-guidance">
              If you think the MOT expiry date or any of the vehicle details are wrong:{' '}
              <GovUKLink 
                href="https://www.gov.uk/getting-an-mot/correcting-mot-certificate-mistakes" 
                noVisitedState
              >
                contact DVSA
              </GovUKLink>
            </GovUKBody>
            
            <PaymentDialog 
              open={paymentDialogOpen}
              onClose={handleClosePaymentDialog}
              registration={vehicleData.registration}
              onSuccess={handlePaymentSuccess}
            />
            
            <SuccessDialog
              open={successDialogOpen}
              onClose={handleCloseSuccessDialog}
              registration={vehicleData.registration}
              paymentId={paymentInfo?.paymentId}
            />
          </>
        )}
      </GovUKMainWrapper>
    </GovUKContainer>
  );
};

export default VehicleHeader;