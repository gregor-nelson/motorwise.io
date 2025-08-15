// RepairTimesApiClient.js
// A dedicated API client for the RepairTimes API with built-in caching and error handling

/**
 * RepairTimesApiClient - A client for interacting with the Repair Times API
 * Features:
 * - Built-in in-memory caching
 * - Request deduplication
 * - Error handling and retry logic
 * - Request cancellation
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

class RepairTimesApiClient {
  constructor() {
    // In-memory request cache
    this.cache = new Map();
    
    // Active requests map - used for deduplication
    this.activeRequests = new Map();
  }
  
  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }
  
  /**
   * Generate cache key from request data
   */
  generateCacheKey(make, model, year) {
    return `${make}_${model}${year ? `_${year}` : ''}`.toLowerCase().replace(/\s+/g, '_');
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
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || response.statusText || 'API request failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      // If we have retries left and it's a recoverable error, retry
      if (attempt < RETRY_ATTEMPTS && 
          error.status !== 404 && 
          error.status !== 400 &&
          error.name !== 'AbortError') {
        
        // Exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.handleRequest(url, options, attempt + 1);
      }
      
      throw error;
    }
  }
  
  /**
   * Get repair times for a vehicle based on make, model and optional year
   */
  async getVehicleRepairTimes(make, model, year = null) {
    if (!make || !model) {
      throw new Error('Vehicle make and model are required');
    }
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(make, model, year);
    
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
        // Prepare request URL
        let url = `${API_BASE_URL}/vehicles/${encodeURIComponent(make)}/${encodeURIComponent(model)}`;
        if (year) {
          url += `?year=${encodeURIComponent(year)}`;
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
   * Lookup repair times based on complete vehicle data
   */
  async lookupRepairTimes(vehicleData) {
    if (!vehicleData || !vehicleData.make || !vehicleData.model) {
      throw new Error('Vehicle data with make and model is required');
    }
    
    const make = vehicleData.make;
    const model = vehicleData.model || vehicleData.vehicleModel;
    const year = vehicleData.year;
    
    // Generate cache key
    const cacheKey = `vehicle_${this.generateCacheKey(make, model, year)}`;
    
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
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ vehicleData }),
          credentials: isDevelopment ? 'include' : 'same-origin',
          mode: isDevelopment ? 'cors' : 'same-origin',
          signal
        };
        
        const data = await this.handleRequest(`${API_BASE_URL}/repair-times-lookup`, options);
        
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
   * Cancel all active requests
   */
  cancelAllRequests() {
    this.activeRequests.clear();
  }
}

// Create and export a singleton instance
const repairTimesApi = new RepairTimesApiClient();
export default repairTimesApi;