const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL / Supabase Pool connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.set('dbPool', pool);

// Middleware - Allow cross-origin requests from Vercel frontend
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
const dashboardRoutes = require('./routes/dashboard');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/income');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);

// Health & Database Connection Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(200).json({
        status: 'online',
        database: 'disconnected',
        message: 'DATABASE_URL environment variable is missing'
      });
    }

    const dbRes = await pool.query('SELECT NOW() as current_time');
    res.status(200).json({
      status: 'online',
      database: 'connected',
      timestamp: dbRes.rows[0].current_time
    });
  } catch (err) {
    res.status(200).json({
      status: 'online',
      database: 'error',
      error: err.message
    });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Couples Budget Planner Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
