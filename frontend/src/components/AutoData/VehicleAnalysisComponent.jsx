import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  GovUKHeadingM,
  GovUKHeadingS,
  GovUKBody,
  GovUKBodyS,
  GovUKLoadingSpinner,
  GovUKContainer,
  COLORS,
} from '../../styles/theme'; // Adjust import path
import { styled } from '@mui/material';
// Import Material-UI icons for error/empty states
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// Import custom tooltip components if used elsewhere
import {
  HeadingWithTooltip,
} from '../../styles/tooltip'; // Adjust import path

// Import styled components
import {
  InsightsContainer,
  InsightPanel,
  InsightBody,
  InsightTable,
  ValueHighlight,
  FactorList,
  FactorItem,
  InsightNote,
  EnhancedLoadingContainer,
  EmptyStateContainer
} from '../Premium/DVLA/Insights/style/style'

// API setup code with consistent approach
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
                    ? 'http://localhost:8007/api/v1'
                    : '/api/v1';

// Browser cache configuration
const BROWSER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BROWSER_CACHE_PREFIX = 'vehicle_analysis_';
const STORAGE_VERSION = 'v1'; // Use this to invalidate all caches if data structure changes

// Error message mapping to provide user-friendly messages
const ERROR_MESSAGES = {
  // Network and connection errors
  'network': 'Sorry, there is a problem with the service. Please try again later.',
  'timeout': 'Sorry, the service is taking too long to respond. Please try again later.',
  'abort': 'The request was cancelled. Please try again.',
  
  // Server errors
  '500': 'Sorry, there is a problem with the service. Please try again later.',
  '502': 'Sorry, the service is currently unavailable. Please try again later.',
  '503': 'Sorry, the service is temporarily unavailable. Please try again later.',
  '504': 'Sorry, the service is taking too long to respond. Please try again later.',
  
  // Authentication/Authorization errors
  '401': 'Sorry, you are not authorised to access this information.',
  '403': 'Sorry, you do not have permission to access this information.',
  
  // Not found errors
  '404': 'The vehicle information you are looking for could not be found.',
  
  // Validation errors
  '400': 'The vehicle registration number is not valid. Please check and try again.',
  
  // Default fallback error
  'default': 'Sorry, we are unable to process your request at the moment. Please try again later.'
};

// Helper function to get appropriate error message
const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.default;
  
  // Handle network errors
  if (typeof error === 'string') {
    if (error.includes('network')) return ERROR_MESSAGES.network;
    if (error.includes('timeout')) return ERROR_MESSAGES.timeout;
    
    // Check for HTTP status code mentions in error message
    for (const code of ['400', '401', '403', '404', '500', '502', '503', '504']) {
      if (error.includes(code)) return ERROR_MESSAGES[code];
    }
  }
  
  return ERROR_MESSAGES.default;
};

// Browser storage utility functions
const browserCache = {
  /**
   * Save data to localStorage with metadata
   */
  saveToCache: (key, data) => {
    try {
      // Calculate approximate size of data
      const jsonString = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: STORAGE_VERSION
      });
      
      // Check if size is reasonable (e.g., under 2MB)
      const sizeInBytes = new Blob([jsonString]).size;
      if (sizeInBytes > 2 * 1024 * 1024) {
        console.warn(`Cache item too large (${Math.round(sizeInBytes/1024)}KB), not saving`);
        return false;
      }
      
      localStorage.setItem(`${BROWSER_CACHE_PREFIX}${key}`, jsonString);
      return true;
    } catch (error) {
      console.error('Error saving to browser cache:', error);
      // Handle quota exceeded errors
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Try to clear old entries if storage is full
        browserCache.clearOldEntries();
        return false;
      }
      return false;
    }
  },

  /**
   * Get data from localStorage if valid
   */
  getFromCache: (key) => {
    try {
      const cachedItem = localStorage.getItem(`${BROWSER_CACHE_PREFIX}${key}`);
      if (!cachedItem) return null;
      
      const cacheEntry = JSON.parse(cachedItem);
      
      // Check version
      if (cacheEntry.version !== STORAGE_VERSION) {
        localStorage.removeItem(`${BROWSER_CACHE_PREFIX}${key}`);
        return null;
      }
      
      // Check if expired
      if (Date.now() - cacheEntry.timestamp > BROWSER_CACHE_TTL) {
        localStorage.removeItem(`${BROWSER_CACHE_PREFIX}${key}`);
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.error('Error retrieving from browser cache:', error);
      return null;
    }
  },

  /**
   * Clear an entry from localStorage
   */
  clearCache: (key) => {
    localStorage.removeItem(`${BROWSER_CACHE_PREFIX}${key}`);
  },
  
  /**
   * Clear all vehicle analysis entries from localStorage
   */
  clearAllCache: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith(BROWSER_CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  },
  
  /**
   * Clear old entries when storage is full
   */
  clearOldEntries: () => {
    const cacheKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(BROWSER_CACHE_PREFIX));
    
    if (cacheKeys.length === 0) return;
    
    // Get all cache entries with timestamps
    const cacheEntries = cacheKeys
      .map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          return { key, timestamp: item.timestamp };
        } catch (e) {
          return { key, timestamp: 0 };
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Sort oldest first
    
    // Remove oldest 20% of entries
    const entriesToRemove = Math.max(1, Math.floor(cacheEntries.length * 0.2));
    cacheEntries.slice(0, entriesToRemove).forEach(entry => {
      localStorage.removeItem(entry.key);
    });
  }
};

/**
 * Safe markdown parser function
 * Converts markdown text to JSX elements without using dangerouslySetInnerHTML
 */
const parseMarkdown = (markdownText) => {
  if (!markdownText) return null;
  
  // Split the text into lines
  const lines = markdownText.split('\n');
  const elements = [];
  let currentBlock = [];
  let inCodeBlock = false;
  let inTable = false;
  let tableHeaders = [];
  let listType = null; // 'ul' or 'ol'
  let listItems = [];
  
  // Initialize table rows array
  let tableRows = [];
  
  /**
   * Helper function to parse inline formatting into React elements
   */
  const parseInlineFormatting = (text) => {
    if (!text) return [];
    
    // Split text by formatting markers
    let segments = [];
    let currentText = '';
    let inBold = false;
    let inItalic = false;
    let inCode = false;
    
    // Process character by character to handle nested formatting
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1] || '';
      
      // Handle bold with **
      if (char === '*' && nextChar === '*') {
        if (!inBold) {
          // Start bold - push current text and start bold segment
          if (currentText) segments.push({ type: 'text', content: currentText });
          currentText = '';
          inBold = true;
          i++; // Skip next asterisk
        } else {
          // End bold - push bold segment
          segments.push({ type: 'bold', content: currentText });
          currentText = '';
          inBold = false;
          i++; // Skip next asterisk
        }
        continue;
      }
      
      // Handle italic with single *
      if (char === '*' && nextChar !== '*' && !inBold) {
        if (!inItalic) {
          // Start italic
          if (currentText) segments.push({ type: 'text', content: currentText });
          currentText = '';
          inItalic = true;
        } else {
          // End italic
          segments.push({ type: 'italic', content: currentText });
          currentText = '';
          inItalic = false;
        }
        continue;
      }
      
      // Handle inline code with backticks
      if (char === '`' && !inBold && !inItalic) {
        if (!inCode) {
          // Start code
          if (currentText) segments.push({ type: 'text', content: currentText });
          currentText = '';
          inCode = true;
        } else {
          // End code
          segments.push({ type: 'code', content: currentText });
          currentText = '';
          inCode = false;
        }
        continue;
      }
      
      // Add character to current text
      currentText += char;
    }
    
    // Add any remaining text
    if (currentText) {
      segments.push({ 
        type: inBold ? 'bold' : inItalic ? 'italic' : inCode ? 'code' : 'text', 
        content: currentText 
      });
    }
    
    // Convert segments to React elements
    return segments.map((segment, index) => {
      switch (segment.type) {
        case 'bold':
          return <strong key={index}>{segment.content}</strong>;
        case 'italic':
          return <em key={index}>{segment.content}</em>;
        case 'code':
          return <code key={index}>{segment.content}</code>;
        default:
          return segment.content;
      }
    });
  };
  
  // Process line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        // Start a new code block
        inCodeBlock = true;
        if (currentBlock.length > 0) {
          elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
          currentBlock = [];
        }
      } else {
        // End code block
        inCodeBlock = false;
        elements.push(
          <pre key={`code-${i}`}>
            <code>{currentBlock}</code>
          </pre>
        );
        currentBlock = [];
      }
      continue;
    }
    
    if (inCodeBlock) {
      currentBlock.push(line);
      if (currentBlock.length > 1) {
        currentBlock.push(<br key={`br-code-${i}`} />);
      }
      continue;
    }
    
    // Handle tables - using InsightTable component for consistency
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      if (!inTable) {
        // Starting a new table
        inTable = true;
        if (currentBlock.length > 0) {
          elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
          currentBlock = [];
        }
        // Parse headers
        tableHeaders = trimmedLine
          .split('|')
          .filter(cell => cell.trim() !== '')
          .map(header => header.trim());
        
        // Reset table rows for new table
        tableRows = [];
      } else if (trimmedLine.includes('---')) {
        // Skip separator line
        continue;
      } else {
        // Parse row
        const cells = trimmedLine
          .split('|')
          .filter(cell => cell.trim() !== '')
          .map(cell => cell.trim());
          
        // Add row to collection instead of directly to elements
        tableRows.push(
          <tr key={`tr-${i}`}>
            {cells.map((cellContent, cellIndex) => (
              <td key={`td-${i}-${cellIndex}`}>{parseInlineFormatting(cellContent)}</td>
            ))}
          </tr>
        );
      }
      continue;
    } else if (inTable) {
      // End of table - now create the full table structure with InsightTable
      inTable = false;
      elements.push(
        <InsightTable key={`table-${i}`}>
          <thead>
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={`th-${index}`}>{parseInlineFormatting(header)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows}
          </tbody>
        </InsightTable>
      );
      tableHeaders = [];
      tableRows = [];
    }
    
    // Handle headers using GOV.UK heading components
    if (trimmedLine.startsWith('# ')) {
      if (currentBlock.length > 0) {
        elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
        currentBlock = [];
      }
      elements.push(
        <GovUKHeadingM key={`h1-${i}`}>
          {parseInlineFormatting(trimmedLine.substring(2))}
        </GovUKHeadingM>
      );
      continue;
    }
    
    if (trimmedLine.startsWith('## ')) {
      if (currentBlock.length > 0) {
        elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
        currentBlock = [];
      }
      elements.push(
        <GovUKHeadingS key={`h2-${i}`}>
          {parseInlineFormatting(trimmedLine.substring(3))}
        </GovUKHeadingS>
      );
      continue;
    }
    
    if (trimmedLine.startsWith('### ')) {
      if (currentBlock.length > 0) {
        elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
        currentBlock = [];
      }
      elements.push(
        <GovUKHeadingS key={`h3-${i}`} style={{ fontSize: '1.125rem' }}>
          {parseInlineFormatting(trimmedLine.substring(4))}
        </GovUKHeadingS>
      );
      continue;
    }
    
    if (trimmedLine.startsWith('#### ')) {
      if (currentBlock.length > 0) {
        elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
        currentBlock = [];
      }
      elements.push(
        <GovUKHeadingS key={`h4-${i}`} style={{ fontSize: '1rem' }}>
          {parseInlineFormatting(trimmedLine.substring(5))}
        </GovUKHeadingS>
      );
      continue;
    }
    
    // Handle lists - use FactorList and FactorItem for consistency
    if (trimmedLine.match(/^[\d]+\.\s/)) {
      // Ordered list
      if (listType !== 'ol') {
        if (currentBlock.length > 0) {
          elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
          currentBlock = [];
        }
        if (listType) {
          // Add the previous list
          elements.push(
            listType === 'ul' 
              ? <FactorList key={`ul-${i}`}>{listItems}</FactorList> 
              : <ol key={`ol-${i}`} style={{ paddingLeft: '20px', marginBottom: '20px' }}>{listItems}</ol>
          );
          listItems = [];
        }
        listType = 'ol';
      }
      
      listItems.push(
        <li key={`li-${i}`} style={{ marginBottom: '5px' }}>
          {parseInlineFormatting(trimmedLine.replace(/^[\d]+\.\s/, ''))}
        </li>
      );
      continue;
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      // Unordered list - use FactorItem for consistency
      if (listType !== 'ul') {
        if (currentBlock.length > 0) {
          elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
          currentBlock = [];
        }
        if (listType) {
          // Add the previous list
          elements.push(
            listType === 'ul' 
              ? <FactorList key={`ul-${i}`}>{listItems}</FactorList> 
              : <ol key={`ol-${i}`} style={{ paddingLeft: '20px', marginBottom: '20px' }}>{listItems}</ol>
          );
          listItems = [];
        }
        listType = 'ul';
      }
      
      listItems.push(
        <FactorItem key={`li-${i}`} iconColor={COLORS.BLUE}>
          <InfoIcon fontSize="small" aria-hidden="true" />
          <span>{parseInlineFormatting(trimmedLine.substring(2))}</span>
        </FactorItem>
      );
      continue;
    } else if (listType && trimmedLine === '') {
      // End of list
      elements.push(
        listType === 'ul' 
          ? <FactorList key={`ul-${i}`}>{listItems}</FactorList> 
          : <ol key={`ol-${i}`} style={{ paddingLeft: '20px', marginBottom: '20px' }}>{listItems}</ol>
      );
      listItems = [];
      listType = null;
      continue;
    }
    
    // Handle blockquotes
    if (trimmedLine.startsWith('> ')) {
      if (currentBlock.length > 0) {
        elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
        currentBlock = [];
      }
      elements.push(
        <InsightNote key={`blockquote-${i}`}>
          <InfoIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '5px', color: COLORS.BLUE }} aria-hidden="true" />
          <span className="govuk-visually-hidden">Note:</span>
          {parseInlineFormatting(trimmedLine.substring(2))}
        </InsightNote>
      );
      continue;
    }
    
    // Handle paragraphs using GovUKBody
    if (trimmedLine === '') {
      if (currentBlock.length > 0) {
        elements.push(<GovUKBody key={`p-${i}`}>{currentBlock}</GovUKBody>);
        currentBlock = [];
      }
    } else {
      // Add the formatted line content directly to the current block
      const formattedContent = parseInlineFormatting(trimmedLine);
      
      // If current block is not empty, add a space in between
      if (currentBlock.length > 0) {
        currentBlock.push(' ');
      }
      
      // Add formatted content to current block
      if (Array.isArray(formattedContent)) {
        currentBlock.push(...formattedContent);
      } else {
        currentBlock.push(formattedContent);
      }
    }
  }
  
  // Handle any remaining content
  if (currentBlock.length > 0) {
    elements.push(<GovUKBody key={`p-final`}>{currentBlock}</GovUKBody>);
  }
  
  if (listItems.length > 0) {
    elements.push(
      listType === 'ul' 
        ? <FactorList key={`ul-final`}>{listItems}</FactorList> 
        : <ol key={`ol-final`} style={{ paddingLeft: '20px', marginBottom: '20px' }}>{listItems}</ol>
    );
  }
  
  return <>{elements}</>;
};

// Create a styled component for the analysis content
const AnalysisPanel = styled(InsightPanel)(() => ({
  borderLeftColor: COLORS.BLUE
}));

// Create a styled button component for consistency
const GovUKButton = styled('button')(() => ({
  backgroundColor: COLORS.BUTTON_COLOUR || COLORS.GREEN,
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  fontFamily: '"GDS Transport", arial, sans-serif',
  fontWeight: 700,
  fontSize: '16px',
  cursor: 'pointer',
  marginTop: '10px',
  '&:hover': {
    backgroundColor: COLORS.BUTTON_HOVER || '#0b5d30'
  },
  '&:focus': {
    outline: `3px solid ${COLORS.YELLOW}`,
    outlineOffset: 0
  }
}));

/**
 * VehicleAnalysisComponent to fetch and display vehicle information
 * Enhanced to match GOV.UK styling and accessibility standards
 */
const VehicleAnalysisComponent = ({ 
  registration, 
  vehicleData, 
  onDataLoad 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Function to check browser cache
  const checkBrowserCache = useCallback(() => {
    if (!registration) return null;
    
    const normalizedReg = registration.toUpperCase().trim();
    const cachedData = browserCache.getFromCache(normalizedReg);
    
    if (cachedData) {
      console.log('Found in browser cache:', normalizedReg);
      return cachedData;
    }
    
    return null;
  }, [registration]);

  // Fetch analysis from API with retries
  const fetchAnalysisFromApi = useCallback(async () => {
    if (!registration) {
      setError("Vehicle registration is required");
      setLoading(false);
      return;
    }

    // Normalize registration
    const normalizedReg = registration.toUpperCase().trim();
    
    // Check browser cache first
    const cachedData = checkBrowserCache();
    if (cachedData) {
      setAnalysis(cachedData);
      setLoading(false);
      
      // Still call onDataLoad with cached data
      if (onDataLoad && typeof onDataLoad === 'function') {
        onDataLoad(cachedData);
      }
      
      return;
    }

    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching data for registration: ${normalizedReg}`);
      
      const response = await fetch(
        `${API_BASE_URL}/vehicle-analysis/${normalizedReg}`, 
        { signal }
      );
      
      if (!response.ok) {
        let errorMessage;
        let errorData = {};
        
        // Try to parse error response
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Could not parse error response as JSON:", jsonError);
        }
        
        // Handle specific HTTP status codes
        switch (response.status) {
          case 404:
            errorMessage = "The vehicle information could not be found.";
            break;
          case 429:
            errorMessage = "You've made too many requests. Please wait and try again.";
            break;
          default:
            errorMessage = errorData.detail || `Service error: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Data received", data);
      
      // Reset retry counter on success
      retryCountRef.current = 0;
      
      // Set analysis
      setAnalysis(data);
      
      // Store in browser cache
      browserCache.saveToCache(normalizedReg, data);
      
      // Call onDataLoad callback if provided
      if (onDataLoad && typeof onDataLoad === 'function') {
        onDataLoad(data);
      }
      
    } catch (err) {
      // Don't handle aborted requests as errors
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error("Error fetching vehicle data:", err);
      
      // Implement retry logic for network errors
      if (err.message.includes('network') && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = retryCountRef.current * 1000; // Exponential backoff
        
        setTimeout(() => {
          fetchAnalysisFromApi();
        }, delay);
        
        return;
      }
      
      // Use our error mapping function instead of displaying raw error
      setError(getErrorMessage(err.message));
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [registration, onDataLoad, checkBrowserCache]);

  // Initial fetch when component mounts or registration changes
  useEffect(() => {
    if (registration) {
      fetchAnalysisFromApi();
    }
    
    // Cleanup function to abort any pending requests when unmounting
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [registration, fetchAnalysisFromApi]);

  // Use memoization for parsed content to avoid unnecessary re-renders
  const parsedContent = useMemo(() => {
    if (analysis?.analysis) {
      return parseMarkdown(analysis.analysis);
    }
    return null;
  }, [analysis?.analysis]);

  // Loading state - styled to match GOV.UK loading states
  if (loading) {
    return (
      <GovUKContainer>
        <EnhancedLoadingContainer>
          <GovUKLoadingSpinner aria-label="Loading vehicle information" role="status" />
          <InsightBody>Loading vehicle information</InsightBody>
          <GovUKBodyS style={{ color: COLORS.DARK_GREY }}>
            Please wait while we retrieve your vehicle details
          </GovUKBodyS>
        </EnhancedLoadingContainer>
      </GovUKContainer>
    );
  }

  // Error state - styled to match GOV.UK error summary
  if (error) {
    return (
      <GovUKContainer>
        <EmptyStateContainer>
          <WarningIcon style={{ fontSize: 40, color: COLORS.RED, marginBottom: 10 }} aria-hidden="true" />
          <InsightBody>
            <ValueHighlight color={COLORS.RED}>Service unavailable</ValueHighlight>
          </InsightBody>
          <GovUKBody style={{ marginTop: '10px', marginBottom: '15px' }}>
            {error}
          </GovUKBody>
          <GovUKButton onClick={() => fetchAnalysisFromApi()}>
            Try again
          </GovUKButton>
        </EmptyStateContainer>
      </GovUKContainer>
    );
  }

  // No data state - styled to match GOV.UK notification banners
  if (!analysis) {
    return (
      <GovUKContainer>
        <EmptyStateContainer>
          <InfoIcon style={{ fontSize: 40, color: COLORS.BLUE, marginBottom: 10 }} aria-hidden="true" />
          <InsightBody>
            No vehicle information is available
          </InsightBody>
          <GovUKBody style={{ marginTop: '10px' }}>
            The requested information for this vehicle registration cannot be displayed.
          </GovUKBody>
        </EmptyStateContainer>
      </GovUKContainer>
    );
  }

  // Success state with vehicle information
  return (
    <GovUKContainer>
      <InsightsContainer>
        <AnalysisPanel>
          <HeadingWithTooltip 
            tooltip="This report is compiled from manufacturer data, service records, and vehicle statistics"
            iconColor={COLORS.BLUE}
          >
            <GovUKHeadingM>Vehicle Information Report</GovUKHeadingM>
          </HeadingWithTooltip>
          
          <InsightBody>
            This report provides information about the {vehicleData?.make} {vehicleData?.model}, 
            including maintenance requirements and reliability information.
          </InsightBody>
          
          {/* Render memoized parsed markdown content */}
          {parsedContent}
          
          {/* Add the note at the bottom */}
          <InsightNote>
            <InfoIcon 
              fontSize="small" 
              style={{ verticalAlign: 'middle', marginRight: '5px', color: COLORS.BLUE }} 
              aria-hidden="true" 
            />
            <span className="govuk-visually-hidden">Important note:</span>
            This report is based on manufacturer data and vehicle records. 
            Individual vehicle experiences may vary based on maintenance history and usage.
          </InsightNote>
        </AnalysisPanel>
      </InsightsContainer>
    </GovUKContainer>
  );
};

export default React.memo(VehicleAnalysisComponent);