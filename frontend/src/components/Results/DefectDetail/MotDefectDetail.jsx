import React, { useState, useEffect, Fragment, useRef } from 'react';
import { extractDefectId, formatCategory, fetchDefectDetail } from './apiUtils';
import { 
  getCategoryColors,
  getCategoryIcon,
  cardClasses,
  animationClasses,
  interactionClasses,
  cn
} from './styleUtils';

// Enhanced text parsing for comprehensive defect information
const parseDefectContent = (description) => {
  if (!description) return { overview: null, sections: [] };
  
  const lines = description.split('\n');
  const sections = [];
  let currentSection = null;
  let overview = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for section headers (### format)
    if (line.startsWith('### ')) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: line.replace(/^###\s*/, ''),
        content: [],
        type: 'procedure'
      };
    } else if (currentSection) {
      // Add content to current section
      if (line) {
        currentSection.content.push(line);
      }
    } else {
      // Add to overview if no section is active
      if (line) {
        overview.push(line);
      }
    }
  }
  
  // Add final section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return {
    overview: overview.length > 0 ? overview.join('\n') : null,
    sections
  };
};

// Parse numbered procedures within sections
const parseProcedures = (content) => {
  const steps = [];
  let currentStep = null;
  
  content.forEach(line => {
    // Check for numbered steps
    const stepMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (stepMatch) {
      if (currentStep) {
        steps.push(currentStep);
      }
      currentStep = {
        number: stepMatch[1],
        title: stepMatch[2],
        details: []
      };
    } else if (currentStep && line.trim()) {
      currentStep.details.push(line);
    } else if (!currentStep && line.trim()) {
      // Non-numbered content
      steps.push({
        number: null,
        title: line,
        details: []
      });
    }
  });
  
  if (currentStep) {
    steps.push(currentStep);
  }
  
  return steps;
};

// Enhanced text formatting with cross-reference support
const formatText = (text, onNavigateToPath) => {
  if (!text) return null;
  
  const paragraphs = text.split(/\n\n+/);
  
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();
        
        // Handle headings
        if (trimmed.startsWith('#')) {
          const level = trimmed.match(/^#+/)[0].length;
          const content = trimmed.replace(/^#+\s*/, '');
          
          if (level <= 2) {
            return <h2 key={index} className="text-lg font-medium text-neutral-900 mb-4">{content}</h2>;
          } else {
            return <h4 key={index} className="text-lg font-medium text-neutral-900 mb-4">{content}</h4>;
          }
        }
        
        // Handle lists
        if (/^\s*[-*•]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter(line => 
            /^\s*[-*•]\s/.test(line) || /^\d+\.\s/.test(line)
          ).map(line => line.replace(/^\s*[-*•]\s+/, '').replace(/^\d+\.\s*/, '').trim());
          
          return (
            <ul key={index} className="list-disc pl-5 md:pl-4 space-y-2 mb-3">
              {items.map((item, i) => (
                <li key={i} className="text-sm md:text-xs text-neutral-700 leading-relaxed">{formatCrossReferences(item, onNavigateToPath)}</li>
              ))}
            </ul>
          );
        }
        
        // Regular paragraphs with cross-reference support
        return (
          <p key={index} className="text-xs text-neutral-700 leading-relaxed">
            {formatCrossReferences(trimmed, onNavigateToPath)}
          </p>
        );
      })}
    </>
  );
};

// Format cross-references in text
const formatCrossReferences = (text, onNavigateToPath) => {
  if (!text || !onNavigateToPath) return text;
  
  // Pattern for "Section X.Y.Z" references
  const sectionPattern = /Section\s+(\d+(?:\.\d+)*)/g;
  const parts = text.split(sectionPattern);
  
  return parts.map((part, index) => {
    // If this part matches a section number pattern
    if (index % 2 === 1) {
      const sectionId = part;
      return (
        <button
          key={index}
          onClick={() => {
            const pathParts = sectionId.split('.');
            onNavigateToPath(pathParts);
          }}
          className="bg-none border-none text-blue-600 underline cursor-pointer p-0 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:rounded"
        >
          Section {sectionId}
        </button>
      );
    }
    return part;
  });
};


const MotDefectDetail = ({ defectId, defectText, defectCategory, onNavigateToPath }) => {
  const [defectDetail, setDefectDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    procedures: false,
    defects: true,
    technical: false
  });

  // Toggle section expansion
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Get the defect ID to use - either from props or extracted from text
  const getDefectIdToUse = () => {
    if (defectId) return defectId;
    return extractDefectId(defectText);
  };

  // Fetch defect details using apiUtils
  useEffect(() => {
    const loadDefectDetail = async () => {
      const idToUse = getDefectIdToUse();
      if (!idToUse) {
        setLoading(false);
        setError('No defect ID could be found');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchDefectDetail(idToUse);
        setDefectDetail(data);
      } catch (err) {
        console.error('API error:', err);
        setError(err.message || 'Failed to load defect details');
      } finally {
        setLoading(false);
      }
    };

    loadDefectDetail();
  }, [defectId, defectText]);

  // Clean path breadcrumb following design system patterns
  const renderPath = (path) => {
    if (!path?.length) return null;
    
    return (
      <div className="bg-blue-50 rounded-lg p-4 mb-8 shadow-sm">
        <div className="flex items-start gap-3">
          <i className="ph ph-map-pin text-lg text-blue-600 mt-0.5"></i>
          <div>
            <div className="text-sm font-medium text-neutral-900 mb-2">Manual Location</div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-600">
              {path.map((pathItem, index) => (
                <Fragment key={pathItem.id}>
                  {index > 0 && <i className="ph ph-caret-right text-neutral-400"></i>}
                  {onNavigateToPath ? (
                    <button
                      onClick={() => {
                        const pathParts = pathItem.id.split('.');
                        onNavigateToPath(pathParts);
                      }}
                      className="bg-none border-none text-blue-600 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 py-0.5"
                    >
                      {pathItem.title}
                    </button>
                  ) : (
                    <span className="font-medium">{pathItem.title}</span>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex justify-center items-center min-h-48 flex-col gap-4">
          <div className="w-6 h-6 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-600">Loading defect details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm text-red-600 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!defectDetail) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm text-red-600 text-center">
          No defect details found
        </div>
      </div>
    );
  }

  // Parse the defect content for enhanced display
  const parsedContent = defectDetail?.data?.description ? 
    parseDefectContent(defectDetail.data.description) : 
    { overview: null, sections: [] };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      {renderPath(defectDetail.path)}
      
      <div className="mt-8 mb-12">
        {defectDetail.data?.title && (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
              {defectDetail.id}: {defectDetail.data.title}
            </h1>
            
            {defectCategory && (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm ${getCategoryColors(defectCategory).badge}`}>
                  <i className={`ph ph-${getCategoryIcon(defectCategory)} text-lg`}></i>
                  {formatCategory(defectCategory)}
                </div>
                <div className={`w-3 h-3 rounded-full ${getCategoryColors(defectCategory).text.replace('text-', 'bg-')}`}></div>
              </div>
            )}
          </div>
        )}
      </div>

          {/* Enhanced Comprehensive Defect Information */}
          
        {/* Overview Section */}
        {parsedContent.overview && (
          <div className={cardClasses.expandable} onClick={() => toggleSection('overview')}>
            <div className={interactionClasses.expandableHeader}>
              <div className="flex items-start">
                <i className="ph ph-magnifying-glass text-lg text-blue-600 mr-3 mt-0.5"></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Inspection Overview</div>
                  <div className="text-xs text-neutral-600">Detailed inspection requirements</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-blue-600 transition-transform duration-300 ${
                  expandedSections.overview ? 'rotate-180' : 'rotate-0'
                }`}>
                  <i className="ph ph-caret-down"></i>
                </div>
              </div>
            </div>

            {expandedSections.overview && (
              <div className="pt-3 border-t border-blue-200 space-y-2 text-xs text-neutral-700">
                <div className="prose prose-sm max-w-none text-neutral-700">
                  {formatText(parsedContent.overview, onNavigateToPath)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Testing Procedures Section */}
        {parsedContent.sections.length > 0 && (
          <div className={cardClasses.expandable} onClick={() => toggleSection('procedures')}>
            <div className={interactionClasses.expandableHeader}>
              <div className="flex items-start">
                <i className="ph ph-clipboard-text text-lg text-green-600 mr-3 mt-0.5"></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Testing Procedures</div>
                  <div className="text-xs text-neutral-600">{parsedContent.sections.length} procedure{parsedContent.sections.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-green-600">{parsedContent.sections.length}</div>
                <div className="text-xs text-green-600">procedures</div>
                <div className={`text-green-600 transition-transform duration-300 ${
                  expandedSections.procedures ? 'rotate-180' : 'rotate-0'
                }`}>
                  <i className="ph ph-caret-down"></i>
                </div>
              </div>
            </div>
            {expandedSections.procedures && (
              <div className="pt-3 border-t border-green-200 space-y-2 text-xs text-neutral-700">
                <div className="space-y-8">
                  {parsedContent.sections.map((section, index) => (
                    <div key={index} className="bg-neutral-50 rounded-lg p-6">
                      <h4 className="text-base font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {section.title}
                      </h4>
                      {section.content.length > 0 && (
                        <div className="space-y-4">
                          {parseProcedures(section.content).map((step, stepIndex) => (
                            <div key={stepIndex} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                  {step.number || stepIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-neutral-900 mb-2">
                                    {step.title}
                                  </p>
                                  {step.details.map((detail, detailIndex) => (
                                    <p key={detailIndex} className="text-xs text-neutral-700 leading-relaxed mb-1 last:mb-0">
                                      {formatCrossReferences(detail, onNavigateToPath)}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Defect Categories Section */}
        {defectDetail.data?.defects && defectDetail.data.defects.length > 0 && (
          <div className={cardClasses.expandable} onClick={() => toggleSection('defects')}>
            <div className={interactionClasses.expandableHeader}>
              <div className="flex items-start">
                <i className="ph ph-warning-circle text-lg text-orange-600 mr-3 mt-0.5"></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Defect Categories</div>
                  <div className="text-xs text-neutral-600">{defectDetail.data.defects.length} possible defect{defectDetail.data.defects.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-orange-600">{defectDetail.data.defects.length}</div>
                <div className="text-xs text-orange-600">defects</div>
                <div className={`text-orange-600 transition-transform duration-300 ${
                  expandedSections.defects ? 'rotate-180' : 'rotate-0'
                }`}>
                  <i className="ph ph-caret-down"></i>
                </div>
              </div>
            </div>

            {expandedSections.defects && (
              <div className="pt-3 border-t border-orange-200 space-y-2 text-xs text-neutral-700">
                <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow-sm">
                  <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                    <i className="ph ph-info text-lg"></i>
                    All possible defect categories and their specific criteria for this inspection item
                  </p>
                </div>
                
                <div className="grid gap-6">
                  {/* Group defects by category */}
                  {['Dangerous', 'Major', 'Minor', 'Advisory'].map(category => {
                    const categoryDefects = defectDetail.data.defects.filter(
                      defect => defect.category?.toLowerCase() === category.toLowerCase()
                    );
                    
                    if (categoryDefects.length === 0) return null;
                    
                    const colors = getCategoryColors(category);
                    
                    return (
                      <div key={category} className={`${colors.bg} rounded-lg p-4 md:p-6 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-8 h-8 ${colors.text.replace('text-', 'bg-')} rounded-full flex items-center justify-center`}>
                            <i className={`ph ph-${getCategoryIcon(category)} text-white text-lg`}></i>
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-neutral-900 uppercase tracking-wide">
                              {category}
                            </h4>
                            <p className="text-xs text-neutral-600">{categoryDefects.length} criteria</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {categoryDefects.map((defect, index) => (
                            <div key={index} className="bg-white/70 rounded-lg p-4 shadow-sm">
                              <p className="text-xs text-neutral-700 leading-relaxed">
                                {formatCrossReferences(defect.description, onNavigateToPath)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Technical Requirements Section */}
        {(defectDetail.type === 'item' && defectDetail.data?.description?.includes('%')) && (
          <div className={cardClasses.expandable} onClick={() => toggleSection('technical')}>
            <div className={interactionClasses.expandableHeader}>
              <div className="flex items-start">
                <i className="ph ph-chart-bar text-lg text-purple-600 mr-3 mt-0.5"></i>
                <div>
                  <div className="text-sm font-medium text-neutral-900">Technical Requirements & Calculations</div>
                  <div className="text-xs text-neutral-600">Efficiency percentages and technical thresholds</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-purple-600 transition-transform duration-300 ${
                  expandedSections.technical ? 'rotate-180' : 'rotate-0'
                }`}>
                  <i className="ph ph-caret-down"></i>
                </div>
              </div>
            </div>

            {expandedSections.technical && (
              <div className="pt-3 border-t border-purple-200 space-y-2 text-xs text-neutral-700">
                <div className="bg-neutral-50 p-4 md:p-6 rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium text-neutral-900 mb-4">Efficiency Requirements</h4>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    Specific efficiency percentages and technical thresholds are detailed in the inspection procedures above.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback for other content types */}
        {defectDetail.type === 'subsection' && defectDetail.data && (
          <div className="space-y-12 mb-16">
            {defectDetail.data.items?.length > 0 && (
              <div className={cardClasses.base}>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Items in this subsection</h3>
                <div className="space-y-3">
                  {defectDetail.data.items.map((item, index) => (
                    <div key={index} className="bg-neutral-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-neutral-900">{item.id}:</span>
                      <span className="text-xs text-neutral-700 ml-2">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {defectDetail.type === 'section' && defectDetail.data && (
          <div className="space-y-12 mb-16">
            {defectDetail.data.subsections?.length > 0 && (
              <div className={cardClasses.base}>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Subsections</h3>
                <div className="space-y-3">
                  {defectDetail.data.subsections.map((subsection, index) => (
                    <div key={index} className="bg-neutral-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-neutral-900">{subsection.id}:</span>
                      <span className="text-xs text-neutral-700 ml-2">{subsection.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {defectDetail.matches && (
          <div className="space-y-12 mb-16">
            <div className={cardClasses.base}>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Multiple entries found</h3>
              <p className="text-xs text-neutral-700 leading-relaxed mb-6">Please select a specific entry below:</p>
              <div className="space-y-6">
                {defectDetail.matches.map((match, index) => (
                  <div key={match.id || index} className="bg-neutral-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-neutral-900 mb-2">{match.id}: {match.title}</h4>
                    {match.data?.description && (
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {(match.data.description || '').substring(0, 150)}
                        {(match.data.description || '').length > 150 ? '...' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default MotDefectDetail;