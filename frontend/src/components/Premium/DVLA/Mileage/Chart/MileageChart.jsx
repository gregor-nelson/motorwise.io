import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  GovUKContainer,
  GovUKHeadingM,
  GovUKInsetText,
  GovUKBody,
  GovUKHeadingS,
  COLORS,
  PremiumInfoPanel,
  commonFontStyles,
  BREAKPOINTS,
  focusStyles,
  GovUKBodyS
} from '../../../../../styles/theme';
import { styled, css } from '@mui/material/styles';

// ======================================================
// Styled Components - Aligned with Theme
// ======================================================

const themedFont = css`
  ${commonFontStyles}
`;

const themedFocus = css`
  ${focusStyles}
`;

const mobileMediaQuery = `@media (max-width: ${BREAKPOINTS.MOBILE})`;
const desktopMediaQuery = `@media (min-width: ${BREAKPOINTS.MOBILE})`;

const ChartContainer = styled('div')(({ theme }) => css`
  margin-top: 20px;
  margin-bottom: 30px;
  width: 100%;
  height: 250px; // Shorter height on mobile
  position: relative;
  background-color: ${COLORS.WHITE};
  padding: 10px 0;
  overflow: hidden; // Prevent overflow issues on small screens

  ${desktopMediaQuery} {
    height: 400px;
    padding: 20px 0;
  }
`);

const InfoBox = styled(GovUKInsetText)(() => css`
  margin-top: 10px;
  margin-bottom: 20px;
`);

const ControlPanel = styled('div')(() => css`
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-start;

  ${desktopMediaQuery} {
    gap: 8px;
    margin-bottom: 15px;
  }
`);

const ControlButton = styled('button')(({ active }) => css`
  ${themedFont}
  padding: 6px 8px;
  border: 1px solid ${COLORS.MID_GREY};
  background-color: ${active ? COLORS.BLUE : COLORS.WHITE};
  color: ${active ? COLORS.WHITE : COLORS.BLACK};
  cursor: pointer;
  font-size: 0.75rem;
  border-radius: 2px; // Subtle radius for touch friendliness
  transition: background-color 0.2s, transform 0.1s;
  flex: 1 0 calc(50% - 4px); // Two buttons per row on very small screens
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  
  &:active {
    transform: scale(0.98); // Subtle feedback for touch
  }

  &:hover {
    background-color: ${active ? COLORS.BLUE : COLORS.LIGHT_GREY};
  }

  &:focus {
    ${themedFocus}
  }

  // Larger screens can fit more buttons in a row
  @media (min-width: 480px) {
    flex: 0 1 auto;
    font-size: 0.75rem;
    padding: 8px 10px;
  }
  
  ${desktopMediaQuery} {
    font-size: 0.875rem;
    padding: 8px 12px;
  }
`);

const LoadingSpinner = styled('div')(() => css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  &:after {
    content: "";
    width: 40px;
    height: 40px;
    border: 5px solid ${COLORS.LIGHT_GREY};
    border-top: 5px solid ${COLORS.BLUE};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`);

const ErrorMessage = styled(GovUKInsetText)(() => css`
  border-left: 5px solid ${COLORS.RED};
  background-color: ${COLORS.WHITE};
  padding: 15px;
`);

const UsageSummary = styled('div')(() => css`
  ${themedFont}
  background-color: ${COLORS.LIGHT_GREY};
  padding: 10px;
  margin-bottom: 15px;
  border-left: 5px solid ${COLORS.BLUE};

  ${desktopMediaQuery} {
    padding: 20px;
    margin-bottom: 30px;
  }
`);

const SummaryGrid = styled('div')(() => css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  
  ${desktopMediaQuery} {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 20px;
  }
`);

const SummaryItem = styled('div')(() => css`
  ${themedFont}
`);

const SummaryLabel = styled(GovUKBodyS)(() => css`
  margin-bottom: 5px;
  color: ${COLORS.DARK_GREY};
`);

const SummaryValue = styled('div')(() => css`
  ${themedFont}
  font-weight: 700;
  font-size: 1.25rem;
`);

const PatternCard = styled('div')(({ severity }) => css`
  ${themedFont}
  padding: 10px;
  margin-bottom: 10px;
  border-left: 5px solid ${
    severity === "high" ? COLORS.RED :
    severity === "medium" ? "#f47738" :
    COLORS.MID_GREY
  };
  background-color: ${COLORS.LIGHT_GREY};
  
  ${desktopMediaQuery} {
    padding: 15px;
    margin-bottom: 15px;
  }
`);

const PatternTitle = styled('div')(() => css`
  ${themedFont}
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 5px;
`);

const PatternDetail = styled('div')(() => css`
  ${themedFont}
  margin-bottom: 10px;
`);

const PatternStats = styled('div')(() => css`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`);

const StatBox = styled('div')(({ color }) => css`
  ${themedFont}
  display: inline-block;
  padding: 5px 10px;
  background-color: ${COLORS.WHITE};
  border-left: 3px solid ${color || COLORS.MID_GREY};
  font-size: 0.875rem;
`);

const UsagePeriodsTable = styled('table')(() => css`
  ${themedFont}
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 0.75rem;
  
  ${desktopMediaQuery} {
    font-size: 1rem;
  }
  
  & th {
    ${themedFont}
    font-weight: 700;
    padding: 8px 5px;
    text-align: left;
    background-color: ${COLORS.LIGHT_GREY};
    border: 1px solid ${COLORS.MID_GREY};
    
    ${desktopMediaQuery} {
      padding: 10px;
    }
  }
  
  & td {
    ${themedFont}
    padding: 8px 5px;
    border: 1px solid ${COLORS.MID_GREY};
    text-align: left;
    
    ${desktopMediaQuery} {
      padding: 10px;
    }
  }
  
  & tr:nth-of-type(even) {
    background-color: ${COLORS.LIGHT_GREY};
  }
  
  // Handle table overflow on small screens
  @media (max-width: 500px) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    -ms-overflow-style: -ms-autohiding-scrollbar;
  }
`);

/**
 * Helper function to convert hex color to RGB for transparency
 */
function hexToRgb(hex) {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * D3-first implementation of the Vehicle Mileage Chart with enhanced mobile responsiveness
 * and touch-friendly tooltips
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
  
  // Handle viewport changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 650);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Add global styles for mobile tooltips
  useEffect(() => {
    if (!document.getElementById('mobile-tooltip-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'mobile-tooltip-styles';
      styleElement.textContent = `
        @media (max-width: 650px) {
          .d3-tooltip {
            max-width: 80vw !important;
            padding: 10px !important;
            font-size: 0.875rem !important;
          }
          .d3-tooltip hr {
            margin: 5px 0 !important;
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

  // Fetch and process data
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

  // Process MOT test data into chart data
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

    const anomalies = findAnomalies(formattedData);
    const inactivityPeriods = findInactivityPeriods(formattedData);

    let averageAnnualMileage = null;
    if (formattedData.length >= 2) {
      const firstRecord = formattedData[0];
      const lastRecord = formattedData[formattedData.length - 1];

      const totalMileage = lastRecord.mileage - firstRecord.mileage;
      const timeSpanMs = lastRecord.date.getTime() - firstRecord.date.getTime();
      const timeSpanYears = timeSpanMs / (1000 * 60 * 60 * 24 * 365.25);

      if (timeSpanYears >= 0.5) {
        averageAnnualMileage = Math.round(totalMileage / timeSpanYears);
      }
    }

    const ratesData = calculateMileageRates(formattedData);

    setChartData({
      mileageData: formattedData,
      anomalies,
      inactivityPeriods,
      averageAnnualMileage,
      ratesData
    });
  }, []);

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

      const daysDiff = (currentReading.date.getTime() - prevReading.date.getTime()) / (1000 * 60 * 60 * 24);
      const mileageDiff = currentReading.mileage - prevReading.mileage;

      if (mileageDiff < 0) {
        let severity = "high";
        if (Math.abs(mileageDiff) < 1000) {
          severity = "medium";
        } else if (Math.abs(mileageDiff) < 100) {
          severity = "low";
        }

        const anomaly = {
          index: i,
          date: currentReading.date,
          type: 'decrease',
          severity,
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

      const daysDiff = (currentReading.date.getTime() - prevReading.date.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff < MIN_INACTIVITY_DAYS) continue;

      const mileageDiff = currentReading.mileage - prevReading.mileage;
      const dailyAverage = mileageDiff / daysDiff;

      if (dailyAverage < LOW_ACTIVITY_THRESHOLD) {
        const monthsDiff = Math.round(daysDiff / 30);
        let description;
        let severity = "medium";

        if (dailyAverage <= 0) {
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
      const mileageDiff = currPoint.mileage - prevPoint.mileage;

      if (timeDiffDays > 0) {
        const dailyRate = mileageDiff / timeDiffDays;
        const annualizedRate = dailyRate * 365;

        const rateData = {
          startDate: prevPoint.date,
          endDate: currPoint.date,
          startMileage: prevPoint.mileage,
          endMileage: currPoint.mileage,
          periodDays: Math.round(timeDiffDays),
          dailyRate: dailyRate,
          annualizedRate: annualizedRate,
          formattedPeriod: `${prevPoint.formattedDate} to ${currPoint.formattedDate}`
        };
        rates.push(rateData);
      }
    }
    return rates;
  }, []);

  // Filter data based on selected time range
  const getFilteredData = useCallback(() => {
    if (!chartData.mileageData || chartData.mileageData.length === 0) {
      return { mileageData: [], anomalies: [], inactivityPeriods: [] };
    }

    if (selectedTimeRange === 'all') {
      return chartData;
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
      mileageData: filteredMileageData,
      anomalies: filteredAnomalies,
      inactivityPeriods: filteredInactivityPeriods,
      averageAnnualMileage: chartData.averageAnnualMileage,
      ratesData: filteredRatesData
    };
  }, [chartData, selectedTimeRange]);

  // D3 Chart Rendering with mobile and touch enhancements
  const renderChart = useCallback(() => {
    const filteredData = getFilteredData();
    const { mileageData, anomalies, inactivityPeriods } = filteredData;

    if (!mileageData.length || !svgRef.current || !chartContainerRef.current) {
      return;
    }

    // Clear any existing chart content
    d3.select(svgRef.current).selectAll("*").remove();
    d3.selectAll(".d3-tooltip").remove();
    
    // Create mobile-friendly tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", COLORS.WHITE)
      .style("border-left", `5px solid ${COLORS.BLUE}`)
      .style("border-radius", "0")
      .style("padding", isMobile ? "10px" : "15px")
      .style("box-shadow", `0 2px 0 ${COLORS.MID_GREY}`)
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("font-size", isMobile ? "0.875rem" : "1rem")
      .style("line-height", "1.25")
      .style("font-weight", "400")
      .style("color", COLORS.BLACK)
      .style("pointer-events", "none")
      .style("z-index", 10)
      .style("max-width", isMobile ? "calc(100vw - 40px)" : "300px")
      .style("word-break", "break-word");
    
    // Add close button for mobile tooltips
    if (isMobile) {
      tooltip.append("div")
        .style("position", "absolute")
        .style("top", "5px")
        .style("right", "5px")
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

    // Setup dimensions with mobile-optimized margins
    const containerWidth = chartContainerRef.current.clientWidth;
    const containerHeight = chartContainerRef.current.clientHeight;

    const margin = {
      top: isMobile ? 20 : 40,
      right: isMobile ? 10 : 50,
      bottom: isMobile ? 30 : 40,
      left: isMobile ? 35 : 40 // Need enough space for axis labels
    };

    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create SVG container with responsive viewBox
    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Create chart group with margin
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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

    // Create axes with mobile optimizations
    chart.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(isMobile ? 3 : 6) // Fewer ticks on mobile
        .tickFormat(d3.timeFormat(isMobile ? "%m/%y" : "%m/%Y"))) // Shorter format on mobile
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", isMobile ? "9px" : "11px") // Smaller font on mobile
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("color", COLORS.DARK_GREY)
      .attr("dy", "1em");

    chart.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale)
        .ticks(isMobile ? 4 : 6) // Fewer ticks on mobile
        .tickFormat(d => d3.format(",")(d)))
      .selectAll("text")
      .style("font-size", isMobile ? "9px" : "11px")
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("color", COLORS.DARK_GREY);

    // Add y-axis label (smaller on mobile)
    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + (isMobile ? 8 : 0))
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", isMobile ? "9px" : "11px")
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("color", COLORS.DARK_GREY)
      .text("Mileage");

    // Add grid with theme colors
    chart.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(isMobile ? 3 : 6)
        .tickSize(-height)
        .tickFormat(""))
      .selectAll("line")
      .style("stroke", COLORS.MID_GREY)
      .style("stroke-opacity", 0.3);

    chart.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .ticks(isMobile ? 4 : 6)
        .tickSize(-width)
        .tickFormat(""))
      .selectAll("line")
      .style("stroke", COLORS.MID_GREY)
      .style("stroke-opacity", 0.3);

    chart.selectAll(".domain").style("stroke", COLORS.MID_GREY).style("stroke-opacity", 0.5);

    // Draw inactive periods with theme colors
    if (showInactivePeriods) {
      inactivityPeriods.forEach(period => {
        const fillColor = period.severity === "high" ?
          `rgba(${hexToRgb(COLORS.RED)}, 0.2)` :
          period.severity === "medium" ?
            "rgba(244, 119, 56, 0.2)" :
            `rgba(${hexToRgb(COLORS.MID_GREY)}, 0.2)`;

        const strokeColor = period.severity === "high" ?
          COLORS.RED :
          period.severity === "medium" ?
            "#f47738" :
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
          .attr("stroke-dasharray", "4,4")
          .style("pointer-events", "all")
          .on("mouseover", function(event) {
            if (isTouchDevice) return; // Skip for touch devices
            
            tooltip
              .html(`
                <div style="font-weight: bold; margin-bottom: 4px">Inactive Period</div>
                <div>From: ${period.start.formattedDate}</div>
                <div>To: ${period.end.formattedDate}</div>
                <div>Mileage: ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
                <div style="margin-top: 4px; color: ${COLORS.DARK_GREY}">${period.description}</div>
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
                  <div style="font-weight: bold; margin-bottom: 4px">Inactive Period</div>
                  <div>From: ${period.start.formattedDate}</div>
                  <div>To: ${period.end.formattedDate}</div>
                  <div>Mileage: ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
                  <div style="margin-top: 4px; color: ${COLORS.DARK_GREY}">${period.description}</div>
                `)
                .style("visibility", "visible")
                .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
                .style("top", `${rect.top + scrollTop - 10}px`)
                .style("transform", "translate(-50%, -100%)");
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
                  <div style="font-weight: bold; margin-bottom: 4px">Inactive Period</div>
                  <div>From: ${period.start.formattedDate}</div>
                  <div>To: ${period.end.formattedDate}</div>
                  <div>Mileage: ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
                  <div style="margin-top: 4px; color: ${COLORS.DARK_GREY}">${period.description}</div>
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

    // Draw trendline with theme colors
    if (showTrendline && mileageData.length > 1) {
      const lineGenerator = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.mileage))
        .curve(d3.curveCatmullRom.alpha(0.5));

      chart.append("path")
        .datum(mileageData)
        .attr("class", "trendline-smooth")
        .attr("fill", "none")
        .attr("stroke", COLORS.GREEN)
        .attr("stroke-width", isMobile ? 1.5 : 2)
        .attr("stroke-dasharray", "5,5")
        .attr("d", lineGenerator);

      if (mileageData.length > 2) {
        // Linear regression
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
          .attr("stroke", "rgba(76, 175, 80, 0.7)")
          .attr("stroke-width", isMobile ? 1.5 : 2)
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
            .attr("font-size", isMobile ? "8px" : "11px")
            .attr("font-family", "'GDS Transport', arial, sans-serif")
            .attr("fill", COLORS.GREEN)
            .text(`Trend: ~${Math.round(avgAnnualMileage).toLocaleString()} miles/year`);
        }
      }
    }

    // Draw main mileage line with theme colors
    chart.append("path")
      .datum(mileageData)
      .attr("class", "mileage-line")
      .attr("fill", "none")
      .attr("stroke", COLORS.BLUE)
      .attr("stroke-width", isMobile ? 2 : 3)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.mileage))
        .curve(d3.curveMonotoneX));

    // Draw mileage points with theme colors and mobile size adjustments
    const points = chart.selectAll(".mileage-point")
      .data(mileageData)
      .enter()
      .append("circle")
      .attr("class", "mileage-point")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.mileage))
      .attr("r", isMobile ? 8 : 7)
      .attr("fill", d => {
        if (!d.testResult) return COLORS.RED;
        const result = String(d.testResult).trim().toUpperCase();
        return (result.includes('PASS')) ? COLORS.GREEN : COLORS.RED;
      })
      .attr("stroke", COLORS.WHITE)
      .attr("stroke-width", isMobile ? 2 : 1.5)
      .style("cursor", "pointer");

    // Separate event handlers for touch and mouse devices
    if (isTouchDevice) {
      // Touch events for mobile
      points.on("touchstart", function(event, d) {
        event.preventDefault();
        const isSelected = selectedPoint === d.date.getTime();
        
        // Reset all points
        chart.selectAll(".mileage-point, .anomaly")
          .attr("r", function(d) {
            if (d.type) return isMobile ? 10 : 9;
            return isMobile ? 8 : 7;
          })
          .attr("stroke-width", isMobile ? 2 : 1.5)
          .attr("stroke", COLORS.WHITE);
        
        // Toggle selection
        if (isSelected) {
          setSelectedPoint(null);
          tooltip.style("visibility", "hidden");
        } else {
          setSelectedPoint(d.date.getTime());
          
          d3.select(this)
            .attr("r", isMobile ? 12 : 10)
            .attr("stroke-width", 3)
            .attr("stroke", COLORS.BLACK);
          
          // Get associated anomalies
          const associatedAnomalies = anomalies.filter(a =>
            a.details.current.date.getTime() === d.date.getTime()
          );
          
          // Build tooltip content
          let tooltipContent = `
            <div style="font-weight: bold;">${d.formattedDate}</div>
            <div>Mileage: ${d.formattedMileage}</div>
            ${d.testResult ? `
              <div>Result: <span style="color: ${d.testResult.includes('PASS') ? COLORS.GREEN : COLORS.RED}; font-weight: bold">
                ${d.testResult}
              </span></div>
            ` : ''}
          `;
          
          const index = mileageData.findIndex(item => item.date.getTime() === d.date.getTime());
          if (index > 0) {
            const prevTest = mileageData[index - 1];
            const daysBetween = Math.round((d.date - prevTest.date) / (1000 * 60 * 60 * 24));
            const mileageDiff = d.mileage - prevTest.mileage;
            const dailyAvg = mileageDiff / daysBetween;
            
            tooltipContent += `
              <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;">
              <div style="font-size: 0.875rem;"><strong>Since last test:</strong> ${daysBetween} days</div>
              <div style="font-size: 0.875rem;"><strong>Mileage added:</strong> ${mileageDiff.toLocaleString()} miles</div>
              <div style="font-size: 0.875rem;"><strong>Daily average:</strong> ${Math.round(dailyAvg)} miles/day</div>
              <div style="font-size: 0.875rem;"><strong>Annual rate:</strong> ${Math.round(dailyAvg * 365).toLocaleString()} miles/year</div>
            `;
          }
          
          if (associatedAnomalies.length > 0) {
            tooltipContent += `
              <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;">
              <div style="color: ${COLORS.RED}; font-weight: bold;">Anomalies Detected:</div>
            `;
            
            associatedAnomalies.forEach(anomaly => {
              tooltipContent += `
                <div style="font-size: 0.875rem; color: ${COLORS.RED};">• ${anomaly.message}</div>
              `;
            });
          }
          
          // Position tooltip for touch
          const rect = event.target.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          tooltip
            .html(tooltipContent)
            .style("visibility", "visible")
            .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
            .style("top", `${rect.top + scrollTop - 10}px`)
            .style("transform", "translate(-50%, -100%)");
        }
      });
    } else {
      // Mouse events for desktop
      points
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("r", isMobile ? 10 : 9)
            .attr("stroke-width", 2)
            .attr("stroke", COLORS.BLACK);
          
          // Get associated anomalies
          const associatedAnomalies = anomalies.filter(a =>
            a.details.current.date.getTime() === d.date.getTime()
          );
          
          // Build tooltip content with same structure as touch
          let tooltipContent = `
            <div style="font-weight: bold;">${d.formattedDate}</div>
            <div>Mileage: ${d.formattedMileage}</div>
            ${d.testResult ? `
              <div>Result: <span style="color: ${d.testResult.includes('PASS') ? COLORS.GREEN : COLORS.RED}; font-weight: bold">
                ${d.testResult}
              </span></div>
            ` : ''}
          `;
          
          const index = mileageData.findIndex(item => item.date.getTime() === d.date.getTime());
          if (index > 0) {
            const prevTest = mileageData[index - 1];
            const daysBetween = Math.round((d.date - prevTest.date) / (1000 * 60 * 60 * 24));
            const mileageDiff = d.mileage - prevTest.mileage;
            const dailyAvg = mileageDiff / daysBetween;
            
            tooltipContent += `
              <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;">
              <div style="font-size: 0.875rem;"><strong>Since last test:</strong> ${daysBetween} days</div>
              <div style="font-size: 0.875rem;"><strong>Mileage added:</strong> ${mileageDiff.toLocaleString()} miles</div>
              <div style="font-size: 0.875rem;"><strong>Daily average:</strong> ${Math.round(dailyAvg)} miles/day</div>
              <div style="font-size: 0.875rem;"><strong>Annual rate:</strong> ${Math.round(dailyAvg * 365).toLocaleString()} miles/year</div>
            `;
          }
          
          if (associatedAnomalies.length > 0) {
            tooltipContent += `
              <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;">
              <div style="color: ${COLORS.RED}; font-weight: bold;">Anomalies Detected:</div>
            `;
            
            associatedAnomalies.forEach(anomaly => {
              tooltipContent += `
                <div style="font-size: 0.875rem; color: ${COLORS.RED};">• ${anomaly.message}</div>
              `;
            });
          }
          
          tooltip
            .html(tooltipContent)
            .style("visibility", "visible")
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY - 10}px`)
            .style("transform", "translate(-50%, -100%)");
        })
        .on("mouseout", function() {
          if (!selectedPoint) {
            d3.select(this)
              .attr("r", isMobile ? 8 : 7)
              .attr("stroke-width", isMobile ? 2 : 1.5)
              .attr("stroke", COLORS.WHITE);
            
            tooltip.style("visibility", "hidden");
          }
        })
        .on("click", function(event, d) {
          const isSelected = selectedPoint === d.date.getTime();
          
          // Reset all points
          chart.selectAll(".mileage-point, .anomaly")
            .attr("r", function(d) {
              if (d.type) return isMobile ? 10 : 9;
              return isMobile ? 8 : 7;
            })
            .attr("stroke-width", isMobile ? 2 : 1.5)
            .attr("stroke", COLORS.WHITE);
          
          if (isSelected) {
            setSelectedPoint(null);
            tooltip.style("visibility", "hidden");
          } else {
            setSelectedPoint(d.date.getTime());
            
            d3.select(this)
              .attr("r", isMobile ? 12 : 10)
              .attr("stroke-width", 3)
              .attr("stroke", COLORS.BLACK);
            
            // Get associated anomalies and build tooltip (same as mouseover)
            // ...
            
            tooltip
              .html(tooltipContent)
              .style("visibility", "visible")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 10}px`)
              .style("transform", "translate(-50%, -100%)");
          }
        });
    }

    // Draw anomalies with touch and theme support
    if (showAnomalies) {
      const anomalyPoints = chart.selectAll(".anomaly")
        .data(anomalies)
        .enter()
        .append("circle")
        .attr("class", "anomaly")
        .attr("cx", d => xScale(d.details.current.date))
        .attr("cy", d => yScale(d.details.current.mileage))
        .attr("r", isMobile ? 10 : 9)
        .attr("fill", d => {
          if (d.type === "decrease") {
            return d.severity === "high" ? COLORS.RED :
              d.severity === "medium" ? "#e53935" : "#ef5350";
          } else {
            return d.severity === "high" ? "#f47738" :
              d.severity === "medium" ? "#ff9800" : "#ffb74d";
          }
        })
        .attr("stroke", COLORS.WHITE)
        .attr("stroke-width", isMobile ? 2 : 1.5)
        .attr("opacity", d => d.severity === "high" ? 0.95 : d.severity === "medium" ? 0.85 : 0.75)
        .style("cursor", "pointer");

      // Add touch-specific events for anomalies
      if (isTouchDevice) {
        anomalyPoints.on("touchstart", function(event, d) {
          event.preventDefault();
          const isSelected = selectedPoint === d.details.current.date.getTime();
          
          // Reset all points
          chart.selectAll(".mileage-point, .anomaly")
            .attr("r", function(d) {
              if (d.type) return isMobile ? 10 : 9;
              return isMobile ? 8 : 7;
            })
            .attr("stroke-width", isMobile ? 2 : 1.5)
            .attr("stroke", COLORS.WHITE);
          
          if (isSelected) {
            setSelectedPoint(null);
            tooltip.style("visibility", "hidden");
          } else {
            setSelectedPoint(d.details.current.date.getTime());
            
            d3.select(this)
              .attr("r", isMobile ? 14 : 12)
              .attr("stroke-width", 3)
              .attr("stroke", COLORS.BLACK);
            
            // Build tooltip content for anomaly
            let tooltipContent = `
              <div>
                <strong>${d.details.current.formattedDate}</strong>
              </div>
              <div>Mileage: ${d.details.current.formattedMileage}</div>
              <div style="color: ${d.type === 'decrease' ? COLORS.RED : '#f47738'}; font-weight: bold">${d.message}</div>
            `;              
            
            tooltipContent += `
              <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;">
              <div style="font-size: 0.875rem;"><strong>Previous reading:</strong> ${d.details.previous.formattedMileage} miles (${d.details.previous.formattedDate})</div>
              <div style="font-size: 0.875rem;"><strong>Time period:</strong> ${Math.round(d.details.timeBetweenReadings)} days</div>
            `;
            
            if (d.type === "spike") {
              tooltipContent += `
                <div style="font-size: 0.875rem;"><strong>Daily rate:</strong> ${Math.round(d.details.dailyAvg)} miles/day</div>
                <div style="font-size: 0.875rem;"><strong>Annual equivalent:</strong> ${Math.round(d.details.annualizedMileage).toLocaleString()} miles/year</div>
              `;
            }
            
            tooltipContent += `
              <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ddd;">
              <div style="font-size: 0.875rem;"><strong>Severity:</strong>
                <span style="color: ${d.severity === 'high' ? COLORS.RED : d.severity === 'medium' ? '#f47738' : COLORS.GREEN}">
                  ${d.severity.charAt(0).toUpperCase() + d.severity.slice(1)}
                </span>
              </div>
            `;
            
            tooltipContent += `
              <div style="font-size: 0.875rem;"><strong>Possible causes:</strong></div>
              <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 0.875rem;">
            `;
            
            if (d.type === "decrease") {
              tooltipContent += `
                <li>Odometer tampering</li>
                <li>Data entry error during MOT</li>
                <li>Instrument cluster replacement</li>
                <li>Technical fault with odometer</li>
              `;
            } else {
              tooltipContent += `
                <li>Incorrect odometer reading at previous test</li>
                <li>Long-distance/commercial use</li>
                <li>Multiple drivers sharing vehicle</li>
                <li>Test entry error</li>
              `;
            }
            
            tooltipContent += `</ul>`;
            
            // Position tooltip for touch
            const rect = event.target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            tooltip
              .html(tooltipContent)
              .style("visibility", "visible")
              .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
              .style("top", `${rect.top + scrollTop - 10}px`)
              .style("transform", "translate(-50%, -100%)");
          }
        });
      } else {
        // Mouse events for desktop (mouseover/mouseout/click)
        // ...similar to points, but with anomaly-specific content
      }
    }

    // Add transparent click/touch area to clear selection
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
            .attr("r", d => d.type ? (isMobile ? 10 : 9) : (isMobile ? 8 : 7))
            .attr("stroke-width", isMobile ? 2 : 1.5)
            .attr("stroke", COLORS.WHITE);

          setSelectedPoint(null);
          tooltip.style("visibility", "hidden");
        }
      });

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
    showAnomalies,
    showInactivePeriods,
    showTrendline,
    selectedPoint,
    isMobile,
    isTouchDevice
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
      <GovUKHeadingM>Vehicle Mileage History</GovUKHeadingM>
      
      {/* Mileage Chart Controls */}
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
      
      {/* Average Annual Mileage */}
      {chartData.averageAnnualMileage && (
        <InfoBox>
          Average annual mileage: <strong>{chartData.averageAnnualMileage.toLocaleString()} miles/year</strong>
          {chartData.averageAnnualMileage > 10000 ? ' (Above UK average of 8,000 miles/year)' : 
           chartData.averageAnnualMileage < 6000 ? ' (Below UK average of 8,000 miles/year)' : 
           ' (Close to UK average of 8,000 miles/year)'}
        </InfoBox>
      )}
      
      {/* Usage Patterns Content - Now displayed directly below the chart */}
      {!loading && !error && chartData.ratesData && chartData.ratesData.length > 0 && (
        <>
          <GovUKHeadingS>Vehicle Usage Summary</GovUKHeadingS>
          <UsageSummary>
            <SummaryGrid>
              <SummaryItem>
                <SummaryLabel>Records</SummaryLabel>
                <SummaryValue>{chartData.mileageData.length}</SummaryValue>
              </SummaryItem>
              
              <SummaryItem>
                <SummaryLabel>Date Range</SummaryLabel>
                <SummaryValue>
                  {chartData.mileageData.length > 0 ? 
                    `${chartData.mileageData[0].formattedDate} - ${chartData.mileageData[chartData.mileageData.length - 1].formattedDate}` : 
                    'N/A'}
                </SummaryValue>
              </SummaryItem>
              
              <SummaryItem>
                <SummaryLabel>Total Mileage</SummaryLabel>
                <SummaryValue>
                  {chartData.mileageData.length > 1 ? 
                    `${(chartData.mileageData[chartData.mileageData.length - 1].mileage - chartData.mileageData[0].mileage).toLocaleString()} mi` : 
                    'N/A'}
                </SummaryValue>
              </SummaryItem>
              
              <SummaryItem>
                <SummaryLabel>Average Annual</SummaryLabel>
                <SummaryValue>
                  {chartData.averageAnnualMileage ? 
                    `${chartData.averageAnnualMileage.toLocaleString()} mi/year` : 
                    'N/A'}
                </SummaryValue>
              </SummaryItem>
            </SummaryGrid>
          </UsageSummary>
          
          {chartData.anomalies.length > 0 && (
            <>
              <GovUKHeadingS>Detected Anomalies ({chartData.anomalies.length})</GovUKHeadingS>
              {chartData.anomalies.map((anomaly, index) => (
                <PatternCard 
                  key={`anomaly-${index}`} 
                  severity={anomaly.severity}
                >
                  <PatternTitle>{anomaly.details.current.formattedDate} - {anomaly.type === 'decrease' ? 'Mileage Decrease' : 'Unusual Increase'}</PatternTitle>
                  <PatternDetail>{anomaly.message}</PatternDetail>
                  <PatternStats>
                    <StatBox color={anomaly.type === 'decrease' ? COLORS.RED : '#f47738'}>
                      {anomaly.type === 'decrease' ? 
                        `${Math.abs(anomaly.details.diff).toLocaleString()} mi decrease` : 
                        `${Math.round(anomaly.details.dailyAvg)} mi/day`}
                    </StatBox>
                    <StatBox>
                      Period: {Math.round(anomaly.details.timeBetweenReadings)} days
                    </StatBox>
                    {anomaly.type === 'spike' && (
                      <StatBox color="#5C6BC0">
                        {Math.round(anomaly.details.annualizedMileage).toLocaleString()} mi/year
                      </StatBox>
                    )}
                  </PatternStats>
                </PatternCard>
              ))}
            </>
          )}
          
          {chartData.inactivityPeriods.length > 0 && (
            <>
              <GovUKHeadingS>Inactivity Periods ({chartData.inactivityPeriods.length})</GovUKHeadingS>
              {chartData.inactivityPeriods.map((period, index) => (
                <PatternCard 
                  key={`inactive-${index}`} 
                  severity={period.severity}
                >
                  <PatternTitle>
                    {period.start.formattedDate} to {period.end.formattedDate} ({Math.round(period.days)} days)
                  </PatternTitle>
                  <PatternDetail>{period.description}</PatternDetail>
                  <PatternStats>
                    <StatBox>
                      Mileage: {period.start.formattedMileage} → {period.end.formattedMileage}
                    </StatBox>
                    <StatBox color={
                      period.dailyAverage <= 0 ? COLORS.RED : 
                      period.dailyAverage < 5 ? '#f47738' : 
                      COLORS.GREEN
                    }>
                      {Math.round(period.dailyAverage * 10) / 10} mi/day
                    </StatBox>
                    <StatBox color="#5C6BC0">
                      {Math.round(period.dailyAverage * 365).toLocaleString()} mi/year
                    </StatBox>
                  </PatternStats>
                </PatternCard>
              ))}
            </>
          )}
          
          <GovUKHeadingS>Usage Periods</GovUKHeadingS>
          <UsagePeriodsTable>
            <thead>
              <tr>
                <th>Period</th>
                <th>Days</th>
                <th>Mileage Added</th>
                <th>Daily Rate</th>
                <th>Annual Rate</th>
              </tr>
            </thead>
            <tbody>
              {chartData.ratesData.map((period, index) => (
                <tr key={`period-${index}`}>
                  <td>{period.formattedPeriod}</td>
                  <td>{period.periodDays}</td>
                  <td>{(period.endMileage - period.startMileage).toLocaleString()}</td>
                  <td>{Math.round(period.dailyRate)} mi/day</td>
                  <td>{Math.round(period.annualizedRate).toLocaleString()} mi/year</td>
                </tr>
              ))}
            </tbody>
          </UsagePeriodsTable>
        </>
      )}
    </>
  );
}