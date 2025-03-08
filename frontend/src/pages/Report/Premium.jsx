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
  COLORS,
} from '../../styles/theme';
import { styled } from '@mui/material';
import Alert from '@mui/material/Alert';

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8000/api/v1'   // Development - direct to API port
                    : '/api/v1';                       // Production - use relative URL for Nginx proxy

// Styled components for Premium Report
const PremiumBadge = styled('div')`
  display: inline-block;
  padding: 5px 10px;
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  font-weight: 700;
  margin-bottom: 15px;
`;

const ReportSection = styled('div')`
  margin-bottom: 30px;
`;

const ReportTable = styled('table')`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  & th {
    font-weight: 700;
    padding: 10px;
    text-align: left;
    background-color: ${COLORS.LIGHT_GREY};
    border: 1px solid ${COLORS.MID_GREY};
  }
  
  & td {
    padding: 10px;
    border: 1px solid ${COLORS.MID_GREY};
    text-align: left;
  }
  
  & tr:nth-child(even) {
    background-color: ${COLORS.LIGHT_GREY};
  }
`;

const MotHistoryItem = styled('div')`
  padding: 15px;
  margin-bottom: 15px;
  border-left: 5px solid ${props => props.result === 'PASS' ? COLORS.GREEN : COLORS.RED};
  background-color: ${COLORS.LIGHT_GREY};
`;

const PremiumReportPage = () => {
  const { registration } = useParams();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  useEffect(() => {
    // Check if payment information exists in sessionStorage
    const checkPaymentAndFetchData = async () => {
      try {
        // This would normally validate the payment on the server
        // Here we're just checking if the payment ID is in the URL
        if (!paymentId) {
          throw new Error('Invalid payment. Please purchase a premium report to access this page.');
        }
        
        setLoading(true);
        setError(null);
        
        // Fetch the premium report data from your API
        const response = await fetch(
          `${API_BASE_URL}/premium-report/${registration}?paymentId=${paymentId}`,
          {
            headers: {
              'Accept': 'application/json',
            },
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin'
          }
        );
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch premium report';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.detail || errorMessage;
          } catch (e) {
            // If parsing JSON fails, use default error message
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching premium report:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkPaymentAndFetchData();
  }, [registration, paymentId]);
  
  // For demo purposes, we'll create mock data if the API isn't implemented yet
  useEffect(() => {
    // This is only for demonstration purposes - in production, you'd rely on your API
    if (loading && !error) {
      // Simulate API delay
      const timer = setTimeout(() => {
        // Mock data for demonstration
        const mockData = {
          registration: registration,
          makeModel: 'Ford Focus',
          colour: 'Red',
          fuelType: 'Petrol',
          dateRegistered: '1 January 2018',
          engineSize: '1998cc',
          manufactureDate: '15 December 2017',
          hasOutstandingRecall: 'No',
          // Premium data
          previousKeepers: 2,
          totalMileage: 45000,
          averageAnnualMileage: 9000,
          importStatus: 'UK Vehicle',
          insuranceWriteOff: 'No',
          vehicleDetails: {
            transmission: 'Manual',
            doors: 5,
            wheelbase: '2648mm',
            grossWeight: '1900kg',
            co2Emissions: '135g/km',
            fuelConsumption: '5.4L/100km',
            euroEmissionsStandard: 'Euro 6',
            powerOutput: '125 PS (92 kW)',
            topSpeed: '125 mph',
            acceleration: '10.2s (0-60mph)'
          },
          motHistory: [
            {
              testDate: '15 December 2023',
              expiryDate: '14 December 2024',
              result: 'PASS',
              mileage: 45000,
              advisories: [
                'Front brake pad(s) wearing thin',
                'Nearside Front Tyre worn close to legal limit'
              ]
            },
            {
              testDate: '10 December 2022',
              expiryDate: '14 December 2023',
              result: 'PASS',
              mileage: 36000,
              advisories: [
                'Oil leak, but not excessive'
              ]
            },
            {
              testDate: '5 December 2021',
              expiryDate: '14 December 2022',
              result: 'PASS',
              mileage: 27000,
              advisories: []
            },
            {
              testDate: '1 December 2020',
              expiryDate: '14 December 2021',
              result: 'FAIL',
              mileage: 18000,
              failureReasons: [
                'Nearside Rear Tyre has a cut in excess of the requirements',
                'Offside Front Headlamp aim too low'
              ],
              retestDate: '8 December 2020',
              retestResult: 'PASS'
            }
          ]
        };
        
        setReportData(mockData);
        setLoading(false);
      }, 2000); // Simulate 2 second load time
      
      return () => clearTimeout(timer);
    }
  }, [loading, error, registration]);
  
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
              <GovUKHeadingL>Premium Information</GovUKHeadingL>
              
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
              <GovUKHeadingL>Technical Specifications</GovUKHeadingL>
              
              <ReportTable>
                <thead>
                  <tr>
                    <th>Specification</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportData.vehicleDetails).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </ReportTable>
            </ReportSection>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            <ReportSection>
              <GovUKHeadingL>MOT History</GovUKHeadingL>
              
              {reportData.motHistory.map((mot, index) => (
                <MotHistoryItem key={index} result={mot.result}>
                  <GovUKGridRow>
                    <GovUKGridColumnTwoThirds>
                      <DetailCaption>Test Date</DetailCaption>
                      <DetailHeading>{mot.testDate}</DetailHeading>
                    </GovUKGridColumnTwoThirds>
                    <GovUKGridColumnOneThird>
                      <DetailCaption>Result</DetailCaption>
                      <DetailHeading style={{ color: mot.result === 'PASS' ? COLORS.GREEN : COLORS.RED }}>
                        {mot.result}
                      </DetailHeading>
                    </GovUKGridColumnOneThird>
                  </GovUKGridRow>
                  
                  <GovUKGridRow>
                    <GovUKGridColumnTwoThirds>
                      <DetailCaption>Expiry Date</DetailCaption>
                      <DetailHeading>{mot.expiryDate}</DetailHeading>
                    </GovUKGridColumnTwoThirds>
                    <GovUKGridColumnOneThird>
                      <DetailCaption>Mileage</DetailCaption>
                      <DetailHeading>{mot.mileage.toLocaleString()} miles</DetailHeading>
                    </GovUKGridColumnOneThird>
                  </GovUKGridRow>
                  
                  {mot.advisories && mot.advisories.length > 0 && (
                    <div>
                      <DetailCaption>Advisories</DetailCaption>
                      <GovUKList style={{ paddingLeft: '20px' }}>
                        {mot.advisories.map((advisory, idx) => (
                          <li key={idx}>{advisory}</li>
                        ))}
                      </GovUKList>
                    </div>
                  )}
                  
                  {mot.failureReasons && mot.failureReasons.length > 0 && (
                    <div>
                      <DetailCaption>Failure Reasons</DetailCaption>
                      <GovUKList style={{ paddingLeft: '20px' }}>
                        {mot.failureReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </GovUKList>
                    </div>
                  )}
                  
                  {mot.retestDate && (
                    <GovUKGridRow>
                      <GovUKGridColumnTwoThirds>
                        <DetailCaption>Retest Date</DetailCaption>
                        <DetailHeading>{mot.retestDate}</DetailHeading>
                      </GovUKGridColumnTwoThirds>
                      <GovUKGridColumnOneThird>
                        <DetailCaption>Retest Result</DetailCaption>
                        <DetailHeading style={{ color: mot.retestResult === 'PASS' ? COLORS.GREEN : COLORS.RED }}>
                          {mot.retestResult}
                        </DetailHeading>
                      </GovUKGridColumnOneThird>
                    </GovUKGridRow>
                  )}
                </MotHistoryItem>
              ))}
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