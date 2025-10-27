
const express = require('express');
const {
  getDriverProfile,
  updateDriverAvailability,
} = require('../controllers/driverController');
const { protect, authorizeDriver } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes in this file are protected and require driver authorization
router.use(protect);
router.use(authorizeDriver);

router.get('/me', getDriverProfile);
router.put('/me/availability', updateDriverAvailability);

module.exports = router;
