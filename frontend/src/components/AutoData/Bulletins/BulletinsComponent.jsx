import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { animate, stagger } from 'animejs';

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
    'Transmission': 'text-yellow-600 bg-transparent',
    'Electrical': 'text-yellow-600 bg-transparent',
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
  const [expandedSections, setExpandedSections] = useState({
    problems: true,
    causes: true,
    remedy: true,
    notes: true
  });

  useEffect(() => {
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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-7xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto relative rounded-lg border border-neutral-300">

        {/* Enhanced Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-white hover:bg-neutral-50 w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-lg z-10 border border-neutral-200 hover:border-neutral-300 transition-all duration-200"
        >
          <i className="ph ph-x text-lg"></i>
        </button>
        
        {/* Enhanced Modal Content */}
        <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12">

          {/* Enhanced Header */}
          <div className="mb-10 pr-12">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight mb-6">
              {bulletin.title}
            </h1>

            {/* Match Confidence Warning */}
            {matchConfidence === 'fuzzy' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6">
                <div className="flex items-start gap-3">
                  <i className="ph ph-warning text-yellow-600 text-lg flex-shrink-0"></i>
                  <div>
                    <p className="text-sm font-medium text-yellow-900 mb-1">Partial Match</p>
                    <p className="text-sm text-yellow-800">
                      Results may include bulletins from similar {vehicleMake} models.
                      {metadata?.matched_to && ` Matched to: ${metadata.matched_to}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick overview metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{bulletin.problems ? bulletin.problems.length : 0}</div>
                <div className="text-xs font-medium text-neutral-600">Problems</div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{bulletin.causes ? bulletin.causes.length : 0}</div>
                <div className="text-xs font-medium text-neutral-600">Causes</div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{bulletin.remedy ? '1' : '0'}</div>
                <div className="text-xs font-medium text-neutral-600">Solutions</div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{bulletin.affected_vehicles ? bulletin.affected_vehicles.length : 0}</div>
                <div className="text-xs font-medium text-neutral-600">Models</div>
              </div>
            </div>
          </div>

          {/* Enhanced Affected Vehicles */}
          {bulletin.affected_vehicles && bulletin.affected_vehicles.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start gap-3">
                  <i className="ph ph-car text-xl text-blue-600 flex-shrink-0"></i>
                  <div>
                    <div className="text-base font-semibold text-neutral-900 mb-1">Affected Vehicle Models</div>
                    <div className="text-sm text-neutral-600">Compatible with {bulletin.affected_vehicles.length} model{bulletin.affected_vehicles.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center bg-blue-100 rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold text-blue-600">{bulletin.affected_vehicles.length}</div>
                  <div className="text-xs text-neutral-600 font-medium">Models</div>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {bulletin.affected_vehicles.map((vehicle, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-blue-100">
                      <i className="ph ph-car text-blue-600 text-sm"></i>
                      <span className="text-sm text-neutral-700 truncate">{vehicle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Problems Section */}
          {bulletin.problems && bulletin.problems.length > 0 && (
            <div
              className="bg-red-50 border border-red-100 rounded-lg p-6 cursor-pointer mb-6 hover:border-red-200 transition-colors duration-200"
              onClick={() => toggleSection('problems')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start gap-3">
                  <i className={`${getSectionIcon('problems')} text-xl ${getSectionColor('problems')} flex-shrink-0`}></i>
                  <div>
                    <div className="text-base font-semibold text-neutral-900 mb-1">Problems Identified</div>
                    <div className="text-sm text-neutral-600">{bulletin.problems.length} known issues</div>
                  </div>
                </div>
                <div className="flex flex-col items-center bg-red-100 rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold text-red-600">{bulletin.problems.length}</div>
                  <div className="text-xs text-neutral-600 font-medium">Issues</div>
                </div>
              </div>

              {expandedSections.problems && (
                <div className="pt-4 border-t border-red-200 space-y-2 text-sm text-neutral-700">
                  {bulletin.problems.map((problem, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <i className="ph ph-warning-circle text-red-600 mt-0.5 flex-shrink-0 text-xs"></i>
                      <span>{problem}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={`text-center mt-4 text-red-600 transition-transform duration-200 ${
                expandedSections.problems ? 'rotate-180' : 'rotate-0'
              }`}>
                <i className="ph ph-caret-down text-sm"></i>
              </div>
            </div>
          )}

          {/* Causes Section */}
          {bulletin.causes && bulletin.causes.length > 0 && (
            <div
              className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 cursor-pointer mb-6 hover:border-yellow-200 transition-colors duration-200"
              onClick={() => toggleSection('causes')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start gap-3">
                  <i className={`${getSectionIcon('causes')} text-xl ${getSectionColor('causes')} flex-shrink-0`}></i>
                  <div>
                    <div className="text-base font-semibold text-neutral-900 mb-1">Root Causes</div>
                    <div className="text-sm text-neutral-600">{bulletin.causes.length} identified causes</div>
                  </div>
                </div>
                <div className="flex flex-col items-center bg-yellow-100 rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold text-yellow-600">{bulletin.causes.length}</div>
                  <div className="text-xs text-neutral-600 font-medium">Causes</div>
                </div>
              </div>

              {expandedSections.causes && (
                <div className="pt-4 border-t border-yellow-200 space-y-2 text-sm text-neutral-700">
                  {bulletin.causes.map((cause, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <i className="ph ph-detective text-yellow-600 mt-0.5 flex-shrink-0 text-xs"></i>
                      <span>{cause}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={`text-center mt-4 text-yellow-600 transition-transform duration-200 ${
                expandedSections.causes ? 'rotate-180' : 'rotate-0'
              }`}>
                <i className="ph ph-caret-down text-sm"></i>
              </div>
            </div>
          )}

          {/* Remedy Section */}
          {bulletin.remedy && (
            <div
              className="bg-green-50 border border-green-100 rounded-lg p-6 cursor-pointer mb-6 hover:border-green-200 transition-colors duration-200"
              onClick={() => toggleSection('remedy')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start gap-3">
                  <i className={`${getSectionIcon('remedy')} text-xl ${getSectionColor('remedy')} flex-shrink-0`}></i>
                  <div>
                    <div className="text-base font-semibold text-neutral-900 mb-1">Repair Solution</div>
                    <div className="text-sm text-neutral-600">
                      {bulletin.remedy.parts ? `${bulletin.remedy.parts.length} parts` : 'Solution available'}
                      {bulletin.remedy.steps && ` • ${bulletin.remedy.steps.length} steps`}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-green-100 rounded-lg p-3 min-w-[60px]">
                  <i className="ph ph-check-circle text-2xl text-green-600"></i>
                  <div className="text-xs text-neutral-600 font-medium mt-1">Solution</div>
                </div>
              </div>

              {expandedSections.remedy && (
                <div className="pt-4 border-t border-green-200 space-y-4">

                  {/* Parts Required */}
                  {bulletin.remedy.parts && bulletin.remedy.parts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 mb-2">Parts Required</h4>
                      <div className="bg-white border border-green-100 rounded-lg p-3">
                        <div className="space-y-2">
                          {bulletin.remedy.parts.map((part, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-b-0">
                              <div>
                                <div className="text-sm font-medium text-neutral-900">{part.name}</div>
                                <div className="text-xs text-neutral-600 font-mono">{part.part_number}</div>
                              </div>
                              <div className="text-sm text-neutral-700 font-medium">
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
                      <h4 className="text-sm font-medium text-neutral-900 mb-2">Repair Steps</h4>
                      <div className="space-y-2">
                        {bulletin.remedy.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-sm text-neutral-700">
                            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <span className="pt-0.5">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={`text-center mt-4 text-green-600 transition-transform duration-200 ${
                expandedSections.remedy ? 'rotate-180' : 'rotate-0'
              }`}>
                <i className="ph ph-caret-down text-sm"></i>
              </div>
            </div>
          )}

          {/* Notes Section */}
          {bulletin.notes && bulletin.notes.length > 0 && (
            <div
              className="bg-blue-50 border border-blue-100 rounded-lg p-6 cursor-pointer mb-6 hover:border-blue-200 transition-colors duration-200"
              onClick={() => toggleSection('notes')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start gap-3">
                  <i className={`${getSectionIcon('notes')} text-xl ${getSectionColor('notes')} flex-shrink-0`}></i>
                  <div>
                    <div className="text-base font-semibold text-neutral-900 mb-1">Additional Notes</div>
                    <div className="text-sm text-neutral-600">{bulletin.notes.length} important notes</div>
                  </div>
                </div>
                <div className="flex flex-col items-center bg-blue-100 rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold text-blue-600">{bulletin.notes.length}</div>
                  <div className="text-xs text-neutral-600 font-medium">Notes</div>
                </div>
              </div>

              {expandedSections.notes && (
                <div className="pt-4 border-t border-blue-200 space-y-2 text-sm text-neutral-700">
                  {bulletin.notes.map((note, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <i className="ph ph-info text-blue-600 mt-0.5 flex-shrink-0 text-xs"></i>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={`text-center mt-4 text-blue-600 transition-transform duration-200 ${
                expandedSections.notes ? 'rotate-180' : 'rotate-0'
              }`}>
                <i className="ph ph-caret-down text-sm"></i>
              </div>
            </div>
          )}

          {/* Enhanced Footer */}
          <div className="mt-10 pt-6 border-t border-neutral-200">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <i className="ph ph-shield-check text-blue-600 text-lg"></i>
                <span className="text-sm font-medium text-neutral-900">Professional Advisory</span>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed max-w-2xl mx-auto">
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
 * BulletinList Component - Renders bulletins in accordion/table style layout
 */
const BulletinListView = ({ bulletins, onViewDetails, expandedCards, onToggleCard, cardsRef }) => {
  if (!bulletins || bulletins.length === 0) return null;

  return (
    <div ref={cardsRef} className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
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

        // Get primary problem for collapsed view
        const primaryProblem = bulletin.problems && bulletin.problems.length > 0
          ? bulletin.problems[0]
          : 'No description available';

        // Calculate metrics
        const problemCount = bulletin.problems ? bulletin.problems.length : 0;
        const partCount = bulletin.remedy?.parts ? bulletin.remedy.parts.length : 0;
        const stepCount = bulletin.remedy?.steps ? bulletin.remedy.steps.length : 0;
        const hasFix = !!bulletin.remedy;

        return (
          <div
            key={cardId}
            className="bg-white border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50 transition-colors duration-200"
            style={{ opacity: 0 }}
          >
            {/* Collapsed Row - Dense High-Value Info */}
            <div
              className="py-4 px-6 cursor-pointer"
              onClick={() => onToggleCard(cardId)}
            >
              <div className="flex items-start gap-3 mb-2">
                <i className={`${iconClass} text-lg ${colorClasses.split(' ')[0]} flex-shrink-0 mt-0.5`}></i>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-neutral-600">{category}</span>
                      <span className="text-neutral-300">|</span>
                      <h3 className="text-base font-semibold text-neutral-900 leading-snug">{bulletin.title}</h3>
                    </div>
                  </div>

                  {/* Primary Problem Description - High Value! */}
                  <p className="text-sm text-neutral-700 leading-relaxed mb-2">
                    {primaryProblem}
                  </p>

                  {/* Metrics Row */}
                  <div className="flex items-center gap-3 text-xs text-neutral-600 flex-wrap">
                    <span className="font-medium">{problemCount} {problemCount === 1 ? 'problem' : 'problems'}</span>
                    {partCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{partCount} {partCount === 1 ? 'part' : 'parts'}</span>
                      </>
                    )}
                    {stepCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{stepCount} {stepCount === 1 ? 'step' : 'steps'}</span>
                      </>
                    )}
                    {hasFix && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                          <i className="ph ph-check-circle"></i>
                          Fix
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expand Indicator */}
                <i className={`ph ph-caret-down text-neutral-400 text-sm transition-transform duration-200 flex-shrink-0 mt-1 ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`}></i>
              </div>
            </div>

            {/* Expanded Content - High Value Dense Details */}
            {isExpanded && (
              <div className="px-6 pb-6 space-y-6">

                {/* All Problems Section */}
                {bulletin.problems && bulletin.problems.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ph ph-warning-circle text-red-600 text-base"></i>
                      <h4 className="text-sm font-semibold text-neutral-900">
                        Problems Identified ({problemCount})
                      </h4>
                    </div>
                    <div className="space-y-2 pl-6">
                      {bulletin.problems.map((problem, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                          <span className="text-neutral-400 flex-shrink-0">•</span>
                          <span>{problem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Root Causes Section */}
                {bulletin.causes && bulletin.causes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ph ph-detective text-yellow-600 text-base"></i>
                      <h4 className="text-sm font-semibold text-neutral-900">
                        Root Causes ({bulletin.causes.length})
                      </h4>
                    </div>
                    <div className="space-y-2 pl-6">
                      {bulletin.causes.map((cause, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                          <span className="text-neutral-400 flex-shrink-0">•</span>
                          <span>{cause}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repair Solution Section */}
                {bulletin.remedy && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ph ph-wrench text-green-600 text-base"></i>
                      <h4 className="text-sm font-semibold text-neutral-900">Repair Solution</h4>
                    </div>
                    <div className="pl-6 space-y-3">

                      {/* Parts Required with Names */}
                      {bulletin.remedy.parts && bulletin.remedy.parts.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-neutral-900 mb-2">Parts Required:</p>
                          <div className="space-y-1.5">
                            {bulletin.remedy.parts.map((part, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-neutral-700">
                                <span className="text-neutral-400">•</span>
                                <span>{part.name}</span>
                                <span className="text-xs text-neutral-500">(Qty: {part.quantity || 1})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Repair Complexity */}
                      {bulletin.remedy.steps && (
                        <div className="text-sm text-neutral-600">
                          <span className="font-medium">Repair Steps:</span> {bulletin.remedy.steps.length} steps required
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Important Notes */}
                {bulletin.notes && bulletin.notes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ph ph-info text-blue-600 text-base"></i>
                      <h4 className="text-sm font-semibold text-neutral-900">Important Notes</h4>
                    </div>
                    <div className="space-y-2 pl-6">
                      {bulletin.notes.map((note, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                          <span className="text-neutral-400 flex-shrink-0">•</span>
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Full Details Button */}
                <div className="pt-4 border-t border-neutral-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(cardId);
                    }}
                    className="w-full px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>View Complete Technical Details</span>
                    <i className="ph ph-arrow-right text-base"></i>
                  </button>
                </div>
              </div>
            )}
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
  const [errorType, setErrorType] = useState('service'); // 'service' or 'nodata'
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [matchConfidence, setMatchConfidence] = useState('none');
  const abortControllerRef = useRef(null);

  // Animation refs
  const headerRef = useRef(null);
  const metricsRef = useRef(null);
  const searchRef = useRef(null);
  const navRef = useRef(null);
  const cardsContainerRef = useRef(null);

  // Set custom API base URL if provided
  useEffect(() => {
    if (apiBaseUrl !== '/api/v1') {
      bulletinsApi.baseUrl = apiBaseUrl;
    }
  }, [apiBaseUrl]);

  // Animate components when they mount and data is loaded
  useEffect(() => {
    if (!loading && bulletins) {
      // Animate header
      if (headerRef.current) {
        animate(headerRef.current, {
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 600,
          ease: 'outQuad'
        });
      }

      // Animate metric cards with stagger
      if (metricsRef.current?.children) {
        animate(Array.from(metricsRef.current.children), {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          ease: 'outQuad',
          delay: stagger(100, { start: 200 })
        });
      }

      // Animate search bar
      if (searchRef.current) {
        animate(searchRef.current, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 500,
          ease: 'outQuad',
          delay: 600
        });
      }

      // Animate navigation
      if (navRef.current) {
        animate(navRef.current, {
          opacity: [0, 1],
          scale: [0.95, 1],
          duration: 500,
          ease: 'outQuad',
          delay: 700
        });
      }

      // Animate bulletin cards with stagger
      if (cardsContainerRef.current?.children) {
        animate(Array.from(cardsContainerRef.current.children), {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          ease: 'outQuad',
          delay: stagger(80, { start: 800 })
        });
      }
    }
  }, [loading, bulletins]);

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
    setErrorType('service');
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
        
        // Determine error type based on status code
        if (err.status === 404) {
          setErrorType('nodata');
          setError('No bulletin data available for this vehicle');
        } else {
          setErrorType('service');
          setError(err.message || 'Failed to fetch bulletins');
        }
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
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-6 mx-auto"></div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">Loading Technical Bulletins</h3>
            <p className="text-sm text-neutral-600">
              Analyzing bulletins for <span className="font-medium text-neutral-900">{vehicleMake} {vehicleModel}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state with no bulletins
  if (error && (!bulletins || !bulletins.bulletins || bulletins.bulletins.length === 0)) {
    // Different handling for no data vs service errors
    if (errorType === 'nodata') {
      return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="bg-white border border-neutral-200 rounded-lg p-6 max-w-2xl">
              <div className="flex items-start gap-3">
                <i className="ph ph-database text-blue-600 text-xl flex-shrink-0"></i>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-1">No Data Available</h3>
                  <p className="text-sm text-neutral-700 mb-4">
                    We don't currently have technical bulletin information for <span className="font-medium">{vehicleMake} {vehicleModel}</span>.
                    This doesn't necessarily mean there are no bulletins - we may not have this vehicle in our database yet.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded text-xs text-neutral-700">
                    <i className="ph ph-info text-blue-600"></i>
                    <span>Data coverage varies by vehicle model and year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Service error
      return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="bg-white border border-red-200 rounded-lg p-6 max-w-2xl">
              <div className="flex items-start gap-3">
                <i className="ph ph-warning text-red-600 text-xl flex-shrink-0"></i>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-1">Service Temporarily Unavailable</h3>
                  <p className="text-sm text-neutral-700 mb-4">
                    We're currently unable to retrieve technical bulletins for <span className="font-medium">{vehicleMake} {vehicleModel}</span>.
                    This may be due to temporary maintenance or high demand.
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-2"
                  >
                    <i className="ph ph-arrow-clockwise"></i>
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // No data state
  if (!bulletins || !bulletins.bulletins || bulletins.bulletins.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="bg-white border border-neutral-200 rounded-lg p-6 max-w-2xl">
            <div className="flex items-start gap-3">
              <i className="ph ph-database text-blue-600 text-xl flex-shrink-0"></i>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">No Data Available</h3>
                <p className="text-sm text-neutral-700 mb-4">
                  We don't currently have technical bulletin information for <span className="font-medium">{vehicleMake} {vehicleModel}</span>.
                  This doesn't necessarily mean there are no bulletins - we may not have this vehicle in our database yet.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded text-xs text-neutral-700">
                  <i className="ph ph-info text-blue-600"></i>
                  <span>Data coverage varies by vehicle model and year</span>
                </div>
              </div>
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
          <div ref={headerRef} style={{ opacity: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight mb-4">
              Technical Bulletins for <span className="text-neutral-700">{vehicleMake} {vehicleModel}</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-700 leading-relaxed">
              {vehicleInfo.engine_info && `Engine: ${vehicleInfo.engine_info}. `}
              {vehicleYear && `Year: ${vehicleYear}. `}
              Comprehensive analysis of manufacturer-issued technical bulletins.
            </p>
          </div>

          {/* Prominent Metrics Cards */}
          <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors duration-200" style={{ opacity: 0 }}>
              <div className="flex items-start gap-3 mb-4">
                <i className="ph ph-database text-blue-600 text-xl flex-shrink-0"></i>
                <div className="flex-1">
                  <p className="text-xs text-neutral-600 font-medium uppercase tracking-wide mb-1">Total Bulletins</p>
                  <p className="text-xs text-neutral-500">Available issues</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <div className="text-2xl font-bold text-blue-600">{bulletins.bulletins.length}</div>
                <div className="text-sm text-neutral-600">bulletins</div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors duration-200" style={{ opacity: 0 }}>
              <div className="flex items-start gap-3 mb-4">
                <i className="ph ph-wrench text-blue-600 text-xl flex-shrink-0"></i>
                <div className="flex-1">
                  <p className="text-xs text-neutral-600 font-medium uppercase tracking-wide mb-1">Solutions</p>
                  <p className="text-xs text-neutral-500">Repair available</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <div className="text-2xl font-bold text-blue-600">
                  {bulletins.bulletins.filter(b => b.remedy).length}
                </div>
                <div className="text-sm text-neutral-600">fixes</div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors duration-200" style={{ opacity: 0 }}>
              <div className="flex items-start gap-3 mb-4">
                <i className="ph ph-chart-pie text-blue-600 text-xl flex-shrink-0"></i>
                <div className="flex-1">
                  <p className="text-xs text-neutral-600 font-medium uppercase tracking-wide mb-1">Categories</p>
                  <p className="text-xs text-neutral-500">System types</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <div className="text-2xl font-bold text-blue-600">
                  {sections ? sections.length - 1 : 0}
                </div>
                <div className="text-sm text-neutral-600">types</div>
              </div>
            </div>
          </div>

          {/* Match Confidence Warning */}
          {matchConfidence === 'fuzzy' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6">
              <div className="flex items-start gap-3">
                <i className="ph ph-warning text-yellow-600 text-lg flex-shrink-0"></i>
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">Partial Match</p>
                  <p className="text-sm text-yellow-800">
                    Results may include bulletins from similar {vehicleMake} models.
                    {bulletins.metadata?.matched_to && ` Matched to: ${bulletins.metadata.matched_to}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <i className="ph ph-warning-circle text-red-600 text-lg flex-shrink-0"></i>
                  <div>
                    <p className="text-sm font-medium text-red-900 mb-1">Display Issue</p>
                    <p className="text-sm text-red-800">
                      Some bulletin data may not be displaying correctly. Please try refreshing to reload the information.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 whitespace-nowrap"
                >
                  <i className="ph ph-arrow-clockwise mr-1"></i>
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {hasSections ? (
          <>
            {/* Enhanced Search Bar */}
            <div ref={searchRef} className="mb-10" style={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <i className="ph ph-magnifying-glass text-neutral-400 text-lg"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="Search bulletins by problem, system, or keyword..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-neutral-200 rounded-lg focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors duration-200"
                  />
                </div>
                {searchTerm && (
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-3.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Section Navigation */}
            <div ref={navRef} className="flex justify-center mb-12" style={{ opacity: 0 }}>
              <div className="inline-flex bg-white rounded-lg p-1 border border-neutral-200 shadow-sm overflow-x-auto max-w-full">
                <div className="flex space-x-1">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`
                        flex items-center space-x-2 px-4 md:px-5 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200
                        ${activeSection === section.id
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                        }
                      `}
                    >
                      <i className={`ph ${section.icon} text-base`}></i>
                      <span className="hidden sm:inline">{section.label}</span>
                      <span className="sm:hidden text-xs">{section.label.substring(0, 3)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        activeSection === section.id
                          ? 'bg-neutral-800 text-white'
                          : 'bg-neutral-100 text-neutral-600'
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
              <div className="mb-12 pb-6 border-b-2 border-blue-600">
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight mb-4">
                  {sections.find(s => s.id === activeSection)?.label}
                  {activeSection !== 'overview' && ' Issues'}
                </h2>
                <p className="text-base text-neutral-700 leading-relaxed">
                  {activeSection === 'overview'
                    ? 'All technical bulletins for this vehicle organized by category'
                    : `Technical bulletins related to ${sections.find(s => s.id === activeSection)?.label.toLowerCase()} problems and solutions`
                  }
                </p>
              </div>

              {/* Enhanced Bulletins List */}
              {filteredBulletins.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
                  <i className="ph ph-magnifying-glass text-neutral-300 text-3xl mb-3"></i>
                  <h3 className="text-base font-semibold text-neutral-900 mb-2">
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
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-2"
                    >
                      <i className="ph ph-x"></i>
                      <span>Clear Search</span>
                    </button>
                  )}
                </div>
              ) : (
                <BulletinListView
                  bulletins={filteredBulletins}
                  onViewDetails={handleViewDetails}
                  expandedCards={expandedCards}
                  onToggleCard={handleToggleCard}
                  cardsRef={cardsContainerRef}
                />
              )}
            </div>
          </>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
            <i className="ph ph-info text-neutral-300 text-3xl mb-3"></i>
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Unable to Categorize</h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              The bulletins for this vehicle couldn't be automatically categorized. This may indicate unique or complex issues that require manual review.
            </p>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="mt-16 pt-8 border-t border-neutral-200">
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <i className="ph ph-database text-neutral-400 text-sm"></i>
            <span>Technical bulletins sourced from manufacturer databases • Last updated: March 2025</span>
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