import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { COLORS } from '../../styles/theme';
import { 
  GovUKContainer, 
  GovUKMainWrapper,
  GovUKHeadingXL,
  GovUKHeadingL,
  GovUKBody,
  GovUKLink,
  GovUKSectionBreak,
  GovUKLoadingContainer,
  GovUKLoadingSpinner,
  PremiumBadge,
  ReportSection,
  VehicleRegistration
} from '../../styles/theme';
import Alert from '@mui/material/Alert';

// Import components 
import DVLAVehicleData from '../../components/Premium/DVLA/Header/DVLADataHeader';
import VehicleInsights from '../../components/Premium/DVLA/Insights/VehicleInsights';
import VehicleMileageChart from '../../components/Premium/DVLA/Mileage/Chart/MileageChart'; 
import VehicleMileageInsights from '../../components/Premium/DVLA/Mileage/MileageInsights/MileageInsights';
import PDFGenerator from './PDF/PdfGenerator'; //
import VehicleDataPage from '../../components/AutoData/DataTabs';
import TechnicalSpecificationsPage from '../../components/AutoData/TechnicalSpecificationsPage';
import RepairTimesPage from '../../components/AutoData/LabourTimes';
import AutoDataSection from '../../components/AutoData/DataTabs';

// Configurations 
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8000/api/v1'
                    : '/api/v1';
const FREE_CLASSIC_PAYMENT_ID = 'free-classic-vehicle';
const FREE_MODERN_PAYMENT_ID = 'free-modern-vehicle';

const PremiumReportPage = () => {
  // Route handling
  const { registration } = useParams();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [motData, setMotData] = useState(null);
  const [isFreeReport, setIsFreeReport] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [pdfDataReady, setPdfDataReady] = useState(false);
  
  // Additional state for advanced insights
  const [vehicleInsightsData, setVehicleInsightsData] = useState(null);
  const [mileageInsightsData, setMileageInsightsData] = useState(null);
  
  // Ref for the entire report container
  const reportContainerRef = useRef(null);
  
  // Data loading flags to prevent recursion
  const vehicleInsightsLoaded = useRef(false);
  const mileageInsightsLoaded = useRef(false);
  
  // Effect for loading data
  useEffect(() => {
    // Check if this is a free report
    if (paymentId === FREE_CLASSIC_PAYMENT_ID) {
      setIsFreeReport(true);
      setReportType('classic');
    } else if (paymentId === FREE_MODERN_PAYMENT_ID) {
      setIsFreeReport(true);
      setReportType('modern');
    }

    // Fetch vehicle data
    const fetchVehicleData = async () => {
      try {
        if (!paymentId) {
          throw new Error('Invalid payment. Please purchase a premium report to access this page.');
        }
        
        if (!registration) {
          throw new Error('Vehicle registration is required.');
        }
        
        setLoading(true);
        setError(null);
        
        // For free reports, we don't need to validate the payment ID on the server
        const endpointUrl = isFreeReport
          ? `${API_BASE_URL}/vehicle/registration/${registration}`
          : `${API_BASE_URL}/vehicle/registration/${registration}?paymentId=${paymentId}`;
        
        // Fetch vehicle data for the report
        const response = await fetch(
          endpointUrl,
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
        
        // Create report data
        setReportData({
          registration: registration,
          makeModel: `${vehicleData.make || 'Unknown'} ${vehicleData.model || ''}`.trim(),
          colour: vehicleData.primaryColour || vehicleData.colour || 'Unknown',
          vin: vehicleData.vin,
          isFreeReport: isFreeReport,
          reportType: reportType,
          // Additional data for PDF generation
          engineSize: vehicleData.engineCapacity,
          fuelType: vehicleData.fuelType,
          manufactureDate: vehicleData.manufactureDate,
          firstRegistrationDate: vehicleData.registrationDate,
          taxStatus: vehicleData.taxStatus,
          taxDueDate: vehicleData.taxDueDate,
          motStatus: vehicleData.motStatus,
          motExpiry: vehicleData.motExpiryDate
        });
        
        // Transform MOT data for the mileage chart
        if (vehicleData.motTests && vehicleData.motTests.length > 0) {
          const transformedMotData = transformMotData(vehicleData);
          setMotData(transformedMotData);
        }

        // Mock insights data (same as original)
        setInsightsData({
          currentStatus: {
            driveabilityStatus: "Not Road Legal",
            motExpires: "20 March 2017 (Expired)",
            riskLevel: "High",
            riskFactors: [
              "MOT has expired - vehicle cannot legally be driven on public roads except to a pre-booked MOT test"
            ]
          },
          // ... rest of insights data
        });
        
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicleData();
  }, [registration, paymentId, isFreeReport, reportType]);
  
  // Transform MOT data function
  const transformMotData = (apiData) => {
    if (!apiData || !apiData.motTests || apiData.motTests.length === 0) return [];
    
    return apiData.motTests.map(test => {
      const testDate = new Date(test.completedDate);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = testDate.toLocaleDateString('en-GB', options);
      
      return {
        date: formattedDate,
        testDate: formattedDate, // For PDF report
        testResult: test.testResult === 'PASSED' ? 'PASS' : 'FAIL', // For PDF report
        status: test.testResult === 'PASSED' ? 'PASS' : 'FAIL',
        mileage: test.odometerResultType === 'READ' 
          ? parseInt(test.odometerValue).toLocaleString('en-GB')
          : 'Not recorded',
        testNumber: test.motTestNumber || 'Not available',
        expiry: test.expiryDate 
          ? new Date(test.expiryDate).toLocaleDateString('en-GB', options)
          : null,
        expiryDate: test.expiryDate  // For PDF report
          ? new Date(test.expiryDate).toLocaleDateString('en-GB', options)
          : null,
        rawMileage: test.odometerResultType === 'READ' ? parseInt(test.odometerValue) : null,
        rawDate: test.completedDate
      };
    });
  };

  // Collect data from child components - using useCallback to prevent recreation on every render
  // This function gets called by the VehicleInsights component
  const handleVehicleInsightsData = useCallback((data) => {
    // Only update if not already loaded or data is different
    if (!vehicleInsightsLoaded.current || JSON.stringify(data) !== JSON.stringify(vehicleInsightsData)) {
      console.log("Received vehicle insights data:", data);
      setVehicleInsightsData(data);
      vehicleInsightsLoaded.current = true;
    }
  }, [vehicleInsightsData]);
  
  // This function gets called by the VehicleMileageInsights component
  const handleMileageInsightsData = useCallback((data) => {
    // Only update if not already loaded or data is different
    if (!mileageInsightsLoaded.current || JSON.stringify(data) !== JSON.stringify(mileageInsightsData)) {
      console.log("Received mileage insights data:", data);
      setMileageInsightsData(data);
      mileageInsightsLoaded.current = true;
    }
  }, [mileageInsightsData]);
  
  // Check when all data is ready for PDF generation
  useEffect(() => {
    if (reportData && motData) {
      // Basic data is ready - allow PDF generation with core data
      setPdfDataReady(true);
      
      if (insightsData && vehicleInsightsData && mileageInsightsData) {
        console.log("All PDF data including insights is ready");
      } else {
        console.log("Basic PDF data is ready, some insights may be missing");
        // We still allow PDF generation with partial data
      }
    } else {
      setPdfDataReady(false);
    }
  }, [reportData, insightsData, motData, vehicleInsightsData, mileageInsightsData]);
  
  // Show loading state
  if (loading) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
          <GovUKLoadingContainer>
            <GovUKLoadingSpinner />
            <GovUKBody>Generating your premium report...</GovUKBody>
          </GovUKLoadingContainer>
        </GovUKMainWrapper>
      </GovUKContainer>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
          <Alert severity="error" style={{ marginBottom: '20px' }}>
            {error}
          </Alert>
          <GovUKBody>
            <GovUKLink href="/" noVisitedState>
              Return to homepage
            </GovUKLink>
          </GovUKBody>
        </GovUKMainWrapper>
      </GovUKContainer>
    );
  }
  
  // Show report when data is loaded
  if (reportData) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
          {/* Download button above the report */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <PDFGenerator
            reportData={reportData}
            motData={motData}
            insightsData={insightsData}
            vehicleInsightsData={vehicleInsightsData}
            mileageInsightsData={mileageInsightsData}
            buttonText="Download PDF Report"
            buttonStyle={{
              padding: '10px 20px',
              backgroundColor: COLORS.GREEN,
              color: COLORS.WHITE,
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            buttonClassName="pdf-download-button"  // Optional: add if you want to style with CSS
          />
          </div>
          
          {/* Report container - with ref */}
          <div ref={reportContainerRef}>
            {/* Report header */}
            <div className="report-section">
              <PremiumBadge>
                {reportData.isFreeReport ? "ENHANCED" : "PREMIUM"}
              </PremiumBadge>
              
              <GovUKHeadingXL>
                Vehicle Report
              </GovUKHeadingXL>
              
              <VehicleRegistration data-test-id="premium-vehicle-registration">
                {reportData.registration}
              </VehicleRegistration>
              
              <GovUKHeadingL>
                {reportData.makeModel}
              </GovUKHeadingL>
              
              {reportData.isFreeReport && (
                <Alert severity="info" style={{ marginTop: '16px', marginBottom: '20px' }}>
                  {reportData.reportType === 'classic' 
                    ? "Enhanced vehicle information is provided at no cost for vehicles registered before 1996."
                    : "Enhanced vehicle information is provided at no cost for vehicles registered from 2018 onwards."}
                </Alert>
              )}
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Vehicle Data Section */}
            <div className="report-section">
              <DVLAVehicleData 
                registration={reportData.registration} 
                paymentId={paymentId} 
              />
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Insights Section - ADDED onDataLoad callback with memoized function */}
            <div className="report-section">
              <VehicleInsights 
                registration={reportData.registration} 
                vin={reportData.vin}
                paymentId={paymentId}
                onDataLoad={handleVehicleInsightsData}
              />
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Mileage Chart Section */}
            <div className="report-section">
              <VehicleMileageChart motData={motData} />
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Mileage Insights Section - ADDED onDataLoad callback with memoized function */}
            <div className="report-section">
              <VehicleMileageInsights 
                registration={reportData.registration} 
                paymentId={paymentId}
                onDataLoad={handleMileageInsightsData}
              />
            </div>
          </div>
<ReportSection>

  <AutoDataSection />
</ReportSection>


          <GovUKBody>
            <GovUKLink href={`/vehicle/${reportData.registration}`} noVisitedState>
              Return to basic vehicle details
            </GovUKLink>
          </GovUKBody>
        </GovUKMainWrapper>

      </GovUKContainer>
    );
  }
  
  // Fallback (should never reach here given the conditions above)
  return null;
};

export default PremiumReportPage;