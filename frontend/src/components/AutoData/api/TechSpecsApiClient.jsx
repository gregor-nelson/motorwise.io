// TechSpecsApiClient.js
// Enhanced API client for the Technical Specifications API with fuel type support
// Includes built-in caching, error handling, and request deduplication

/**
 * TechSpecsApiClient - A client for interacting with the Technical Specifications API
 * Features:
 * - Built-in in-memory caching
 * - Request deduplication
 * - Error handling and retry logic
 * - Request cancellation
 * - Fuel type support for more accurate matching
 */

// Determine environment for API URL
const isDevelopment = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
                      
const API_BASE_URL = isDevelopment
                    ? 'http://localhost:8005/api/v1' 
                    : '/api/v1';

// Cache configuration
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes cache TTL
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Normalize fuel type string to standard format
 * @param {string} fuelType - The fuel type string to normalize
 * @returns {string|null} - Normalized fuel type or null if not provided/invalid
 */
function normalizeFuelType(fuelType) {
  if (!fuelType) return null;
  
  // Convert to lowercase and trim
  const normalized = fuelType.toLowerCase().trim();
  
  // Map common variations to standard values
  if (['gasoline', 'unleaded', 'gas', 'petrol'].includes(normalized)) {
    return 'petrol';
  } else if (['diesel', 'gasoil', 'derv'].includes(normalized)) {
    return 'diesel';
  } else if (['hybrid', 'phev', 'hev'].includes(normalized)) {
    return 'hybrid';
  } else if (['electric', 'ev', 'bev'].includes(normalized)) {
    return 'electric';
  }
  
  // Return as-is for other values
  return normalized;
}

class TechSpecsApiClient {
  constructor() {
    // In-memory request cache
    this.cache = new Map();
    
    // Active requests map - used for deduplication
    this.activeRequests = new Map();
    
    // Debug mode flag - set to true to enable detailed logging
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
      console.log('[TechSpecsApiClient]', ...args);
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
   * Remove a specific item from cache
   * @param {string} key - Cache key to remove
   */
  removeFromCache(key) {
    this.cache.delete(key);
    this.debugLog(`Removed ${key} from cache`);
  }
  
  /**
   * Generate cache key from request data
   * @param {string} make - Vehicle make
   * @param {string} model - Vehicle model
   * @param {number|null} year - Optional vehicle year
   * @param {string|null} fuelType - Optional vehicle fuel type
   * @returns {string} - Generated cache key
   */
  generateCacheKey(make, model, year, fuelType) {
    // Normalize fuel type
    const normalizedFuelType = normalizeFuelType(fuelType);
    
    // Build key parts - only include non-empty values
    const keyParts = [make, model];
    if (year) keyParts.push(year.toString());
    if (normalizedFuelType) keyParts.push(normalizedFuelType);
    
    // Join and normalize format
    return keyParts.join('_').toLowerCase().replace(/\s+/g, '_');
  }
  
  /**
   * Check if a cached response is valid
   * @param {Object} cachedData - Cached data object
   * @returns {boolean} - Whether the cached data is still valid
   */
  isValidCache(cachedData) {
    if (!cachedData) return false;
    
    const { timestamp } = cachedData;
    const now = Date.now();
    
    return now - timestamp < CACHE_TTL;
  }
  
  /**
   * Handle API errors with retry logic
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @param {number} attempt - Current attempt number
   * @returns {Promise<any>} - Response data
   */
  async handleRequest(url, options, attempt = 0) {
    try {
      this.debugLog(`Request ${attempt > 0 ? `attempt ${attempt+1}` : ''}: ${options.method} ${url}`);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || errorData.detail || response.statusText || 'API request failed');
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
   * Get technical specifications for a vehicle based on make, model and optional parameters
   * @param {string} make - Vehicle make
   * @param {string} model - Vehicle model
   * @param {number|null} year - Optional vehicle year
   * @param {string|null} fuelType - Optional vehicle fuel type
   * @returns {Promise<Object>} - Technical specifications data
   */
  async getVehicleTechSpecs(make, model, year = null, fuelType = null) {
    if (!make || !model) {
      throw new Error('Vehicle make and model are required');
    }
    
    // Normalize fuel type
    const normalizedFuelType = normalizeFuelType(fuelType);
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(make, model, year, normalizedFuelType);
    
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
        // Prepare request URL
        let url = `${API_BASE_URL}/tech-specs/${encodeURIComponent(make)}/${encodeURIComponent(model)}`;
        const params = new URLSearchParams();
        
        if (year) {
          params.append('year', year);
        }
        
        if (normalizedFuelType) {
          params.append('fuel_type', normalizedFuelType);
        }
        
        // Add parameters to URL if any exist
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
        
        const data = await this.handleRequest(url, options);
        
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
   * Lookup technical specifications based on complete vehicle data
   * @param {Object} vehicleData - Vehicle data object
   * @param {string} vehicleData.make - Vehicle make
   * @param {string} vehicleData.model - Vehicle model
   * @param {number|string} [vehicleData.year] - Year of manufacture
   * @param {string} [vehicleData.fuelType] - Fuel type
   * @returns {Promise<Object>} - Technical specifications data
   */
  async lookupTechSpecs(vehicleData) {
    if (!vehicleData || !vehicleData.make || !vehicleData.model) {
      throw new Error('Vehicle data with make and model is required');
    }
    
    const make = vehicleData.make;
    const model = vehicleData.model || vehicleData.vehicleModel;
    const year = vehicleData.year;
    const fuelType = vehicleData.fuelType;
    
    // Normalize fuel type
    const normalizedFuelType = normalizeFuelType(fuelType);
    
    // Generate cache key
    const cacheKey = `tech_specs_${this.generateCacheKey(make, model, year, normalizedFuelType)}`;
    
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
        this.debugLog('Looking up tech specs for vehicle:', {
          make, model, year, fuelType: normalizedFuelType
        });
        
        const options = {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            vehicleData: {
              ...vehicleData,
              // Ensure we use the normalized fuel type
              fuelType: normalizedFuelType || vehicleData.fuelType
            } 
          }),
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin',
          signal
        };
        
        const data = await this.handleRequest(`${API_BASE_URL}/tech-specs-lookup`, options);
        
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
   * Get all available vehicles from the API
   * @param {string} [dataType] - Optional filter by data type ('repair_times', 'tech_specs')
   * @returns {Promise<Object>} - List of available vehicles
   */
  async getAvailableVehicles(dataType = null) {
    const cacheKey = `available_vehicles${dataType ? `_${dataType}` : ''}`;
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (this.isValidCache(cachedData)) {
      return cachedData.data;
    }
    
    // Build URL with optional data type filter
    let url = `${API_BASE_URL}/vehicles`;
    if (dataType) {
      url += `?data_type=${encodeURIComponent(dataType)}`;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: isDevelopment ? 'include' : 'same-origin',
      mode: isDevelopment ? 'cors' : 'same-origin'
    };
    
    const data = await this.handleRequest(url, options);
    
    // Store in cache
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  /**
   * Determine fuel type from vehicle data if not explicitly provided
   * Useful for older vehicles where fuel type might be deduced from other data
   * @param {Object} vehicleData - Vehicle data object
   * @returns {string|null} - Determined fuel type or null if cannot determine
   */
  determineFuelType(vehicleData) {
    if (!vehicleData) return null;
    
    // First check for explicit fuel type
    if (vehicleData.fuelType) {
      return normalizeFuelType(vehicleData.fuelType);
    }
    
    // Check model name for common diesel indicators
    const model = (vehicleData.model || '').toLowerCase();
    if (/tdi|cdi|hdi|dci|crdi|d4d|jtd|tdci/.test(model)) {
      return 'diesel';
    }
    
    // Check for indications in engine size or variant
    const engineCapacity = parseInt(vehicleData.engineCapacity || 0, 10);
    const variant = (vehicleData.variant || '').toLowerCase();
    
    // Common diesel indicators in variant descriptions
    if (/diesel|tdi|cdi|hdi|dci|crdi|d4d|jtd|tdci/.test(variant)) {
      return 'diesel';
    }
    
    // Common petrol indicators in variant descriptions
    if (/petrol|gasoline|tsi|mpi|gdi|vti|tfsi/.test(variant)) {
      return 'petrol';
    }
    
    // Rough heuristic based on engine capacity
    // This is not always reliable but can help in some cases
    if (engineCapacity > 0) {
      // In the UK, diesel engines rarely come in small displacements
      if (engineCapacity < 1000) {
        return 'petrol';
      }
    }
    
    // Return null if we can't determine
    return null;
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
const techSpecsApi = new TechSpecsApiClient();
export default techSpecsApi;