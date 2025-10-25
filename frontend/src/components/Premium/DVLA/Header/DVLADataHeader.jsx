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
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-8 gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">DVLA Vehicle Data</h1>
            <p className="text-sm text-gray-600 mt-1">
              Official DVLA records for this vehicle
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3 lg:min-w-[320px]">
            <i className="ph ph-info text-blue-500 text-xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Verification</h3>
              <p className="text-sm text-gray-600 mt-1">
                Verify this information matches the seller's claims and the V5C logbook.
              </p>
            </div>
          </div>
        </div>

        {/* Warning/Info Boxes */}
        {(vehicleData.taxStatus?.toLowerCase() === 'untaxed' || vehicleData.taxStatus?.toLowerCase() === 'expired' ||
          vehicleData.motStatus?.toLowerCase() === 'expired') && (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg mb-6">
            <i className="ph ph-warning-circle text-red-600 text-xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Action Required</h3>
              <p className="text-sm text-gray-600 mt-1">
                {vehicleData.taxStatus?.toLowerCase() === 'untaxed' || vehicleData.taxStatus?.toLowerCase() === 'expired'
                  ? 'Vehicle tax has expired. ' : ''}
                {vehicleData.motStatus?.toLowerCase() === 'expired'
                  ? 'MOT has expired.' : ''}
              </p>
            </div>
          </div>
        )}

        {(vehicleData.taxStatus?.toLowerCase() === 'sorn') && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg mb-6">
            <i className="ph ph-info text-amber-600 text-xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">SORN Status</h3>
              <p className="text-sm text-gray-600 mt-1">
                This vehicle is registered as off the road (SORN).
              </p>
            </div>
          </div>
        )}

        {(vehicleData.taxStatus?.toLowerCase() === 'valid' || vehicleData.taxStatus?.toLowerCase() === 'taxed') &&
         vehicleData.motStatus?.toLowerCase() === 'valid' && (
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg mb-6">
            <i className="ph ph-check-circle text-green-600 text-xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">All Clear</h3>
              <p className="text-sm text-gray-600 mt-1">
                Vehicle tax and MOT are both valid.
              </p>
            </div>
          </div>
        )}

        {/* Vehicle Information Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Vehicle identification and specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Make */}
            <div className="flex items-start gap-3">
              <i className="ph ph-car text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Make</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.make)}</p>
              </div>
            </div>

            {/* Colour */}
            <div className="flex items-start gap-3">
              <i className="ph ph-palette text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Colour</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.colour)}</p>
              </div>
            </div>

            {/* Fuel Type */}
            <div className="flex items-start gap-3">
              <i className="ph ph-gas-pump text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Fuel type</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.fuelType)}</p>
              </div>
            </div>

            {/* Engine Size */}
            <div className="flex items-start gap-3">
              <i className="ph ph-engine text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Engine capacity</p>
                <p className="text-base font-medium text-gray-900">{vehicleData.engineCapacity ? `${vehicleData.engineCapacity}cc` : 'Not available'}</p>
              </div>
            </div>

            {/* Date Registered */}
            <div className="flex items-start gap-3">
              <i className="ph ph-calendar text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Date registered</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.monthOfFirstRegistration)}</p>
              </div>
            </div>

            {/* Manufacture Date */}
            <div className="flex items-start gap-3">
              <i className="ph ph-calendar-check text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Year of manufacture</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.yearOfManufacture)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Status Section */}
        <div className="mb-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Legal status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tax Status */}
            <div className="flex items-start gap-3">
              <i className="ph ph-receipt text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1.5">Tax status</p>
                <span className={getStatusStyles(vehicleData.taxStatus)}>
                  {formatData(vehicleData.taxStatus)}
                </span>
              </div>
            </div>

            {/* Tax Due Date */}
            <div className="flex items-start gap-3">
              <i className="ph ph-calendar-x text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Tax due date</p>
                <p className="text-base font-medium text-gray-900">
                  {vehicleData.taxDueDate ? formatDate(vehicleData.taxDueDate) : 'Not available'}
                </p>
              </div>
            </div>

            {/* MOT Status */}
            <div className="flex items-start gap-3">
              <i className="ph ph-shield-check text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1.5">MOT status</p>
                <span className={getStatusStyles(vehicleData.motStatus)}>
                  {formatData(vehicleData.motStatus)}
                </span>
              </div>
            </div>

            {/* MOT Expiry Date */}
            <div className="flex items-start gap-3">
              <i className="ph ph-calendar-x text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">MOT expiry date</p>
                <p className="text-base font-medium text-gray-900">
                  {vehicleData.motExpiryDate ? formatDate(vehicleData.motExpiryDate) : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration & Documentation Section */}
        <div className="mb-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Registration and documentation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Marked For Export */}
            <div className="flex items-start gap-3">
              <i className="ph ph-airplane-takeoff text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1.5">Marked for export</p>
                <span className={getStatusStyles(vehicleData.markedForExport ? 'exported' : 'domestic')}>
                  {vehicleData.markedForExport !== undefined ? (vehicleData.markedForExport ? 'Yes' : 'No') : 'Not available'}
                </span>
              </div>
            </div>

            {/* Last V5C Issued */}
            <div className="flex items-start gap-3">
              <i className="ph ph-file-text text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Last V5C issued</p>
                <p className="text-base font-medium text-gray-900">
                  {vehicleData.dateOfLastV5CIssued ? formatDate(vehicleData.dateOfLastV5CIssued) : 'Not available'}
                </p>
              </div>
            </div>

            {/* First DVLA Registration */}
            <div className="flex items-start gap-3">
              <i className="ph ph-clipboard-text text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">First DVLA registration</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.monthOfFirstDvlaRegistration)}</p>
              </div>
            </div>

            {/* Automated Vehicle */}
            <div className="flex items-start gap-3">
              <i className="ph ph-robot text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1.5">Automated vehicle</p>
                <span className={getStatusStyles(vehicleData.automatedVehicle ? 'autonomous' : 'manual')}>
                  {vehicleData.automatedVehicle !== undefined ? (vehicleData.automatedVehicle ? 'Yes' : 'No') : 'Not available'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental & Technical Data Section */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Environmental and technical data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CO₂ Emissions */}
            <div className="flex items-start gap-3">
              <i className="ph ph-cloud text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">CO₂ emissions</p>
                <p className="text-base font-medium text-gray-900">
                  {vehicleData.co2Emissions ? `${vehicleData.co2Emissions}g/km` : 'Not available'}
                </p>
              </div>
            </div>

            {/* Euro Status */}
            <div className="flex items-start gap-3">
              <i className="ph ph-flag-banner text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Euro status</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.euroStatus)}</p>
              </div>
            </div>

            {/* Real Driving Emissions */}
            <div className="flex items-start gap-3">
              <i className="ph ph-chart-line text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Real driving emissions</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.realDrivingEmissions)}</p>
              </div>
            </div>

            {/* Type Approval */}
            <div className="flex items-start gap-3">
              <i className="ph ph-seal-check text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Type approval</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.typeApproval)}</p>
              </div>
            </div>

            {/* Wheel Plan */}
            <div className="flex items-start gap-3">
              <i className="ph ph-circles-four text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Wheel plan</p>
                <p className="text-base font-medium text-gray-900">{formatData(vehicleData.wheelplan)}</p>
              </div>
            </div>

            {/* Revenue Weight */}
            <div className="flex items-start gap-3">
              <i className="ph ph-scales text-gray-400 text-xl flex-shrink-0 mt-1"></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-0.5">Revenue weight</p>
                <p className="text-base font-medium text-gray-900">
                  {vehicleData.revenueWeight ? `${vehicleData.revenueWeight}kg` : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DVLAVehicleData = memo(DVLAVehicleDataComponent); // Wrap the component with React.memo

export default DVLAVehicleData;