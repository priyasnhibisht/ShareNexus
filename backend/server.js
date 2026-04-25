require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const requestsRoutes = require('./routes/requests');
const coinsRoutes = require('./routes/coins');

const app = express();

// allow configured origin in production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// this connects our app to mongodb
const connectDB = require('./database/db');
connectDB();

// The root '/' backend override was removed so the React app can load properly here!

// hook up all the different routes here
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/coins', coinsRoutes);

// Serves the frontend build directory statically
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route for React Router (must be placed after all API routes!)
app.get(/^.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

