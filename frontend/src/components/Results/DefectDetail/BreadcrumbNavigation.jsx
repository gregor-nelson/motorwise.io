import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

// Ultra Clean Design System - Minimal approach following DVLADataHeader
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
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --transition: all 0.15s ease;
  }
`;

const BreadcrumbContainer = styled('div')`
  ${MinimalTokens}
  
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-600);
  
  @media (max-width: 767px) {
    margin-bottom: var(--space-md);
    font-size: var(--text-xs);
  }
`;

const BackButton = styled('button')`
  background: none;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  padding: var(--space-xs) var(--space-sm);
  color: var(--gray-700);
  cursor: pointer;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-100);
    border-color: var(--gray-400);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 4px;
  }
  
  @media (max-width: 767px) {
    font-size: var(--text-xs);
    padding: calc(var(--space-xs) * 0.5) var(--space-xs);
  }
`;

const BreadcrumbItem = styled('button')`
  background: none;
  border: none;
  font-family: var(--font-main);
  color: ${props => props.isActive ? 'var(--gray-900)' : 'var(--primary)'};
  cursor: ${props => props.isActive ? 'default' : 'pointer'};
  text-decoration: ${props => props.isActive ? 'none' : 'underline'};
  font-weight: ${props => props.isActive ? '600' : '400'};
  font-size: var(--text-sm);
  padding: 0;
  transition: var(--transition);
  
  &:hover {
    color: ${props => props.isActive ? 'var(--gray-900)' : 'var(--gray-700)'};
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 2px;
  }
  
  @media (max-width: 767px) {
    font-size: var(--text-xs);
  }
`;

const BreadcrumbSeparator = styled('span')`
  color: var(--gray-400);
  user-select: none;
  font-family: var(--font-main);
`;

// API configuration
const isDevelopment = window.location.hostname === 'localhost';
const API_URL = isDevelopment ? 'http://localhost:8002/api/v1' : '/manual-api/v1';

const manualCache = {};
const CACHE_STALE_TIME = 60 * 60 * 1000; // 1 hour

const isCacheValid = (cachedTime) => {
  return (Date.now() - cachedTime) < CACHE_STALE_TIME;
};

const BreadcrumbNavigation = ({ 
  currentPath, 
  onNavigateToPath, 
  canGoBack, 
  onGoBack 
}) => {
  const [pathTitles, setPathTitles] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch titles for path items
  useEffect(() => {
    const fetchPathTitles = async () => {
      if (!currentPath || currentPath.length === 0) {
        setPathTitles({});
        return;
      }

      setLoading(true);
      const newTitles = {};
      
      try {
        // Build path segments to fetch
        const pathsToFetch = [];
        for (let i = 1; i <= currentPath.length; i++) {
          const pathSegment = currentPath.slice(0, i).join('.');
          pathsToFetch.push(pathSegment);
        }

        // Fetch all path segments
        for (const pathSegment of pathsToFetch) {
          const cacheKey = `path_${pathSegment}`;
          let data;

          // Check cache first
          const cachedData = manualCache[cacheKey];
          if (cachedData && isCacheValid(cachedData.timestamp)) {
            data = cachedData.data;
          } else {
            // Determine endpoint based on path depth
            let endpoint;
            const parts = pathSegment.split('.');
            if (parts.length === 1) {
              endpoint = `section/${pathSegment}`;
            } else if (parts.length === 2) {
              endpoint = `subsection/${pathSegment}`;
            } else {
              endpoint = `item/${pathSegment}`;
            }

            try {
              const response = await fetch(`${API_URL}/manual/${endpoint}`, {
                headers: { 'Accept': 'application/json' },
                credentials: isDevelopment ? 'include' : 'same-origin',
                mode: isDevelopment ? 'cors' : 'same-origin'
              });

              if (response.ok) {
                data = await response.json();
                manualCache[cacheKey] = {
                  data: data,
                  timestamp: Date.now()
                };
              }
            } catch (err) {
              console.warn(`Failed to fetch title for ${pathSegment}:`, err);
            }
          }

          if (data) {
            // Extract title based on response structure
            if (data.item) {
              newTitles[pathSegment] = data.item.title;
            } else if (data.title) {
              newTitles[pathSegment] = data.title;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching path titles:', err);
      }

      setPathTitles(newTitles);
      setLoading(false);
    };

    fetchPathTitles();
  }, [currentPath]);

  const renderBreadcrumbs = () => {
    if (!currentPath || currentPath.length === 0) {
      return <span>MOT Manual</span>;
    }

    const breadcrumbs = ['MOT Manual'];
    
    for (let i = 1; i <= currentPath.length; i++) {
      const pathSegment = currentPath.slice(0, i).join('.');
      const title = pathTitles[pathSegment] || pathSegment;
      breadcrumbs.push(title);
    }

    return breadcrumbs.map((title, index) => (
      <React.Fragment key={index}>
        {index > 0 && <BreadcrumbSeparator>›</BreadcrumbSeparator>}
        
        <BreadcrumbItem
          isActive={index === breadcrumbs.length - 1}
          onClick={() => {
            if (index === 0) {
              // Navigate to root - could show sections overview
              onNavigateToPath([]);
            } else {
              // Navigate to that level
              const targetPath = currentPath.slice(0, index);
              onNavigateToPath(targetPath);
            }
          }}
          disabled={index === breadcrumbs.length - 1}
        >
          {loading && index === breadcrumbs.length - 1 ? 'Loading...' : title}
        </BreadcrumbItem>
      </React.Fragment>
    ));
  };

  return (
    <BreadcrumbContainer>
      {canGoBack && (
        <BackButton onClick={onGoBack} title="Go back to previous view">
          ← Back
        </BackButton>
      )}
      
      {renderBreadcrumbs()}
    </BreadcrumbContainer>
  );
};

export default BreadcrumbNavigation;