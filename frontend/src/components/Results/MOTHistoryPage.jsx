import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GovUKContainer,
  GovUKMainWrapper,
  GovUKHeadingL,
  GovUKGridRow,
  GovUKGridColumnOneThird,
  GovUKGridColumnTwoThirds,
  GovUKGridColumnOneHalf,
  GovUKHeadingXL,
  GovUKCaptionM,
  GovUKHeadingS,
  GovUKBody,
  GovUKLink,
  GovUKList,
  GovUKDetails,
  GovUKDetailsSummary,
  GovUKDetailsText,
  GovUKSectionBreak,
  GovUKInsetText,
  GovUKLoadingContainer,
  GovUKLoadingSpinner
} from '../../styles/theme';

// Only import Alert from Material UI
import Alert from '@mui/material/Alert';

// Cache for storing MOT history data
const motCache = {};

const MOTHistoryPage = ({ registration }) => {
  const [motData, setMotData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // API endpoint
  const API_BASE_URL = 'http://localhost:8000/api/v1';
  // Configure the stale time in milliseconds (5 minutes)
  const CACHE_STALE_TIME = 5 * 60 * 1000;

  // Function to format date to UK format (DD Month YYYY)
  const formatDate = useCallback((dateString) => {
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
  }, []);

  // Function to format mileage
  const formatMileage = useCallback((value, unit) => {
    if (!value) return 'Not recorded';
    // Add commas for thousands
    const formattedValue = parseInt(value).toLocaleString('en-GB');
    return `${formattedValue} ${unit === 'MI' ? 'miles' : 'km'}`;
  }, []);

  // Function to convert API MOT data to the format expected by this component
  const transformMotData = useCallback((apiData) => {
    if (!apiData || !apiData.motTests || apiData.motTests.length === 0) {
      return [];
    }

    return apiData.motTests.map(test => {
      // Determine if this is a pass or fail
      const status = test.testResult === 'PASSED' ? 'PASS' : 'FAIL';
      
      // Format the completed date
      const date = formatDate(test.completedDate);
      
      // Format the expiry date if available
      const expiry = test.expiryDate ? formatDate(test.expiryDate) : null;
      
      // Get the mileage if available
      const mileage = test.odometerResultType === 'READ' ? formatMileage(test.odometerValue, test.odometerUnit) : 'Not recorded';
      
      // Process defects if any
      const defects = test.defects ? test.defects
        .filter(d => d.type === 'MAJOR' || d.type === 'DANGEROUS')
        .map(d => `${d.text} (${d.type})`) : [];
      
      // Process advisories if any
      const advisories = test.defects ? test.defects
        .filter(d => d.type === 'ADVISORY' || d.type === 'MINOR')
        .map(d => `${d.text} (${d.type})`) : [];
      
      return {
        date,
        status,
        mileage,
        testNumber: test.motTestNumber || 'Not available',
        expiry,
        location: test.location || 'View test location',
        defects: defects.length > 0 ? defects : undefined,
        advisories: advisories.length > 0 ? advisories : undefined
      };
    });
  }, [formatDate, formatMileage]);

  // Function to check if cached data is still valid (not older than 5 minutes)
  const isCacheValid = useCallback((cachedTime) => {
    return (Date.now() - cachedTime) < CACHE_STALE_TIME;
  }, [CACHE_STALE_TIME]);

  // Fetch MOT data when registration changes or on initial load
  useEffect(() => {
    const fetchMotData = async () => {
      if (!registration) return;

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      // Check cache first
      const cacheKey = `mot_${registration}`;
      const cachedData = motCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        // For cached data, don't show loading indicator
        setMotData(cachedData.data);
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
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail?.errorMessage || 'Failed to fetch vehicle data');
        }
        
        const data = await response.json();
        const transformedData = transformMotData(data);
        
        // Store in cache with timestamp
        motCache[cacheKey] = {
          data: transformedData,
          timestamp: Date.now(),
          rawData: data // Store raw data for potential reuse
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
        
        setMotData(transformedData);
      } catch (err) {
        // Don't set error for aborted requests
        if (err.name !== 'AbortError') {
          setError(err.message || 'An error occurred while fetching MOT data');
        }
      } finally {
        setLoading(false);
      }
    };

    // Try to restore from localStorage on initial render
    const tryRestoreFromStorage = () => {
      if (!registration) return false;
      
      try {
        const cacheKey = `mot_${registration}`;
        const storedData = localStorage.getItem(cacheKey);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (isCacheValid(parsedData.timestamp)) {
            motCache[cacheKey] = parsedData;
            setMotData(parsedData.data);
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
      fetchMotData();
    }

    // Cleanup function to abort any in-flight requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [registration, transformMotData, isCacheValid]);

  return (
    <GovUKContainer>
      <GovUKMainWrapper>
        {/* Section heading without accordion */}
        <GovUKHeadingL>MOT history</GovUKHeadingL>
        
        {/* Content is always displayed */}
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
        
        {!loading && !error && motData && motData.length === 0 && (
          <GovUKInsetText>
            <GovUKBody>No MOT history found for this vehicle. It may be exempt from MOT testing or too new to require an MOT test.</GovUKBody>
          </GovUKInsetText>
        )}
        
        {!loading && !error && motData && motData.length > 0 && (
          <>
            {motData.map((mot, index) => (
              <React.Fragment key={index}>
                <GovUKGridRow>
                  <GovUKGridColumnOneThird>
                    <GovUKCaptionM>Date tested</GovUKCaptionM>
                    <GovUKHeadingS>{mot.date}</GovUKHeadingS>
                    <GovUKHeadingXL motStatus={mot.status}>{mot.status}</GovUKHeadingXL>
                  </GovUKGridColumnOneThird>
                  <GovUKGridColumnTwoThirds>
                    <GovUKGridRow>
                      <GovUKGridColumnOneHalf>
                        <GovUKCaptionM>Mileage</GovUKCaptionM>
                        <GovUKHeadingS>{mot.mileage}</GovUKHeadingS>
                        <GovUKCaptionM>Test location</GovUKCaptionM>
                        <GovUKBody>
                          <GovUKLink href="#">{mot.location}</GovUKLink>
                        </GovUKBody>
                      </GovUKGridColumnOneHalf>
                      <GovUKGridColumnOneHalf>
                        <GovUKCaptionM>MOT test number</GovUKCaptionM>
                        <GovUKHeadingS>{mot.testNumber}</GovUKHeadingS>
                        {mot.expiry && (
                          <>
                            <GovUKCaptionM>Expiry date</GovUKCaptionM>
                            <GovUKHeadingS>{mot.expiry}</GovUKHeadingS>
                          </>
                        )}
                      </GovUKGridColumnOneHalf>
                    </GovUKGridRow>
                    {(mot.defects || mot.advisories) && (
                      <div>
                        {mot.defects && (
                          <>
                            <GovUKCaptionM>Repair immediately (major defects):</GovUKCaptionM>
                            <GovUKList>
                              {mot.defects.map((defect, i) => (
                                <li key={i}><strong>{defect}</strong></li>
                              ))}
                            </GovUKList>
                          </>
                        )}
                        {mot.advisories && (
                          <>
                            <GovUKCaptionM>Monitor and repair if necessary (advisories):</GovUKCaptionM>
                            <GovUKList>
                              {mot.advisories.map((advisory, i) => (
                                <li key={i}><strong>{advisory}</strong></li>
                              ))}
                            </GovUKList>
                          </>
                        )}
                        <GovUKDetails>
                          <GovUKDetailsSummary>
                            What are {mot.defects && mot.advisories ? 'defects and advisories' : mot.defects ? 'defects' : 'advisories'}?
                          </GovUKDetailsSummary>
                          <GovUKDetailsText>
                            {mot.defects && (
                              <GovUKBody>
                                Major defects may compromise the safety of the vehicle, put other road users at risk, or harm the environment. A vehicle with a major defect will fail the test.
                              </GovUKBody>
                            )}
                            {mot.advisories && (
                              <GovUKBody>
                                Advisories are given for guidance. Some of these may need to be monitored in case they become more serious and need immediate repairs.
                              </GovUKBody>
                            )}
                          </GovUKDetailsText>
                        </GovUKDetails>
                      </div>
                    )}
                  </GovUKGridColumnTwoThirds>
                </GovUKGridRow>
                {index < motData.length - 1 && <GovUKSectionBreak />}
              </React.Fragment>
            ))}
            <GovUKInsetText>
              <GovUKBody style={{ fontWeight: 700 }}>
                The MOT test changed on 20 May 2018
              </GovUKBody>
              <GovUKBody>
                Defects are now categorised according to their severity - dangerous, major, and minor.{' '}
                <GovUKLink href="https://www.gov.uk/government/news/mot-changes-20-may-2018">
                  Find out more
                </GovUKLink>
              </GovUKBody>
            </GovUKInsetText>
          </>
        )}
      </GovUKMainWrapper>
    </GovUKContainer>
  );
};

export default MOTHistoryPage;