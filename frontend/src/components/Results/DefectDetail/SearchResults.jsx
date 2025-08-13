import React from 'react';
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
    --positive: #059669;
    --negative: #dc2626;
    --warning: #d97706;
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
  line-height: 1.4;

  @media (max-width: var(--mobile-max)) {
    padding: var(--space-xl) var(--space-md);
  }
`;

const Header = styled('div')`
  margin-bottom: var(--space-3xl);
  
  @media (max-width: var(--mobile-max)) {
    margin-bottom: var(--space-2xl);
  }
`;

const Title = styled('h2')`
  margin: 0 0 var(--space-sm) 0;
  font-family: var(--font-main);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--gray-900);
  letter-spacing: -0.02em;
  line-height: 1.2;
  
  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xl);
  }
`;

const ResultCount = styled('p')`
  margin: 0;
  font-family: var(--font-main);
  color: var(--gray-600);
  font-size: var(--text-sm);
  line-height: 1.4;
  
  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xs);
  }
`;

const ResultsList = styled('div')`
  display: grid;
  gap: var(--space-xl);
  
  @media (max-width: var(--mobile-max)) {
    gap: var(--space-lg);
  }
`;

const ResultCard = styled('div')`
  /* Ultra clean - no borders, no shadows, following DVLADataHeader approach */
  padding: var(--space-xl);
  cursor: pointer;
  transition: var(--transition);
  background: var(--white);
  min-height: var(--touch-target-min);
  
  &:hover {
    background: var(--gray-50);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 4px;
  }
  
  /* Mobile Optimization - Future enhancement point */
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-lg);
    /* Future mobile enhancements can be added here */
  }
`;

const ResultTitle = styled('h3')`
  margin: 0 0 var(--space-sm) 0;
  font-family: var(--font-main);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-base);
  }
`;

const ResultType = styled('span')`
  display: inline-block;
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: capitalize;
  margin-bottom: var(--space-sm);
  
  /* Semantic color only - following DVLADataHeader StatusIndicator pattern */
  color: ${props => {
    switch(props.type) {
      case 'section': return 'var(--warning)';
      case 'subsection': return 'var(--primary)';
      case 'item': return 'var(--positive)';
      default: return 'var(--gray-700)';
    }
  }};
`;

const MatchType = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  color: var(--gray-500);
  margin-bottom: var(--space-sm);
`;

const DefectPreview = styled('div')`
  margin-top: var(--space-sm);
  padding: var(--space-lg);
  background: var(--gray-50);
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-700);
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-md);
    font-size: var(--text-xs);
  }
`;

const CategoryBadge = styled('span')`
  display: inline-block;
  font-family: var(--font-main);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: uppercase;
  margin-right: var(--space-sm);
  margin-bottom: var(--space-xs);
  
  /* Color-only approach following DVLADataHeader StatusIndicator */
  color: ${props => {
    switch(props.category?.toLowerCase()) {
      case 'dangerous': return 'var(--negative)';
      case 'major': return 'var(--warning)';
      case 'minor':
      case 'advisory': return 'var(--positive)';
      default: return 'var(--gray-700)';
    }
  }};
`;

const NoResults = styled('div')`
  text-align: center;
  padding: var(--space-3xl) var(--space-2xl);
  font-family: var(--font-main);
  color: var(--gray-600);
  
  @media (max-width: var(--mobile-max)) {
    padding: var(--space-2xl) var(--space-lg);
  }
`;

const SearchResults = ({ 
  query, 
  results, 
  onNavigateToResult 
}) => {
  const getMatchTypeDescription = (matchType) => {
    switch(matchType) {
      case 'title': return 'Found in title';
      case 'description': return 'Found in description';
      default:
        if (matchType.startsWith('defect_')) {
          return 'Found in defect details';
        }
        return 'Found';
    }
  };

  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} style={{ 
          background: 'var(--gray-100)', 
          padding: 'var(--space-xs)',
          fontWeight: '600',
          color: 'var(--gray-900)'
        }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!results || results.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Search Results</Title>
          <ResultCount>
            {query ? `No results found for "${query}"` : 'No search performed'}
          </ResultCount>
        </Header>
        
        <NoResults>
          {query && (
            <>
              <p>No matches found for "{query}"</p>
              <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                Try using different keywords or searching for specific defect codes
              </p>
            </>
          )}
        </NoResults>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Search Results</Title>
        <ResultCount>
          {results.length} result{results.length !== 1 ? 's' : ''} found for "{query}"
        </ResultCount>
      </Header>

      <ResultsList>
        {results.map((result, index) => (
          <ResultCard
            key={`${result.id}-${index}`}
            onClick={() => onNavigateToResult(result.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ResultType type={result.type}>
                {result.type}
              </ResultType>
              <MatchType>
                {getMatchTypeDescription(result.match_type)}
              </MatchType>
            </div>
            
            <ResultTitle>
              {result.id}: {highlightText(result.title, query)}
            </ResultTitle>
            
            {/* Show defect details if this is a defect match */}
            {result.defect && (
              <DefectPreview>
                {result.category && (
                  <CategoryBadge category={result.category}>
                    {result.category}
                  </CategoryBadge>
                )}
                {highlightText(
                  result.defect.length > 200 
                    ? `${result.defect.substring(0, 200)}...` 
                    : result.defect, 
                  query
                )}
              </DefectPreview>
            )}
          </ResultCard>
        ))}
      </ResultsList>
    </Container>
  );
};

export default SearchResults;