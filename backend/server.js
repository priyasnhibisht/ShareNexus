require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const requestsRoutes = require('./routes/requests');

const app = express();

// allow all origins in production
app.use(cors());
app.use(express.json());

// this connects our app to mongodb
const connectDB = require('./database/db');
connectDB();

// simple check to make sure the server isn't dead
app.get('/', (req, res) => res.send('ShareNexus backend running'));

// hook up all the different routes here
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/requests', requestsRoutes);

// Serves the frontend build directory statically
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route for React Router (must be placed after all API routes!)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

