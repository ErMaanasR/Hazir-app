// Import required packages
require('dotenv').config();
const pool = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const { authenticateToken } = require('./middleware/authMiddleware');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - these run for every request
app.use(cors());  // Allow Flutter app to call this API
app.use(express.json());  // Parse JSON request bodies

// Routes - define what happens at different URLs
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Hazir API!',
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, VERSION() as pg_version');
    res.json({ 
      success: true,
      database_time: result.rows[0].current_time,
      postgresql_version: result.rows[0].pg_version
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

app.use('/api/auth', authRoutes);

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, phone_number, user_type FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(` Hazir API server running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
});