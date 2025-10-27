
const express = require('express');
const dotenv = require('dotenv');

// Load env vars at the very top
dotenv.config();

const cors = require('cors');
const pool = require('./config/db'); // db.js will attempt connection on load

// Route Files
const authRoutes = require('./routes/authRoutes');
const serviceBookingRoutes = require('./routes/serviceBookingRoutes');
const driverRoutes = require('./routes/driverRoutes'); 
const rideRoutes = require('./routes/rideRoutes'); 
// const userRoutes = require('./routes/userRoutes'); // Placeholder


const app = express();

// --- Middleware ---
// Enable CORS for all routes. This should be one of the first middleware.
// It handles pre-flight OPTIONS requests automatically, which is crucial for fixing "Failed to fetch" errors.
app.use(cors());

// Middleware to parse JSON bodies. This should come after CORS.
app.use(express.json());


// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/service-bookings', serviceBookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/rides', rideRoutes);
// app.use('/api/users', userRoutes);


// Simple test route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'FLATS UG Backend is running!' });
});


const PORT = process.env.PORT || 5001;

// Only start server if DB connection seems okay
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    if (rows) {
      console.log('Database connection verified for server start.');
      app.listen(PORT, () => {
        console.log(`FLATS UG Backend server running on port ${PORT}`);
      });
    } else {
        console.error('Server did not start: Database test query failed.');
    }
  } catch (dbError) {
    console.error(`Server did not start: Failed to connect to database or run test query.`);
    console.error(dbError.message);
  }
})();


// Global error handler (very basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});