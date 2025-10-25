import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

// Import your results components for when search is performed
import MOTHistoryPage from '../../../../components/Results/MOTHistoryPage';
import VehicleHeader from '../../../../components/Header/Results/ResultsHeader';

const Hero = () => {
  // Search state
  const [searchType, setSearchType] = useState('REG'); // 'REG' or 'VIN'
  const [inputValue, setInputValue] = useState('');
  const [searchedRegistration, setSearchedRegistration] = useState('');
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Coordinated loading state
  const [vehicleHeaderLoaded, setVehicleHeaderLoaded] = useState(false);
  const [motHistoryLoaded, setMotHistoryLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  // Animation refs
  const decorativeRef = useRef(null);
  const checklistRef = useRef(null);
  const mockupRef = useRef(null);

  useEffect(() => {
    // Animate decorative floating circles
    if (decorativeRef.current?.children) {
      animate(Array.from(decorativeRef.current.children), {
        translateY: [-8, 8],
        duration: 3000,
        ease: 'inOutSine',
        alternate: true,
        loop: true,
        delay: stagger(400)
      });
    }

    // Animate checklist items
    const checkItems = checklistRef.current?.querySelectorAll('[data-check-item]');
    if (checkItems) {
      animate(Array.from(checkItems), {
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 600,
        ease: 'outQuad',
        delay: stagger(80, { start: 400 })
      });
    }

    // Animate mockup with subtle scale and fade
    if (mockupRef.current) {
      animate(mockupRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 800,
        ease: 'outQuad',
        delay: 200
      });
    }
  }, []);

  const validateInput = (value) => {
    const regPattern = /^[A-Z0-9]{2,7}$/i;
    
    if (!value.trim()) {
      return 'Please enter a vehicle registration number';
    }
    
    if (!regPattern.test(value.trim())) {
      return 'Enter a valid vehicle registration number';
    }
    
    return '';
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const formattedValue = inputValue.trim().toUpperCase().replace(/\s+/g, '');
    const validationError = validateInput(formattedValue);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    // Reset loading states for new search
    setVehicleHeaderLoaded(false);
    setMotHistoryLoaded(false);
    setLoadingError(null);
    setSearchedRegistration(formattedValue);
    setSearchPerformed(true);
  };

  const handleReset = () => {
    setInputValue('');
    setSearchedRegistration('');
    setError('');
    setSearchPerformed(false);
    setVehicleHeaderLoaded(false);
    setMotHistoryLoaded(false);
    setLoadingError(null);
  };

  // Callbacks for component loading completion
  const handleVehicleHeaderLoadComplete = () => {
    setVehicleHeaderLoaded(true);
  };

  const handleMotHistoryLoadComplete = () => {
    setMotHistoryLoaded(true);
  };

  const handleLoadError = (errorMessage) => {
    setLoadingError(errorMessage);
  };

  // If search has been performed, show results
  if (searchPerformed) {
    const bothLoaded = vehicleHeaderLoaded && motHistoryLoaded;
    const isLoading = !bothLoaded && !loadingError;

    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-12 mb-16">
          <button
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer inline-flex items-center gap-2 mb-6 hover:translate-x-1 transition-all duration-300"
            onClick={handleReset}
          >
            <i className="ph ph-arrow-left text-sm text-blue-600"></i>
            Search another vehicle
          </button>

          {/* Unified Loading Spinner */}
          {isLoading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600">Loading vehicle information...</p>
              </div>
            </div>
          )}

          {/* Components render in background, hidden until both loaded */}
          <div className={`transition-opacity duration-500 ${bothLoaded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            <VehicleHeader
              registration={searchedRegistration}
              onLoadingComplete={handleVehicleHeaderLoadComplete}
              onError={handleLoadError}
            />
            <MOTHistoryPage
              registration={searchedRegistration}
              onLoadingComplete={handleMotHistoryLoadComplete}
              onError={handleLoadError}
            />
          </div>

          {/* Error state */}
          {loadingError && !isLoading && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <i className="ph ph-warning-circle text-red-600 text-xl flex-shrink-0 mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Unable to Load Vehicle Data</h3>
                <p className="text-sm text-gray-600">{loadingError}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main hero view
  return (
    <section className="relative bg-gradient-to-br from-cyan-50 to-blue-50 min-h-[85vh] flex items-center justify-center py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Decorative floating circles */}
      <div ref={decorativeRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 right-10 w-3 h-3 bg-blue-300 rounded-full opacity-30"></div>
        <div className="absolute top-32 right-32 w-2 h-2 bg-cyan-400 rounded-full opacity-25"></div>
        <div className="absolute bottom-32 left-12 w-2.5 h-2.5 bg-blue-400 rounded-full opacity-35"></div>
        <div className="absolute top-40 left-20 w-2 h-2 bg-cyan-300 rounded-full opacity-20"></div>
        <div className="absolute bottom-40 right-16 w-3 h-3 bg-blue-200 rounded-full opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Main Headline */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-4">
                Trust data, not words. <span className="text-neutral-700">Check any car's history in seconds</span>
              </h1>
              <p className="text-base md:text-lg text-neutral-700 leading-relaxed">
                Buying used? We scan 900+ global databases to help you avoid bad deals & <span className="font-semibold">decide if the car is truly right for you.</span>
              </p>
            </div>

            {/* Search Input Section */}
            <div className="space-y-4">
              {/* REG/VIN Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchType('REG')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    searchType === 'REG'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  REG
                </button>
                <button
                  onClick={() => setSearchType('VIN')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    searchType === 'VIN'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  VIN
                </button>
              </div>

              {/* Search Input */}
              <form onSubmit={handleSearch}>
                <div className="flex gap-0 bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent focus-within:border-blue-500 transition-all duration-200">
                  {/* UK Flag Icon */}
                  <div className="flex items-center justify-center px-4 bg-blue-600 text-white">
                    <span className="text-2xl">🇬🇧</span>
                  </div>
                  
                  {/* Input Field */}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter Reg"
                    className="flex-1 px-4 py-4 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none"
                    aria-label="Vehicle registration number"
                  />
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="px-6 md:px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-semibold transition-all duration-200 hover:scale-105"
                  >
                    Check vehicle
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <i className="ph ph-warning-circle"></i>
                    {error}
                  </div>
                )}
              </form>

              {/* VIN Link */}
              <button
                onClick={() => setSearchType('VIN')}
                className="text-sm text-neutral-700 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              >
                I don't have a VIN <i className="ph ph-arrow-right text-xs"></i>
              </button>
            </div>

            {/* Vehicle Type Icons */}
            <div>
              <p className="text-sm text-neutral-600 mb-3">We check:</p>
              <div className="flex gap-4 text-neutral-700">
                <i className="ph ph-car text-3xl" title="Cars"></i>
                <i className="ph ph-motorcycle text-3xl" title="Motorcycles"></i>
                <i className="ph ph-truck text-3xl" title="Trucks"></i>
                <i className="ph ph-bus text-3xl" title="RVs"></i>
              </div>
            </div>

            {/* Feature Checklist */}
            <div ref={checklistRef} className="space-y-2">
              <p className="text-sm font-semibold text-neutral-800 mb-3">A carVertical report can uncover:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Recorded images</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Damage</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Theft records</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Mileage rollbacks</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Specs & equipment</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Emission taxes</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Market value</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Safety</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Financial restrictions</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>Natural disaster exposure</span>
                </div>
                <div data-check-item className="flex items-center gap-2 text-sm text-neutral-700">
                  <i className="ph ph-check-circle text-green-600"></i>
                  <span>and more...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Mockup Visual */}
          <div ref={mockupRef} className="hidden lg:block">
            <div className="relative">
              {/* Mockup Container - Replace this with your actual mockup image/component */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                {/* Report Card Mockup */}
                <div className="space-y-4">
                  {/* Header with warnings */}
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <i className="ph ph-warning text-yellow-600 text-xl"></i>
                    <div className="text-xs">
                      <p className="font-semibold text-yellow-900">This vehicle may have a fake mileage!</p>
                      <p className="text-yellow-700 mt-1">The last known mileage is 137,000 mi</p>
                      <p className="text-yellow-700">3 mileage records found</p>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <i className="ph ph-calendar text-sm"></i>
                      <span className="font-medium">Timeline</span>
                    </div>
                    <div className="bg-neutral-50 rounded p-3 text-xs text-neutral-500">
                      <div className="flex justify-between mb-1">
                        <span>2006-01</span>
                        <span>2025</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <i className="ph ph-circle-fill text-red-500 text-xs"></i>
                          <span>Outlier</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="ph ph-circle-fill text-yellow-500 text-xs"></i>
                          <span>Damage?</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mileage Chart Placeholder */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <i className="ph ph-chart-line text-sm"></i>
                      <span className="font-medium">Mileage</span>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded p-4 h-40 flex items-end justify-between gap-1">
                      {/* Simplified bar chart representation */}
                      {[40, 55, 70, 85, 75, 90, 65, 95].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                      {/* Warning indicator */}
                      <div className="absolute top-4 right-4 bg-yellow-400 rounded-full p-2">
                        <i className="ph ph-warning text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>100k mi</span>
                      <span>150k mi</span>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      ✓ Leg
                    </span>
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                      Unknown
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-lg opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
