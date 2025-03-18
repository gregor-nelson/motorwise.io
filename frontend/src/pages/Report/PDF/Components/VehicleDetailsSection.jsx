import pdfStyles from '../styles/pdfStyles.js';
import { createKeyValueSection } from '../PDFGeneratorCore.jsx';

/**
 * Creates the vehicle details section with enhanced technical information and improved layout
 * Optimized with error handling, fewer conditionals, and deduplication
 */
export const createVehicleDetailsSection = (reportData, resolvedData) => {
  if (!reportData) return [{ text: 'No vehicle details available', style: 'note' }];
  
  const { technicalSpecs } = resolvedData;
  
  // Primary vehicle information (displayed prominently)
  const primaryDetails = [
    ['Registration', reportData.registration || 'Not available'],
    ['Make & Model', reportData.makeModel || 'Not available'],
    ['Colour', reportData.colour || 'Not available'],
    ['Fuel Type', reportData.fuelType || 'Not available'],
    ['First Registration', reportData.firstRegistrationDate || 'Not available'],
    ['Manufacture Date', technicalSpecs.manufactureDate || reportData.manufactureDate || 'Not available']
  ];
  
  // Technical specifications - prefiltered for better performance
  const techDetails = [
    ['Engine Size', technicalSpecs.engineSize],
    ['VIN', technicalSpecs.vin],
    ['Type Approval', technicalSpecs.typeApproval],
    ['Wheel Plan', technicalSpecs.wheelPlan],
    ['Revenue Weight', technicalSpecs.revenueWeight],
    ['CO2 Emissions', technicalSpecs.co2Emissions],
    ['Euro Status', technicalSpecs.euroStatus]
  ].filter(([_, value]) => value != null && value !== '');
  
  // Status information - prefiltered
  const statusDetails = [
    ['MOT Status', reportData.motStatus],
    ['MOT Expiry', reportData.motExpiry],
    ['Tax Status', reportData.taxStatus],
    ['Tax Due Date', reportData.taxDueDate],
    ['Marked For Export', technicalSpecs.markedForExport ? 'Yes' : 'No'],
    ['Last V5C Issued', technicalSpecs.lastV5cIssued]
  ].filter(([_, value]) => value != null && value !== '');
  
  // Build the section content more efficiently
  const sections = [];
  
  // Primary vehicle information
  sections.push({
    stack: [
      { 
        text: 'Primary Vehicle Information', 
        style: 'subheader', 
        margin: [0, 0, 0, 10] 
      },
      createKeyValueSection(primaryDetails, 2)
    ],
    margin: [0, 0, 0, 20]
  });
  
  // Technical specifications - only include if we have data
  if (techDetails.length > 0) {
    sections.push({
      stack: [
        { 
          text: 'Technical Specifications', 
          style: 'subheader', 
          margin: [0, 0, 0, 10] 
        },
        createKeyValueSection(techDetails, 2)
      ],
      margin: [0, 0, 0, 20]
    });
  }
  
  // Status information - only include if we have data
  if (statusDetails.length > 0) {
    sections.push({
      stack: [
        { 
          text: 'Status Information', 
          style: 'subheader', 
          margin: [0, 0, 0, 10] 
        },
        createKeyValueSection(statusDetails, 2)
      ],
      margin: [0, 0, 0, 20]
    });
  }
  
  return sections;
};

export default createVehicleDetailsSection;