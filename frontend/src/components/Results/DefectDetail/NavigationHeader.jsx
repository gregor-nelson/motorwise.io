import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { 
  NavigationHeaderContainer,
  BreadcrumbContainer, 
  BreadcrumbSeparator,
  FlexContainer as SearchContainer, 
  Input as SearchInput, 
  Button as SearchButton, 
  ContextHint,
  ContentContainer as Container,
  SectionHeader as Header, 
  SectionTitle as Title,
  SmallText as ResultCount,
  CardGrid as ResultsList,
  Card as ResultCard,
  CardTitle as ResultTitle,
  TypeBadge as ResultType,
  MatchType,
  PreviewContainer as DefectPreview,
  SmallCategoryBadge as CategoryBadge,
  NoResults,
  HighlightText
} from './defectstyles';
import { fetchPathTitles, searchManual } from './apiUtils';

// Custom breadcrumb item component
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
  
  @media (max-width: var(--mobile-max)) {
    font-size: var(--text-xs);
    min-height: var(--touch-target-min);
    padding: var(--space-xs) var(--space-sm);
    flex-shrink: 0;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const NavigationHeader = ({ 
  // Breadcrumb props
  currentPath, 
  onNavigateToPath, 
  // Search props  
  onSearch,
  contextPath,
  // Search results props
  searchResults,
  onNavigateToResult,
  // Defect context props
  isDefectView,
  activeDefectId
}) => {
  // Breadcrumb state
  const [pathTitles, setPathTitles] = useState({});
  const [pathLoading, setPathLoading] = useState(false);

  // Search state
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch titles for path items - preserving exact logic from BreadcrumbNavigation
  useEffect(() => {
    const loadPathTitles = async () => {
      setPathLoading(true);
      try {
        const titles = await fetchPathTitles(currentPath);
        setPathTitles(titles);
      } catch (err) {
        console.error('Error fetching path titles:', err);
      } finally {
        setPathLoading(false);
      }
    };

    loadPathTitles();
  }, [currentPath]);

  // Handle search submission - preserving exact logic from SearchInterface
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const results = await searchManual(query.trim());
      
      // Filter results by context if we have one - preserving exact logic
      let filteredResults = results;
      if (contextPath && contextPath.length > 0) {
        const contextPrefix = contextPath.join('.');
        filteredResults = results.filter(result => 
          result.id.startsWith(contextPrefix)
        );
      }
      
      onSearch(query.trim(), filteredResults);
    } catch (err) {
      console.error('Search error:', err);
      onSearch(query.trim(), []);
    } finally {
      setIsSearching(false);
    }
  };

  // Render breadcrumbs - enhanced with defect view context
  const renderBreadcrumbs = () => {
    if (!currentPath || currentPath.length === 0) {
      return <span>MOT Manual</span>;
    }

    const breadcrumbs = ['MOT Manual'];
    
    for (let i = 1; i <= currentPath.length; i++) {
      const pathSegment = currentPath.slice(0, i).join('.');
      let title = (pathTitles && pathTitles[pathSegment]) || pathSegment;
      
      // If this is the final segment and we're viewing a defect, add context
      if (i === currentPath.length && isDefectView && activeDefectId) {
        const defectTitle = pathTitles[activeDefectId];
        if (defectTitle) {
          title = defectTitle;
        }
      }
      
      breadcrumbs.push(title);
    }

    return breadcrumbs.map((title, index) => (
      <React.Fragment key={index}>
        {index > 0 && <BreadcrumbSeparator>›</BreadcrumbSeparator>}
        
        <BreadcrumbItem
          isActive={index === breadcrumbs.length - 1}
          onClick={() => {
            if (index === 0) {
              onNavigateToPath([]);
            } else {
              const targetPath = currentPath.slice(0, index);
              onNavigateToPath(targetPath);
            }
          }}
          disabled={index === breadcrumbs.length - 1}
          aria-label={index === 0 ? 'Navigate to MOT Manual home' : `Navigate to ${title}`}
          title={index === 0 ? 'Return to manual overview' : `Go to ${title}`}
        >
          {pathLoading && index === breadcrumbs.length - 1 ? 'Loading...' : title}
        </BreadcrumbItem>
      </React.Fragment>
    ));
  };

  // Get context hint - preserving exact logic from SearchInterface
  const getContextHint = () => {
    if (!contextPath || contextPath.length === 0) {
      return 'Search entire MOT manual';
    }
    
    const contextId = contextPath.join('.');
    return `Search within section ${contextId}`;
  };

  // Get match type description - preserving exact logic from SearchResults
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

  // Highlight text function - preserving exact logic from SearchResults
  const highlightText = (text, searchQuery) => {
    if (!text || !searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <HighlightText key={index}>
          {part}
        </HighlightText>
      ) : (
        part
      )
    );
  };

  // Render search results - preserving exact logic from SearchResults
  const renderSearchResults = () => {
    if (!searchResults) return null;

    const { query: searchQuery, results } = searchResults;

    if (!results || results.length === 0) {
      return (
        <Container>
          <Header>
            <Title>Search Results</Title>
            <ResultCount>
              {searchQuery ? `No results found for "${searchQuery}"` : 'No search performed'}
            </ResultCount>
          </Header>
          
          <NoResults>
            {searchQuery && (
              <>
                <p>No matches found for "{searchQuery}"</p>
                <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-md)' }}>
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
            {results.length} result{results.length !== 1 ? 's' : ''} found for "{searchQuery}"
          </ResultCount>
        </Header>

        <ResultsList>
          {results.map((result, index) => (
            <ResultCard
              key={`${result.id}-${index}`}
              onClick={() => onNavigateToResult(result.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <ResultType type={result.type}>
                  {result.type}
                </ResultType>
                <MatchType>
                  {getMatchTypeDescription(result.match_type)}
                </MatchType>
              </div>
              
              <ResultTitle>
                {result.id}: {highlightText(result.title, searchQuery)}
              </ResultTitle>
              
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
                    searchQuery
                  )}
                </DefectPreview>
              )}
            </ResultCard>
          ))}
        </ResultsList>
      </Container>
    );
  };

  // If we're showing search results, render those instead of navigation
  if (searchResults) {
    return renderSearchResults();
  }

  // Default navigation header
  return (
    <NavigationHeaderContainer>
      <BreadcrumbContainer>
        {renderBreadcrumbs()}
      </BreadcrumbContainer>
      
      <form onSubmit={handleSearch}>
        <SearchContainer>
          <SearchInput
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search manual content..."
            disabled={isSearching}
            aria-label="Search MOT manual content"
            aria-describedby="search-hint"
          />
          
          <SearchButton 
            type="submit" 
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </SearchButton>
        </SearchContainer>
        
        <ContextHint id="search-hint">
          {getContextHint()}
        </ContextHint>
      </form>
    </NavigationHeaderContainer>
  );
};

export default NavigationHeader;