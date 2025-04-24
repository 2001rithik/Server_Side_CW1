const express = require('express');
const router = express.Router();

const { authenticateJWT } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf'); 
const checkApiKey = require('../middleware/checkApiKey');
const apiService = require('../services/apiService');
const usageService = require('../services/usageService');

router.use(authenticateJWT);
router.use(csrfProtection);

router.get('/country', checkApiKey, async (req, res) => {
  const name = req.query.name;

  if (!name) {
    return res.status(400).json({ error: 'Country name is required' });
  }

  try {
    const country = await apiService.getCountryByName(name);

    // Access req.user set by JWT middleware
    const usage = await usageService.getUsageSummary(req.user.id); 

    res.json({ country, usage });
  } catch (err) {
    console.error('Error in /api/country:', err.message);
    res.status(500).json({ error: 'Failed to fetch country details or usage' });
  }
});

module.exports = router;
