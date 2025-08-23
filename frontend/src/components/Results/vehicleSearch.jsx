import React, { useState, useRef, useEffect } from 'react';

// Import the MOTHistoryPage and VehicleHeader components
import MOTHistoryPage from './MOTHistoryPage';
import VehicleHeader from '../Header/Results/ResultsHeader';
const VehicleSearch = () => {
  const [registration, setRegistration] = useState('');
  const [searchedRegistration, setSearchedRegistration] = useState('');
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef(null);

  // Scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const validateRegistration = (reg) => {
    // Basic UK registration validation - can be expanded based on requirements
    const regPattern = /^[A-Z0-9]{2,7}$/i;
    
    if (!reg.trim()) {
      return 'Please enter a vehicle registration number';
    }
    
    if (!regPattern.test(reg.trim())) {
      return 'Enter a valid vehicle registration number';
    }
    
    return '';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Format registration: remove spaces and convert to uppercase
    const formattedReg = registration.trim().toUpperCase().replace(/\s+/g, '');
    
    // Validate registration
    const validationError = validateRegistration(formattedReg);
    
    if (validationError) {
      setError(validationError);
      // Set focus to the error summary for accessibility
      const errorSummary = document.querySelector('[role="alert"]');
      if (errorSummary) errorSummary.focus();
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Set the searched registration to trigger the API call in MOTHistoryPage
    setSearchedRegistration(formattedReg);
    setSearchPerformed(true);
  };

  const handleReset = () => {
    setRegistration('');
    setSearchedRegistration('');
    setError('');
    setSearchPerformed(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8" ref={componentRef}>
      {searchPerformed ? (
        <div className="space-y-12 mb-16">
          <button
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer inline-flex items-center gap-2 mb-6 hover:translate-x-1 transition-all duration-300"
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
          >
            <i className="ph ph-arrow-left text-sm text-blue-600"></i>
            Search another vehicle
          </button>
          
          <VehicleHeader registration={searchedRegistration} />
          
          <MOTHistoryPage registration={searchedRegistration} />
        </div>
      ) : (
        <div className={`space-y-12 mb-16 transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Check MOT History</h1>
          </div>
          
          <p className="text-xs text-neutral-700 leading-relaxed mb-4">
            Find information about a vehicle's MOT test history, including test date, expiry date, test location, mileage, and any advisories or failures.
          </p>
          
          {error && (
            <div
              className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm mb-6"
              aria-labelledby="error-summary-title" 
              role="alert" 
              tabIndex={-1}
            >
              <div className="flex items-start gap-3">
                <i className="ph ph-warning-circle text-lg text-red-600 mt-0.5"></i>
                <div>
                  <h2 id="error-summary-title" className="text-sm font-medium text-red-900 mb-2">
                    There is a problem
                  </h2>
                  <ul className="list-none m-0 p-0">
                    <li>
                      <a href="#registration" className="text-xs text-red-700 underline hover:no-underline">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <form onSubmit={handleSearch}>
                <div className={`mb-6 ${error ? 'border-l-4 border-red-500 pl-4' : ''}`}>
                  <label htmlFor="registration" className="block text-base font-semibold text-neutral-800 mb-1">
                    <i className="ph ph-magnifying-glass text-lg text-blue-600 mr-2"></i>
                    Vehicle registration number
                  </label>
                  <div id="registration-hint" className="text-sm text-neutral-500 mb-2">
                    For example, AB12 CDE
                  </div>
                  {error && (
                    <div id="registration-error" className="text-sm text-red-600 font-medium mb-2">
                      <i className="ph ph-warning-circle text-sm text-red-600 mr-1"></i>
                      {error}
                    </div>
                  )}
                  <input
                    id="registration"
                    name="registration"
                    type="text"
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                    aria-describedby={error ? "registration-error registration-hint" : "registration-hint"}
                    className={`w-full px-3 py-2 text-sm rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-lg focus:scale-[1.01] ${
                      error 
                        ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-2 border-neutral-200 focus:border-blue-500 hover:border-neutral-300'
                    }`}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <i className="ph ph-magnifying-glass text-sm"></i>
                  Check vehicle
                  <i className="ph ph-arrow-right text-sm"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSearch;