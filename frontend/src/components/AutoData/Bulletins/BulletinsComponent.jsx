import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Import shared components
import {
  SharedLoadingState,
  SharedErrorState,
  SharedEmptyState,
  SharedMatchWarning,
} from '../shared/CommonElements';

// Import custom tooltip components
import { HeadingWithTooltip } from '../../../styles/tooltip';

// Import API client
import bulletinsApi from '../api/BulletinsApiClient';

// Helper function to extract vehicle year
const extractVehicleYear = (vehicleData) => {
  if (!vehicleData) return null;
  
  if (vehicleData.year && typeof vehicleData.year === 'number') {
    return vehicleData.year;
  }
  
  const dateFields = [
    'manufactureDate',
    'yearOfManufacture', 
    'registrationDate',
    'firstRegisteredDate',
    'firstRegistrationDate'
  ];
  
  for (const field of dateFields) {
    if (vehicleData[field]) {
      if (typeof vehicleData[field] === 'string') {
        const yearMatch = /(\d{4})/.exec(vehicleData[field]);
        if (yearMatch) {
          return parseInt(yearMatch[1], 10);
        }
      }
      
      if (typeof vehicleData[field] === 'number' && 
          vehicleData[field] > 1900 && 
          vehicleData[field] < 2100) {
        return vehicleData[field];
      }
    }
  }
  
  return null;
};

// Helper function to group bulletins by category
const groupBulletinsByCategory = (bulletins) => {
  if (!bulletins || !Array.isArray(bulletins)) return {};
  
  const categories = {};
  
  bulletins.forEach(bulletin => {
    // Determine category based on bulletin content
    let category = 'General';
    
    if (bulletin.problems && Array.isArray(bulletin.problems)) {
      const problemText = bulletin.problems.join(' ').toLowerCase();
      
      if (problemText.includes('engine') || problemText.includes('motor')) {
        category = 'Engine';
      } else if (problemText.includes('brake') || problemText.includes('stopping')) {
        category = 'Brakes';
      } else if (problemText.includes('transmission') || problemText.includes('gearbox')) {
        category = 'Transmission';
      } else if (problemText.includes('electrical') || problemText.includes('battery') || problemText.includes('light')) {
        category = 'Electrical';
      } else if (problemText.includes('suspension') || problemText.includes('steering')) {
        category = 'Suspension & Steering';
      } else if (problemText.includes('fuel') || problemText.includes('injection')) {
        category = 'Fuel System';
      } else if (problemText.includes('cooling') || problemText.includes('radiator') || problemText.includes('overheat')) {
        category = 'Cooling System';
      } else if (problemText.includes('exhaust') || problemText.includes('emission')) {
        category = 'Exhaust System';
      } else if (problemText.includes('air condition') || problemText.includes('hvac') || problemText.includes('climate')) {
        category = 'Climate Control';
      } else if (problemText.includes('body') || problemText.includes('door') || problemText.includes('window')) {
        category = 'Body & Interior';
      }
    }
    
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(bulletin);
  });
  
  return categories;
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  const icons = {
    'Engine': 'ph-engine',
    'Brakes': 'ph-disc', 
    'Transmission': 'ph-gear',
    'Electrical': 'ph-lightning',
    'Suspension & Steering': 'ph-steering-wheel',
    'Fuel System': 'ph-drop',
    'Cooling System': 'ph-thermometer',
    'Exhaust System': 'ph-cloud',
    'Climate Control': 'ph-snowflake',
    'Body & Interior': 'ph-car',
    'General': 'ph-wrench'
  };
  return icons[category] || 'ph-wrench';
};

// Helper function to get category color classes
const getCategoryColorClasses = (category) => {
  const colors = {
    'Engine': 'text-blue-600 bg-blue-50',
    'Brakes': 'text-red-600 bg-red-50',
    'Transmission': 'text-yellow-600 bg-yellow-50',
    'Electrical': 'text-yellow-600 bg-yellow-50',
    'Suspension & Steering': 'text-green-600 bg-green-50',
    'Fuel System': 'text-blue-600 bg-blue-50',
    'Cooling System': 'text-green-600 bg-green-50',
    'Exhaust System': 'text-neutral-600 bg-neutral-50',
    'Climate Control': 'text-blue-600 bg-blue-50',
    'Body & Interior': 'text-neutral-600 bg-neutral-50',
    'General': 'text-neutral-600 bg-neutral-50'
  };
  return colors[category] || 'text-neutral-600 bg-neutral-50';
};

/**
 * BulletinDetailModal Component - Full Screen Modal with Design System Styling
 */
const BulletinDetailModal = ({ 
  bulletin, 
  onClose, 
  matchConfidence, 
  metadata, 
  vehicleMake, 
  vehicleModel 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    problems: true,
    causes: true,
    remedy: true,
    notes: true
  });

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSectionIcon = (section) => {
    const icons = {
      problems: 'ph-warning-circle',
      causes: 'ph-detective',
      remedy: 'ph-wrench',
      notes: 'ph-info'
    };
    return icons[section] || 'ph-info';
  };

  const getSectionColor = (section) => {
    const colors = {
      problems: 'text-red-600',
      causes: 'text-yellow-600', 
      remedy: 'text-green-600',
      notes: 'text-blue-600'
    };
    return colors[section] || 'text-blue-600';
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
    >
      <div className={`bg-white w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto relative rounded-lg md:rounded-xl shadow-2xl transform transition-all duration-500 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
      }`}>
        
        {/* Enhanced Close Button */}
        <button 
          onClick={onClose} 
          aria-label="Close modal"
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-white w-12 h-12 flex items-center justify-center cursor-pointer text-xl text-neutral-600 hover:text-neutral-900 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-300 z-10 shadow-lg hover:shadow-xl hover:scale-110"
        >
          <i className="ph ph-x"></i>
        </button>
        
        {/* Enhanced Modal Content */}
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          
          {/* Enhanced Header */}
          <div className="mb-6 md:mb-8 pr-12">
            <HeadingWithTooltip 
              tooltip="Technical bulletin with detailed information about vehicle issues and fixes"
            >
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight mb-4">
                {bulletin.title}
              </h1>
            </HeadingWithTooltip>
            
            <SharedMatchWarning 
              matchConfidence={matchConfidence} 
              metadata={metadata} 
              vehicleMake={vehicleMake} 
              vehicleModel={vehicleModel} 
            />
            
            {/* Quick overview metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{bulletin.problems ? bulletin.problems.length : 0}</div>
                <div className="text-xs text-neutral-600">Problems</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-600">{bulletin.causes ? bulletin.causes.length : 0}</div>
                <div className="text-xs text-neutral-600">Causes</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{bulletin.remedy ? '1' : '0'}</div>
                <div className="text-xs text-neutral-600">Solutions</div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-neutral-600">{bulletin.affected_vehicles ? bulletin.affected_vehicles.length : 0}</div>
                <div className="text-xs text-neutral-600">Models</div>
              </div>
            </div>
          </div>

          {/* Enhanced Affected Vehicles */}
          {bulletin.affected_vehicles && bulletin.affected_vehicles.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                    <i className="ph ph-car text-lg text-blue-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Affected Vehicle Models</div>
                    <div className="text-xs text-neutral-600">Compatible with {bulletin.affected_vehicles.length} model{bulletin.affected_vehicles.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-blue-600">{bulletin.affected_vehicles.length}</div>
                  <div className="text-xs text-blue-600">Models</div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-blue-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-neutral-700">
                  {bulletin.affected_vehicles.map((vehicle, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-white rounded-md p-2">
                      <i className="ph ph-car text-blue-600 flex-shrink-0"></i>
                      <span className="truncate">{vehicle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Problems Section */}
          {bulletin.problems && bulletin.problems.length > 0 && (
            <div 
              className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer mb-8"
              onClick={() => toggleSection('problems')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className={`${getSectionIcon('problems')} text-lg ${getSectionColor('problems')} mr-3 mt-0.5`}></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Problems Identified</div>
                    <div className="text-xs text-neutral-600">{bulletin.problems.length} known issues</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-red-600">{bulletin.problems.length}</div>
                  <div className="text-xs text-red-600">Issues</div>
                </div>
              </div>
              
              {expandedSections.problems && (
                <div className="pt-3 border-t border-red-200 space-y-3 text-xs text-neutral-700">
                  {bulletin.problems.map((problem, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <i className="ph ph-warning-circle text-red-600 mt-0.5 flex-shrink-0"></i>
                      <span>{problem}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`text-center mt-3 text-red-600 transition-transform duration-300 ${
                expandedSections.problems ? 'rotate-180' : 'rotate-0'
              }`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
          )}

          {/* Causes Section */}
          {bulletin.causes && bulletin.causes.length > 0 && (
            <div 
              className="bg-yellow-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer mb-8"
              onClick={() => toggleSection('causes')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className={`${getSectionIcon('causes')} text-lg ${getSectionColor('causes')} mr-3 mt-0.5`}></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Root Causes</div>
                    <div className="text-xs text-neutral-600">{bulletin.causes.length} identified causes</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-yellow-600">{bulletin.causes.length}</div>
                  <div className="text-xs text-yellow-600">Causes</div>
                </div>
              </div>
              
              {expandedSections.causes && (
                <div className="pt-3 border-t border-yellow-200 space-y-3 text-xs text-neutral-700">
                  {bulletin.causes.map((cause, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <i className="ph ph-detective text-yellow-600 mt-0.5 flex-shrink-0"></i>
                      <span>{cause}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`text-center mt-3 text-yellow-600 transition-transform duration-300 ${
                expandedSections.causes ? 'rotate-180' : 'rotate-0'
              }`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
          )}

          {/* Remedy Section */}
          {bulletin.remedy && (
            <div 
              className="bg-green-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer mb-8"
              onClick={() => toggleSection('remedy')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className={`${getSectionIcon('remedy')} text-lg ${getSectionColor('remedy')} mr-3 mt-0.5`}></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Repair Solution</div>
                    <div className="text-xs text-neutral-600">
                      {bulletin.remedy.parts ? `${bulletin.remedy.parts.length} parts` : 'Solution available'}
                      {bulletin.remedy.steps && ` • ${bulletin.remedy.steps.length} steps`}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold text-green-600">
                    <i className="ph ph-check-circle"></i>
                  </div>
                  <div className="text-xs text-green-600">Solution</div>
                </div>
              </div>
              
              {expandedSections.remedy && (
                <div className="pt-3 border-t border-green-200 space-y-6">
                  
                  {/* Parts Required */}
                  {bulletin.remedy.parts && bulletin.remedy.parts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 mb-3">Parts Required</h4>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="space-y-3">
                          {bulletin.remedy.parts.map((part, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-b-0">
                              <div>
                                <div className="text-xs font-medium text-neutral-900">{part.name}</div>
                                <div className="text-xs text-neutral-600 font-mono">{part.part_number}</div>
                              </div>
                              <div className="text-xs text-neutral-700 font-medium">
                                Qty: {part.quantity || 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Repair Steps */}
                  {bulletin.remedy.steps && bulletin.remedy.steps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 mb-3">Repair Steps</h4>
                      <div className="space-y-3">
                        {bulletin.remedy.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-3 text-xs text-neutral-700">
                            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <span className="pt-1">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className={`text-center mt-3 text-green-600 transition-transform duration-300 ${
                expandedSections.remedy ? 'rotate-180' : 'rotate-0'
              }`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
          )}

          {/* Notes Section */}
          {bulletin.notes && bulletin.notes.length > 0 && (
            <div 
              className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer mb-8"
              onClick={() => toggleSection('notes')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <i className={`${getSectionIcon('notes')} text-lg ${getSectionColor('notes')} mr-3 mt-0.5`}></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Additional Notes</div>
                    <div className="text-xs text-neutral-600">{bulletin.notes.length} important notes</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-blue-600">{bulletin.notes.length}</div>
                  <div className="text-xs text-blue-600">Notes</div>
                </div>
              </div>
              
              {expandedSections.notes && (
                <div className="pt-3 border-t border-blue-200 space-y-3 text-xs text-neutral-700">
                  {bulletin.notes.map((note, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <i className="ph ph-info text-blue-600 mt-0.5 flex-shrink-0"></i>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`text-center mt-3 text-blue-600 transition-transform duration-300 ${
                expandedSections.notes ? 'rotate-180' : 'rotate-0'
              }`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
          )}
          
          {/* Enhanced Footer */}
          <div className="mt-12 pt-6 border-t-2 border-neutral-100">
            <div className="bg-neutral-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <i className="ph ph-shield-check text-blue-600"></i>
                <span className="text-sm font-medium text-neutral-900">Professional Advisory</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl mx-auto">
                This technical bulletin is provided based on manufacturer information. 
                Always consult with a qualified technician before attempting any repairs to ensure safety and warranty compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * BulletinList Component - Renders bulletins with expandable cards following design system
 */
const BulletinListView = ({ bulletins, onViewDetails, expandedCards, onToggleCard }) => {
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!bulletins || bulletins.length === 0) return null;

  return (
    <div 
      ref={componentRef}
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {bulletins.map((bulletin, index) => {
        // Determine category for color coding
        let category = 'General';
        if (bulletin.problems && Array.isArray(bulletin.problems)) {
          const problemText = bulletin.problems.join(' ').toLowerCase();
          if (problemText.includes('engine')) category = 'Engine';
          else if (problemText.includes('brake')) category = 'Brakes';
          else if (problemText.includes('transmission')) category = 'Transmission';
          else if (problemText.includes('electrical')) category = 'Electrical';
        }
        
        const colorClasses = getCategoryColorClasses(category);
        const iconClass = getCategoryIcon(category);
        const cardId = bulletin.id || index;
        const isExpanded = expandedCards[cardId];
        
        return (
          <div 
            key={cardId}
            className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
            onClick={() => onToggleCard(cardId)}
            style={{ 
              animationDelay: `${index * 100}ms`,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              opacity: isVisible ? 1 : 0,
              transition: `all 500ms ease-out ${index * 100}ms`
            }}
          >
            {/* Enhanced Card header with metrics */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-start flex-1">
                <div className={`flex items-center justify-center w-10 h-10 ${colorClasses.split(' ')[1]} rounded-full mr-3 group-hover:scale-110 transition-all duration-300`}>
                  <i className={`${iconClass} text-lg ${colorClasses.split(' ')[0]}`}></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-900 mb-1 leading-tight">{bulletin.title}</div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses}`}>
                      {category}
                    </div>
                    {bulletin.remedy && (
                      <div className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        <i className="ph ph-check-circle mr-1"></i>Fix Available
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <div className={`text-xl font-bold ${colorClasses.split(' ')[0]}`}>
                  {bulletin.problems ? bulletin.problems.length : 1}
                </div>
                <div className={`text-xs ${colorClasses.split(' ')[0]}`}>Issues</div>
              </div>
            </div>

            {/* Enhanced problem display */}
            {bulletin.problems && bulletin.problems.length > 0 && (
              <div className="bg-neutral-50 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2 text-xs text-neutral-700 leading-relaxed">
                  <i className="ph ph-warning-circle text-red-600 mt-0.5 flex-shrink-0"></i>
                  <div className="flex-1">
                    <span className="font-medium text-neutral-900">Primary Issue: </span>
                    {bulletin.problems[0]}
                    {bulletin.problems.length > 1 && (
                      <div className="mt-1 text-blue-600 font-medium">
                        +{bulletin.problems.length - 1} additional problems
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced quick stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {bulletin.affected_vehicles && bulletin.affected_vehicles.length > 0 && (
                <div className="flex items-center space-x-2">
                  <i className="ph ph-car text-blue-600"></i>
                  <div>
                    <div className="text-xs font-medium text-neutral-900">{bulletin.affected_vehicles.length}</div>
                    <div className="text-xs text-neutral-600">Models</div>
                  </div>
                </div>
              )}
              
              {bulletin.remedy && bulletin.remedy.parts && bulletin.remedy.parts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <i className="ph ph-wrench text-green-600"></i>
                  <div>
                    <div className="text-xs font-medium text-neutral-900">{bulletin.remedy.parts.length}</div>
                    <div className="text-xs text-neutral-600">Parts</div>
                  </div>
                </div>
              )}
              
              {bulletin.remedy && bulletin.remedy.steps && bulletin.remedy.steps.length > 0 && (
                <div className="flex items-center space-x-2">
                  <i className="ph ph-list-checks text-yellow-600"></i>
                  <div>
                    <div className="text-xs font-medium text-neutral-900">{bulletin.remedy.steps.length}</div>
                    <div className="text-xs text-neutral-600">Steps</div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced expandable content */}
            {isExpanded && (
              <div className="pt-4 border-t-2 border-blue-100 space-y-4 transition-all duration-500 ease-out">
                
                {/* All problems */}
                {bulletin.problems && bulletin.problems.length > 1 && (
                  <div>
                    <div className="text-xs font-medium text-neutral-900 mb-2">All Problems:</div>
                    <div className="space-y-1">
                      {bulletin.problems.slice(1).map((problem, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-neutral-700">
                          <i className="ph ph-warning-circle text-red-600 mt-0.5 flex-shrink-0"></i>
                          <span>{problem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affected vehicles */}
                {bulletin.affected_vehicles && bulletin.affected_vehicles.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-neutral-900 mb-2">Affected Models:</div>
                    <div className="text-xs text-neutral-700 space-y-1">
                      {bulletin.affected_vehicles.slice(0, 3).map((vehicle, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <i className="ph ph-car text-blue-600 flex-shrink-0"></i>
                          <span>{vehicle}</span>
                        </div>
                      ))}
                      {bulletin.affected_vehicles.length > 3 && (
                        <div className="text-neutral-500 ml-5">+{bulletin.affected_vehicles.length - 3} more models</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick remedy info */}
                {bulletin.remedy && (
                  <div>
                    <div className="text-xs font-medium text-neutral-900 mb-2">Remedy Available:</div>
                    <div className="flex items-center space-x-4 text-xs text-neutral-600">
                      {bulletin.remedy.parts && (
                        <div className="flex items-center space-x-1">
                          <i className="ph ph-wrench text-green-600"></i>
                          <span>{bulletin.remedy.parts.length} parts required</span>
                        </div>
                      )}
                      {bulletin.remedy.steps && (
                        <div className="flex items-center space-x-1">
                          <i className="ph ph-list-checks text-green-600"></i>
                          <span>{bulletin.remedy.steps.length} steps</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Enhanced CTA button */}
                <div className="pt-3 border-t border-neutral-100">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(cardId);
                    }}
                    className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
                  >
                    <i className="ph ph-eye text-base"></i>
                    <span>View Complete Analysis</span>
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced expand indicator */}
            <div className={`text-center mt-4 transition-all duration-300 ${
              isExpanded ? 'text-blue-600' : 'text-neutral-400 group-hover:text-blue-600'
            }`}>
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-blue-50 transition-all duration-300 ${
                isExpanded ? 'rotate-180 bg-blue-50' : 'rotate-0'
              }`}>
                <i className="ph ph-caret-down"></i>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Main BulletinsComponent - Refactored to use unified design pattern
 */
const BulletinsComponent = ({
  vehicleData = null,
  make,
  model,
  engineCode = null,
  year = null,
  apiBaseUrl = '/api/v1',
  loading: initialLoading = false,
  error: initialError = null,
  onDataLoad
}) => {
  // States
  const [activeSection, setActiveSection] = useState('overview');
  const [bulletins, setBulletins] = useState(null);
  const [allBulletins, setAllBulletins] = useState(null);
  const [loading, setLoading] = useState(initialLoading || true);
  const [error, setError] = useState(initialError);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [matchConfidence, setMatchConfidence] = useState('none');
  const abortControllerRef = useRef(null);

  // Set custom API base URL if provided
  useEffect(() => {
    if (apiBaseUrl !== '/api/v1') {
      bulletinsApi.baseUrl = apiBaseUrl;
    }
  }, [apiBaseUrl]);

  // Determine vehicle properties based on either vehicleData object or individual props
  const vehicleMake = vehicleData?.make || make;
  const vehicleModel = vehicleData?.model || vehicleData?.vehicleModel || model;
  const vehicleYear = vehicleData ? extractVehicleYear(vehicleData) : year;
  const vehicleEngineCode = vehicleData?.engineCode || vehicleData?.engine_code || engineCode;

  // Handle section change
  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  // Handle card toggle
  const handleToggleCard = useCallback((cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  }, []);

  // Handle search
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setExpandedCards({});
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Handle view details
  const handleViewDetails = useCallback((bulletinId) => {
    setSelectedBulletin(bulletinId);
  }, []);

  // Handle close modal
  const handleCloseModal = useCallback(() => {
    setSelectedBulletin(null);
  }, []);

  // Load bulletins when vehicle information changes
  useEffect(() => {
    if (!vehicleMake || !vehicleModel) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSelectedBulletin(null);
    setSearchTerm('');
    setMatchConfidence('none');

    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const loadBulletins = async () => {
      try {
        let data;
        
        if (vehicleData) {
          data = await bulletinsApi.lookupBulletins(vehicleData);
        } else {
          data = await bulletinsApi.getBulletins(vehicleMake, vehicleModel, vehicleEngineCode, vehicleYear);
        }
        
        if (data && data.bulletins) {
          setBulletins(data);
          setAllBulletins(data);
          
          // Determine match confidence from metadata
          if (data.metadata?.matched_to) {
            setMatchConfidence('fuzzy');
          } else {
            setMatchConfidence('exact');
          }
          
          // Call onDataLoad if provided
          if (onDataLoad) {
            onDataLoad(data);
          }
        } else {
          setError('Invalid data format received from server');
        }
        setLoading(false);
      } catch (err) {
        // Don't handle aborted requests as errors
        if (err.name === 'AbortError') {
          return;
        }
        
        setError(err.message || 'Failed to fetch bulletins');
        setLoading(false);
      }
    };
    
    loadBulletins();
    
    // Cleanup function to abort any pending requests when unmounting
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [vehicleMake, vehicleModel, vehicleEngineCode, vehicleYear, vehicleData, onDataLoad]);

  // Group bulletins by category and create sections
  const sections = useMemo(() => {
    if (!bulletins?.bulletins) return [];
    
    const categorizedBulletins = groupBulletinsByCategory(bulletins.bulletins);
    
    const sectionData = Object.entries(categorizedBulletins).map(([category, categoryBulletins]) => ({
      id: category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      label: category,
      icon: getCategoryIcon(category),
      colorClasses: getCategoryColorClasses(category),
      bulletins: categoryBulletins,
      count: categoryBulletins.length
    })).sort((a, b) => b.count - a.count);
    
    // Add overview section
    return [{
      id: 'overview',
      label: 'Overview',
      icon: 'ph-chart-pie',
      colorClasses: 'text-blue-600 bg-blue-50',
      bulletins: bulletins.bulletins,
      count: bulletins.bulletins.length
    }, ...sectionData];
  }, [bulletins]);

  // Filter bulletins based on search term and active section
  const filteredBulletins = useMemo(() => {
    const currentSection = sections.find(s => s.id === activeSection);
    if (!currentSection) return [];
    
    let bulletsToFilter = currentSection.bulletins;
    
    if (!searchTerm) {
      return bulletsToFilter || [];
    }

    const searchTermLower = searchTerm.toLowerCase();
    return bulletsToFilter.filter(bulletin =>
      bulletin.title.toLowerCase().includes(searchTermLower) ||
      (bulletin.problems &&
        bulletin.problems.some(p => p.toLowerCase().includes(searchTermLower)))
    );
  }, [sections, activeSection, searchTerm]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <i className="ph ph-database text-3xl text-blue-600 animate-pulse"></i>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Loading Technical Bulletins</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">Analyzing bulletins for <span className="font-medium">{vehicleMake} {vehicleModel}</span></p>
            <div className="mt-4 w-48 h-2 bg-neutral-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with no bulletins
  if (error && (!bulletins || !bulletins.bulletins || bulletins.bulletins.length === 0)) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <i className="ph ph-warning-circle text-3xl text-red-600"></i>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Connection Issue</h3>
            <p className="text-sm text-neutral-700 leading-relaxed mb-6 max-w-md mx-auto">{error}</p>
            <button 
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <i className="ph ph-arrow-clockwise mr-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!bulletins || !bulletins.bulletins || bulletins.bulletins.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <i className="ph ph-check-circle text-3xl text-green-600"></i>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">No Issues Found</h3>
            <p className="text-sm text-neutral-700 leading-relaxed max-w-lg mx-auto">
              Great news! No technical bulletins found for <span className="font-medium">{vehicleMake} {vehicleModel}</span>.
              <br className="hidden sm:block" />
              This suggests your vehicle has no known widespread technical issues.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-neutral-500">
              <i className="ph ph-shield-check text-green-600"></i>
              <span>Vehicle reliability confirmed</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vehicleInfo = bulletins.metadata || bulletins.vehicle_info || {};
  const hasSections = sections && sections.length > 0;

  // Find the current bulletin if in detail view
  const currentBulletin = selectedBulletin !== null
    ? bulletins.bulletins.find((b, index) => (b.id || index) === selectedBulletin)
    : null;

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Enhanced Header with Metrics */}
        <div className="space-y-8 mb-16">
          <div>
            <HeadingWithTooltip 
              tooltip="Technical bulletins for your vehicle, based on manufacturer data"
            >
              <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight mb-4">
                Technical Bulletins for {vehicleMake} {vehicleModel}
              </h1>
            </HeadingWithTooltip>
            <p className="text-sm text-neutral-700 leading-relaxed mb-6">
              {vehicleInfo.engine_info && `Engine: ${vehicleInfo.engine_info}. `}
              {vehicleYear && `Year: ${vehicleYear}. `}
              Comprehensive analysis of manufacturer-issued technical bulletins.
            </p>
          </div>
          
          {/* Prominent Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-blue-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <i className="ph ph-database text-lg text-blue-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Total Bulletins</div>
                    <div className="text-xs text-neutral-600">Available issues</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{bulletins.bulletins.length}</div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <i className="ph ph-wrench text-lg text-green-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Solutions</div>
                    <div className="text-xs text-neutral-600">Repair available</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {bulletins.bulletins.filter(b => b.remedy).length}
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <i className="ph ph-chart-pie text-lg text-yellow-600 mr-3 mt-0.5"></i>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Categories</div>
                    <div className="text-xs text-neutral-600">System types</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {sections ? sections.length - 1 : 0}
                </div>
              </div>
            </div>
          </div>

          <SharedMatchWarning 
            matchConfidence={matchConfidence} 
            metadata={bulletins.metadata} 
            vehicleMake={vehicleMake} 
            vehicleModel={vehicleModel} 
          />

          {error && (
            <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <i className="ph ph-warning-circle text-yellow-600"></i>
                <span className="text-sm font-medium text-neutral-900">Notice</span>
              </div>
              <p className="text-xs text-neutral-700 mt-2">{error}</p>
            </div>
          )}
        </div>

        {hasSections ? (
          <>
            {/* Enhanced Search Bar */}
            <div className="mb-8">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search bulletins by problem, system, or keyword..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-4 pl-12 pr-12 text-sm rounded-lg bg-white border-none focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm hover:shadow-md transition-all duration-300 placeholder-neutral-400"
                />
                <i className="ph ph-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors duration-300"></i>
                {searchTerm && (
                  <button
                    onClick={handleClearFilters}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 hover:scale-110 transition-all duration-300"
                  >
                    <i className="ph ph-x"></i>
                  </button>
                )}
              </div>
              {filteredBulletins.length > 0 && (
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-neutral-600">
                    {searchTerm ? (
                      <><i className="ph ph-funnel text-blue-600 mr-2"></i>{filteredBulletins.length} results found</>
                    ) : (
                      <><i className="ph ph-list text-neutral-500 mr-2"></i>{filteredBulletins.length} bulletins available</>
                    )}
                  </p>
                  {searchTerm && (
                    <button 
                      onClick={handleClearFilters}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:scale-105 transition-all duration-300"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Section Navigation */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-neutral-100 rounded-lg p-1 shadow-sm overflow-x-auto max-w-full">
                <div className="flex space-x-1 px-1">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`
                        flex items-center space-x-2 px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 whitespace-nowrap
                        ${activeSection === section.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-white hover:shadow-sm'
                        }
                      `}
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        opacity: 1,
                        transform: 'translateY(0)',
                        transition: `all 300ms ease-out ${index * 50}ms`
                      }}
                    >
                      <i className={`ph ${section.icon} text-base`}></i>
                      <span className="hidden sm:inline">{section.label}</span>
                      <span className="sm:hidden text-xs">{section.label.substring(0, 3)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        activeSection === section.id 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        {section.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div>
              {/* Section Header */}
              <div className="mb-8 pb-4 border-b-2 border-blue-600">
                <h2 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
                  {sections.find(s => s.id === activeSection)?.label} 
                  {activeSection !== 'overview' && ' Issues'}
                </h2>
                <p className="text-xs text-neutral-600">
                  {activeSection === 'overview' 
                    ? 'All technical bulletins for this vehicle organized by category'
                    : `Technical bulletins related to ${sections.find(s => s.id === activeSection)?.label.toLowerCase()} problems and solutions`
                  }
                </p>
              </div>

              {/* Enhanced Bulletins List */}
              {filteredBulletins.length === 0 ? (
                <div className="bg-neutral-50 rounded-lg p-8 md:p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
                    <i className="ph ph-magnifying-glass text-2xl text-neutral-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    {searchTerm ? 'No Results Found' : 'No Bulletins Available'}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4 max-w-md mx-auto">
                    {searchTerm 
                      ? `No bulletins match your search "${searchTerm}". Try different keywords or browse other categories.`
                      : `No bulletins found in this category. This indicates no known issues for this system.`
                    }
                  </p>
                  {searchTerm && (
                    <button 
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300"
                    >
                      <i className="ph ph-x mr-2"></i>Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <BulletinListView 
                  bulletins={filteredBulletins}
                  onViewDetails={handleViewDetails}
                  expandedCards={expandedCards}
                  onToggleCard={handleToggleCard}
                />
              )}
            </div>
          </>
        ) : (
          <div className="bg-neutral-50 rounded-lg p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
              <i className="ph ph-info text-2xl text-neutral-400"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Unable to Categorize</h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              The bulletins for this vehicle couldn't be automatically categorized. This may indicate unique or complex issues that require manual review.
            </p>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="mt-16 pt-6 border-t-2 border-neutral-100">
          <div className="bg-neutral-50 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <i className="ph ph-database text-blue-600"></i>
              <span className="text-sm font-medium text-neutral-900">Data Source</span>
            </div>
            <p className="text-xs text-neutral-600 mb-2">
              Technical bulletins sourced from official manufacturer databases and service information systems.
            </p>
            <div className="text-xs text-neutral-500">Last updated: March 2025</div>
          </div>
        </div>
      </div>
      
      {/* Render modal if bulletin is selected */}
      {selectedBulletin !== null && currentBulletin && (
        <BulletinDetailModal 
          bulletin={currentBulletin}
          onClose={handleCloseModal}
          matchConfidence={matchConfidence}
          metadata={bulletins.metadata}
          vehicleMake={vehicleMake}
          vehicleModel={vehicleModel}
        />
      )}
    </>
  );
};

export default React.memo(BulletinsComponent);