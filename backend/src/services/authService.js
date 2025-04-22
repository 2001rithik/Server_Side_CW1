const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { generateApiKey } = require('../config/apiKye');
const userService = require('./userService');
const authDao = require('../dao/authDao');

class AuthService {
    async register(username, email, password) {
        return await userService.createUser(username, email, password);
    }

    async authenticate(email, password) {
        const user = await userService.getUserByEmail(email);  // correct call
        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        const { accessToken, csrfToken } = generateToken(user);
        const apiKey = await this.generateOrFetchApiKey(user.id);

        return {
            accessToken,
            csrfToken,
            apiKey,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                plan: user.plan,   
                role: user.role
            }
        };
    }

    async generateOrFetchApiKey(userId) {
        const now = new Date();
        const nowISO = now.toISOString();

        const existing = await authDao.findValidApiKey(userId, nowISO);
        if (existing) return existing;

        const newKey = generateApiKey();
        const expiresAt = new Date(now.getTime() + 86400000).toISOString();

        return await authDao.insertApiKey(userId, newKey, expiresAt);
    }
}

module.exports = new AuthService();
