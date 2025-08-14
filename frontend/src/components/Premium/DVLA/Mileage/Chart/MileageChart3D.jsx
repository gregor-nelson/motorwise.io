import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  ChartHeader,
  ChartSectionBreak,
  ChartGridRow,
  ChartCaption,
  ChartBody,
  ChartInsetText,
  CHART_COLORS
} from './MileageChartStyles';

// Helper function to analyze MOT status for additional details  
const analyzeMotStatus = (status, hasAdvisoriesData = false) => {
  if (!status) return { severity: 'unknown', hasAdvisories: false, isPrimary: true };
  
  const statusUpper = status.toUpperCase();
  let severity = 'pass';
  let isPrimary = true;
  
  // Determine severity level
  if (statusUpper.includes('FAIL')) {
    severity = 'fail';
    // Could extend this to detect dangerous/major vs minor failures
    // if more detailed MOT data becomes available
  } else if (statusUpper.includes('PASS')) {
    severity = 'pass';
  }
  
  return {
    severity,
    hasAdvisories: hasAdvisoriesData, // Use the actual advisory data from API
    isPrimary
  };
};

// Multi-factor color palette for conditional coloring
const STATUS_COLORS = {
  // Base colors by status and condition
  PASS_CLEAN: CHART_COLORS.POSITIVE || '#10b981',           // Bright green - clean pass
  PASS_ADVISORY: CHART_COLORS.WARNING || '#f59e0b',         // Amber - pass with advisories
  FAIL_MINOR: '#fb7185',                               // Orange-red - minor failures  
  FAIL_MAJOR: CHART_COLORS.NEGATIVE || '#ef4444',           // Deep red - major failures
  FAIL_CONSECUTIVE: CHART_COLORS.RED_DARK || '#b91c1c',     // Very dark red - consecutive fails
  
  // Special condition colors
  POST_INACTIVITY: CHART_COLORS.PURPLE || '#8b5cf6',        // Purple - first test after gap
  IMPROVEMENT: '#34d399',                              // Light green - improvement trend
  DETERIORATION: '#f87171',                            // Light red - getting worse
  
  // Timeline aging (opacity modifiers)
  RECENT: 1.0,          // Last 1 year - full opacity
  MODERATE: 0.8,        // 1-3 years - slight fade
  OLD: 0.6,             // 3+ years - more faded
};

// Edge styling definitions for special conditions
const EDGE_STYLES = {
  NORMAL: { 
    opacity: 0.6, 
    linewidth: 2 
  },
  CONSECUTIVE_FAIL: { 
    color: STATUS_COLORS.FAIL_CONSECUTIVE,
    opacity: 1.0, 
    linewidth: 4 
  },
  POST_INACTIVITY: { 
    color: STATUS_COLORS.POST_INACTIVITY,
    opacity: 0.9, 
    linewidth: 3 
  },
  IMPROVEMENT: { 
    color: STATUS_COLORS.IMPROVEMENT,
    opacity: 0.8, 
    linewidth: 3 
  },
  DETERIORATION: {
    color: STATUS_COLORS.DETERIORATION,
    opacity: 0.8,
    linewidth: 3
  }
};

// Warning symbol creation functions
const createWarningSymbol = (riskLevel) => {
  switch (riskLevel) {
    case 'MODERATE':
      return createModerateWarningSymbol();
    case 'HIGH':
      return createHighRiskWarningSymbol();
    case 'CRITICAL':
      return createCriticalWarningSymbol();
    default:
      return null;
  }
};

const createModerateWarningSymbol = () => {
  const geometry = new THREE.ConeGeometry(0.12, 0.2, 3);
  geometry.rotateX(Math.PI);
  
  const material = new THREE.MeshLambertMaterial({
    color: new THREE.Color(CHART_COLORS.WARNING || '#f59e0b'),
    transparent: true,
    opacity: 0.85
  });
  
  const symbol = new THREE.Mesh(geometry, material);
  symbol.userData = {
    animationType: 'gentle-bob',
    bobSpeed: 0.02,
    bobAmplitude: 0.03,
    originalY: 0
  };
  
  return symbol;
};

const createHighRiskWarningSymbol = () => {
  const group = new THREE.Group();
  
  // Exclamation body
  const bodyGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 6);
  const bodyMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color(CHART_COLORS.NEGATIVE || '#ef4444'),
    transparent: true,
    opacity: 0.9
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.04;
  
  // Exclamation dot
  const dotGeometry = new THREE.SphereGeometry(0.04, 6, 6);
  const dot = new THREE.Mesh(dotGeometry, bodyMaterial);
  dot.position.y = -0.06;
  
  group.add(body, dot);
  group.userData = {
    animationType: 'slow-pulse',
    pulseSpeed: 0.025,
    minOpacity: 0.6,
    maxOpacity: 0.9,
    originalY: 0
  };
  
  return group;
};

const createCriticalWarningSymbol = () => {
  const geometry = new THREE.OctahedronGeometry(0.15);
  const material = new THREE.MeshLambertMaterial({
    color: new THREE.Color(CHART_COLORS.RED_DARK || '#dc2626'),
    transparent: true,
    opacity: 1.0,
    emissive: new THREE.Color(CHART_COLORS.RED_DARK || '#dc2626').multiplyScalar(0.1)
  });
  
  const symbol = new THREE.Mesh(geometry, material);
  symbol.userData = {
    animationType: 'attention-pulse',
    pulseSpeed: 0.04,
    scaleMin: 0.9,
    scaleMax: 1.1,
    minOpacity: 0.8,
    maxOpacity: 1.0,
    originalY: 0
  };
  
  return symbol;
};

// Animation system for warning symbols
const animateWarningSymbols = (scene, clock) => {
  const elapsedTime = clock.getElapsedTime();
  
  scene.traverse((child) => {
    if (!child.userData.animationType) return;
    
    switch (child.userData.animationType) {
      case 'gentle-bob':
        const bobOffset = Math.sin(elapsedTime * child.userData.bobSpeed) * child.userData.bobAmplitude;
        child.position.y = child.userData.originalY + bobOffset;
        break;
        
      case 'slow-pulse':
        const pulseOpacity = 
          child.userData.minOpacity + 
          (Math.sin(elapsedTime * child.userData.pulseSpeed) * 0.5 + 0.5) * 
          (child.userData.maxOpacity - child.userData.minOpacity);
        
        child.traverse((mesh) => {
          if (mesh.material && mesh.material.transparent) {
            mesh.material.opacity = pulseOpacity;
          }
        });
        break;
        
      case 'attention-pulse':
        const pulseFactor = Math.sin(elapsedTime * child.userData.pulseSpeed) * 0.5 + 0.5;
        const scale = 
          child.userData.scaleMin + 
          pulseFactor * (child.userData.scaleMax - child.userData.scaleMin);
        child.scale.set(scale, scale, scale);
        
        const opacity = 
          child.userData.minOpacity + 
          pulseFactor * (child.userData.maxOpacity - child.userData.minOpacity);
        
        if (child.material && child.material.transparent) {
          child.material.opacity = opacity;
        }
        break;
    }
  });
};

// Multi-factor color calculation function
const calculateBarColor = (motTest, index, allTests) => {
  const {
    severity,
    hasAdvisories,
    consecutiveFailures,
    isPostInactivity,
    hasImproved,
    testAge
  } = motTest;
  
  // 1. Base color selection by primary status
  let baseColor = CHART_COLORS.BLUE; // fallback
  let specialCondition = null;
  
  if (severity === 'pass') {
    baseColor = hasAdvisories ? STATUS_COLORS.PASS_ADVISORY : STATUS_COLORS.PASS_CLEAN;
    // Debug advisory coloring
    if (hasAdvisories) {
      console.log(`Pass with advisories detected - using amber color for test:`, motTest.dateString);
    }
  } else if (severity === 'fail') {
    if (consecutiveFailures >= 2) {
      baseColor = STATUS_COLORS.FAIL_CONSECUTIVE;
      specialCondition = 'CONSECUTIVE_FAIL';
    } else {
      baseColor = STATUS_COLORS.FAIL_MAJOR;
    }
  }
  
  // 2. Special condition overrides
  if (isPostInactivity) {
    baseColor = STATUS_COLORS.POST_INACTIVITY;
    specialCondition = 'POST_INACTIVITY';
  } else if (hasImproved) {
    baseColor = STATUS_COLORS.IMPROVEMENT;
    specialCondition = 'IMPROVEMENT';
  }
  
  // 3. Timeline aging (opacity adjustment)
  let opacity = STATUS_COLORS.RECENT;
  if (testAge > 3) {
    opacity = STATUS_COLORS.OLD;
  } else if (testAge > 1) {
    opacity = STATUS_COLORS.MODERATE;
  }
  
  // 4. Edge style determination
  let edgeStyle = 'NORMAL';
  if (specialCondition) {
    edgeStyle = specialCondition;
  }
  
  return {
    color: baseColor,
    opacity,
    edgeStyle,
    specialCondition,
    emissive: consecutiveFailures >= 3 ? 0x001122 : 0x000000 // Subtle glow for severe cases
  };
};

/**
 * 3D Mileage Chart Component using Three.js
 * Replaces the 2D Recharts implementation with an interactive 3D visualization
 */
const MileageChart3D = ({ motData, height = 600 }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const labelsRef = useRef([]);
  const cameraRef = useRef(null);
  const hoveredObjects = useRef([]);
  
  // Process mileage data (preserving enhanced data from transformMotData)
  const chartData = useMemo(() => {
    if (!motData || motData.length === 0) return [];
    
    const processedData = motData.map(test => {
      const dateParts = test.date.split(' ');
      const day = parseInt(dateParts[0], 10);
      const month = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']
                     .indexOf(dateParts[1]);
      const year = parseInt(dateParts[2], 10);
      const dateObj = new Date(year, month, day);
      
      let mileageValue = null;
      if (test.mileage && test.mileage !== 'Not recorded') {
        const mileageMatch = test.mileage.match(/^([\d,]+)/);
        if (mileageMatch) {
          mileageValue = parseInt(mileageMatch[1].replace(/,/g, ''), 10);
        }
      }
      
      return {
        date: dateObj,
        dateString: test.date,
        mileage: mileageValue,
        mileageString: test.mileage,
        status: test.status,
        // Preserve enhanced data from transformMotData
        hasAdvisories: test.hasAdvisories,
        advisoryCount: test.advisoryCount,
        clockingRisk: test.clockingRisk, // This is the key addition!
      };
    });
    
    processedData.sort((a, b) => a.date - b.date);
    
    // Debug logging to verify clocking data
    console.log('MileageChart3D: Processed data with clocking info:', 
      processedData.filter(d => d.clockingRisk && d.clockingRisk.level !== 'LOW').map(d => ({
        date: d.dateString,
        level: d.clockingRisk.level,
        evidence: d.clockingRisk.evidence
      }))
    );
    
    // Enhanced data processing for multi-factor coloring
    const enhancedData = processedData.map((item, index, array) => {
      let inactivityPeriod = false;
      let negativeMileage = false;
      let consecutiveFailures = 0;
      let isPostInactivity = false;
      let hasImproved = false;
      let testAge = 0;
      
      // Calculate test age in years (for timeline fading)
      if (array.length > 0) {
        const newestTest = array[array.length - 1].date;
        testAge = (newestTest - item.date) / (1000 * 60 * 60 * 24 * 365.25);
      }
      
      if (index > 0) {
        const monthsDiff = (item.date - array[index - 1].date) / (1000 * 60 * 60 * 24 * 30.5);
        inactivityPeriod = monthsDiff > 12;
        isPostInactivity = monthsDiff > 12;
        
        // Check for mileage anomalies
        if (item.mileage !== null && array[index - 1].mileage !== null) {
          negativeMileage = item.mileage < array[index - 1].mileage;
        }
        
        // Check for improvement (previous fail, current pass)
        if (array[index - 1].status && array[index - 1].status.includes('FAIL') && 
            item.status && item.status.includes('PASS')) {
          hasImproved = true;
        }
      }
      
      // Count consecutive failures (look backwards)
      if (item.status && item.status.includes('FAIL')) {
        let failCount = 1; // Current failure
        for (let i = index - 1; i >= 0; i--) {
          if (array[i].status && array[i].status.includes('FAIL')) {
            failCount++;
          } else {
            break;
          }
        }
        consecutiveFailures = failCount;
      }
      
      // Extract additional details from status (if available)
      const statusDetails = analyzeMotStatus(item.status, item.hasAdvisories);
      
      // Debug advisory data flow
      if (item.hasAdvisories) {
        console.log(`Advisory data for ${item.dateString}:`, {
          originalHasAdvisories: item.hasAdvisories,
          originalAdvisoryCount: item.advisoryCount,
          statusDetailsHasAdvisories: statusDetails.hasAdvisories,
          status: item.status
        });
      }
      
      return {
        ...item,
        inactivityPeriod,
        negativeMileage,
        consecutiveFailures,
        isPostInactivity,
        hasImproved,
        testAge,
        ...statusDetails,
      };
    });
    
    return enhancedData;
  }, [motData]);

  // Calculate trend line data
  const trendLineData = useMemo(() => {
    if (chartData.length < 2) return [];
    
    const validData = chartData.filter(item => item.mileage !== null);
    if (validData.length < 2) return [];
    
    const firstDate = validData[0].date;
    const lastDate = validData[validData.length - 1].date;
    const totalDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    const totalYears = totalDays / 365.25;
    
    const firstMileage = validData[0].mileage;
    const lastMileage = validData[validData.length - 1].mileage;
    const totalMileage = lastMileage - firstMileage;
    
    const annualMileage = totalMileage / totalYears;
    
    return chartData.map(item => ({
      date: item.date,
      dateString: item.dateString,
      trendMileage: firstMileage + (((item.date - firstDate) / (1000 * 60 * 60 * 24)) / 365.25) * annualMileage,
      ukAverageMileage: firstMileage + (((item.date - firstDate) / (1000 * 60 * 60 * 24)) / 365.25) * 7500,
    }));
  }, [chartData]);

  // Combined data for the 3D chart
  const combinedData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    return chartData.map(item => {
      const trendPoint = trendLineData.find(trend => 
        trend.dateString === item.dateString
      );
      
      return {
        ...item,
        trendMileage: trendPoint ? trendPoint.trendMileage : null,
        ukAverageMileage: trendPoint ? trendPoint.ukAverageMileage : null,
      };
    });
  }, [chartData, trendLineData]);

  // Create HTML overlay labels system (adapted from reference)
  const createHTMLLabel = (text, worldPosition, color = CHART_COLORS.GRAY_600, size = '11px', isTooltip = false) => {
    const labelData = {
      text,
      worldPosition: worldPosition.clone(),
      color,
      size,
      element: null,
      visible: true,
      isTooltip
    };
    
    labelsRef.current.push(labelData);
    return labelData;
  };

  // Update HTML labels positions
  const updateHTMLLabels = () => {
    if (!cameraRef.current || !rendererRef.current) return;
    
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    
    labelsRef.current.forEach(label => {
      if (!label.element || !label.visible) return;
      
      const screenPosition = label.worldPosition.clone();
      screenPosition.project(camera);
      
      const isVisible = screenPosition.z > -1 && screenPosition.z < 1 &&
                       screenPosition.x > -1 && screenPosition.x < 1 &&
                       screenPosition.y > -1 && screenPosition.y < 1;
      
      if (isVisible) {
        const x = (screenPosition.x * 0.5 + 0.5) * rect.width;
        const y = (screenPosition.y * -0.5 + 0.5) * rect.height;
        
        label.element.style.left = `${rect.left + x}px`;
        label.element.style.top = `${rect.top + y}px`;
        label.element.style.display = 'block';
      } else {
        label.element.style.display = 'none';
      }
    });
  };

  // Initialize HTML labels container
  const initializeLabelsContainer = () => {
    let container = document.getElementById('mileage-3d-chart-labels');
    if (container) {
      container.remove();
    }
    
    container = document.createElement('div');
    container.id = 'mileage-3d-chart-labels';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '1000';
    container.style.fontFamily = '"Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    
    document.body.appendChild(container);
    return container;
  };

  // Create single label element
  const createSingleLabelElement = (label) => {
    const container = document.getElementById('mileage-3d-chart-labels');
    if (!container || label.element) return;
    
    const element = document.createElement('div');
    element.textContent = label.text;
    element.style.position = 'absolute';
    element.style.color = label.color;
    element.style.fontSize = label.size;
    element.style.fontWeight = '400';
    element.style.textAlign = 'center';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.pointerEvents = 'none';
    element.style.userSelect = 'none';
    
    if (label.isTooltip) {
      element.style.background = 'rgba(15, 23, 42, 0.95)';
      element.style.color = CHART_COLORS.WHITE;
      element.style.padding = '8px 12px';
      element.style.borderRadius = '6px';
      element.style.border = `2px solid ${label.color}`;
      element.style.fontFamily = '"Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      element.style.whiteSpace = 'nowrap';
      element.style.fontSize = '12px';
      element.style.fontWeight = '600';
      element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      element.style.zIndex = '10001';
    } else {
      element.style.background = 'rgba(248, 250, 252, 0.9)';
      element.style.padding = '2px 6px';
      element.style.borderRadius = '3px';
      element.style.border = `1px solid ${CHART_COLORS.GRAY_200}`;
    }
    
    label.element = element;
    container.appendChild(element);
  };

  // Create label elements
  const createLabelElements = () => {
    labelsRef.current.forEach(label => createSingleLabelElement(label));
  };

  // Check if we have enough valid mileage data
  const hasValidMileageData = useMemo(() => {
    const validEntries = chartData.filter(item => item.mileage !== null);
    return validEntries.length >= 2;
  }, [chartData]);

  useEffect(() => {
    if (!mountRef.current || !hasValidMileageData) return;
    
    // Check if already has a canvas child (prevent double render)
    if (mountRef.current.querySelector('canvas')) {
      return;
    }
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(CHART_COLORS.WHITE);
    
    // Clock for animations
    const clock = new THREE.Clock();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    
    // Initial camera position for mileage data visualization
    camera.position.set(5, 8, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      precision: 'highp'
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(CHART_COLORS.WHITE, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(CHART_COLORS.WHITE, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Calculate data scaling
    const validMileageData = combinedData.filter(item => item.mileage !== null);
    if (validMileageData.length === 0) return;
    
    const minMileage = Math.min(...validMileageData.map(d => d.mileage));
    const maxMileage = Math.max(...validMileageData.map(d => d.mileage));
    const mileageRange = maxMileage - minMileage;
    
    // 3D Chart dimensions
    const chartWidth = 16;  
    const chartHeight = 8;  
    const chartDepth = 2;   
    
    console.log('3D Mileage Chart Data Range:', {
      entries: validMileageData.length,
      mileageRange: `${minMileage.toLocaleString()} - ${maxMileage.toLocaleString()}`,
      years: validMileageData.length > 1 ? 
        (validMileageData[validMileageData.length - 1].date.getFullYear() - validMileageData[0].date.getFullYear()) : 0
    });
    
    // Raycasting setup for tooltips
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let tooltipVisible = false;
    let tooltipLabel = null;
    
    // Create enhanced 3D tooltip matching original 2D layout
    const create3DTooltip = (data, worldPosition) => {
      if (tooltipLabel) {
        tooltipLabel.visible = false;
        if (tooltipLabel.element) {
          tooltipLabel.element.remove();
        }
        const index = labelsRef.current.indexOf(tooltipLabel);
        if (index > -1) {
          labelsRef.current.splice(index, 1);
        }
      }
      
      // Create tooltip HTML structure matching original Tooltip.jsx
      const tooltipPosition = new THREE.Vector3(
        worldPosition.x + 1,
        worldPosition.y + 1,
        worldPosition.z + 1
      );
      
      // Store reference for custom HTML creation
      tooltipLabel = {
        worldPosition: tooltipPosition,
        visible: true,
        element: null,
        isTooltip: true
      };
      
      // Create enhanced HTML tooltip element matching original structure
      const createEnhancedTooltipElement = () => {
        const container = document.getElementById('mileage-3d-chart-labels');
        if (!container) return;
        
        const tooltipWrapper = document.createElement('div');
        
        // Modern professional tooltip styling with Jost font
        tooltipWrapper.style.cssText = `
          position: absolute;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-family: "Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 400;
          color: #1e293b;
          width: 320px;
          min-width: 280px;
          max-width: 350px;
          word-break: break-word;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          z-index: 10001;
          pointer-events: none;
        `;
        
        // Create tooltip title with badge
        const titleSection = document.createElement('div');
        titleSection.style.cssText = `
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0f172a;
        `;
        
        const dateText = document.createElement('span');
        dateText.textContent = data.dateString;
        titleSection.appendChild(dateText);
        
        // Add modern status badge
        if (data.status) {
          const badge = document.createElement('span');
          badge.style.cssText = `
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            background-color: ${data.status.includes('PASS') ? '#10b981' : '#ef4444'};
            color: #ffffff;
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          `;
          badge.textContent = data.status;
          titleSection.appendChild(badge);
        }
        
        tooltipWrapper.appendChild(titleSection);
        
        // Mileage row
        const createTooltipRow = (label, value) => {
          const row = document.createElement('div');
          row.style.cssText = `
            font-size: 14px;
            margin-bottom: 6px;
            display: grid;
            grid-template-columns: 40% 60%;
            column-gap: 12px;
            row-gap: 2px;
            align-items: baseline;
            width: 100%;
          `;
          
          const labelSpan = document.createElement('span');
          labelSpan.style.cssText = 'font-weight: 500; color: #64748b; min-width: 100px;';
          labelSpan.textContent = label;
          
          const valueSpan = document.createElement('span');
          valueSpan.style.cssText = 'color: #1e293b; font-weight: 600; word-wrap: break-word;';
          valueSpan.textContent = value;
          
          row.appendChild(labelSpan);
          row.appendChild(valueSpan);
          return row;
        };
        
        tooltipWrapper.appendChild(createTooltipRow('Mileage:', data.mileageString));
        
        // Add trend information if available
        if (data.trendMileage || data.ukAverageMileage) {
          const divider = document.createElement('hr');
          divider.style.cssText = `
            border: 0;
            height: 1px;
            background-color: #e2e8f0;
            margin: 12px 0;
            width: 100%;
          `;
          tooltipWrapper.appendChild(divider);
          
          if (data.trendMileage) {
            tooltipWrapper.appendChild(createTooltipRow(
              'Vehicle trend:', 
              Math.round(data.trendMileage).toLocaleString() + ' miles'
            ));
          }
          
          if (data.ukAverageMileage) {
            tooltipWrapper.appendChild(createTooltipRow(
              'UK average:', 
              Math.round(data.ukAverageMileage).toLocaleString() + ' miles'
            ));
          }
        }
        
        // Enhanced conditions section
        const conditions = [];
        if (data.consecutiveFailures > 1) {
          conditions.push(`${data.consecutiveFailures} consecutive failures`);
        }
        if (data.isPostInactivity) {
          conditions.push('First test after 12+ month gap');
        }
        if (data.hasImproved) {
          conditions.push('Improvement from previous failure');
        }
        if (data.hasAdvisories) {
          const advisoryText = data.advisoryCount > 1 ? 
            `${data.advisoryCount} advisories` : 
            '1 advisory';
          conditions.push(advisoryText);
        }
        if (data.testAge > 3) {
          conditions.push(`${Math.round(data.testAge)} years ago`);
        }
        
        if (conditions.length > 0) {
          const conditionsDivider = document.createElement('hr');
          conditionsDivider.style.cssText = `
            border: 0;
            height: 1px;
            background-color: #e2e8f0;
            margin: 12px 0;
            width: 100%;
          `;
          tooltipWrapper.appendChild(conditionsDivider);
          
          const conditionsTitle = document.createElement('div');
          conditionsTitle.style.cssText = `
            font-weight: 600;
            margin-bottom: 6px;
            font-size: 14px;
            color: #0f172a;
          `;
          conditionsTitle.textContent = 'Additional Information';
          tooltipWrapper.appendChild(conditionsTitle);
          
          conditions.forEach(condition => {
            const conditionDiv = document.createElement('div');
            conditionDiv.style.cssText = `
              font-size: 13px;
              margin-bottom: 3px;
              color: #64748b;
              padding-left: 8px;
              position: relative;
            `;
            // Add bullet point
            conditionDiv.innerHTML = `<span style="position: absolute; left: 0; color: #94a3b8;">•</span>${condition}`;
            tooltipWrapper.appendChild(conditionDiv);
          });
        }
        
        // Clocking risk assessment section
        if (data.clockingRisk && data.clockingRisk.level !== 'LOW') {
          const clockingDivider = document.createElement('hr');
          clockingDivider.style.cssText = `
            border: 0;
            height: 1px;
            background-color: #e2e8f0;
            margin: 12px 0;
            width: 100%;
          `;
          tooltipWrapper.appendChild(clockingDivider);
          
          const clockingTitle = document.createElement('div');
          clockingTitle.style.cssText = `
            font-weight: 600;
            margin-bottom: 6px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #0f172a;
          `;
          
          // Add warning symbol indicator
          const symbolIndicator = document.createElement('span');
          symbolIndicator.style.cssText = `
            display: inline-block;
            width: 16px;
            height: 16px;
            text-align: center;
            line-height: 16px;
            font-size: 12px;
          `;
          
          switch (data.clockingRisk.level) {
            case 'MODERATE':
              symbolIndicator.textContent = '△';
              symbolIndicator.style.color = CHART_COLORS.WARNING || '#f59e0b';
              break;
            case 'HIGH':
              symbolIndicator.textContent = '!';
              symbolIndicator.style.color = CHART_COLORS.NEGATIVE || '#ef4444';
              break;
            case 'CRITICAL':
              symbolIndicator.textContent = '⬥';
              symbolIndicator.style.color = CHART_COLORS.RED_DARK || '#dc2626';
              break;
          }
          
          clockingTitle.appendChild(symbolIndicator);
          
          const titleText = document.createElement('span');
          titleText.textContent = 'Mileage Assessment:';
          clockingTitle.appendChild(titleText);
          
          tooltipWrapper.appendChild(clockingTitle);
          
          // Risk level badge
          const riskBadge = document.createElement('div');
          const riskColors = {
            'MODERATE': '#f59e0b',
            'HIGH': '#ef4444', 
            'CRITICAL': '#dc2626'
          };
          const riskLabels = {
            'MODERATE': 'Requires Review',
            'HIGH': 'Suspicious Pattern',
            'CRITICAL': 'Likely Clocked'
          };
          
          riskBadge.style.cssText = `
            display: inline-block;
            padding: 3px 10px;
            border-radius: 4px;
            background-color: ${riskColors[data.clockingRisk.level]};
            color: white;
            font-size: 11px;
            font-weight: 500;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          `;
          riskBadge.textContent = riskLabels[data.clockingRisk.level];
          tooltipWrapper.appendChild(riskBadge);
          
          // Evidence list
          if (data.clockingRisk.evidence && data.clockingRisk.evidence.length > 0) {
            data.clockingRisk.evidence.forEach(evidence => {
              const evidenceDiv = document.createElement('div');
              evidenceDiv.style.cssText = `
                font-size: 13px;
                margin-bottom: 3px;
                color: #64748b;
                padding-left: 8px;
                position: relative;
              `;
              evidenceDiv.innerHTML = `<span style="position: absolute; left: 0; color: #94a3b8;">•</span>${evidence}`;
              tooltipWrapper.appendChild(evidenceDiv);
            });
          }
        }
        
        tooltipLabel.element = tooltipWrapper;
        container.appendChild(tooltipWrapper);
      };
      
      createEnhancedTooltipElement();
      labelsRef.current.push(tooltipLabel);
      return tooltipLabel;
    };
    
    // Create axes
    const createAxes = () => {
      const axisHelper = new THREE.AxesHelper(chartWidth / 2);
      axisHelper.position.set(-chartWidth/2, 0, 0);
      scene.add(axisHelper);
      
      // X-axis (Timeline)
      const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-chartWidth/2, 0, 0),
        new THREE.Vector3(chartWidth/2, 0, 0)
      ]);
      const xAxisMaterial = new THREE.LineBasicMaterial({ color: CHART_COLORS.GRAY_600, linewidth: 2 });
      const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
      scene.add(xAxis);
      
      // Y-axis (Mileage height)
      const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-chartWidth/2, 0, 0),
        new THREE.Vector3(-chartWidth/2, chartHeight, 0)
      ]);
      const yAxisMaterial = new THREE.LineBasicMaterial({ color: CHART_COLORS.GRAY_600, linewidth: 2 });
      const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
      scene.add(yAxis);
    };
    
    // Create axis labels
    const createAxisLabels = () => {
      // X-axis labels (Dates - show first, middle, last)
      const dateLabels = [
        { data: validMileageData[0], position: 0 },
        { data: validMileageData[Math.floor(validMileageData.length / 2)], position: 0.5 },
        { data: validMileageData[validMileageData.length - 1], position: 1 }
      ];
      
      dateLabels.forEach(({ data, position }) => {
        const xPos = (position - 0.5) * chartWidth;
        const labelPosition = new THREE.Vector3(xPos, -1, 1);
        const year = data.date.getFullYear();
        createHTMLLabel(year.toString(), labelPosition, CHART_COLORS.GRAY_600, '10px');
      });
      
      // Y-axis labels (Mileage levels)
      const mileageLevels = [0, 0.25, 0.5, 0.75, 1.0];
      mileageLevels.forEach((level) => {
        const mileage = minMileage + (mileageRange * level);
        const yPos = chartHeight * level;
        
        const labelPosition = new THREE.Vector3(-chartWidth/2 - 2, yPos, 0);
        createHTMLLabel(
          Math.round(mileage / 1000) + 'k', 
          labelPosition, 
          CHART_COLORS.GRAY_600, 
          '10px'
        );
      });
      
      // Axis titles
      createHTMLLabel('Timeline', new THREE.Vector3(0, -2, 2), CHART_COLORS.GRAY_800, '12px');
      createHTMLLabel('Mileage', new THREE.Vector3(-chartWidth/2 - 4, chartHeight/2, 2), CHART_COLORS.GRAY_800, '12px');
    };
    
    // Create 3D mileage bars
    const createMileageBars = () => {
      const barWidth = 0.8;
      const barDepth = 0.6;
      
      validMileageData.forEach((data, index) => {
        const xPos = ((index / (validMileageData.length - 1)) - 0.5) * chartWidth;
        const normalizedHeight = (data.mileage - minMileage) / mileageRange;
        const barHeight = Math.max(0.1, normalizedHeight * chartHeight);
        
        // Calculate dynamic colors based on multi-factor analysis
        const colorInfo = calculateBarColor(data, index, validMileageData);
        
        // Create mileage bar with dynamic coloring
        const barGeometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
        const barMaterial = new THREE.MeshLambertMaterial({ 
          color: new THREE.Color(colorInfo.color),
          transparent: true,
          opacity: colorInfo.opacity,
          emissive: new THREE.Color(colorInfo.emissive)
        });
        
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.position.set(xPos, barHeight/2, 0);
        bar.castShadow = true;
        bar.receiveShadow = true;
        
        // Store enhanced data for tooltip
        bar.userData = {
          ...data,
          colorInfo
        };
        hoveredObjects.current.push(bar);
        scene.add(bar);
        
        // Add enhanced edge highlighting with conditional styling
        const edgesGeometry = new THREE.EdgesGeometry(barGeometry);
        const edgeStyle = EDGE_STYLES[colorInfo.edgeStyle] || EDGE_STYLES.NORMAL;
        const edgesMaterial = new THREE.LineBasicMaterial({ 
          color: edgeStyle.color || colorInfo.color, 
          opacity: edgeStyle.opacity,
          transparent: true,
          linewidth: edgeStyle.linewidth
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        edges.position.set(xPos, barHeight/2, 0);
        scene.add(edges);
        
        // Add warning indicators
        if (data.negativeMileage) {
          const warningGeometry = new THREE.PlaneGeometry(barWidth * 1.2, barHeight * 1.2);
          const warningMaterial = new THREE.MeshBasicMaterial({
            color: CHART_COLORS.RED,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
          });
          const warningPlane = new THREE.Mesh(warningGeometry, warningMaterial);
          warningPlane.position.set(xPos, barHeight/2, barDepth/2 + 0.1);
          scene.add(warningPlane);
        }
        
        if (data.inactivityPeriod) {
          const inactivityGeometry = new THREE.PlaneGeometry(barWidth * 1.2, barHeight * 1.2);
          const inactivityMaterial = new THREE.MeshBasicMaterial({
            color: CHART_COLORS.GRAY_300,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
          });
          const inactivityPlane = new THREE.Mesh(inactivityGeometry, inactivityMaterial);
          inactivityPlane.position.set(xPos, barHeight/2, -barDepth/2 - 0.1);
          scene.add(inactivityPlane);
        }
        
        // Add clocking risk warning symbols
        if (data.clockingRisk && data.clockingRisk.level !== 'LOW') {
          console.log(`Creating warning symbol for ${data.dateString}: ${data.clockingRisk.level}`, data.clockingRisk);
          const warningSymbol = createWarningSymbol(data.clockingRisk.level);
          if (warningSymbol) {
            warningSymbol.position.set(xPos, barHeight + 0.5, 0);
            warningSymbol.userData.originalY = barHeight + 0.5;
            scene.add(warningSymbol);
            console.log(`Warning symbol created and added to scene for ${data.dateString}`);
          }
        }
      });
    };
    
    // Create trend lines
    const createTrendLines = () => {
      if (trendLineData.length < 2) return;
      
      // Vehicle trend line
      const trendPoints = [];
      trendLineData.forEach((data, index) => {
        if (data.trendMileage !== null) {
          const xPos = ((index / (trendLineData.length - 1)) - 0.5) * chartWidth;
          const normalizedHeight = (data.trendMileage - minMileage) / mileageRange;
          const yPos = Math.max(0.1, normalizedHeight * chartHeight);
          trendPoints.push(new THREE.Vector3(xPos, yPos, chartDepth/2));
        }
      });
      
      if (trendPoints.length >= 2) {
        const trendGeometry = new THREE.BufferGeometry().setFromPoints(trendPoints);
        const trendMaterial = new THREE.LineBasicMaterial({ 
          color: CHART_COLORS.GRAY_900, 
          linewidth: 3 
        });
        const trendLine = new THREE.Line(trendGeometry, trendMaterial);
        scene.add(trendLine);
      }
      
      // UK average trend line
      const ukAvgPoints = [];
      trendLineData.forEach((data, index) => {
        if (data.ukAverageMileage !== null) {
          const xPos = ((index / (trendLineData.length - 1)) - 0.5) * chartWidth;
          const normalizedHeight = (data.ukAverageMileage - minMileage) / mileageRange;
          const yPos = Math.max(0.1, normalizedHeight * chartHeight);
          ukAvgPoints.push(new THREE.Vector3(xPos, yPos, -chartDepth/2));
        }
      });
      
      if (ukAvgPoints.length >= 2) {
        const ukAvgGeometry = new THREE.BufferGeometry().setFromPoints(ukAvgPoints);
        const ukAvgMaterial = new THREE.LineBasicMaterial({ 
          color: CHART_COLORS.GRAY_600,
          linewidth: 2
        });
        const ukAvgLine = new THREE.Line(ukAvgGeometry, ukAvgMaterial);
        scene.add(ukAvgLine);
      }
    };
    
    // Create base grid
    const createBaseGrid = () => {
      const gridHelper = new THREE.GridHelper(chartWidth, 8, CHART_COLORS.GRAY_200, CHART_COLORS.GRAY_100);
      gridHelper.position.y = 0;
      scene.add(gridHelper);
    };
    
    // Build the visualization
    createAxes();
    createAxisLabels();
    createMileageBars();
    createTrendLines();
    createBaseGrid();
    
    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    
    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 8;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Store initial camera state for reset
    const initialPosition = camera.position.clone();
    const initialTarget = controls.target.clone();
    
    // Right-click tooltip functionality
    const handleRightClick = (event) => {
      event.preventDefault();
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hoveredObjects.current);
      
      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        const data = intersected.userData;
        
        create3DTooltip(data, intersected.position);
        
        // Highlight selected bar
        hoveredObjects.current.forEach(obj => {
          if (obj.material) {
            obj.material.emissive.setHex(0x000000);
          }
        });
        
        if (intersected.material) {
          intersected.material.emissive.setHex(0x001f3e);
        }
        
        tooltipVisible = true;
      } else if (tooltipVisible && tooltipLabel) {
        tooltipLabel.visible = false;
        hoveredObjects.current.forEach(obj => {
          if (obj.material) {
            obj.material.emissive.setHex(0x000000);
          }
        });
        tooltipVisible = false;
      }
    };
    
    // Hide tooltip on left click
    const handleLeftClick = () => {
      if (tooltipVisible && tooltipLabel) {
        tooltipLabel.visible = false;
        if (tooltipLabel.element) {
          tooltipLabel.element.remove();
        }
        const index = labelsRef.current.indexOf(tooltipLabel);
        if (index > -1) {
          labelsRef.current.splice(index, 1);
        }
        hoveredObjects.current.forEach(obj => {
          if (obj.material) {
            obj.material.emissive.setHex(0x000000);
          }
        });
        tooltipVisible = false;
        tooltipLabel = null;
      }
    };
    
    // Double-click reset functionality
    const handleDoubleClick = () => {
      camera.position.copy(initialPosition);
      controls.target.copy(initialTarget);
      controls.update();
    };
    
    // Add event listeners
    renderer.domElement.addEventListener('contextmenu', handleRightClick);
    renderer.domElement.addEventListener('click', handleLeftClick);
    renderer.domElement.addEventListener('dblclick', handleDoubleClick);
    
    // Initialize HTML labels
    initializeLabelsContainer();
    createLabelElements();
    
    // Console log camera position for debugging
    let lastLogTime = 0;
    const logCameraPosition = () => {
      const now = Date.now();
      if (now - lastLogTime > 2000) {
        console.log('3D Mileage Chart Camera Position:', {
          position: {
            x: camera.position.x.toFixed(2),
            y: camera.position.y.toFixed(2), 
            z: camera.position.z.toFixed(2)
          },
          target: {
            x: controls.target.x.toFixed(2),
            y: controls.target.y.toFixed(2),
            z: controls.target.z.toFixed(2)
          }
        });
        lastLogTime = now;
      }
    };
    
    controls.addEventListener('change', logCameraPosition);
    
    // Render loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      animateWarningSymbols(scene, clock);
      updateHTMLLabels();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup function
    const cleanup = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      renderer.domElement.removeEventListener('contextmenu', handleRightClick);
      renderer.domElement.removeEventListener('click', handleLeftClick);
      renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
      
      const labelsContainer = document.getElementById('mileage-3d-chart-labels');
      if (labelsContainer) {
        labelsContainer.remove();
      }
      labelsRef.current = [];
      hoveredObjects.current = [];
      
      controls.dispose();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
    
    return cleanup;
  }, [hasValidMileageData, combinedData]);

  if (!motData || motData.length === 0) {
    return null;
  }

  return (
    <>
      <ChartSectionBreak />
      <ChartGridRow>
        <ChartHeader>3D Mileage History</ChartHeader>
        
        {!hasValidMileageData ? (
          <ChartInsetText>
            <ChartBody>
              Not enough mileage data is available to display a 3D chart. At least two MOT tests with recorded mileage are required.
            </ChartBody>
          </ChartInsetText>
        ) : (
          <>
            <ChartCaption>
              Interactive 3D visualization of the vehicle's mileage history from MOT test records
            </ChartCaption>
            
            <div className="mileage-3d-legend" style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#f8fafc',
              border: `1px solid ${CHART_COLORS.GRAY_200}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: '"Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              color: '#475569'
            }}>
              {/* Compact navigation */}
              <div style={{ 
                marginBottom: '12px', 
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                fontSize: '11px',
                color: '#64748b'
              }}>
                <strong style={{color: '#1e293b'}}>Controls:</strong> Drag to rotate • Scroll to zoom • Double-click to reset • Right-click bars for details
              </div>

              {/* Compact legend grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr', 
                gap: '16px',
                alignItems: 'start'
              }}>
                {/* Left column: Bar colors and warning symbols */}
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{color: '#0f172a', fontSize: '13px'}}>Bar Colors</strong>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '8px 12px', 
                      marginTop: '4px'
                    }}>
                      <span style={{color: STATUS_COLORS.PASS_CLEAN, fontSize: '11px', whiteSpace: 'nowrap'}}>● Pass</span>
                      <span style={{color: STATUS_COLORS.PASS_ADVISORY, fontSize: '11px', whiteSpace: 'nowrap'}}>● Advisories</span>
                      <span style={{color: STATUS_COLORS.FAIL_MAJOR, fontSize: '11px', whiteSpace: 'nowrap'}}>● Fail</span>
                      <span style={{color: STATUS_COLORS.FAIL_CONSECUTIVE, fontSize: '11px', whiteSpace: 'nowrap'}}>● Multiple Fails</span>
                      <span style={{color: STATUS_COLORS.POST_INACTIVITY, fontSize: '11px', whiteSpace: 'nowrap'}}>● After Gap</span>
                      <span style={{color: STATUS_COLORS.IMPROVEMENT, fontSize: '11px', whiteSpace: 'nowrap'}}>● Improved</span>
                    </div>
                  </div>
                  
                  <div>
                    <strong style={{color: '#0f172a', fontSize: '13px'}}>Warning Symbols</strong>
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      marginTop: '4px'
                    }}>
                      <span style={{color: CHART_COLORS.WARNING || '#f59e0b', fontSize: '11px', whiteSpace: 'nowrap'}}>△ Review</span>
                      <span style={{color: CHART_COLORS.NEGATIVE || '#ef4444', fontSize: '11px', whiteSpace: 'nowrap'}}>! Suspicious</span>
                      <span style={{color: CHART_COLORS.RED_DARK || '#dc2626', fontSize: '11px', whiteSpace: 'nowrap'}}>⬥ Clocked</span>
                    </div>
                  </div>
                </div>

                {/* Right column: Lines and additional info */}
                <div style={{ fontSize: '11px' }}>
                  <strong style={{color: '#0f172a', fontSize: '13px', display: 'block', marginBottom: '4px'}}>Trend Lines</strong>
                  <div style={{ color: '#64748b', lineHeight: '1.4' }}>
                    <div><span style={{color: CHART_COLORS.GRAY_900}}>■</span> Vehicle trend</div>
                    <div><span style={{color: CHART_COLORS.GRAY_600}}>■</span> UK average</div>
                    <div style={{ marginTop: '4px', fontStyle: 'italic' }}>Older tests fade</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              ref={mountRef} 
              className="mileage-3d-container"
              style={{ 
                height: `${height}px`,
                background: CHART_COLORS.WHITE,
                border: `1px solid ${CHART_COLORS.GRAY_200}`,
                borderRadius: '8px',
                cursor: 'grab',
                userSelect: 'none'
              }}
              onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
              onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
              onMouseLeave={(e) => e.currentTarget.style.cursor = 'grab'}
            />
            
            <ChartInsetText>
              <ChartBody>
                This 3D chart displays the vehicle's recorded mileage at each MOT test as blue bars. 
                The height of each bar represents the mileage value. The black line shows the vehicle's 
                mileage trend, while the gray line represents the UK national average annual mileage (7,500 miles per year).
                Use your mouse to rotate and zoom the visualization for better analysis.
              </ChartBody>
            </ChartInsetText>
          </>
        )}
      </ChartGridRow>
    </>
  );
};

export default MileageChart3D;