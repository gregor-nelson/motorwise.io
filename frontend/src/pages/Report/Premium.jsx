import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

// MarketDash Professional Styled Components
import {
  PremiumContainer,
  ReportHeader,
  PremiumBadgeContainer,
  ReportTitle,
  VehicleRegistration,
  VehicleMakeModel,
  ReportSection,
  SectionHeader,
  DataPanel,
  DataTable,
  MetricsGrid,
  MetricCard,
  MetricLabel,
  MetricValue,
  MetricDescription,
  StatusIndicator,
  RiskScore,
  Alert,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ReportFooter
} from './PremiumStyles';

// Import components directly to maintain original behavior
import DVLAVehicleData from '../../components/Premium/DVLA/Header/DVLADataHeader';
import VehicleInsights from '../../components/Premium/DVLA/Insights/VehicleInsights';
import MileageChart3D from '../../components/Premium/DVLA/Mileage/Chart/MileageChart3D';
import VehicleMileageInsights from '../../components/Premium/DVLA/Mileage/MileageInsights/MileageInsights';
import AutoDataSection from '../../components/AutoData/DataTabs/DataTabs';

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

// Professional Error Message Component
const ErrorMessage = ({ message, variant = "info" }) => (
  <Alert variant={variant}>
    <div className="alert-content">
      <div className="alert-message">{message}</div>
    </div>
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
  
  // Simple clocking detection function
  const analyzeClockingRisk = (motTests) => {
    if (!motTests || motTests.length < 2) return motTests;
    
    // Sort by date to ensure chronological order
    const sortedTests = [...motTests].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
    
    return sortedTests.map((test, index) => {
      let clockingRisk = { level: 'LOW', evidence: [], score: 0 };
      
      if (index > 0 && test.rawMileage && sortedTests[index - 1].rawMileage) {
        const currentMileage = test.rawMileage;
        const previousMileage = sortedTests[index - 1].rawMileage;
        const mileageDiff = currentMileage - previousMileage;
        
        // Check for obvious clocking (negative mileage)
        if (mileageDiff < 0) {
          clockingRisk.level = 'CRITICAL';
          clockingRisk.score = 90;
          clockingRisk.evidence.push(`Mileage decreased by ${Math.abs(mileageDiff).toLocaleString()} miles`);
        }
        // Check for suspiciously low mileage increases
        else {
          const daysDiff = (new Date(test.rawDate) - new Date(sortedTests[index - 1].rawDate)) / (1000 * 60 * 60 * 24);
          const annualMileage = (mileageDiff / daysDiff) * 365.25;
          
          // Very low annual mileage (less than 500 miles per year)
          if (annualMileage < 500 && annualMileage > 0 && daysDiff > 300) {
            clockingRisk.level = 'MODERATE';
            clockingRisk.score = 40;
            clockingRisk.evidence.push(`Very low usage: ${Math.round(annualMileage).toLocaleString()} miles/year`);
          }
          // Check for round number patterns (ending in 000)
          else if (currentMileage % 1000 === 0 && mileageDiff > 0 && mileageDiff < 2000) {
            clockingRisk.level = 'MODERATE';
            clockingRisk.score = 35;
            clockingRisk.evidence.push('Suspicious round number pattern');
          }
        }
      }
      
      return {
        ...test,
        clockingRisk
      };
    });
  };
  
  // Transform MOT data function - enhanced with clocking detection
  const transformMotData = (apiData) => {
    if (!apiData || !apiData.motTests || apiData.motTests.length === 0) return [];
    
    const basicTransformed = apiData.motTests.map(test => {
      const testDate = new Date(test.completedDate);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = testDate.toLocaleDateString('en-GB', options);
      
      // Extract advisory information from defects
      const hasAdvisories = test.defects ? test.defects.some(d => 
        d.type === 'ADVISORY' || d.type === 'MINOR'
      ) : false;
      
      const advisoryCount = test.defects ? test.defects.filter(d => 
        d.type === 'ADVISORY' || d.type === 'MINOR'
      ).length : 0;
      
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
        // Add advisory information for 3D chart color coding
        hasAdvisories,
        advisoryCount,
      };
    });
    
    // Add clocking risk analysis
    const finalData = analyzeClockingRisk(basicTransformed);
    
    // Debug logging to verify clocking detection
    console.log('Premium.jsx: Clocking analysis results:', 
      finalData.filter(d => d.clockingRisk && d.clockingRisk.level !== 'LOW').map(d => ({
        date: d.date,
        level: d.clockingRisk.level,
        evidence: d.clockingRisk.evidence,
        rawMileage: d.rawMileage
      }))
    );
    
    return finalData;
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
  
  // Loading state - MarketDash styling
  if (loading) {
    return (
      <PremiumContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Preparing your vehicle report. This may take a moment...</LoadingText>
        </LoadingContainer>
      </PremiumContainer>
    );
  }
  
  // Error state - MarketDash styling
  if (error) {
    return (
      <PremiumContainer>
        <ErrorMessage variant="error" message={`We are unable to retrieve your vehicle report at this time. ${error}`} />
        <ReportFooter>
          <a href="/">Return to the homepage</a>
        </ReportFooter>
      </PremiumContainer>
    );
  }
  
  // Render report - MarketDash professional layout
  if (reportData) {
    return (
      <PremiumContainer>
        <div ref={reportContainerRef}>
          {/* Professional Report Header */}
          <ReportHeader>
            <PremiumBadgeContainer>
              {reportData.isFreeReport ? "ENHANCED" : "PREMIUM"}
            </PremiumBadgeContainer>
            <ReportTitle>Vehicle Report</ReportTitle>
            <VehicleRegistration data-test-id="premium-vehicle-registration">
              {reportData.registration}
            </VehicleRegistration>
            <VehicleMakeModel>{reportData.makeModel}</VehicleMakeModel>
            {reportData.isFreeReport && (
              <Alert variant="info">
                <div className="alert-content">
                  <div className="alert-message">
                    {reportData.reportType === 'classic'
                      ? "Enhanced vehicle information is provided at no cost for vehicles registered before 1996."
                      : "Enhanced vehicle information is provided at no cost for vehicles registered from 2018 onwards."}
                  </div>
                </div>
              </Alert>
            )}
          </ReportHeader>
            
          {/* DVLA Vehicle Data Section */}
          <ReportSection>
            <SectionHeader>
              <h2>Vehicle Overview</h2>
            </SectionHeader>
            <ErrorBoundary fallback={
              <ErrorMessage 
                variant="warning"
                message="The vehicle registration details are temporarily unavailable. Please try again later." 
              />
            }>
              <DVLAVehicleData registration={reportData.registration} paymentId={paymentId} />
            </ErrorBoundary>
          </ReportSection>

          {/* Vehicle Insights Section */}
          <ReportSection>
            <SectionHeader>
              <h2>Vehicle Insights</h2>
            </SectionHeader>
            <ErrorBoundary fallback={
              <ErrorMessage 
                variant="warning"
                message="The vehicle insights information is temporarily unavailable. Please try again later."
              />
            }>
              <VehicleInsights
                registration={reportData.registration}
                vin={reportData.vin}
                paymentId={paymentId}
                onDataLoad={handleVehicleInsightsData}
              />
            </ErrorBoundary>
          </ReportSection>
            
          {/* Technical Specifications Section */}
          <ReportSection>
            <SectionHeader>
              <h2>Technical Specifications</h2>
            </SectionHeader>
            <ErrorBoundary fallback={
              <ErrorMessage 
                variant="warning"
                message="The technical vehicle specifications are temporarily unavailable. Please try again later."
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
            
          {/* 3D Mileage History Section */}
          <ReportSection>
            <SectionHeader>
              <h2>3D Mileage History</h2>
            </SectionHeader>
            <ErrorBoundary fallback={
              <ErrorMessage 
                variant="warning"
                message="The MOT mileage history is temporarily unavailable. Please try again later."
              />
            }>
              {motData && motData.length > 0 ? (
                <MileageChart3D motData={motData} />
              ) : (
                <ErrorMessage variant="info" message="No MOT mileage history is available for this vehicle." />
              )}
            </ErrorBoundary>
          </ReportSection>
            
          {/* Mileage Insights Section */}
          <ReportSection>
            <SectionHeader>
              <h2>Mileage Insights</h2>
            </SectionHeader>
            <ErrorBoundary fallback={
              <ErrorMessage 
                variant="warning"
                message="The mileage analysis information is temporarily unavailable. Please try again later."
              />
            }>
              <VehicleMileageInsights
                registration={reportData.registration}
                paymentId={paymentId}
                onDataLoad={handleMileageInsightsData}
              />
            </ErrorBoundary>
          </ReportSection>
        </div>
          
        <ReportFooter>
          <a href={`/vehicle/${reportData.registration}`}>
            Return to standard vehicle details
          </a>
        </ReportFooter>
      </PremiumContainer>
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