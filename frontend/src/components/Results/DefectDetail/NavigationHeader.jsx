import React, { useState, useEffect } from 'react';
import { fetchPathTitles, searchManual } from './apiUtils';
import { 
  getCategoryColors,
  getResultTypeColors,
  cardClasses,
  animationClasses,
  interactionClasses,
  inputClasses,
  cn 
} from './styleUtils';

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

    return breadcrumbs.map((title, index) => {
      const isActive = index === breadcrumbs.length - 1;
      
      return (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-neutral-400 select-none">›</span>}
          
          <button
            onClick={() => {
              if (index === 0) {
                onNavigateToPath([]);
              } else {
                const targetPath = currentPath.slice(0, index);
                onNavigateToPath(targetPath);
              }
            }}
            disabled={isActive}
            aria-label={index === 0 ? 'Navigate to MOT Manual home' : `Navigate to ${title}`}
            title={index === 0 ? 'Return to manual overview' : `Go to ${title}`}
            className={cn(
              'bg-none border-none p-0 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:rounded md:text-xs md:min-h-10 md:px-2 md:flex-shrink-0 md:whitespace-nowrap md:max-w-48 md:overflow-hidden md:text-ellipsis',
              isActive 
                ? 'text-neutral-900 font-semibold cursor-default' 
                : 'text-blue-600 underline cursor-pointer hover:text-blue-700'
            )}
          >
            {pathLoading && isActive ? 'Loading...' : title}
          </button>
        </React.Fragment>
      );
    });
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
        <mark key={index} className="bg-neutral-100 px-1 font-semibold text-neutral-900">
          {part}
        </mark>
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
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="mt-8 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className={interactionClasses.iconContainer('bg-neutral')}>
                <i className="ph ph-magnifying-glass text-xl text-neutral-600"></i>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Search Results</h1>
                <p className="text-sm text-neutral-600 mt-1">
                  {searchQuery ? `No results found for "${searchQuery}"` : 'No search performed'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-12 text-center shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <i className="ph ph-file-search text-4xl text-neutral-400"></i>
              {searchQuery ? (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">No matches found</h3>
                  <p className="text-neutral-600 mb-4">No results found for "{searchQuery}"</p>
                  <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                      <i className="ph ph-lightbulb text-lg"></i>
                      Try using different keywords or searching for specific defect codes
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-600">Enter a search term to find relevant content</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="mt-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className={interactionClasses.iconContainer('bg-green')}>
              <i className="ph ph-check-circle text-xl text-green-600"></i>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">Search Results</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {results.length} result{results.length !== 1 ? 's' : ''} found for "{searchQuery}"
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 shadow-sm mb-8">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <i className="ph ph-info text-lg"></i>
              Click any result to view detailed information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {results.map((result, index) => (
            <div
              key={`${result.id}-${index}`}
              className={cardClasses.interactive}
              onClick={() => onNavigateToResult(result.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.type === 'section' ? 'bg-orange-50' : result.type === 'subsection' ? 'bg-blue-50' : 'bg-green-50'}`}>
                    <i className={`ph ph-${result.type === 'section' ? 'folder' : result.type === 'subsection' ? 'folder-open' : 'file-text'} text-sm ${getResultTypeColors(result.type)}`}></i>
                  </div>
                  <div>
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize bg-neutral-100', getResultTypeColors(result.type))}>
                      {result.type}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded">
                  {getMatchTypeDescription(result.match_type)}
                </span>
              </div>
              
              <h3 className="text-sm font-medium text-neutral-900 mb-3">
                {result.id}: {highlightText(result.title, searchQuery)}
              </h3>
              
              {result.defect && (
                <div className="bg-neutral-50 rounded-lg p-4 shadow-sm">
                  {result.category && (
                    <div className="flex items-center gap-2 mb-2">
                      <i className={`ph ph-${getCategoryIcon(result.category)} text-sm`}></i>
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getCategoryColors(result.category).badge)}>
                        {result.category}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {highlightText(
                      result.defect.length > 180 
                        ? `${result.defect.substring(0, 180)}...` 
                        : result.defect, 
                      searchQuery
                    )}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 mt-4">
                <span className="text-xs text-neutral-500">{result.id}</span>
                <i className="ph ph-arrow-right text-lg text-blue-600"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // If we're showing search results, render those instead of navigation
  if (searchResults) {
    return renderSearchResults();
  }

  // Default navigation header
  return (
    <div className="bg-white shadow-sm md:sticky md:top-0 md:z-10">
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <i className="ph ph-navigation-arrow text-lg text-blue-600"></i>
            <span className="text-sm font-medium text-neutral-900">Navigation</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 flex-wrap bg-neutral-50 rounded-lg p-3 shadow-sm">
            {renderBreadcrumbs()}
          </div>
        </div>
        
        {/* Search Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <i className="ph ph-magnifying-glass text-lg text-green-600"></i>
            <span className="text-sm font-medium text-neutral-900">Search Manual</span>
          </div>
          
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search manual content, defect codes, procedures..."
                  disabled={isSearching}
                  aria-label="Search MOT manual content"
                  aria-describedby="search-hint"
                  className={inputClasses.search}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSearching || !query.trim()}
                className={cn(
                  'px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 cursor-pointer flex items-center gap-2 hover:shadow-lg hover:scale-105',
                  (isSearching || !query.trim()) && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none'
                )}
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="ph ph-magnifying-glass"></i>
                    Search
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-3 text-xs text-neutral-600 bg-blue-50 rounded-lg p-3 shadow-sm" id="search-hint">
              <i className="ph ph-info text-sm text-blue-600"></i>
              {getContextHint()}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;