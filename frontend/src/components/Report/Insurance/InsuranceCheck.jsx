import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import {
  GovUKHeadingL,
  GovUKBody,
  GovUKGridRow,
  GovUKGridColumnOneThird,
  DetailCaption,
  DetailHeading,
  GovUKLoadingContainer,
  GovUKLoadingSpinner,
  GovUKSectionBreak,
  PremiumInfoPanel,
  COLORS,
  GovUKLink,
  MotHistoryItem
} from '../../../styles/theme';

// Determine if we're in development or production
const isDevelopment = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8004/api/v1'   // Development - using port 8004 to avoid conflicts
  : '/api/v1';                       // Production - use relative URL for Nginx proxy 

// Cache for storing insurance data
const insuranceCache = {};

// Configure the stale time in milliseconds (5 minutes)
const CACHE_STALE_TIME = 5 * 60 * 1000;

const InsuranceCheck = ({ registration: propRegistration }) => {
  // Get registration from props or from URL params
  const { registration: urlRegistration } = useParams();
  const registration = propRegistration || urlRegistration;
  
  const [insuranceData, setInsuranceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Format the registration for display
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
    if (!dateString || dateString === 'Unknown') return 'Not available';
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

  const isCacheValid = (cachedTime) => {
    const timeDifference = Date.now() - cachedTime;
    return timeDifference < CACHE_STALE_TIME;
  };

  useEffect(() => {
    const fetchInsuranceData = async () => {
      if (!registration) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const cacheKey = `insurance_${registration}`;
      const cachedData = insuranceCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        setInsuranceData(cachedData.data);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching insurance data from: ${API_BASE_URL}/vehicle/insurance/${registration}`);
        
        const response = await fetch(
          `${API_BASE_URL}/vehicle/insurance/${registration}`,
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
          if (data.errorMessage) {
            throw new Error(data.errorMessage);
          }
          throw new Error(`Failed to fetch insurance data (Status: ${response.status})`);
        }
        
        // Store in cache
        insuranceCache[cacheKey] = {
          data: data,
          timestamp: Date.now()
        };
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: data,
            timestamp: Date.now()
          }));
        } catch (storageErr) {
          console.warn('Failed to store in localStorage:', storageErr);
        }
        
        setInsuranceData(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          const message = err.message || 'An error occurred while fetching insurance data';
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
        const cacheKey = `insurance_${registration}`;
        const storedData = localStorage.getItem(cacheKey);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (isCacheValid(parsedData.timestamp)) {
            insuranceCache[cacheKey] = parsedData;
            setInsuranceData(parsedData.data);
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
      fetchInsuranceData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [registration]);

  if (loading) {
    return (
      <GovUKLoadingContainer>
        <GovUKLoadingSpinner />
        <GovUKBody>Checking insurance status...</GovUKBody>
      </GovUKLoadingContainer>
    );
  }

  if (error) {
    return (
      <Alert severity="error" style={{ marginBottom: '20px' }}>
        {error}
      </Alert>
    );
  }

  if (!insuranceData && !loading) {
    if (!registration) {
      return (
        <Alert severity="warning" style={{ marginBottom: '20px' }}>
          No vehicle registration provided.
        </Alert>
      );
    }
    return null;
  }

  return (
    <>
      <GovUKHeadingL>Insurance Status Check</GovUKHeadingL>
      
      {insuranceData.insuranceStatus === 'INSURED' ? (
        <MotHistoryItem result="PASS" data-test-id="insurance-panel">
          <GovUKGridRow data-test-id="insurance-status-details">
            <GovUKGridColumnOneThird>
              <DetailCaption>Status</DetailCaption>
              <DetailHeading 
                style={{ color: COLORS.GREEN }}
                data-test-id="insurance-status"
              >
                Insured
              </DetailHeading>
            </GovUKGridColumnOneThird>
            
            <GovUKGridColumnOneThird>
              <DetailCaption>Insurer</DetailCaption>
              <DetailHeading data-test-id="insurance-provider">
                {insuranceData.insurer || 'Not available'}
              </DetailHeading>
            </GovUKGridColumnOneThird>
            
            <GovUKGridColumnOneThird>
              <DetailCaption>Expiry Date</DetailCaption>
              <DetailHeading data-test-id="insurance-expiry">
                {formatDate(insuranceData.policyExpiryDate)}
              </DetailHeading>
            </GovUKGridColumnOneThird>
          </GovUKGridRow>
          
          {insuranceData.policyNumber && (
            <GovUKGridRow>
              <GovUKGridColumnOneThird>
                <DetailCaption>Policy Number</DetailCaption>
                <DetailHeading data-test-id="insurance-policy-number">
                  {insuranceData.policyNumber}
                </DetailHeading>
              </GovUKGridColumnOneThird>
            </GovUKGridRow>
          )}
          
          <GovUKBody>
            Insurance information last checked on {formatDate(insuranceData.timestamp)}
          </GovUKBody>
        </MotHistoryItem>
      ) : (
        <MotHistoryItem result="FAIL" data-test-id="insurance-panel">
          <GovUKGridRow data-test-id="insurance-status-details">
            <GovUKGridColumnOneThird>
              <DetailCaption>Status</DetailCaption>
              <DetailHeading 
                style={{ color: COLORS.RED }}
                data-test-id="insurance-status"
              >
                Not Insured
              </DetailHeading>
            </GovUKGridColumnOneThird>
            
            <GovUKGridColumnOneThird>
              <DetailCaption>Reason</DetailCaption>
              <DetailHeading data-test-id="insurance-missing-reason">
                {insuranceData.reason || 'No insurance record found'}
              </DetailHeading>
            </GovUKGridColumnOneThird>
          </GovUKGridRow>
          
          <GovUKBody>
            Insurance information last checked on {formatDate(insuranceData.timestamp)}
          </GovUKBody>
          
          <Alert severity="warning" style={{ marginTop: '10px' }}>
            If you believe this vehicle should be insured, please contact your insurance provider 
            to confirm your policy details.
          </Alert>
        </MotHistoryItem>
      )}
      
      <PremiumInfoPanel>
        <GovUKBody>
          Insurance information is provided by the Motor Insurers' Bureau (MIB). All UK motor insurance 
          companies are required by law to be members of the MIB and provide details of their 
          policies.
        </GovUKBody>
        <GovUKBody style={{ marginBottom: 0 }}>
          <GovUKLink href="https://www.mib.org.uk/" target="_blank" rel="noopener noreferrer" noVisitedState>
            Learn more about the Motor Insurers' Bureau
          </GovUKLink>
        </GovUKBody>
      </PremiumInfoPanel>
      
      <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
    </>
  );
};

export default InsuranceCheck;