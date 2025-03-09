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
  // Import the styled components from theme
  PremiumBadge,
  ReportSection,
  ReportTable,
  MotHistoryItem
} from '../../styles/theme';
import Alert from '@mui/material/Alert';

// Import both components
import VehicleMileageChart from '../../components/Report/MileageChart'; // The original chart component
import VehicleMileageInsights from '../../components/Report/MileageInsights'; // The new insights component

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8000/api/v1'   // Development - direct to API port
                    : '/api/v1';                       // Production - use relative URL for Nginx proxy

const PremiumReportPage = () => {
  const { registration } = useParams();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  useEffect(() => {
    // Check if payment information exists
    const fetchVehicleData = async () => {
      try {
        // Validate payment ID presence
        if (!paymentId) {
          throw new Error('Invalid payment. Please purchase a premium report to access this page.');
        }
        
        if (!registration) {
          throw new Error('Vehicle registration is required.');
        }
        
        setLoading(true);
        setError(null);
        
        // Fetch vehicle data directly from the API
        const response = await fetch(
          `${API_BASE_URL}/vehicle/registration/${registration}`,
          {
            headers: {
              'Accept': 'application/json',
            },
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin'
          }
        );
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch vehicle data';
          try {
            const errorData = await response.json();
            errorMessage = errorData.errorMessage || errorData.detail || errorMessage;
          } catch (e) {
            // If parsing JSON fails, use default error message
          }
          throw new Error(errorMessage);
        }
        
        const vehicleData = await response.json();
        
        // Process the API response to match the expected format for our components
        const processedData = processVehicleData(vehicleData, registration);
        setReportData(processedData);
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicleData();
  }, [registration, paymentId]);
  
  // Helper function to process the API response into the format we need
  const processVehicleData = (apiData, reg) => {
    // Calculate total and average mileage
    let totalMileage = 0;
    let averageAnnualMileage = 0;
    
    if (apiData.motTests && apiData.motTests.length > 0) {
      // Sort tests by date (most recent first)
      const sortedTests = [...apiData.motTests].sort(
        (a, b) => new Date(b.completedDate) - new Date(a.completedDate)
      );
      
      // Get latest mileage reading
      const lastTest = sortedTests[0];
      
      if (lastTest && lastTest.odometerValue) {
        totalMileage = parseInt(String(lastTest.odometerValue).replace(/,/g, ''), 10);
      }
      
      // Calculate average annual mileage if we have enough data
      if (sortedTests.length > 1) {
        const firstTest = sortedTests[sortedTests.length - 1];
        const lastTest = sortedTests[0];
        
        const firstDate = new Date(firstTest.completedDate);
        const lastDate = new Date(lastTest.completedDate);
        
        // Get time difference in years
        const yearsDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25);
        if (yearsDiff > 0.5) { // Only calculate if we have more than 6 months of data
          const firstMileage = parseInt(String(firstTest.odometerValue).replace(/,/g, ''), 10);
          const lastMileage = parseInt(String(lastTest.odometerValue).replace(/,/g, ''), 10);
          const mileageDiff = lastMileage - firstMileage;
          
          averageAnnualMileage = Math.round(mileageDiff / yearsDiff);
        }
      }
    }
    
    // Return structured data format for the UI
    return {
      registration: reg,
      makeModel: `${apiData.make || 'Unknown'} ${apiData.model || ''}`.trim(),
      colour: apiData.primaryColour || 'Unknown',
      fuelType: apiData.fuelType || 'Unknown',
      dateRegistered: formatDate(apiData.registrationDate || apiData.firstUsedDate),
      engineSize: apiData.engineSize ? `${apiData.engineSize}cc` : 'Unknown',
      manufactureDate: formatDate(apiData.manufactureDate),
      hasOutstandingRecall: apiData.hasOutstandingRecall || 'Unknown',
      // Premium data
      previousKeepers: 'Data not available', // This may not be available from the API
      totalMileage,
      averageAnnualMileage,
      importStatus: 'UK Vehicle', // This may need to be updated if API provides this info
      insuranceWriteOff: 'No' // This may need to be updated if API provides this info
    };
  };
  
  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
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
  
  return (
    <GovUKContainer>
      <GovUKMainWrapper>
        {loading && (
          <GovUKLoadingContainer>
            <GovUKLoadingSpinner />
            <GovUKBody>Generating your premium report...</GovUKBody>
          </GovUKLoadingContainer>
        )}
        
        {error && (
          <Alert severity="error" style={{ marginBottom: '20px' }}>
            {error}
          </Alert>
        )}
        
        {reportData && !loading && (
          <>
            <PremiumBadge>PREMIUM REPORT</PremiumBadge>
            
            <GovUKHeadingXL>
              Vehicle Report
            </GovUKHeadingXL>
            
            <VehicleRegistration data-test-id="premium-vehicle-registration">
              {reportData.registration}
            </VehicleRegistration>
            
            <GovUKHeadingL>
              {reportData.makeModel}
            </GovUKHeadingL>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            <ReportSection>
              <GovUKHeadingL>Vehicle Overview</GovUKHeadingL>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Colour</DetailCaption>
                  <DetailHeading>{reportData.colour}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Fuel type</DetailCaption>
                  <DetailHeading>{reportData.fuelType}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Date registered</DetailCaption>
                  <DetailHeading>{reportData.dateRegistered}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Engine size</DetailCaption>
                  <DetailHeading>{reportData.engineSize}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Manufacture date</DetailCaption>
                  <DetailHeading>{reportData.manufactureDate}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Outstanding recall</DetailCaption>
                  <DetailHeading>{reportData.hasOutstandingRecall}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
            </ReportSection>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            <ReportSection>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Previous keepers</DetailCaption>
                  <DetailHeading>{reportData.previousKeepers}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Total mileage</DetailCaption>
                  <DetailHeading>{reportData.totalMileage.toLocaleString()} miles</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Average annual mileage</DetailCaption>
                  <DetailHeading>{reportData.averageAnnualMileage.toLocaleString()} miles</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
              
              <GovUKGridRow>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Import status</DetailCaption>
                  <DetailHeading>{reportData.importStatus}</DetailHeading>
                </GovUKGridColumnOneThird>
                <GovUKGridColumnOneThird>
                  <DetailCaption>Insurance write-off</DetailCaption>
                  <DetailHeading>{reportData.insuranceWriteOff}</DetailHeading>
                </GovUKGridColumnOneThird>
              </GovUKGridRow>
            </ReportSection>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            <ReportSection>
              
              {/* The chart component - handles its own loading, error states, and data fetching */}
              <VehicleMileageChart registration={registration} />
            </ReportSection>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Advanced Mileage Analysis section */}
            <ReportSection>
              
              {/* The insights component - also handles its own loading, error states, and data fetching */}
              <VehicleMileageInsights registration={registration} />
            </ReportSection>
            

            
            <GovUKBody>
              <GovUKLink href={`/vehicle/${reportData.registration}`} noVisitedState>
                Return to basic vehicle details
              </GovUKLink>
            </GovUKBody>
          </>
        )}
      </GovUKMainWrapper>
    </GovUKContainer>
  );
};

export default PremiumReportPage;
