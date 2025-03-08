import React, { useState, useEffect } from 'react';
import {
  GovUKBody,
  GovUKHeadingS,
  GovUKInsetText,
  GovUKLoadingSpinner,
  GovUKList,
  COLORS
} from '../../styles/theme';

// Alert component for errors
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const MOT_MANUAL_API_URL = isDevelopment 
                    ? 'http://localhost:8002/api/v1'  // Development - direct to API port
                    : '/manual-api/v1';              // Production - use relative URL for Nginx proxy

// Cache for storing MOT manual data
const manualCache = {};

// Styled components
const ExpandableContainer = styled('div')(({ expanded }) => ({
  cursor: 'pointer',
  padding: '8px 0',
  borderLeft: expanded ? `5px solid ${COLORS.BLUE}` : 'none',
  paddingLeft: expanded ? '10px' : '0',
  transition: 'all 0.2s ease',
  marginBottom: '10px',
  '&:hover': {
    color: COLORS.BLUE,
    textDecoration: 'underline',
  },
}));

const DetailContent = styled('div')({
  marginTop: '10px',
  paddingLeft: '5px',
  color: COLORS.BLACK, // Reset text color for the content
  '&:hover': {
    color: COLORS.BLACK, // Prevent hover effect on the details
    textDecoration: 'none',
  },
});

const MotDefectDetail = ({ defectId, defectText, defectCategory }) => {
  const [defectDetail, setDefectDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Configure the stale time in milliseconds (1 hour)
  const CACHE_STALE_TIME = 60 * 60 * 1000;

  // Helper to check if cached data is still valid
  const isCacheValid = (cachedTime) => {
    return (Date.now() - cachedTime) < CACHE_STALE_TIME;
  };

  // Extract defect ID from text if not provided explicitly
  const extractDefectId = (text) => {
    // Common pattern: defect ID might appear in the text like "(1.1.13)" or similar
    const match = /\(?(\d+\.\d+(?:\.\d+)?)\)?/.exec(text);
    return match ? match[1] : null;
  };

  // Get the defect ID to use - either from props or extracted from text
  const getDefectIdToUse = () => {
    if (defectId) return defectId;
    return extractDefectId(defectText);
  };

  // Fetch defect details
  useEffect(() => {
    const fetchDefectDetail = async () => {
      const idToUse = getDefectIdToUse();
      if (!idToUse) {
        // No ID available, nothing to fetch
        return;
      }

      // Check cache first
      const cacheKey = `defect_${idToUse}`;
      const cachedData = manualCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        setDefectDetail(cachedData.data);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Log the API request in development mode
        if (isDevelopment) {
          console.log(`Fetching MOT manual data from: ${MOT_MANUAL_API_URL}/manual/defect/${idToUse}`);
        }
        
        const response = await fetch(
          `${MOT_MANUAL_API_URL}/manual/defect/${idToUse}`, 
          {
            headers: {
              'Accept': 'application/json',
            },
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin'
          }
        );
        
        // Parse JSON response
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to fetch defect details');
        }
        
        // Store in cache with timestamp
        manualCache[cacheKey] = {
          data: data,
          timestamp: Date.now()
        };
        
        setDefectDetail(data);
      } catch (err) {
        console.error('API error:', err);
        setError(err.message || 'An error occurred while fetching defect details');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if expanded
    if (expanded) {
      fetchDefectDetail();
    }
  }, [defectId, defectText, expanded]);

  // Format defect category for display
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

  // Toggle expanded state
  const toggleExpanded = (e) => {
    // Prevent click from bubbling up
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // If no defect ID could be found or extracted
  const idToUse = getDefectIdToUse();
  if (!idToUse) {
    return null;
  }

  // Returns the content for the detail - no icon or ID displayed
  return (
    <ExpandableContainer 
      expanded={expanded}
      onClick={toggleExpanded}
      aria-expanded={expanded}
      role="button"
      tabIndex={0}
      title={`${expanded ? 'Hide' : 'View'} MOT manual reference details`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleExpanded(e);
        }
      }}
    >
      {/* The text is being rendered by the parent component */}
      
      {/* Show expanded content only when expanded */}
      {expanded && (
        <DetailContent onClick={(e) => e.stopPropagation()}>
          {loading && <GovUKLoadingSpinner />}
          
          {error && (
            <Alert severity="warning" style={{ marginBottom: '10px', textDecoration: 'none' }}>
              {error}
            </Alert>
          )}
          
          {!loading && !error && defectDetail && (
            <>
              {defectDetail.path && defectDetail.path.length > 0 && (
                <GovUKBody>
                  <strong>Manual section:</strong> {defectDetail.path.map(p => p.title).join(' > ')}
                </GovUKBody>
              )}
              
              {defectDetail.data && defectDetail.data.description && (
                <GovUKInsetText>
                  {defectDetail.data.description}
                </GovUKInsetText>
              )}
              
              {defectDetail.data && defectDetail.data.defects && (
                <>
                  <GovUKHeadingS>Related defects:</GovUKHeadingS>
                  <GovUKList>
                    {defectDetail.data.defects.map((defect, index) => (
                      <li key={index}>
                        <strong>{formatCategory(defect.category)}:</strong> {defect.description}
                      </li>
                    ))}
                  </GovUKList>
                </>
              )}
              
              {defectDetail.data && defectDetail.data.subItems && (
                <>
                  <GovUKHeadingS>Testing procedure:</GovUKHeadingS>
                  {defectDetail.data.subItems.map((subItem, index) => (
                    <div key={index}>
                      <strong>{subItem.title}</strong>
                      <GovUKBody>{subItem.description}</GovUKBody>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
          
          {!loading && !error && defectDetail && defectDetail.matches && (
            <>
              <GovUKHeadingS>Multiple matches found:</GovUKHeadingS>
              <GovUKList>
                {defectDetail.matches.map((match, index) => (
                  <li key={index}>
                    <strong>{match.id}: {match.title}</strong>
                    {match.data.description && (
                      <GovUKBody>{match.data.description}</GovUKBody>
                    )}
                  </li>
                ))}
              </GovUKList>
            </>
          )}
        </DetailContent>
      )}
    </ExpandableContainer>
  );
};

export default MotDefectDetail;