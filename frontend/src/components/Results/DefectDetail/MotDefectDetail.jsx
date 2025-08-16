import React, { useState, useEffect, Fragment } from 'react';
import {
  DefectDetailContainer,
  SectionHeader as DefectSectionHeader,
  Section as DefectSection,
  SectionTitle,
  SubTitle,
  BodyText,
  CategoryBadge as CategoryTag,
  BreadcrumbPath,
  List as DefectList,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorMessage,
  ResponsiveWrapper,
  // Enhanced components
  ExpandableSection,
  SectionToggle,
  SectionContent,
  DefectCategoriesGrid,
  DefectCategoryCard,
  CategoryHeader,
  CategoryIcon,
  CategoryTitle,
  ProcedureStep,
  TechnicalBox,
  CrossReference,
  AlertBox
} from './defectstyles';

import { extractDefectId, formatCategory, fetchDefectDetail } from './apiUtils';

// Enhanced text parsing for comprehensive defect information
const parseDefectContent = (description) => {
  if (!description) return { overview: null, sections: [] };
  
  const lines = description.split('\n');
  const sections = [];
  let currentSection = null;
  let overview = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for section headers (### format)
    if (line.startsWith('### ')) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: line.replace(/^###\s*/, ''),
        content: [],
        type: 'procedure'
      };
    } else if (currentSection) {
      // Add content to current section
      if (line) {
        currentSection.content.push(line);
      }
    } else {
      // Add to overview if no section is active
      if (line) {
        overview.push(line);
      }
    }
  }
  
  // Add final section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return {
    overview: overview.length > 0 ? overview.join('\n') : null,
    sections
  };
};

// Parse numbered procedures within sections
const parseProcedures = (content) => {
  const steps = [];
  let currentStep = null;
  
  content.forEach(line => {
    // Check for numbered steps
    const stepMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (stepMatch) {
      if (currentStep) {
        steps.push(currentStep);
      }
      currentStep = {
        number: stepMatch[1],
        title: stepMatch[2],
        details: []
      };
    } else if (currentStep && line.trim()) {
      currentStep.details.push(line);
    } else if (!currentStep && line.trim()) {
      // Non-numbered content
      steps.push({
        number: null,
        title: line,
        details: []
      });
    }
  });
  
  if (currentStep) {
    steps.push(currentStep);
  }
  
  return steps;
};

// Enhanced text formatting with cross-reference support
const formatText = (text, onNavigateToPath) => {
  if (!text) return null;
  
  const paragraphs = text.split(/\n\n+/);
  
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();
        
        // Handle headings
        if (trimmed.startsWith('#')) {
          const level = trimmed.match(/^#+/)[0].length;
          const content = trimmed.replace(/^#+\s*/, '');
          
          if (level <= 2) {
            return <SubTitle key={index}>{content}</SubTitle>;
          } else {
            return <SubTitle key={index} as="h4">{content}</SubTitle>;
          }
        }
        
        // Handle lists
        if (/^\s*[-*•]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter(line => 
            /^\s*[-*•]\s/.test(line) || /^\d+\.\s/.test(line)
          ).map(line => line.replace(/^\s*[-*•]\s+/, '').replace(/^\d+\.\s*/, '').trim());
          
          return (
            <DefectList key={index}>
              {items.map((item, i) => (
                <li key={i}>{formatCrossReferences(item, onNavigateToPath)}</li>
              ))}
            </DefectList>
          );
        }
        
        // Regular paragraphs with cross-reference support
        return (
          <BodyText key={index}>
            {formatCrossReferences(trimmed, onNavigateToPath)}
          </BodyText>
        );
      })}
    </>
  );
};

// Format cross-references in text
const formatCrossReferences = (text, onNavigateToPath) => {
  if (!text || !onNavigateToPath) return text;
  
  // Pattern for "Section X.Y.Z" references
  const sectionPattern = /Section\s+(\d+(?:\.\d+)*)/g;
  const parts = text.split(sectionPattern);
  
  return parts.map((part, index) => {
    // If this part matches a section number pattern
    if (index % 2 === 1) {
      const sectionId = part;
      return (
        <CrossReference
          key={index}
          onClick={() => {
            const pathParts = sectionId.split('.');
            onNavigateToPath(pathParts);
          }}
        >
          Section {sectionId}
        </CrossReference>
      );
    }
    return part;
  });
};


const MotDefectDetail = ({ defectId, defectText, defectCategory, onNavigateToPath }) => {
  const [defectDetail, setDefectDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    procedures: false,
    defects: true,
    technical: false
  });

  // Toggle section expansion
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Get the defect ID to use - either from props or extracted from text
  const getDefectIdToUse = () => {
    if (defectId) return defectId;
    return extractDefectId(defectText);
  };

  // Fetch defect details using apiUtils
  useEffect(() => {
    const loadDefectDetail = async () => {
      const idToUse = getDefectIdToUse();
      if (!idToUse) {
        setLoading(false);
        setError('No defect ID could be found');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchDefectDetail(idToUse);
        setDefectDetail(data);
      } catch (err) {
        console.error('API error:', err);
        setError(err.message || 'Failed to load defect details');
      } finally {
        setLoading(false);
      }
    };

    loadDefectDetail();
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
          <div>
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Loading defect details...</LoadingText>
            </LoadingContainer>
          </div>
        </DefectDetailContainer>
      </ResponsiveWrapper>
    );
  }

  if (error) {
    return (
      <ResponsiveWrapper>
        <DefectDetailContainer>
          <div>
            <ErrorContainer>
              <ErrorMessage>{error}</ErrorMessage>
            </ErrorContainer>
          </div>
        </DefectDetailContainer>
      </ResponsiveWrapper>
    );
  }

  if (!defectDetail) {
    return (
      <ResponsiveWrapper>
        <DefectDetailContainer>
          <div>
            <ErrorContainer>
              <ErrorMessage>No defect details found</ErrorMessage>
            </ErrorContainer>
          </div>
        </DefectDetailContainer>
      </ResponsiveWrapper>
    );
  }

  // Parse the defect content for enhanced display
  const parsedContent = defectDetail?.data?.description ? 
    parseDefectContent(defectDetail.data.description) : 
    { overview: null, sections: [] };

  return (
    <ResponsiveWrapper>
      <DefectDetailContainer>
        <div>
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

          {/* Enhanced Comprehensive Defect Information */}
          
          {/* Overview Section */}
          {parsedContent.overview && (
            <ExpandableSection>
              <SectionToggle
                onClick={() => toggleSection('overview')}
                aria-expanded={expandedSections.overview}
              >
                🔍 Inspection Overview
                <span>{expandedSections.overview ? '−' : '+'}</span>
              </SectionToggle>
              {expandedSections.overview && (
                <SectionContent>
                  {formatText(parsedContent.overview, onNavigateToPath)}
                </SectionContent>
              )}
            </ExpandableSection>
          )}

          {/* Testing Procedures Section */}
          {parsedContent.sections.length > 0 && (
            <ExpandableSection>
              <SectionToggle
                onClick={() => toggleSection('procedures')}
                aria-expanded={expandedSections.procedures}
              >
                📋 Testing Procedures
                <span>{expandedSections.procedures ? '−' : '+'}</span>
              </SectionToggle>
              {expandedSections.procedures && (
                <SectionContent>
                  {parsedContent.sections.map((section, index) => (
                    <div key={index} style={{ marginBottom: 'var(--space-xl)' }}>
                      <SubTitle>{section.title}</SubTitle>
                      {section.content.length > 0 && (
                        <div>
                          {parseProcedures(section.content).map((step, stepIndex) => (
                            <ProcedureStep
                              key={stepIndex}
                              data-step={step.number || stepIndex + 1}
                            >
                              <BodyText style={{ marginBottom: step.details.length > 0 ? 'var(--space-sm)' : 0 }}>
                                <strong>{step.title}</strong>
                              </BodyText>
                              {step.details.map((detail, detailIndex) => (
                                <BodyText key={detailIndex} style={{ marginLeft: 'var(--space-md)' }}>
                                  {formatCrossReferences(detail, onNavigateToPath)}
                                </BodyText>
                              ))}
                            </ProcedureStep>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </SectionContent>
              )}
            </ExpandableSection>
          )}

          {/* Defect Categories Section */}
          {defectDetail.data?.defects && defectDetail.data.defects.length > 0 && (
            <ExpandableSection>
              <SectionToggle
                onClick={() => toggleSection('defects')}
                aria-expanded={expandedSections.defects}
              >
                ⚠️ Defect Categories & Severity Levels
                <span>{expandedSections.defects ? '−' : '+'}</span>
              </SectionToggle>
              {expandedSections.defects && (
                <SectionContent>
                  <BodyText style={{ marginBottom: 'var(--space-lg)' }}>
                    This section shows all possible defect categories and their specific criteria for this inspection item:
                  </BodyText>
                  
                  <DefectCategoriesGrid>
                    {/* Group defects by category */}
                    {['Dangerous', 'Major', 'Minor', 'Advisory'].map(category => {
                      const categoryDefects = defectDetail.data.defects.filter(
                        defect => defect.category?.toLowerCase() === category.toLowerCase()
                      );
                      
                      if (categoryDefects.length === 0) return null;
                      
                      return (
                        <DefectCategoryCard key={category} category={category}>
                          <CategoryHeader>
                            <CategoryIcon category={category}>
                              {category === 'Dangerous' && '🔴'}
                              {category === 'Major' && '🟠'}
                              {category === 'Minor' && '🟡'}
                              {category === 'Advisory' && '🔵'}
                            </CategoryIcon>
                            <CategoryTitle>{category}</CategoryTitle>
                          </CategoryHeader>
                          
                          <DefectList>
                            {categoryDefects.map((defect, index) => (
                              <li key={index}>
                                {formatCrossReferences(defect.description, onNavigateToPath)}
                              </li>
                            ))}
                          </DefectList>
                        </DefectCategoryCard>
                      );
                    })}
                  </DefectCategoriesGrid>
                </SectionContent>
              )}
            </ExpandableSection>
          )}

          {/* Technical Requirements Section */}
          {(defectDetail.type === 'item' && defectDetail.data?.description?.includes('%')) && (
            <ExpandableSection>
              <SectionToggle
                onClick={() => toggleSection('technical')}
                aria-expanded={expandedSections.technical}
              >
                📊 Technical Requirements & Calculations
                <span>{expandedSections.technical ? '−' : '+'}</span>
              </SectionToggle>
              {expandedSections.technical && (
                <SectionContent>
                  <TechnicalBox>
                    <SubTitle as="h4">Efficiency Requirements</SubTitle>
                    <BodyText>
                      Specific efficiency percentages and technical thresholds are detailed in the inspection procedures above.
                    </BodyText>
                  </TechnicalBox>
                </SectionContent>
              )}
            </ExpandableSection>
          )}

          {/* Fallback for other content types */}
          {defectDetail.type === 'subsection' && defectDetail.data && (
            <DefectSection>
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
            </DefectSection>
          )}
          
          {defectDetail.type === 'section' && defectDetail.data && (
            <DefectSection>
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
            </DefectSection>
          )}
          
          {defectDetail.matches && (
            <DefectSection>
              <SubTitle>Multiple entries found</SubTitle>
              <BodyText>Please select a specific entry below:</BodyText>
              <DefectList>
                {defectDetail.matches.map((match, index) => (
                  <li key={match.id || index} style={{ marginBottom: 'var(--space-lg)' }}>
                    <SubTitle as="h4">{match.id}: {match.title}</SubTitle>
                    {match.data?.description && (
                      <BodyText style={{ color: 'var(--gray-600)' }}>
                        {(match.data.description || '').substring(0, 150)}
                        {(match.data.description || '').length > 150 ? '...' : ''}
                      </BodyText>
                    )}
                  </li>
                ))}
              </DefectList>
            </DefectSection>
          )}
        </div>
      </DefectDetailContainer>
    </ResponsiveWrapper>
  );
};

export default MotDefectDetail;