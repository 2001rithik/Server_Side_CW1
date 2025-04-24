import React, { useState, useEffect } from 'react';
import '../style/home.css';
import { fetchApiUsage, fetchCountryDetails } from '../api/countryApi';

const Home = () => {
  // State hooks to store various data
  const [countryName, setCountryName] = useState(''); // Holds the country name for search
  const [countryDetails, setCountryDetails] = useState(null); // Holds the country details after fetch
  const [error, setError] = useState(''); // Holds error message, if any
  const [usageData, setUsageData] = useState(null); // Holds API usage data

  // useEffect hook to fetch API usage data when the component mounts
  useEffect(() => {
    const loadUsage = async () => {
      try {
        // Fetch current API usage data
        const usage = await fetchApiUsage();
        setUsageData(usage);
      } catch (err) {
        console.error('Failed to fetch usage on load:', err.message);
      }
    };

    loadUsage(); // Trigger API usage fetch on component mount
  }, []); // Empty dependency array ensures it runs only once

  // Handler for the search button click
  const handleSearch = async () => {
    try {
      // Fetch country details based on the entered country name
      const data = await fetchCountryDetails(countryName);
      setCountryDetails(data.country); // Set the fetched country details
      setUsageData(data.usage); // Update usage data from the response
      setError(''); // Clear any previous error
    } catch (err) {
      // In case of an error, attempt to fetch usage data again as fallback
      try {
        const fallback = await fetchApiUsage();
        setUsageData(fallback);
      } catch (fallbackError) {
        console.error('Failed fallback usage fetch:', fallbackError.message);
      }

      setCountryDetails(null); // Clear previous country details
      // Handle different error statuses and set appropriate error message
      const status = err?.response?.status;
      if (status === 429) setError('API usage limit exceeded.');
      else if (status === 404) setError('Country not found.');
      else if (status === 403 || status === 401) setError('Unauthorized or token missing.');
      else setError('Something went wrong.');
    }
  };

  // Calculate the percentage of API usage based on usage count and limit
  const usagePercent = usageData
    ? Math.round((usageData.usageCount / usageData.limit) * 100)
    : 0;

  return (
    <div className="home-page">
      {/* API Usage Panel */}
      <div className="api-usage-card">
        
        <div className="usage-info">
          <h4>Usage Information</h4>
          <p>Your API usage resets every 24 hours.</p>
          <p>Premium users get increased API limits.</p>
        </div>
      </div>

      {/* Search Country Section */}
      <div className="search-card">
        <h3>Search Country</h3>
        <div className="search-input-wrapper">
          {/* Input for entering the country name */}
          <input
            type="text"
            placeholder="Enter country name..."
            value={countryName}
            onChange={(e) => setCountryName(e.target.value)} // Update country name on change
          />
          <button onClick={handleSearch}>Search</button> {/* Trigger search on click */}
        </div>

        {/* Display error message if there is an error */}
        {error && <p className="error">{error}</p>}

        {/* Display country details if available */}
        {countryDetails && (
          <div className="country-details">
            <h4>{countryDetails.name}</h4>
            <p><strong>Capital:</strong> {countryDetails.capital}</p>
            <p><strong>Currency:</strong> {countryDetails.currency}</p>
            <p><strong>Languages:</strong> {countryDetails.languages?.join(', ')}</p>
            {/* Display country flag */}
            <img src={countryDetails.flag} alt="Flag" width="100" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
