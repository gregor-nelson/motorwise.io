import React, { useState, useEffect, useCallback, useRef } from 'react';
import { styled } from '@mui/material';
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
} from '../../styles/theme';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Cache for storing vehicle data
const vehicleCache = {};

const VehicleHeader = ({ registration }) => {
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const API_BASE_URL = 'http://localhost:8000/api/v1';
  // Configure the stale time in milliseconds (5 minutes)
  const CACHE_STALE_TIME = 5 * 60 * 1000;

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

    // Create safe accessors that won't throw if properties are missing
    const safeGet = (obj, path, defaultValue) => {
      try {
        const result = path.split('.').reduce((o, k) => (o || {})[k], obj);
        return (result !== undefined && result !== null) ? result : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    };

    // Determine the MOT due date using the safest logic
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

    // Process the hasOutstandingRecall field safely
    let recallStatus = 'Not available';
    const recall = safeGet(apiData, 'hasOutstandingRecall', null);
    if (recall !== null) {
      // Handle different possible formats
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

  // Function to check if cached data is still valid (not older than 5 minutes)
  const isCacheValid = (cachedTime) => {
    const fiveMinutesInMs = 5 * 60 * 1000;
    return (Date.now() - cachedTime) < fiveMinutesInMs;
  };

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!registration) return;

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      // Check cache first
      const cacheKey = `vehicle_${registration}`;
      const cachedData = vehicleCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        // For cached data, don't show loading indicator
        setVehicleData(cachedData.data);
        setLoading(false);
        return;
      }
      
      // Only show loading spinner if we need to fetch from the API
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/vehicle/registration/${registration}`,
          { 
            signal: abortControllerRef.current.signal,
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.errorMessage || data.detail?.errorMessage || 'Failed to fetch vehicle data');
        }
        
        const transformedData = transformVehicleData(data);
        
        // Store in cache with timestamp
        vehicleCache[cacheKey] = {
          data: transformedData,
          timestamp: Date.now()
        };
        
        // Also store in localStorage for persistence between sessions
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: transformedData,
            timestamp: Date.now()
          }));
        } catch (storageErr) {
          // Silently fail - localStorage might be disabled or full
          console.warn('Failed to store in localStorage:', storageErr);
        }
        
        setVehicleData(transformedData);
      } catch (err) {
        // Don't set error for aborted requests
        if (err.name !== 'AbortError') {
          setError(err.message || 'An error occurred while fetching vehicle data');
        }
      } finally {
        setLoading(false);
      }
    };

    // Try to restore from localStorage on initial render
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
            // Explicitly ensure loading is false for cached data
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

    // Cleanup function to abort any in-flight requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [registration, transformVehicleData]);

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
              {vehicleData.registration}
            </VehicleRegistration>

            <VehicleHeading data-test-id="vehicle-make-model">
              {vehicleData.makeModel}
            </VehicleHeading>

            <GovUKBody>
              <GovUKLink href="/" noVisitedState>
                Check another vehicle
              </GovUKLink>
            </GovUKBody>

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

            {/* New Fields Display */}
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

            <MOTCaption data-test-id="mot-expiry-text">MOT valid until</MOTCaption>
            <MOTDueDate data-test-id="mot-due-date">
              {vehicleData.motDueDate}
            </MOTDueDate>

            <GovUKBody>
              <GovUKLink href="https://www.gov.uk/mot-reminder" noVisitedState>
                Get an MOT reminder
              </GovUKLink>{' '}
              by email or text.
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
              </GovUKLink>.
            </GovUKBody>
          </>
        )}
      </GovUKMainWrapper>
    </GovUKContainer>
  );
};

export default VehicleHeader;