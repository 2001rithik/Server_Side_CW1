const bcrypt = require('bcryptjs');
const UserDao = require('../dao/userDao');
const UsageDao = require('../dao/usageDao');

class UserService {
    async createUser(username, email, password, role = 'user', plan = 'free') {
        const hashedPassword = await bcrypt.hash(password, 10);
        return await UserDao.create(username, email, hashedPassword, role, plan);
      }
      

    async getUserByEmail(email) {
        return await UserDao.findByEmail(email);
    }

    async getUserById(id) {
        return await UserDao.getById(id);
    }

    // async getAllUsers() {
    //     return await UserDao.listAll();
    // }

    async updateUserPlan(userId, plan) {
        const validPlans = ['free', 'paid'];
        if (!validPlans.includes(plan)) throw new Error('Invalid plan');
        const user = await this.getUserById(userId);
        if (!user) throw new Error('User not found');
        await UserDao.updatePlan(userId, plan);
        return { userId, plan };
    }

    async getUsersByRole(role) {
        return await UserDao.getUsersByRole(role);
    }

    async getUsersWithUsageByRole(role) {
        const users = await UserDao.getUsersByRole(role);
        const userIds = users.map(u => u.id);
        const usageMap = await UsageDao.getUsageCountForUsers(userIds);
      
        return users.map(user => ({
          ...user,
          usageCount: usageMap[user.id] || 0
        }));
      }
    
}

module.exports = new UserService();
