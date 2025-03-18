// Main export file for the PDF generator system

// Core components and utilities
import PDFGeneratorCore, {
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
} from './PDFGeneratorCore';

// Section components
import sectionComponents, {
  createCoverPage,
  createVehicleDetailsSection,
  createMOTHistorySection,
  createVehicleInsightsSection,
  createEnhancedVehicleInsightsSection,
  createMileageInsightsSection,
  createDataSummarySection
} from '../PDF/Components';

// Main generator
import PDFGenerator from '../PdfGenerator';

// Export core utilities
export {
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

// Export section components
export {
  createCoverPage,
  createVehicleDetailsSection,
  createMOTHistorySection,
  createVehicleInsightsSection,
  createEnhancedVehicleInsightsSection,
  createMileageInsightsSection,
  createDataSummarySection,
  sectionComponents
};

// Export core modules
export { PDFGeneratorCore };

// Default export is the main generator
export default PDFGenerator;