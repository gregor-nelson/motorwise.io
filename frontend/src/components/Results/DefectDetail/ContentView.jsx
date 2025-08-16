import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { 
  ContentContainer as Container,
  HeaderSection as Header,
  SectionTitle as Title,
  SmallText as Description,
  CardGrid as ItemsList,
  Card as ItemCard,
  CardTitle as ItemTitle,
  SmallText as ItemDescription,
  CountDisplay as ItemCount,
  PreviewContainer as DefectPreview,
  SmallCategoryBadge as CategoryBadge,
  LoadingContainer as LoadingState,
  LoadingSpinner as Spinner,
  ErrorContainer as ErrorState,
  
} from './defectstyles';
import { fetchSection, fetchSubsection, fetchAllSections } from './apiUtils';

import{ MarketDashTokens as MinimalTokens } from '../../../styles/styles';

// Custom header for subsection view - preserving exact styling from SubsectionView
const SubsectionHeader = styled('div')`
  ${MinimalTokens}
  
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
`;

// Custom defect item styling - preserving exact styling from SubsectionView
const DefectItem = styled('div')`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

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
      <LoadingState>
        <Spinner />
        <p>Loading {viewType}...</p>
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

  if (!contentData) {
    return (
      <Container>
        <ErrorState>No {viewType} data found</ErrorState>
      </Container>
    );
  }

  // Render root view - showing all sections
  if (viewType === 'root') {
    return (
      <Container>
        <Header>
          <Title>
            {contentData.title || 'MOT Manual'}
          </Title>
          
          <Description>
            Select a section to view its subsections and inspection items.
          </Description>
        </Header>

        <ItemsList>
          {contentData.sections?.map((section) => (
            <ItemCard
              key={section.id}
              onClick={() => onNavigateToSection(section.id)}
            >
              <ItemTitle>
                {section.id}: {section.title}
              </ItemTitle>
              
              {section.description && (
                <ItemDescription>
                  {(section.description || '').length > 200 
                    ? `${(section.description || '').substring(0, 200)}...` 
                    : (section.description || '')
                  }
                </ItemDescription>
              )}
              
              <ItemCount>
                {section.subsections?.length || 0} subsections
              </ItemCount>
            </ItemCard>
          ))}
        </ItemsList>
        
        {(!contentData.sections || contentData.sections.length === 0) && (
          <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
            No sections found in the manual.
          </p>
        )}
      </Container>
    );
  }

  // Render section view - preserving exact logic from SectionView
  if (viewType === 'section') {
    return (
      <Container>
        <Header>
          <Title>
            Section {contentData.id}: {contentData.title}
          </Title>
          
          {contentData.description && (
            <Description>
              {contentData.description}
            </Description>
          )}
        </Header>

        <ItemsList>
          {contentData.subsections?.map((subsection) => (
            <ItemCard
              key={subsection.id}
              onClick={() => onNavigateToSubsection(subsection.id)}
            >
              <ItemTitle>
                {subsection.id}: {subsection.title}
              </ItemTitle>
              
              {subsection.description && (
                <ItemDescription>
                  {(subsection.description || '').length > 200 
                    ? `${(subsection.description || '').substring(0, 200)}...` 
                    : (subsection.description || '')
                  }
                </ItemDescription>
              )}
              
              <ItemCount>
                {subsection.items?.length || 0} items
              </ItemCount>
            </ItemCard>
          ))}
        </ItemsList>
        
        {(!contentData.subsections || contentData.subsections.length === 0) && (
          <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
            No subsections found in this section.
          </p>
        )}
      </Container>
    );
  }

  // Render subsection view - preserving exact logic from SubsectionView
  if (viewType === 'subsection') {
    return (
      <Container>
        <SubsectionHeader>
          <Title>
            Subsection {contentData.id}: {contentData.title}
          </Title>
          
          {contentData.description && (
            <Description>
              {contentData.description}
            </Description>
          )}
        </SubsectionHeader>

        <ItemsList>
          {contentData.items?.map((item) => (
            <ItemCard
              key={item.id}
              onClick={() => onNavigateToItem(item.id)}
            >
              <ItemTitle>
                {item.id}: {item.title}
              </ItemTitle>
              
              {item.description && (
                <ItemDescription>
                  {(item.description || '').length > 200 
                    ? `${(item.description || '').substring(0, 200)}...` 
                    : (item.description || '')
                  }
                </ItemDescription>
              )}
              
              <ItemCount>
                {item.defects?.length || 0} defects
              </ItemCount>
              
              {/* Preview first few defects - preserving exact logic from SubsectionView */}
              {item.defects && item.defects.length > 0 && (
                <DefectPreview>
                  {item.defects.slice(0, 3).map((defect, index) => (
                    <DefectItem key={index}>
                      <CategoryBadge category={defect.category}>
                        {defect.category}
                      </CategoryBadge>
                      {(defect.description || '').length > 100 
                        ? `${(defect.description || '').substring(0, 100)}...` 
                        : (defect.description || '')
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
        
        {(!contentData.items || contentData.items.length === 0) && (
          <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
            No items found in this subsection.
          </p>
        )}
      </Container>
    );
  }

  return null;
};

export default ContentView;