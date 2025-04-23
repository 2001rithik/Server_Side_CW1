const crypto = require('crypto');

/**
 * Generates a secure random token for CSRF protection
 * @returns {string} A unique token string
 */
const createCSRFToken = () => {
  return crypto.randomUUID();
};

/**
 * Validates that tokens match to prevent CSRF attacks
 * @param {string} requestToken - Token from request headers/body
 * @param {string} sessionToken - Token stored in session/cookie
 * @returns {boolean} Whether the tokens match
 */
const validateCSRFToken = (requestToken, sessionToken) => {
  if (!requestToken || !sessionToken) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(requestToken),
    Buffer.from(sessionToken)
  );
};

module.exports = {
  createCSRFToken,
  validateCSRFToken
};