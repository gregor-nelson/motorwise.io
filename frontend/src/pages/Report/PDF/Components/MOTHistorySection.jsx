import pdfStyles from '../styles/pdfStyles.js';

/**
 * Creates a minimalist MOT history section with reliable text-based layout
 * Avoids complex backgrounds and positioning for maximum reliability
 * 
 * @param {Array} motData - The MOT history data array
 * @param {Object} mileageInsightsData - Additional mileage insights data
 * @returns {Object} PDF document definition object
 */
export const createMOTHistorySection = (motData, mileageInsightsData) => {
  // If no data available, return a simple message
  if (!motData || motData.length === 0) {
    return { text: 'No MOT history available', style: 'note' };
  }

  // Create content array
  const content = [];
  
  // Add section header with simple underline
  content.push(
    { 
      text: 'MOT History', 
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
  
  // Calculate average miles per year more efficiently
  let avgMilesPerYear = 'Unknown';
  
  if (mileageInsightsData?.insights?.usagePatterns?.averageAnnualRate) {
    avgMilesPerYear = mileageInsightsData.insights.usagePatterns.averageAnnualRate.toLocaleString();
  } else if (motData.length >= 2) {
    const firstTest = motData[motData.length - 1];
    const lastTest = motData[0];
    
    // Parse mileage values once
    const firstMileage = typeof firstTest.mileage === 'string' ? 
      parseInt(firstTest.mileage.replace(/,/g, ''), 10) : 
      firstTest.mileage;
      
    const lastMileage = typeof lastTest.mileage === 'string' ? 
      parseInt(lastTest.mileage.replace(/,/g, ''), 10) : 
      lastTest.mileage;
    
    // Only do date calculation if mileage values are valid
    if (!isNaN(firstMileage) && !isNaN(lastMileage)) {
      const firstDate = new Date(firstTest.date || firstTest.testDate);
      const lastDate = new Date(lastTest.date || lastTest.testDate);
      
      const yearDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25);
      
      if (yearDiff > 0) {
        avgMilesPerYear = Math.round((lastMileage - firstMileage) / yearDiff).toLocaleString();
      }
    }
  }
  
  // Add MOT summary section
  content.push(
    { 
      text: 'MOT Summary', 
      style: 'subheader', 
      margin: [0, 0, 0, 5] 
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
  
  // Add summary data as a simple table
  const summaryData = [
    ['Total MOT tests', motData.length.toString()],
    ['Latest recorded mileage', motData[0]?.mileage ? `${motData[0].mileage} miles` : 'Not available'],
    ['First recorded mileage', motData[motData.length - 1]?.mileage ? `${motData[motData.length - 1].mileage} miles` : 'Not available'],
    ['Average miles per year', `${avgMilesPerYear} miles`]
  ];
  
  content.push({
    table: {
      widths: [200, '*'],
      body: summaryData.map(row => [
        { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
        { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
      ])
    },
    margin: [0, 0, 0, 15]
  });
  
  // Add MOT history section
  content.push(
    { 
      text: 'MOT Test History', 
      style: 'subheader', 
      margin: [0, 10, 0, 5] 
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
    },
    { 
      text: 'Note: Some test details may be unavailable.', 
      fontSize: 9,
      italics: true,
      margin: [0, 0, 0, 10] 
    }
  );
  
  // Create MOT history table
  if (motData.length > 0) {
    // Create table header row
    const headerRow = [
      { text: 'Test Date', fontSize: 10, bold: true, border: [0, 0, 0, 1], borderColor: '#E0E0E0' },
      { text: 'Result', fontSize: 10, bold: true, border: [0, 0, 0, 1], borderColor: '#E0E0E0' },
      { text: 'Mileage', fontSize: 10, bold: true, border: [0, 0, 0, 1], borderColor: '#E0E0E0' },
      { text: 'Expiry Date', fontSize: 10, bold: true, border: [0, 0, 0, 1], borderColor: '#E0E0E0' }
    ];
    
    // Create table data rows
    const tableRows = motData.map(test => [
      { text: test.testDate || test.date || '-', fontSize: 10, border: [0, 0, 0, 0] },
      { 
        text: test.testResult || test.status || '-', 
        fontSize: 10, 
        border: [0, 0, 0, 0],
        color: (test.testResult === 'PASS' || test.status === 'PASS') ? '#388E3C' : 
               (test.testResult === 'FAIL' || test.status === 'FAIL') ? '#D32F2F' : undefined
      },
      { text: test.mileage ? `${test.mileage} miles` : '-', fontSize: 10, border: [0, 0, 0, 0] },
      { text: test.expiryDate || test.expiry || '-', fontSize: 10, border: [0, 0, 0, 0] }
    ]);
    
    // Add a light gray bottom border to each row except the last one
    for (let i = 0; i < tableRows.length - 1; i++) {
      tableRows[i].forEach(cell => {
        cell.border = [0, 0, 0, 1];
        cell.borderColor = '#F5F5F5';
      });
    }
    
    // Add the table to content
    content.push({
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        headerRows: 1,
        body: [headerRow, ...tableRows]
      },
      margin: [0, 0, 0, 20]
    });
  }
  
  // Return the complete stack
  return {
    stack: content,
    margin: [0, 0, 0, 20]
  };
};

export default createMOTHistorySection;