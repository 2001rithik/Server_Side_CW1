const db = require('../config/db');

module.exports = function (req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'API key is required' });

    const nowISO = new Date().toISOString();

    db.get(`
        SELECT ak.user_id, ak.expires_at, u.plan
        FROM api_keys ak
        JOIN users u ON ak.user_id = u.id
        WHERE ak.api_key = ? AND ak.expires_at > ?
    `, [apiKey, nowISO], (err, row) => {
        if (err) {
            console.error("DB error:", err.message);
            return res.status(500).json({ error: 'Server error' });
        }

        if (!row) {
            return res.status(403).json({ error: 'Invalid or expired API key' });
        }

        const userId = row.user_id;
        const plan = row.plan;
        const limit = plan === 'paid' ? 100 : 5;

        // Attach user ID to request for all routes
        req.user = { id: userId };

        //  Allow /api/usage route without checking limit
        if (req.originalUrl.startsWith('/api/usage')) {
            return next();
        }

        db.get(`
            SELECT COUNT(*) as usageCount
            FROM api_usage
            WHERE user_id = ? AND timestamp >= datetime('now', '-1 day')
        `, [userId], (countErr, countRow) => {
            if (countErr) {
                console.error("Usage count error:", countErr.message);
                return res.status(500).json({ error: 'Failed to check usage count' });
            }

            if (countRow.usageCount >= limit) {
                return res.status(429).json({
                    error: `API usage limit exceeded (${limit} requests per day for ${plan} plan)`
                });
            }
            
            next();
        });
    });
};