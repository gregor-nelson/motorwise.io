import React, { useState, useEffect, useRef } from 'react';
import { fetchSection, fetchSubsection, fetchAllSections } from './apiUtils';
import { 
  getCategoryColors,
  getCategoryIcon,
  cardClasses,
  animationClasses,
  scrollAnimationClasses,
  interactionClasses,
  cn 
} from './styleUtils';

const ContentView = ({ 
  viewType, // 'root', 'section', or 'subsection'
  contentId, 
  onNavigateToSection, 
  onNavigateToSubsection, 
  onNavigateToItem 
}) => {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data;
        if (viewType === 'root') {
          data = await fetchAllSections();
        } else if (viewType === 'section') {
          if (!contentId) return;
          data = await fetchSection(contentId);
        } else if (viewType === 'subsection') {
          if (!contentId) return;
          data = await fetchSubsection(contentId);
        } else {
          throw new Error('Invalid view type');
        }
        
        setContentData(data);
      } catch (err) {
        console.error(`${viewType} fetch error:`, err);
        setError(err.message || `Failed to load ${viewType}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [contentId, viewType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-48 flex-col gap-6">
        <div className="w-8 h-8 border-3 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-lg font-medium text-neutral-700 mb-1">Loading {viewType}...</p>
          <p className="text-sm text-neutral-500">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-red-50 rounded-lg p-4 md:p-6 shadow-sm text-red-600 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <i className="ph ph-warning-circle text-2xl text-red-600"></i>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Content</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!contentData) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-neutral-50 rounded-lg p-4 md:p-6 shadow-sm text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <i className="ph ph-file-x text-2xl text-neutral-600"></i>
            <h3 className="text-lg font-semibold text-neutral-900">No Data Found</h3>
          </div>
          <p className="text-neutral-600">No {viewType} data found</p>
        </div>
      </div>
    );
  }

  // Render root view - showing all sections
  if (viewType === 'root') {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="mt-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className={interactionClasses.iconContainer('bg-blue')}>
              <i className="ph ph-book-open text-xl text-blue-600"></i>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
                {contentData.title || 'MOT Manual'}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Select a section to view its subsections and inspection items
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contentData.sections?.map((section, index) => (
            <div
              key={section.id}
              className={cardClasses.interactive}
              onClick={() => onNavigateToSection(section.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">{section.id}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">
                    {section.title}
                  </h3>
                  
                  {section.description && (
                    <p className="text-xs text-neutral-700 leading-relaxed mb-4">
                      {(section.description || '').length > 180 
                        ? `${(section.description || '').substring(0, 180)}...` 
                        : (section.description || '')
                      }
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <i className="ph ph-folder text-sm text-neutral-500"></i>
                    <span className="text-xs text-neutral-600 font-medium">
                      {section.subsections?.length || 0} subsection{(section.subsections?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 mt-4">
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold text-blue-600">{section.subsections?.length || 0}</div>
                  <div className="text-xs text-blue-600">subsections</div>
                </div>
                <i className="ph ph-arrow-right text-lg text-blue-600"></i>
              </div>
            </div>
          ))}
        </div>
        
        {(!contentData.sections || contentData.sections.length === 0) && (
          <p className="text-center text-neutral-600 italic">
            No sections found in the manual.
          </p>
        )}
      </div>
    );
  }

  // Render section view - preserving exact logic from SectionView
  if (viewType === 'section') {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="mt-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className={interactionClasses.iconContainer('bg-green')}>
              <i className="ph ph-folder-open text-xl text-green-600"></i>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
                Section {contentData.id}: {contentData.title}
              </h1>
              {contentData.description && (
                <p className="text-sm text-neutral-600 mt-2 max-w-3xl">
                  {contentData.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contentData.subsections?.map((subsection, index) => (
            <div
              key={subsection.id}
              className={cardClasses.section('green')}
              onClick={() => onNavigateToSubsection(subsection.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-green-600">{subsection.id.split('.')[1]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">
                    {subsection.title}
                  </h3>
                  
                  {subsection.description && (
                    <p className="text-xs text-neutral-700 leading-relaxed mb-4">
                      {(subsection.description || '').length > 180 
                        ? `${(subsection.description || '').substring(0, 180)}...` 
                        : (subsection.description || '')
                      }
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <i className="ph ph-list text-sm text-neutral-500"></i>
                    <span className="text-xs text-neutral-600 font-medium">
                      {subsection.items?.length || 0} inspection item{(subsection.items?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 mt-4">
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold text-green-600">{subsection.items?.length || 0}</div>
                  <div className="text-xs text-green-600">items</div>
                </div>
                <i className="ph ph-arrow-right text-lg text-green-600"></i>
              </div>
            </div>
          ))}
        </div>
        
        {(!contentData.subsections || contentData.subsections.length === 0) && (
          <p className="text-center text-neutral-600 italic">
            No subsections found in this section.
          </p>
        )}
      </div>
    );
  }

  // Render subsection view - preserving exact logic from SubsectionView
  if (viewType === 'subsection') {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="mt-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className={interactionClasses.iconContainer('bg-orange')}>
              <i className="ph ph-list-checks text-xl text-orange-600"></i>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
                Subsection {contentData.id}: {contentData.title}
              </h1>
              {contentData.description && (
                <p className="text-sm text-neutral-600 mt-2 max-w-3xl">
                  {contentData.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contentData.items?.map((item, index) => (
            <div
              key={item.id}
              className={cardClasses.section('orange')}
              onClick={() => onNavigateToItem(item.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-orange-600">{item.id.split('.')[2]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-xs text-neutral-700 leading-relaxed mb-4">
                      {(item.description || '').length > 160 
                        ? `${(item.description || '').substring(0, 160)}...` 
                        : (item.description || '')
                      }
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ph ph-warning text-sm text-neutral-500"></i>
                    <span className="text-xs text-neutral-600 font-medium">
                      {item.defects?.length || 0} possible defect{(item.defects?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Preview first few defects */}
              {item.defects && item.defects.length > 0 && (
                <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    {item.defects.slice(0, 2).map((defect, index) => {
                      const colors = getCategoryColors(defect.category);
                      return (
                        <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <i className={`ph ph-${getCategoryIcon(defect.category)} text-sm`}></i>
                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', colors.badge)}>
                              {defect.category}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 leading-relaxed">
                            {(defect.description || '').length > 120 
                              ? `${(defect.description || '').substring(0, 120)}...` 
                              : (defect.description || '')
                            }
                          </p>
                        </div>
                      );
                    })}
                    {item.defects.length > 2 && (
                      <div className="text-center py-2">
                        <span className="text-xs text-neutral-500 italic">
                          +{item.defects.length - 2} more defect{item.defects.length - 2 !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 mt-4">
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold text-orange-600">{item.defects?.length || 0}</div>
                  <div className="text-xs text-orange-600">defects</div>
                </div>
                <i className="ph ph-arrow-right text-lg text-orange-600"></i>
              </div>
            </div>
          ))}
        </div>
        
        {(!contentData.items || contentData.items.length === 0) && (
          <p className="text-center text-neutral-600 italic">
            No items found in this subsection.
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default ContentView;