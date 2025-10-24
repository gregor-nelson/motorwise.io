import React, { useState, useEffect, memo, useCallback } from 'react';

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const API_BASE_URL = isDevelopment
                    ? 'http://localhost:8004/api'   // Development - direct to API port
                    : '/api';                       // Production - use relative URL for Nginx proxy

// Create a cache outside the component to persist across renders of the *same component instance*
const vehicleDataCache = new Map();

const DVLAVehicleDataComponent = ({ registration }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!registration) return;

      // **Cache Check:** Look in the cache first
      if (vehicleDataCache.has(registration)) {
        console.log(`Serving data from cache for registration: ${registration}`); // For debugging
        setVehicleData(vehicleDataCache.get(registration));
        setLoading(false); // Still need to set loading to false
        return; // Exit early, no API call needed
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch vehicle data from FastAPI backend
        const response = await fetch(`${API_BASE_URL}/vehicle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ registrationNumber: registration }),
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin'
        });

        // Get response data
        const responseData = await response.json();

        if (!response.ok) {
          // Extract error message from the new error format
          let errorMessage = 'Failed to fetch DVLA data';

          if (responseData.message) {
            // New API format with status/message structure
            errorMessage = responseData.message;
          } else if (responseData.detail) {
            // Old format or fallback
            errorMessage = responseData.detail;
          } else if (responseData.errors && responseData.errors.length > 0) {
            // Handle array of errors format
            errorMessage = responseData.errors[0].detail || 'Unknown error';
          }

          throw new Error(errorMessage);
        }

        // **Cache Update:** Store the fetched data in the cache
        vehicleDataCache.set(registration, responseData);
        console.log(`Data fetched and cached for registration: ${registration}`); // For debugging
        setVehicleData(responseData);

      } catch (err) {
        console.error('Error fetching DVLA data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [registration]);

  // Helper function to format dates - memoized with useCallback
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
      return dateString;
    }
  }, []); // Empty dependency array as it doesn't depend on component state

  // Helper to manage missing data - memoized with useCallback
  const formatData = useCallback((value, suffix = '') => {
    if (value === undefined || value === null) return 'Not available';
    return `${value}${suffix}`;
  }, []);

  // Helper function to get status badge styles
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'valid':
      case 'taxed':
      case 'no action required':
        return 'px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-full font-medium';
      case 'expired':
      case 'sorn':
      case 'untaxed':
        return 'px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-full font-medium';
      case 'due soon':
      case 'advisory':
        return 'px-3 py-1.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium';
      case 'exported':
        return 'px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium';
      case 'domestic':
        return 'px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs rounded-full font-medium';
      case 'autonomous':
        return 'px-3 py-1.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium';
      case 'manual':
        return 'px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs rounded-full font-medium';
      default:
        return 'px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs rounded-full font-medium';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex justify-center items-center min-h-[200px] flex-col gap-4">
          <div className="w-6 h-6 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-sm text-neutral-600 text-center">Retrieving DVLA vehicle information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-center p-8">
          <div className="flex items-center justify-center gap-2 text-lg font-semibold text-neutral-900 mb-2">
            <i className="ph ph-warning-circle text-lg text-red-600"></i>
            DVLA Data Unavailable
          </div>
          <div className="text-sm text-red-600 leading-relaxed">{error}</div>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Vehicle Information Section */}
      <div className="group relative bg-white rounded-2xl p-6 md:p-8 mb-8">
        <div className="relative flex items-center mb-6">
          <div className="relative w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center transition-all duration-200">
            <i className="ph ph-car text-2xl text-neutral-700 transition-colors duration-200"></i>
          </div>
          <h2 className="text-2xl font-medium text-neutral-900 leading-tight tracking-tight ml-4 font-jost">Vehicle Information</h2>
        </div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Make</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.make)}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Colour</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.colour)}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Fuel Type</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.fuelType)}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Engine Size</div>
            <div className="text-base font-medium text-neutral-900">{vehicleData.engineCapacity ? `${vehicleData.engineCapacity}cc` : 'Not available'}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Date Registered</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.monthOfFirstRegistration)}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Manufacture Date</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.yearOfManufacture)}</div>
          </div>
        </div>
      </div>

      {/* Legal Status Section */}
      <div className="group relative bg-white rounded-2xl p-6 md:p-8 mb-8">
        <div className="relative flex items-center mb-6">
          <div className="relative w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center transition-all duration-200">
            <i className="ph ph-shield-check text-2xl text-neutral-700 transition-colors duration-200"></i>
          </div>
          <h2 className="text-2xl font-medium text-neutral-900 leading-tight tracking-tight ml-4 font-jost">Legal Status</h2>
        </div>

        {/* Warning/Info Boxes */}
        {(vehicleData.taxStatus?.toLowerCase() === 'untaxed' || vehicleData.taxStatus?.toLowerCase() === 'expired' ||
          vehicleData.motStatus?.toLowerCase() === 'expired') && (
          <div className="relative flex items-start gap-3 p-4 bg-red-50 rounded-xl mb-6">
            <i className="ph ph-warning-circle text-red-600 text-xl mt-0.5"></i>
            <div className="text-sm">
              <p className="font-medium text-red-900 mb-1">Action Required</p>
              <p className="text-red-700">
                {vehicleData.taxStatus?.toLowerCase() === 'untaxed' || vehicleData.taxStatus?.toLowerCase() === 'expired'
                  ? 'Vehicle tax has expired. ' : ''}
                {vehicleData.motStatus?.toLowerCase() === 'expired'
                  ? 'MOT has expired.' : ''}
              </p>
            </div>
          </div>
        )}

        {(vehicleData.taxStatus?.toLowerCase() === 'sorn') && (
          <div className="relative flex items-start gap-3 p-4 bg-amber-50 rounded-xl mb-6">
            <i className="ph ph-info text-amber-600 text-xl mt-0.5"></i>
            <div className="text-sm">
              <p className="font-medium text-amber-900 mb-1">SORN Status</p>
              <p className="text-amber-700">This vehicle is registered as off the road (SORN).</p>
            </div>
          </div>
        )}

        {(vehicleData.taxStatus?.toLowerCase() === 'valid' || vehicleData.taxStatus?.toLowerCase() === 'taxed') &&
         vehicleData.motStatus?.toLowerCase() === 'valid' && (
          <div className="relative flex items-start gap-3 p-4 bg-green-50 rounded-xl mb-6">
            <i className="ph ph-check-circle text-green-600 text-xl mt-0.5"></i>
            <div className="text-sm">
              <p className="font-medium text-green-900 mb-1">All Clear</p>
              <p className="text-green-700">Vehicle tax and MOT are both valid.</p>
            </div>
          </div>
        )}

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">Tax Status</div>
            <span className={getStatusStyles(vehicleData.taxStatus)}>
              {formatData(vehicleData.taxStatus)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Tax Due Date</div>
            <div className="text-base font-medium text-neutral-900 flex items-center gap-2">
              <i className="ph ph-calendar text-blue-600"></i>
              {vehicleData.taxDueDate ? formatDate(vehicleData.taxDueDate) : 'Not available'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">MOT Status</div>
            <span className={getStatusStyles(vehicleData.motStatus)}>
              {formatData(vehicleData.motStatus)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">MOT Expiry Date</div>
            <div className="text-base font-medium text-neutral-900 flex items-center gap-2">
              <i className="ph ph-calendar text-blue-600"></i>
              {vehicleData.motExpiryDate ? formatDate(vehicleData.motExpiryDate) : 'Not available'}
            </div>
          </div>
        </div>
      </div>

      {/* Registration & Documentation Section */}
      <div className="group relative bg-white rounded-2xl p-6 md:p-8 mb-8">
        <div className="relative flex items-center mb-6">
          <div className="relative w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center transition-all duration-200">
            <i className="ph ph-clipboard-text text-2xl text-neutral-700 transition-colors duration-200"></i>
          </div>
          <h2 className="text-2xl font-medium text-neutral-900 leading-tight tracking-tight ml-4 font-jost">Registration & Documentation</h2>
        </div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">Marked For Export</div>
            <span className={getStatusStyles(vehicleData.markedForExport ? 'exported' : 'domestic')}>
              {vehicleData.markedForExport !== undefined ? (vehicleData.markedForExport ? 'Yes' : 'No') : 'Not available'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Last V5C Issued</div>
            <div className="text-base font-medium text-neutral-900 flex items-center gap-2">
              <i className="ph ph-file-text text-purple-600"></i>
              {vehicleData.dateOfLastV5CIssued ? formatDate(vehicleData.dateOfLastV5CIssued) : 'Not available'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">First DVLA Registration</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.monthOfFirstDvlaRegistration)}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">Automated Vehicle</div>
            <span className={getStatusStyles(vehicleData.automatedVehicle ? 'autonomous' : 'manual')}>
              {vehicleData.automatedVehicle !== undefined ? (vehicleData.automatedVehicle ? 'Yes' : 'No') : 'Not available'}
            </span>
          </div>
        </div>
      </div>

      {/* Environmental & Technical Data Section */}
      <div className="group relative bg-white rounded-2xl p-6 md:p-8 mb-8">
        <div className="relative flex items-center mb-6">
          <div className="relative w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center transition-all duration-200">
            <i className="ph ph-leaf text-2xl text-neutral-700 transition-colors duration-200"></i>
          </div>
          <h2 className="text-2xl font-medium text-neutral-900 leading-tight tracking-tight ml-4 font-jost">Environmental & Technical Data</h2>
        </div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">CO₂ Emissions</div>
            <div className="text-base font-medium text-neutral-900 flex items-center gap-2">
              <i className="ph ph-cloud text-green-600"></i>
              {vehicleData.co2Emissions ? `${vehicleData.co2Emissions}g/km` : 'Not available'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Euro Status</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.euroStatus)}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Real Driving Emissions</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.realDrivingEmissions)}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Type Approval</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.typeApproval)}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Wheel Plan</div>
            <div className="text-base font-medium text-neutral-900">{formatData(vehicleData.wheelplan)}</div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 transition-all duration-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Revenue Weight</div>
            <div className="text-base font-medium text-neutral-900 flex items-center gap-2">
              <i className="ph ph-scales text-green-600"></i>
              {vehicleData.revenueWeight ? `${vehicleData.revenueWeight}kg` : 'Not available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DVLAVehicleData = memo(DVLAVehicleDataComponent); // Wrap the component with React.memo

export default DVLAVehicleData;