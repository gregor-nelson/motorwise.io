import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  GovUKContainer, 
  GovUKMainWrapper,
  GovUKHeadingXL,
  GovUKHeadingL,
  GovUKBody,
  GovUKLink,
  GovUKGridRow,
  GovUKGridColumnTwoThirds,
  GovUKGridColumnOneThird,
  GovUKLoadingContainer,
  GovUKLoadingSpinner,
  VehicleRegistration,
  DetailCaption,
  DetailHeading,
  GovUKSectionBreak,
  GovUKList,
  PremiumBadge,
  ReportSection,
  ReportTable
} from '../../styles/theme';
import Alert from '@mui/material/Alert';

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8004/api'   // Development - direct to API port
                    : '/api';                       // Production - use relative URL for Nginx proxy

const VehicleInfoGovUK = () => {
  const { registration } = useParams();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        if (!registration) {
          throw new Error('Vehicle registration is required.');
        }
        
        setLoading(true);
        setError(null);
        
        // Fetch vehicle data from our FastAPI backend
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
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch vehicle data';
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            // If parsing JSON fails, use default error message
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setVehicleData(data);
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
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
  
  return (
    <GovUKContainer>
      <GovUKMainWrapper>
        {loading && (
          <GovUKLoadingContainer>
            <GovUKLoadingSpinner />
            <GovUKBody>Retrieving vehicle information...</GovUKBody>
          </GovUKLoadingContainer>
        )}
        
        {error && (
          <Alert severity="error" style={{ marginBottom: '20px' }}>
            {error}
          </Alert>
        )}
        
        {vehicleData && !loading && (
          <>
            <GovUKHeadingXL>
              Vehicle Information
            </GovUKHeadingXL>
            
            <VehicleRegistration data-test-id="vehicle-registration">
              {vehicleData.registrationNumber}
            </VehicleRegistration>
            
            <GovUKHeadingL>
              {vehicleData.make || 'Unknown vehicle'}
            </GovUKHeadingL>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Vehicle Basic Information */}
            <ReportSection>
              <GovUKHeadingL>Vehicle Overview</GovUKHeadingL>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Registration Number</DetailCaption>
                  <DetailHeading>{vehicleData.registrationNumber}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Make</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.make)}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Colour</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.colour)}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Year of Manufacture</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.yearOfManufacture)}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Engine Capacity</DetailCaption>
                  <DetailHeading>{vehicleData.engineCapacity ? `${vehicleData.engineCapacity}cc` : 'Not available'}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Fuel Type</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.fuelType)}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
            </ReportSection>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Vehicle Registration Information */}
            <ReportSection>
              <GovUKHeadingL>Registration Details</GovUKHeadingL>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>First Registration</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.monthOfFirstRegistration)}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>First DVLA Registration</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.monthOfFirstDvlaRegistration)}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Last V5C Issued</DetailCaption>
                  <DetailHeading>{vehicleData.dateOfLastV5CIssued ? formatDate(vehicleData.dateOfLastV5CIssued) : 'Not available'}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Marked For Export</DetailCaption>
                  <DetailHeading>{vehicleData.markedForExport !== undefined ? (vehicleData.markedForExport ? 'Yes' : 'No') : 'Not available'}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Type Approval</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.typeApproval)}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Wheel Plan</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.wheelplan)}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
            </ReportSection>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Tax and MOT Information */}
            <ReportSection>
              <GovUKHeadingL>Tax and MOT Status</GovUKHeadingL>
              
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
                  <DetailCaption>Additional Rate Tax End Date</DetailCaption>
                  <DetailHeading>{vehicleData.artEndDate ? formatDate(vehicleData.artEndDate) : 'Not available'}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>MOT Status</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.motStatus)}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>MOT Expiry Date</DetailCaption>
                  <DetailHeading>{vehicleData.motExpiryDate ? formatDate(vehicleData.motExpiryDate) : 'Not available'}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Revenue Weight</DetailCaption>
                  <DetailHeading>{vehicleData.revenueWeight ? `${vehicleData.revenueWeight}kg` : 'Not available'}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
            </ReportSection>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Emissions Information */}
            <ReportSection>
              <GovUKHeadingL>Environmental Information</GovUKHeadingL>
              
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
                  <DetailCaption>Real Driving Emissions</DetailCaption>
                  <DetailHeading>{formatData(vehicleData.realDrivingEmissions)}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Automated Vehicle</DetailCaption>
                  <DetailHeading>{vehicleData.automatedVehicle !== undefined ? (vehicleData.automatedVehicle ? 'Yes' : 'No') : 'Not available'}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
            </ReportSection>
          </>
        )}
      </GovUKMainWrapper>
    </GovUKContainer>
  );
};

export default VehicleInfoGovUK;