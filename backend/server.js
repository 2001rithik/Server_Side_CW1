
// server.js - Implementation with SQLite Database Queries

const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const apiKeyRoutes = require("./src/routes/apiRoutes");
const countryRoutes = require("./src/routes/countryRoutes");
const cookieParser = require('cookie-parser');
const db = require('./src/config/db'); // Import your SQLite database connection
require("dotenv").config();

const app = express();

// CORS configuration (removing duplicate CORS configs)
app.use(cors({
  origin: 'http://localhost:3001', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-csrf-token']
}));

// Basic middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.use("/auth", authRoutes);
app.use("/api", apiKeyRoutes);
app.use("/api", countryRoutes);

// User routes with actual database queries
app.get('/users/with-usage', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username as name, 
        u.email, 
        u.role,
        u.plan,
        COUNT(au.id) as usage_count,
        MAX(au.timestamp) as last_used
      FROM users u
      LEFT JOIN api_usage au ON u.id = au.user_id
      GROUP BY u.id
    `;
    
    db.all(query, [], (err, users) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        apiUsage: {
          count: user.usage_count || 0,
          lastUsed: user.last_used ? new Date(user.last_used) : null
        }
      }));
      
      return res.json(formattedUsers);
    });
  } catch (error) {
    console.error('Error fetching users with usage:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update user plan route
app.patch('/users/update-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan } = req.body;
    
    if (!plan) {
      return res.status(400).json({ message: 'Plan is required' });
    }
    
    db.run(
      'UPDATE users SET plan = ? WHERE id = ?',
      [plan, userId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Get the updated user data
        db.get('SELECT id, plan, created_at FROM users WHERE id = ?', [userId], (err, user) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
          }
          
          return res.json({
            id: user.id,
            plan: user.plan,
            updated: new Date()
          });
        });
      }
    );
  } catch (error) {
    console.error('Error updating user plan:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// API Key routes
app.delete('/api/keys/:keyId', async (req, res) => {
  try {
    const { keyId } = req.params;
    
    db.run('DELETE FROM api_keys WHERE id = ?', [keyId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'API key not found' });
      }
      
      return res.json({ message: 'API key deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Add API Key route
app.post('/api/keys', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Generate a random API key
    const apiKey = generateApiKey();
    
    // Set expiration date to 1 year from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    db.run(
      'INSERT INTO api_keys (user_id, api_key, expires_at) VALUES (?, ?, ?)',
      [userId, apiKey, expiresAt.toISOString()],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        return res.status(201).json({
          id: this.lastID,
          userId,
          apiKey,
          createdAt: new Date(),
          expiresAt
        });
      }
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get user's API keys
app.get('/api/keys/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    db.all(
      'SELECT id, api_key, created_at, expires_at FROM api_keys WHERE user_id = ?',
      [userId],
      (err, keys) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        return res.json(keys);
      }
    );
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Log API usage
app.post('/api/usage/log', async (req, res) => {
  try {
    const { userId, apiKey, endpoint } = req.body;
    
    if (!userId || !apiKey || !endpoint) {
      return res.status(400).json({ message: 'User ID, API key, and endpoint are required' });
    }
    
    db.run(
      'INSERT INTO api_usage (user_id, api_key, endpoint) VALUES (?, ?, ?)',
      [userId, apiKey, endpoint],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        return res.status(201).json({ message: 'API usage logged successfully' });
      }
    );
  } catch (error) {
    console.error('Error logging API usage:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get API usage for a user
app.get('/api/usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    db.all(
      `SELECT 
        au.endpoint, 
        COUNT(*) as count, 
        MAX(au.timestamp) as last_used 
      FROM api_usage au 
      WHERE au.user_id = ? 
      GROUP BY au.endpoint`,
      [userId],
      (err, usage) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        return res.json(usage);
      }
    );
  } catch (error) {
    console.error('Error fetching API usage:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// Get total API keys count (no authentication required)
app.get('/api/usage/total-api-keys', async (req, res) => {
    try {
      // Count all API keys
      db.get('SELECT COUNT(*) as totalApiKeys FROM api_keys', [], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        return res.json({ totalApiKeys: result.totalApiKeys });
      });
    } catch (error) {
      console.error('Error counting API keys:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

// Helper function to generate a random API key
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Server startup
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

// 404 handler - this should be the last route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});