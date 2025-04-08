// vehicle-analysis-middleware.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Claude API configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Cache configuration
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Middleware to check cache before proceeding
 */
function checkCache(req, res, next) {
  const { registration } = req.params;
  const cacheKey = `analysis_${registration}`;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
    console.log(`Cache hit for vehicle analysis: ${registration}`);
    return res.json(cachedData.data);
  }
  
  next();
}

/**
 * Middleware to fetch and combine MOT and TSB data
 */
async function getVehicleData(req, res, next) {
  const { registration } = req.params;
  
  try {
    console.log(`Fetching vehicle data for: ${registration}`);
    
    // Fetch MOT data
    const motResponse = await axios.get(
      `${process.env.API_BASE_URL}/vehicle/registration/${registration}`,
      {
        headers: { 'Accept': 'application/json' },
        timeout: 10000 // 10 second timeout
      }
    );
    
    if (!motResponse.data) {
      return res.status(404).json({ error: 'No MOT data found for this vehicle' });
    }
    
    // Extract make, model and engine data
    const vehicleData = {
      make: motResponse.data.make,
      model: motResponse.data.model,
      engineCode: motResponse.data.engineCode || null,
      year: motResponse.data.manufactureDate ? new Date(motResponse.data.manufactureDate).getFullYear() : null
    };
    
    // Fetch TSB data
    const tsbResponse = await axios.get(
      `${process.env.API_BASE_URL}/bulletins/lookup/${vehicleData.make}/${vehicleData.model}`,
      {
        params: {
          engine_code: vehicleData.engineCode,
          year: vehicleData.year
        },
        headers: { 'Accept': 'application/json' },
        timeout: 10000
      }
    );
    
    // Attach data to request for next middleware
    req.vehicleData = {
      registration,
      motData: motResponse.data,
      tsbData: tsbResponse.data,
      vehicleInfo: vehicleData
    };
    
    next();
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vehicle data',
      details: error.message 
    });
  }
}

/**
 * Clean and format MOT history for analysis
 */
function prepareMotHistoryForAnalysis(motData) {
  // Extract only the essential MOT test information
  if (!motData || !motData.motTests) return [];
  
  return motData.motTests.map(test => ({
    date: test.completedDate,
    result: test.testResult,
    mileage: test.odometerValue,
    defects: test.defects ? test.defects.map(d => ({
      text: d.text,
      type: d.type,
      category: d.category || null
    })) : []
  }));
}

/**
 * Middleware to analyze data with Claude API
 */
async function analyzeWithClaude(req, res) {
  try {
    const { registration, motData, tsbData, vehicleInfo } = req.vehicleData;
    
    console.log(`Analyzing data for ${registration} with Claude API`);
    
    const motHistory = prepareMotHistoryForAnalysis(motData);
    
    // Prepare the prompt for Claude
    const prompt = `I need to analyze MOT history and Technical Service Bulletins for a vehicle and produce a technical analysis component that would fit seamlessly in a premium vehicle report. 

Please analyze the patterns, potential issues, and correlations between the MOT history and known manufacturer issues for this ${vehicleInfo.make} ${vehicleInfo.model}.

Return the analysis in markdown format with these sections:
1. A top-level risk assessment table with visual indicators (use emoji ✓, ⚠️, 🔴)
2. Key Findings organized by vehicle system (only include systems with actual issues)
3. Technical Bulletin Matches table showing connections between MOT issues and known bulletins
4. MOT Failure Pattern analysis if relevant
5. Summary Notes that are factual and concise

IMPORTANT GUIDELINES:
- The analysis must be factual and ONLY based on information in the provided data
- Do NOT include any cost estimates or timeframes for repairs
- Do NOT make assumptions about future problems without evidence
- Do NOT include empty sections if there is no relevant data
- Make the analysis professional, concise, and informative

MOT History:
${JSON.stringify(motHistory, null, 2)}

Technical Service Bulletins:
${JSON.stringify(tsbData, null, 2)}`;
    
    // Prepare the payload for Claude
    const payload = {
      model: "claude-3-7-sonnet-20250219", // Use latest model
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ]
    };
    
    // Call Claude API
    const claudeResponse = await axios.post(CLAUDE_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Extract the analysis from Claude's response
    const analysis = claudeResponse.data.content[0].text;
    
    // Prepare response data
    const responseData = {
      registration,
      analysis,
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      timestamp: Date.now()
    };
    
    // Cache the result
    const cacheKey = `analysis_${registration}`;
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    // Return Claude's analysis
    res.json(responseData);
    
  } catch (error) {
    console.error('Error analyzing with Claude:', error);
    res.status(500).json({ 
      error: 'Failed to analyze vehicle data',
      details: error.response?.data || error.message
    });
  }
}

/**
 * Admin route to clear the cache
 */
router.post('/vehicle-analysis/clear-cache', (req, res) => {
  cache.clear();
  res.json({ message: 'Analysis cache cleared successfully' });
});

/**
 * Route to get vehicle analysis
 */
router.get('/vehicle-analysis/:registration', checkCache, getVehicleData, analyzeWithClaude);

module.exports = router;