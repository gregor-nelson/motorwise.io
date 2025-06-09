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
  SPACING,
  commonFontStyles,
  printStyles,
} from '../../styles/theme';
import {
  useTooltip,
  ValueWithTooltip,
} from '../../styles/tooltip';
import MotDefectDetail from './MotDefectDetail';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

// ANIMATION COMPONENTS - Added without changing core logic
const MotResultCard = styled('div')(({ show, index = 0 }) => ({
  opacity: show ? 1 : 0,
  transform: show ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
  transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 150}ms`,
  willChange: 'opacity, transform',
  marginBottom: '2rem',
}));

const FadeInContent = styled('div')(({ show, delay = 0 }) => ({
  opacity: show ? 1 : 0,
  transform: show ? 'translateY(0)' : 'translateY(10px)',
  transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
}));

const AnimatedDefectList = styled('div')(({ show }) => ({
  '& > li': {
    opacity: show ? 1 : 0,
    transform: show ? 'translateX(0)' : 'translateX(-15px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '& > li:nth-of-type(1)': {
    transitionDelay: show ? '100ms' : '0ms',
  },
  '& > li:nth-of-type(2)': {
    transitionDelay: show ? '150ms' : '0ms',
  },
  '& > li:nth-of-type(3)': {
    transitionDelay: show ? '200ms' : '0ms',
  },
  '& > li:nth-of-type(4)': {
    transitionDelay: show ? '250ms' : '0ms',
  },
  '& > li:nth-of-type(n+5)': {
    transitionDelay: show ? '300ms' : '0ms',
  },
}));

// COLLAPSIBLE SECTION COMPONENTS
const CollapsibleSection = styled('div')(({ expanded }) => ({
  border: `1px solid #b1b4b6`, // GOV.UK standard border
  marginBottom: '30px', // GOV.UK spacing scale
  overflow: 'hidden',
  transition: 'all 0.15s ease-in-out', // GOV.UK timing
}));

const CollapsibleHeader = styled('button')(({ expanded }) => ({
  width: '100%',
  padding: '15px 20px', // GOV.UK spacing
  backgroundColor: '#f3f2f1', // GOV.UK light grey
  border: 'none',
  borderBottom: `1px solid #b1b4b6`,
  cursor: 'pointer',
  display: 'block',
  fontSize: '19px', // GOV.UK body font size
  fontWeight: '400', // GOV.UK normal weight
  color: '#0b0c0c',
  textAlign: 'left',
  transition: 'background-color 0.1s ease-in-out',
  '&:hover': {
    backgroundColor: '#e8f4fd', // GOV.UK light blue hover
  },
  '&:focus': {
    outline: `3px solid #ffdd00`,
    outlineOffset: '0px',
    backgroundColor: '#ffdd00',
  },
}));

const CollapsibleIcon = styled('span')(({ expanded }) => ({
  fontSize: '16px',
  fontWeight: '700',
  color: '#1d70b8', // GOV.UK blue
  display: 'inline-block',
  marginTop: '4px', // Align with header
  flexShrink: 0,
}));

const CollapsibleContent = styled('div')(({ expanded }) => ({
  maxHeight: expanded ? 'none' : '0',
  overflow: 'hidden',
  transition: 'all 0.15s ease-in-out', // GOV.UK timing
  padding: expanded ? '20px' : '0 20px', // GOV.UK spacing
  opacity: expanded ? 1 : 0,
  backgroundColor: '#ffffff',
}));

const HeaderContent = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  width: '100%',
});

const HeaderTitle = styled('div')({
  '& h2': {
    fontSize: '24px', // GOV.UK heading-m
    fontWeight: '700',
    lineHeight: '1.25',
    margin: '0 0 5px 0',
    color: '#0b0c0c',
  }
});

const ResultsSummary = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '10px',
  fontSize: '16px', // GOV.UK body font
  lineHeight: '1.25',
  color: '#505a5f',
  marginTop: '5px',
  
  '& .summary-item': {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  
  '& .count': {
    fontWeight: '700',
    color: '#0b0c0c',
  },
  
  '& .label': {
    color: '#505a5f',
  },
  
  '& .divider': {
    width: '1px',
    height: '16px',
    backgroundColor: '#b1b4b6',
    margin: '0 5px',
  },
  
  '& .status-tag': {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderRadius: '0px', // GOV.UK tags are square
    border: '2px solid',
    lineHeight: '1',
  },
  
  '& .status-tag.pass': {
    backgroundColor: '#00703c',
    borderColor: '#00703c',
    color: '#ffffff',
  },
  
  '& .status-tag.fail': {
    backgroundColor: '#d4351c',
    borderColor: '#d4351c',
    color: '#ffffff',
  },
  
  '& .issue-tag': {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: '14px',
    fontWeight: '700',
    backgroundColor: '#fd0',
    color: '#0b0c0c',
    borderRadius: '0px',
    lineHeight: '1',
  }
});

// ORIGINAL STYLING - Enhanced with smooth hover
const ClickableDefectItem = styled('div')(({ expanded }) => ({
  cursor: 'pointer',
  position: 'relative',
  padding: '8px 0',
  borderLeft: expanded ? `5px solid #1d70b8` : 'none', // GOV.UK blue
  paddingLeft: expanded ? '10px' : '0',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Enhanced transition
  marginBottom: '10px',
  width: '100%',
  '&:hover': {
    color: '#1d70b8', // GOV.UK blue
    transform: 'translateX(5px)', // Added smooth hover effect
    '& strong': {},
  },
  '& strong': {
    display: 'block',
    width: '100%',
  },
}));

// ORIGINAL STYLING - Unchanged
const VehicleRegistration = styled('div')`
  ${commonFontStyles}
  display: inline-block;
  min-width: 150px;
  font: 30px "UK-VRM", Verdana, sans-serif;
  padding: 0.4em 0.2em;
  text-align: center;
  background-color: #ffdd00; /* GOV.UK yellow */
  border-radius: 0.25em;
  text-transform: uppercase;
  margin-bottom: ${SPACING.M};
  
  ${printStyles}
`;

// ORIGINAL CACHE AND CONFIG - Unchanged to preserve working behavior
const motCache = {};
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment ? 'http://localhost:8000/api/v1' : '/api/v1';

// ORIGINAL HELPER FUNCTIONS - Unchanged
const extractDefectId = (text) => {
  const match = /\(?(\d+\.\d+(?:\.\d+)?)\)?/.exec(text);
  return match ? match[1] : null;
};

const formatRegistration = (reg) => {
  if (!reg || typeof reg !== 'string') return 'Not available';

  const normalized = reg.replace(/[\s\-]/g, '').toUpperCase();
  
  if (normalized.length < 2 || normalized.length > 8) {
    return normalized;
  }

  if (/^[A-Z]{2}\d{2}[A-Z]{3}$/.test(normalized)) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4)}`;
  }

  if (/^[A-Z]\d{1,3}[A-Z]{3}$/.test(normalized)) {
    const letterPart = normalized.match(/^[A-Z]/)[0];
    const numberPart = normalized.match(/\d{1,3}/)[0];
    const finalLetters = normalized.slice(letterPart.length + numberPart.length);
    return `${letterPart}${numberPart} ${finalLetters}`;
  }

  if (/^[A-Z]{3}\d{1,3}[A-Z]$/.test(normalized)) {
    const initialLetters = normalized.slice(0, 3);
    const numberPart = normalized.match(/\d{1,3}/)[0];
    const finalLetter = normalized.slice(3 + numberPart.length);
    return `${initialLetters} ${numberPart}${finalLetter}`;
  }

  if (/^[A-Z]{3}\d{1,3}$/.test(normalized)) {
    const letters = normalized.slice(0, 3);
    const numbers = normalized.slice(3);
    return `${letters} ${numbers}`;
  }

  if (/^\d{1,3}[A-Z]{3}$/.test(normalized)) {
    const match = normalized.match(/^(\d{1,3})([A-Z]{3})$/);
    return `${match[1]} ${match[2]}`;
  }

  if (/^[A-Z]\d{1,3}$/.test(normalized)) {
    return normalized;
  }

  return normalized;
};

const MOTHistoryPage = ({ registration, onLoadingComplete, onError }) => {
  const { withTooltip } = useTooltip();
  
  // ORIGINAL STATE - Unchanged
  const [motData, setMotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDefects, setExpandedDefects] = useState({});
  const abortControllerRef = useRef(null);
  const defectRefs = useRef({}); // Keep as original object, not Map
  
  // ANIMATION STATE - Added for smooth reveal
  const [showResults, setShowResults] = useState(false);
  const [showDefects, setShowDefects] = useState({});
  // COLLAPSIBLE SECTION STATE
  const [sectionExpanded, setSectionExpanded] = useState(true);

  const CACHE_STALE_TIME = 5 * 60 * 1000;

  // ORIGINAL FUNCTIONS - Unchanged
  const toggleExpanded = useCallback((defectKey) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedDefects(prev => ({
      ...prev,
      [defectKey]: !prev[defectKey],
    }));
  }, []);

  const closeAllDefects = useCallback(() => {
    setExpandedDefects({});
  }, []);

  // COLLAPSIBLE SECTION TOGGLE
  const toggleSectionExpanded = useCallback(() => {
    setSectionExpanded(prev => !prev);
  }, []);

  // ORIGINAL CLICK OUTSIDE LOGIC - Unchanged
  useEffect(() => {
    const handleClickOutside = (event) => {
      const hasExpanded = Object.values(expandedDefects).some(val => val);
      if (!hasExpanded) return;

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

  // ORIGINAL HELPER FUNCTIONS - Unchanged
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

  // GENERATE SUMMARY FOR COLLAPSED STATE
  const generateSummary = useCallback((data) => {
    if (!data || data.length === 0) return null;
    
    const totalTests = data.length;
    const passCount = data.filter(mot => mot.status === 'PASS').length;
    const failCount = totalTests - passCount;
    const latestTest = data[0]; // Assuming first is latest
    const totalDefects = data.reduce((sum, mot) => 
      sum + (mot.defects ? mot.defects.length : 0), 0);
    const totalAdvisories = data.reduce((sum, mot) => 
      sum + (mot.advisories ? mot.advisories.length : 0), 0);
    
    return {
      totalTests,
      passCount,
      failCount,
      latestTest,
      totalDefects,
      totalAdvisories
    };
  }, []);

  // ENHANCED COMPLETE LOADING - Added animations to original logic
  const completeLoading = useCallback((data = null, errorMessage = null) => {
    setLoading(false);
    
    if (errorMessage) {
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } else if (data !== null) {
      setMotData(data);
      setError(null);
      
      // ANIMATION TRIGGERS - Added
      setTimeout(() => setShowResults(true), 100);
      
      if (data.length > 0) {
        data.forEach((mot, index) => {
          if (mot.defects || mot.advisories) {
            setTimeout(() => {
              setShowDefects(prev => ({
                ...prev,
                [index]: true
              }));
            }, 300 + (index * 100));
          }
        });
      }
      
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }
  }, [onLoadingComplete, onError]);

  // ORIGINAL FETCH LOGIC - Completely unchanged to preserve working behavior
  useEffect(() => {
    const fetchMotData = async () => {
      if (!registration) {
        completeLoading([]);
        return;
      }

      // Reset animation state
      setShowResults(false);
      setShowDefects({});
      setSectionExpanded(true); // Reset to expanded when loading new data

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      const cacheKey = `mot_${registration}`;
      
      setLoading(true);
      setError(null);
      
      const minLoadingTime = 500;
      const startTime = Date.now();
      
      try {
        // Check cache first
        const cachedData = motCache[cacheKey];
        if (cachedData && isCacheValid(cachedData.timestamp)) {
          console.log('Using cached data');
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsed);
          
          setTimeout(() => {
            completeLoading(cachedData.data);
          }, remainingTime);
          return;
        }
        
        // Check localStorage as fallback
        const storedData = localStorage.getItem(cacheKey);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (isCacheValid(parsedData.timestamp)) {
            console.log('Using localStorage data');
            motCache[cacheKey] = parsedData;
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsed);
            
            setTimeout(() => {
              completeLoading(parsedData.data);
            }, remainingTime);
            return;
          }
        }
        
        console.log('Fetching fresh data from API');
        
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
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(
            data.errorMessage || 
            data.detail?.errorMessage || 
            data.detail || 
            `Failed to fetch MOT data (Status: ${response.status})`
          );
        }
        
        const transformedData = transformMotData(data);
        
        motCache[cacheKey] = { 
          data: transformedData, 
          timestamp: Date.now(), 
          rawData: data 
        };
        localStorage.setItem(cacheKey, JSON.stringify({ 
          data: transformedData, 
          timestamp: Date.now() 
        }));
        
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);
        
        setTimeout(() => {
          completeLoading(transformedData);
        }, remainingTime);
        
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('API error:', err);
          const errorMessage = err.message || 'An error occurred while fetching MOT data';
          
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsed);
          
          setTimeout(() => {
            completeLoading(null, errorMessage);
          }, remainingTime);
        }
      }
    };

    fetchMotData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [registration, transformMotData, isCacheValid, completeLoading]);

  if (!registration) {
    return null;
  }

  return (
    <GovUKContainer>
      <GovUKMainWrapper>
        <FadeInContent show={!loading} delay={0}>
          <GovUKHeadingL>MOT History</GovUKHeadingL>
        </FadeInContent>
        
        {loading && (
          <GovUKLoadingContainer>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <VehicleRegistration>
                {formatRegistration(registration)}
              </VehicleRegistration>
            </div>
            <GovUKLoadingSpinner />
            <GovUKBody style={{ textAlign: 'center', marginTop: '16px' }}>
            </GovUKBody>
          </GovUKLoadingContainer>
        )}
        
        {!loading && error && (
          <FadeInContent show={!loading} delay={100}>
            <Alert severity="error" style={{ marginBottom: '20px' }}>
              {error}
            </Alert>
          </FadeInContent>
        )}
        
        {!loading && !error && motData && motData.length === 0 && (
          <FadeInContent show={!loading} delay={100}>
            <GovUKInsetText>
              <GovUKBody>No MOT history found for this vehicle. It may be exempt from MOT testing or too new to require an MOT test.</GovUKBody>
            </GovUKInsetText>
          </FadeInContent>
        )}
        
        {!loading && !error && motData && motData.length > 0 && (
          <FadeInContent show={showResults} delay={200}>
            <CollapsibleSection expanded={sectionExpanded}>
              <CollapsibleHeader 
                expanded={sectionExpanded} 
                onClick={toggleSectionExpanded}
                aria-expanded={sectionExpanded}
                aria-controls="mot-results-content"
              >
                <HeaderContent>
                  <HeaderTitle>
                    {(() => {
                      const summary = generateSummary(motData);
                      return summary && (
                        <ResultsSummary>
                          <div className="summary-item">
                            <span className="count">{summary.totalTests}</span>
                            <span className="label">test{summary.totalTests !== 1 ? 's' : ''}</span>
                          </div>
                          
                          <span className="divider"></span>
                          
                          <div className="summary-item">
                            <span>Latest result:</span>
                            <span className={`status-tag ${summary.latestTest.status.toLowerCase()}`}>
                              {summary.latestTest.status}
                            </span>
                          </div>
                          
                          {(summary.totalDefects > 0 || summary.totalAdvisories > 0) && (
                            <>
                              <span className="divider"></span>
                              <div className="summary-item">
                                {summary.totalDefects > 0 && (
                                  <span className="issue-tag">
                                    {summary.totalDefects} defect{summary.totalDefects !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {summary.totalAdvisories > 0 && (
                                  <span className="issue-tag" style={{ marginLeft: summary.totalDefects > 0 ? '5px' : '0' }}>
                                    {summary.totalAdvisories} advisor{summary.totalAdvisories !== 1 ? 'ies' : 'y'}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </ResultsSummary>
                      );
                    })()}
                  </HeaderTitle>
                  <CollapsibleIcon expanded={sectionExpanded}>
                    {sectionExpanded ? 'Hide' : 'Show'} details
                  </CollapsibleIcon>
                </HeaderContent>
              </CollapsibleHeader>
              
              <CollapsibleContent expanded={sectionExpanded} id="mot-results-content">
                {motData.map((mot, index) => (
                  <MotResultCard key={index} show={showResults} index={index}>
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
                          <FadeInContent show={showDefects[index]} delay={0}>
                            {mot.defects && (
                              <>
                                <GovUKCaptionM>Repair immediately (major defects):</GovUKCaptionM>
                                <AnimatedDefectList as={GovUKList} show={showDefects[index]}>
                                  {mot.defects.map((defect, i) => {
                                    const defectKey = `${index}-defect-${i}`;
                                    return (
                                      <li key={i}>
                                        <ValueWithTooltip 
                                          tooltip={`${expandedDefects[defectKey] ? 'Hide' : 'View'} MOT manual reference details`}
                                          placement="top"
                                        >
                                          <ClickableDefectItem
                                            ref={el => defectRefs.current[defectKey] = el}
                                            expanded={expandedDefects[defectKey]}
                                            onClick={toggleExpanded(defectKey)}
                                            aria-expanded={expandedDefects[defectKey] || false}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { // Fixed: Changed from onKeyPress to onKeyDown
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                toggleExpanded(defectKey)(e);
                                              }
                                              if (e.key === 'Escape') {
                                                closeAllDefects();
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
                                        </ValueWithTooltip>
                                      </li>
                                    );
                                  })}
                                </AnimatedDefectList>
                              </>
                            )}
                            {mot.advisories && (
                              <>
                                <GovUKCaptionM>Monitor and repair if necessary (advisories):</GovUKCaptionM>
                                <AnimatedDefectList as={GovUKList} show={showDefects[index]}>
                                  {mot.advisories.map((advisory, i) => {
                                    const advisoryKey = `${index}-advisory-${i}`;
                                    return (
                                      <li key={i}>
                                        <ValueWithTooltip 
                                          tooltip={`${expandedDefects[advisoryKey] ? 'Hide' : 'View'} MOT manual reference details`}
                                          placement="top"
                                        >
                                          <ClickableDefectItem
                                            ref={el => defectRefs.current[advisoryKey] = el}
                                            expanded={expandedDefects[advisoryKey]}
                                            onClick={toggleExpanded(advisoryKey)}
                                            aria-expanded={expandedDefects[advisoryKey] || false}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                toggleExpanded(advisoryKey)(e);
                                              }
                                              if (e.key === 'Escape') {
                                                closeAllDefects();
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
                                        </ValueWithTooltip>
                                      </li>
                                    );
                                  })}
                                </AnimatedDefectList>
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
                          </FadeInContent>
                        )}
                      </GovUKGridColumnTwoThirds>
                    </GovUKGridRow>
                    {index < motData.length - 1 && <GovUKSectionBreak />}
                  </MotResultCard>
                ))}
                
                <FadeInContent show={showResults} delay={motData.length * 150 + 300}>
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
                </FadeInContent>
              </CollapsibleContent>
            </CollapsibleSection>
          </FadeInContent>
        )}
      </GovUKMainWrapper>
    </GovUKContainer>
  );
};

export default MOTHistoryPage;