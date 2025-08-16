import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { styled } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// Clean styled components using Home page design system
const Container = styled('div')`
  font-family: var(--font-main);
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  width: 100%;
  
  @media (max-width: 767px) {
    padding: 0 var(--space-md);
  }
`;

const AnalysisPanel = styled('div')`
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-sm);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  
  @media (max-width: 767px) {
    padding: var(--space-lg);
  }
`;

const Title = styled('h2')`
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--gray-800);
  margin: 0 0 var(--space-md) 0;
  
  @media (max-width: 767px) {
    font-size: var(--text-xl);
  }
`;

const Body = styled('p')`
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--gray-600);
  margin: 0 0 var(--space-lg) 0;
`;

const LoadingContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4xl) var(--space-xl);
  text-align: center;
  background: var(--white);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
`;

const LoadingSpinner = styled('div')`
  width: 32px;
  height: 32px;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-md);
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4xl) var(--space-xl);
  text-align: center;
  background: var(--white);
  border: 1px solid var(--negative-light);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
`;

const Button = styled('button')`
  background: var(--primary);
  color: var(--white);
  border: none;
  padding: var(--space-md) var(--space-xl);
  font-family: var(--font-main);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  margin-top: var(--space-lg);
  
  &:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: 3px solid var(--primary-light);
    outline-offset: 2px;
  }
`;

const AnalysisContent = styled('div')`
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: var(--font-semibold);
    color: var(--gray-800);
    margin: var(--space-xl) 0 var(--space-md) 0;
    line-height: var(--leading-tight);
  }
  
  h1 { font-size: var(--text-3xl); }
  h2 { font-size: var(--text-2xl); }
  h3 { font-size: var(--text-xl); }
  h4 { font-size: var(--text-lg); }
  
  p {
    font-family: var(--font-main);
    font-size: var(--text-base);
    line-height: var(--leading-relaxed);
    color: var(--gray-600);
    margin: 0 0 var(--space-md) 0;
  }
  
  ul, ol {
    margin: var(--space-md) 0;
    padding-left: var(--space-xl);
  }
  
  li {
    font-family: var(--font-main);
    font-size: var(--text-base);
    line-height: var(--leading-relaxed);
    color: var(--gray-600);
    margin-bottom: var(--space-sm);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: var(--space-lg) 0;
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  
  th, td {
    padding: var(--space-md);
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
    font-family: var(--font-main);
    font-size: var(--text-sm);
  }
  
  th {
    background: var(--gray-50);
    font-weight: var(--font-semibold);
    color: var(--gray-800);
  }
  
  td {
    color: var(--gray-600);
  }
  
  code {
    background: var(--gray-100);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 0.9em;
  }
  
  pre {
    background: var(--gray-50);
    padding: var(--space-md);
    border-radius: var(--radius-sm);
    border: 1px solid var(--gray-200);
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    margin: var(--space-lg) 0;
  }
  
  blockquote {
    border-left: 4px solid var(--primary-light);
    background: var(--gray-50);
    padding: var(--space-md);
    margin: var(--space-lg) 0;
    font-style: italic;
    color: var(--gray-700);
  }
`;

const Note = styled('div')`
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  margin-top: var(--space-xl);
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  
  p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--gray-600);
  }
`;

// API setup code with consistent approach
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8007/api/v1'
                    : '/api/v1';

// Browser cache configuration for premium reports
const BROWSER_CACHE_TTL = null; // No expiration for premium reports - store permanently
const BROWSER_CACHE_PREFIX = 'premium_vehicle_analysis_';
const STORAGE_VERSION = 'v2'; // Use this to invalidate all caches if data structure changes

// Error message mapping to provide user-friendly messages
const ERROR_MESSAGES = {
  // Network and connection errors
  'network': 'Sorry, there is a problem with the service. Please try again later.',
  'timeout': 'Sorry, the service is taking too long to respond. Please try again later.',
  'abort': 'The request was cancelled. Please try again.',
  
  // Server errors
  '500': 'Sorry, there is a problem with the service. Please try again later.',
  '502': 'Sorry, the service is currently unavailable. Please try again later.',
  '503': 'Sorry, the service is temporarily unavailable. Please try again later.',
  '504': 'Sorry, the service is taking too long to respond. Please try again later.',
  
  // Authentication/Authorization errors
  '401': 'Sorry, you are not authorised to access this information.',
  '403': 'Sorry, you do not have permission to access this information.',
  
  // Not found errors
  '404': 'The vehicle information you are looking for could not be found.',
  
  // Validation errors
  '400': 'The vehicle registration number is not valid. Please check and try again.',
  
  // Default fallback error
  'default': 'Sorry, we are unable to process your request at the moment. Please try again later.'
};

// Helper function to get appropriate error message
const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.default;
  
  // Handle network errors
  if (typeof error === 'string') {
    if (error.includes('network')) return ERROR_MESSAGES.network;
    if (error.includes('timeout')) return ERROR_MESSAGES.timeout;
    
    // Check for HTTP status code mentions in error message
    for (const code of ['400', '401', '403', '404', '500', '502', '503', '504']) {
      if (error.includes(code)) return ERROR_MESSAGES[code];
    }
  }
  
  return ERROR_MESSAGES.default;
};

// Browser storage utility functions
const browserCache = {
  /**
   * Save data to localStorage with metadata
   */
  saveToCache: (key, data) => {
    try {
      // Calculate approximate size of data
      const jsonString = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: STORAGE_VERSION,
        isPermanent: true // Mark as premium report - never expires
      });
      
      // Check if size is reasonable (e.g., under 2MB)
      const sizeInBytes = new Blob([jsonString]).size;
      if (sizeInBytes > 2 * 1024 * 1024) {
        console.warn(`Cache item too large (${Math.round(sizeInBytes/1024)}KB), not saving`);
        return false;
      }
      
      localStorage.setItem(`${BROWSER_CACHE_PREFIX}${key}`, jsonString);
      return true;
    } catch (error) {
      console.error('Error saving to browser cache:', error);
      // Handle quota exceeded errors
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Try to clear old entries if storage is full
        browserCache.clearOldEntries();
        return false;
      }
      return false;
    }
  },

  /**
   * Get data from localStorage if valid
   */
  getFromCache: (key) => {
    try {
      const cachedItem = localStorage.getItem(`${BROWSER_CACHE_PREFIX}${key}`);
      if (!cachedItem) return null;
      
      const cacheEntry = JSON.parse(cachedItem);
      
      // Check version
      if (cacheEntry.version !== STORAGE_VERSION) {
        localStorage.removeItem(`${BROWSER_CACHE_PREFIX}${key}`);
        return null;
      }
      
      // Check if expired (skip expiration check for permanent premium reports)
      if (!cacheEntry.isPermanent && BROWSER_CACHE_TTL && Date.now() - cacheEntry.timestamp > BROWSER_CACHE_TTL) {
        localStorage.removeItem(`${BROWSER_CACHE_PREFIX}${key}`);
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.error('Error retrieving from browser cache:', error);
      return null;
    }
  },

  /**
   * Clear an entry from localStorage
   */
  clearCache: (key) => {
    localStorage.removeItem(`${BROWSER_CACHE_PREFIX}${key}`);
  },
  
  /**
   * Clear all vehicle analysis entries from localStorage
   */
  clearAllCache: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith(BROWSER_CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  },
  
  /**
   * Clear old entries when storage is full
   */
  clearOldEntries: () => {
    const cacheKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(BROWSER_CACHE_PREFIX));
    
    if (cacheKeys.length === 0) return;
    
    // Get all cache entries with timestamps
    const cacheEntries = cacheKeys
      .map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          return { key, timestamp: item.timestamp };
        } catch (e) {
          return { key, timestamp: 0 };
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Sort oldest first
    
    // Remove oldest 20% of entries
    const entriesToRemove = Math.max(1, Math.floor(cacheEntries.length * 0.2));
    cacheEntries.slice(0, entriesToRemove).forEach(entry => {
      localStorage.removeItem(entry.key);
    });
  }
};

// Status indicator component
const StatusIndicator = ({ status }) => {
  const indicators = {
    good: { emoji: '✓', color: 'var(--positive)' },
    warning: { emoji: '⚠️', color: 'var(--warning)' },
    poor: { emoji: '🔴', color: 'var(--negative)' }
  };
  
  const indicator = indicators[status] || indicators.warning;
  
  return (
    <span style={{ color: indicator.color, fontWeight: 'var(--font-semibold)' }}>
      {indicator.emoji}
    </span>
  );
};

// Risk Assessment Table Component
const RiskAssessmentTable = ({ riskAssessment }) => {
  if (!riskAssessment || !riskAssessment.systems?.length) return null;
  
  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2>Risk Assessment</h2>
      <table>
        <thead>
          <tr>
            <th>System</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {riskAssessment.systems.map((system, index) => (
            <tr key={index}>
              <td>{system.name}</td>
              <td><StatusIndicator status={system.status} /> {system.status}</td>
              <td>{system.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Key Findings Component
const KeyFindings = ({ keyFindings }) => {
  if (!keyFindings?.length) return null;
  
  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2>Key Findings</h2>
      {keyFindings.map((finding, index) => (
        <div key={index} style={{ 
          marginBottom: 'var(--space-lg)',
          padding: 'var(--space-md)',
          backgroundColor: 'var(--gray-50)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: `4px solid ${finding.severity === 'poor' ? 'var(--negative)' : finding.severity === 'warning' ? 'var(--warning)' : 'var(--positive)'}`
        }}>
          <h3 style={{ margin: '0 0 var(--space-sm) 0', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <StatusIndicator status={finding.severity} />
            {finding.system}
          </h3>
          <ul style={{ margin: 0, paddingLeft: 'var(--space-lg)' }}>
            {finding.issues.map((issue, issueIndex) => (
              <li key={issueIndex}>{issue}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Bulletin Matches Component  
const BulletinMatches = ({ bulletinMatches }) => {
  if (!bulletinMatches?.length) return null;
  
  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2>Technical Bulletin Matches</h2>
      <table>
        <thead>
          <tr>
            <th>Bulletin</th>
            <th>Title</th>
            <th>MOT Connection</th>
          </tr>
        </thead>
        <tbody>
          {bulletinMatches.map((match, index) => (
            <tr key={index}>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{match.bulletin}</td>
              <td>{match.title}</td>
              <td>{match.motConnection}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// MOT Patterns Component
const MotPatterns = ({ motPatterns }) => {
  if (!motPatterns?.hasPatterns) return null;
  
  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2>MOT Failure Patterns</h2>
      <p>{motPatterns.description}</p>
      {motPatterns.timeline?.length > 0 && (
        <div>
          <h4>Timeline:</h4>
          <ul>
            {motPatterns.timeline.map((event, index) => (
              <li key={index}>{event}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Summary Component
const SummaryNotes = ({ summary }) => {
  if (!summary?.notes?.length) return null;
  
  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2>Summary</h2>
      <ul>
        {summary.notes.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
    </div>
  );
};

// Main Structured Analysis Component
const StructuredAnalysisContent = ({ analysisData }) => {
  if (!analysisData) return null;
  
  return (
    <>
      <RiskAssessmentTable riskAssessment={analysisData.riskAssessment} />
      <KeyFindings keyFindings={analysisData.keyFindings} />
      <BulletinMatches bulletinMatches={analysisData.bulletinMatches} />
      <MotPatterns motPatterns={analysisData.motPatterns} />
      <SummaryNotes summary={analysisData.summary} />
    </>
  );
};


/**
 * VehicleAnalysisComponent to fetch and display vehicle information
 * Enhanced to match GOV.UK styling and accessibility standards
 */
const VehicleAnalysisComponent = ({ 
  registration, 
  vehicleData, 
  onDataLoad 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Function to check browser cache
  const checkBrowserCache = useCallback(() => {
    if (!registration) return null;
    
    const normalizedReg = registration.toUpperCase().trim();
    const cachedData = browserCache.getFromCache(normalizedReg);
    
    if (cachedData) {
      console.log('Found in browser cache:', normalizedReg);
      return cachedData;
    }
    
    return null;
  }, [registration]);

  // Fetch analysis from API with retries
  const fetchAnalysisFromApi = useCallback(async () => {
    if (!registration) {
      setError("Vehicle registration is required");
      setLoading(false);
      return;
    }

    // Normalize registration
    const normalizedReg = registration.toUpperCase().trim();
    
    // Check browser cache first
    const cachedData = checkBrowserCache();
    if (cachedData) {
      setAnalysis(cachedData);
      setLoading(false);
      
      // Still call onDataLoad with cached data
      if (onDataLoad && typeof onDataLoad === 'function') {
        onDataLoad(cachedData);
      }
      
      return;
    }

    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller with timeout
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    // Set up timeout to abort request after 60 seconds
    const timeoutId = setTimeout(() => {
      abortControllerRef.current.abort();
    }, 60000);

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching data for registration: ${normalizedReg}`);
      
      const response = await fetch(
        `${API_BASE_URL}/vehicle-analysis/${normalizedReg}`, 
        { signal }
      );
      
      if (!response.ok) {
        let errorMessage;
        let errorData = {};
        
        // Try to parse error response
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Could not parse error response as JSON:", jsonError);
        }
        
        // Handle specific HTTP status codes
        switch (response.status) {
          case 404:
            errorMessage = "The vehicle information could not be found.";
            break;
          case 429:
            errorMessage = "You've made too many requests. Please wait and try again.";
            break;
          default:
            errorMessage = errorData.detail || `Service error: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Data received", data);
      
      // Reset retry counter on success
      retryCountRef.current = 0;
      
      // Set analysis
      setAnalysis(data);
      
      // Store in browser cache
      browserCache.saveToCache(normalizedReg, data);
      
      // Call onDataLoad callback if provided
      if (onDataLoad && typeof onDataLoad === 'function') {
        onDataLoad(data);
      }
      
    } catch (err) {
      // Don't handle aborted requests as errors
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error("Error fetching vehicle data:", err);
      
      // Implement better retry logic for recoverable errors
      const isRetryableError = (
        err.message.includes('network') ||
        err.message.includes('timeout') ||
        err.message.includes('Service error: Internal Server Error') ||
        err.message.includes('Service error: Bad Gateway') ||
        err.message.includes('Service error: Service Unavailable') ||
        err.message.includes('Service error: Gateway Timeout')
      );
      
      if (isRetryableError && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.min(retryCountRef.current * 1000 * 2, 8000); // Exponential backoff with max 8s
        
        console.log(`Retrying request (${retryCountRef.current}/${maxRetries}) in ${delay}ms`);
        
        setTimeout(() => {
          fetchAnalysisFromApi();
        }, delay);
        
        return;
      }
      
      // Use our error mapping function instead of displaying raw error
      setError(getErrorMessage(err.message));
    } finally {
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [registration, onDataLoad, checkBrowserCache]);

  // Initial fetch when component mounts or registration changes
  useEffect(() => {
    if (registration) {
      fetchAnalysisFromApi();
    }
    
    // Cleanup function to abort any pending requests when unmounting
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [registration, fetchAnalysisFromApi]);

  // Use memoization for structured content to avoid unnecessary re-renders
  const structuredContent = useMemo(() => {
    if (analysis?.analysis) {
      return <StructuredAnalysisContent analysisData={analysis.analysis} />;
    }
    return null;
  }, [analysis?.analysis]);

  // Loading state
  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner aria-label="Loading vehicle information" role="status" />
          <Title>Loading Vehicle Analysis</Title>
          <Body>Please wait while we analyze your vehicle data...</Body>
        </LoadingContainer>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <WarningIcon style={{ fontSize: 40, color: 'var(--negative)', marginBottom: 'var(--space-md)' }} aria-hidden="true" />
          <Title>Analysis Unavailable</Title>
          <Body>{error}</Body>
          <Button onClick={() => fetchAnalysisFromApi()}>
            Try Again
          </Button>
        </ErrorContainer>
      </Container>
    );
  }

  // No data state
  if (!analysis) {
    return (
      <Container>
        <ErrorContainer>
          <InfoIcon style={{ fontSize: 40, color: 'var(--primary)', marginBottom: 'var(--space-md)' }} aria-hidden="true" />
          <Title>No Analysis Available</Title>
          <Body>The requested vehicle analysis cannot be displayed at this time.</Body>
        </ErrorContainer>
      </Container>
    );
  }

  // Success state with vehicle analysis
  return (
    <Container>
      <AnalysisPanel>
        <Title>Vehicle Analysis Report</Title>
        
        <Body>
          Analysis for {vehicleData?.make} {vehicleData?.model} based on MOT history and technical bulletins.
        </Body>
        
        <AnalysisContent>
          {structuredContent}
        </AnalysisContent>
        
        <Note>
          <InfoIcon 
            fontSize="small" 
            style={{ color: 'var(--primary)' }} 
            aria-hidden="true" 
          />
          <p>
            This analysis is based on manufacturer data and vehicle records. 
            Individual vehicle experiences may vary.
          </p>
        </Note>
      </AnalysisPanel>
    </Container>
  );
};

export default React.memo(VehicleAnalysisComponent);