// BulletinsApiClient.js
// A dedicated API client for the Bulletins API with built-in caching and error handling

/**
 * BulletinsApiClient - A client for interacting with the Bulletins API
 * Features:
 * - Built-in in-memory caching
 * - Request deduplication
 * - Error handling and retry logic
 * - Request cancellation
 * - Enhanced vehicle data matching
 */

// Determine environment for API URL
const isDevelopment = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
                      
const API_BASE_URL = isDevelopment
                    ? 'http://localhost:8006/api/v1' 
                    : '/api/v1';

// Cache configuration
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes cache TTL
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Extract model year from various possible date fields in vehicleData
 * @param {Object} vehicleData - Vehicle data object
 * @returns {number|null} - Extracted year or null if not found
 */
function extractVehicleYear(vehicleData) {
  if (!vehicleData) return null;
  
  // First check if we already have a year field
  if (vehicleData.year && typeof vehicleData.year === 'number') {
    return vehicleData.year;
  }
  
  // Try different date fields that might contain year information
  const dateFields = [
    'manufactureDate',
    'yearOfManufacture',
    'registrationDate',
    'firstRegisteredDate',
    'firstRegistrationDate'
  ];
  
  for (const field of dateFields) {
    if (vehicleData[field]) {
      // If it's a string, try to extract a 4-digit year
      if (typeof vehicleData[field] === 'string') {
        const yearMatch = /(\d{4})/.exec(vehicleData[field]);
        if (yearMatch) {
          return parseInt(yearMatch[1], 10);
        }
      }
      
      // If it's a number in a reasonable year range
      if (typeof vehicleData[field] === 'number' && 
          vehicleData[field] > 1900 && 
          vehicleData[field] < 2100) {
        return vehicleData[field];
      }
    }
  }
  
  return null;
}

class BulletinsApiClient {
  constructor(baseUrl = API_BASE_URL) {
    // In-memory request cache
    this.cache = new Map();
    
    // Active requests map - used for deduplication
    this.activeRequests = new Map();
    
    // API base URL
    this.baseUrl = baseUrl;
    
    // Debug mode flag
    this.debug = false;
  }
  
  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether debug mode should be enabled
   */
  setDebugMode(enabled) {
    this.debug = !!enabled;
  }
  
  /**
   * Log debug messages when debug mode is enabled
   * @param {...any} args - Arguments to pass to console.log
   */
  debugLog(...args) {
    if (this.debug) {
      console.log('[BulletinsApiClient]', ...args);
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
    this.debugLog('Cache cleared');
  }
  
  /**
   * Generate cache key from request data
   */
  generateCacheKey(make, model, engineCode = null, year = null, category = null, bulletinId = null) {
    return `bulletins_${make}_${model}${engineCode ? `_${engineCode}` : ''}${year ? `_${year}` : ''}${category ? `_${category}` : ''}${bulletinId ? `_${bulletinId}` : ''}`.toLowerCase().replace(/\s+/g, '_');
  }
  
  /**
   * Check if a cached response is valid
   */
  isValidCache(cachedData) {
    if (!cachedData) return false;
    
    const { timestamp } = cachedData;
    const now = Date.now();
    
    return now - timestamp < CACHE_TTL;
  }
  
  /**
   * Handle API errors with retry logic
   */
  async handleRequest(url, options, attempt = 0) {
    try {
      this.debugLog(`Request ${attempt > 0 ? `attempt ${attempt+1}` : ''}: ${options.method} ${url}`);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || response.statusText || 'API request failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      const data = await response.json();
      this.debugLog('Response received:', { url, status: response.status });
      return data;
    } catch (error) {
      // If we have retries left and it's a recoverable error, retry
      if (attempt < RETRY_ATTEMPTS && 
          error.status !== 404 && 
          error.status !== 400 &&
          error.name !== 'AbortError') {
        
        // Exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        this.debugLog(`Request failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.handleRequest(url, options, attempt + 1);
      }
      
      // Log error details in debug mode
      this.debugLog('Request failed permanently:', error);
      throw error;
    }
  }
  
  /**
   * Lookup bulletins for a vehicle based on make, model and optional parameters
   */
  async getBulletins(make, model, engineCode = null, year = null, category = null, bulletinId = null) {
    if (!make || !model) {
      throw new Error('Vehicle make and model are required');
    }
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(make, model, engineCode, year, category, bulletinId);
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (this.isValidCache(cachedData)) {
      this.debugLog(`Cache hit for ${cacheKey}`);
      return cachedData.data;
    }
    
    this.debugLog(`Cache miss for ${cacheKey}`);
    
    // Check if there's already an active request for this data
    if (this.activeRequests.has(cacheKey)) {
      this.debugLog(`Returning existing request promise for ${cacheKey}`);
      return this.activeRequests.get(cacheKey);
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Create the promise for this request
    const requestPromise = (async () => {
      try {
        let data;
        
        // If engine code or year is available, use POST endpoint for better matching
        if (engineCode || year) {
          const options = {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              make,
              model,
              engine_code: engineCode,
              year
            }),
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin',
            signal
          };
          
          data = await this.handleRequest(`${this.baseUrl}/bulletins/lookup`, options);
        } else {
          // Use standard GET endpoint
          let url = `${this.baseUrl}/bulletins/lookup/${encodeURIComponent(make)}/${encodeURIComponent(model)}`;
          
          // Add query parameters if needed
          const params = new URLSearchParams();
          if (category) {
            params.append('category', category);
          }
          if (bulletinId) {
            params.append('bulletin_id', bulletinId);
          }
          
          if (params.toString()) {
            url += `?${params.toString()}`;
          }
          
          const options = {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin',
            signal
          };
          
          data = await this.handleRequest(url, options);
        }
        
        // Store in cache
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        this.debugLog(`Stored ${cacheKey} in cache`);
        return data;
      } finally {
        // Always clean up the active request when done
        this.activeRequests.delete(cacheKey);
      }
    })();
    
    // Store the promise in activeRequests
    this.activeRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * NEW: Enhanced lookup method that takes complete vehicle data object
   * Similar to lookupTechSpecs in TechSpecsApiClient
   * @param {Object} vehicleData - Complete vehicle data object
   * @param {string} category - Optional category filter
   * @param {string} bulletinId - Optional specific bulletin ID
   * @returns {Promise<Object>} - Bulletins data
   */
  async lookupBulletins(vehicleData, category = null, bulletinId = null) {
    if (!vehicleData || !vehicleData.make || !vehicleData.model) {
      throw new Error('Vehicle data with make and model is required');
    }
    
    const make = vehicleData.make;
    const model = vehicleData.model || vehicleData.vehicleModel;
    
    // Extract year from vehicle data using the helper function
    const year = extractVehicleYear(vehicleData);
    
    // Extract engine code from various possible fields
    let engineCode = vehicleData.engineCode || vehicleData.engine_code;
    
    // If no explicit engine code, try to find it in other fields
    if (!engineCode) {
      const engineFields = ['engine', 'engineDescription', 'engineSize', 'engineCapacity'];
      for (const field of engineFields) {
        if (vehicleData[field]) {
          // For engine capacity, we might need to format it (e.g., "1998" -> "2.0")
          if (field === 'engineCapacity' && typeof vehicleData[field] === 'number') {
            // Format as X.X liters if over 1000cc
            if (vehicleData[field] >= 1000) {
              engineCode = `${(vehicleData[field] / 1000).toFixed(1)}`;
            } else {
              engineCode = vehicleData[field].toString();
            }
          } else {
            engineCode = vehicleData[field].toString();
          }
          break;
        }
      }
    }
    
    // Generate a cache key that includes all parameters
    const cacheKey = `bulletins_lookup_${this.generateCacheKey(make, model, engineCode, year, category, bulletinId)}`;
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (this.isValidCache(cachedData)) {
      this.debugLog(`Cache hit for ${cacheKey}`);
      return cachedData.data;
    }
    
    this.debugLog(`Cache miss for ${cacheKey}`);
    
    // Check if there's already an active request for this data
    if (this.activeRequests.has(cacheKey)) {
      this.debugLog(`Returning existing request promise for ${cacheKey}`);
      return this.activeRequests.get(cacheKey);
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Create the promise for this request
    const requestPromise = (async () => {
      try {
        this.debugLog('Looking up bulletins for vehicle:', {
          make, model, year, engineCode
        });
        
        // Prepare request body with complete vehicle data
        const requestBody = {
          make,
          model,
          year,
          engine_code: engineCode,
          vehicle_id: vehicleData.vehicleId || vehicleData.vehicle_id
        };
        
        // Include category and bulletin_id if provided
        if (category) {
          requestBody.category = category;
        }
        
        if (bulletinId) {
          requestBody.bulletin_id = bulletinId;
        }
        
        const options = {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin',
          signal
        };
        
        const data = await this.handleRequest(`${this.baseUrl}/bulletins/lookup`, options);
        
        // Store in cache
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        this.debugLog(`Stored ${cacheKey} in cache`);
        return data;
      } finally {
        // Always clean up the active request when done
        this.activeRequests.delete(cacheKey);
      }
    })();
    
    // Store the promise in activeRequests
    this.activeRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * Get specific bulletin details by ID
   * Note: This is optional and only needed if you fetch individual bulletins
   */
  async getBulletinById(bulletinId) {
    if (!bulletinId) {
      throw new Error('Bulletin ID is required');
    }
    
    const cacheKey = `bulletin_detail_${bulletinId}`;
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (this.isValidCache(cachedData)) {
      return cachedData.data;
    }
    
    // Check if there's already an active request for this data
    if (this.activeRequests.has(cacheKey)) {
      return this.activeRequests.get(cacheKey);
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Create the promise for this request
    const requestPromise = (async () => {
      try {
        const options = {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin',
          signal
        };
        
        const data = await this.handleRequest(`${this.baseUrl}/bulletins/${encodeURIComponent(bulletinId)}`, options);
        
        // Store in cache
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        return data;
      } finally {
        // Always clean up the active request when done
        this.activeRequests.delete(cacheKey);
      }
    })();
    
    // Store the promise in activeRequests
    this.activeRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * Get all available bulletins with optional make filter
   */
  async getAllAvailableBulletins(make = null) {
    const cacheKey = `available_bulletins${make ? `_${make}` : ''}`.toLowerCase();
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (this.isValidCache(cachedData)) {
      return cachedData.data;
    }
    
    // Check if there's already an active request for this data
    if (this.activeRequests.has(cacheKey)) {
      return this.activeRequests.get(cacheKey);
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Create the promise for this request
    const requestPromise = (async () => {
      try {
        let url = `${this.baseUrl}/bulletins`;
        if (make) {
          url += `?make=${encodeURIComponent(make)}`;
        }
        
        const options = {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin',
          signal
        };
        
        const data = await this.handleRequest(url, options);
        
        // Store in cache
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        return data;
      } finally {
        // Always clean up the active request when done
        this.activeRequests.delete(cacheKey);
      }
    })();
    
    // Store the promise in activeRequests
    this.activeRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * Clear the server-side cache
   * This is an administrative function and should be used carefully
   */
  async clearServerCache() {
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: isDevelopment ? 'include' : 'same-origin',
      mode: isDevelopment ? 'cors' : 'same-origin'
    };
    
    return this.handleRequest(`${this.baseUrl}/cache/clear`, options);
  }
  
  /**
   * Check API health
   */
  async checkHealth() {
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: isDevelopment ? 'include' : 'same-origin',
      mode: isDevelopment ? 'cors' : 'same-origin'
    };
    
    return this.handleRequest(`${this.baseUrl.replace('/api/v1', '')}/health`, options);
  }
  
  /**
   * Cancel all active requests
   */
  cancelAllRequests() {
    this.activeRequests.clear();
    this.debugLog('All active requests cancelled');
  }
}

// Create and export a singleton instance
const bulletinsApi = new BulletinsApiClient();
export default bulletinsApi;