const express = require('express');
const {
  createServiceBooking,
  getAllServiceBookings, // Example admin route
  getMyServiceBookings   // For users to fetch their bookings
} = require('../controllers/serviceBookingController');
const { protect, authorizeUser /*, authorizeAdmin */ } = require('../middleware/authMiddleware'); // Assuming authorizeAdmin middleware

const router = express.Router();

// Route to create a new service booking (Hotel, Flight, Courier etc.)
router.post('/', protect, authorizeUser, createServiceBooking);

// Route for users to get their own service bookings
router.get('/my-bookings', protect, authorizeUser, getMyServiceBookings);

// Example route for admins to get all service bookings (needs admin authorization)
// router.get('/', protect, authorizeAdmin, getAllServiceBookings);


module.exports = router;