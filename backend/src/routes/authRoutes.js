require('dotenv').config(); 
const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/authService');
const UserService = require('../services/userService');

const router = express.Router();

// Regular user REGISTER
router.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
        const { username, email, password, plan } = req.body;
        // Regular users get the default 'user' role
        const newUser = await UserService.createUser(username, email, password, 'user', plan);
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ADMIN REGISTER
router.post('/register-admin', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('securityCode').notEmpty().withMessage('Security code is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
        const { username, email, password, securityCode, plan } = req.body;
        
        // Verify security code (replace 'YOUR_ADMIN_SECRET_CODE' with your actual secret code)
        // You might want to store this in an environment variable for security
        const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || '123456';
        
        if (securityCode !== ADMIN_SECRET_CODE) {
            return res.status(403).json({ error: 'Invalid security code' });
        }
        
        // Create admin user with 'admin' role
        const newAdmin = await UserService.createUser(username, email, password, 'admin', plan);
        res.status(201).json({ message: 'Admin registered successfully', user: newAdmin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN (for both regular users and admins)
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
        const { email, password } = req.body;
        const authResult = await AuthService.authenticate(email, password);
        if (!authResult) return res.status(401).json({ error: "Invalid credentials" });
        
        res.cookie('jwt', authResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000
        });
        
        res.cookie('csrf-token', authResult.csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });
        
        res.json({
            message: "Login successful",
            token: authResult.accessToken,
            csrfToken: authResult.csrfToken,
            apiKey: authResult.apiKey,
            user: authResult.user,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ADMIN LOGIN (optional - you can use this if you want separate login validation for admins)
router.post('/admin-login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
        const { email, password } = req.body;
        const authResult = await AuthService.authenticateAdmin(email, password);
        if (!authResult) return res.status(401).json({ error: "Invalid credentials" });
        
        res.cookie('jwt', authResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000
        });
        
        res.cookie('csrf-token', authResult.csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });
        
        res.json({
            message: "Admin login successful",
            token: authResult.accessToken,
            csrfToken: authResult.csrfToken,
            apiKey: authResult.apiKey,
            user: authResult.user,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;