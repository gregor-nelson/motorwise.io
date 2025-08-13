import React, { useState, useEffect, Fragment } from 'react';
import {
  DefectDetailContainer,
  DetailContent,
  DefectSectionHeader,
  DefectSection,
  SectionTitle,
  SubTitle,
  BodyText,
  CategoryTag,
  BreadcrumbPath,
  DefectList,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorMessage,
  ResponsiveWrapper
} from './MotDefectDetailStyles';

// API configuration
const isDevelopment = window.location.hostname === 'localhost';
const API_URL = isDevelopment ? 'http://localhost:8002/api/v1' : '/manual-api/v1';

// Preserve original cache and configuration
const manualCache = {};
const CACHE_STALE_TIME = 60 * 60 * 1000; // 1 hour

// Helper functions (preserved from original)
const isCacheValid = (cachedTime) => {
  return (Date.now() - cachedTime) < CACHE_STALE_TIME;
};

const extractDefectId = (text) => {
  const match = /\(?(\d+(?:\.\d+){1,2})\)?/.exec(text);
  return match ? match[1] : null;
};

const formatCategory = (category) => {
  if (!category) return '';
  
  switch(category.toLowerCase()) {
    case 'dangerous':
      return 'Dangerous - Do not drive until repaired';
    case 'major':
      return 'Major - Repair immediately';
    case 'minor':
      return 'Minor - Monitor and repair if necessary';
    case 'advisory':
      return 'Advisory - Monitor';
    default:
      return category;
  }
};
// Clean text formatting function following DVLADataHeader patterns
const formatText = (text) => {
  if (!text) return null;
  
  const paragraphs = text.split(/\n\n+/);
  
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();
        
        // Handle headings with clean typography
        if (trimmed.startsWith('#')) {
          const level = trimmed.match(/^#+/)[0].length;
          const content = trimmed.replace(/^#+\s*/, '');
          
          if (level <= 2) {
            return <SubTitle key={index}>{content}</SubTitle>;
          } else {
            return <SubTitle key={index} as="h4">{content}</SubTitle>;
          }
        }
        
        // Handle lists with clean styling
        if (/^\s*[-*•]\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter(line => /^\s*[-*•]\s/.test(line))
            .map(line => line.replace(/^\s*[-*•]\s+/, '').trim());
          
          return (
            <DefectList key={index}>
              {items.map((item, i) => <li key={i}>{item}</li>)}
            </DefectList>
          );
        }
        
        // Regular paragraphs with clean styling
        return <BodyText key={index}>{trimmed}</BodyText>;
      })}
    </>
  );
};


const MotDefectDetail = ({ defectId, defectText, defectCategory, onNavigateToPath }) => {
  const [defectDetail, setDefectDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the defect ID to use - either from props or extracted from text
  const getDefectIdToUse = () => {
    if (defectId) return defectId;
    return extractDefectId(defectText);
  };

  // Fetch defect details (preserved original logic)
  useEffect(() => {
    const fetchDefectDetail = async () => {
      const idToUse = getDefectIdToUse();
      if (!idToUse) {
        setLoading(false);
        setError('No defect ID could be found');
        return;
      }

      const cacheKey = `defect_${idToUse}`;
      const cachedData = manualCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        setDefectDetail(cachedData.data);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `${API_URL}/manual/defect/${idToUse}`, 
          {
            headers: { 'Accept': 'application/json' },
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin'
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to fetch defect details');
        }
        
        manualCache[cacheKey] = {
          data: data,
          timestamp: Date.now()
        };
        
        setDefectDetail(data);
      } catch (err) {
        console.error('API error:', err);
        setError(err.message || 'Failed to load defect details');
      } finally {
        setLoading(false);
      }
    };

    fetchDefectDetail();
  }, [defectId, defectText]);

  // Clean path breadcrumb following DVLADataHeader patterns
  const renderPath = (path) => {
    if (!path?.length) return null;
    
    return (
      <BreadcrumbPath>
        <strong>Manual section:</strong>{' '}
        {path.map((pathItem, index) => (
          <Fragment key={pathItem.id}>
            {index > 0 && <span>›</span>}
            {onNavigateToPath ? (
              <button
                onClick={() => {
                  const pathParts = pathItem.id.split('.');
                  onNavigateToPath(pathParts);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                {pathItem.title}
              </button>
            ) : (
              pathItem.title
            )}
          </Fragment>
        ))}
      </BreadcrumbPath>
    );
  };

  if (loading) {
    return (
      <ResponsiveWrapper>
        <DefectDetailContainer>
          <DetailContent>
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Loading defect details...</LoadingText>
            </LoadingContainer>
          </DetailContent>
        </DefectDetailContainer>
      </ResponsiveWrapper>
    );
  }

  if (error) {
    return (
      <ResponsiveWrapper>
        <DefectDetailContainer>
          <DetailContent>
            <ErrorContainer>
              <ErrorMessage>{error}</ErrorMessage>
            </ErrorContainer>
          </DetailContent>
        </DefectDetailContainer>
      </ResponsiveWrapper>
    );
  }

  if (!defectDetail) {
    return (
      <ResponsiveWrapper>
        <DefectDetailContainer>
          <DetailContent>
            <ErrorContainer>
              <ErrorMessage>No defect details found</ErrorMessage>
            </ErrorContainer>
          </DetailContent>
        </DefectDetailContainer>
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper>
      <DefectDetailContainer>
        <DetailContent>
          {renderPath(defectDetail.path)}
          
          <DefectSectionHeader>
            {defectDetail.data?.title && (
              <SectionTitle>
                {defectDetail.id}: {defectDetail.data.title}
              </SectionTitle>
            )}
            
            {defectCategory && (
              <CategoryTag category={defectCategory}>
                {formatCategory(defectCategory)}
              </CategoryTag>
            )}
          </DefectSectionHeader>

          <DefectSection>
            {defectDetail.type === 'item' && defectDetail.data?.description && (
              <>
                <SubTitle>Description</SubTitle>
                {formatText(defectDetail.data.description)}
              </>
            )}
            
            {defectDetail.type === 'subsection' && defectDetail.data && (
              <>
                {defectDetail.data.description && (
                  <>
                    <SubTitle>Description</SubTitle>
                    {formatText(defectDetail.data.description)}
                  </>
                )}
                
                {defectDetail.data.items?.length > 0 && (
                  <>
                    <SubTitle>Items in this subsection</SubTitle>
                    <DefectList>
                      {defectDetail.data.items.map((item, index) => (
                        <li key={index}>
                          <strong>{item.id}:</strong> {item.title}
                        </li>
                      ))}
                    </DefectList>
                  </>
                )}
              </>
            )}
            
            {defectDetail.type === 'section' && defectDetail.data && (
              <>
                {defectDetail.data.description && (
                  <>
                    <SubTitle>Description</SubTitle>
                    {formatText(defectDetail.data.description)}
                  </>
                )}
                
                {defectDetail.data.subsections?.length > 0 && (
                  <>
                    <SubTitle>Subsections</SubTitle>
                    <DefectList>
                      {defectDetail.data.subsections.map((subsection, index) => (
                        <li key={index}>
                          <strong>{subsection.id}:</strong> {subsection.title}
                        </li>
                      ))}
                    </DefectList>
                  </>
                )}
              </>
            )}
            
            {defectDetail.matches && (
              <>
                <SubTitle>Multiple entries found</SubTitle>
                <BodyText>Please select a specific entry below:</BodyText>
                <DefectList>
                  {defectDetail.matches.map((match, index) => (
                    <li key={index} style={{ marginBottom: 'var(--space-lg)' }}>
                      <SubTitle as="h4">{match.id}: {match.title}</SubTitle>
                      {match.data.description && (
                        <BodyText style={{ color: 'var(--gray-600)' }}>
                          {match.data.description.substring(0, 150)}
                          {match.data.description.length > 150 ? '...' : ''}
                        </BodyText>
                      )}
                    </li>
                  ))}
                </DefectList>
              </>
            )}
          </DefectSection>
        </DetailContent>
      </DefectDetailContainer>
    </ResponsiveWrapper>
  );
};

export default MotDefectDetail;