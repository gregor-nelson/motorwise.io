import pdfStyles from '../styles/pdfStyles.js';

/**
 * Creates a minimalist vehicle insights section with reliable text-based layout
 * Avoids complex backgrounds and positioning for maximum reliability
 * 
 * @param {Object} insightsData - The vehicle insights data
 * @param {Object} resolvedData - Additional resolved data
 * @returns {Object} PDF document definition object
 */
export const createVehicleInsightsSection = (insightsData, resolvedData) => {
  // If no data available, return a simple message
  if (!insightsData) return { text: 'No vehicle insights available', style: 'note' };
  
  const { currentStatus } = resolvedData;
  
  // Create content array
  const content = [];
  
  // Add section header with simple underline
  content.push(
    { 
      text: 'Vehicle Status', 
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
    }
  );
  
  // Add current status information
  content.push(
    { 
      text: 'Current Status', 
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
  
  // Add the vehicle status as simple text
  content.push(
    { 
      text: `This vehicle is currently ${currentStatus.driveabilityStatus || 'Unknown'}`,
      bold: true,
      fontSize: 12,
      margin: [0, 0, 0, 15]
    }
  );
  
  // Add status details as a simple table
  const statusDetailsBody = [
    ['Driveability Status', currentStatus.driveabilityStatus || 'Unknown'],
    ['MOT Status', currentStatus.motStatus || 'Unknown'],
    ['Risk Level', currentStatus.riskLevel || 'Unknown']
  ];
  
  content.push({
    table: {
      widths: [200, '*'],
      body: statusDetailsBody.map(row => [
        { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
        { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
      ])
    },
    margin: [0, 0, 0, 15]
  });
  
  // Add risk factors if they exist
  if (currentStatus.riskFactors?.length > 0) {
    content.push(
      { 
        text: 'Risk Factors', 
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
    
    content.push({
      ul: currentStatus.riskFactors.map(factor => ({
        text: factor,
        fontSize: 9,
        margin: [0, 0, 0, 2]
      })),
      margin: [0, 0, 0, 15]
    });
  }
  
  // Add expert recommendations if available
  if (currentStatus.recommendations?.length > 0) {
    content.push(
      { 
        text: 'Expert Recommendations', 
        style: 'subheader', 
        margin: [0, 10, 0, 5] 
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 180, y2: 0,
            lineWidth: 0.5,
            lineColor: '#90CAF9'
          }
        ],
        margin: [0, 0, 0, 10]
      }
    );
    
    content.push({
      ul: currentStatus.recommendations.map(recommendation => ({
        text: recommendation,
        fontSize: 9,
        margin: [0, 0, 0, 2]
      })),
      margin: [0, 0, 0, 15]
    });
  }
  
  // Return the complete stack
  return {
    stack: content,
    margin: [0, 0, 0, 20]
  };
};

export default createVehicleInsightsSection;