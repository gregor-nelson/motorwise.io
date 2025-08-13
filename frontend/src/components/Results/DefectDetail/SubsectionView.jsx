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

const ItemsList = styled('div')`
  display: grid;
  gap: 1rem;
`;

const ItemCard = styled('div')`
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

const ItemTitle = styled('h3')`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

const ItemDescription = styled('p')`
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
`;

const DefectCount = styled('div')`
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
`;

const DefectPreview = styled('div')`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 4px;
  border-left: 3px solid #e5e7eb;
`;

const DefectItem = styled('div')`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryBadge = styled('span')`
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-right: 0.5rem;
  background: ${props => {
    switch(props.category?.toLowerCase()) {
      case 'dangerous': return '#dc2626';
      case 'major': return '#ea580c';
      case 'minor': return '#16a34a';
      case 'advisory': return '#6b7280';
      default: return '#3b82f6';
    }
  }};
  color: white;
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

const SubsectionView = ({ 
  subsectionId, 
  onNavigateToItem 
}) => {
  const [subsectionData, setSubsectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubsectionData = async () => {
      if (!subsectionId) return;

      const cacheKey = `subsection_${subsectionId}`;
      const cachedData = manualCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        setSubsectionData(cachedData.data);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/manual/subsection/${subsectionId}`, {
          headers: { 'Accept': 'application/json' },
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch subsection: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        manualCache[cacheKey] = {
          data: data,
          timestamp: Date.now()
        };
        
        setSubsectionData(data);
      } catch (err) {
        console.error('Subsection fetch error:', err);
        setError(err.message || 'Failed to load subsection');
      } finally {
        setLoading(false);
      }
    };

    fetchSubsectionData();
  }, [subsectionId]);

  if (loading) {
    return (
      <LoadingState>
        <Spinner />
        <p>Loading subsection...</p>
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

  if (!subsectionData) {
    return (
      <Container>
        <ErrorState>No subsection data found</ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          Subsection {subsectionData.id}: {subsectionData.title}
        </Title>
        
        {subsectionData.description && (
          <Description>
            {subsectionData.description}
          </Description>
        )}
      </Header>

      <ItemsList>
        {subsectionData.items?.map((item) => (
          <ItemCard
            key={item.id}
            onClick={() => onNavigateToItem(item.id)}
          >
            <ItemTitle>
              {item.id}: {item.title}
            </ItemTitle>
            
            {item.description && (
              <ItemDescription>
                {item.description.length > 200 
                  ? `${item.description.substring(0, 200)}...` 
                  : item.description
                }
              </ItemDescription>
            )}
            
            <DefectCount>
              {item.defects?.length || 0} defects
            </DefectCount>
            
            {/* Preview first few defects */}
            {item.defects && item.defects.length > 0 && (
              <DefectPreview>
                {item.defects.slice(0, 3).map((defect, index) => (
                  <DefectItem key={index}>
                    <CategoryBadge category={defect.category}>
                      {defect.category}
                    </CategoryBadge>
                    {defect.description.length > 100 
                      ? `${defect.description.substring(0, 100)}...` 
                      : defect.description
                    }
                  </DefectItem>
                ))}
                {item.defects.length > 3 && (
                  <DefectItem style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>
                    ... and {item.defects.length - 3} more defects
                  </DefectItem>
                )}
              </DefectPreview>
            )}
          </ItemCard>
        ))}
      </ItemsList>
      
      {(!subsectionData.items || subsectionData.items.length === 0) && (
        <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
          No items found in this subsection.
        </p>
      )}
    </Container>
  );
};

export default SubsectionView;