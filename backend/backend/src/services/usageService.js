const userService = require('./userService');
const UsageDao = require('../dao/usageDao');

class UsageService {
  async getUsageSummary(userId) {
    const user = await userService.getUserById(userId);
    if (!user) throw new Error("User not found");

    const plan = user.plan;
    const limit = plan === 'paid' ? 100 : 5;
    const usageCount = await UsageDao.getUsageCountLast24h(userId);

    return {
      userId,
      plan,
      usageCount,
      remaining: limit - usageCount,
      limit
    };
  }

  async getUserIdFromApiKey(apiKey) {
    return await UsageDao.getUserIdByApiKey(apiKey);
  }

  async getTotalApiKeyCount() {
    return await UsageDao.getTotalApiKeyCount();
  }
  
}

module.exports = new UsageService();
