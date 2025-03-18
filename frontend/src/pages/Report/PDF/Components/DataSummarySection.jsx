import pdfStyles from '../styles/pdfStyles.js';

/**
 * Creates a minimalist data summary section with reliable text-based layout
 * Avoids complex backgrounds and positioning for maximum reliability
 * 
 * @param {Object} reportData - The vehicle report data
 * @param {Array} motData - The MOT history data array
 * @param {Object} resolvedData - Additional resolved data
 * @returns {Object} PDF document definition object
 */
export const createDataSummarySection = (reportData, motData, resolvedData) => {
  // If no data available, return a simple message
  if (!reportData) return { text: 'No data available for summary', style: 'note' };
  
  const { currentStatus, latestMileage } = resolvedData;
  
  // Create content array
  const content = [];
  
  // Add section header with simple underline
  content.push(
    { 
      text: 'Vehicle Data Summary', 
      style: 'header',
      margin: [0, 20, 0, 10]
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 515, y2: 0,
          lineWidth: 1,
          lineColor: '#1E88E5'
        }
      ],
      margin: [0, 0, 0, 15]
    },
    { 
      text: 'This section provides a concise overview of the vehicle data.', 
      fontSize: 9,
      italics: true,
      margin: [0, 0, 0, 15] 
    }
  );
  
  // Add vehicle overview section
  content.push(
    { 
      text: 'Vehicle Overview', 
      style: 'subheader', 
      margin: [0, 0, 0, 5] 
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 150, y2: 0,
          lineWidth: 0.5,
          lineColor: '#90CAF9'
        }
      ],
      margin: [0, 0, 0, 10]
    }
  );
  
  // Format function for consistency
  const formatValue = (value) => {
    if (value === undefined || value === null || value === '') return 'Not available';
    return String(value);
  };
  
  // Add vehicle details as a simple table
  const vehicleOverviewBody = [
    ['Registration', formatValue(reportData.registration)],
    ['Make & Model', formatValue(reportData.makeModel)],
    ['Colour', formatValue(reportData.colour)],
    ['Fuel Type', formatValue(reportData.fuelType)],
    ['First Registration', formatValue(reportData.firstRegistrationDate)]
  ];
  
  content.push({
    table: {
      widths: [200, '*'],
      body: vehicleOverviewBody.map(row => [
        { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
        { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
      ])
    },
    margin: [0, 0, 0, 15]
  });
  
  // Add MOT summary if available
  if (motData?.length > 0) {
    content.push(
      { 
        text: 'MOT Summary', 
        style: 'subheader', 
        margin: [0, 10, 0, 5] 
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 120, y2: 0,
            lineWidth: 0.5,
            lineColor: '#90CAF9'
          }
        ],
        margin: [0, 0, 0, 10]
      }
    );
    
    // MOT summary as a simple table
    const motSummaryBody = [
      ['Total Tests', motData.length.toString()],
      ['Latest Mileage', latestMileage ? `${latestMileage} miles` : 'Not available'],
      ['First Mileage', motData[motData.length - 1]?.mileage ? `${motData[motData.length - 1].mileage} miles` : 'Not available']
    ];
    
    content.push({
      table: {
        widths: [200, '*'],
        body: motSummaryBody.map(row => [
          { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
          { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
        ])
      },
      margin: [0, 0, 0, 15]
    });
  }
  
  // Add vehicle insights if available
  if (currentStatus) {
    content.push(
      { 
        text: 'Vehicle Insights', 
        style: 'subheader', 
        margin: [0, 10, 0, 5] 
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 130, y2: 0,
            lineWidth: 0.5,
            lineColor: '#90CAF9'
          }
        ],
        margin: [0, 0, 0, 10]
      }
    );
    
    // Insights as a simple table
    const insightsBody = [
      ['Driveability Status', formatValue(currentStatus.driveabilityStatus)],
      ['MOT Status', formatValue(currentStatus.motStatus)],
      ['Risk Level', formatValue(currentStatus.riskLevel)]
    ];
    
    content.push({
      table: {
        widths: [200, '*'],
        body: insightsBody.map(row => [
          { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
          { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
        ])
      },
      margin: [0, 0, 0, 15]
    });
  }
  
  // Return the complete stack
  return {
    stack: content,
    margin: [0, 0, 0, 20]
  };
};

export default createDataSummarySection;