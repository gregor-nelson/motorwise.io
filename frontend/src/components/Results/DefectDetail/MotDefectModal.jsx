import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import MotDefectDetail from './MotDefectDetail';
import NavigationHeader from './NavigationHeader';
import ContentView from './ContentView';
import { modalClasses, buttonClasses, cn } from './styleUtils';

const MotDefectModal = ({ 
  selectedDefect, 
  onClose 
}) => {
  // Enhanced modal state management with active defect tracking
  const [modalState, setModalState] = useState({
    view: 'defect', // 'defect', 'section', 'subsection', 'search', 'root'
    currentPath: [],
    activeDefectId: null, // Currently viewed defect (can differ from selectedDefect)
    searchResults: null,
    navigationHistory: []
  });

  const [manualData, setManualData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Smart initial state determination based on defect ID
  const determineInitialState = (defect) => {
    if (!defect?.id) {
      return {
        view: 'root',
        currentPath: [],
        activeDefectId: null,
        searchResults: null,
        navigationHistory: []
      };
    }

    // Parse defect ID to determine path (e.g., "1.2.3" -> ["1", "2", "3"])
    const pathParts = defect.id.split('.');
    
    return {
      view: 'defect',
      currentPath: pathParts,
      activeDefectId: defect.id,
      searchResults: null,
      navigationHistory: []
    };
  };

  // Smart modal state initialization when defect changes
  useEffect(() => {
    if (selectedDefect) {
      const initialState = determineInitialState(selectedDefect);
      setModalState(initialState);
    }
  }, [selectedDefect]);
  // Handle escape key and prevent background scroll - only when modal is open
  useEffect(() => {
    if (!selectedDefect) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedDefect, onClose]);

  const handleOverlayClick = (e) => {
    // Only allow overlay click to close on desktop
    if (e.target === e.currentTarget && window.innerWidth > 767) {
      onClose();
    }
  };

  // Navigation handlers
  const navigateToPath = (path) => {
    const newHistory = [...modalState.navigationHistory, modalState];
    
    // Determine view type based on path length
    let viewType;
    if (path.length === 0) {
      viewType = 'root';
    } else if (path.length === 1) {
      viewType = 'section';
    } else if (path.length === 2) {
      viewType = 'subsection';
    } else {
      viewType = 'defect';
    }
    
    setModalState({
      view: viewType,
      currentPath: path,
      activeDefectId: viewType === 'defect' ? path.join('.') : null,
      searchResults: null,
      navigationHistory: newHistory
    });
  };

  // Navigate to specific defect (when clicked from manual tree)
  const navigateToDefect = (defectId) => {
    const pathParts = defectId.split('.');
    const newHistory = [...modalState.navigationHistory, modalState];
    
    setModalState({
      view: 'defect',
      currentPath: pathParts,
      activeDefectId: defectId,
      searchResults: null,
      navigationHistory: newHistory
    });
  };

  const navigateBack = () => {
    if (modalState.navigationHistory.length > 0) {
      const previousState = modalState.navigationHistory[modalState.navigationHistory.length - 1];
      const newHistory = modalState.navigationHistory.slice(0, -1);
      
      setModalState({
        ...previousState,
        navigationHistory: newHistory
      });
    }
  };

  const showSearch = (query, results) => {
    const newHistory = [...modalState.navigationHistory, modalState];
    setModalState({
      view: 'search',
      currentPath: [],
      activeDefectId: null, // Clear active defect when searching
      searchResults: { query, results },
      navigationHistory: newHistory
    });
  };

  const renderModalContent = () => {
    switch (modalState.view) {
      case 'root':
        return (
          <ContentView 
            viewType="root"
            onNavigateToSection={(sectionId) => navigateToPath([sectionId])}
          />
        );

      case 'section':
        return (
          <ContentView 
            viewType="section"
            contentId={modalState.currentPath[0]}
            onNavigateToSubsection={(subsectionId) => navigateToPath(subsectionId.split('.'))}
            onNavigateToItem={(itemId) => navigateToDefect(itemId)}
          />
        );
      
      case 'subsection':
        return (
          <ContentView 
            viewType="subsection"
            contentId={modalState.currentPath.join('.')}
            onNavigateToItem={(itemId) => navigateToDefect(itemId)}
          />
        );
      
      case 'search':
        // Search results are now handled by NavigationHeader
        return null;
      
      case 'defect':
        // Use activeDefectId if available, fallback to selectedDefect for initial load
        const defectToShow = modalState.activeDefectId ? 
          { id: modalState.activeDefectId } : 
          selectedDefect;
          
        return (
          <MotDefectDetail 
            defectId={defectToShow?.id}
            defectText={defectToShow?.text}
            defectCategory={defectToShow?.type}
            onNavigateToPath={navigateToPath}
          />
        );
      
      default:
        return (
          <ContentView 
            viewType="root"
            onNavigateToSection={(sectionId) => navigateToPath([sectionId])}
          />
        );
    }
  };

  if (!selectedDefect) return null;

  return createPortal(
    <div 
      className={modalClasses.overlay}
      onClick={handleOverlayClick}
    >
      <div className={modalClasses.content}>
        {/* Modal Header with Action Buttons */}
        <div className={modalClasses.header}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <i className="ph ph-book-open text-lg text-blue-600"></i>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">MOT Manual Browser</h2>
                <p className="text-sm text-neutral-600">Detailed inspection information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {modalState.navigationHistory.length > 0 && (
                <button 
                  onClick={navigateBack} 
                  title="Go back to previous view"
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 text-sm rounded-lg hover:bg-neutral-200 transition-colors duration-200 cursor-pointer"
                >
                  <i className="ph ph-arrow-left"></i>
                  Back
                </button>
              )}
              <button 
                onClick={onClose} 
                aria-label="Close defect detail modal"
                title="Close modal (Press Escape)"
                className={modalClasses.closeButton}
              >
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Section */}
        <NavigationHeader 
          currentPath={modalState.currentPath}
          onNavigateToPath={navigateToPath}
          onSearch={showSearch}
          contextPath={modalState.currentPath}
          searchResults={modalState.view === 'search' ? modalState.searchResults : null}
          isDefectView={modalState.view === 'defect'}
          activeDefectId={modalState.activeDefectId}
          onNavigateToResult={(resultId) => {
            // Navigate directly to the defect when a search result is clicked
            navigateToDefect(resultId);
          }}
        />
        
        {/* Dynamic Content Area */}
        {renderModalContent()}
      </div>
    </div>,
    document.body
  );
};

export default MotDefectModal;