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
          <p className="text-sm text-neutral-600 animate-pulse">Loading MOT history...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 shadow-xl transform rotate-1">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i className="ph ph-warning-circle text-2xl text-red-600"></i>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load MOT History</h3>
            <p className="text-sm text-red-700 leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // NO DATA STATE
  if (!motData || motData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-neutral-50 to-stone-50 rounded-2xl p-8 shadow-xl transform -rotate-1">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
              <i className="ph ph-file-x text-2xl text-neutral-600"></i>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">No MOT History Available</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              No test records were found for registration <span className="font-semibold">{formatRegistration(registration)}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const summary = generateSummary(motData);

  // MAIN RENDER
  return (
    <>
    <div className="space-y-8">
      {/* COLLAPSIBLE SUMMARY SECTION - Enhanced Visual Design */}
      {summary && (
        <div className={`transition-all duration-500 ease-out ${
          showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="relative">
            {/* Decorative background blur */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl opacity-30 blur-2xl"></div>
            
            {/* Main summary card */}
            <div className={`relative bg-gradient-to-br from-white to-stone-50 rounded-2xl shadow-2xl border-2 border-stone-200 overflow-hidden transition-all duration-500 ${
              sectionExpanded ? '' : 'hover:shadow-3xl hover:scale-[1.02] transform rotate-1 hover:rotate-0'
            }`}>
              
              {/* Header - Always Visible */}
              <button
                onClick={toggleSectionExpanded}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-stone-50/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 ${
                    summary.latestTest.status === 'PASS' 
                      ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                      : 'bg-gradient-to-br from-red-400 to-rose-500'
                  }`}>
                    <i className={`ph ${summary.latestTest.status === 'PASS' ? 'ph-check-circle' : 'ph-x-circle'} text-3xl text-white`}></i>
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">MOT History</h2>
                    <p className="text-sm text-neutral-600">
                      {summary.totalTests} test{summary.totalTests !== 1 ? 's' : ''} • Latest: <span className="font-semibold">{summary.latestTest.date}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Quick stats badges */}
                  {!sectionExpanded && (
                    <div className="hidden md:flex items-center gap-3">
                      {summary.totalDefects > 0 && (
                        <span className="px-4 py-2 bg-amber-100 text-amber-900 rounded-full text-sm font-semibold shadow-md border-2 border-amber-200">
                          <i className="ph ph-warning text-amber-600 mr-1"></i>
                          {summary.totalDefects} defect{summary.totalDefects !== 1 ? 's' : ''}
                        </span>
                      )}
                      {summary.totalAdvisories > 0 && (
                        <span className="px-4 py-2 bg-sky-100 text-sky-900 rounded-full text-sm font-semibold shadow-md border-2 border-sky-200">
                          <i className="ph ph-info mr-1"></i>
                          {summary.totalAdvisories} advisor{summary.totalAdvisories !== 1 ? 'ies' : 'y'}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <i className={`ph ph-caret-${sectionExpanded ? 'up' : 'down'} text-2xl text-neutral-600 transition-transform duration-300`}></i>
                </div>
              </button>

              {/* Expandable Summary Content */}
              {sectionExpanded && (
                <div className="px-8 pb-8 space-y-6">
                  <hr className="border-stone-200" />
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border-l-4 border-emerald-400 shadow-md">
                      <div className="text-3xl font-bold text-emerald-700">{summary.passCount}</div>
                      <div className="text-xs text-emerald-600 font-medium mt-1">Passed</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border-l-4 border-red-400 shadow-md">
                      <div className="text-3xl font-bold text-red-700">{summary.failCount}</div>
                      <div className="text-xs text-red-600 font-medium mt-1">Failed</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-l-4 border-amber-400 shadow-md">
                      <div className="text-3xl font-bold text-amber-700">{summary.totalDefects}</div>
                      <div className="text-xs text-amber-600 font-medium mt-1">Defects</div>
                    </div>
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border-l-4 border-sky-400 shadow-md">
                      <div className="text-3xl font-bold text-sky-700">{summary.totalAdvisories}</div>
                      <div className="text-xs text-sky-600 font-medium mt-1">Advisories</div>
                    </div>
                  </div>

                  {/* Latest Test Highlight */}
                  <div className="bg-gradient-to-br from-stone-100 to-neutral-100 rounded-xl p-6 shadow-md border-2 border-stone-200">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-base font-bold text-neutral-900">Latest Test</h3>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-lg transform -rotate-2 ${
                        summary.latestTest.status === 'PASS'
                          ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white ring-4 ring-emerald-100'
                          : 'bg-gradient-to-r from-red-400 to-rose-500 text-white ring-4 ring-red-100'
                      }`}>
                        {summary.latestTest.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-neutral-500 mb-1">Date</div>
                        <div className="font-semibold text-neutral-900">{summary.latestTest.date}</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500 mb-1">Mileage</div>
                        <div className="font-semibold text-neutral-900">{summary.latestTest.mileage}</div>
                      </div>
                      {summary.latestTest.expiry && (
                        <div>
                          <div className="text-xs text-neutral-500 mb-1">Expires</div>
                          <div className="font-semibold text-neutral-900">{summary.latestTest.expiry}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED MOT HISTORY - Enhanced Card Design */}
      {sectionExpanded && (
        <div className={`transition-all duration-700 ease-out ${
          showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-8">
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
              <h3 className="text-lg font-bold text-neutral-700 px-4">Complete Test History</h3>
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
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
                  {/* Individual MOT Card with Enhanced Design */}
                  <div className={`relative bg-gradient-to-br from-white to-stone-50 rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${
                    index % 3 === 0 ? 'transform rotate-1 hover:rotate-0' : 
                    index % 3 === 1 ? 'transform -rotate-1 hover:rotate-0' : 
                    'transform rotate-0.5 hover:rotate-0'
                  } ${
                    mot.status === 'PASS' ? 'border-emerald-200' : 'border-red-200'
                  }`}>
                    
                    {/* Decorative corner accent */}
                    <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 rounded-full opacity-10 ${
                      mot.status === 'PASS' ? 'bg-emerald-400' : 'bg-red-400'
                    }`}></div>

                    <div className="relative p-8">
                      {/* Header with Date and Status */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-neutral-900 mb-2">{mot.date}</h3>
                          {mot.expiry && (
                            <p className="text-sm text-neutral-600">
                              Valid until: <span className="font-semibold">{mot.expiry}</span>
                            </p>
                          )}
                        </div>
                        
                        {/* Status Badge - Large and Prominent */}
                        <div className="flex-shrink-0">
                          <div className={`relative px-6 py-3 rounded-xl text-base font-bold shadow-xl transform -rotate-3 transition-transform hover:rotate-0 ${
                            mot.status === 'PASS'
                              ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white ring-4 ring-emerald-100'
                              : 'bg-gradient-to-r from-red-400 to-rose-500 text-white ring-4 ring-red-100'
                          }`}>
                            <i className={`ph ${mot.status === 'PASS' ? 'ph-check-circle' : 'ph-x-circle'} mr-2`}></i>
                            {mot.status}
                          </div>
                        </div>
                      </div>

                      {/* Info Grid - Enhanced Spacing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-neutral-500 mb-1.5 font-medium uppercase tracking-wide">Mileage</div>
                            <div className="text-lg font-bold text-neutral-900">{mot.mileage}</div>
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500 mb-1.5 font-medium uppercase tracking-wide">Test Location</div>
                            <a href="#" className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors shadow-sm border border-blue-200">
                              <i className="ph ph-map-pin text-base"></i>
                              {mot.location}
                            </a>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-neutral-500 mb-1.5 font-medium uppercase tracking-wide">Test Number</div>
                            <div className="text-sm font-mono text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-lg inline-block">
                              {mot.testNumber}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Defects and Advisories - Enhanced Design */}
                      {(mot.defects || mot.advisories) && (
                        <div className={`transition-all duration-300 ease-out ${
                          showDefects[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}>
                          <hr className="border-stone-200 mb-6" />
                          
                          {mot.defects && (
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                  <i className="ph ph-warning-circle text-lg text-amber-600"></i>
                                </div>
                                <h4 className="text-sm font-bold text-neutral-900">
                                  Repair immediately ({mot.defects.length} major defect{mot.defects.length !== 1 ? 's' : ''})
                                </h4>
                              </div>
                              <div className="space-y-3">
                                {mot.defects.map((defect, i) => (
                                  <div
                                    key={i}
                                    className={`group cursor-pointer transition-all duration-200 ${
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
                                    <div className="relative bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border-2 border-amber-200 hover:border-amber-300 rounded-xl p-4 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                          <i className="ph ph-arrow-square-out text-sm text-amber-700"></i>
                                        </div>
                                        <p className="flex-1 text-sm font-semibold text-amber-900 leading-relaxed">
                                          {defect.text}
                                        </p>
                                      </div>
                                      {/* Hover indicator */}
                                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="ph ph-arrow-right text-amber-600"></i>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {mot.advisories && (
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                                  <i className="ph ph-info text-lg text-sky-600"></i>
                                </div>
                                <h4 className="text-sm font-bold text-neutral-900">
                                  Monitor and repair if necessary ({mot.advisories.length} advisor{mot.advisories.length !== 1 ? 'ies' : 'y'})
                                </h4>
                              </div>
                              <div className="space-y-3">
                                {mot.advisories.map((advisory, i) => (
                                  <div
                                    key={i}
                                    className={`group cursor-pointer transition-all duration-200 ${
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
                                    <div className="relative bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 border-2 border-sky-200 hover:border-sky-300 rounded-xl p-4 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-sky-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                          <i className="ph ph-arrow-square-out text-sm text-sky-700"></i>
                                        </div>
                                        <p className="flex-1 text-sm font-semibold text-sky-900 leading-relaxed">
                                          {advisory.text}
                                        </p>
                                      </div>
                                      {/* Hover indicator */}
                                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="ph ph-arrow-right text-sky-600"></i>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Info Box - Enhanced Design */}
                          <details className="mt-6 bg-gradient-to-br from-stone-100 to-neutral-100 rounded-xl p-5 shadow-md border-2 border-stone-200">
                            <summary className="cursor-pointer text-sm font-bold text-neutral-800 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2">
                              <i className="ph ph-question text-base"></i>
                              What are {mot.defects && mot.advisories ? 'defects and advisories' : mot.defects ? 'defects' : 'advisories'}?
                            </summary>
                            <div className="mt-4 space-y-3 pl-6">
                              {mot.defects && (
                                <p className="text-sm text-neutral-700 leading-relaxed">
                                  <strong className="text-amber-700">Major defects</strong> may compromise the safety of the vehicle, put other road users at risk, or harm the environment. A vehicle with a major defect will fail the test.
                                </p>
                              )}
                              {mot.advisories && (
                                <p className="text-sm text-neutral-700 leading-relaxed">
                                  <strong className="text-sky-700">Advisories</strong> are given for guidance. Some of these may need to be monitored in case they become more serious and need immediate repairs.
                                </p>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Footer - Enhanced Design */}
            <div 
              className={`transition-all duration-500 ease-out ${
                showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${motData.length * 150 + 300}ms` }}
            >
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200 transform -rotate-1">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ph ph-info text-xl text-blue-600"></i>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 font-bold mb-2">
                      The MOT test changed on 20 May 2018
                    </p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Defects are now categorised according to their severity - dangerous, major, and minor.{' '}
                      <a 
                        href="https://www.gov.uk/government/news/mot-changes-20-may-2018" 
                        className="font-semibold text-blue-700 hover:text-blue-900 underline hover:no-underline transition-all"
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
