// =============== API CONFIGURATION ===============

// Extracted from multiple components - preserving exact logic
export const isDevelopment = window.location.hostname === 'localhost';
export const API_URL = isDevelopment ? 'http://localhost:8002/api/v1' : '/manual-api/v1';

// =============== CACHE MANAGEMENT ===============

// Centralized cache - preserving exact implementation
export const manualCache = {};
export const CACHE_STALE_TIME = 60 * 60 * 1000; // 1 hour

export const isCacheValid = (cachedTime) => {
  return (Date.now() - cachedTime) < CACHE_STALE_TIME;
};

// =============== UTILITY FUNCTIONS ===============

// Extract defect ID from text - preserving exact regex
export const extractDefectId = (text) => {
  const match = /\(?(\d+(?:\.\d+){1,2})\)?/.exec(text);
  return match ? match[1] : null;
};

// Format category - preserving exact switch logic
export const formatCategory = (category) => {
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

// =============== API FUNCTIONS ===============

// Fetch all sections - for root view
export const fetchAllSections = async () => {
  const cacheKey = 'all_sections';
  const cachedData = manualCache[cacheKey];
  
  if (cachedData && isCacheValid(cachedData.timestamp)) {
    return cachedData.data;
  }
  
  try {
    const response = await fetch(`${API_URL}/manual/all`, {
      headers: { 'Accept': 'application/json' },
      credentials: isDevelopment ? 'include' : 'same-origin',
      mode: isDevelopment ? 'cors' : 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sections: ${response.statusText}`);
    }
    
    const data = await response.json();
  
  // Extract just the sections array for consistency
  const sectionsData = {
    title: data.title,
    sections: data.sections
  };
  
  manualCache[cacheKey] = {
    data: sectionsData,
    timestamp: Date.now()
  };
  
  return sectionsData;
  } catch (error) {
    console.error('Error fetching all sections:', error);
    throw new Error(`Network error while fetching sections: ${error.message}`);
  }
};

// Fetch defect details - preserving exact implementation
export const fetchDefectDetail = async (defectId) => {
  const cacheKey = `defect_${defectId}`;
  const cachedData = manualCache[cacheKey];
  
  if (cachedData && isCacheValid(cachedData.timestamp)) {
    return cachedData.data;
  }
  
  const response = await fetch(
    `${API_URL}/manual/defect/${defectId}`, 
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
  
  return data;
};

// Fetch section data - preserving exact implementation
export const fetchSection = async (sectionId) => {
  const cacheKey = `section_${sectionId}`;
  const cachedData = manualCache[cacheKey];
  
  if (cachedData && isCacheValid(cachedData.timestamp)) {
    return cachedData.data;
  }
  
  try {
    const response = await fetch(`${API_URL}/manual/section/${sectionId}`, {
      headers: { 'Accept': 'application/json' },
      credentials: isDevelopment ? 'include' : 'same-origin',
      mode: isDevelopment ? 'cors' : 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch section: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    manualCache[cacheKey] = {
      data: data,
      timestamp: Date.now()
    };
    
    return data;
  } catch (error) {
    console.error(`Error fetching section ${sectionId}:`, error);
    throw new Error(`Network error while fetching section: ${error.message}`);
  }
};

// Fetch subsection data - preserving exact implementation
export const fetchSubsection = async (subsectionId) => {
  const cacheKey = `subsection_${subsectionId}`;
  const cachedData = manualCache[cacheKey];
  
  if (cachedData && isCacheValid(cachedData.timestamp)) {
    return cachedData.data;
  }
  
  try {
    const response = await fetch(`${API_URL}/manual/subsection/${subsectionId}`, {
      headers: { 'Accept': 'application/json' },
      credentials: isDevelopment ? 'include' : 'same-origin',
      mode: isDevelopment ? 'cors' : 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subsection: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    manualCache[cacheKey] = {
      data: data,
      timestamp: Date.now()
    };
    
    return data;
  } catch (error) {
    console.error(`Error fetching subsection ${subsectionId}:`, error);
    throw new Error(`Network error while fetching subsection: ${error.message}`);
  }
};

// Search manual - preserving exact implementation
export const searchManual = async (query) => {
  try {
    const response = await fetch(`${API_URL}/manual/search/${encodeURIComponent(query)}`, {
      headers: { 'Accept': 'application/json' },
      credentials: isDevelopment ? 'include' : 'same-origin',
      mode: isDevelopment ? 'cors' : 'same-origin'
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error searching manual for '${query}':`, error);
    throw new Error(`Search failed: ${error.message}`);
  }
};

// Fetch path titles for breadcrumbs - preserving exact implementation
export const fetchPathTitles = async (currentPath) => {
  if (!currentPath || currentPath.length === 0) {
    return {};
  }

  const newTitles = {};
  
  // Build path segments to fetch
  const pathsToFetch = [];
  for (let i = 1; i <= currentPath.length; i++) {
    const pathSegment = currentPath.slice(0, i).join('.');
    pathsToFetch.push(pathSegment);
  }

  // Fetch all path segments
  for (const pathSegment of pathsToFetch) {
    const cacheKey = `path_${pathSegment}`;
    let data;

    // Check cache first
    const cachedData = manualCache[cacheKey];
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      data = cachedData.data;
    } else {
      // Determine endpoint based on path depth
      let endpoint;
      const parts = pathSegment.split('.');
      if (parts.length === 1) {
        endpoint = `section/${pathSegment}`;
      } else if (parts.length === 2) {
        endpoint = `subsection/${pathSegment}`;
      } else {
        endpoint = `item/${pathSegment}`;
      }

      try {
        const response = await fetch(`${API_URL}/manual/${endpoint}`, {
          headers: { 'Accept': 'application/json' },
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin'
        });

        if (response.ok) {
          data = await response.json();
          manualCache[cacheKey] = {
            data: data,
            timestamp: Date.now()
          };
        }
      } catch (err) {
        console.warn(`Failed to fetch title for ${pathSegment}:`, err);
      }
    }

    if (data) {
      // Extract title based on response structure
      if (data.item) {
        newTitles[pathSegment] = data.item.title;
      } else if (data.title) {
        newTitles[pathSegment] = data.title;
      }
    }
  }

  return newTitles;
};