import axios from 'axios';

/**
 * Get the value of a cookie by its name
 * @param {string} name - The name of the cookie
 * @returns {string|null} - The cookie value or null if not found
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Fetch all users along with their API usage stats
 * Requires a valid CSRF token
 * @returns {Promise<Array>} - List of users and usage details
 */
export const fetchUsersWithUsage = async () => {
  try {
    const csrfToken = getCookie('csrf-token');

    if (!csrfToken) {
      throw new Error('Missing CSRF token');
    }

    const response = await axios.get('http://localhost:3000/users/with-usage', {
      headers: {
        'x-csrf-token': csrfToken
      },
      withCredentials: true // Ensures JWT cookie is sent
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching users with usage:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update a specific user's subscription plan
 * @param {string} userId - The user's unique ID
 * @param {string} plan - New plan to assign (e.g., 'free', 'premium')
 * @returns {Promise<Object>} - Updated user info or confirmation
 */
export const updateUserPlan = async (userId, plan) => {
  try {
    const csrfToken = getCookie('csrf-token');

    if (!csrfToken) {
      throw new Error('Missing CSRF token');
    }

    const response = await axios.patch(
      `http://localhost:3000/users/update-plan/${userId}`,
      { plan },
      {
        headers: {
          'x-csrf-token': csrfToken
        },
        withCredentials: true // Include JWT cookie for authentication
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating user plan:', error.response?.data || error.message);
    throw error;
  }
};
// Add this to userApi.js

/**
 * Delete an API key
 * @param {number} keyId - ID of the API key to delete
 * @returns {Promise<Object>} - Success response
 */
export const deleteApiKey = async (keyId) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const apiKey = user?.api_key;
    const csrfToken = getCookie('csrf-token');
    
    if (!apiKey || !csrfToken) {
      throw new Error('Missing API key or CSRF token');
    }
    
    const response = await axios.delete(`http://localhost:3000/api/keys/${keyId}`, {
      headers: {
        'x-api-key': apiKey,
        'x-csrf-token': csrfToken
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting API key:', error.response?.data || error.message);
    throw error;
  }
};