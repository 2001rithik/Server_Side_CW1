const { randomBytes } = require('crypto');

/**
 * Generates a secure API key
 * @param {number} length - The desired length of the API key in bytes (default: 32)
 * @returns {string} - The generated API key as hexadecimal string
 */
function createSecureApiKey(length = 32) {
  const bytes = randomBytes(length);
  return bytes.toString('hex');
}

module.exports = {
  createSecureApiKey
};