import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import MotDefectDetail from './MotDefectDetail';
import NavigationHeader from './NavigationHeader';
import ContentView from './ContentView';
import { 
  ModalOverlay as MotDefectModalOverlay, 
  ModalContent as MotDefectModalContent, 
  ModalCloseButton as MotDefectModalCloseButton 
} from './defectstyles';

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
    <MotDefectModalOverlay onClick={handleOverlayClick}>
      <MotDefectModalContent>
        <MotDefectModalCloseButton 
          onClick={onClose} 
          aria-label="Close defect detail modal"
          title="Close modal (Press Escape)"
        >
          ×
        </MotDefectModalCloseButton>
        
        {/* Navigation Header with Breadcrumbs and Search */}
        <NavigationHeader 
          currentPath={modalState.currentPath}
          onNavigateToPath={navigateToPath}
          canGoBack={modalState.navigationHistory.length > 0}
          onGoBack={navigateBack}
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
      </MotDefectModalContent>
    </MotDefectModalOverlay>,
    document.body
  );
};

export default MotDefectModal;