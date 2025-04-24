const express = require('express');
const router = express.Router();
const usageService = require('../services/usageService');
const { authenticateJWT } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

router.use(authenticateJWT);
router.use(csrfProtection);

router.get('/', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    const userId = await usageService.getUserIdFromApiKey(apiKey);
    if (!userId) {
      return res.status(403).json({ error: 'Invalid API key' });
    }

    const usage = await usageService.getUsageSummary(userId);
    res.json(usage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/total-api-keys', async (req, res) => {
  try {
    const total = await usageService.getTotalApiKeyCount();
    res.json({ totalApiKeys: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
