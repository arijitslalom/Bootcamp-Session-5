const express = require('express');
const cors = require('cors');
const todoRoutes = require('./routes/todoRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount todo routes
app.use('/api/todos', todoRoutes);

// INTENTIONAL ISSUE: Missing error handling middleware

module.exports = app;
