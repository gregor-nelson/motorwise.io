import React, { useState } from 'react';

// --- API URL Configuration ---
export const isDevelopment = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

// Configure API URLs based on environment
export const INSURANCE_API_BASE_URL = isDevelopment
                    ? 'http://localhost:8004/api/v1/insurance'  // Development - Insurance API port 8004
                    : '/api/v1/insurance';                      // Production - Relative URL for Nginx
// --- End of API URL Configuration ---


const VehicleInsuranceChecker = () => {
  const [vrm, setVrm] = useState(''); // State for the registration input
  const [response, setResponse] = useState(null); // State for the API response
  const [error, setError] = useState(null); // State for error messages
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      // --- Use INSURANCE_API_BASE_URL to construct the API URL ---
      const apiUrl = `${INSURANCE_API_BASE_URL}/${vrm}`;
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.errorMessage || 'API request failed');
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Vehicle Insurance Checker</h2>

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="vrm">Enter Vehicle Registration:</label>
        <input
          type="text"
          id="vrm"
          value={vrm}
          onChange={(e) => setVrm(e.target.value.toUpperCase())} // Convert to uppercase
          placeholder="e.g., AB12CDE"
          style={{ margin: '10px', padding: '5px', width: '150px' }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !vrm}>
          {loading ? 'Checking...' : 'Check Insurance'}
        </button>
      </form>

      {/* Response Display */}
      <div style={{ marginTop: '20px' }}>
        {response && (
          <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <h3>Response:</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
        {error && (
          <div style={{ color: 'red' }}>
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleInsuranceChecker;