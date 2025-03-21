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
import PDFGenerator from './PDF/PdfGenerator';
import AutoDataSection from '../../components/AutoData/DataTabs';
import RepairCalculator from '../../components/AutoData/RepairTimes/RateCalc';

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
  const [fullVehicleData, setFullVehicleData] = useState(null); // Added for full vehicle data
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
    if (paymentId === FREE_CLASSIC_PAYMENT_ID) {
      setIsFreeReport(true);
      setReportType('classic');
    } else if (paymentId === FREE_MODERN_PAYMENT_ID) {
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
          ? `${API_BASE_URL}/vehicle/registration/${registration}`
          : `${API_BASE_URL}/vehicle/registration/${registration}?paymentId=${paymentId}`;
        
        const response = await fetch(endpointUrl, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin',
        });
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch vehicle data';
          try {
            const errorData = await response.json();
            errorMessage = errorData.errorMessage || errorData.detail || errorMessage;
          } catch (e) {}
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

        setInsightsData({
          currentStatus: {
            driveabilityStatus: "Not Road Legal",
            motExpires: "20 March 2017 (Expired)",
            riskLevel: "High",
            riskFactors: [
              "MOT has expired - vehicle cannot legally be driven on public roads except to a pre-booked MOT test",
            ],
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
  
  // Transform MOT data function (unchanged)
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

  // Callback functions (unchanged)
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
  
  // PDF data readiness (unchanged)
  useEffect(() => {
    if (reportData && motData) {
      setPdfDataReady(true);
      if (insightsData && vehicleInsightsData && mileageInsightsData) {
        console.log("All PDF data including insights is ready");
      } else {
        console.log("Basic PDF data is ready, some insights may be missing");
      }
    } else {
      setPdfDataReady(false);
    }
  }, [reportData, insightsData, motData, vehicleInsightsData, mileageInsightsData]);
  
  // Loading state (unchanged)
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
  
  // Error state (unchanged)
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
  
  // Render report
  if (reportData) {
    return (
      <GovUKContainer>
        <GovUKMainWrapper>
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
              buttonClassName="pdf-download-button"
            />
          </div>
          
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
            
            <div className="report-section">
              <DVLAVehicleData registration={reportData.registration} paymentId={paymentId} />
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            <div className="report-section">
              <VehicleInsights
                registration={reportData.registration}
                vin={reportData.vin}
                paymentId={paymentId}
                onDataLoad={handleVehicleInsightsData}
              />
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            <div className="report-section">
              <VehicleMileageChart motData={motData} />
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
            <div className="report-section">
              <VehicleMileageInsights
                registration={reportData.registration}
                paymentId={paymentId}
                onDataLoad={handleMileageInsightsData}
              />
            </div>
            
            <GovUKSectionBreak className="govuk-section-break--visible govuk-section-break--m" />
            
           
            
            <ReportSection>
              <AutoDataSection
                vehicleData={fullVehicleData}
                loading={loading}
                error={error}
                registration={registration}
              />
            </ReportSection>
          </div>
          
          <GovUKBody>
            <GovUKLink href={`/vehicle/${reportData.registration}`} noVisitedState>
              Return to basic vehicle details
            </GovUKLink>
          </GovUKBody>
        </GovUKMainWrapper>
      </GovUKContainer>
    );
  }
  
  return null;
};

export default PremiumReportPage;