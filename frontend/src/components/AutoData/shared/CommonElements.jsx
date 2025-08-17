import React, { memo, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

// ============================================================================
// SHARED STYLED COMPONENTS
// Using the existing design system from styles.js
// ============================================================================

// Container Components
export const SharedContainer = styled('div')(() => ({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: 'var(--space-lg)',
  fontFamily: 'var(--font-main)'
}));

export const SharedPanel = styled('div')(() => ({
  background: 'var(--white)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-xl)',
  boxShadow: 'var(--shadow-base)',
  marginBottom: 'var(--space-xl)'
}));

// Header Components
export const SharedHeader = styled('div')(() => ({
  marginBottom: 'var(--space-xl)',
  paddingBottom: 'var(--space-lg)',
  borderBottom: `1px solid var(--gray-200)`
}));

export const SharedTitle = styled('h2')(() => ({
  fontSize: 'var(--text-2xl)',
  fontWeight: '600',
  color: 'var(--gray-900)',
  margin: '0 0 var(--space-md) 0',
  fontFamily: 'var(--font-display)',
  lineHeight: 'var(--leading-tight)'
}));

export const SharedSubtitle = styled('p')(() => ({
  fontSize: 'var(--text-base)',
  color: 'var(--gray-600)',
  margin: 0,
  lineHeight: 'var(--leading-normal)'
}));

// Warning/Notice Components
export const SharedWarningPanel = styled('div')(() => ({
  background: 'var(--warning-light)',
  border: `1px solid var(--warning)`,
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-lg)',
  marginBottom: 'var(--space-xl)',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-md)'
}));

export const SharedNoticePanel = styled('div')(() => ({
  background: 'var(--primary-light)',
  border: `1px solid var(--primary)`,
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-lg)',
  marginBottom: 'var(--space-xl)',
  
  h3: {
    fontSize: 'var(--text-lg)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    margin: '0 0 var(--space-sm) 0'
  },
  
  p: {
    fontSize: 'var(--text-base)',
    color: 'var(--gray-700)',
    margin: 0,
    lineHeight: 'var(--leading-normal)'
  }
}));

// Tab Components
export const SharedTabsContainer = styled('div')(() => ({
  marginBottom: 'var(--space-xl)'
}));

export const SharedTabsList = styled('div')(() => ({
  display: 'flex',
  borderBottom: `2px solid var(--gray-200)`,
  marginBottom: 'var(--space-xl)',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none'
  }
}));

export const SharedTabButton = styled('button')(({ active }) => ({
  background: active ? 'var(--primary)' : 'transparent',
  color: active ? 'var(--white)' : 'var(--gray-600)',
  border: 'none',
  padding: 'var(--space-md) var(--space-lg)',
  fontSize: 'var(--text-base)',
  fontWeight: '500',
  fontFamily: 'var(--font-main)',
  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
  cursor: 'pointer',
  transition: 'var(--transition)',
  whiteSpace: 'nowrap',
  minWidth: 'fit-content',
  
  '&:hover': {
    background: active ? 'var(--primary-hover)' : 'var(--gray-100)',
    color: active ? 'var(--white)' : 'var(--gray-700)'
  },
  
  '&:focus': {
    outline: `2px solid var(--primary)`,
    outlineOffset: '2px'
  }
}));

export const SharedTabContent = styled('div')(({ active }) => ({
  display: active ? 'block' : 'none',
  animation: active ? 'fadeIn 0.2s ease-in-out' : 'none'
}));

// Search and Filter Components
export const SharedSearchContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-lg)',
  marginBottom: 'var(--space-xl)',
  padding: 'var(--space-lg)',
  background: 'var(--gray-50)',
  borderRadius: 'var(--radius-md)',
  
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    alignItems: 'stretch'
  }
}));

export const SharedSearchInput = styled('input')(() => ({
  flex: 1,
  padding: 'var(--space-md)',
  border: `1px solid var(--gray-300)`,
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-base)',
  fontFamily: 'var(--font-main)',
  
  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary)',
    boxShadow: `0 0 0 3px var(--primary-light)`
  },
  
  '&::placeholder': {
    color: 'var(--gray-500)'
  }
}));

export const SharedFilterContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
  flexWrap: 'wrap'
}));

export const SharedFilterButton = styled('button')(({ active }) => ({
  background: active ? 'var(--primary)' : 'var(--white)',
  color: active ? 'var(--white)' : 'var(--gray-600)',
  border: `1px solid ${active ? 'var(--primary)' : 'var(--gray-300)'}`,
  padding: 'var(--space-sm) var(--space-md)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: '500',
  fontFamily: 'var(--font-main)',
  cursor: 'pointer',
  transition: 'var(--transition)',
  
  '&:hover': {
    background: active ? 'var(--primary-hover)' : 'var(--gray-100)',
    borderColor: active ? 'var(--primary-hover)' : 'var(--gray-400)'
  }
}));

// Accordion Components
export const SharedAccordionContainer = styled('div')(() => ({
  border: `1px solid var(--gray-200)`,
  borderRadius: 'var(--radius-md)',
  marginBottom: 'var(--space-lg)',
  overflow: 'hidden'
}));

export const SharedAccordionHeader = styled('button')(() => ({
  width: '100%',
  background: 'var(--gray-50)',
  border: 'none',
  padding: 'var(--space-lg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'var(--transition)',
  fontFamily: 'var(--font-main)',
  
  '&:hover': {
    background: 'var(--gray-100)'
  },
  
  '&:focus': {
    outline: `2px solid var(--primary)`,
    outlineOffset: '-2px'
  }
}));

export const SharedAccordionTitle = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
  
  h3: {
    fontSize: 'var(--text-lg)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    margin: 0
  },
  
  span: {
    fontSize: 'var(--text-sm)',
    color: 'var(--primary)',
    fontWeight: '500'
  }
}));

export const SharedAccordionChevron = styled('span')(({ expanded }) => ({
  fontSize: 'var(--text-lg)',
  color: 'var(--primary)',
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'var(--transition)'
}));

export const SharedAccordionContent = styled('div')(({ expanded }) => ({
  display: expanded ? 'block' : 'none',
  padding: expanded ? 'var(--space-lg)' : 0,
  borderTop: expanded ? `1px solid var(--gray-200)` : 'none'
}));

// Loading States
export const SharedLoadingContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-2xl)',
  textAlign: 'center'
}));

export const SharedLoadingSpinner = styled('div')(() => ({
  width: '40px',
  height: '40px',
  border: `4px solid var(--gray-200)`,
  borderTop: `4px solid var(--primary)`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: 'var(--space-lg)'
}));

export const SharedLoadingText = styled('p')(() => ({
  fontSize: 'var(--text-lg)',
  color: 'var(--gray-600)',
  margin: '0 0 var(--space-sm) 0'
}));

// Error States
export const SharedErrorContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-2xl)',
  textAlign: 'center',
  background: 'var(--negative-light)',
  borderRadius: 'var(--radius-md)',
  border: `1px solid var(--negative)`
}));

export const SharedErrorText = styled('p')(() => ({
  fontSize: 'var(--text-base)',
  color: 'var(--negative)',
  margin: '0 0 var(--space-lg) 0'
}));

// Button Components
export const SharedButton = styled('button')(({ variant = 'primary' }) => ({
  background: variant === 'primary' ? 'var(--primary)' : 'var(--white)',
  color: variant === 'primary' ? 'var(--white)' : 'var(--gray-700)',
  border: `1px solid ${variant === 'primary' ? 'var(--primary)' : 'var(--gray-300)'}`,
  padding: 'var(--space-md) var(--space-lg)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-base)',
  fontWeight: '500',
  fontFamily: 'var(--font-main)',
  cursor: 'pointer',
  transition: 'var(--transition)',
  
  '&:hover': {
    background: variant === 'primary' ? 'var(--primary-hover)' : 'var(--gray-100)',
    borderColor: variant === 'primary' ? 'var(--primary-hover)' : 'var(--gray-400)'
  },
  
  '&:focus': {
    outline: `2px solid var(--primary)`,
    outlineOffset: '2px'
  },
  
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
}));

// ============================================================================
// REUSABLE COMPONENT IMPLEMENTATIONS
// ============================================================================

/**
 * Unified Tabs Component
 */
export const SharedTabs = memo(({ tabs, activeTab, onTabChange, children }) => {
  return (
    <SharedTabsContainer>
      <SharedTabsList>
        {tabs.map((tab, index) => (
          <SharedTabButton
            key={tab.id || index}
            active={activeTab === index}
            onClick={() => onTabChange(index)}
            aria-selected={activeTab === index}
            role="tab"
          >
            {tab.label}
          </SharedTabButton>
        ))}
      </SharedTabsList>
      {children}
    </SharedTabsContainer>
  );
});

/**
 * Unified Accordion Component
 */
export const SharedAccordion = memo(({ 
  title, 
  itemCount, 
  expanded, 
  onToggle, 
  children,
  id 
}) => {
  const handleToggle = useCallback(() => {
    onToggle(id);
  }, [onToggle, id]);

  return (
    <SharedAccordionContainer>
      <SharedAccordionHeader
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
      >
        <SharedAccordionTitle>
          <h3>{title}</h3>
          {itemCount !== undefined && (
            <span>{itemCount} items</span>
          )}
        </SharedAccordionTitle>
        <SharedAccordionChevron expanded={expanded}>
          ▼
        </SharedAccordionChevron>
      </SharedAccordionHeader>
      <SharedAccordionContent 
        expanded={expanded}
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-header`}
      >
        {children}
      </SharedAccordionContent>
    </SharedAccordionContainer>
  );
});

/**
 * Unified Search and Filter Component
 */
export const SharedSearchAndFilters = memo(({ 
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  filters = [],
  activeFilters = [],
  onFilterChange,
  onClearFilters,
  resultCount,
  showClearButton = true
}) => {
  const handleSearchChange = useCallback((e) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleClearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <SharedSearchContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1 }}>
        <SearchIcon style={{ color: 'var(--gray-500)' }} />
        <SharedSearchInput
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Search"
        />
        {searchTerm && (
          <SharedButton variant="secondary" onClick={handleClearSearch}>
            <ClearIcon style={{ fontSize: 'var(--text-sm)' }} />
          </SharedButton>
        )}
      </div>
      
      {filters.length > 0 && (
        <SharedFilterContainer>
          <FilterListIcon style={{ color: 'var(--gray-500)' }} />
          {filters.map((filter) => (
            <SharedFilterButton
              key={filter.id}
              active={activeFilters.includes(filter.id)}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </SharedFilterButton>
          ))}
        </SharedFilterContainer>
      )}
      
      {showClearButton && (searchTerm || activeFilters.length > 0) && (
        <SharedButton variant="secondary" onClick={onClearFilters}>
          Clear Filters
        </SharedButton>
      )}
      
      {resultCount !== undefined && (
        <span style={{ 
          fontSize: 'var(--text-sm)', 
          color: 'var(--gray-600)',
          whiteSpace: 'nowrap'
        }}>
          {resultCount} results
        </span>
      )}
    </SharedSearchContainer>
  );
});

/**
 * Unified Loading State Component
 */
export const SharedLoadingState = memo(({ 
  title = "Loading...", 
  subtitle,
  vehicleMake,
  vehicleModel 
}) => (
  <SharedContainer>
    <SharedPanel>
      <SharedLoadingContainer>
        <SharedLoadingSpinner />
        <SharedLoadingText>{title}</SharedLoadingText>
        {subtitle && (
          <p style={{ 
            fontSize: 'var(--text-base)', 
            color: 'var(--gray-500)', 
            margin: 0 
          }}>
            {subtitle}
          </p>
        )}
        {vehicleMake && vehicleModel && (
          <p style={{ 
            fontSize: 'var(--text-sm)', 
            color: 'var(--gray-500)', 
            margin: 'var(--space-sm) 0 0 0' 
          }}>
            Please wait while we load data for {vehicleMake} {vehicleModel}
          </p>
        )}
      </SharedLoadingContainer>
    </SharedPanel>
  </SharedContainer>
));

/**
 * Unified Error State Component
 */
export const SharedErrorState = memo(({ 
  error, 
  onRetry, 
  title = "Error Loading Data" 
}) => (
  <SharedContainer>
    <SharedPanel>
      <SharedErrorContainer>
        <WarningIcon sx={{ fontSize: 40, color: 'var(--negative)', marginBottom: 'var(--space-md)' }} />
        <h3 style={{ 
          fontSize: 'var(--text-xl)', 
          color: 'var(--negative)', 
          margin: '0 0 var(--space-md) 0' 
        }}>
          {title}
        </h3>
        <SharedErrorText>{error}</SharedErrorText>
        {onRetry && (
          <SharedButton onClick={onRetry}>
            Try Again
          </SharedButton>
        )}
      </SharedErrorContainer>
    </SharedPanel>
  </SharedContainer>
));

/**
 * Unified Empty State Component
 */
export const SharedEmptyState = memo(({ 
  title, 
  subtitle, 
  icon: IconComponent = InfoIcon 
}) => (
  <SharedContainer>
    <SharedPanel>
      <SharedLoadingContainer>
        <IconComponent sx={{ fontSize: 40, color: 'var(--primary)', marginBottom: 'var(--space-md)' }} />
        <h3 style={{ 
          fontSize: 'var(--text-xl)', 
          color: 'var(--gray-700)', 
          margin: '0 0 var(--space-md) 0' 
        }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ 
            fontSize: 'var(--text-base)', 
            color: 'var(--gray-500)', 
            margin: 0 
          }}>
            {subtitle}
          </p>
        )}
      </SharedLoadingContainer>
    </SharedPanel>
  </SharedContainer>
));

/**
 * Unified Match Warning Component
 */
export const SharedMatchWarning = memo(({ 
  matchConfidence, 
  metadata, 
  vehicleMake, 
  vehicleModel,
  requestedYear,
  requestedFuelType 
}) => {
  if (matchConfidence !== 'fuzzy' || !metadata?.matchedTo && !metadata?.matched_to) return null;
  
  const matchedTo = metadata.matchedTo || metadata.matched_to;
  const matchedYearInfo = matchedTo?.yearRange 
    ? ` (${matchedTo.yearRange.startYear}-${
        matchedTo.yearRange.endYear === 'present' 
          ? 'present' 
          : matchedTo.yearRange.endYear
      })`
    : '';
  
  const matchedFuelType = matchedTo?.fuelType && matchedTo.fuelType !== 'unknown'
    ? ` - ${matchedTo.fuelType.charAt(0).toUpperCase() + matchedTo.fuelType.slice(1)} Engine`
    : '';
  
  const yearDisplay = requestedYear ? ` (${requestedYear})` : '';
  const fuelDisplay = requestedFuelType 
    ? ` - ${requestedFuelType.charAt(0).toUpperCase() + requestedFuelType.slice(1)} Engine`
    : '';

  return (
    <SharedWarningPanel>
      <WarningIcon sx={{ color: 'var(--warning)', fontSize: 'var(--text-lg)' }} />
      <div>
        <h3 style={{ 
          fontSize: 'var(--text-lg)', 
          fontWeight: '600', 
          color: 'var(--gray-900)', 
          margin: '0 0 var(--space-sm) 0' 
        }}>
          Approximate Match
        </h3>
        <p style={{ 
          fontSize: 'var(--text-base)', 
          color: 'var(--gray-700)', 
          margin: 0,
          lineHeight: 'var(--leading-normal)'
        }}>
          We don't have exact data for your <strong>{vehicleMake} {vehicleModel}{yearDisplay}{fuelDisplay}</strong>. 
          The information shown is based on <strong>{matchedTo.make} {matchedTo.model}{matchedYearInfo}{matchedFuelType}</strong>, 
          which is the closest match to your vehicle.
        </p>
      </div>
    </SharedWarningPanel>
  );
});

// Set display names for better debugging
SharedTabs.displayName = 'SharedTabs';
SharedAccordion.displayName = 'SharedAccordion';
SharedSearchAndFilters.displayName = 'SharedSearchAndFilters';
SharedLoadingState.displayName = 'SharedLoadingState';
SharedErrorState.displayName = 'SharedErrorState';
SharedEmptyState.displayName = 'SharedEmptyState';
SharedMatchWarning.displayName = 'SharedMatchWarning';