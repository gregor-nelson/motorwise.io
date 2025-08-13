import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { styled } from '@mui/material/styles';
import MotDefectDetail from './MotDefectDetail';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import SectionView from './SectionView';
import SubsectionView from './SubsectionView';
import SearchInterface from './SearchInterface';
import SearchResults from './SearchResults';

// Mobile-Ready Modal Design - Future-proof foundation
const MinimalTokens = `
  :root {
    --gray-900: #1a1a1a;
    --gray-800: #2d2d2d;
    --gray-700: #404040;
    --gray-600: #525252;
    --gray-500: #737373;
    --gray-400: #a3a3a3;
    --gray-300: #d4d4d4;
    --gray-200: #e5e5e5;
    --gray-100: #f5f5f5;
    --gray-50: #fafafa;
    --white: #ffffff;
    --primary: #3b82f6;
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --transition: all 0.15s ease;
    
    /* Mobile-Ready Breakpoints - Future expansion ready */
    --mobile-max: 767px;
    --tablet-min: 768px;
    --desktop-min: 1024px;
    
    /* Touch Targets - Accessibility standard */
    --touch-target-min: 44px;
    --touch-target-comfortable: 48px;
  }
`;

const MotDefectModalOverlay = styled('div')`
  ${MinimalTokens}
  
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    align-items: stretch;
    /* Future enhancement: Full-screen modal on mobile */
  }
`;

const MotDefectModalContent = styled('div')`
  background: var(--white);
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease;
  font-family: var(--font-main);
  
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  /* Ultra clean scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--gray-400);
  }
  
  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    max-height: 100vh;
    /* Future enhancement: Full-screen experience */
    /* Future enhancement: Optimized mobile scrolling */
  }
`;

const MotDefectModalCloseButton = styled('button')`
  position: absolute;
  top: var(--space-2xl);
  right: var(--space-2xl);
  background: var(--white);
  border: none;
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  color: var(--gray-600);
  z-index: 1;
  transition: var(--transition);
  font-family: var(--font-main);
  
  &:hover {
    color: var(--gray-900);
    background: var(--gray-50);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Mobile Touch Target Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    top: var(--space-xl);
    right: var(--space-xl);
    width: var(--touch-target-comfortable);
    height: var(--touch-target-comfortable);
    font-size: 20px;
    /* Future enhancement: Better mobile positioning */
  }
`;

const MotDefectModal = ({ 
  selectedDefect, 
  onClose 
}) => {
  // Enhanced modal state management
  const [modalState, setModalState] = useState({
    view: 'defect', // 'defect', 'section', 'subsection', 'search'
    currentPath: [],
    searchResults: null,
    navigationHistory: []
  });

  const [manualData, setManualData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset modal state when defect changes
  useEffect(() => {
    if (selectedDefect) {
      setModalState({
        view: 'defect',
        currentPath: [],
        searchResults: null,
        navigationHistory: []
      });
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
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Navigation handlers
  const navigateToPath = (path) => {
    const newHistory = [...modalState.navigationHistory, modalState];
    const pathType = path.length === 1 ? 'section' : path.length === 2 ? 'subsection' : 'defect';
    
    setModalState({
      view: pathType,
      currentPath: path,
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
      searchResults: { query, results },
      navigationHistory: newHistory
    });
  };

  const renderModalContent = () => {
    switch (modalState.view) {
      case 'section':
        return (
          <SectionView 
            sectionId={modalState.currentPath[0]}
            onNavigateToSubsection={(subsectionId) => navigateToPath([modalState.currentPath[0], subsectionId])}
            onNavigateToItem={(itemId) => navigateToPath([modalState.currentPath[0], ...itemId.split('.').slice(1)])}
          />
        );
      
      case 'subsection':
        return (
          <SubsectionView 
            subsectionId={modalState.currentPath.join('.')}
            onNavigateToItem={(itemId) => navigateToPath(itemId.split('.'))}
          />
        );
      
      case 'search':
        return (
          <SearchResults 
            query={modalState.searchResults?.query}
            results={modalState.searchResults?.results}
            onNavigateToResult={(resultId) => {
              const pathParts = resultId.split('.');
              navigateToPath(pathParts);
            }}
          />
        );
      
      case 'defect':
      default:
        return (
          <MotDefectDetail 
            defectId={selectedDefect.id}
            defectText={selectedDefect.text}
            defectCategory={selectedDefect.type}
            onNavigateToPath={navigateToPath}
          />
        );
    }
  };

  if (!selectedDefect) return null;

  return createPortal(
    <MotDefectModalOverlay onClick={handleOverlayClick}>
      <MotDefectModalContent>
        <MotDefectModalCloseButton onClick={onClose} aria-label="Close modal">
          ×
        </MotDefectModalCloseButton>
        
        {/* Ultra Clean Navigation Header - Following DVLADataHeader minimal approach */}
        <div style={{ 
          padding: 'var(--space-2xl) var(--space-2xl) var(--space-xl) var(--space-2xl)',
          borderBottom: '1px solid var(--gray-200)', 
          backgroundColor: 'var(--white)'
        }}>
          <BreadcrumbNavigation 
            currentPath={modalState.currentPath}
            onNavigateToPath={navigateToPath}
            canGoBack={modalState.navigationHistory.length > 0}
            onGoBack={navigateBack}
          />
          
          <SearchInterface 
            onSearch={showSearch}
            contextPath={modalState.currentPath}
          />
        </div>
        
        {/* Dynamic Content Area */}
        {renderModalContent()}
      </MotDefectModalContent>
    </MotDefectModalOverlay>,
    document.body
  );
};

export default MotDefectModal;