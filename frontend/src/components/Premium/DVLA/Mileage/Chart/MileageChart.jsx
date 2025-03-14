import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { 
  select, 
  selectAll, 
  scaleTime, 
  scaleLinear, 
  extent, 
  min, 
  max, 
  axisBottom, 
  axisLeft, 
  timeFormat, 
  format, 
  line, 
  curveLinear
} from 'd3';
import {
  GovUKHeadingM,
  COLORS,
  BREAKPOINTS
} from '../../../../../styles/theme';

// Import styled components
import {
  ChartContainer,
  InfoBox,
  ControlPanel,
  ControlButton,
  LoadingSpinner,
  ErrorMessage,
  hexToRgb
} from './style/VehicleMileageChartStyles';

// Import data processing utilities
import { fetchVehicleData } from './VehicleMileageData';

// Define ORANGE properly using the theme colors
const ORANGE = COLORS.YELLOW || '#fd0'; // Using proper GOV.UK yellow from theme

/**
 * Optimized D3-first implementation of the Vehicle Mileage Chart
 * Simplified with improved visual styling and aligned with GOV.UK design language
 */
export default function VehicleMileageChart({ registration, vin }) {
  // Chart refs and containers
  const svgRef = useRef(null);
  const chartContainerRef = useRef(null);
  const tooltipRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const resizeTimerRef = useRef(null);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    mileageData: [],
    anomalies: [],
    inactivityPeriods: [],
    averageAnnualMileage: null
  });
  
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // Device detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 650);
  const [isTouchDevice, setIsTouchDevice] = useState(
    'ontouchstart' in window || navigator.maxTouchPoints > 0
  );
  
  // Define margin as a memoized value
  const margin = useMemo(() => ({
    top: isMobile ? 20 : 40,
    right: isMobile ? 15 : 50,
    bottom: isMobile ? 30 : 40,
    left: isMobile ? 30 : 40 // Reduced left margin since we simplified the y-axis
  }), [isMobile]);
  
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
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
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
      clearTimeout(scrollTimerRef.current);
    };
  }, [isTouchDevice, handleScroll]);

  // Clean up D3 on unmount
  useEffect(() => {
    return () => {
      if (svgRef.current) {
        select(svgRef.current).selectAll("*").remove();
      }
      selectAll(".d3-tooltip").remove();
      clearTimeout(scrollTimerRef.current);
      clearTimeout(resizeTimerRef.current);
    };
  }, []);

  // Fetch data
  useEffect(() => {
    if (!registration && !vin) {
      return;
    }

    setLoading(true);
    setError(null);

    const loadVehicleData = async () => {
      try {
        const data = await fetchVehicleData(registration, vin);
        setChartData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch vehicle data');
      } finally {
        setLoading(false);
      }
    };

    loadVehicleData();
  }, [registration, vin]);

  // Create tooltip - improved styling
  const createTooltip = useCallback(() => {
    selectAll(".d3-tooltip").remove();
    
    const tooltip = select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", COLORS.WHITE)
      .style("border-left", `4px solid ${COLORS.BLUE}`) // Thinner, consistent color
      .style("border-radius", "0")
      .style("padding", isMobile ? "12px" : "15px") // Slightly smaller padding
      .style("box-shadow", `0 2px 4px rgba(0,0,0,0.2)`) // More subtle shadow
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("font-size", isMobile ? "0.8rem" : "0.9rem") // Smaller font
      .style("line-height", "1.4")
      .style("font-weight", "400")
      .style("color", COLORS.BLACK)
      .style("pointer-events", "none")
      .style("z-index", 100)
      .style("max-width", isMobile ? "calc(100vw - 40px)" : "300px") // Slightly narrower
      .style("word-break", "break-word")
      .style("-webkit-font-smoothing", "antialiased")
      .style("-moz-osx-font-smoothing", "grayscale");
    
    // Add close button for mobile tooltips with GOV.UK styling
    if (isMobile) {
      tooltip.append("div")
        .style("position", "absolute")
        .style("top", "5px")
        .style("right", "5px")
        .style("width", "20px") // Smaller
        .style("height", "20px") // Smaller
        .style("cursor", "pointer")
        .style("background-color", COLORS.LIGHT_GREY)
        .style("border-radius", "50%")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("font-size", "14px") // Smaller
        .style("line-height", "1")
        .style("font-weight", "bold")
        .style("color", COLORS.BLACK)
        .text("×")
        .on("click", () => {
          tooltip.style("visibility", "hidden");
          setSelectedPoint(null);
          
          // Reset all points
          selectAll(".mileage-point, .anomaly")
            .attr("r", function() {
              return isMobile ? 3.5 : 5; // Smaller points
            })
            .attr("stroke-width", isMobile ? 1 : 1.5)
            .attr("stroke", COLORS.WHITE);
        });
    }
    
    tooltipRef.current = tooltip;
    return tooltip;
  }, [isMobile, isTouchDevice, selectedPoint]);

  // Setup chart dimensions - separated from main rendering function
  const setupChartDimensions = useCallback(() => {
    if (!chartContainerRef.current) return null;
    
    const containerWidth = chartContainerRef.current.clientWidth;
    const containerHeight = chartContainerRef.current.clientHeight;

    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create SVG container with responsive viewBox
    const svg = select(svgRef.current)
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
  }, [margin, isMobile]);

  // Create scales for the chart - memoized
  const createScales = useCallback((mileageData, width, height) => {
    if (!mileageData || mileageData.length === 0) return null;

    const xScale = scaleTime()
      .domain(extent(mileageData, d => d.date))
      .range([0, width])
      .nice();

    const yMin = min(mileageData, d => d.mileage);
    const yMax = max(mileageData, d => d.mileage);
    const yBuffer = (yMax - yMin) * 0.1;

    const yScale = scaleLinear()
      .domain([Math.max(0, yMin - yBuffer), yMax + yBuffer])
      .range([height, 0])
      .nice();

    return { xScale, yScale };
  }, []);

  // Draw axes for the chart - simplified x-axis only
  const drawAxes = useCallback((chart, xScale, yScale, width, height) => {
    // Draw x-axis with simplified labels
    chart.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(axisBottom(xScale)
        .ticks(isMobile ? 4 : 5) // Fewer ticks
        .tickFormat(timeFormat("%b '%y"))) // Simplified format (Month 'Year)
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", isMobile ? "9px" : "10px") // Smaller font
      .style("font-family", "'GDS Transport', arial, sans-serif")
      .style("color", COLORS.BLACK)
      .style("font-weight", "400")
      .attr("dy", "0.8em");

    // Style axis lines
    chart.selectAll(".x-axis .domain, .x-axis .tick line")
      .style("stroke", COLORS.MID_GREY)
      .style("stroke-width", 0.5); // Thinner lines

    // Add horizontal grid only 
    chart.append("g")
      .attr("class", "grid horizontal-grid")
      .call(axisLeft(yScale)
        .ticks(isMobile ? 4 : 5)
        .tickSize(-width)
        .tickFormat(""))
      .selectAll("line")
      .style("stroke", COLORS.LIGHT_GREY)
      .style("stroke-opacity", 0.5)
      .style("stroke-dasharray", "2,2"); // Light dashed gridlines

    // Hide domain line and tick text for grid
    chart.selectAll(".grid .domain").style("stroke", "none");
    chart.selectAll(".grid .tick text").style("display", "none");
  }, [isMobile]);

  // Draw inactive periods - IMPROVED with more visible styling
  const drawInactivePeriods = useCallback((chart, inactivityPeriods, xScale, height, tooltip) => {
    if (!inactivityPeriods || !inactivityPeriods.length) return;

    inactivityPeriods.forEach(period => {
      // Improved fill colors for inactive periods - more visible
      const fillColor = period.severity === "high" ?
        `rgba(${hexToRgb(COLORS.RED)}, 0.15)` : // Increased opacity
        period.severity === "medium" ?
          `rgba(${hexToRgb(COLORS.RED)}, 0.15)` : // Using RED instead of ORANGE
          `rgba(${hexToRgb(COLORS.MID_GREY)}, 0.15)`; // Increased opacity

      const strokeColor = period.severity === "high" ?
        COLORS.RED :
        period.severity === "medium" ?
          COLORS.RED :
          COLORS.MID_GREY;

      chart.append("rect")
        .attr("class", "inactive-period")
        .attr("x", xScale(period.start.date))
        .attr("y", 0)
        .attr("width", xScale(period.end.date) - xScale(period.start.date))
        .attr("height", height)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 1.5) // Increased stroke width for better visibility
        .attr("stroke-dasharray", "5,5") // More prominent dashes (same as anomaly sections)
        .style("pointer-events", "all")
        .attr("tabindex", 0)
        .attr("role", "button")
        .attr("aria-label", `Inactive period from ${period.start.formattedDate} to ${period.end.formattedDate}`)
        .on("mouseover", function(event) {
          if (isTouchDevice) return;
          
          tooltip
            .html(`
              <div style="font-weight: 700; margin-bottom: 6px; font-size: ${isMobile ? '14px' : '16px'};">Inactive Period</div>
              <div style="margin-bottom: 3px;"><strong>From:</strong> ${period.start.formattedDate}</div>
              <div style="margin-bottom: 3px;"><strong>To:</strong> ${period.end.formattedDate}</div>
              <div style="margin-bottom: 6px;"><strong>Mileage:</strong> ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
              <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 8px 0;">
              <div style="margin-top: 6px; color: ${COLORS.BLACK}; font-size: 0.85rem;">${period.description}</div>
            `)
            .style("visibility", "visible")
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY - 10}px`)
            .style("transform", "translate(-50%, -100%)");
        })
        .on("mouseout", () => {
          if (isTouchDevice) return;
          
          if (!selectedPoint) {
            tooltip.style("visibility", "hidden");
          }
        })
        .on("touchstart", function(event) {
          if (!isTouchDevice) return;
          
          event.preventDefault();
          const isSelected = selectedPoint === "inactive-period";
          
          // Reset all points
          chart.selectAll(".mileage-point, .anomaly")
            .attr("r", function() {
              return isMobile ? 3.5 : 5;
            })
            .attr("stroke-width", isMobile ? 1 : 1.5)
            .attr("stroke", COLORS.WHITE);
          
          if (isSelected) {
            setSelectedPoint(null);
            tooltip.style("visibility", "hidden");
          } else {
            setSelectedPoint("inactive-period");
            
            // Highlight this rect
            select(this)
              .attr("stroke-width", 2)
              .attr("stroke", COLORS.BLACK);
            
            // Get position for tooltip
            const rect = event.target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            tooltip
              .html(`
                <div style="font-weight: 700; margin-bottom: 6px; font-size: ${isMobile ? '14px' : '16px'};">Inactive Period</div>
                <div style="margin-bottom: 3px;"><strong>From:</strong> ${period.start.formattedDate}</div>
                <div style="margin-bottom: 3px;"><strong>To:</strong> ${period.end.formattedDate}</div>
                <div style="margin-bottom: 6px;"><strong>Mileage:</strong> ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
                <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 8px 0;">
                <div style="margin-top: 6px; color: ${COLORS.BLACK}; font-size: 0.85rem;">${period.description}</div>
              `)
              .style("visibility", "visible")
              .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
              .style("top", `${rect.top + scrollTop - 10}px`)
              .style("transform", "translate(-50%, -100%)");
          }
        })
        .on("keypress", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        })
        .on("click", (event) => {
          if (isTouchDevice) return;
          
          const isVisible = tooltip.style("visibility") === "visible";
          if (isVisible) {
            tooltip.style("visibility", "hidden");
            setSelectedPoint(null);
          } else {
            tooltip
              .html(`
                <div style="font-weight: 700; margin-bottom: 6px; font-size: ${isMobile ? '14px' : '16px'};">Inactive Period</div>
                <div style="margin-bottom: 3px;"><strong>From:</strong> ${period.start.formattedDate}</div>
                <div style="margin-bottom: 3px;"><strong>To:</strong> ${period.end.formattedDate}</div>
                <div style="margin-bottom: 6px;"><strong>Mileage:</strong> ${period.start.formattedMileage} → ${period.end.formattedMileage}</div>
                <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 8px 0;">
                <div style="margin-top: 6px; color: ${COLORS.BLACK}; font-size: 0.85rem;">${period.description}</div>
              `)
              .style("visibility", "visible")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 10}px`)
              .style("transform", "translate(-50%, -100%)");
            setSelectedPoint("inactive-period");
          }
        });
    });
  }, [isMobile, isTouchDevice, selectedPoint]);

  // Draw trendline - less smooth
  const drawTrendline = useCallback((chart, mileageData, xScale, yScale, width, height, tooltip) => {
    if (!mileageData || mileageData.length <= 1) return;

    // Use curveLinear for less smoothing
    const lineGenerator = line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.mileage))
      .curve(curveLinear); // Less smooth

    chart.append("path")
      .datum(mileageData)
      .attr("class", "trendline-smooth")
      .attr("fill", "none")
      .attr("stroke", COLORS.GREEN)
      .attr("stroke-width", isMobile ? 1 : 1.5) // Thinner line
      .attr("stroke-dasharray", "3,3") // Smaller dashes
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

        const extendDays = 45; // Shorter extension
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
          .attr("stroke", `rgba(${hexToRgb(COLORS.GREEN)}, 0.7)`) // More transparent
          .attr("stroke-width", isMobile ? 1.5 : 2) // Thinner line
          .attr("d", line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.mileage))
          );

        const avgDailyMileage = slope * (24 * 60 * 60 * 1000);
        const avgAnnualMileage = avgDailyMileage * 365;
        
        // Add interactive area over the trendline for tooltip
        const trendlineArea = chart.append("path")
          .datum(mileageData)
          .attr("class", "trendline-interactive-area")
          .attr("fill", "none")
          .attr("stroke", "transparent")
          .attr("stroke-width", 15) // Wider than the actual line to make it easier to hover
          .attr("d", lineGenerator)
          .style("cursor", "pointer")
          .style("pointer-events", "all");
        
        // Add tooltip functionality to the trendline
        trendlineArea.on("mouseover", function(event) {
          if (isTouchDevice) return;
          
          tooltip
            .html(`
              <div style="font-weight: 700; margin-bottom: 6px; font-size: ${isMobile ? '14px' : '16px'};">Mileage Trend</div>
              <div style="margin-bottom: 4px;"><strong>Average rate:</strong> ${Math.round(avgAnnualMileage).toLocaleString()} miles/year</div>
              <div style="margin-bottom: 4px;"><strong>Daily average:</strong> ${Math.round(avgDailyMileage)} miles/day</div>
              <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 8px 0;">
              <div style="margin-top: 6px; color: ${COLORS.BLACK}; font-size: 0.85rem;">
                This line shows the vehicle's estimated mileage pattern based on recorded MOT tests.
                It helps identify unusual changes in usage patterns over time.
              </div>
            `)
            .style("visibility", "visible")
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY - 15}px`)
            .style("transform", "translate(-50%, -100%)");
        })
        .on("mouseout", function() {
          if (isTouchDevice) return;
          
          if (!selectedPoint) {
            tooltip.style("visibility", "hidden");
          }
        })
        .on("touchstart", function(event) {
          if (!isTouchDevice) return;
          
          event.preventDefault();
          
          // Get position for tooltip
          const rect = event.target.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          tooltip
            .html(`
              <div style="font-weight: 700; margin-bottom: 6px; font-size: ${isMobile ? '14px' : '16px'};">Mileage Trend</div>
              <div style="margin-bottom: 4px;"><strong>Average rate:</strong> ${Math.round(avgAnnualMileage).toLocaleString()} miles/year</div>
              <div style="margin-bottom: 4px;"><strong>Daily average:</strong> ${Math.round(avgDailyMileage)} miles/day</div>
              <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 8px 0;">
              <div style="margin-top: 6px; color: ${COLORS.BLACK}; font-size: 0.85rem;">
                This line shows the vehicle's estimated mileage pattern based on recorded MOT tests.
                It helps identify unusual changes in usage patterns over time.
              </div>
            `)
            .style("visibility", "visible")
            .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
            .style("top", `${rect.top + scrollTop - 15}px`)
            .style("transform", "translate(-50%, -100%)");
        });
        
        // Only show trendline label if there's enough space
        if (!isMobile || width > 300) {
          chart.append("text")
            .attr("class", "trendline-label")
            .attr("x", width - (isMobile ? 75 : 160))
            .attr("y", height - (isMobile ? 15 : 50))
            .attr("font-size", isMobile ? "9px" : "12px") // Smaller text
            .attr("font-family", "'GDS Transport', arial, sans-serif")
            .attr("fill", COLORS.GREEN)
            .attr("font-weight", "700")
            .text(`~${Math.round(avgAnnualMileage).toLocaleString()} miles/year`);
        }
      }
    }
  }, [isMobile]);

  // Draw anomaly sections with dashed borders
  const drawAnomalySections = useCallback((chart, anomalies, mileageData, xScale, yScale, height) => {
    if (!anomalies || !anomalies.length) return;

    anomalies.forEach(d => {
      if (!d.details || !d.details.current || !d.details.current.date) return;
      
      // Find the index of the current point in mileageData
      const currentIndex = mileageData.findIndex(item => 
        item.date && d.details.current.date && 
        item.date.getTime() === d.details.current.date.getTime()
      );
      
      // Skip if point not found or it's the first point
      if (currentIndex <= 0) return;
      
      // Get previous point
      const prevPoint = mileageData[currentIndex - 1];
      
      // Calculate rectangle dimensions
      const x1 = xScale(prevPoint.date);
      const x2 = xScale(d.details.current.date);
      const width = x2 - x1;
      
      // Draw a rectangle with dashed border
      chart.append("rect")
        .attr("class", "anomaly-section")
        .attr("x", x1)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", d.type === "decrease" ? 
          `rgba(${hexToRgb(COLORS.RED)}, 0.1)` : // Slightly more visible background
          `rgba(${hexToRgb(COLORS.RED)}, 0.1)`) // Using RED instead of ORANGE
        .attr("stroke", COLORS.RED) // Using RED for all anomaly sections
        .attr("stroke-width", 1.5) // Increased for better visibility
        .attr("stroke-dasharray", "5,5")
        .style("pointer-events", "none");
    });
  }, []);

  // Generate tooltip content for data points
  const generatePointTooltip = useCallback((d, mileageData) => {
    if (!d || !mileageData || !Array.isArray(mileageData)) return '';
    
    const index = mileageData.findIndex(item => 
      item.date && d.date && item.date.getTime() === d.date.getTime()
    );

    // Basic info - styled with GOV.UK typography
    let tooltipContent = `
      <div style="font-weight: 700; margin-bottom: 6px; font-size: ${isMobile ? '14px' : '16px'};">${d.formattedDate}</div>
      <div style="margin-bottom: 4px;"><strong>Mileage:</strong> ${d.formattedMileage}</div>
      ${d.testResult ? `
        <div style="margin-bottom: 4px;"><strong>Result:</strong> <span style="color: ${d.testResult.includes('PASS') ? COLORS.GREEN : COLORS.RED}; font-weight: 700">
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
        <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 8px 0;">
        <div style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Since last test:</strong> ${daysBetween} days</div>
      `;
      
      // Special handling for clocking (negative mileage)
      if (mileageDiff < 0) {
        tooltipContent += `
          <div style="font-size: 0.9rem; color: ${COLORS.RED}; font-weight: 700; margin-bottom: 4px;">
            ⚠️ MILEAGE DECREASE: ${Math.abs(mileageDiff).toLocaleString()} miles
          </div>
          <div style="font-size: 0.85rem; color: ${COLORS.RED}; margin-bottom: 4px;">
            This suggests potential odometer tampering
          </div>
        `;
      } else {
        tooltipContent += `
          <div style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Mileage added:</strong> ${mileageDiff.toLocaleString()} miles</div>
          <div style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Daily average:</strong> ${Math.round(dailyAvg)} miles/day</div>
          <div style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Annual rate:</strong> ${Math.round(dailyAvg * 365).toLocaleString()} miles/year</div>
        `;
      }
    }
    
    return tooltipContent;
  }, [isMobile]);

  // Generate tooltip content for anomaly points
  const generateAnomalyTooltip = useCallback((anomaly) => {
    if (!anomaly || !anomaly.details) return '';
    
    let tooltipContent = `
      <div style="font-weight: 700; margin-bottom: 6px; font-size: ${isMobile ? '14px' : '16px'}; ${anomaly.type === 'decrease' ? `color: ${COLORS.RED}` : ''}">
        ${anomaly.details.current.formattedDate}
        ${anomaly.type === 'decrease' ? ' - ⚠️ MILEAGE DECREASE' : ''}
      </div>
      <div style="margin-bottom: 4px;"><strong>Mileage:</strong> ${anomaly.details.current.formattedMileage}</div>
    `;
    
    if (anomaly.type === 'decrease') {
      tooltipContent += `
        <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 8px 0;">
        <div style="color: ${COLORS.RED}; font-weight: 700; margin-bottom: 4px;">Possible odometer tampering</div>
        <div style="font-size: 0.9rem; margin-bottom: 4px;">
          <strong>Previous reading:</strong> ${anomaly.details.previous.formattedMileage}
          (${anomaly.details.previous.formattedDate})
        </div>
        <div style="font-size: 0.9rem; margin-bottom: 4px;">
          <strong>Decrease:</strong> ${Math.abs(anomaly.details.diff).toLocaleString()} miles
        </div>
        <div style="font-size: 0.9rem; margin-bottom: 4px;">
          <strong>Time between:</strong> ${Math.round(anomaly.details.timeBetweenReadings)} days
        </div>
        <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 8px 0;">
        <div style="font-size: 0.85rem; margin-bottom: 3px;"><strong>Possible causes:</strong></div>
        <ul style="margin: 3px 0 0 14px; padding: 0; font-size: 0.85rem;">
          <li style="margin-bottom: 2px;">Odometer tampering</li>
          <li style="margin-bottom: 2px;">Data entry error</li>
          <li style="margin-bottom: 2px;">Instrument cluster replacement</li>
        </ul>
      `;
    } else {
      tooltipContent += `
        <div style="color: ${COLORS.RED}; font-weight: 700; margin-bottom: 4px;">${anomaly.message}</div>
        <hr style="border: 0; height: 1px; background-color: ${COLORS.MID_GREY}; margin: 8px 0;">
        <div style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Previous:</strong> ${anomaly.details.previous.formattedMileage} (${anomaly.details.previous.formattedDate})</div>
        <div style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Increase:</strong> ${Math.abs(anomaly.details.diff).toLocaleString()} miles</div>
        <div style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Period:</strong> ${Math.round(anomaly.details.days)} days</div>
        <div style="font-size: 0.9rem; margin-bottom: 4px;"><strong>Daily rate:</strong> ${Math.round(anomaly.details.dailyAvg)} miles/day</div>
      `;
    }
    
    return tooltipContent;
  }, [isMobile]);

  // Draw main mileage line and points - IMPROVED with orange ring for fail points
  const drawMileageData = useCallback((chart, mileageData, xScale, yScale, tooltip) => {
    if (!mileageData || !mileageData.length) return;

    // Draw main mileage line with consistent color and less smoothing
    chart.append("path")
      .datum(mileageData)
      .attr("class", "mileage-line")
      .attr("fill", "none")
      .attr("stroke", COLORS.BLUE) // Consistent color for all points and lines
      .attr("stroke-width", isMobile ? 2 : 2.5) // Slightly thinner
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.mileage))
        .curve(curveLinear)); // Less smooth line

    // Draw mileage points - IMPROVED to use consistent Y position and orange rings for fails
    mileageData.forEach(d => {
      const isPassing = d.testResult && d.testResult.includes('PASS');
      const x = xScale(d.date);
      const y = yScale(d.mileage);
      
      // Define sizes
      const passRadius = isMobile ? 4 : 5; // Standard size for pass points
      const failOuterRadius = isMobile ? 6 : 8; // Larger outer circle for fail points
      const failInnerRadius = isMobile ? 3 : 4; // Inner circle for fail points
      
      if (isPassing) {
        // Create a simple blue circle for passes (unchanged)
        chart.append("circle")
          .datum(d)
          .attr("class", "mileage-point mileage-pass")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", passRadius)
          .attr("fill", COLORS.BLUE)
          .attr("stroke", COLORS.WHITE)
          .attr("stroke-width", isMobile ? 1 : 1.5)
          .style("cursor", "pointer")
          .attr("tabindex", 0)
          .attr("role", "button")
          .attr("aria-label", `PASS: Mileage reading: ${d.formattedMileage} on ${d.formattedDate}`);
      } else {
        // Create a ring for fail points (ORANGE)
        // Outer circle (ring)
        chart.append("circle")
          .datum(d)
          .attr("class", "mileage-point mileage-fail-outer")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", failOuterRadius)
          .attr("fill", "none")
          .attr("stroke", COLORS.RED)  // Using RED instead of ORANGE
          .attr("stroke-width", isMobile ? 2 : 2.5)
          .style("cursor", "pointer")
          .attr("tabindex", 0)
          .attr("role", "button")
          .attr("aria-label", `FAIL: Mileage reading: ${d.formattedMileage} on ${d.formattedDate}`);
        
        // Inner circle (dot)
        chart.append("circle")
          .datum(d)
          .attr("class", "mileage-point mileage-fail-inner")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", failInnerRadius)
          .attr("fill", COLORS.RED)  // Using RED instead of ORANGE
          .attr("stroke", "none")
          .style("cursor", "pointer");
      }
    });

    // Add event handlers for points - updated for the new fail point design
    const setupPointEventHandlers = () => {
      // Pass points (circles) - unchanged
      chart.selectAll(".mileage-point.mileage-pass")
        .on("mouseover", function(event, d) {
          if (isTouchDevice) return;
          
          select(this)
            .attr("stroke-width", 2)
            .attr("stroke", COLORS.BLACK);
          
          tooltip
            .html(generatePointTooltip(d, mileageData))
            .style("visibility", "visible")
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY - 15}px`)
            .style("transform", "translate(-50%, -100%)");
        })
        .on("mouseout", function() {
          if (isTouchDevice) return;
          
          if (!selectedPoint) {
            select(this)
              .attr("stroke-width", isMobile ? 1 : 1.5)
              .attr("stroke", COLORS.WHITE);
            
            tooltip.style("visibility", "hidden");
          }
        })
        .on("click", function(event, d) {
          const isSelected = selectedPoint === d.date.getTime();
          
          // Reset all points styling
          chart.selectAll(".mileage-point.mileage-pass")
            .attr("stroke-width", isMobile ? 1 : 1.5)
            .attr("stroke", COLORS.WHITE);
          
          chart.selectAll(".mileage-point.mileage-fail-outer")
            .attr("stroke-width", isMobile ? 2 : 2.5)
            .attr("stroke", ORANGE);
          
          if (isSelected) {
            setSelectedPoint(null);
            tooltip.style("visibility", "hidden");
          } else {
            setSelectedPoint(d.date.getTime());
            
            select(this)
              .attr("stroke-width", 2)
              .attr("stroke", COLORS.BLACK);
            
            tooltip
              .html(generatePointTooltip(d, mileageData))
              .style("visibility", "visible")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 15}px`)
              .style("transform", "translate(-50%, -100%)");
          }
        });
      
      // Fail points (outer rings)
      chart.selectAll(".mileage-point.mileage-fail-outer")
        .on("mouseover", function(event, d) {
          if (isTouchDevice) return;
          
          select(this)
            .attr("stroke-width", isMobile ? 3 : 3.5)
            .attr("stroke", COLORS.BLACK);
          
          tooltip
            .html(generatePointTooltip(d, mileageData))
            .style("visibility", "visible")
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY - 15}px`)
            .style("transform", "translate(-50%, -100%)");
        })
        .on("mouseout", function() {
          if (isTouchDevice) return;
          
          if (!selectedPoint) {
            select(this)
              .attr("stroke-width", isMobile ? 2 : 2.5)
              .attr("stroke", COLORS.RED);
            
            tooltip.style("visibility", "hidden");
          }
        })
        .on("click", function(event, d) {
          const isSelected = selectedPoint === d.date.getTime();
          
          // Reset all points styling
          chart.selectAll(".mileage-point.mileage-pass")
            .attr("stroke-width", isMobile ? 1 : 1.5)
            .attr("stroke", COLORS.WHITE);
          
          chart.selectAll(".mileage-point.mileage-fail-outer")
            .attr("stroke-width", isMobile ? 2 : 2.5)
            .attr("stroke", ORANGE);
          
          if (isSelected) {
            setSelectedPoint(null);
            tooltip.style("visibility", "hidden");
          } else {
            setSelectedPoint(d.date.getTime());
            
            select(this)
              .attr("stroke-width", isMobile ? 3 : 3.5)
              .attr("stroke", COLORS.BLACK);
            
            tooltip
              .html(generatePointTooltip(d, mileageData))
              .style("visibility", "visible")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 15}px`)
              .style("transform", "translate(-50%, -100%)");
          }
        });
      
      // Fail points (inner dots) - same behavior as outer rings
      chart.selectAll(".mileage-point.mileage-fail-inner")
        .on("mouseover", function(event, d) {
          if (isTouchDevice) return;
          
          // Find and highlight the corresponding outer ring
          chart.selectAll(".mileage-point.mileage-fail-outer")
            .filter(function(pd) {
              return pd.date.getTime() === d.date.getTime();
            })
            .attr("stroke-width", isMobile ? 3 : 3.5)
            .attr("stroke", COLORS.BLACK);
          
          tooltip
            .html(generatePointTooltip(d, mileageData))
            .style("visibility", "visible")
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY - 15}px`)
            .style("transform", "translate(-50%, -100%)");
        })
        .on("mouseout", function() {
          if (isTouchDevice) return;
          
          if (!selectedPoint) {
            // Reset the corresponding outer ring
            chart.selectAll(".mileage-point.mileage-fail-outer")
              .filter(function(pd) {
                return pd.date && select(this).datum().date && 
                       pd.date.getTime() === select(this).datum().date.getTime();
              })
              .attr("stroke-width", isMobile ? 2 : 2.5)
              .attr("stroke", ORANGE);
            
            tooltip.style("visibility", "hidden");
          }
        })
        .on("click", function(event, d) {
          const isSelected = selectedPoint === d.date.getTime();
          
          // Reset all points styling
          chart.selectAll(".mileage-point.mileage-pass")
            .attr("stroke-width", isMobile ? 1 : 1.5)
            .attr("stroke", COLORS.WHITE);
          
          chart.selectAll(".mileage-point.mileage-fail-outer")
            .attr("stroke-width", isMobile ? 2 : 2.5)
            .attr("stroke", ORANGE);
          
          if (isSelected) {
            setSelectedPoint(null);
            tooltip.style("visibility", "hidden");
          } else {
            setSelectedPoint(d.date.getTime());
            
            // Highlight the corresponding outer ring
            chart.selectAll(".mileage-point.mileage-fail-outer")
              .filter(function(pd) {
                return pd.date.getTime() === d.date.getTime();
              })
              .attr("stroke-width", isMobile ? 3 : 3.5)
              .attr("stroke", COLORS.BLACK);
            
            tooltip
              .html(generatePointTooltip(d, mileageData))
              .style("visibility", "visible")
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 15}px`)
              .style("transform", "translate(-50%, -100%)");
          }
        });
      
      // Touch events for mobile
      if (isTouchDevice) {
        // Pass points
        chart.selectAll(".mileage-point.mileage-pass")
          .on("touchstart", function(event, d) {
            event.preventDefault();
            const isSelected = selectedPoint === d.date.getTime();
            
            // Reset all points
            chart.selectAll(".mileage-point.mileage-pass")
              .attr("stroke-width", isMobile ? 1 : 1.5)
              .attr("stroke", COLORS.WHITE);
            
            chart.selectAll(".mileage-point.mileage-fail-outer")
              .attr("stroke-width", isMobile ? 2 : 2.5)
              .attr("stroke", ORANGE);
            
            if (isSelected) {
              setSelectedPoint(null);
              tooltip.style("visibility", "hidden");
            } else {
              setSelectedPoint(d.date.getTime());
              
              select(this)
                .attr("stroke-width", 2)
                .attr("stroke", COLORS.BLACK);
              
              // Position tooltip for touch
              const rect = event.target.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
              
              tooltip
                .html(generatePointTooltip(d, mileageData))
                .style("visibility", "visible")
                .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
                .style("top", `${rect.top + scrollTop - 15}px`)
                .style("transform", "translate(-50%, -100%)");
            }
          });
        
        // Fail points (outer rings)
        chart.selectAll(".mileage-point.mileage-fail-outer, .mileage-point.mileage-fail-inner")
          .on("touchstart", function(event, d) {
            event.preventDefault();
            const isSelected = selectedPoint === d.date.getTime();
            
            // Reset all points
            chart.selectAll(".mileage-point.mileage-pass")
              .attr("stroke-width", isMobile ? 1 : 1.5)
              .attr("stroke", COLORS.WHITE);
            
            chart.selectAll(".mileage-point.mileage-fail-outer")
              .attr("stroke-width", isMobile ? 2 : 2.5)
              .attr("stroke", ORANGE);
            
            if (isSelected) {
              setSelectedPoint(null);
              tooltip.style("visibility", "hidden");
            } else {
              setSelectedPoint(d.date.getTime());
              
              // Highlight the corresponding outer ring
              chart.selectAll(".mileage-point.mileage-fail-outer")
                .filter(function(pd) {
                  return pd.date.getTime() === d.date.getTime();
                })
                .attr("stroke-width", isMobile ? 3 : 3.5)
                .attr("stroke", COLORS.BLACK);
              
              // Position tooltip for touch
              const rect = event.target.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
              
              tooltip
                .html(generatePointTooltip(d, mileageData))
                .style("visibility", "visible")
                .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
                .style("top", `${rect.top + scrollTop - 15}px`)
                .style("transform", "translate(-50%, -100%)");
            }
          });
      }
    };

    setupPointEventHandlers();
  }, [isMobile, isTouchDevice, selectedPoint, generatePointTooltip]);

  // Draw anomalies with distinctive shapes
  const drawAnomalies = useCallback((chart, anomalies, xScale, yScale, tooltip) => {
    if (!anomalies || !anomalies.length) return;

    // Draw anomalies with distinctive shapes
    anomalies.forEach(d => {
      if (!d.details || !d.details.current || !d.details.current.date) return;
      
      const x = xScale(d.details.current.date);
      const y = yScale(d.details.current.mileage);
      
      // Use larger radius for anomalies to make them stand out more
      const radius = isMobile ? 5 : 7; 
      
      if (d.type === "decrease") {
        // For clocking (decrease), use a diamond shape
        const diamondSize = radius * 1.1; // Larger for more visibility
        
        chart.append("path")
          .datum(d)
          .attr("class", "anomaly anomaly-decrease")
          .attr("d", `M ${x} ${y-diamondSize} L ${x+diamondSize} ${y} L ${x} ${y+diamondSize} L ${x-diamondSize} ${y} Z`)
          .attr("fill", COLORS.RED)
          .attr("stroke", COLORS.WHITE)
          .attr("stroke-width", 1.5) // Thicker border
          .style("cursor", "pointer")
          .attr("tabindex", 0)
          .attr("role", "button")
          .attr("aria-label", `Anomaly: Mileage decrease on ${d.details.current.formattedDate}`);
      } else {
        // For spikes, use a triangle
        const triangleSize = radius * 1.1; // Larger for more visibility
        
        chart.append("path")
          .datum(d)
          .attr("class", "anomaly anomaly-spike")
          .attr("d", `M ${x} ${y-triangleSize} L ${x+triangleSize} ${y+triangleSize} L ${x-triangleSize} ${y+triangleSize} Z`)
          .attr("fill", COLORS.RED)
          .attr("stroke", COLORS.WHITE)
          .attr("stroke-width", 1.5) // Thicker border
          .style("cursor", "pointer")
          .attr("tabindex", 0)
          .attr("role", "button")
          .attr("aria-label", `Anomaly: Unusual mileage increase on ${d.details.current.formattedDate}`);
      }
    });

    // Add event handlers for anomaly shapes
    chart.selectAll(".anomaly")
      .on("mouseover", function(event, d) {
        if (isTouchDevice) return;
        
        select(this)
          .attr("stroke-width", 2.5)
          .attr("stroke", COLORS.BLACK);
        
        tooltip
          .html(generateAnomalyTooltip(d))
          .style("visibility", "visible")
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 15}px`)
          .style("transform", "translate(-50%, -100%)");
      })
      .on("mouseout", function() {
        if (isTouchDevice) return;
        
        if (!selectedPoint || !selectedPoint.toString().startsWith('anomaly-')) {
          select(this)
            .attr("stroke-width", 1.5)
            .attr("stroke", COLORS.WHITE);
          
          tooltip.style("visibility", "hidden");
        }
      })
      .on("click", function(event, d) {
        const isSelected = selectedPoint === `anomaly-${d.index}`;
        
        // Reset all anomalies
        chart.selectAll(".anomaly")
          .attr("stroke-width", 1.5)
          .attr("stroke", COLORS.WHITE);
        
        if (isSelected) {
          setSelectedPoint(null);
          tooltip.style("visibility", "hidden");
        } else {
          setSelectedPoint(`anomaly-${d.index}`);
          
          select(this)
            .attr("stroke-width", 2.5)
            .attr("stroke", COLORS.BLACK);
          
          tooltip
            .html(generateAnomalyTooltip(d))
            .style("visibility", "visible")
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY - 15}px`)
            .style("transform", "translate(-50%, -100%)");
        }
      })
      .on("touchstart", function(event, d) {
        if (!isTouchDevice) return;
        
        event.preventDefault();
        const isSelected = selectedPoint === `anomaly-${d.index}`;
        
        // Reset all anomalies
        chart.selectAll(".anomaly")
          .attr("stroke-width", 1.5)
          .attr("stroke", COLORS.WHITE);
        
        if (isSelected) {
          setSelectedPoint(null);
          tooltip.style("visibility", "hidden");
        } else {
          setSelectedPoint(`anomaly-${d.index}`);
          
          select(this)
            .attr("stroke-width", 2.5)
            .attr("stroke", COLORS.BLACK);
          
          // Position tooltip for touch
          const rect = event.target.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          tooltip
            .html(generateAnomalyTooltip(d))
            .style("visibility", "visible")
            .style("left", `${rect.left + rect.width/2 + scrollLeft}px`)
            .style("top", `${rect.top + scrollTop - 15}px`)
            .style("transform", "translate(-50%, -100%)");
        }
      });
  }, [isMobile, isTouchDevice, selectedPoint, generateAnomalyTooltip]);

  // Add background and warnings to the chart
  const addChartExtras = useCallback((chart, mileageData, width, height, tooltip) => {
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
          // Reset pass circle points
          chart.selectAll(".mileage-point.mileage-pass")
            .attr("stroke-width", isMobile ? 1 : 1.5)
            .attr("stroke", COLORS.WHITE);
          
          // Reset fail points
          chart.selectAll(".mileage-point.mileage-fail-outer")
            .attr("stroke-width", isMobile ? 2 : 2.5)
            .attr("stroke", ORANGE);
          
          // Reset anomalies
          chart.selectAll(".anomaly")
            .attr("stroke-width", 1.5)
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
        .style("font-size", isMobile ? "14px" : "16px")
        .style("font-weight", "700")
        .text("Limited data available");
    }
  }, [isMobile, selectedPoint]);

  // D3 Chart Rendering - main function
  const renderChart = useCallback(() => {
    if (!chartData) return;
    
    const { mileageData = [], anomalies = [], inactivityPeriods = [] } = chartData;
    
    if (!mileageData.length || !svgRef.current || !chartContainerRef.current) {
      return;
    }

    // Clear any existing chart content
    if (svgRef.current) {
      select(svgRef.current).selectAll("*").remove();
    }
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Setup chart dimensions and create container
    const dimensions = setupChartDimensions();
    if (!dimensions) return;
    
    const { chart, width, height } = dimensions;
    
    // Create scales
    const scales = createScales(mileageData, width, height);
    if (!scales) return;
    
    const { xScale, yScale } = scales;
    
    // Draw axes and grid
    drawAxes(chart, xScale, yScale, width, height);
    
    // Draw anomaly sections (always show)
    drawAnomalySections(chart, anomalies, mileageData, xScale, yScale, height);
    
    // Draw inactive periods (always show)
    drawInactivePeriods(chart, inactivityPeriods, xScale, height, tooltip);
    
    // Trendline is always shown
    drawTrendline(chart, mileageData, xScale, yScale, width, height, tooltip);
    
    // Draw mileage data (line and points)
    drawMileageData(chart, mileageData, xScale, yScale, tooltip);
    
    // Draw anomaly markers (always show)
    drawAnomalies(chart, anomalies, xScale, yScale, tooltip);
    
    // Add chart background and warnings
    addChartExtras(chart, mileageData, width, height, tooltip);

    // Add resize handler with debounce
    const handleResize = () => {
      if (chartContainerRef.current) {
        clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = setTimeout(() => {
          renderChart();
        }, 200);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimerRef.current);
    };
  }, [
    chartData,
    createTooltip,
    setupChartDimensions,
    createScales,
    drawAxes,
    drawInactivePeriods,
    drawTrendline,
    drawMileageData,
    drawAnomalies,
    drawAnomalySections,
    addChartExtras
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
    renderChart
  ]);

  return (
    <>
      {/* Chart Title */}
      <GovUKHeadingM>Vehicle Mileage Chart</GovUKHeadingM>
      


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
              aria-hidden={chartData.mileageData.length === 0 ? 'true' : 'false'}
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