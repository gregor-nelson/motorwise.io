import pdfStyles from '../styles/pdfStyles.js';

/**
 * Formats a UK vehicle registration with a space (e.g., "AB12CDE" -> "AB12 CDE")
 * @param {string} reg - The raw registration string
 * @returns {string} - Formatted registration
 */
const formatUKReg = (reg) => {
  if (!reg) return 'N/A';
  
  const cleanReg = reg.replace(/\s/g, '').toUpperCase(); // Remove any existing spaces
  
  // Different formatting based on length
  if (cleanReg.length === 7) {
    // Standard format: AB12CDE -> AB12 CDE
    return `${cleanReg.slice(0, 4)} ${cleanReg.slice(4)}`;
  } else {
    // Handle other formats like A5ENK without additional spacing
    return cleanReg;
  }
};

/**
 * Creates a minimalist cover page with reliable text-based layout
 * Avoids complex backgrounds and positioning for maximum reliability
 * 
 * @param {Object} reportData - The vehicle report data
 * @param {Object} resolvedData - Additional resolved data including mileage and specs
 * @returns {Object} PDF document definition object
 */
export const createCoverPage = (reportData, resolvedData) => {
  // If no data available, return a simple message
  if (!reportData) return { text: 'No report data available', style: 'note' };
  
  const { latestMileage, technicalSpecs } = resolvedData || {};
  
  // Format the registration in UK style
  const regFormatted = formatUKReg(reportData.registration || '');
  
  // Create content array
  const content = [];
  
  // Add page header with simple styling
  content.push(
    { 
      text: 'Vehicle Information Report', 
      style: 'header',
      fontSize: 24,
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
  
  // Add registration and vehicle identification section
  content.push(
    { 
      text: 'Vehicle Identification', 
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
  
  // Add registration information
  content.push(
    { 
      text: `Registration Number: ${regFormatted}`,
      bold: true,
      fontSize: 14,
      margin: [0, 0, 0, 5]
    },
    { 
      text: reportData.makeModel || 'Make and model not available',
      fontSize: 12,
      margin: [0, 0, 0, 15]
    }
  );
  
  // Add basic vehicle details section
  content.push(
    { 
      text: 'Vehicle Details', 
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
  
  // Format function for consistency
  const formatValue = (value) => {
    if (value === undefined || value === null || value === '') return 'Not available';
    return String(value);
  };
  
  // Vehicle details as a simple table
  const vehicleDetailsBody = [
    ['Make and model', formatValue(reportData.makeModel)],
    ['Colour', formatValue(reportData.colour)],
    ['Engine size', technicalSpecs?.engineSize ? `${technicalSpecs.engineSize}` : 'Not available'],
    ['Fuel type', formatValue(reportData.fuelType)],
    ['Vehicle identification number (VIN)', formatValue(technicalSpecs?.vin)],
    ['Date of first registration', formatValue(reportData.firstRegistrationDate)]
  ];
  
  content.push({
    table: {
      widths: [200, '*'],
      body: vehicleDetailsBody.map(row => [
        { text: row[0], fontSize: 10, bold: true, border: [0, 0, 0, 0] },
        { text: row[1], fontSize: 10, border: [0, 0, 0, 0] }
      ])
    },
    margin: [0, 0, 0, 15]
  });
  
  // Add status section
  content.push(
    { 
      text: 'Current Status', 
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
  
  // Status details as a simple table
  const statusDetailsBody = [
    ['MOT status', formatValue(reportData.motStatus)],
    ['MOT expiry date', formatValue(reportData.motExpiry)],
    ['Tax status', formatValue(reportData.taxStatus)],
    ['Latest recorded mileage', latestMileage ? `${latestMileage.toLocaleString()} miles` : 'Not available']
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
  
  // Add important information notice
  content.push(
    { 
      text: 'Important Information', 
      style: 'subheader', 
      margin: [0, 10, 0, 5] 
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 160, y2: 0,
          lineWidth: 0.5,
          lineColor: '#90CAF9'
        }
      ],
      margin: [0, 0, 0, 10]
    },
    { 
      text: 'This information is based on the vehicle\'s registration details held by DVLA. While efforts are made to ensure accuracy, you should verify key details before making decisions based on this report.',
      fontSize: 9,
      italics: true,
      margin: [0, 0, 0, 20]
    }
  );
  
  // Format date according to UK standards
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return String(date);
    }
  };
  
  // Add footer with generation date
  content.push(
    {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 515, y2: 0,
          lineWidth: 0.5,
          lineColor: '#BBDEFB'
        }
      ],
      margin: [0, 20, 0, 10]
    },
    {
      columns: [
        {
          text: 'Data source: DVLA and industry databases',
          fontSize: 8,
          color: '#757575',
          alignment: 'left'
        },
        {
          text: `Report generated: ${formatDate(new Date())}`,
          fontSize: 8,
          color: '#757575',
          alignment: 'right'
        }
      ],
      margin: [0, 0, 0, 0]
    }
  );
  
  // Return the complete stack
  return {
    stack: content,
    margin: [0, 0, 0, 20]
  };
};

export default createCoverPage;