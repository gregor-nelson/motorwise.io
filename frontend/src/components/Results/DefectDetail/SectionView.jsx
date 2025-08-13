import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

// Mobile-Ready Design System - Future-proof foundation
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
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
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

const Container = styled('div')`
  ${MinimalTokens}
  
  font-family: var(--font-main);
  background: var(--white);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--gray-900);
  line-height: 1.6;

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-xl) var(--space-md);
    /* Future mobile enhancements can be added here */
  }
`;

const Header = styled('div')`
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--gray-200);

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    margin-bottom: var(--space-xl);
    /* Future mobile enhancements can be added here */
  }
`;

const Title = styled('h2')`
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  font-family: var(--font-main);
  line-height: 1.2;
  letter-spacing: -0.02em;

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xl);
    /* Future mobile enhancements can be added here */
  }
`;

const Description = styled('div')`
  color: var(--gray-600);
  margin-bottom: var(--space-md);
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: 1.4;

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-sm);
    /* Future mobile enhancements can be added here */
  }
`;

const SubsectionsList = styled('div')`
  display: grid;
  gap: var(--space-lg);

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    gap: var(--space-md);
    /* Future mobile enhancements can be added here */
  }
`;

const SubsectionCard = styled('div')`
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  padding: var(--space-lg);
  cursor: pointer;
  transition: var(--transition);
  background: var(--white);
  min-height: var(--touch-target-min);
  
  &:hover {
    border-color: var(--primary);
    background: var(--gray-50);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    /* Future mobile enhancements can be added here */
  }
`;

const SubsectionTitle = styled('h3')`
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  font-family: var(--font-main);
  line-height: 1.2;

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-base);
    /* Future mobile enhancements can be added here */
  }
`;

const SubsectionDescription = styled('p')`
  margin: 0 0 var(--space-md) 0;
  color: var(--gray-600);
  font-size: var(--text-sm);
  font-family: var(--font-main);
  line-height: 1.4;

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xs);
    /* Future mobile enhancements can be added here */
  }
`;

const ItemCount = styled('div')`
  font-size: var(--text-xs);
  color: var(--gray-500);
  font-weight: 500;
  font-family: var(--font-main);

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    /* Future mobile enhancements can be added here */
  }
`;

const LoadingState = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3xl) var(--space-xl);
  text-align: center;
  color: var(--gray-600);
  font-family: var(--font-main);

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-2xl) var(--space-lg);
    /* Future mobile enhancements can be added here */
  }
`;

const Spinner = styled('div')`
  width: 24px;
  height: 24px;
  border: 2px solid var(--gray-200);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-lg);
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    /* Future mobile enhancements can be added here */
  }
`;

const ErrorState = styled('div')`
  padding: var(--space-lg);
  text-align: center;
  color: var(--negative);
  font-family: var(--font-main);
  font-size: var(--text-base);
  line-height: 1.5;

  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    font-size: var(--text-sm);
    /* Future mobile enhancements can be added here */
  }
`;

// API configuration
const isDevelopment = window.location.hostname === 'localhost';
const API_URL = isDevelopment ? 'http://localhost:8002/api/v1' : '/manual-api/v1';

const manualCache = {};
const CACHE_STALE_TIME = 60 * 60 * 1000; // 1 hour

const isCacheValid = (cachedTime) => {
  return (Date.now() - cachedTime) < CACHE_STALE_TIME;
};

const SectionView = ({ 
  sectionId, 
  onNavigateToSubsection, 
  onNavigateToItem 
}) => {
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSectionData = async () => {
      if (!sectionId) return;

      const cacheKey = `section_${sectionId}`;
      const cachedData = manualCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        setSectionData(cachedData.data);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/manual/section/${sectionId}`, {
          headers: { 'Accept': 'application/json' },
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch section: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        manualCache[cacheKey] = {
          data: data,
          timestamp: Date.now()
        };
        
        setSectionData(data);
      } catch (err) {
        console.error('Section fetch error:', err);
        setError(err.message || 'Failed to load section');
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, [sectionId]);

  if (loading) {
    return (
      <LoadingState>
        <Spinner />
        <p>Loading section...</p>
      </LoadingState>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorState>Error: {error}</ErrorState>
      </Container>
    );
  }

  if (!sectionData) {
    return (
      <Container>
        <ErrorState>No section data found</ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          Section {sectionData.id}: {sectionData.title}
        </Title>
        
        {sectionData.description && (
          <Description>
            {sectionData.description}
          </Description>
        )}
      </Header>

      <SubsectionsList>
        {sectionData.subsections?.map((subsection) => (
          <SubsectionCard
            key={subsection.id}
            onClick={() => onNavigateToSubsection(subsection.id)}
          >
            <SubsectionTitle>
              {subsection.id}: {subsection.title}
            </SubsectionTitle>
            
            {subsection.description && (
              <SubsectionDescription>
                {subsection.description.length > 200 
                  ? `${subsection.description.substring(0, 200)}...` 
                  : subsection.description
                }
              </SubsectionDescription>
            )}
            
            <ItemCount>
              {subsection.items?.length || 0} items
            </ItemCount>
          </SubsectionCard>
        ))}
      </SubsectionsList>
      
      {(!sectionData.subsections || sectionData.subsections.length === 0) && (
        <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
          No subsections found in this section.
        </p>
      )}
    </Container>
  );
};

export default SectionView;