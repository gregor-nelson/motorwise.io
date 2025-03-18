import pdfStyles from './styles/pdfStyles.js';

/**
 * Creates a styled table with headers and rows
 * Optimized for performance with cached column widths
 */
export const createTableDefinition = (headers, rows, widths = []) => {
  // Precompute header row once to avoid repetitive object creation
  const headerRow = headers.map(header => ({
    text: header,
    style: 'tableHeader',
    fillColor: pdfStyles.table.header.fillColor,
  }));

  // Precompute width array to avoid conditional check in every row iteration
  const columnWidths = widths.length === headers.length 
    ? widths 
    : new Array(headers.length).fill('*');

  // Precompute row styles for alternating rows to avoid recalculation
  const bodyRows = rows.map((row, i) => {
    const isAlternate = i % 2 === 1;
    return row.map(cell => ({
      text: typeof cell !== 'undefined' && cell !== null ? cell.toString() : 'N/A',
      fillColor: isAlternate ? pdfStyles.table.header.fillColor : null,
    }));
  });

  // Create layout object only once
  const tableLayout = {
    ...pdfStyles.table.layout,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 6,
    paddingBottom: () => 6
  };

  return {
    table: {
      headerRows: 1,
      widths: columnWidths,
      body: [headerRow, ...bodyRows],
    },
    layout: tableLayout,
    margin: pdfStyles.table.standardMargin,
  };
};

/**
 * Creates a key-value section with a configurable number of columns
 * Optimized with filtered data precomputation and better null handling
 */
export const createKeyValueSection = (data, columns = 2) => {
  // Pre-filter data to avoid unnecessary processing
  const filteredData = Array.isArray(data) 
    ? data.filter(item => Array.isArray(item) && item.length >= 2 && item[1] !== undefined && item[1] !== null)
    : [];
    
  if (filteredData.length === 0) {
    return { text: 'No data available', style: 'note' };
  }

  const tableBody = [];
  const rowCount = Math.ceil(filteredData.length / columns);
  const colsPerRow = columns * 2; // Each key-value pair uses 2 columns

  // Pre-calculate empty cells for reuse
  const emptyCells = [{ text: '' }, { text: '' }];
  
  // Create a single notAvailableStyle reference to avoid recreation
  const notAvailableStyle = pdfStyles.formatters.notAvailableStyle;

  for (let i = 0; i < rowCount; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      const index = i * columns + j;
      if (index < filteredData.length) {
        const [key, value] = filteredData[index];
        
        // Add key cell
        row.push({ 
          text: `${key}:`, 
          bold: true,
          margin: [0, 3, 5, 3]
        });
        
        // Add value cell - optimize by reducing conditional logic
        const isValueAvailable = value !== undefined && value !== null && value !== '';
        row.push({
          text: isValueAvailable ? value : 'Not available',
          margin: [0, 3, 10, 3],
          ...(isValueAvailable ? {} : notAvailableStyle)
        });
      } else {
        // Reuse empty cells instead of creating new objects
        row.push(emptyCells[0], emptyCells[1]);
      }
    }
    tableBody.push(row);
  }

  return {
    table: {
      widths: new Array(colsPerRow).fill('*'),
      body: tableBody,
    },
    layout: 'noBorders',
    margin: [0, 10, 0, 15],
  };
};

/**
 * Creates a document section with a title and content
 * Optimized for consistency and performance
 */
export const createSection = (title, content, options = {}) => {
  // Convert content to array only once if needed
  const contentArray = Array.isArray(content) ? content : [content];
  
  return [
    {
      text: title,
      style: 'sectionHeader',
      pageBreak: options.startNewPage ? 'before' : undefined,
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 1,
          lineColor: pdfStyles.colors.standard.primary,
        },
      ],
      margin: [0, 0, 0, 15],
    },
    {
      stack: contentArray,
      margin: [0, 5, 0, 20],
    },
  ];
};

// Cache for risk/quality colors to avoid recalculation
const colorCache = new Map();

/**
 * Helper function to get risk color based on risk level
 * Optimized with caching for repeated values
 */
export const getRiskColor = (riskLevel) => {
  if (!riskLevel) return pdfStyles.colors.standard.muted;
  
  const cacheKey = `risk_${riskLevel}`;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey);
  }
  
  const level = String(riskLevel).toLowerCase();
  let color;
  
  if (level.includes('low')) {
    color = pdfStyles.colors.standard.success;
  } else if (level.includes('medium') || level.includes('moderate')) {
    color = pdfStyles.colors.standard.warning;
  } else if (level.includes('high')) {
    color = pdfStyles.colors.standard.error;
  } else {
    color = pdfStyles.colors.standard.muted;
  }
  
  colorCache.set(cacheKey, color);
  return color;
};

/**
 * Helper function to get risk background color based on risk level
 * Optimized with caching
 */
export const getRiskBackgroundColor = (riskLevel) => {
  if (!riskLevel) return '#F9F9FB';
  
  const cacheKey = `riskbg_${riskLevel}`;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey);
  }
  
  const level = String(riskLevel).toLowerCase();
  let color;
  
  if (level.includes('low')) {
    color = '#F0FDF4'; // Light green
  } else if (level.includes('medium') || level.includes('moderate')) {
    color = '#FFFBEB'; // Light yellow
  } else if (level.includes('high')) {
    color = '#FEF2F2'; // Light red
  } else {
    color = '#F9F9FB';
  }
  
  colorCache.set(cacheKey, color);
  return color;
};

/**
 * Helper function to get quality color based on quality level
 * Optimized with caching
 */
export const getQualityColor = (qualityLevel) => {
  if (!qualityLevel) return pdfStyles.colors.standard.muted;
  
  const cacheKey = `quality_${qualityLevel}`;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey);
  }
  
  const level = String(qualityLevel).toLowerCase();
  let color;
  
  if (level.includes('good') || level.includes('excellent')) {
    color = pdfStyles.colors.standard.success;
  } else if (level.includes('fair') || level.includes('average')) {
    color = pdfStyles.colors.standard.warning;
  } else if (level.includes('poor') || level.includes('bad')) {
    color = pdfStyles.colors.standard.error;
  } else {
    color = pdfStyles.colors.standard.muted;
  }
  
  colorCache.set(cacheKey, color);
  return color;
};

/**
 * Helper function to get usage color based on usage level
 * Optimized with caching
 */
export const getUsageColor = (usageLevel) => {
  if (!usageLevel) return pdfStyles.colors.standard.muted;
  
  const cacheKey = `usage_${usageLevel}`;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey);
  }
  
  const level = String(usageLevel).toLowerCase();
  let color;
  
  if (level.includes('low') || level.includes('minimal')) {
    color = pdfStyles.colors.standard.success;
  } else if (level.includes('moderate') || level.includes('average')) {
    color = pdfStyles.colors.standard.warning;
  } else if (level.includes('heavy') || level.includes('high')) {
    color = pdfStyles.colors.standard.error;
  } else {
    color = pdfStyles.colors.standard.muted;
  }
  
  colorCache.set(cacheKey, color);
  return color;
};

/**
 * Helper function to get emissions color based on CO2 value
 * Optimized with numeric parsing and caching
 */
export const getEmissionsColor = (co2Value) => {
  if (!co2Value) return pdfStyles.colors.standard.muted;
  
  const cacheKey = `emissions_${co2Value}`;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey);
  }
  
  let co2;
  if (typeof co2Value === 'string') {
    co2 = parseInt(co2Value.replace(/[^\d]/g, ''), 10);
  } else if (typeof co2Value === 'number') {
    co2 = co2Value;
  } else {
    return pdfStyles.colors.standard.muted;
  }
  
  if (isNaN(co2)) return pdfStyles.colors.standard.muted;
  
  let color;
  if (co2 <= 50) color = pdfStyles.colors.standard.success;
  else if (co2 <= 95) color = '#4ade80';
  else if (co2 <= 115) color = '#a3e635';
  else if (co2 <= 135) color = '#facc15';
  else if (co2 <= 155) color = '#fb923c';
  else if (co2 <= 175) color = '#f97316';
  else if (co2 <= 195) color = '#ef4444';
  else color = '#dc2626';
  
  colorCache.set(cacheKey, color);
  return color;
};

/**
 * Optimized data resolution function using faster data structures and smarter defaults
 * Enhanced to use object destructuring for cleaner access
 */
export const resolveData = (reportData, motData, insightsData, vehicleInsightsData) => {
  // Default state objects - created once
  const currentStatus = {
    driveabilityStatus: 'Unknown',
    motStatus: 'Unknown',
    motExpiry: null,
    taxStatus: 'Unknown',
    taxDueDate: null,
    riskLevel: 'Unknown',
    riskFactors: []
  };

  const technicalSpecs = {
    engineSize: null,
    vin: null,
    manufactureDate: null,
    co2Emissions: null,
    euroStatus: null,
    typeApproval: null,
    wheelPlan: null,
    revenueWeight: null,
    realDrivingEmissions: null,
    firstDvlaRegistration: null,
    isAutomatedVehicle: null,
    markedForExport: null,
    lastV5cIssued: null
  };

  // Extract mileage data - use optional chaining for safer access
  const latestMileage = motData?.length > 0 ? 
    (motData[0].mileage || motData[0].formattedMileage || 'Unknown') : 'Unknown';
  
  // Process vehicle insights data with safe property access
  if (vehicleInsightsData?.insights) {
    const { insights } = vehicleInsightsData;
    
    // Process status insights with destructuring for cleaner code
    if (insights.statusInsights) {
      const { 
        driveabilityStatus, 
        motStatus, 
        motExpiryDate, 
        taxStatus, 
        isTaxExempt,
        statusRiskLevel, 
        riskFactors 
      } = insights.statusInsights;
      
      // Using nullish coalescing for cleaner fallbacks
      currentStatus.driveabilityStatus = driveabilityStatus ?? currentStatus.driveabilityStatus;
      currentStatus.motStatus = motStatus ?? currentStatus.motStatus;
      currentStatus.motExpiry = motExpiryDate ?? currentStatus.motExpiry;
      currentStatus.taxStatus = taxStatus ?? (isTaxExempt ? 'Tax Exempt' : currentStatus.taxStatus);
      currentStatus.riskLevel = statusRiskLevel ?? currentStatus.riskLevel;
      currentStatus.riskFactors = riskFactors ?? currentStatus.riskFactors;
    }
    
    // Process emissions insights
    if (insights.emissionsInsights) {
      const { co2Emissions, euroStatus } = insights.emissionsInsights;
      technicalSpecs.co2Emissions = co2Emissions ?? technicalSpecs.co2Emissions;
      technicalSpecs.euroStatus = euroStatus ?? technicalSpecs.euroStatus;
    }
  }
  
  // Process insights data
  if (insightsData) {
    // Process current status with conditional checks
    if (insightsData.currentStatus) {
      const { 
        driveabilityStatus, 
        motExpires, 
        riskLevel, 
        riskFactors 
      } = insightsData.currentStatus;
      
      if (!currentStatus.driveabilityStatus || currentStatus.driveabilityStatus === 'Unknown')
        currentStatus.driveabilityStatus = driveabilityStatus;
      if (!currentStatus.motStatus || currentStatus.motStatus === 'Unknown')
        currentStatus.motStatus = motExpires;
      if (!currentStatus.riskLevel || currentStatus.riskLevel === 'Unknown')
        currentStatus.riskLevel = riskLevel;
      if (!currentStatus.riskFactors?.length)
        currentStatus.riskFactors = riskFactors || [];
    }
    
    // Process technical details
    if (insightsData.technicalDetails) {
      // Use loop once instead of accessing individual properties
      const techDetails = insightsData.technicalDetails;
      Object.keys(technicalSpecs).forEach(key => {
        if (key in techDetails && (!technicalSpecs[key] || technicalSpecs[key] === 'Unknown')) {
          technicalSpecs[key] = techDetails[key];
        }
      });
    }
  }

  // Use report data for any missing values
  if (reportData) {
    // Update status information
    if (!currentStatus.motStatus || currentStatus.motStatus === 'Unknown')
      currentStatus.motStatus = reportData.motStatus;
    if (!currentStatus.motExpiry || currentStatus.motExpiry === 'Unknown')
      currentStatus.motExpiry = reportData.motExpiry;
    if (!currentStatus.taxStatus || currentStatus.taxStatus === 'Unknown')
      currentStatus.taxStatus = reportData.taxStatus;
    if (!currentStatus.taxDueDate || currentStatus.taxDueDate === 'Unknown')
      currentStatus.taxDueDate = reportData.taxDueDate;
    
    // Batch update technical specs
    // Use array of fields to check to avoid duplicating logic
    const fieldsToCheck = [
      'engineSize', 'vin', 'manufactureDate', 'co2Emissions', 'euroStatus',
      'typeApproval', 'wheelPlan', 'revenueWeight', 'markedForExport',
      'lastV5cIssued'
    ];
    
    fieldsToCheck.forEach(field => {
      if (reportData[field] && (!technicalSpecs[field] || technicalSpecs[field] === 'Unknown')) {
        technicalSpecs[field] = reportData[field];
      }
    });
  }

  // Special engine size formatting - only do this once if needed
  if (reportData?.engineSize && !technicalSpecs.engineSize) {
    const engineSizeStr = reportData.engineSize.toString();
    technicalSpecs.engineSize = engineSizeStr.toLowerCase().includes('cc') ? 
      engineSizeStr : `${engineSizeStr}cc`;
  }

  return {
    currentStatus,
    latestMileage,
    technicalSpecs
  };
};

/**
 * Creates a document definition for generating a PDF
 * Optimized with more efficient data handling
 */
export const createDocumentDefinition = (reportData, motData, insightsData, vehicleInsightsData, mileageInsightsData, sectionComponents) => {
  if (!reportData) {
    throw new Error('Report data is required to generate PDF');
  }

  // Resolve any data conflicts and get the latest consistent information
  const resolvedData = resolveData(reportData, motData, insightsData, vehicleInsightsData);

  // Extract section creators from the components
  const {
    createCoverPage,
    createVehicleDetailsSection,
    createMOTHistorySection,
    createVehicleInsightsSection,
    createEnhancedVehicleInsightsSection,
    createMileageInsightsSection,
    createDataSummarySection
  } = sectionComponents;

  // Pre-filter null content items to avoid later checks
  const content = [
    createCoverPage(reportData, resolvedData),
    createSection('Vehicle Details', createVehicleDetailsSection(reportData, resolvedData), { startNewPage: true }),
    motData?.length > 0
      ? createSection('MOT History', createMOTHistorySection(motData, mileageInsightsData), { startNewPage: true })
      : null,
    insightsData
      ? createSection('Vehicle Insights', createVehicleInsightsSection(insightsData, resolvedData), { startNewPage: true })
      : null,
    vehicleInsightsData
      ? createSection('Enhanced Vehicle Insights', createEnhancedVehicleInsightsSection(vehicleInsightsData, resolvedData), { startNewPage: true })
      : null,
    mileageInsightsData
      ? createSection('Mileage Insights', createMileageInsightsSection(mileageInsightsData), { startNewPage: true })
      : null,
    createSection('Data Summary', createDataSummarySection(reportData, motData, resolvedData), {
      startNewPage: true,
    }),
  ].filter(Boolean);

  // Create document definition
  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    info: {
      title: `Vehicle Report - ${reportData.registration}`,
      author: 'Vehicle Report System',
      subject: `${reportData.makeModel} Vehicle Report`,
      keywords: 'vehicle, report, MOT, mileage'
    },
    content,
    styles: pdfStyles.text || {
      sectionHeader: {
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 8],
        color: pdfStyles.colors.standard.primary
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 5, 0, 5],
        color: pdfStyles.colors.standard.secondary
      },
      warningHeader: {
        fontSize: 16,
        bold: true,
        margin: [0, 5, 0, 5],
        color: pdfStyles.colors.standard.error
      },
      tableHeader: {
        fontSize: 12,
        bold: true,
        color: pdfStyles.colors.standard.light
      },
      note: {
        fontSize: 10,
        italics: true,
        color: pdfStyles.colors.standard.muted
      }
    },
    defaultStyle: {
      fontSize: 11,
      lineHeight: 1.2,
      font: 'Roboto'
    },
    footer: (currentPage, pageCount) => ({
      columns: [
        { 
          text: reportData.registration.toUpperCase(),
          bold: true,
          fontSize: 9,
          alignment: 'left',
          margin: [40, 0, 0, 0],
          color: pdfStyles.colors.standard.secondary
        },
        {
          text: `Generated: ${new Date().toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })} | Page ${currentPage} of ${pageCount}`,
          fontSize: 9,
          alignment: 'right',
          margin: [0, 0, 40, 0],
          color: pdfStyles.colors.standard.muted
        }
      ],
      margin: [40, 20, 40, 0]
    }),
  };
};

export default {
  createTableDefinition,
  createKeyValueSection,
  createSection,
  getRiskColor,
  getRiskBackgroundColor,
  getQualityColor,
  getUsageColor,
  getEmissionsColor,
  resolveData,
  createDocumentDefinition
};