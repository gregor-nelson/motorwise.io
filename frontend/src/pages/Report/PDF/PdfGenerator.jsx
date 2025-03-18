import React, { useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { COLORS } from '../../../styles/theme';

// Import core utilities from PDFGeneratorCore
import PDFGeneratorCore, {
  createDocumentDefinition,
  createTableDefinition,
  createKeyValueSection,
  createSection
} from './PDFGeneratorCore';

// Import section components
import {
  createCoverPage,
  createVehicleDetailsSection,
  createMOTHistorySection,
  createVehicleInsightsSection,
  createEnhancedVehicleInsightsSection,
  createMileageInsightsSection,
  createDataSummarySection
} from './Components';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

/**
 * PDFGenerator Component with PDFMake
 * Enhanced formatting for professional appearance
 */
const PDFGenerator = ({ 
  reportData,
  motData,
  insightsData,
  vehicleInsightsData,
  mileageInsightsData,
  buttonStyle,
  buttonClassName,
  buttonText = 'Download PDF Report' 
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  /**
   * Generate the complete PDF document
   */
  const generatePDF = async () => {
    if (!reportData) {
      alert('Report data not available. Please wait for data to load.');
      return;
    }
    
    try {
      setIsGeneratingPdf(true);
      
      // Current timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Create the section components object that will be passed to createDocumentDefinition
      const sectionComponentsObj = {
        createCoverPage,
        createVehicleDetailsSection,
        createMOTHistorySection,
        createVehicleInsightsSection,
        createEnhancedVehicleInsightsSection,
        createMileageInsightsSection,
        createDataSummarySection
      };
      
      // Generate the document definition using PDFGeneratorCore
      const docDefinition = createDocumentDefinition(
        reportData,
        motData,
        insightsData,
        vehicleInsightsData,
        mileageInsightsData,
        sectionComponentsObj
      );
      
      // Generate the filename
      const fileName = `Vehicle_Report_${reportData.registration}_${timestamp}.pdf`;
      
      // Create and download the PDF
      pdfMake.createPdf(docDefinition).download(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was a problem generating your PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Default button styles that can be overridden by props
  const defaultButtonStyle = {
    padding: '10px 20px',
    backgroundColor: COLORS.GREEN,
    color: COLORS.WHITE,
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    ...buttonStyle
  };

  return (
    <button 
      onClick={generatePDF}
      style={defaultButtonStyle}
      className={buttonClassName}
      disabled={isGeneratingPdf}
    >
      {isGeneratingPdf ? 'Generating PDF...' : buttonText}
    </button>
  );
};

export default PDFGenerator;