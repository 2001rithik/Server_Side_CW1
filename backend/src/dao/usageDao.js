const db = require('../config/db');

class UsageDao {
  static async getUserIdByApiKey(apiKey) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT user_id FROM api_keys WHERE api_key = ?`,
        [apiKey],
        (err, row) => {
          if (err) return reject(err);
          resolve(row ? row.user_id : null);
        }
      );
    });
  }

  static async getUsageCountLast24h(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as usageCount
         FROM api_usage
         WHERE user_id = ? AND timestamp >= datetime('now', '-1 day')`,
        [userId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row?.usageCount || 0);
        }
      );
    });
  }

  static async getUsageCountForUsers(userIds) {
    const placeholders = userIds.map(() => '?').join(',');
    const query = `
      SELECT user_id, COUNT(*) as usageCount
      FROM api_usage
      WHERE user_id IN (${placeholders}) AND timestamp >= datetime('now', '-1 day')
      GROUP BY user_id
    `;
  
    return new Promise((resolve, reject) => {
      db.all(query, userIds, (err, rows) => {
        if (err) return reject(err);
  
        const usageMap = {};
        rows.forEach(row => {
          usageMap[row.user_id] = row.usageCount;
        });
        resolve(usageMap);
      });
    });
  }
  
  static async getTotalApiKeyCount() {
    return new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM api_keys`, [], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  }
  
}

module.exports = UsageDao;
