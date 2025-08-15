import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  DVLADataContainer,
  SectionHeader,
  DataGrid,
  MetricGroup,
  MetricRow,
  MetricItem,
  MetricLabel,
  MetricValue,
  StatusIndicator,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorHeader,
  ErrorMessage,
  SectionDivider,
  ResponsiveWrapper
} from './DVLADataHeaderStyles';
// Material UI Icons
import InfoIcon from '@mui/icons-material/Info';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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
  }, []); // Empty dependency array as it doesn't depend on component state

  if (loading) {
    return (
      <DVLADataContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Retrieving DVLA vehicle information...</LoadingText>
        </LoadingContainer>
      </DVLADataContainer>
    );
  }

  if (error) {
    return (
      <DVLADataContainer>
        <ErrorContainer>
          <ErrorHeader>
            <ErrorOutlineIcon />
            DVLA Data Unavailable
          </ErrorHeader>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorContainer>
      </DVLADataContainer>
    );
  }

  if (!vehicleData) {
    return null;
  }

  return (
    <ResponsiveWrapper>
      <DVLADataContainer>
        <SectionHeader>
          <h1>Vehicle Information</h1>
        </SectionHeader>

        <DataGrid>
          {/* Basic Vehicle Details */}
          <MetricGroup>
            <MetricRow>
              <MetricItem>
                <MetricLabel>Make</MetricLabel>
                <MetricValue>{formatData(vehicleData.make)}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Colour</MetricLabel>
                <MetricValue>{formatData(vehicleData.colour)}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Fuel Type</MetricLabel>
                <MetricValue>{formatData(vehicleData.fuelType)}</MetricValue>
              </MetricItem>
            </MetricRow>
            <MetricRow>
              <MetricItem>
                <MetricLabel>Engine Size</MetricLabel>
                <MetricValue>{vehicleData.engineCapacity ? `${vehicleData.engineCapacity}cc` : 'Not available'}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Date Registered</MetricLabel>
                <MetricValue>{formatData(vehicleData.monthOfFirstRegistration)}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Manufacture Date</MetricLabel>
                <MetricValue>{formatData(vehicleData.yearOfManufacture)}</MetricValue>
              </MetricItem>
            </MetricRow>
          </MetricGroup>

          {/* Legal Status */}
          <MetricGroup>
            <MetricRow>
              <MetricItem>
                <MetricLabel>Tax Status</MetricLabel>
                <MetricValue>
                  <StatusIndicator status={vehicleData.taxStatus}>
                    {formatData(vehicleData.taxStatus)}
                  </StatusIndicator>
                </MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Tax Due Date</MetricLabel>
                <MetricValue>{vehicleData.taxDueDate ? formatDate(vehicleData.taxDueDate) : 'Not available'}</MetricValue>
              </MetricItem>
            </MetricRow>
            <MetricRow>
              <MetricItem>
                <MetricLabel>MOT Status</MetricLabel>
                <MetricValue>
                  <StatusIndicator status={vehicleData.motStatus}>
                    {formatData(vehicleData.motStatus)}
                  </StatusIndicator>
                </MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>MOT Expiry Date</MetricLabel>
                <MetricValue>{vehicleData.motExpiryDate ? formatDate(vehicleData.motExpiryDate) : 'Not available'}</MetricValue>
              </MetricItem>
            </MetricRow>
          </MetricGroup>
        </DataGrid>

        <SectionDivider />

        <SectionHeader>
          <h1>Registration & Documentation</h1>
        </SectionHeader>

        <DataGrid>
          <MetricGroup>
            <MetricRow>
              <MetricItem>
                <MetricLabel>Marked For Export</MetricLabel>
                <MetricValue>
                  <StatusIndicator status={vehicleData.markedForExport ? 'exported' : 'domestic'}>
                    {vehicleData.markedForExport !== undefined ? (vehicleData.markedForExport ? 'Yes' : 'No') : 'Not available'}
                  </StatusIndicator>
                </MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Last V5C Issued</MetricLabel>
                <MetricValue>{vehicleData.dateOfLastV5CIssued ? formatDate(vehicleData.dateOfLastV5CIssued) : 'Not available'}</MetricValue>
              </MetricItem>
            </MetricRow>
            <MetricRow>
              <MetricItem>
                <MetricLabel>First DVLA Registration</MetricLabel>
                <MetricValue>{formatData(vehicleData.monthOfFirstDvlaRegistration)}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Automated Vehicle</MetricLabel>
                <MetricValue>
                  <StatusIndicator status={vehicleData.automatedVehicle ? 'autonomous' : 'manual'}>
                    {vehicleData.automatedVehicle !== undefined ? (vehicleData.automatedVehicle ? 'Yes' : 'No') : 'Not available'}
                  </StatusIndicator>
                </MetricValue>
              </MetricItem>
            </MetricRow>
          </MetricGroup>
        </DataGrid>

        <SectionDivider />

        <SectionHeader>
          <h1>Environmental & Technical Data</h1>
        </SectionHeader>

        <DataGrid>
          <MetricGroup>
            <MetricRow>
              <MetricItem>
                <MetricLabel>CO₂ Emissions</MetricLabel>
                <MetricValue>{vehicleData.co2Emissions ? `${vehicleData.co2Emissions}g/km` : 'Not available'}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Euro Status</MetricLabel>
                <MetricValue>{formatData(vehicleData.euroStatus)}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Real Driving Emissions</MetricLabel>
                <MetricValue>{formatData(vehicleData.realDrivingEmissions)}</MetricValue>
              </MetricItem>
            </MetricRow>
            <MetricRow>
              <MetricItem>
                <MetricLabel>Type Approval</MetricLabel>
                <MetricValue>{formatData(vehicleData.typeApproval)}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Wheel Plan</MetricLabel>
                <MetricValue>{formatData(vehicleData.wheelplan)}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Revenue Weight</MetricLabel>
                <MetricValue>{vehicleData.revenueWeight ? `${vehicleData.revenueWeight}kg` : 'Not available'}</MetricValue>
              </MetricItem>
            </MetricRow>
          </MetricGroup>
        </DataGrid>
      </DVLADataContainer>
    </ResponsiveWrapper>
  );
};

const DVLAVehicleData = memo(DVLAVehicleDataComponent); // Wrap the component with React.memo

export default DVLAVehicleData;