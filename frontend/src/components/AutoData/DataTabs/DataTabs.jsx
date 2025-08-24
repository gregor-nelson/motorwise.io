// Refactored AutoDataSection.jsx with vertical layout instead of tabs
import React, { useState, useEffect, useMemo } from 'react';
import TechnicalSpecificationsPage from '../TechSpecs/TechnicalSpecificationsPage';
import VehicleRepairTimesComponent from '../LabourTimes/LabourTimes';
import BulletinsComponent from '../Bulletins/BulletinsComponent';
import VehicleAnalysisComponent from '../AI/VehicleAnalysisComponent';

// Extract year from various possible date fields in vehicleData
const extractManufactureYear = (vehicleData) => {
  if (!vehicleData) return null;
  
  // First check if we already have a year field
  if (vehicleData.year && typeof vehicleData.year === 'number') {
    return vehicleData.year;
  }
  
  // Try different date fields that might contain year information
  const dateFields = [
    'manufactureDate',
    'yearOfManufacture',
    'registrationDate',
    'firstRegisteredDate',
    'firstRegistrationDate'
  ];
  
  for (const field of dateFields) {
    if (vehicleData[field]) {
      // If it's a string, try to extract a 4-digit year
      if (typeof vehicleData[field] === 'string') {
        const yearMatch = /(\d{4})/.exec(vehicleData[field]);
        if (yearMatch) {
          return parseInt(yearMatch[1], 10);
        }
      }
      
      // If it's a number in a reasonable year range
      if (typeof vehicleData[field] === 'number' && 
          vehicleData[field] > 1900 && 
          vehicleData[field] < 2100) {
        return vehicleData[field];
      }
    }
  }
  
  return null;
};

// Normalize fuel type
const normalizeFuelType = (fuelType) => {
  if (!fuelType) return null;
  
  // Convert to lowercase and trim
  const normalized = fuelType.toLowerCase().trim();
  
  // Map common variations to standard values
  if (['gasoline', 'unleaded', 'gas', 'petrol'].includes(normalized)) {
    return 'petrol';
  } else if (['diesel', 'gasoil', 'derv'].includes(normalized)) {
    return 'diesel';
  } else if (['hybrid', 'phev', 'hev'].includes(normalized)) {
    return 'hybrid';
  } else if (['electric', 'ev', 'bev'].includes(normalized)) {
    return 'electric';
  }
  
  // Return as-is for other values
  return normalized;
};

// Main component
const AutoDataSection = ({ vehicleData, loading, error, registration }) => {
  // State for each section's data (keeping the same state variables)
  const [techSpecsData, setTechSpecsData] = useState(null);
  const [labourTimesData, setLabourTimesData] = useState(null);
  const [bulletinsData, setBulletinsData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  // Extract year from vehicle data
  const vehicleYear = useMemo(() => {
    return vehicleData ? extractManufactureYear(vehicleData) : null;
  }, [vehicleData]);

  // Extract and normalize fuel type
  const vehicleFuelType = useMemo(() => {
    if (!vehicleData) return null;
    
    // Try to get fuel type from various possible field names
    const possibleFuelTypeFields = ['fuelType', 'fuel', 'engineFuel', 'engineType'];
    
    for (const field of possibleFuelTypeFields) {
      if (vehicleData[field]) {
        return normalizeFuelType(vehicleData[field]);
      }
    }
    
    // Try to determine from model name
    const model = (vehicleData.model || '').toLowerCase();
    if (/tdi|cdi|hdi|dci|crdi|d4d|jtd|tdci/.test(model)) {
      return 'diesel';
    }
    
    // Try to determine from variant
    const variant = (vehicleData.variant || '').toLowerCase();
    if (/diesel|tdi|cdi|hdi|dci|crdi/.test(variant)) {
      return 'diesel';
    }
    if (/petrol|tsi|gti|vti|mpi/.test(variant)) {
      return 'petrol';
    }
    
    return null;
  }, [vehicleData]);

  // Create enhanced vehicle data object with explicit year and fuel type
  const enhancedVehicleData = useMemo(() => {
    if (!vehicleData) return null;
    
    return {
      ...vehicleData,
      // Only add year if we have one
      ...(vehicleYear && { year: vehicleYear }),
      // Only add fuel type if we have one
      ...(vehicleFuelType && { fuelType: vehicleFuelType })
    };
  }, [vehicleData, vehicleYear, vehicleFuelType]);

  // Handle data load from child components
  const handleTechSpecsDataLoad = React.useCallback((data) => {
    setTechSpecsData(data);
  }, []);

  const handleLabourTimesDataLoad = React.useCallback((data) => {
    setLabourTimesData(data);
  }, []);

  const handleBulletinsDataLoad = React.useCallback((data) => {
    setBulletinsData(data);
  }, []);

  const handleAnalysisDataLoad = React.useCallback((data) => {
    setAnalysisData(data);
  }, []);

  // Log information about the vehicle for debugging
  useEffect(() => {
    if (enhancedVehicleData) {
      console.log('Enhanced vehicle data:', {
        make: enhancedVehicleData.make,
        model: enhancedVehicleData.model,
        year: enhancedVehicleData.year,
        fuelType: enhancedVehicleData.fuelType
      });
    }
  }, [enhancedVehicleData]);

  // If we don't have vehicle data, don't render anything
  if (!enhancedVehicleData) {
    return null;
  }

  // Define sections with metadata for navigation
  const sections = [
    {
      id: 'analysis',
      title: 'Vehicle Analysis',
      icon: 'ph-brain',
      component: (
        <VehicleAnalysisComponent
          registration={registration}
          vehicleData={enhancedVehicleData}
          onDataLoad={handleAnalysisDataLoad}
        />
      )
    },
    {
      id: 'bulletins',
      title: 'Technical Bulletins',
      icon: 'ph-warning-circle',
      component: (
        <BulletinsComponent
          vehicleData={enhancedVehicleData}
          registration={registration}
          onDataLoad={handleBulletinsDataLoad}
        />
      )
    },
    {
      id: 'repair-times',
      title: 'Repair Times',
      icon: 'ph-wrench',
      component: (
        <VehicleRepairTimesComponent
          registration={registration}
          vehicleData={enhancedVehicleData}
          onDataLoad={handleLabourTimesDataLoad}
        />
      )
    },
    {
      id: 'tech-specs',
      title: 'Technical Specifications',
      icon: 'ph-database',
      component: (
        <TechnicalSpecificationsPage
          registration={registration}
          vehicleData={enhancedVehicleData}
          onDataLoad={handleTechSpecsDataLoad}
        />
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Section Content - All sections visible */}
      <div className="space-y-12 mb-16">
        {sections.map((section, index) => (
          <div key={section.id}>
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <i className={`ph ${section.icon} text-2xl text-blue-600`}></i>
                <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight">
                  {section.title}
                </h2>
              </div>
              <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
            </div>

            {/* Section Component */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
              {section.component}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders of the entire component
export default React.memo(AutoDataSection);