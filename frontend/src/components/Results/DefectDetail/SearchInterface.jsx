import React, { useState } from 'react';
import { styled } from '@mui/material/styles';

// Ultra Clean Design System - Following DVLADataHeader patterns
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
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --transition: all 0.15s ease;
  }
`;

const SearchContainer = styled('div')`
  ${MinimalTokens}
  
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
`;

const SearchInput = styled('input')`
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  color: var(--gray-900);
  background: var(--white);
  transition: var(--transition);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
  
  &:disabled {
    background: var(--gray-50);
    color: var(--gray-500);
    cursor: not-allowed;
  }
`;

const SearchButton = styled('button')`
  padding: var(--space-sm) var(--space-lg);
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 4px;
  font-family: var(--font-main);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-800);
  }
  
  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--gray-400);
  }
`;

const ContextHint = styled('div')`
  font-family: var(--font-main);
  font-size: var(--text-xs);
  color: var(--gray-600);
  margin-top: var(--space-xs);
`;

// API configuration
const isDevelopment = window.location.hostname === 'localhost';
const API_URL = isDevelopment ? 'http://localhost:8002/api/v1' : '/manual-api/v1';

const SearchInterface = ({ onSearch, contextPath }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const response = await fetch(`${API_URL}/manual/search/${encodeURIComponent(query.trim())}`, {
        headers: { 'Accept': 'application/json' },
        credentials: isDevelopment ? 'include' : 'same-origin',
        mode: isDevelopment ? 'cors' : 'same-origin'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Filter results by context if we have one
        let filteredResults = data.results;
        if (contextPath && contextPath.length > 0) {
          const contextPrefix = contextPath.join('.');
          filteredResults = data.results.filter(result => 
            result.id.startsWith(contextPrefix)
          );
        }
        
        onSearch(query.trim(), filteredResults);
      } else {
        console.error('Search failed:', response.statusText);
        onSearch(query.trim(), []);
      }
    } catch (err) {
      console.error('Search error:', err);
      onSearch(query.trim(), []);
    } finally {
      setIsSearching(false);
    }
  };

  const getContextHint = () => {
    if (!contextPath || contextPath.length === 0) {
      return 'Search entire MOT manual';
    }
    
    const contextId = contextPath.join('.');
    return `Search within section ${contextId}`;
  };

  return (
    <form onSubmit={handleSearch}>
      <SearchContainer>
        <SearchInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search manual content..."
          disabled={isSearching}
        />
        
        <SearchButton 
          type="submit" 
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </SearchButton>
      </SearchContainer>
      
      <ContextHint>
        {getContextHint()}
      </ContextHint>
    </form>
  );
};

export default SearchInterface;