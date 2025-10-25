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
    const latestTest = data[0];
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
  }, [registration, transformMotData, isCacheValid, completeLoading, closeDefectModal]);

  if (!registration) {
    return null;
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 animate-pulse">Loading MOT history...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
        <i className="ph ph-warning-circle text-red-600 text-xl flex-shrink-0 mt-0.5"></i>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Unable to Load MOT History</h3>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // NO DATA STATE
  if (!motData || motData.length === 0) {
    return (
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <i className="ph ph-info text-blue-600 text-xl flex-shrink-0 mt-0.5"></i>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">No MOT History Available</h3>
          <p className="text-sm text-gray-600">
            No test records were found for registration <span className="font-semibold">{formatRegistration(registration)}</span>.
          </p>
        </div>
      </div>
    );
  }

  const summary = generateSummary(motData);

  // MAIN RENDER
  return (
    <>
    <div className="space-y-8">
      {/* COLLAPSIBLE SUMMARY SECTION */}
      {summary && (
        <div className={`transition-all duration-500 ease-out ${
          showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Header - Always Visible */}
              <button
                onClick={toggleSectionExpanded}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <i className={`ph ${summary.latestTest.status === 'PASS' ? 'ph-check-circle' : 'ph-x-circle'} text-2xl ${
                    summary.latestTest.status === 'PASS' ? 'text-green-600' : 'text-red-600'
                  }`}></i>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-gray-900 mb-0.5">MOT History</h2>
                    <p className="text-sm text-gray-600">
                      {summary.totalTests} test{summary.totalTests !== 1 ? 's' : ''} • Latest: <span className="font-medium">{summary.latestTest.date}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Quick stats badges */}
                  {!sectionExpanded && (
                    <div className="hidden md:flex items-center gap-2">
                      {summary.totalDefects > 0 && (
                        <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          {summary.totalDefects} defect{summary.totalDefects !== 1 ? 's' : ''}
                        </span>
                      )}
                      {summary.totalAdvisories > 0 && (
                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {summary.totalAdvisories} advisor{summary.totalAdvisories !== 1 ? 'ies' : 'y'}
                        </span>
                      )}
                    </div>
                  )}

                  <i className={`ph ph-caret-${sectionExpanded ? 'up' : 'down'} text-xl text-gray-600 transition-transform duration-300`}></i>
                </div>
              </button>

              {/* Expandable Summary Content */}
              {sectionExpanded && (
                <div className="px-6 pb-6 pt-5 space-y-5">
                  <hr className="border-gray-200" />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{summary.passCount}</div>
                      <div className="text-xs text-green-600 font-medium mt-1">Passed</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{summary.failCount}</div>
                      <div className="text-xs text-red-600 font-medium mt-1">Failed</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="text-2xl font-bold text-amber-700">{summary.totalDefects}</div>
                      <div className="text-xs text-amber-600 font-medium mt-1">Defects</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{summary.totalAdvisories}</div>
                      <div className="text-xs text-blue-600 font-medium mt-1">Advisories</div>
                    </div>
                  </div>

                  {/* Latest Test Highlight */}
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Latest Test</h3>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        summary.latestTest.status === 'PASS'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {summary.latestTest.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Date</div>
                        <div className="font-medium text-gray-900">{summary.latestTest.date}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Mileage</div>
                        <div className="font-medium text-gray-900">{summary.latestTest.mileage}</div>
                      </div>
                      {summary.latestTest.expiry && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Expires</div>
                          <div className="font-medium text-gray-900">{summary.latestTest.expiry}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
      )}

      {/* DETAILED MOT HISTORY */}
      {sectionExpanded && (
        <div className={`transition-all duration-700 ease-out ${
          showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-8">
            {/* Section Header */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Complete Test History</h3>
              <p className="text-sm text-gray-600 mt-1">Detailed records of all MOT tests</p>
            </div>

            {/* MOT Test Cards */}
            <div className="space-y-6">
              {motData.map((mot, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ease-out ${
                    showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Individual MOT Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      {/* Header with Date and Status */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{mot.date}</h3>
                          {mot.expiry && (
                            <p className="text-sm text-gray-600">
                              Valid until: <span className="font-medium">{mot.expiry}</span>
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${
                            mot.status === 'PASS'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <i className={`ph ${mot.status === 'PASS' ? 'ph-check-circle' : 'ph-x-circle'}`}></i>
                            {mot.status}
                          </span>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-200">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Mileage</div>
                          <div className="text-base font-medium text-gray-900">{mot.mileage}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Test Location</div>
                          <div className="text-base font-medium text-gray-900">{mot.location}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Test Number</div>
                          <div className="text-sm font-mono text-gray-700">{mot.testNumber}</div>
                        </div>
                      </div>

                      {/* Defects and Advisories */}
                      {(mot.defects || mot.advisories) && (
                        <div className={`transition-all duration-300 ease-out ${
                          showDefects[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}>
                          {mot.defects && (
                            <div className="mb-5">
                              <div className="flex items-center gap-2 mb-3">
                                <i className="ph ph-warning-circle text-amber-600 text-lg"></i>
                                <h4 className="text-sm font-semibold text-gray-900">
                                  Repair immediately ({mot.defects.length} major defect{mot.defects.length !== 1 ? 's' : ''})
                                </h4>
                              </div>
                              <div className="space-y-2">
                                {mot.defects.map((defect, i) => (
                                  <div
                                    key={i}
                                    className={`cursor-pointer transition-all duration-200 ${
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
                                    <div className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-3 transition-colors duration-150">
                                      <div className="flex items-start gap-2">
                                        <i className="ph ph-arrow-square-out text-amber-600 text-sm flex-shrink-0 mt-0.5"></i>
                                        <p className="flex-1 text-sm text-gray-900 leading-relaxed">
                                          {defect.text}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {mot.advisories && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <i className="ph ph-info text-blue-600 text-lg"></i>
                                <h4 className="text-sm font-semibold text-gray-900">
                                  Monitor and repair if necessary ({mot.advisories.length} advisor{mot.advisories.length !== 1 ? 'ies' : 'y'})
                                </h4>
                              </div>
                              <div className="space-y-2">
                                {mot.advisories.map((advisory, i) => (
                                  <div
                                    key={i}
                                    className={`cursor-pointer transition-all duration-200 ${
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
                                    <div className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 transition-colors duration-150">
                                      <div className="flex items-start gap-2">
                                        <i className="ph ph-arrow-square-out text-blue-600 text-sm flex-shrink-0 mt-0.5"></i>
                                        <p className="flex-1 text-sm text-gray-900 leading-relaxed">
                                          {advisory.text}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Info Box */}
                          <details className="mt-5 bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2">
                              <i className="ph ph-info text-blue-600"></i>
                              What are {mot.defects && mot.advisories ? 'defects and advisories' : mot.defects ? 'defects' : 'advisories'}?
                            </summary>
                            <div className="mt-3 space-y-2 text-sm text-gray-700 leading-relaxed">
                              {mot.defects && (
                                <p>
                                  <strong className="text-gray-900">Major defects</strong> may compromise the safety of the vehicle, put other road users at risk, or harm the environment. A vehicle with a major defect will fail the test.
                                </p>
                              )}
                              {mot.advisories && (
                                <p>
                                  <strong className="text-gray-900">Advisories</strong> are given for guidance. Some of these may need to be monitored in case they become more serious and need immediate repairs.
                                </p>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>

            {/* Info Footer */}
            <div
              className={`transition-all duration-500 ease-out ${
                showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${motData.length * 150 + 300}ms` }}
            >
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <i className="ph ph-info text-blue-600 text-xl flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    The MOT test changed on 20 May 2018
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Defects are now categorised according to their severity - dangerous, major, and minor.{' '}
                    <a
                      href="https://www.gov.uk/government/news/mot-changes-20-may-2018"
                      className="font-medium text-blue-600 hover:text-blue-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Find out more →
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    
    {/* Defect Detail Modal - Unchanged functionality */}
    <MotDefectModal 
      selectedDefect={selectedDefect}
      onClose={closeDefectModal}
    />
    </>
  );
};

export default MOTHistoryPage;