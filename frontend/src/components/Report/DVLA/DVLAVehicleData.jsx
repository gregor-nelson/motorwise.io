import React, { useState, useEffect } from 'react';
import { 
  GovUKHeadingL,
  GovUKGridRow,
  GovUKGridColumnOneThird,
  GovUKLoadingContainer,
  GovUKLoadingSpinner,
  GovUKBody,
  DetailCaption,
  DetailHeading,
  ReportSection,
  GovUKSectionBreak
} from '../../../styles/theme';
import Alert from '@mui/material/Alert';

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8004/api'   // Development - direct to API port
                    : '/api';                       // Production - use relative URL for Nginx proxy

const DVLAVehicleData = ({ registration }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  
  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!registration) return;
      
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
  
  // Helper function to format dates
  const formatDate = (dateString) => {
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
  };
  
  // Helper to manage missing data
  const formatData = (value, suffix = '') => {
    if (value === undefined || value === null) return 'Not available';
    return `${value}${suffix}`;
  };
  
  if (loading) {
    return (
      <ReportSection>
        <GovUKLoadingContainer>
          <GovUKLoadingSpinner />
          <GovUKBody>Retrieving DVLA information...</GovUKBody>
        </GovUKLoadingContainer>
      </ReportSection>
    );
  }
  
  if (error) {
    return (
      <ReportSection>
        <GovUKHeadingL>DVLA Vehicle Data</GovUKHeadingL>
        <Alert severity="error" style={{ marginBottom: '20px' }}>
          {error}
        </Alert>
      </ReportSection>
    );
  }
  
  if (!vehicleData) {
    return null;
  }
  
  return (
    <>
      <ReportSection>
        <GovUKHeadingL>Vehicle Overview</GovUKHeadingL>
        
        <GovUKGridRow>
          <GovUKGridColumnOneThird>
            <DetailCaption>Colour</DetailCaption>
            <DetailHeading>{formatData(vehicleData.colour)}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Fuel type</DetailCaption>
            <DetailHeading>{formatData(vehicleData.fuelType)}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Date registered</DetailCaption>
            <DetailHeading>{formatData(vehicleData.monthOfFirstRegistration)}</DetailHeading>
          </GovUKGridColumnOneThird>
        </GovUKGridRow>
        
        <GovUKGridRow>
          <GovUKGridColumnOneThird>
            <DetailCaption>Engine size</DetailCaption>
            <DetailHeading>{vehicleData.engineCapacity ? `${vehicleData.engineCapacity}cc` : 'Not available'}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Manufacture date</DetailCaption>
            <DetailHeading>{formatData(vehicleData.yearOfManufacture)}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Make</DetailCaption>
            <DetailHeading>{formatData(vehicleData.make)}</DetailHeading>
          </GovUKGridColumnOneThird>
        </GovUKGridRow>
      </ReportSection>
      
      <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
      
      <ReportSection>
        <GovUKHeadingL>Vehicle Status</GovUKHeadingL>
        
        <GovUKGridRow>
          <GovUKGridColumnOneThird>
            <DetailCaption>Tax Status</DetailCaption>
            <DetailHeading>{formatData(vehicleData.taxStatus)}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Tax Due Date</DetailCaption>
            <DetailHeading>{vehicleData.taxDueDate ? formatDate(vehicleData.taxDueDate) : 'Not available'}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>MOT Status</DetailCaption>
            <DetailHeading>{formatData(vehicleData.motStatus)}</DetailHeading>
          </GovUKGridColumnOneThird>
        </GovUKGridRow>
        
        <GovUKGridRow>
          <GovUKGridColumnOneThird>
            <DetailCaption>MOT Expiry Date</DetailCaption>
            <DetailHeading>{vehicleData.motExpiryDate ? formatDate(vehicleData.motExpiryDate) : 'Not available'}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Marked For Export</DetailCaption>
            <DetailHeading>{vehicleData.markedForExport !== undefined ? (vehicleData.markedForExport ? 'Yes' : 'No') : 'Not available'}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Last V5C Issued</DetailCaption>
            <DetailHeading>{vehicleData.dateOfLastV5CIssued ? formatDate(vehicleData.dateOfLastV5CIssued) : 'Not available'}</DetailHeading>
          </GovUKGridColumnOneThird>
        </GovUKGridRow>
      </ReportSection>
      
      <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
      
      <ReportSection>
        <GovUKHeadingL>Technical Details</GovUKHeadingL>
        
        <GovUKGridRow>
          <GovUKGridColumnOneThird>
            <DetailCaption>CO2 Emissions</DetailCaption>
            <DetailHeading>{vehicleData.co2Emissions ? `${vehicleData.co2Emissions}g/km` : 'Not available'}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Euro Status</DetailCaption>
            <DetailHeading>{formatData(vehicleData.euroStatus)}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Type Approval</DetailCaption>
            <DetailHeading>{formatData(vehicleData.typeApproval)}</DetailHeading>
          </GovUKGridColumnOneThird>
        </GovUKGridRow>
        
        <GovUKGridRow>
          <GovUKGridColumnOneThird>
            <DetailCaption>Wheel Plan</DetailCaption>
            <DetailHeading>{formatData(vehicleData.wheelplan)}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Revenue Weight</DetailCaption>
            <DetailHeading>{vehicleData.revenueWeight ? `${vehicleData.revenueWeight}kg` : 'Not available'}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Real Driving Emissions</DetailCaption>
            <DetailHeading>{formatData(vehicleData.realDrivingEmissions)}</DetailHeading>
          </GovUKGridColumnOneThird>
        </GovUKGridRow>
        
        <GovUKGridRow>
          <GovUKGridColumnOneThird>
            <DetailCaption>First DVLA Registration</DetailCaption>
            <DetailHeading>{formatData(vehicleData.monthOfFirstDvlaRegistration)}</DetailHeading>
          </GovUKGridColumnOneThird>
          <GovUKGridColumnOneThird>
            <DetailCaption>Automated Vehicle</DetailCaption>
            <DetailHeading>{vehicleData.automatedVehicle !== undefined ? (vehicleData.automatedVehicle ? 'Yes' : 'No') : 'Not available'}</DetailHeading>
          </GovUKGridColumnOneThird>
        </GovUKGridRow>
      </ReportSection>
    </>
  );
};

export default DVLAVehicleData;