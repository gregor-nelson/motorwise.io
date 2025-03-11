import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  GovUKContainer,
  GovUKHeadingM,
  GovUKInsetText,
  GovUKBody,
  GovUKHeadingS,
  COLORS,
  PremiumInfoPanel
} from '../../../../../styles/theme';
import { styled } from '@mui/material/styles';

// Styled components updated to match GOV.UK theme styling
const ChartContainer = styled('div')(({ theme }) => ({
  marginTop: '20px',
  marginBottom: '30px',
  width: '100%',
  height: '300px',
  position: 'relative',
  backgroundColor: COLORS.WHITE,
  padding: '15px 0',
  
  '@media (min-width: 40.0625em)': {
    height: '400px',
    padding: '20px 0',
  }
}));

const InfoBox = styled(GovUKInsetText)({
  marginTop: '10px',
  marginBottom: '20px',
});

const Legend = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  margin: '10px 0 20px 0',
  paddingLeft: '15px',
  
  '@media (min-width: 40.0625em)': {
    paddingLeft: '40px',
  }
});

const LegendItem = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: '12px',
  marginBottom: '8px',
  fontSize: '0.875rem',
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 400,
  color: COLORS.BLACK,
  
  '@media (min-width: 40.0625em)': {
    marginRight: '20px',
    marginBottom: '5px',
    fontSize: '1rem',
    lineHeight: 1.25,
  }
}));

const LegendMarker = styled('div')(({ color, shape }) => ({
  width: '14px',
  height: '14px',
  backgroundColor: color,
  marginRight: '6px',
  borderRadius: shape === 'circle' ? '50%' : '0',
  transform: shape === 'triangle' ? 'rotate(45deg)' : 'none',
}));

const LegendLine = styled('div')({
  width: '20px',
  height: '2px',
  backgroundColor: COLORS.BLUE,
  marginRight: '6px',
});

const LegendShade = styled('div')(({ theme }) => ({
  width: '20px',
  height: '14px',
  backgroundColor: COLORS.LIGHT_GREY,
  marginRight: '6px',
  border: `1px dashed ${COLORS.MID_GREY}`,
}));

const LoadingSpinner = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '200px',
  '&:after': {
    content: '""',
    width: '40px',
    height: '40px',
    border: '5px solid #f3f3f3',
    borderTop: `5px solid ${COLORS.BLUE}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

const ErrorMessage = styled(GovUKInsetText)({
  borderLeft: `5px solid ${COLORS.RED}`,
  backgroundColor: '#fff',
  padding: '15px',
});

/**
 * Pure D3 implementation of the Vehicle Mileage Chart
 */
const VehicleMileageChart = ({ registration, vin }) => {
  const chartRef = useRef(null);
  const d3Container = useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [chartData, setChartData] = React.useState({
    mileageData: [],
    anomalies: [],
    inactivityPeriods: [],
    averageAnnualMileage: null
  });
  
  // This will destroy and rebuild the chart on unmount
  useEffect(() => {
    return () => {
      if (d3Container.current) {
        // Clean up any D3 bindings, etc.
        d3.select(d3Container.current).selectAll("*").remove();
      }
    };
  }, []);

  // Fetch and process data - this will run once when component mounts
  useEffect(() => {
    // Skip if no registration or VIN
    if (!registration && !vin) return;
    
    setLoading(true);
    setError(null);
    
    const fetchVehicleData = async () => {
      try {
        // Decide which endpoint to use based on available data
        const endpoint = registration 
          ? `/api/v1/vehicle/registration/${registration}`
          : `/api/v1/vehicle/vin/${vin}`;
        
        // Use absolute URL for local development, or relative URL for production
        const baseUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8000'
          : '';
        
        const response = await fetch(`${baseUrl}${endpoint}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.errorMessage || 
            `Failed to fetch vehicle data: ${response.status} ${response.statusText}`
          );
        }
        
        const vehicleData = await response.json();
        
        if (!vehicleData || !vehicleData.motTests || !Array.isArray(vehicleData.motTests)) {
          throw new Error('Invalid data format received from server');
        }
        
        // Process the MOT data
        processMotData(vehicleData.motTests);
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
        setError(err.message || 'Failed to fetch vehicle data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicleData();
  }, [registration, vin]);

  // Process MOT test data into chart data
  const processMotData = (motTests) => {
    if (!motTests || motTests.length === 0) {
      setChartData({
        mileageData: [],
        anomalies: [],
        inactivityPeriods: [],
        averageAnnualMileage: null
      });
      return;
    }
    
    // Transform MOT tests into usable format
    const formattedData = motTests.map(test => {
      // Parse date
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
      
      // Format mileage
      let mileageStr = '0';
      let numericMileage = 0;
      try {
        if (test.odometerValue) {
          numericMileage = parseInt(test.odometerValue, 10);
          mileageStr = numericMileage.toLocaleString();
        }
      } catch (err) {
        console.warn('Error formatting mileage:', err);
        mileageStr = test.odometerValue || '0';
      }
      
      // Process test result
      let testStatus = 'UNKNOWN';
      
      if (test.testResult) {
        // Normalize the test result string
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
        testResult: testStatus
      };
    })
    .filter(test => !isNaN(test.mileage) && test.mileage > 0 && test.date > new Date(1990, 0, 1))
    .sort((a, b) => a.date - b.date);
    
    // Calculate anomalies
    const anomalies = findAnomalies(formattedData);
    
    // Calculate inactive periods
    const inactivityPeriods = findInactivityPeriods(formattedData);
    
    // Calculate average annual mileage
    let averageAnnualMileage = null;
    if (formattedData.length >= 2) {
      const firstRecord = formattedData[0];
      const lastRecord = formattedData[formattedData.length - 1];
      
      const totalMileage = lastRecord.mileage - firstRecord.mileage;
      const timeSpanMs = lastRecord.date.getTime() - firstRecord.date.getTime();
      const timeSpanYears = timeSpanMs / (1000 * 60 * 60 * 24 * 365.25);
      
      if (timeSpanYears >= 0.5) { // Require at least 6 months of data
        averageAnnualMileage = Math.round(totalMileage / timeSpanYears);
      }
    }
    
    // Set all processed data
    setChartData({
      mileageData: formattedData,
      anomalies,
      inactivityPeriods,
      averageAnnualMileage
    });
  };
  
  // Find mileage anomalies
  const findAnomalies = (mileageData) => {
    if (mileageData.length < 2) return [];
    
    const anomalyList = [];
    
    // Define thresholds based on UK driving patterns
    const ANNUAL_MILEAGE_THRESHOLD = 40000; // Miles per year (very high for UK)
    const SHORT_INTERVAL_DAILY_THRESHOLD = 250; // Miles per day for short intervals
    const UK_AVG_DAILY_MILEAGE = 8000 / 365; // ~22 miles per day
    
    // Function to get expected mileage range factor based on time interval
    const getExpectedMileageRange = (daysDiff) => {
      if (daysDiff <= 30) return 5.0; // For likely retests
      if (daysDiff <= 90) return 4.0; // 1-3 months
      if (daysDiff <= 180) return 3.0; // 3-6 months
      if (daysDiff <= 365) return 2.5; // 6-12 months
      return 2.0; // Over a year (stricter threshold)
    };
    
    // Check for anomalies between consecutive readings
    for (let i = 1; i < mileageData.length; i++) {
      const prevReading = mileageData[i-1];
      const currentReading = mileageData[i];
      
      // Calculate time difference in days
      const daysDiff = (currentReading.date.getTime() - prevReading.date.getTime()) / (1000 * 60 * 60 * 24);
      
      // Calculate mileage change
      const mileageDiff = currentReading.mileage - prevReading.mileage;
      
      // Flag decreasing mileage
      if (mileageDiff < 0) {
        anomalyList.push({
          index: i,
          date: currentReading.date,
          type: 'decrease',
          message: `Mileage decreased by ${Math.abs(mileageDiff).toLocaleString()} miles from previous reading`,
          details: {
            current: currentReading,
            previous: prevReading,
            diff: mileageDiff
          }
        });
      }
      // Check for unrealistic increases
      else if (mileageDiff > 0 && daysDiff > 0) {
        const dailyAverage = mileageDiff / daysDiff;
        const expectedMaxDaily = UK_AVG_DAILY_MILEAGE * getExpectedMileageRange(daysDiff);
        const annualizedMileage = dailyAverage * 365;
        
        // Flag if suspicious based on thresholds
        if (
          (daysDiff >= 300 && annualizedMileage > ANNUAL_MILEAGE_THRESHOLD) ||
          (daysDiff < 300 && daysDiff > 7 && dailyAverage > expectedMaxDaily) ||
          dailyAverage > SHORT_INTERVAL_DAILY_THRESHOLD
        ) {
          let message = `Unusually high mileage increase (${Math.round(dailyAverage)} miles/day, ${Math.round(annualizedMileage).toLocaleString()} miles/year equivalent)`;
          
          if (annualizedMileage > ANNUAL_MILEAGE_THRESHOLD) {
            message += ` - well above typical UK average of 8,000 miles/year`;
          }
          
          anomalyList.push({
            index: i,
            date: currentReading.date,
            type: 'spike',
            message: message,
            details: {
              current: currentReading,
              previous: prevReading,
              diff: mileageDiff,
              days: daysDiff,
              dailyAvg: dailyAverage,
              annualizedMileage: annualizedMileage
            }
          });
        }
      }
    }
    
    return anomalyList;
  };
  
  // Find periods of inactivity
  const findInactivityPeriods = (mileageData) => {
    if (mileageData.length < 2) return [];
    
    const inactivityList = [];
    const UK_AVG_DAILY_MILEAGE = 8000 / 365; // ~22 miles per day
    const LOW_ACTIVITY_THRESHOLD = UK_AVG_DAILY_MILEAGE * 0.25; // 25% of average
    const MIN_INACTIVITY_DAYS = 60; // Minimum 2 months
    
    // Check for periods of low activity
    for (let i = 1; i < mileageData.length; i++) {
      const prevReading = mileageData[i-1];
      const currentReading = mileageData[i];
      
      // Calculate time difference in days
      const daysDiff = (currentReading.date.getTime() - prevReading.date.getTime()) / (1000 * 60 * 60 * 24);
      
      // Skip if period is too short
      if (daysDiff < MIN_INACTIVITY_DAYS) continue;
      
      // Calculate daily mileage rate
      const mileageDiff = currentReading.mileage - prevReading.mileage;
      const dailyAverage = mileageDiff / daysDiff;
      
      // If daily average is very low, mark as inactive period
      if (dailyAverage < LOW_ACTIVITY_THRESHOLD) {
        const monthsDiff = Math.round(daysDiff / 30);
        let description;
        
        if (dailyAverage <= 0) {
          description = `Vehicle appears to have been unused for ${monthsDiff} months`;
        } else {
          description = `Very low usage period (${Math.round(dailyAverage)} miles/day for ${monthsDiff} months)`;
        }
        
        inactivityList.push({
          start: prevReading,
          end: currentReading,
          days: daysDiff,
          dailyAverage: dailyAverage,
          description: description
        });
      }
    }
    
    return inactivityList;
  };

  // Create/update chart when data changes or container resizes
  useEffect(() => {
    // Skip if loading, has error, no data, or no container
    if (loading || error || !chartData.mileageData.length || !d3Container.current) return;
    
    // Clear the container first
    d3.select(d3Container.current).selectAll("*").remove();
    
    // Create the chart
    createChart();
    
    // Set up resize handler
    const handleResize = () => {
      // Simple delay to batch rapid resize events
      setTimeout(() => {
        // Only recreate if container still exists
        if (d3Container.current) {
          d3.select(d3Container.current).selectAll("*").remove();
          createChart();
        }
      }, 100);
    };
    
    // Add listeners for window resize and orientation change
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Also use ResizeObserver if available for more reliable resize detection
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        if (d3Container.current) {
          d3.select(d3Container.current).selectAll("*").remove();
          createChart();
        }
      });
      
      if (chartRef.current) {
        resizeObserver.observe(chartRef.current);
      }
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        
        if (chartRef.current) {
          resizeObserver.unobserve(chartRef.current);
        }
      };
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [loading, error, chartData]);
  
  // The core D3 chart creation function
  const createChart = () => {
    const { mileageData, anomalies, inactivityPeriods } = chartData;
    
    // Ensure the container exists
    if (!d3Container.current || !chartRef.current) return;
    
    // Check viewport width for responsiveness
    const isMobile = window.innerWidth < 650;
    
    // Set chart dimensions
    const containerWidth = chartRef.current.clientWidth;
    const containerHeight = chartRef.current.clientHeight;
    
    // Set margins
    const margin = {
      top: isMobile ? 30 : 40,
      right: isMobile ? 20 : 50,
      bottom: isMobile ? 50 : 40,
      left: isMobile ? 30 : 40
    };
    
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(d3Container.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(mileageData, d => d.date))
      .range([0, width])
      .nice();
    
    // Add buffer to y-axis
    const yMin = d3.min(mileageData, d => d.mileage);
    const yMax = d3.max(mileageData, d => d.mileage);
    const yBuffer = (yMax - yMin) * 0.1;
    
    const yScale = d3.scaleLinear()
      .domain([Math.max(0, yMin - yBuffer), yMax + yBuffer])
      .range([height, 0])
      .nice();
    
    // Create axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(isMobile ? 4 : 6)
        .tickFormat(d3.timeFormat("%m/%Y")))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", isMobile ? "10px" : "11px")
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("color", "#666")
      .attr("dy", "1em");
    
    // Create y-axis with hidden labels
    const yAxis = svg.append("g")
      .call(d3.axisLeft(yScale)
        .ticks(isMobile ? 5 : 6)
        .tickFormat("")) // Empty string hides labels
      .selectAll("text")
      .style("opacity", 0);
    
    // Create grid lines with GOV.UK styling
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(6)
        .tickSize(-height)
        .tickFormat(""))
      .selectAll("line")
      .style("stroke", COLORS.MID_GREY)
      .style("stroke-opacity", 0.3);
    
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .ticks(6)
        .tickSize(-width)
        .tickFormat(""))
      .selectAll("line")
      .style("stroke", COLORS.MID_GREY)
      .style("stroke-opacity", 0.3);
    
    // Hide the domain paths (axis lines)
    svg.selectAll(".domain").style("stroke", COLORS.MID_GREY).style("stroke-opacity", 0.5);
    
    // Create tooltip styled according to GOV.UK design
    const tooltip = d3.select(chartRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", COLORS.WHITE)
      .style("border-left", `5px solid ${COLORS.BLUE}`)
      .style("border-radius", "0")
      .style("padding", isMobile ? "10px" : "15px")
      .style("box-shadow", `0 2px 0 ${COLORS.MID_GREY}`)
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("font-size", isMobile ? "0.875rem" : "1rem")
      .style("line-height", isMobile ? "1.1428571429" : "1.25")
      .style("font-weight", "400")
      .style("color", COLORS.BLACK)
      .style("pointer-events", "none")
      .style("z-index", 10)
      .style("max-width", "90%")
      .style("word-break", "break-word");
    
    // Draw inactive periods first (behind other elements) with GOV.UK styling
    inactivityPeriods.forEach(period => {
      svg.append("rect")
        .attr("class", "inactive-period")
        .attr("x", xScale(period.start.date))
        .attr("y", 0)
        .attr("width", xScale(period.end.date) - xScale(period.start.date))
        .attr("height", height)
        .attr("fill", `${COLORS.LIGHT_GREY}`)
        .attr("stroke", `${COLORS.MID_GREY}`)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .style("pointer-events", "all")
        .on("mouseover", (event) => {
          tooltip
            .html(`
              <div style="font-weight: bold; margin-bottom: 4px">Inactive Period</div>
              <div>From: ${period.start.formattedDate}</div>
              <div>To: ${period.end.formattedDate}</div>
              <div>Mileage: ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
              <div style="margin-top: 4px; color: #666">${period.description}</div>
            `)
            .style("visibility", "visible")
            .style("left", `${(xScale(period.start.date) + xScale(period.end.date)) / 2 + margin.left}px`)
            .style("top", `${height / 2 + margin.top - 20}px`)
            .style("transform", "translate(-50%, -100%)");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    });
    
    // Create line with GOV.UK styling
    svg.append("path")
      .datum(mileageData)
      .attr("fill", "none")
      .attr("stroke", COLORS.BLUE)
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.mileage))
        .curve(d3.curveMonotoneX));
    
    // Add mileage points with GOV.UK styling
    svg.selectAll(".mileage-point")
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
      .on("mouseover", (event, d) => {
        // Highlight the point with GOV.UK focus style
        d3.select(event.currentTarget)
          .attr("r", isMobile ? 10 : 9)
          .attr("stroke-width", 2)
          .attr("stroke", COLORS.BLACK);
        
        // Show tooltip
        tooltip
          .html(`
            <div><strong>${d.formattedDate}</strong></div>
            <div>Mileage: ${d.formattedMileage}</div>
            ${d.testResult ? `
              <div>Result: <span style="color: ${d.testResult.includes('PASS') ? COLORS.GREEN : COLORS.RED}; font-weight: bold">
                ${d.testResult}
              </span></div>
            ` : ''}
          `)
          .style("visibility", "visible")
          .style("left", `${xScale(d.date) + margin.left}px`)
          .style("top", `${yScale(d.mileage) + margin.top - (isMobile ? 30 : 10)}px`)
          .style("transform", "translate(-50%, -100%)");
      })
      .on("mouseout", (event, d) => {
        // Restore point size with original GOV.UK styling
        d3.select(event.currentTarget)
          .attr("r", isMobile ? 8 : 7)
          .attr("stroke-width", isMobile ? 2 : 1.5)
          .attr("stroke", COLORS.WHITE);
        
        // Hide tooltip
        tooltip.style("visibility", "hidden");
      });
    
    // Add anomaly markers with GOV.UK styling
    svg.selectAll(".anomaly")
      .data(anomalies)
      .enter()
      .append("circle")
      .attr("class", "anomaly")
      .attr("cx", d => xScale(d.details.current.date))
      .attr("cy", d => yScale(d.details.current.mileage))
      .attr("r", isMobile ? 10 : 9)
      .attr("fill", d => d.type === "decrease" ? COLORS.RED : "#f47738") // Using GOV.UK orange
      .attr("stroke", COLORS.WHITE)
      .attr("stroke-width", isMobile ? 2 : 1.5)
      .attr("opacity", 0.9)
      .on("mouseover", (event, d) => {
        // Highlight the marker with GOV.UK focus style
        d3.select(event.currentTarget)
          .attr("r", isMobile ? 12 : 11)
          .attr("stroke-width", 2)
          .attr("stroke", COLORS.BLACK);
        
        // Show tooltip
        tooltip
          .html(`
            <div><strong>${d.details.current.formattedDate}</strong></div>
            <div>Mileage: ${d.details.current.formattedMileage}</div>
            <div style="color: ${d.type === 'decrease' ? COLORS.RED : COLORS.ORANGE}; font-weight: bold">
              ${d.message}
            </div>
          `)
          .style("visibility", "visible")
          .style("left", `${xScale(d.details.current.date) + margin.left}px`)
          .style("top", `${yScale(d.details.current.mileage) + margin.top - (isMobile ? 40 : 10)}px`)
          .style("transform", "translate(-50%, -100%)");
      })
      .on("mouseout", (event, d) => {
        // Restore marker size with original GOV.UK styling
        d3.select(event.currentTarget)
          .attr("r", isMobile ? 10 : 9)
          .attr("stroke-width", isMobile ? 2 : 1.5)
          .attr("stroke", COLORS.WHITE);
        
        // Hide tooltip
        tooltip.style("visibility", "hidden");
      });
    
    // Add mileage labels for key points
    const labelsToShow = [];
    
    // Always add first and last point
    if (mileageData.length > 0) {
      labelsToShow.push(mileageData[0]);
      labelsToShow.push(mileageData[mileageData.length - 1]);
    }
    
    // Add start and end of inactive periods
    inactivityPeriods.forEach(period => {
      if (!labelsToShow.includes(period.start)) {
        labelsToShow.push(period.start);
      }
      if (!labelsToShow.includes(period.end)) {
        labelsToShow.push(period.end);
      }
    });
    
    // Create the labels
    labelsToShow.forEach(point => {
      d3.select(chartRef.current)
        .append("div")
        .attr("class", "mileage-label")
        .style("position", "absolute")
        .style("left", `${xScale(point.date) + margin.left}px`)
        .style("top", `${yScale(point.mileage) + margin.top - 25}px`)
        .style("transform", "translate(-50%, -100%)")
        .style("color", "#333")
        .style("background-color", "white")
        .style("border-radius", "2px")
        .style("padding", "2px 4px")
        .style("font-size", isMobile ? "10px" : "11px")
        .style("font-weight", "bold")
        .style("font-family", "'GDS Transport', arial, sans-serif")
        .style("pointer-events", "none")
        .style("z-index", 5)
        .text(`${point.formattedMileage} mi`);
    });
  };

  // Show loading state
  if (loading) {
    return (
      <GovUKContainer>
        <GovUKHeadingM>Vehicle Mileage History</GovUKHeadingM>
        <LoadingSpinner />
        <GovUKBody>Loading vehicle data...</GovUKBody>
      </GovUKContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <GovUKContainer>
        <GovUKHeadingM>Vehicle Mileage History</GovUKHeadingM>
        <ErrorMessage>
          <GovUKBody>Error loading vehicle data: {error}</GovUKBody>
          <GovUKBody>Please try again later or contact support if the problem persists.</GovUKBody>
        </ErrorMessage>
      </GovUKContainer>
    );
  }

  // Show empty state if no data
  if (!chartData.mileageData || chartData.mileageData.length === 0) {
    return (
      <GovUKContainer>
        <GovUKHeadingM>Vehicle Mileage History</GovUKHeadingM>
        <GovUKInsetText>
          <GovUKBody>No mileage data available for this vehicle.</GovUKBody>
        </GovUKInsetText>
      </GovUKContainer>
    );
  }

  // Show chart with data
  return (
    <GovUKContainer>
      <GovUKHeadingM>Vehicle Mileage History</GovUKHeadingM>
      
      <GovUKBody>
        Track how this vehicle's mileage has changed over time based on MOT test readings.
        Hover over points for detailed information.
      </GovUKBody>
      
      {/* Chart container with GOV.UK styling */}
      <PremiumInfoPanel>
        <ChartContainer ref={chartRef}>
          <svg 
            ref={d3Container} 
            width="100%" 
            height="100%" 
            style={{ 
              overflow: 'visible' // Allow labels to extend outside SVG
            }} 
          />
        </ChartContainer>
      
      {/* Chart legend - styled according to GOV.UK guidelines */}
      <Legend style={{ marginTop: '10px', marginBottom: '15px' }}>
        <LegendItem>
          <LegendMarker color={COLORS.GREEN} shape="circle" />
          <span>MOT Pass</span>
        </LegendItem>
        <LegendItem>
          <LegendMarker color={COLORS.RED} shape="circle" />
          <span>MOT Fail</span>
        </LegendItem>
        <LegendItem>
          <LegendMarker color={COLORS.RED} shape="circle" />
          <span>Mileage decrease</span>
        </LegendItem>
        <LegendItem>
          <LegendMarker color={"#f47738"} shape="circle" />
          <span>Unusual rate</span>
        </LegendItem>
        <LegendItem>
          <LegendLine />
          <span>Mileage</span>
        </LegendItem>
        <LegendItem>
          <LegendShade />
          <span>Inactivity</span>
        </LegendItem>
      </Legend>
      </PremiumInfoPanel>
      
      {/* Inactive periods section */}
      {chartData.inactivityPeriods.length > 0 && (
        <InfoBox>
          <GovUKHeadingS>Periods of inactivity detected:</GovUKHeadingS>
          <ul>
            {chartData.inactivityPeriods.map((period, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                <strong>{period.start.formattedDate} to {period.end.formattedDate}:</strong> {period.description}
              </li>
            ))}
          </ul>
          <GovUKBody>
            <small>
              Note: Inactive periods are identified when the vehicle shows minimal or no increase in mileage over an extended time.
            </small>
          </GovUKBody>
        </InfoBox>
      )}
      
      {/* Anomalies section */}
      {chartData.anomalies.length > 0 && (
        <InfoBox>
          <GovUKHeadingS>Potential mileage issues detected:</GovUKHeadingS>
          <ul>
            {chartData.anomalies.map((anomaly, index) => (
              <li key={index} style={{ 
                color: anomaly.type === 'decrease' ? COLORS.RED : 'inherit',
                marginBottom: '8px'
              }}>
                {anomaly.details.current.formattedDate}: {anomaly.message}
              </li>
            ))}
          </ul>
          <GovUKBody>
            <small>
              Note: Anomalies may indicate potential odometer issues, data entry errors, or legitimate corrections.
            </small>
          </GovUKBody>
        </InfoBox>
      )}
      
      {/* Average annual mileage */}
      {chartData.averageAnnualMileage && (
        <InfoBox>
          <GovUKBody>
            <strong>Average annual mileage: </strong> 
            {chartData.averageAnnualMileage.toLocaleString()} miles per year
            <br/>
            <small>Based on {chartData.mileageData.length} MOT test records over {
              ((chartData.mileageData[chartData.mileageData.length-1].date.getTime() - chartData.mileageData[0].date.getTime()) / 
              (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)
            } years</small>
          </GovUKBody>
        </InfoBox>
      )}
      
    </GovUKContainer>
  );
};

export default VehicleMileageChart;