const db = require('../config/db');

class AuthDao {
    static async findValidApiKey(userId, nowISO) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT api_key FROM api_keys WHERE user_id = ? AND expires_at > ?`,
                [userId, nowISO],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row ? row.api_key : null);
                }
            );
        });
    }

    static async insertApiKey(userId, apiKey, expiresAt) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO api_keys (user_id, api_key, expires_at) VALUES (?, ?, ?)`,
                [userId, apiKey, expiresAt],
                function (err) {
                    if (err) return reject(err);
                    resolve(apiKey);
                }
            );
        });
    }
}

module.exports = AuthDao;
