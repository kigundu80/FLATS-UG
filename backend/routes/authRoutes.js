
const express = require('express');
const {
  userSignup,
  userLogin,
  driverLogin,
  logout,
  driverSignupByAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// User Auth Routes
router.post('/user/signup', userSignup);
router.post('/user/login', userLogin);

// Driver Auth Routes
// This route is for an admin to create a driver account.
// In a production app, this should be protected by admin-only middleware.
router.post('/driver/signup', driverSignupByAdmin);
router.post('/driver/login', driverLogin);

// Common Logout (conceptual - requires client to clear token primarily)
router.post('/logout', protect, logout); // Protect to ensure a token exists to "logout"

module.exports = router;