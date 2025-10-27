const express = require('express');
const {
  requestRide,
  getNewRideForDriver,
  acceptRide,
  rejectRide,
  arriveAtPickup,
  startRide,
  completeRide,
  getRideStatus,
  getCurrentUserRide,
} = require('../controllers/rideController');
const { protect, authorizeUser, authorizeDriver } = require('../middleware/authMiddleware');

const router = express.Router();

// User specific ride routes
router.post('/request', protect, authorizeUser, requestRide);
router.get('/user/current', protect, authorizeUser, getCurrentUserRide);


// Driver specific ride routes
router.get('/driver/new', protect, authorizeDriver, getNewRideForDriver);
router.post('/:rideId/accept', protect, authorizeDriver, acceptRide);
router.post('/:rideId/reject', protect, authorizeDriver, rejectRide);
router.post('/:rideId/arrive', protect, authorizeDriver, arriveAtPickup);
router.post('/:rideId/start', protect, authorizeDriver, startRide);
router.post('/:rideId/complete', protect, authorizeDriver, completeRide);

// Common route for ride status, accessible by associated user or driver
router.get('/:rideId/status', protect, getRideStatus);


module.exports = router;