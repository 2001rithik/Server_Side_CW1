import axios from 'axios';

// Base URL for all authentication-related API requests
const BASE_URL = 'http://localhost:3000/auth';

/**
 * Register a new user
 * @param {Object} userData - User registration info
 * @param {string} userData.username - New user's username
 * @param {string} userData.email - New user's email
 * @param {string} userData.password - New user's password
 * @returns {Promise<Object>} - Server response data
 */
export const registerUser = async ({ username, email, password }) => {
  const response = await axios.post(`${BASE_URL}/register`, {
    username,
    email,
    password,
  });
  return response.data;
};

/**
 * Register a new admin user
 * @param {Object} adminData - Admin registration info
 * @param {string} adminData.username - New admin's username
 * @param {string} adminData.email - New admin's email
 * @param {string} adminData.password - New admin's password
 * @param {string} adminData.securityCode - Admin security code for verification
 * @returns {Promise<Object>} - Server response data
 */
export const registerAdmin = async ({ username, email, password, securityCode }) => {
  const response = await axios.post(`${BASE_URL}/register-admin`, {
    username,
    email,
    password,
    securityCode,
  });
  return response.data;
};

/**
 * Log in an existing user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} - Server response data (e.g., token, user info)
 */
export const loginUser = async ({ email, password }) => {
  const response = await axios.post(
    `${BASE_URL}/login`,
    {
      email,
      password,
    },
    {
      withCredentials: true, // Ensures cookies (e.g., JWT token) are included in requests
    }
  );
  return response.data;
};

/**
 * Log in an admin user
 * @param {Object} credentials - Admin login credentials
 * @param {string} credentials.email - Admin's email
 * @param {string} credentials.password - Admin's password
 * @returns {Promise<Object>} - Server response data (e.g., token, admin user info)
 */
export const loginAdmin = async ({ email, password }) => {
  const response = await axios.post(
    `${BASE_URL}/admin-login`,
    {
      email,
      password,
    },
    {
      withCredentials: true, // Ensures cookies (e.g., JWT token) are included in requests
    }
  );
  return response.data;
};