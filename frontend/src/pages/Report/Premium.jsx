import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

// Removed styled-components - using Tailwind classes directly

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
const ErrorMessage = ({ message, variant = "info" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 text-green-700';
      case 'warning':
        return 'bg-transparent text-yellow-700';
      case 'error':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  const getIconClasses = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className={`rounded-lg p-4 md:p-6 mb-6 shadow-sm ${getVariantClasses()}`}>
      <div className="flex items-start">
        <i className={`ph ph-info text-lg mr-3 mt-0.5 ${getIconClasses()}`}></i>
        <div className="text-sm leading-relaxed">{message}</div>
      </div>
    </div>
  );
};

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
  
  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-1 sm:p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-medium text-neutral-900 mb-2">Preparing Your Report</div>
            <p className="text-sm text-neutral-600">Analyzing vehicle data and generating insights...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-1 sm:p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-sm">
          <ErrorMessage variant="error" message={`We are unable to retrieve your vehicle report at this time. ${error}`} />
          <div className="p-6 text-center border-t border-neutral-100">
            <a href="/" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200">
              Return to the homepage
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Render report
  if (reportData) {
    return (
      <div className="max-w-6xl mx-auto p-1 sm:p-4 md:p-6 lg:p-8">
        <div ref={reportContainerRef} className="space-y-12">
          {/* Report Header */}
          <div className="bg-white rounded-lg p-1 sm:p-4 md:p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center bg-neutral-900 text-white px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full">
                <i className="ph ph-star text-sm mr-2"></i>
                {reportData.isFreeReport ? "ENHANCED" : "PREMIUM"}
              </div>
            </div>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-neutral-900 mb-3 leading-tight tracking-tight">
                Vehicle Report
              </h1>
              <div className="font-mono text-2xl font-bold text-blue-600 mb-2 tracking-wide" data-test-id="premium-vehicle-registration">
                {reportData.registration}
              </div>
              <div className="text-lg font-medium text-neutral-900">
                {reportData.makeModel}
              </div>
            </div>
            {reportData.isFreeReport && (
              <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm">
                <div className="flex items-start">
                  <i className="ph ph-info text-lg text-blue-600 mr-3 mt-0.5"></i>
                  <div className="text-sm text-blue-700 leading-relaxed">
                    {reportData.reportType === 'classic'
                      ? "Enhanced vehicle information is provided at no cost for vehicles registered before 1996."
                      : "Enhanced vehicle information is provided at no cost for vehicles registered from 2018 onwards."}
                  </div>
                </div>
              </div>
            )}
          </div>
            
          {/* DVLA Vehicle Data Section */}
          <section className="bg-white rounded-lg p-1 sm:p-4 md:p-6 lg:p-8 shadow-sm ">
            <ErrorBoundary fallback={
              <ErrorMessage 
                variant="warning"
                message="The vehicle registration details are temporarily unavailable. Please try again later." 
              />
            }>
              <DVLAVehicleData registration={reportData.registration} paymentId={paymentId} />
            </ErrorBoundary>
          </section>

          {/* Vehicle Insights Section */}
          <section className="bg-white rounded-lg p-1 sm:p-4 md:p-6 lg:p-8 shadow-sm ">
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
          </section>
            
          {/* Technical Specifications Section */}
          <section className="bg-white rounded-lg p-1 sm:p-4 md:p-6 lg:p-8 shadow-sm ">
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
          </section>
            
          {/* 3D Mileage History Section */}
          <section className="bg-white rounded-lg p-1 sm:p-4 md:p-6 lg:p-8 shadow-sm ">
        
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
          </section>
            
          {/* Mileage Insights Section */}
          <section className="bg-white rounded-lg p-1 sm:p-4 md:p-6 lg:p-8 shadow-sm ">
            <div className="flex items-center mb-6">
              <i className="ph ph-detective text-lg text-blue-600 mr-3 mt-0.5"></i>
              <div>
                <h2 className="text-lg font-medium text-neutral-900">Mileage Insights</h2>
                <div className="text-xs text-neutral-600">Advanced mileage analysis and fraud detection</div>
              </div>
            </div>
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
          </section>
        </div>
          
          {/* Footer Navigation */}
          <div className="bg-neutral-50 rounded-lg p-6 shadow-sm text-center">
            <div className="flex items-center justify-center mb-3">
              <i className="ph ph-arrow-left text-sm text-blue-600 mr-2"></i>
              <a href={`/vehicle/${reportData.registration}`} className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200">
                Return to standard vehicle details
              </a>
            </div>
            <div className="text-xs text-neutral-500">
              Or search for another vehicle from the homepage
            </div>
          </div>
      </div>
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