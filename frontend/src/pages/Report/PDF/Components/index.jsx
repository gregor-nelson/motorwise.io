// Component exports
import createCoverPage from './CoverPage';
import createVehicleDetailsSection from './VehicleDetailsSection';
import createMOTHistorySection from './MOTHistorySection';
import createVehicleInsightsSection from './VehicleInsightsSection';
import createEnhancedVehicleInsightsSection from './EnhancedVehicleInsightsSection';
import createMileageInsightsSection from './MileageInsightsSection';
import createDataSummarySection from './DataSummarySection';

// Export all components as a single object for easy use
export const sectionComponents = {
  createCoverPage,
  createVehicleDetailsSection,
  createMOTHistorySection,
  createVehicleInsightsSection,
  createEnhancedVehicleInsightsSection,
  createMileageInsightsSection, 
  createDataSummarySection
};

// Individual exports for flexibility
export {
  createCoverPage,
  createVehicleDetailsSection,
  createMOTHistorySection,
  createVehicleInsightsSection,
  createEnhancedVehicleInsightsSection,
  createMileageInsightsSection,
  createDataSummarySection
};

export default sectionComponents;