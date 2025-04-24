import axios from 'axios';

/**
 * Get a cookie's value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Fetch country details from the API
 * @param {string} countryName - Name of the country to fetch data for
 * @returns {Promise<Object>} - Country data from server
 */
export const fetchCountryDetails = async (countryName) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const apiKey = user?.api_key;
    const csrfToken = getCookie('csrf-token'); // Retrieve CSRF token from cookies

    if (!apiKey || !csrfToken) {
      throw new Error('Missing API key or CSRF token in cookies/localStorage');
    }

    const response = await axios.get(
      `http://localhost:3000/api/country?name=${encodeURIComponent(countryName)}`,
      {
        headers: {
          'x-api-key': apiKey,
          'x-csrf-token': csrfToken
        },
        withCredentials: true // Ensures JWT cookie is sent with request
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching country details:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch current API usage for the authenticated user
 * @returns {Promise<Object>} - Usage data from server
 */
export const fetchApiUsage = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const apiKey = user?.api_key;
    const csrfToken = getCookie('csrf-token');

    if (!apiKey || !csrfToken) {
      throw new Error('Missing API key or CSRF token in cookies/localStorage');
    }

    const response = await axios.get(`http://localhost:3000/api/usage/${user.id}`, {
      headers: {
        'x-api-key': apiKey,
        'x-csrf-token': csrfToken
      },
      withCredentials: true // Required for sending JWT cookie
    });

    console.log("Fetched API usage data:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching API usage:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch total number of API keys generated in the system
 * @returns {Promise<Object>} - Total API key count from server
 */
export const fetchTotalApiKeyCount = async () => {
  try {
    const csrfToken = getCookie('csrf-token');

    if (!csrfToken) {
      throw new Error('Missing CSRF token');
    }

    const response = await axios.get('http://localhost:3000/api/usage/total-api-keys', {
      headers: {
        'x-csrf-token': csrfToken
      },
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching total API key count:', error.response?.data || error.message);
    throw error;
  }
};

// Add these functions to countryApi.js

/**
 * Fetch API keys for a specific user
 * @param {number} userId - ID of the user
 * @returns {Promise<Array>} - List of API keys
 */
export const fetchUserApiKeys = async (userId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const apiKey = user?.api_key;
    const csrfToken = getCookie('csrf-token');
    
    if (!apiKey || !csrfToken) {
      throw new Error('Missing API key or CSRF token');
    }
    
    const response = await axios.get(`http://localhost:3000/api/user/${userId}/api-keys`, {
      headers: {
        'x-api-key': apiKey,
        'x-csrf-token': csrfToken
      },
      withCredentials: true
    });
    
    return response.data.apiKeys;
  } catch (error) {
    console.error('Error fetching user API keys:', error.response?.data || error.message);
    throw error;
  }
};

