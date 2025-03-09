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
  GovUKLoadingSpinner,
  COLORS,
} from '../../styles/theme';
import MotDefectDetail from './MotDefectDetail';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

const ClickableDefectItem = styled('div')(({ expanded }) => ({
  cursor: 'pointer',
  position: 'relative',
  padding: '8px 0',
  borderLeft: expanded ? `5px solid ${COLORS.BLUE}` : 'none',
  paddingLeft: expanded ? '10px' : '0',
  transition: 'all 0.2s ease',
  marginBottom: '10px',
  width: '100%',
  '&:hover': {
    color: COLORS.BLUE,
    '& strong': {},
  },
  '& strong': {
    display: 'block',
    width: '100%',
  },
}));

const motCache = {};
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment ? 'http://localhost:8000/api/v1' : '/api/v1';

const extractDefectId = (text) => {
  const match = /\(?(\d+\.\d+(?:\.\d+)?)\)?/.exec(text);
  return match ? match[1] : null;
};

const MOTHistoryPage = ({ registration }) => {
  const [motData, setMotData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDefects, setExpandedDefects] = useState({});
  const abortControllerRef = useRef(null);
  const defectRefs = useRef({}); // Refs to track each ClickableDefectItem DOM element

  const CACHE_STALE_TIME = 5 * 60 * 1000;

  // Toggle expanded state for a specific defect
  const toggleExpanded = useCallback((defectKey) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedDefects(prev => ({
      ...prev,
      [defectKey]: !prev[defectKey],
    }));
  }, []);

  // Close all expanded defects
  const closeAllDefects = useCallback(() => {
    setExpandedDefects({});
  }, []);

  // Handle clicks outside to close expanded defects
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if any defect is expanded
      const hasExpanded = Object.values(expandedDefects).some(val => val);
      if (!hasExpanded) return;

      // Check if the click is outside all ClickableDefectItem elements
      const isOutside = Object.values(defectRefs.current).every(ref => 
        ref && !ref.contains(event.target)
      );

      if (isOutside) {
        closeAllDefects();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [expandedDefects, closeAllDefects]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Invalid date';
    }
  }, []);

  const formatMileage = useCallback((value, unit) => {
    if (!value) return 'Not recorded';
    const formattedValue = parseInt(value).toLocaleString('en-GB');
    return `${formattedValue} ${unit === 'MI' ? 'miles' : 'km'}`;
  }, []);

  const transformMotData = useCallback((apiData) => {
    if (!apiData || !apiData.motTests || apiData.motTests.length === 0) return [];
    return apiData.motTests.map(test => {
      const status = test.testResult === 'PASSED' ? 'PASS' : 'FAIL';
      const date = formatDate(test.completedDate);
      const expiry = test.expiryDate ? formatDate(test.expiryDate) : null;
      const mileage = test.odometerResultType === 'READ' ? formatMileage(test.odometerValue, test.odometerUnit) : 'Not recorded';
      const defects = test.defects ? test.defects
        .filter(d => d.type === 'MAJOR' || d.type === 'DANGEROUS')
        .map(d => ({ text: d.text, type: d.type, id: extractDefectId(d.text) })) : [];
      const advisories = test.defects ? test.defects
        .filter(d => d.type === 'ADVISORY' || d.type === 'MINOR')
        .map(d => ({ text: d.text, type: d.type, id: extractDefectId(d.text) })) : [];
      
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

  const isCacheValid = useCallback((cachedTime) => {
    return (Date.now() - cachedTime) < CACHE_STALE_TIME;
  }, []);

  useEffect(() => {
    const fetchMotData = async () => {
      if (!registration) return;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      
      const cacheKey = `mot_${registration}`;
      const cachedData = motCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        setMotData(cachedData.data);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/vehicle/registration/${registration}`,
          {
            signal: abortControllerRef.current.signal,
            headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin'
          }
        );
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.errorMessage || data.detail?.errorMessage || data.detail || `Failed to fetch MOT data (Status: ${response.status})`);
        
        const transformedData = transformMotData(data);
        motCache[cacheKey] = { data: transformedData, timestamp: Date.now(), rawData: data };
        localStorage.setItem(cacheKey, JSON.stringify({ data: transformedData, timestamp: Date.now() }));
        setMotData(transformedData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('API error:', err);
          setError(err.message || 'An error occurred while fetching MOT data');
        }
      } finally {
        setLoading(false);
      }
    };

    const tryRestoreFromStorage = () => {
      if (!registration) return false;
      const cacheKey = `mot_${registration}`;
      const storedData = localStorage.getItem(cacheKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (isCacheValid(parsedData.timestamp)) {
          motCache[cacheKey] = parsedData;
          setMotData(parsedData.data);
          setLoading(false);
          return true;
        }
      }
      return false;
    };

    const restored = tryRestoreFromStorage();
    if (!restored) fetchMotData();

    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [registration, transformMotData, isCacheValid]);

  return (
    <GovUKContainer>
      <GovUKMainWrapper>
        <GovUKHeadingL>MOT history</GovUKHeadingL>
        
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
                              {mot.defects.map((defect, i) => {
                                const defectKey = `${index}-defect-${i}`;
                                return (
                                  <li key={i}>
                                    <ClickableDefectItem
                                      ref={el => defectRefs.current[defectKey] = el} // Assign ref to each item
                                      expanded={expandedDefects[defectKey]}
                                      onClick={toggleExpanded(defectKey)}
                                      aria-expanded={expandedDefects[defectKey] || false}
                                      role="button"
                                      tabIndex={0}
                                      title={`${expandedDefects[defectKey] ? 'Hide' : 'View'} MOT manual reference details`}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          toggleExpanded(defectKey)(e);
                                        }
                                      }}
                                    >
                                      <strong>{defect.text}</strong>
                                      <MotDefectDetail 
                                        defectId={defect.id}
                                        defectText={defect.text}
                                        defectCategory={defect.type}
                                        expanded={expandedDefects[defectKey]}
                                        toggleExpanded={toggleExpanded(defectKey)}
                                      />
                                    </ClickableDefectItem>
                                  </li>
                                );
                              })}
                            </GovUKList>
                          </>
                        )}
                        {mot.advisories && (
                          <>
                            <GovUKCaptionM>Monitor and repair if necessary (advisories):</GovUKCaptionM>
                            <GovUKList>
                              {mot.advisories.map((advisory, i) => {
                                const advisoryKey = `${index}-advisory-${i}`;
                                return (
                                  <li key={i}>
                                    <ClickableDefectItem
                                      ref={el => defectRefs.current[advisoryKey] = el} // Assign ref to each item
                                      expanded={expandedDefects[advisoryKey]}
                                      onClick={toggleExpanded(advisoryKey)}
                                      aria-expanded={expandedDefects[advisoryKey] || false}
                                      role="button"
                                      tabIndex={0}
                                      title={`${expandedDefects[advisoryKey] ? 'Hide' : 'View'} MOT manual reference details`}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          toggleExpanded(advisoryKey)(e);
                                        }
                                      }}
                                    >
                                      <strong>{advisory.text}</strong>
                                      <MotDefectDetail 
                                        defectId={advisory.id}
                                        defectText={advisory.text}
                                        defectCategory={advisory.type}
                                        expanded={expandedDefects[advisoryKey]}
                                        toggleExpanded={toggleExpanded(advisoryKey)}
                                      />
                                    </ClickableDefectItem>
                                  </li>
                                );
                              })}
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