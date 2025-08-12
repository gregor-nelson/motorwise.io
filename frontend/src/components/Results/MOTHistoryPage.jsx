import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MarketDashContainer,
  PageTitle,
  SectionTitle,
  SubTitle,
  BodyText,
  SmallText,
  MonoText,
  Link,
  ResultsSection,
  GridContainer,
  GridColumn,
  FlexRow,
  FlexColumn,
  MotResultCard,
  CollapsibleSection,
  CollapsibleHeader,
  CollapsibleIcon,
  CollapsibleContent,
  ResultsSummary,
  VehicleRegistration,
  DefectLabel,
  DefectList,
  AnimatedDefectList,
  ClickableDefectItem,
  FadeInContent,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorText,
  InsetText,
  SectionBreak,
  Details,
  DetailsSummary,
  DetailsText,
} from './ResultsStyles';
import MotDefectDetail from './MotDefectDetail';
import Alert from '@mui/material/Alert';

// Simple tooltip implementation to maintain functionality
const useTooltip = () => ({ withTooltip: (component) => component });
const ValueWithTooltip = ({ children, tooltip, placement }) => children;

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
    <MarketDashContainer>
      <FadeInContent show={!loading} delay={0}>
        <PageTitle>MOT History</PageTitle>
      </FadeInContent>
      
      {loading && (
        <LoadingContainer>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <VehicleRegistration>
              {formatRegistration(registration)}
            </VehicleRegistration>
          </div>
          <LoadingSpinner />
          <LoadingText>Loading MOT history...</LoadingText>
        </LoadingContainer>
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
          <InsetText>
            <BodyText>No MOT history found for this vehicle. It may be exempt from MOT testing or too new to require an MOT test.</BodyText>
          </InsetText>
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
                              <span className="issue-tag">
                                {summary.totalAdvisories} advisor{summary.totalAdvisories !== 1 ? 'ies' : 'y'}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </ResultsSummary>
                  );
                })()}
                <CollapsibleIcon expanded={sectionExpanded}>
                  {sectionExpanded ? 'Hide' : 'Show'} details
                </CollapsibleIcon>
              </CollapsibleHeader>
              
              <CollapsibleContent expanded={sectionExpanded} id="mot-results-content">
                {motData.map((mot, index) => (
                  <MotResultCard key={index} show={showResults} index={index}>
                    <GridContainer>
                      <GridColumn>
                        <SmallText>Date tested</SmallText>
                        <SubTitle>{mot.date}</SubTitle>
                        <SectionTitle style={{
                          color: mot.status === 'PASS' ? 'var(--positive)' : 'var(--negative)'
                        }}>{mot.status}</SectionTitle>
                      </GridColumn>
                      <GridColumn style={{ flex: 2 }}>
                        <GridContainer>
                          <GridColumn>
                            <SmallText>Mileage</SmallText>
                            <SubTitle>{mot.mileage}</SubTitle>
                            <SmallText>Test location</SmallText>
                            <BodyText>
                              <Link href="#">{mot.location}</Link>
                            </BodyText>
                          </GridColumn>
                          <GridColumn>
                            <SmallText>MOT test number</SmallText>
                            <SubTitle>{mot.testNumber}</SubTitle>
                            {mot.expiry && (
                              <>
                                <SmallText>Expiry date</SmallText>
                                <SubTitle>{mot.expiry}</SubTitle>
                              </>
                            )}
                          </GridColumn>
                        </GridContainer>
                        {(mot.defects || mot.advisories) && (
                          <FadeInContent show={showDefects[index]} delay={0}>
                            {mot.defects && (
                              <>
                                <SmallText>Repair immediately (major defects):</SmallText>
                                <AnimatedDefectList as={DefectList} show={showDefects[index]}>
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
                                <SmallText>Monitor and repair if necessary (advisories):</SmallText>
                                <AnimatedDefectList as={DefectList} show={showDefects[index]}>
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
                            <Details>
                              <DetailsSummary>
                                What are {mot.defects && mot.advisories ? 'defects and advisories' : mot.defects ? 'defects' : 'advisories'}?
                              </DetailsSummary>
                              <DetailsText>
                                {mot.defects && (
                                  <BodyText>
                                    Major defects may compromise the safety of the vehicle, put other road users at risk, or harm the environment. A vehicle with a major defect will fail the test.
                                  </BodyText>
                                )}
                                {mot.advisories && (
                                  <BodyText>
                                    Advisories are given for guidance. Some of these may need to be monitored in case they become more serious and need immediate repairs.
                                  </BodyText>
                                )}
                              </DetailsText>
                            </Details>
                          </FadeInContent>
                        )}
                      </GridColumn>
                    </GridContainer>
                    {index < motData.length - 1 && <SectionBreak />}
                  </MotResultCard>
                ))}
                
                <FadeInContent show={showResults} delay={motData.length * 150 + 300}>
                  <InsetText>
                    <BodyText style={{ fontWeight: '600' }}>
                      The MOT test changed on 20 May 2018
                    </BodyText>
                    <BodyText>
                      Defects are now categorised according to their severity - dangerous, major, and minor.{' '}
                      <Link href="https://www.gov.uk/government/news/mot-changes-20-may-2018">
                        Find out more
                      </Link>
                    </BodyText>
                  </InsetText>
                </FadeInContent>
              </CollapsibleContent>
            </CollapsibleSection>
          </FadeInContent>
        )}
    </MarketDashContainer>
  );
};

export default MOTHistoryPage;