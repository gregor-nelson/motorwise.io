import React, { useState, useEffect, useCallback, useRef } from 'react';
import MotDefectModal from './DefectDetail/MotDefectModal';

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
  
  // ORIGINAL STATE - Unchanged
  const [motData, setMotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const abortControllerRef = useRef(null);
  
  // ANIMATION STATE - Added for smooth reveal
  const [showResults, setShowResults] = useState(false);
  const [showDefects, setShowDefects] = useState({});
  // COLLAPSIBLE SECTION STATE
  const [sectionExpanded, setSectionExpanded] = useState(true);

  const CACHE_STALE_TIME = 5 * 60 * 1000;

  // Modal functions
  const openDefectModal = useCallback((defect) => {
    console.log('Opening defect modal with data:', defect);
    setSelectedDefect(defect);
  }, []);

  const closeDefectModal = useCallback(() => {
    setSelectedDefect(null);
  }, []);

  // COLLAPSIBLE SECTION TOGGLE
  const toggleSectionExpanded = useCallback(() => {
    setSectionExpanded(prev => !prev);
  }, []);

  // No longer need click outside logic for inline expansion

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
      closeDefectModal(); // Close modal when loading new data

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
    <>
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className={`transition-all duration-500 ease-out ${
        !loading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-8">
          <i className="ph ph-wrench text-lg text-blue-600 mr-3"></i>
          MOT History
        </h1>
      </div>
      
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-neutral-600 text-sm text-center">
            Loading MOT history for {formatRegistration(registration)}...
          </div>
        </div>
      )}
      
      {!loading && error && (
        <div className={`transition-all duration-500 ease-out ${
          !loading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } mb-8`}>
          <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <i className="ph ph-warning-circle text-lg text-red-600 mt-0.5"></i>
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      {!loading && !error && motData && motData.length === 0 && (
        <div className={`transition-all duration-500 ease-out ${
          !loading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ animationDelay: '100ms' }}>
          <div className="bg-neutral-50 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <i className="ph ph-info text-lg text-blue-600 mt-0.5"></i>
              <p className="text-xs text-neutral-700 leading-relaxed">
                No MOT history found for this vehicle. It may be exempt from MOT testing or too new to require an MOT test.
              </p>
            </div>
          </div>
        </div>
      )}
        
        {!loading && !error && motData && motData.length > 0 && (
          <div className={`transition-all duration-500 ease-out ${
            showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ animationDelay: '200ms' }}>
            <div className="mb-8">
              <button
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-lg hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                onClick={toggleSectionExpanded}
                aria-expanded={sectionExpanded}
                aria-controls="mot-results-content"
              >
                <div className="flex items-center gap-6 flex-wrap text-left">
                  {(() => {
                    const summary = generateSummary(motData);
                    return summary && (
                      <div className="flex items-center gap-6 flex-wrap text-sm">
                        <div className="flex items-center gap-2">
                          <i className="ph ph-check-circle text-lg text-blue-600"></i>
                          <span className="font-semibold text-neutral-900">{summary.totalTests}</span>
                          <span className="text-neutral-600">test{summary.totalTests !== 1 ? 's' : ''}</span>
                        </div>
                        
                        <div className="w-px h-4 bg-neutral-300"></div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-700">Latest result:</span>
                          <span className={`font-semibold ${
                            summary.latestTest.status.toLowerCase() === 'pass' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {summary.latestTest.status}
                          </span>
                        </div>
                        
                        {(summary.totalDefects > 0 || summary.totalAdvisories > 0) && (
                          <>
                            <div className="w-px h-4 bg-neutral-300"></div>
                            <div className="flex items-center gap-3">
                              {summary.totalDefects > 0 && (
                                <span className="text-yellow-600 font-medium text-sm">
                                  <i className="ph ph-warning text-sm mr-1"></i>
                                  {summary.totalDefects} defect{summary.totalDefects !== 1 ? 's' : ''}
                                </span>
                              )}
                              {summary.totalAdvisories > 0 && (
                                <span className="text-blue-600 font-medium text-sm">
                                  <i className="ph ph-info text-sm mr-1"></i>
                                  {summary.totalAdvisories} advisor{summary.totalAdvisories !== 1 ? 'ies' : 'y'}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                  <span>{sectionExpanded ? 'Hide' : 'Show'} details</span>
                  <i className={`ph ph-caret-down transition-transform duration-300 ${
                    sectionExpanded ? 'rotate-180' : 'rotate-0'
                  }`}></i>
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  sectionExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
                }`}
                id="mot-results-content"
              >
                <div className="pt-6">
                  {motData.map((mot, index) => (
                    <div 
                      key={index} 
                      className={`bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 mb-8 ${
                        showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col">
                          <div className="text-xs text-neutral-500 mb-1">Date tested</div>
                          <div className="text-sm font-medium text-neutral-900 mb-3">{mot.date}</div>
                          <div className={`text-lg font-medium mb-4 ${
                            mot.status === 'PASS' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <i className={`ph ${
                              mot.status === 'PASS' ? 'ph-check-circle' : 'ph-x-circle'
                            } text-lg mr-2`}></i>
                            {mot.status}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col">
                              <div className="text-xs text-neutral-500 mb-1">Mileage</div>
                              <div className="text-sm font-medium text-neutral-900 mb-3">{mot.mileage}</div>
                              <div className="text-xs text-neutral-500 mb-1">Test location</div>
                              <div className="text-xs text-neutral-700 leading-relaxed">
                                <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                                  <i className="ph ph-map-pin text-sm mr-1"></i>
                                  {mot.location}
                                </a>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs text-neutral-500 mb-1">MOT test number</div>
                              <div className="text-sm font-medium text-neutral-900 mb-3">{mot.testNumber}</div>
                              {mot.expiry && (
                                <>
                                  <div className="text-xs text-neutral-500 mb-1">Expiry date</div>
                                  <div className="text-sm font-medium text-neutral-900">{mot.expiry}</div>
                                </>
                              )}
                            </div>
                          </div>
                        {(mot.defects || mot.advisories) && (
                          <div className={`mt-6 transition-all duration-300 ease-out ${
                            showDefects[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                          }`}>
                            {mot.defects && (
                              <>
                                <div className="text-xs text-neutral-500 mb-3">
                                  <i className="ph ph-warning-circle text-sm text-red-600 mr-2"></i>
                                  Repair immediately (major defects):
                                </div>
                                <ul className="list-none space-y-2 mb-4">
                                  {mot.defects.map((defect, i) => (
                                    <li key={i}>
                                      <div
                                        className={`cursor-pointer p-3 rounded-lg bg-red-50 hover:bg-red-100 hover:scale-[1.02] transition-all duration-200 ${
                                          showDefects[index] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                                        }`}
                                        style={{ transitionDelay: `${i * 50}ms` }}
                                        onClick={() => openDefectModal(defect)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openDefectModal(defect);
                                          }
                                        }}
                                      >
                                        <div className="flex items-start gap-3">
                                          <i className="ph ph-arrow-square-out text-sm text-red-600 mt-1 flex-shrink-0"></i>
                                          <strong className="text-xs text-red-800 leading-relaxed">{defect.text}</strong>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                            {mot.advisories && (
                              <>
                                <div className="text-xs text-neutral-500 mb-3">
                                  <i className="ph ph-info text-sm text-blue-600 mr-2"></i>
                                  Monitor and repair if necessary (advisories):
                                </div>
                                <ul className="list-none space-y-2 mb-4">
                                  {mot.advisories.map((advisory, i) => (
                                    <li key={i}>
                                      <div
                                        className={`cursor-pointer p-3 rounded-lg bg-blue-50 hover:bg-blue-100 hover:scale-[1.02] transition-all duration-200 ${
                                          showDefects[index] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                                        }`}
                                        style={{ transitionDelay: `${(mot.defects?.length || 0) * 50 + i * 50}ms` }}
                                        onClick={() => openDefectModal(advisory)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openDefectModal(advisory);
                                          }
                                        }}
                                      >
                                        <div className="flex items-start gap-3">
                                          <i className="ph ph-arrow-square-out text-sm text-blue-600 mt-1 flex-shrink-0"></i>
                                          <strong className="text-xs text-blue-800 leading-relaxed">{advisory.text}</strong>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                            <details className="bg-neutral-50 rounded-lg p-4 mt-4">
                              <summary className="cursor-pointer text-xs font-medium text-neutral-800 hover:text-blue-600 transition-colors duration-200">
                                <i className="ph ph-question text-sm mr-2"></i>
                                What are {mot.defects && mot.advisories ? 'defects and advisories' : mot.defects ? 'defects' : 'advisories'}?
                              </summary>
                              <div className="mt-3 space-y-2">
                                {mot.defects && (
                                  <p className="text-xs text-neutral-700 leading-relaxed">
                                    Major defects may compromise the safety of the vehicle, put other road users at risk, or harm the environment. A vehicle with a major defect will fail the test.
                                  </p>
                                )}
                                {mot.advisories && (
                                  <p className="text-xs text-neutral-700 leading-relaxed">
                                    Advisories are given for guidance. Some of these may need to be monitored in case they become more serious and need immediate repairs.
                                  </p>
                                )}
                              </div>
                            </details>
                          </div>
                        )}
                        </div>
                      </div>
                      {index < motData.length - 1 && <hr className="border-none border-t border-neutral-200 mt-6" />}
                    </div>
                  ))}
                
                  <div 
                    className={`transition-all duration-500 ease-out ${
                      showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ animationDelay: `${motData.length * 150 + 300}ms` }}
                  >
                    <div className="bg-neutral-50 rounded-lg p-4 md:p-6 shadow-sm mt-8">
                      <div className="flex items-start gap-3">
                        <i className="ph ph-info text-lg text-blue-600 mt-0.5"></i>
                        <div>
                          <p className="text-xs text-neutral-700 leading-relaxed font-semibold mb-2">
                            The MOT test changed on 20 May 2018
                          </p>
                          <p className="text-xs text-neutral-700 leading-relaxed">
                            Defects are now categorised according to their severity - dangerous, major, and minor.{' '}
                            <a 
                              href="https://www.gov.uk/government/news/mot-changes-20-may-2018" 
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Find out more
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
    </div>
    
    {/* Defect Detail Modal - Using bulletins pattern for reliable positioning */}
    <MotDefectModal 
      selectedDefect={selectedDefect}
      onClose={closeDefectModal}
    />
    </>
  );
};

export default MOTHistoryPage;