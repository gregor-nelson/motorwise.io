import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

const Container = styled('div')`
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
`;

const Header = styled('div')`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
`;

const Title = styled('h2')`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d2939;
`;

const Description = styled('div')`
  color: #6b7280;
  margin-bottom: 1rem;
`;

const SubsectionsList = styled('div')`
  display: grid;
  gap: 1rem;
`;

const SubsectionCard = styled('div')`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  background: white;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    background: #f8faff;
  }
`;

const SubsectionTitle = styled('h3')`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

const SubsectionDescription = styled('p')`
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
`;

const ItemCount = styled('div')`
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
`;

const LoadingState = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  text-align: center;
`;

const Spinner = styled('div')`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorState = styled('div')`
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #991b1b;
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