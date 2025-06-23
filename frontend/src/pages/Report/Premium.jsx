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

// Import components directly to maintain original behavior
import DVLAVehicleData from '../../components/Premium/DVLA/Header/DVLADataHeader';
import VehicleInsights from '../../components/Premium/DVLA/Insights/VehicleInsights';
import VehicleMileageChart from '../../components/Premium/DVLA/Mileage/Chart/MileageChart'; 
import VehicleMileageInsights from '../../components/Premium/DVLA/Mileage/MileageInsights/MileageInsights';
import PDFGenerator from './PDF/PdfGenerator';
import AutoDataSection from '../../components/AutoData/DataTabs';

// Configurations 
const API_CONFIG = {
  BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api/v1'
    : '/api/v1',
  PAYMENT_TYPES: {
    FREE_CLASSIC: 'free-classic-vehicle',
    FREE_MODERN: 'free-modern-vehicle'
  }
};

// Error message component with GOV.UK styling
const ErrorMessage = ({ message, severity = "info" }) => (
  <Alert severity={severity} style={{ margin: '20px 0' }}>
    {message}
  </Alert>
);

const PremiumReportPage = () => {
  // Route handling
  const { registration } = useParams();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const navigate = useNavigate();
  
  // State variables - keeping the original structure
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [fullVehicleData, setFullVehicleData] = useState(null);
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
  
  // Data loading flags to prevent recursion - keeping these as in original
  const vehicleInsightsLoaded = useRef(false);
  const mileageInsightsLoaded = useRef(false);
  
  // Effect for loading data - optimized but keeping core functionality
  useEffect(() => {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (paymentId === API_CONFIG.PAYMENT_TYPES.FREE_CLASSIC) {
      setIsFreeReport(true);
      setReportType('classic');
    } else if (paymentId === API_CONFIG.PAYMENT_TYPES.FREE_MODERN) {
      setIsFreeReport(true);
      setReportType('modern');
    }

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
        
        const endpointUrl = isFreeReport
          ? `${API_CONFIG.BASE_URL}/vehicle/registration/${registration}`
          : `${API_CONFIG.BASE_URL}/vehicle/registration/${registration}?paymentId=${paymentId}`;
        
        // Adding AbortController for cleanup
        const controller = new AbortController();
        const signal = controller.signal;
        
        const response = await fetch(endpointUrl, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin',
          signal
        });
        
        if (!response.ok) {
          let errorMessage = 'We are unable to retrieve the vehicle data at this time.';
          try {
            const errorData = await response.json();
            errorMessage = errorData.errorMessage || errorData.detail || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          throw new Error(errorMessage);
        }
        
        const vehicleData = await response.json();
        
        setFullVehicleData(vehicleData);
        
        setReportData({
          registration: registration,
          makeModel: `${vehicleData.make || 'Unknown'} ${vehicleData.model || ''}`.trim(),
          colour: vehicleData.primaryColour || vehicleData.colour || 'Unknown',
          vin: vehicleData.vin,
          isFreeReport: isFreeReport,
          reportType: reportType,
          engineSize: vehicleData.engineCapacity,
          fuelType: vehicleData.fuelType,
          manufactureDate: vehicleData.manufactureDate,
          firstRegistrationDate: vehicleData.registrationDate,
          taxStatus: vehicleData.taxStatus,
          taxDueDate: vehicleData.taxDueDate,
          motStatus: vehicleData.motStatus,
          motExpiry: vehicleData.motExpiryDate,
        });
        
        if (vehicleData.motTests && vehicleData.motTests.length > 0) {
          const transformedMotData = transformMotData(vehicleData);
          setMotData(transformedMotData);
        }
        
        // Cleanup function
        return () => {
          controller.abort();
        };
        
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        console.error('Error fetching vehicle data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicleData();
  }, [registration, paymentId, isFreeReport, reportType]);
  
  // Transform MOT data function - optimized but keeping same logic
  const transformMotData = (apiData) => {
    if (!apiData || !apiData.motTests || apiData.motTests.length === 0) return [];
    
    return apiData.motTests.map(test => {
      const testDate = new Date(test.completedDate);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = testDate.toLocaleDateString('en-GB', options);
      
      return {
        date: formattedDate,
        testDate: formattedDate,
        testResult: test.testResult === 'PASSED' ? 'PASS' : 'FAIL',
        status: test.testResult === 'PASSED' ? 'PASS' : 'FAIL',
        mileage: test.odometerResultType === 'READ' 
          ? parseInt(test.odometerValue).toLocaleString('en-GB')
          : 'Not recorded',
        testNumber: test.motTestNumber || 'Not available',
        expiry: test.expiryDate 
          ? new Date(test.expiryDate).toLocaleDateString('en-GB', options)
          : null,
        expiryDate: test.expiryDate 
          ? new Date(test.expiryDate).toLocaleDateString('en-GB', options)
          : null,
        rawMileage: test.odometerResultType === 'READ' ? parseInt(test.odometerValue) : null,
        rawDate: test.completedDate,
      };
    });
  };

  // Callback functions - keeping the original implementation for data flow integrity
  const handleVehicleInsightsData = useCallback((data) => {
    if (!vehicleInsightsLoaded.current || JSON.stringify(data) !== JSON.stringify(vehicleInsightsData)) {
      console.log("Received vehicle insights data:", data);
      setVehicleInsightsData(data);
      vehicleInsightsLoaded.current = true;
    }
  }, [vehicleInsightsData]);
  
  const handleMileageInsightsData = useCallback((data) => {
    if (!mileageInsightsLoaded.current || JSON.stringify(data) !== JSON.stringify(mileageInsightsData)) {
      console.log("Received mileage insights data:", data);
      setMileageInsightsData(data);
      mileageInsightsLoaded.current = true;
    }
  }, [mileageInsightsData]);
  
  // PDF data readiness - simplified but preserving core functionality
  useEffect(() => {
    setPdfDataReady(!!reportData && !!motData);
  }, [reportData, motData]);
  
  // Loading state - improved styling
  if (loading) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
          <GovUKLoadingContainer>
            <GovUKLoadingSpinner />
            <GovUKBody>Preparing your vehicle report. This may take a moment...</GovUKBody>
          </GovUKLoadingContainer>
        </GovUKMainWrapper>
      </GovUKContainer>
    );
  }
  
  // Error state - improved styling
  if (error) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
          <Alert severity="error" style={{ marginBottom: '20px' }}>
            We are unable to retrieve your vehicle report at this time. {error}
          </Alert>
          <GovUKBody>
            <GovUKLink href="/" noVisitedState>
              Return to the homepage
            </GovUKLink>
          </GovUKBody>
        </GovUKMainWrapper>
      </GovUKContainer>
    );
  }
  
  // Render report - keeping the original structure but with improved error handling
  if (reportData) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
          {/* PDF Generator commented out as in original */}
          {/* <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
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
              buttonClassName="pdf-download-button"
            />
          </div> */}
          
          <div ref={reportContainerRef}>
            <div className="report-section">
              <PremiumBadge>
                {reportData.isFreeReport ? "ENHANCED" : "PREMIUM"}
              </PremiumBadge>
              <GovUKHeadingXL>Vehicle Report</GovUKHeadingXL>
              <VehicleRegistration data-test-id="premium-vehicle-registration">
                {reportData.registration}
              </VehicleRegistration>
              <GovUKHeadingL>{reportData.makeModel}</GovUKHeadingL>
              {reportData.isFreeReport && (
                <Alert severity="info" style={{ marginTop: '16px', marginBottom: '20px' }}>
                  {reportData.reportType === 'classic'
                    ? "Enhanced vehicle information is provided at no cost for vehicles registered before 1996."
                    : "Enhanced vehicle information is provided at no cost for vehicles registered from 2018 onwards."}
                </Alert>
              )}
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* DVLA Vehicle Data section with error fallback */}
            <div className="report-section">
              <ErrorBoundary fallback={
                <ErrorMessage 
                  message="The vehicle registration details are temporarily unavailable. Please try again later." 
                  severity="warning"
                />
              }>
                <DVLAVehicleData registration={reportData.registration} paymentId={paymentId} />
              </ErrorBoundary>
            </div>

             {/* Vehicle Insights section - keeping original implementation */}
            <div className="report-section">
              <ErrorBoundary fallback={
                <ErrorMessage 
                  message="The vehicle insights information is temporarily unavailable. Please try again later."
                  severity="warning"
                />
              }>
                <VehicleInsights
                  registration={reportData.registration}
                  vin={reportData.vin}
                  paymentId={paymentId}
                  onDataLoad={handleVehicleInsightsData}
                />
              </ErrorBoundary>
            </div>
            
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
             {/* AutoData section */}
             <ReportSection>
              <ErrorBoundary fallback={
                <ErrorMessage 
                  message="The technical vehicle specifications are temporarily unavailable. Please try again later."
                  severity="warning"
                />
              }>
                <AutoDataSection
                  vehicleData={fullVehicleData}
                  loading={loading}
                  error={error}
                  registration={registration}
                />
              </ErrorBoundary>
            </ReportSection>
            
           
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Mileage Chart section */}
            <div className="report-section">
              <ErrorBoundary fallback={
                <ErrorMessage 
                  message="The MOT mileage history is temporarily unavailable. Please try again later."
                  severity="warning"
                />
              }>
                {motData && motData.length > 0 ? (
                  <VehicleMileageChart motData={motData} />
                ) : (
                  <ErrorMessage message="No MOT mileage history is available for this vehicle." />
                )}
              </ErrorBoundary>
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            {/* Mileage Insights section */}
            <div className="report-section">
              <ErrorBoundary fallback={
                <ErrorMessage 
                  message="The mileage analysis information is temporarily unavailable. Please try again later."
                  severity="warning"
                />
              }>
                <VehicleMileageInsights
                  registration={reportData.registration}
                  paymentId={paymentId}
                  onDataLoad={handleMileageInsightsData}
                />
              </ErrorBoundary>
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
           
          </div>
          
          <GovUKBody style={{ marginTop: '30px' }}>
            <GovUKLink href={`/vehicle/${reportData.registration}`} noVisitedState>
              Return to standard vehicle details
            </GovUKLink>
          </GovUKBody>
        </GovUKMainWrapper>
      </GovUKContainer>
    );
  }
  
  return null;
};

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Section error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default React.memo(PremiumReportPage);