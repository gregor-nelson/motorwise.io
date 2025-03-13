// Properly define ORANGE color using theme constants
import { useEffect, useCallback, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  GovUKHeadingM,
  COLORS,
  commonFontStyles,
  BREAKPOINTS
} from '../../../../../styles/theme';

// Import styled components with improved styling
import {
  ChartContainer,
  InfoBox,
  ControlPanel,
  ControlButton,
  LoadingSpinner,
  ErrorMessage,
  hexToRgb,
  GOVUK_COLORS
} from './VehicleMileageChartStyles';

// Define ORANGE properly using the theme colors
const ORANGE = COLORS.YELLOW || '#fd0'; // Using proper GOV.UK yellow from theme

/**
 * Optimized D3-first implementation of the Vehicle Mileage Chart
 * Focuses only on the visualization with interactive tooltips,
 * removing redundant text information boxes
 */
export default function VehicleMileageChart({ registration, vin }) {
  // Chart refs and containers
  const svgRef = useRef(null);
  const chartContainerRef = useRef(null);
  const tooltipRef = useRef(null);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    mileageData: [],
    anomalies: [],
    inactivityPeriods: [],
    averageAnnualMileage: null
  });
  
  // Feature toggles
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showInactivePeriods, setShowInactivePeriods] = useState(true);
  const [showTrendline, setShowTrendline] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // Device detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 650);
  const [isTouchDevice, setIsTouchDevice] = useState(
    'ontouchstart' in window || navigator.maxTouchPoints > 0
  );
  
  // Define margin at component level so it's accessible to all functions
  const margin = {
    top: isMobile ? 20 : 40,
    right: isMobile ? 15 : 50,
    bottom: isMobile ? 30 : 40,
    left: isMobile ? 40 : 50 // Increased left margin for better axis labels visibility
  };
  
  // Handle viewport changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < parseInt(BREAKPOINTS.MOBILE, 10));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Add global styles for mobile tooltips with theme styling
  useEffect(() => {
    if (!document.getElementById('mobile-tooltip-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'mobile-tooltip-styles';
      styleElement.textContent = `
        @media (max-width: ${BREAKPOINTS.MOBILE}) {
          .d3-tooltip {
            max-width: 80vw !important;
            padding: 15px !important;
            font-size: 0.875rem !important;
            font-family: "GDS Transport", arial, sans-serif !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }
          .d3-tooltip hr {
            margin: 10px 0 !important;
            border: 0 !important;
            height: 1px !important;
            background-color: ${COLORS.MID_GREY} !important;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    return () => {
      const styleElement = document.getElementById('mobile-tooltip-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  // Handle scrolling for mobile tooltips
  const handleScroll = useCallback(() => {
    if (selectedPoint && tooltipRef.current) {
      // Hide tooltip during scroll
      tooltipRef.current.style("visibility", "hidden");
      
      // Show it again after scrolling stops
      clearTimeout(window.scrollTimer);
      window.scrollTimer = setTimeout(() => {
        if (selectedPoint && tooltipRef.current) {
          tooltipRef.current.style("visibility", "visible");
        }
      }, 100);
    }
  }, [selectedPoint]);
  
  // Set up scroll handler
  useEffect(() => {
    if (isTouchDevice) {
      window.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(window.scrollTimer);
    };
  }, [isTouchDevice, handleScroll]);

  // Clean up D3 on unmount
  useEffect(() => {
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
      d3.selectAll(".d3-tooltip").remove();
    };
  }, []);

  // Fetch and process data - RESTORED FROM ORIGINAL VERSION
  useEffect(() => {
    if (!registration && !vin) {
      return;
    }

    setLoading(true);
    setError(null);

    const fetchVehicleData = async () => {
      try {
        const endpoint = registration
          ? `/api/v1/vehicle/registration/${registration}`
          : `/api/v1/vehicle/vin/${vin}`;

        const baseUrl = process.env.NODE_ENV === 'development'
          ? 'http://localhost:8000'
          : '';

        const response = await fetch(`${baseUrl}${endpoint}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.errorMessage || `Failed to fetch vehicle data: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const vehicleData = await response.json();

        if (!vehicleData || !vehicleData.motTests || !Array.isArray(vehicleData.motTests)) {
          throw new Error('Invalid data format received from server');
        }

        processMotData(vehicleData.motTests);
      } catch (err) {
        setError(err.message || 'Failed to fetch vehicle data');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [registration, vin]);

  // Process MOT test data with added detection of close temporal events
  const processMotData = useCallback((motTests) => {
    if (!motTests || motTests.length === 0) {
      setChartData({
        mileageData: [],
        anomalies: [],
        inactivityPeriods: [],
        averageAnnualMileage: null
      });
      return;
    }

    const formattedData = motTests.map(test => {
      let dateStr = '';
      let parsedDate = new Date(0);
      try {
        if (test.completedDate) {
          const date = new Date(test.completedDate);
          const day = date.getDate();
          const month = date.toLocaleString('default', { month: 'long' });
          const year = date.getFullYear();
          dateStr = `${day} ${month} ${year}`;
          parsedDate = date;
        }
      } catch (err) {
        console.warn('Error parsing date:', err);
        dateStr = test.completedDate || '';
      }

      let mileageStr = '0';
      let numericMileage = 0;
      try {
        if (test.odometerValue) {
          numericMileage = parseInt(test.odometerValue, 10);
          mileageStr = String(numericMileage);
        }
      } catch (err) {
        console.warn('Error formatting mileage:', err);
        mileageStr = test.odometerValue || '0';
      }

      let testStatus = 'UNKNOWN';
      if (test.testResult) {
        const normalizedResult = String(test.testResult).trim().toUpperCase();
        testStatus = normalizedResult;
      }

      return {
        date: parsedDate,
        formattedDate: parsedDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        mileage: numericMileage,
        formattedMileage: mileageStr,
        testResult: testStatus,
        originalTest: test
      };
    })
      .filter(test => !isNaN(test.mileage) && test.mileage > 0 && test.date > new Date(1990, 0, 1))
      .sort((a, b) => a.date - b.date);

    // Identify close temporal events (tests within 14 days of each other)
    // We'll add vertical offsets to these points to make them more distinct
    const MIN_DAY_DIFF = 14; // 14 days threshold for considering events "close" in time
    const processedData = [...formattedData];
    
    // Initialize closeEvents and verticalOffset for all data points first
    for (let i = 0; i < processedData.length; i++) {
      processedData[i].closeEvents = [];
      processedData[i].verticalOffset = 0;
    }
    
    // Now identify close events
    for (let i = 0; i < processedData.length; i++) {
      // Look ahead to find close events
      for (let j = i + 1; j < processedData.length; j++) {
        const daysDiff = (processedData[j].date - processedData[i].date) / (1000 * 60 * 60 * 24);
        if (daysDiff <= MIN_DAY_DIFF) {
          processedData[i].closeEvents.push(j);
          processedData[j].closeEvents.push(i);
        } else {
          break; // No need to check further if we've passed the time window
        }
      }
    }
    
    // Second pass to assign offsets to close events
    // We'll use a simple algorithm to assign different vertical offsets
    for (let i = 0; i < processedData.length; i++) {
      if (processedData[i].closeEvents.length > 0) {
        // Group contains the current point and all its close neighbors
        const group = [i, ...processedData[i].closeEvents];
        
        // Sort by result to ensure consistent handling
        group.sort((a, b) => {
          // Sort by test result first (PASS before FAIL)
          const aPass = processedData[a].testResult.includes('PASS') ? 1 : 0;
          const bPass = processedData[b].testResult.includes('PASS') ? 1 : 0;
          if (aPass !== bPass) return bPass - aPass;
          
          // Then by date
          return processedData[a].date - processedData[b].date;
        });
        
        // Assign alternating offsets (positive for pass, negative for fail)
        for (let j = 0; j < group.length; j++) {
          const idx = group[j];
          if (processedData[idx].verticalOffset === 0) { // Only assign if not already assigned
            const isPassing = processedData[idx].testResult.includes('PASS');
            const offset = isPassing ? 0 : -20; // 20 units down for fails
            processedData[idx].verticalOffset = offset;
          }
        }
      }
    }

    const anomalies = findAnomalies(processedData);
    const inactivityPeriods = findInactivityPeriods(processedData);
    const ratesData = calculateMileageRates(processedData);

    // Calculate average annual mileage using linear regression for better accuracy
    let averageAnnualMileage = null;
    if (processedData.length >= 2) {
      const xValues = processedData.map(d => d.date.getTime());
      const yValues = processedData.map(d => d.mileage);
      const n = xValues.length;
      const sumX = xValues.reduce((a, b) => a + b, 0);
      const sumY = yValues.reduce((a, b) => a + b, 0);
      const sumXY = xValues.map((x, i) => x * yValues[i]).reduce((a, b) => a + b, 0);
      const sumXX = xValues.map(x => x * x).reduce((a, b) => a + b, 0);
      
      // Calculate slope - miles per millisecond
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      
      // Convert to annual mileage
      averageAnnualMileage = Math.round(slope * (365.25 * 24 * 60 * 60 * 1000));
      
      // Validate the result - if negative or unrealistically high, fall back to simpler calculation
      if (averageAnnualMileage < 0 || averageAnnualMileage > 100000) {
        const firstRecord = processedData[0];
        const lastRecord = processedData[processedData.length - 1];
        const totalMileage = lastRecord.mileage - firstRecord.mileage;
        const timeSpanMs = lastRecord.date.getTime() - firstRecord.date.getTime();
        const timeSpanYears = timeSpanMs / (1000 * 60 * 60 * 24 * 365.25);
        
        if (timeSpanYears >= 0.5) {
          averageAnnualMileage = Math.round(totalMileage / timeSpanYears);
        }
      }
    }

    // Pre-compute clocking points to avoid repeated calculations during rendering
    const clockingAnomalies = anomalies.filter(a => a.type === 'decrease');
    const formattedDataWithFlags = processedData.map(point => {
      const isClockingPoint = clockingAnomalies.some(a => 
        a.details.current.date.getTime() === point.date.getTime() || 
        a.details.previous.date.getTime() === point.date.getTime()
      );
      
      return {
        ...point,
        isClockingPoint
      };
    });

    setChartData({
      mileageData: formattedDataWithFlags,
      anomalies,
      inactivityPeriods,
      averageAnnualMileage,
      ratesData,
      // Add a flag to indicate if vehicle has been clocked
      hasBeenClocked: anomalies.some(a => a.type === 'decrease')
    });
  }, []);

  // Improved anomaly detection with better handling of negative mileage
  const findAnomalies = useCallback((mileageData) => {
    const anomalyList = [];
    if (mileageData.length < 2) {
      return anomalyList;
    }

    const ANNUAL_MILEAGE_THRESHOLD = 40000;
    const SHORT_INTERVAL_DAILY_THRESHOLD = 250;
    const UK_AVG_DAILY_MILEAGE = 8000 / 365;

    const getExpectedMileageRange = (daysDiff) => {
      if (daysDiff <= 30) return 5.0;
      if (daysDiff <= 90) return 4.0;
      if (daysDiff <= 180) return 3.0;
      if (daysDiff <= 365) return 2.5;
      return 2.0;
    };

    for (let i = 1; i < mileageData.length; i++) {
      const prevReading = mileageData[i - 1];
      const currentReading = mileageData[i];

      // Ensure we have at least 1 day difference to avoid division by zero
      const daysDiff = Math.max(1, (currentReading.date.getTime() - prevReading.date.getTime()) / (1000 * 60 * 60 * 24));
      const mileageDiff = currentReading.mileage - prevReading.mileage;

      // Handle negative mileage (clocking) as high severity anomaly
      if (mileageDiff < 0) {
        let severity = "high"; // All mileage decreases are high severity
        
        // Fixed the order of conditions for proper categorization
        let severityDetail = "critical";
        if (Math.abs(mileageDiff) < 100) {
          severityDetail = "minor";
        } else if (Math.abs(mileageDiff) < 1000) {
          severityDetail = "major";
        }

        const anomaly = {
          index: i,
          date: currentReading.date,
          type: 'decrease',
          severity, // Always high for UI
          severityDetail, // For potential further UI refinement
          message: `Mileage decreased by ${Math.abs(mileageDiff).toLocaleString()} miles from previous reading`,
          details: {
            current: currentReading,
            previous: prevReading,
            diff: mileageDiff,
            timeBetweenReadings: daysDiff
          }
        };
        anomalyList.push(anomaly);
      }
      else if (mileageDiff > 0 && daysDiff > 0) {
        const dailyAverage = mileageDiff / daysDiff;
        const expectedMaxDaily = UK_AVG_DAILY_MILEAGE * getExpectedMileageRange(daysDiff);
        const annualizedMileage = dailyAverage * 365;

        if (
          (daysDiff >= 300 && annualizedMileage > ANNUAL_MILEAGE_THRESHOLD) ||
          (daysDiff < 300 && daysDiff > 7 && dailyAverage > expectedMaxDaily) ||
          dailyAverage > SHORT_INTERVAL_DAILY_THRESHOLD
        ) {
          let severity = "medium";

          if (annualizedMileage > ANNUAL_MILEAGE_THRESHOLD * 1.5 ||
            dailyAverage > SHORT_INTERVAL_DAILY_THRESHOLD * 1.5) {
            severity = "high";
          } else if (annualizedMileage < ANNUAL_MILEAGE_THRESHOLD * 1.2 &&
            dailyAverage < SHORT_INTERVAL_DAILY_THRESHOLD * 1.2) {
            severity = "low";
          }

          let message = `Unusually high mileage increase (${Math.round(dailyAverage)} miles/day, ${Math.round(annualizedMileage).toLocaleString()} miles/year equivalent)`;

          if (annualizedMileage > ANNUAL_MILEAGE_THRESHOLD) {
            message += ` - well above typical UK average of 8,000 miles/year`;
          }

          const anomaly = {
            index: i,
            date: currentReading.date,
            type: 'spike',
            severity,
            message: message,
            details: {
              current: currentReading,
              previous: prevReading,
              diff: mileageDiff,
              days: daysDiff,
              dailyAvg: dailyAverage,
              annualizedMileage: annualizedMileage
            }
          };
          anomalyList.push(anomaly);
        }
      }
    }
    return anomalyList;
  }, []);

  // Improved inactivity period detection that excludes negative mileage cases
  const findInactivityPeriods = useCallback((mileageData) => {
    const inactivityList = [];
    if (mileageData.length < 2) {
      return inactivityList;
    }

    const UK_AVG_DAILY_MILEAGE = 8000 / 365;
    const LOW_ACTIVITY_THRESHOLD = UK_AVG_DAILY_MILEAGE * 0.25;
    const MIN_INACTIVITY_DAYS = 60;

    for (let i = 1; i < mileageData.length; i++) {
      const prevReading = mileageData[i - 1];
      const currentReading = mileageData[i];

      const daysDiff = Math.max(1, (currentReading.date.getTime() - prevReading.date.getTime()) / (1000 * 60 * 60 * 24));
      const mileageDiff = currentReading.mileage - prevReading.mileage;

      // Skip negative mileage entries as these should be classified as anomalies, not inactivity
      if (mileageDiff < 0) continue;
      
      if (daysDiff < MIN_INACTIVITY_DAYS) continue;

      const dailyAverage = mileageDiff / daysDiff;

      if (dailyAverage < LOW_ACTIVITY_THRESHOLD) {
        const monthsDiff = Math.round(daysDiff / 30);
        let description;
        let severity = "medium";

        if (dailyAverage === 0) {
          description = `Vehicle appears to have been unused for ${monthsDiff} months`;
          severity = "high";
        } else if (dailyAverage < LOW_ACTIVITY_THRESHOLD * 0.5) {
          description = `Very low usage period (${Math.round(dailyAverage)} miles/day for ${monthsDiff} months)`;
          severity = "medium";
        } else {
          description = `Below average usage (${Math.round(dailyAverage)} miles/day for ${monthsDiff} months)`;
          severity = "low";
        }

        const inactivityPeriod = {
          start: prevReading,
          end: currentReading,
          days: daysDiff,
          dailyAverage: dailyAverage,
          description: description,
          severity: severity
        };
        inactivityList.push(inactivityPeriod);
      }
    }
    return inactivityList;
  }, []);

  // Improved mileage rate calculation that handles negative values and short time periods
  const calculateMileageRates = useCallback((mileageData) => {
    const rates = [];
    if (mileageData.length < 2) {
      return rates;
    }

    for (let i = 1; i < mileageData.length; i++) {
      const prevPoint = mileageData[i - 1];
      const currPoint = mileageData[i];

      const timeDiffMs = currPoint.date.getTime() - prevPoint.date.getTime();
      const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
      
      // Skip very short time periods (less than 12 hours) as they may produce unreliable rates
      if (timeDiffDays < 0.5) {
        continue;
      }
      
      const adjustedTimeDiffDays = Math.max(1, timeDiffDays); // Ensure at least 1 day to avoid division by zero
      const mileageDiff = currPoint.mileage - prevPoint.mileage;

      // Calculate rates including for negative mileage, but flag them
      const dailyRate = mileageDiff / adjustedTimeDiffDays;
      const annualizedRate = dailyRate * 365;
      const isNegative = mileageDiff < 0;
      const isReliable = timeDiffDays >= 7; // Mark as reliable only if at least a week of data

      const rateData = {
        startDate: prevPoint.date,
        endDate: currPoint.date,
        startMileage: prevPoint.mileage,
        endMileage: currPoint.mileage,
        periodDays: Math.round(timeDiffDays),
        adjustedPeriodDays: Math.round(adjustedTimeDiffDays),
        dailyRate: dailyRate,
        annualizedRate: annualizedRate,
        isNegative: isNegative,
        isReliable: isReliable,
        formattedPeriod: `${prevPoint.formattedDate} to ${currPoint.formattedDate}`
      };
      rates.push(rateData);
    }
    return rates;
  }, []);

  // Filter data based on selected time range
  const getFilteredData = useCallback(() => {
    // Add defensive checks to ensure chartData has the expected structure
    if (!chartData || !chartData.mileageData || !Array.isArray(chartData.mileageData) || chartData.mileageData.length === 0) {
      console.log("Empty or invalid chartData:", chartData);
      return { 
        mileageData: [], 
        anomalies: [], 
        inactivityPeriods: [],
        ratesData: [] 
      };
    }

    if (selectedTimeRange === 'all') {
      // Make sure all properties are defined with fallbacks
      return {
        ...chartData,
        anomalies: chartData.anomalies || [],
        inactivityPeriods: chartData.inactivityPeriods || [],
        ratesData: chartData.ratesData || []
      };
    }

    const lastDate = chartData.mileageData[chartData.mileageData.length - 1].date;
    let startDate = new Date(lastDate);

    switch (selectedTimeRange) {
      case '2y':
        startDate.setFullYear(startDate.getFullYear() - 2);
        break;
      case '5y':
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      case '10y':
        startDate.setFullYear(startDate.getFullYear() - 10);
        break;
      default:
        return chartData;
    }

    const filteredMileageData = chartData.mileageData.filter(d => d.date >= startDate);
    const filteredAnomalies = chartData.anomalies.filter(a => a.date >= startDate);
    const filteredInactivityPeriods = chartData.inactivityPeriods.filter(p =>
      p.end.date >= startDate
    );
    const filteredRatesData = chartData.ratesData ?
      chartData.ratesData.filter(r => r.endDate >= startDate) : [];

    return {
      ...chartData,
      mileageData: filteredMileageData,
      anomalies: filteredAnomalies,
      inactivityPeriods: filteredInactivityPeriods,
      ratesData: filteredRatesData
    };
  }, [chartData, selectedTimeRange]);

  // Create tooltip - separated from main rendering function with improved styling
  const createTooltip = useCallback(() => {
    d3.selectAll(".d3-tooltip").remove();
    
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", COLORS.WHITE)
      .style("border-left", `5px solid ${COLORS.BLUE}`)
      .style("border-radius", "0")
      .style("padding", isMobile ? "15px" : "20px")
      .style("box-shadow", `0 4px 0 ${COLORS.MID_GREY}`)
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("font-size", isMobile ? "0.875rem" : "1rem")
      .style("line-height", "1.5")
      .style("font-weight", "400")
      .style("color", COLORS.BLACK)
      .style("pointer-events", "none")
      .style("z-index", 100)
      .style("max-width", isMobile ? "calc(100vw - 40px)" : "350px")
      .style("word-break", "break-word")
      .style("-webkit-font-smoothing", "antialiased")
      .style("-moz-osx-font-smoothing", "grayscale");
    
    // Add close button for mobile tooltips with GOV.UK styling
    if (isMobile) {
      tooltip.append("div")
        .style("position", "absolute")
        .style("top", "10px")
        .style("right", "10px")
        .style("width", "24px")
        .style("height", "24px")
        .style("cursor", "pointer")
        .style("background-color", COLORS.LIGHT_GREY)
        .style("border-radius", "50%")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("font-size", "16px")
        .style("line-height", "1")
        .style("font-weight", "bold")
        .style("color", COLORS.BLACK)
        .text("×")
        .on("click", () => {
          tooltip.style("visibility", "hidden");
          setSelectedPoint(null);
          
          // Reset all points
          d3.selectAll(".mileage-point, .anomaly")
            .attr("r", function(d) {
              if (d.type) return isMobile ? 10 : 9;
              return isMobile ? 8 : 7;
            })
            .attr("stroke-width", isMobile ? 2 : 1.5)
            .attr("stroke", COLORS.WHITE);
        });
    }
    
    tooltipRef.current = tooltip;
    return tooltip;
  }, [isMobile]);

  // Setup chart dimensions - separated from main rendering function
  const setupChartDimensions = useCallback(() => {
    if (!chartContainerRef.current) return null;
    
    const containerWidth = chartContainerRef.current.clientWidth;
    const containerHeight = chartContainerRef.current.clientHeight;

    // Using the margin from the component level, not defining it locally
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create SVG container with responsive viewBox
    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img") // Accessibility improvement
      .attr("aria-label", "Vehicle mileage history chart showing readings over time")
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("-webkit-font-smoothing", "antialiased")
      .style("-moz-osx-font-smoothing", "grayscale");
    
    // Create chart group with margin
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    return { svg, chart, containerWidth, containerHeight, width, height };
  }, [isMobile, margin]);

  // D3 Chart Rendering with mobile and touch enhancements - refactored into smaller functions
  const renderChart = useCallback(() => {
    // Add console logging to help with debugging
    console.log("Rendering chart with chartData:", chartData);
    
    const filteredData = getFilteredData();
    console.log("Filtered data:", filteredData);
    
    // Add defensive checks to ensure we have valid data
    if (!filteredData) {
      console.error("No filtered data available");
      return;
    }
    
    const { mileageData = [], anomalies = [], inactivityPeriods = [] } = filteredData;
    
    console.log("Chart elements:", {
      mileageData: mileageData.length,
      anomalies: anomalies.length,
      inactivityPeriods: inactivityPeriods.length
    });

    if (!mileageData.length || !svgRef.current || !chartContainerRef.current) {
      console.log("Skipping chart render - missing required elements");
      return;
    }

    // Clear any existing chart content
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Setup chart dimensions and create container
    const { chart, width, height } = setupChartDimensions();
    
    if (!chart) return; // Guard against missing chart element
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(mileageData, d => d.date))
      .range([0, width])
      .nice();

    const yMin = d3.min(mileageData, d => d.mileage);
    const yMax = d3.max(mileageData, d => d.mileage);
    const yBuffer = (yMax - yMin) * 0.1;

    const yScale = d3.scaleLinear()
      .domain([Math.max(0, yMin - yBuffer), yMax + yBuffer])
      .range([height, 0])
      .nice();
    
    // Draw axes and grid with GOV.UK styling
    // Draw x-axis
    chart.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(isMobile ? 4 : 6) // Fewer ticks on mobile
        .tickFormat(d3.timeFormat(isMobile ? "%b '%y" : "%b %Y"))) // Improved format
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", isMobile ? "10px" : "12px") // Adjusted for GOV.UK style
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("color", COLORS.BLACK)
      .style("font-weight", "400")
      .attr("dy", "1em");

    // Draw y-axis with GOV.UK styling
    chart.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale)
        .ticks(isMobile ? 5 : 6) // Fewer ticks on mobile
        .tickFormat(d => d3.format(",")(d)))
      .selectAll("text")
      .style("font-size", isMobile ? "10px" : "12px")
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("color", COLORS.BLACK)
      .style("font-weight", "400");

    // Style axis lines
    chart.selectAll(".domain, .tick line")
      .style("stroke", COLORS.MID_GREY)
      .style("stroke-width", 1);

    // Add y-axis label with GOV.UK styling
    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + (isMobile ? 10 : 15))
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", isMobile ? "10px" : "12px")
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("font-weight", "700")
      .style("color", COLORS.BLACK)
      .text("Mileage");

    // Add grid with theme colors - more subtle styling
    chart.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(isMobile ? 4 : 6)
        .tickSize(-height)
        .tickFormat(""))
      .selectAll("line")
      .style("stroke", COLORS.LIGHT_GREY)
      .style("stroke-opacity", 0.5);

    chart.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .ticks(isMobile ? 5 : 6)
        .tickSize(-width)
        .tickFormat(""))
      .selectAll("line")
      .style("stroke", COLORS.LIGHT_GREY)
      .style("stroke-opacity", 0.5);

    chart.selectAll(".domain").style("stroke", COLORS.MID_GREY).style("stroke-opacity", 0.5);
    
    // Draw inactive periods if enabled - with improved styling
    if (showInactivePeriods) {
      inactivityPeriods.forEach(period => {
        // Safely use hexToRgb with fallbacks for null/undefined colors
        const fillColor = period.severity === "high" ?
          `rgba(${hexToRgb(COLORS.RED)}, 0.15)` :
          period.severity === "medium" ?
            `rgba(${hexToRgb(ORANGE)}, 0.15)` :
            `rgba(${hexToRgb(COLORS.MID_GREY)}, 0.15)`;

        const strokeColor = period.severity === "high" ?
          COLORS.RED :
          period.severity === "medium" ?
            ORANGE :
            COLORS.MID_GREY;

        chart.append("rect")
          .attr("class", "inactive-period")
          .attr("x", xScale(period.start.date))
          .attr("y", 0)
          .attr("width", xScale(period.end.date) - xScale(period.start.date))
          .attr("height", height)
          .attr("fill", fillColor)
          .attr("stroke", strokeColor)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "5,5")
          .style("pointer-events", "all")
          .attr("tabindex", 0) // Accessibility improvement
          .attr("role", "button") // Accessibility improvement
          .attr("aria-label", `Inactive period from ${period.start.formattedDate} to ${period.end.formattedDate}`) // Accessibility improvement
          .on("mouseover", function(event) {
            if (isTouchDevice) return; // Skip for touch devices
            
            tooltip
              .html(`
                <div style="font-weight: 700; margin-bottom: 8px; font-size: ${isMobile ? '16px' : '18px'};">Inactive Period</div>
                <div style="margin-bottom: 3px;"><strong>From:</strong> ${period.start.formattedDate}</div>
                <div style="margin-bottom: 3px;"><strong>To:</strong> ${period.end.formattedDate}</div>
                <div style="margin-bottom: 8px;"><strong>Mileage:</strong> ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
                <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 10px 0;">
                <div style="margin-top: 8px; color: ${COLORS.BLACK}; font-size: 0.9rem;">${period.description}</div>
              `)
              .style("visibility", "visible")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 10}px`)
              .style("transform", "translate(-50%, -100%)");
          })
          .on("mouseout", () => {
            if (isTouchDevice) return; // Skip for touch devices
            
            if (!selectedPoint) {
              tooltip.style("visibility", "hidden");
            }
          })
          .on("touchstart", function(event) {
            if (!isTouchDevice) return; // Only for touch devices
            
            event.preventDefault();
            const isSelected = selectedPoint === "inactive-period";
            
            // Reset all points
            chart.selectAll(".mileage-point, .anomaly")
              .attr("r", function(d) {
                if (d.type) return isMobile ? 10 : 9;
                return isMobile ? 8 : 7;
              })
              .attr("stroke-width", isMobile ? 2 : 1.5)
              .attr("stroke", COLORS.WHITE);
            
            if (isSelected) {
              // If already selected, deselect
              setSelectedPoint(null);
              tooltip.style("visibility", "hidden");
            } else {
              // Select this inactive period
              setSelectedPoint("inactive-period");
              
              // Highlight this rect
              d3.select(this)
                .attr("stroke-width", 2)
                .attr("stroke", COLORS.BLACK);
              
              // Get position for tooltip
              const rect = event.target.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
              
              tooltip
                .html(`
                  <div style="font-weight: 700; margin-bottom: 8px; font-size: ${isMobile ? '16px' : '18px'};">Inactive Period</div>
                  <div style="margin-bottom: 3px;"><strong>From:</strong> ${period.start.formattedDate}</div>
                  <div style="margin-bottom: 3px;"><strong>To:</strong> ${period.end.formattedDate}</div>
                  <div style="margin-bottom: 8px;"><strong>Mileage:</strong> ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
                  <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 10px 0;">
                  <div style="margin-top: 8px; color: ${COLORS.BLACK}; font-size: 0.9rem;">${period.description}</div>
                `)
                .style("visibility", "visible")
                .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
                .style("top", `${rect.top + scrollTop - 10}px`)
                .style("transform", "translate(-50%, -100%)");
            }
          })
          .on("keypress", (event) => { // Accessibility improvement
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              // Trigger same action as click
              event.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
          })
          .on("click", (event) => {
            if (isTouchDevice) return; // Skip for touch devices
            
            const isVisible = tooltip.style("visibility") === "visible";
            if (isVisible) {
              tooltip.style("visibility", "hidden");
              setSelectedPoint(null);
            } else {
              tooltip
                .html(`
                  <div style="font-weight: 700; margin-bottom: 8px; font-size: ${isMobile ? '16px' : '18px'};">Inactive Period</div>
                  <div style="margin-bottom: 3px;"><strong>From:</strong> ${period.start.formattedDate}</div>
                  <div style="margin-bottom: 3px;"><strong>To:</strong> ${period.end.formattedDate}</div>
                  <div style="margin-bottom: 8px;"><strong>Mileage:</strong> ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
                  <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 10px 0;">
                  <div style="margin-top: 8px; color: ${COLORS.BLACK}; font-size: 0.9rem;">${period.description}</div>
                `)
                .style("visibility", "visible")
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY - 10}px`)
                .style("transform", "translate(-50%, -100%)");
              setSelectedPoint("inactive-period");
            }
          });
      });
    }
    
    // Draw trendline if enabled - with improved styling
    if (showTrendline) {
      if (mileageData.length > 1) {
        const lineGenerator = d3.line()
          .x(d => xScale(d.date))
          .y(d => yScale(d.mileage))
          .curve(d3.curveCatmullRom.alpha(0.5));

        chart.append("path")
          .datum(mileageData)
          .attr("class", "trendline-smooth")
          .attr("fill", "none")
          .attr("stroke", COLORS.GREEN)
          .attr("stroke-width", isMobile ? 1.5 : 2.5)
          .attr("stroke-dasharray", "5,5")
          .attr("d", lineGenerator);

        if (mileageData.length > 2) {
          // Linear regression - but only if there are no clocking issues
          const hasClockingIssues = mileageData.some(d => d.isClockingPoint);
          
          if (!hasClockingIssues) {
            const xData = mileageData.map(d => d.date.getTime());
            const yData = mileageData.map(d => d.mileage);

            const n = xData.length;
            const sumX = xData.reduce((a, b) => a + b, 0);
            const sumY = yData.reduce((a, b) => a + b, 0);
            const sumXY = xData.map((x, i) => x * yData[i]).reduce((a, b) => a + b, 0);
            const sumXX = xData.map(x => x * x).reduce((a, b) => a + b, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            const calcY = x => slope * x + intercept;

            const firstDate = new Date(Math.min(...xData));
            const lastDate = new Date(Math.max(...xData));

            const extendDays = 60;
            const extendMs = extendDays * 24 * 60 * 60 * 1000;

            const startDate = new Date(firstDate.getTime() - extendMs);
            const endDate = new Date(lastDate.getTime() + extendMs);

            const regressionPoints = [
              { date: startDate, mileage: calcY(startDate.getTime()) },
              { date: endDate, mileage: calcY(endDate.getTime()) }
            ];

            chart.append("path")
              .datum(regressionPoints)
              .attr("class", "trendline-linear")
              .attr("fill", "none")
              .attr("stroke", `rgba(${hexToRgb(COLORS.GREEN)}, 0.8)`)
              .attr("stroke-width", isMobile ? 2 : 3)
              .attr("d", d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.mileage))
              );

            const avgDailyMileage = slope * (24 * 60 * 60 * 1000);
            const avgAnnualMileage = avgDailyMileage * 365;

            // Only show trendline label if there's enough space
            if (!isMobile || width > 300) {
              chart.append("text")
                .attr("class", "trendline-label")
                .attr("x", width - (isMobile ? 80 : 170))
                .attr("y", height - (isMobile ? 20 : 60))
                .attr("font-size", isMobile ? "10px" : "14px")
                .attr("font-family", "'GDS Transport', arial, sans-serif")
                .attr("fill", COLORS.GREEN)
                .attr("font-weight", "700") // Match GOV.UK bold text
                .text(`Trend: ~${Math.round(avgAnnualMileage).toLocaleString()} miles/year`);
            }
          }
        }
      }
    }
    
    // Draw main mileage line with GOV.UK theme colors
    chart.append("path")
      .datum(mileageData)
      .attr("class", "mileage-line")
      .attr("fill", "none")
      .attr("stroke", COLORS.BLUE)
      .attr("stroke-width", isMobile ? 2.5 : 3.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.mileage))
        .curve(d3.curveMonotoneX));

    // Draw mileage points with a more consistent, professional GOV.UK look
    mileageData.forEach(d => {
      const isPassing = d.testResult && d.testResult.includes('PASS');
      const x = xScale(d.date);
      const y = yScale(d.mileage);
      
      // Apply vertical offset for closely spaced points
      const adjustedY = y + (d.verticalOffset || 0);
      
      // Use consistent size and shape for all data points
      // Use GOV.UK colors and styling
      const radius = isMobile ? 7 : 9;
      
      // Create a consistent circular point for all data
      chart.append("circle")
        .datum(d)
        .attr("class", isPassing ? "mileage-point mileage-pass" : "mileage-point mileage-fail")
        .attr("cx", x)
        .attr("cy", adjustedY)
        .attr("r", radius)
        .attr("fill", d.isClockingPoint ? COLORS.RED : (isPassing ? COLORS.GREEN : COLORS.RED))
        .attr("fill-opacity", 1)
        .attr("stroke", COLORS.WHITE)
        .attr("stroke-width", isMobile ? 1.5 : 2)
        .style("cursor", "pointer")
        .attr("tabindex", 0)
        .attr("role", "button")
        .attr("aria-label", `${isPassing ? 'PASS' : 'FAIL'}: Mileage reading: ${d.formattedMileage} on ${d.formattedDate}`);
      
      // For failed tests, add a subtle ring around the point
      if (!isPassing) {
        chart.append("circle")
          .datum(d)
          .attr("class", "mileage-point-ring")
          .attr("cx", x)
          .attr("cy", adjustedY)
          .attr("r", radius + 3)
          .attr("fill", "none")
          .attr("stroke", COLORS.RED)
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", 0.8);
        
        // Add a small indicator text (FAIL) but more subtle than before
        if (!isMobile) {
          chart.append("text")
            .attr("class", "fail-indicator")
            .attr("x", x)
            .attr("y", adjustedY - radius - 5)
            .attr("text-anchor", "middle")
            .attr("font-family", "'GDS Transport', arial, sans-serif")
            .attr("font-size", "10px")
            .attr("font-weight", "700")
            .attr("fill", COLORS.RED)
            .text("FAIL");
        }
      }
    });
    
    // Generate tooltip content for data points with GOV.UK styling
    const generatePointTooltip = (d) => {
      const index = mileageData.findIndex(item => item.date.getTime() === d.date.getTime());

      // Basic info - styled with GOV.UK typography
      let tooltipContent = `
        <div style="font-weight: 700; margin-bottom: 8px; font-size: ${isMobile ? '16px' : '18px'};">${d.formattedDate}</div>
        <div style="margin-bottom: 5px;"><strong>Mileage:</strong> ${d.formattedMileage}</div>
        ${d.testResult ? `
          <div style="margin-bottom: 5px;"><strong>Result:</strong> <span style="color: ${d.testResult.includes('PASS') ? COLORS.GREEN : COLORS.RED}; font-weight: 700">
            ${d.testResult}
          </span></div>
        ` : ''}
      `;
      
      // Add previous test info if available
      if (index > 0) {
        const prevTest = mileageData[index - 1];
        // Calculate days between tests accurately
        const daysBetween = Math.max(1, Math.round((d.date - prevTest.date) / (1000 * 60 * 60 * 24)));
        const mileageDiff = d.mileage - prevTest.mileage;
        const dailyAvg = mileageDiff / daysBetween;
        
        tooltipContent += `
          <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 10px 0;">
          <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Since last test:</strong> ${daysBetween} days</div>
        `;
        
        // Special handling for clocking (negative mileage)
        if (mileageDiff < 0) {
          tooltipContent += `
            <div style="font-size: 0.95rem; color: ${COLORS.RED}; font-weight: 700; margin-bottom: 5px;">
              ⚠️ MILEAGE DECREASE: ${Math.abs(mileageDiff).toLocaleString()} miles
            </div>
            <div style="font-size: 0.95rem; color: ${COLORS.RED}; margin-bottom: 5px;">
              This suggests potential odometer tampering (clocking)
            </div>
          `;
        } else {
          tooltipContent += `
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Mileage added:</strong> ${mileageDiff.toLocaleString()} miles</div>
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Daily average:</strong> ${Math.round(dailyAvg)} miles/day</div>
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Annual rate:</strong> ${Math.round(dailyAvg * 365).toLocaleString()} miles/year</div>
          `;
        }
      }
      
      // Add anomaly info if this point has anomalies
      // Make sure anomalies is defined before filtering
      const associatedAnomalies = anomalies && Array.isArray(anomalies) ? 
        anomalies.filter(a => a.details && a.details.current && 
          a.details.current.date && d.date && 
          a.details.current.date.getTime() === d.date.getTime()
        ) : [];
      
      if (associatedAnomalies && associatedAnomalies.length > 0) {
        tooltipContent += `
          <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 10px 0;">
          <div style="color: ${COLORS.RED}; font-weight: 700; margin-bottom: 5px;">Anomalies Detected:</div>
        `;
        
        associatedAnomalies.forEach(anomaly => {
          tooltipContent += `
            <div style="font-size: 0.95rem; color: ${COLORS.RED}; margin-bottom: 3px;">• ${anomaly.message}</div>
          `;
        });
      }
      
      return tooltipContent;
    };
    
    // Add event handlers for all mileage points
    const pointElements = chart.selectAll(".mileage-point");
    
    // Separate event handlers for touch and mouse devices
    if (isTouchDevice) {
      // Touch events for mobile
      pointElements.on("touchstart", function(event, d) {
        event.preventDefault();
        const isSelected = selectedPoint === d.date.getTime();
        
        // Reset all points styling
        chart.selectAll(".mileage-point")
          .attr("stroke-width", isMobile ? 1.5 : 2)
          .attr("stroke", COLORS.WHITE);
          
        chart.selectAll(".mileage-point.mileage-fail")
          .attr("stroke-width", 2)
          .attr("stroke", COLORS.WHITE);
        
        // Toggle selection
        if (isSelected) {
          setSelectedPoint(null);
          tooltip.style("visibility", "hidden");
        } else {
          setSelectedPoint(d.date.getTime());
          
          d3.select(this)
            .attr("stroke-width", 3)
            .attr("stroke", COLORS.BLACK);
          
          // Generate tooltip content
          const tooltipContent = generatePointTooltip(d);
          
          // Position tooltip for touch
          const rect = event.target.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          tooltip
            .html(tooltipContent)
            .style("visibility", "visible")
            .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
            .style("top", `${rect.top + scrollTop - 15}px`)
            .style("transform", "translate(-50%, -100%)");
        }
      });
    } else {
      // Mouse events for desktop
      pointElements
        .on("mouseover", function(event, d) {
          // Special handling for fail diamonds
          const isFail = d3.select(this).classed("mileage-fail");
          
          if (isFail) {
            d3.select(this)
              .attr("stroke-width", 3)
              .attr("stroke", COLORS.BLACK);
          } else {
            d3.select(this)
              .attr("stroke-width", 3)
              .attr("stroke", COLORS.BLACK);
          }
          
          // Generate tooltip content
          const tooltipContent = generatePointTooltip(d);
          
          tooltip
            .html(tooltipContent)
            .style("visibility", "visible")
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY - 15}px`)
            .style("transform", "translate(-50%, -100%)");
        })
        .on("mouseout", function() {
          if (!selectedPoint) {
            // Reset styling
            const isFail = d3.select(this).classed("mileage-fail");
            
            if (isFail) {
              d3.select(this)
                .attr("stroke-width", 2)
                .attr("stroke", COLORS.WHITE);
            } else {
              d3.select(this)
                .attr("stroke-width", isMobile ? 1.5 : 2)
                .attr("stroke", COLORS.WHITE);
            }
            
            tooltip.style("visibility", "hidden");
          }
        })
        .on("keypress", (event, d) => { // Accessibility improvement
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            // Trigger same action as click
            event.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        })
        .on("click", function(event, d) {
          const isSelected = selectedPoint === d.date.getTime();
          
          // Reset all points styling
          chart.selectAll(".mileage-point.mileage-pass")
            .attr("stroke-width", isMobile ? 1.5 : 2)
            .attr("stroke", COLORS.WHITE);
            
          chart.selectAll(".mileage-point.mileage-fail")
            .attr("stroke-width", 2)
            .attr("stroke", COLORS.WHITE);
          
          if (isSelected) {
            setSelectedPoint(null);
            tooltip.style("visibility", "hidden");
          } else {
            setSelectedPoint(d.date.getTime());
            
            // Special handling for fails
            const isFail = d3.select(this).classed("mileage-fail");
            
            d3.select(this)
              .attr("stroke-width", 3)
              .attr("stroke", COLORS.BLACK);
            
            // Generate tooltip content
            const tooltipContent = generatePointTooltip(d);
            
            tooltip
              .html(tooltipContent)
              .style("visibility", "visible")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 15}px`)
              .style("transform", "translate(-50%, -100%)");
          }
        });
    }
    
    // Draw anomalies if enabled - with improved GOV.UK styling
    if (showAnomalies) {
      // Generate tooltip content for anomaly points
      const generateAnomalyTooltip = (anomaly) => {
        let tooltipContent = `
          <div style="font-weight: 700; margin-bottom: 8px; font-size: ${isMobile ? '16px' : '18px'}; ${anomaly.type === 'decrease' ? `color: ${COLORS.RED}` : ''}">
            ${anomaly.details.current.formattedDate}
            ${anomaly.type === 'decrease' ? ' - ⚠️ MILEAGE DECREASE DETECTED' : ''}
          </div>
          <div style="margin-bottom: 5px;"><strong>Mileage:</strong> ${anomaly.details.current.formattedMileage}</div>
        `;
        
        if (anomaly.type === 'decrease') {
          tooltipContent += `
            <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 10px 0;">
            <div style="color: ${COLORS.RED}; font-weight: 700; margin-bottom: 5px;">Possible odometer tampering (clocking)</div>
            <div style="font-size: 0.95rem; margin-bottom: 5px;">
              <strong>Previous reading:</strong> ${anomaly.details.previous.formattedMileage} miles
              (${anomaly.details.previous.formattedDate})
            </div>
            <div style="font-size: 0.95rem; margin-bottom: 5px;">
              <strong>Decrease amount:</strong> ${Math.abs(anomaly.details.diff).toLocaleString()} miles
            </div>
            <div style="font-size: 0.95rem; margin-bottom: 5px;">
              <strong>Time between readings:</strong> ${Math.round(anomaly.details.timeBetweenReadings)} days
            </div>
            <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 10px 0;">
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Possible causes:</strong></div>
            <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 0.95rem;">
              <li style="margin-bottom: 3px;">Odometer tampering</li>
              <li style="margin-bottom: 3px;">Data entry error during MOT</li>
              <li style="margin-bottom: 3px;">Instrument cluster replacement</li>
              <li style="margin-bottom: 3px;">Technical fault with odometer</li>
            </ul>
          `;
        } else {
          tooltipContent += `
            <div style="color: ${ORANGE}; font-weight: 700; margin-bottom: 5px;">${anomaly.message}</div>
            <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 10px 0;">
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Previous reading:</strong> ${anomaly.details.previous.formattedMileage} miles (${anomaly.details.previous.formattedDate})</div>
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Increase amount:</strong> ${Math.abs(anomaly.details.diff).toLocaleString()} miles</div>
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Time period:</strong> ${Math.round(anomaly.details.days)} days</div>
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Daily rate:</strong> ${Math.round(anomaly.details.dailyAvg)} miles/day</div>
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Annual equivalent:</strong> ${Math.round(anomaly.details.annualizedMileage).toLocaleString()} miles/year</div>
            <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 10px 0;">
            <div style="font-size: 0.95rem; margin-bottom: 5px;"><strong>Possible causes:</strong></div>
            <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 0.95rem;">
              <li style="margin-bottom: 3px;">Incorrect odometer reading at previous test</li>
              <li style="margin-bottom: 3px;">Long-distance/commercial use</li>
              <li style="margin-bottom: 3px;">Multiple drivers sharing vehicle</li>
              <li style="margin-bottom: 3px;">Test entry error</li>
            </ul>
          `;
        }
        
        return tooltipContent;
      };

      // Draw anomalies with a more professional, consistent GOV.UK approach
      anomalies.forEach(d => {
        const x = xScale(d.details.current.date);
        const y = yScale(d.details.current.mileage);
        
        const radius = isMobile ? 8 : 10;
        
        // Use circles with consistent styling for anomalies with GOV.UK theme colors
        if (d.type === "decrease") {
          // For clocking (decrease), use red with a dashed border
          chart.append("circle")
            .datum(d)
            .attr("class", "anomaly anomaly-decrease")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius)
            .attr("fill", COLORS.RED)
            .attr("stroke", COLORS.WHITE)
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .attr("tabindex", 0)
            .attr("role", "button")
            .attr("aria-label", `Anomaly: Mileage decrease on ${d.details.current.formattedDate}`);
          
          // Add a warning ring around the point
          chart.append("circle")
            .datum(d)
            .attr("class", "anomaly-ring")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius + 4)
            .attr("fill", "none")
            .attr("stroke", COLORS.RED)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "3,3");
            
        } else {
          // For spikes, use GOV.UK yellow/orange
          chart.append("circle")
            .datum(d)
            .attr("class", "anomaly anomaly-spike")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius)
            .attr("fill", d.severity === "high" ? ORANGE :
              d.severity === "medium" ? `rgba(${hexToRgb(ORANGE)}, 0.85)` : 
              `rgba(${hexToRgb(ORANGE)}, 0.7)`)
            .attr("stroke", COLORS.WHITE)
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .attr("tabindex", 0)
            .attr("role", "button")
            .attr("aria-label", `Anomaly: Unusual mileage increase on ${d.details.current.formattedDate}`);
            
          // Add a subtle alert ring
          chart.append("circle")
            .datum(d)
            .attr("class", "anomaly-ring")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius + 4)
            .attr("fill", "none")
            .attr("stroke", ORANGE)
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.8);
        }
      });
      
      // Add event handlers for anomaly points
      const anomalyElements = chart.selectAll(".anomaly");
      
      if (isTouchDevice) {
        // Touch events for mobile
        anomalyElements.on("touchstart", function(event, d) {
          event.preventDefault();
          const isSelected = selectedPoint === `anomaly-${d.index}`;
          
          // Reset all points
          chart.selectAll(".mileage-point, .anomaly")
            .attr("stroke-width", isMobile ? 1.5 : 2)
            .attr("stroke", COLORS.WHITE);
          
          // Toggle selection
          if (isSelected) {
            setSelectedPoint(null);
            tooltip.style("visibility", "hidden");
          } else {
            setSelectedPoint(`anomaly-${d.index}`);
            
            d3.select(this)
              .attr("stroke-width", 3)
              .attr("stroke", COLORS.BLACK);
            
            // Generate tooltip content
            const tooltipContent = generateAnomalyTooltip(d);
            
            // Position tooltip for touch
            const rect = event.target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            tooltip
              .html(tooltipContent)
              .style("visibility", "visible")
              .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
              .style("top", `${rect.top + scrollTop - 15}px`)
              .style("transform", "translate(-50%, -100%)");
          }
        });
      } else {
        // Mouse events for desktop
        anomalyElements
          .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("stroke-width", 3)
              .attr("stroke", COLORS.BLACK);
            
            // Generate tooltip content
            const tooltipContent = generateAnomalyTooltip(d);
            
            tooltip
              .html(tooltipContent)
              .style("visibility", "visible")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 15}px`)
              .style("transform", "translate(-50%, -100%)");
          })
          .on("mouseout", function() {
            if (!selectedPoint || !selectedPoint.startsWith('anomaly-')) {
              d3.select(this)
                .attr("stroke-width", isMobile ? 1.5 : 2)
                .attr("stroke", COLORS.WHITE);
              
              tooltip.style("visibility", "hidden");
            }
          })
          .on("keypress", (event, d) => { // Accessibility improvement
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              // Trigger same action as click
              event.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
          })
          .on("click", function(event, d) {
            const isSelected = selectedPoint === `anomaly-${d.index}`;
            
            // Reset all points
            chart.selectAll(".mileage-point, .anomaly")
              .attr("stroke-width", isMobile ? 1.5 : 2)
              .attr("stroke", COLORS.WHITE);
            
            if (isSelected) {
              setSelectedPoint(null);
              tooltip.style("visibility", "hidden");
            } else {
              setSelectedPoint(`anomaly-${d.index}`);
              
              d3.select(this)
                .attr("stroke-width", 3)
                .attr("stroke", COLORS.BLACK);
              
              // Generate tooltip content
              const tooltipContent = generateAnomalyTooltip(d);
              
              tooltip
                .html(tooltipContent)
                .style("visibility", "visible")
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY - 15}px`)
                .style("transform", "translate(-50%, -100%)");
            }
          });
      }
    }
    
    // Add background catch area for clicks
    chart.append("rect")
      .attr("class", "background-catcher")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .lower() // Send to back
      .on("click touchstart", (event) => {
        if (event.type === "touchstart") {
          event.preventDefault();
        }
        
        if (selectedPoint) {
          chart.selectAll(".mileage-point, .anomaly")
            .attr("stroke-width", isMobile ? 1.5 : 2)
            .attr("stroke", COLORS.WHITE);
          
          // Reset fail diamonds to their default style
          chart.selectAll(".mileage-point.mileage-fail")
            .attr("stroke-width", 2)
            .attr("stroke", COLORS.WHITE);

          setSelectedPoint(null);
          tooltip.style("visibility", "hidden");
        }
      });

    // Add warning for limited data when appropriate
    if (mileageData.length <= 2) {
      chart.append("text")
        .attr("class", "limited-data-warning")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", COLORS.RED)
        .attr("font-family", "'GDS Transport', arial, sans-serif")
        .style("font-size", "16px")
        .style("font-weight", "700")
        .text("Limited data: Analysis may not be comprehensive");
    }

    // Add resize handler with debounce
    const handleResize = () => {
      if (chartContainerRef.current) {
        // Debounce the rendering to avoid performance issues
        if (window.resizeTimer) {
          clearTimeout(window.resizeTimer);
        }
        window.resizeTimer = setTimeout(() => {
          renderChart();
        }, 200);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.resizeTimer) {
        clearTimeout(window.resizeTimer);
      }
    };
  }, [
    getFilteredData,
    createTooltip,
    setupChartDimensions,
    showInactivePeriods,
    showTrendline,
    showAnomalies,
    selectedPoint,
    isMobile,
    isTouchDevice,
    margin
  ]);

  // Effect to render chart when data or display options change
  useEffect(() => {
    if (!loading && !error && chartData.mileageData.length > 0) {
      renderChart();
    }
    
    // Clean up tooltip on unmount
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
      }
    };
  }, [
    chartData,
    loading,
    error,
    renderChart,
    showAnomalies,
    showInactivePeriods,
    showTrendline,
    selectedTimeRange
  ]);

  return (
    <>
      {/* Chart Title */}
      <GovUKHeadingM>Vehicle Mileage Chart</GovUKHeadingM>
      
      {/* Chart Controls */}
      <ControlPanel>
        <ControlButton
          active={selectedTimeRange === 'all'}
          onClick={() => setSelectedTimeRange('all')}
        >
          {isMobile ? 'All' : 'All History'}
        </ControlButton>
        <ControlButton
          active={selectedTimeRange === '10y'}
          onClick={() => setSelectedTimeRange('10y')}
        >
          {isMobile ? '10 Yrs' : 'Last 10 Years'}
        </ControlButton>
        <ControlButton
          active={selectedTimeRange === '5y'}
          onClick={() => setSelectedTimeRange('5y')}
        >
          {isMobile ? '5 Yrs' : 'Last 5 Years'}
        </ControlButton>
        <ControlButton
          active={selectedTimeRange === '2y'}
          onClick={() => setSelectedTimeRange('2y')}
        >
          {isMobile ? '2 Yrs' : 'Last 2 Years'}
        </ControlButton>
      </ControlPanel>

      <ControlPanel>
        <ControlButton
          active={showAnomalies}
          onClick={() => setShowAnomalies(!showAnomalies)}
        >
          {showAnomalies ? (isMobile ? 'Hide Issues' : 'Hide Anomalies') : (isMobile ? 'Show Issues' : 'Show Anomalies')}
        </ControlButton>
        <ControlButton
          active={showInactivePeriods}
          onClick={() => setShowInactivePeriods(!showInactivePeriods)}
        >
          {showInactivePeriods ? (isMobile ? 'Hide Inactive' : 'Hide Inactive Periods') : (isMobile ? 'Show Inactive' : 'Show Inactive Periods')}
        </ControlButton>
        <ControlButton
          active={showTrendline}
          onClick={() => setShowTrendline(!showTrendline)}
        >
          {showTrendline ? 'Hide Trend' : 'Show Trend'}
        </ControlButton>
      </ControlPanel>

      {/* Mileage Chart */}
      <ChartContainer ref={chartContainerRef}>
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!loading && !error && (
          <>
            <svg 
              ref={svgRef} 
              width="100%" 
              height="100%"
              style={{ display: chartData.mileageData.length > 0 ? 'block' : 'none' }}
              aria-hidden={chartData.mileageData.length === 0 ? 'true' : 'false'} // Accessibility improvement
            ></svg>

            {chartData.mileageData.length === 0 && (
              <InfoBox>No mileage data available for this vehicle.</InfoBox>
            )}
            
            {chartData.mileageData.length === 1 && (
              <InfoBox>Only one MOT record available. More records are needed to show mileage trends.</InfoBox>
            )}
          </>
        )}
      </ChartContainer>
    </>
  );
}