// routes/countryRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');
const authenticateApiKey = require('../middleware/authenticateApiKey');

// Helper function to get user's API usage
async function getUserApiUsage(userId) {
  const usage = await new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as usageCount FROM api_usage 
       WHERE user_id = ? AND timestamp > datetime('now', '-24 hours')`,
      [userId],
      (err, row) => {
        if (err) reject(err);
        resolve(row);
      }
    );
  });
  
  // Get user's plan to determine limit
  const user = await new Promise((resolve, reject) => {
    db.get('SELECT plan FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
  
  const limit = user.plan === 'free' ? 100 : 1000; // Set limits based on plan
  
  return {
    usageCount: usage.usageCount,
    limit
  };
}

// Country route handler
router.get('/country', async (req, res) => {
  const { name } = req.query;
  const userId = req.user.id;
  const apiKey = req.headers['x-api-key'];
  
  try {
    // Log this API call (with timestamp)
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO api_usage (user_id, api_key, endpoint, timestamp) 
         VALUES (?, ?, ?, datetime('now'))`,
        [userId, apiKey, '/api/country'],
        (err) => {
          if (err) {
            console.error("Failed to log usage:", err.message);
            reject(err);
          }
          resolve();
        }
      );
    });
    
    // Check if country exists in our database first
    const existingCountry = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM countries WHERE name = ? COLLATE NOCASE', [name], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    // If we have this country cached and it's recent enough, return it
    if (existingCountry) {
      // Format country data for frontend
      const formattedCountry = {
        name: existingCountry.name,
        capital: existingCountry.capital,
        currency: existingCountry.currency,
        languages: existingCountry.languages.split(','),
        flag: existingCountry.flag_url
      };
      
      // Get updated usage count for this user
      const usage = await getUserApiUsage(userId);
      return res.json({ country: formattedCountry, usage });
    }
    
    // Otherwise fetch from external API
    const response = await axios.get(`https://restcountries.com/v3.1/name/${name}`);
    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    const countryData = response.data[0];
    
    // Format the data
    const languages = Object.values(countryData.languages || {});
    const currencyObj = Object.values(countryData.currencies || {})[0] || {};
    const currencyName = currencyObj.name || 'Unknown';
    
    const country = {
      name: countryData.name.common,
      capital: countryData.capital?.[0] || 'Unknown',
      currency: currencyName,
      languages: languages.join(','), // Store as comma-separated string
      flag_url: countryData.flags?.png || '',
    };
    
    // Save to database
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO countries (name, capital, currency, languages, flag_url) VALUES (?, ?, ?, ?, ?)',
        [country.name, country.capital, country.currency, country.languages, country.flag_url],
        function(err) {
          if (err) reject(err);
          resolve(this);
        }
      );
    });
    
    // Format for frontend response
    const formattedCountry = {
      name: country.name,
      capital: country.capital,
      currency: country.currency,
      languages: country.languages.split(','),
      flag: country.flag_url
    };
    
    // Get updated usage
    const usage = await getUserApiUsage(userId);
    
    return res.json({ country: formattedCountry, usage });
  } catch (error) {
    console.error('Error processing country request:', error);
    return res.status(500).json({ error: 'Failed to fetch country data' });
  }
});

// Move this function to a separate file in your frontend code
// or create a separate module for it
const fetchTotalApiKeyCount = async () => {
  try {
    const response = await axios.get('/api/usage/total-api-keys');
    return response.data;
  } catch (error) {
    console.error('Error fetching total API key count:', error);
    throw error;
  }
};

// Don't include frontend code in your backend routes
// This was likely added by mistake

module.exports = router;