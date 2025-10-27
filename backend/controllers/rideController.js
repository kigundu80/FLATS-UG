const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const RIDE_STATUS = {
  PENDING_ASSIGNMENT: 'PENDING_ASSIGNMENT',
  AWAITING_DRIVER_ACCEPTANCE: 'AWAITING_DRIVER_ACCEPTANCE', // Driver has been offered the ride
  ACCEPTED: 'ACCEPTED', // Driver accepted, en route to pickup
  ARRIVED: 'ARRIVED', // Driver has arrived at pickup
  ONGOING: 'ONGOING', // Ride started
  COMPLETED: 'COMPLETED',
  CANCELLED_BY_USER: 'CANCELLED_BY_USER',
  CANCELLED_BY_DRIVER: 'CANCELLED_BY_DRIVER', // e.g. if user no-show
  REJECTED_BY_DRIVER: 'REJECTED_BY_DRIVER', // Driver explicitly rejected offer
};

// @desc    User requests a new ride
// @route   POST /api/rides/request
// @access  Protected (User)
const requestRide = async (req, res) => {
  const userId = req.authEntity.id;
  const {
    pickupAddress, dropoffAddress, rideType, estimatedFare, distance, passengers,
    pickupLat, pickupLng, dropoffLat, dropoffLng, originatingServiceTitle
  } = req.body;

  if (!pickupAddress || !dropoffAddress || !rideType || !estimatedFare || !distance || !passengers) {
    return res.status(400).json({ message: 'Missing required ride details.' });
  }

  const rideId = uuidv4();
  try {
    await pool.query(
      `INSERT INTO Rides (id, userId, pickupAddress, dropoffAddress, rideType, estimatedFare, distance, passengers, status, pickupLat, pickupLng, dropoffLat, dropoffLng, originatingServiceTitle, requestedAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [rideId, userId, pickupAddress, dropoffAddress, rideType, estimatedFare, distance, passengers, RIDE_STATUS.PENDING_ASSIGNMENT, pickupLat, pickupLng, dropoffLat, dropoffLng, originatingServiceTitle]
    );
    const [newRide] = await pool.query('SELECT * FROM Rides WHERE id = ?', [rideId]);
    res.status(201).json(newRide[0]);
  } catch (error) {
    console.error('Request Ride Error:', error);
    res.status(500).json({ message: 'Server error creating ride request.' });
  }
};

// @desc    Driver polls for new ride requests
// @route   GET /api/rides/driver/new
// @access  Protected (Driver)
const getNewRideForDriver = async (req, res) => {
  const driverUUID = req.authEntity.id;

  try {
    // Check if driver is Online and not OnTrip
    const [driverRows] = await pool.query('SELECT availabilityStatus FROM Drivers WHERE id = ?', [driverUUID]);
    if (driverRows.length === 0 || driverRows[0].availabilityStatus !== 'Online') {
      return res.status(200).json(null); // No new ride if driver is not Online or doesn't exist
    }

    // Find a PENDING_ASSIGNMENT ride (simplistic: first one)
    // In a real app, this would involve location proximity, fairness, etc.
    const [pendingRides] = await pool.query(
      `SELECT r.*, u.fullName as passengerName, u.contactPhone as passengerContact, u.rating as passengerRating 
       FROM Rides r JOIN Users u ON r.userId = u.id
       WHERE r.status = ? ORDER BY r.requestedAt ASC LIMIT 1`,
      [RIDE_STATUS.PENDING_ASSIGNMENT]
    );

    if (pendingRides.length === 0) {
      return res.status(200).json(null); // No pending rides
    }

    const rideToOffer = pendingRides[0];

    // "Offer" the ride to this driver
    const [updateResult] = await pool.query('UPDATE Rides SET status = ?, driverId = ?, updatedAt = NOW() WHERE id = ? AND status = ?', 
      [RIDE_STATUS.AWAITING_DRIVER_ACCEPTANCE, driverUUID, rideToOffer.id, RIDE_STATUS.PENDING_ASSIGNMENT]
    );

    if (updateResult.affectedRows > 0) {
      // Fetch the updated ride to include the new status and driverId in the response
      const [updatedOfferedRideRows] = await pool.query(
        `SELECT r.*, u.fullName as passengerName, u.contactPhone as passengerContact, u.rating as passengerRating 
         FROM Rides r JOIN Users u ON r.userId = u.id
         WHERE r.id = ?`,
        [rideToOffer.id]
      );
      if (updatedOfferedRideRows.length > 0) {
        res.json(updatedOfferedRideRows[0]); // Send the fully updated ride object
      } else {
        // Should not happen if updateResult.affectedRows > 0 and rideToOffer.id is valid
        console.error(`Inconsistency: Ride ${rideToOffer.id} updated but not found immediately after.`);
        res.status(200).json(null); // Fallback to no ride found
      }
    } else {
      // Ride might have been snatched by another concurrent request, or status changed.
      res.status(200).json(null); 
    }
  } catch (error) {
    console.error('Get New Ride For Driver Error:', error);
    res.status(500).json({ message: 'Server error fetching new ride.' });
  }
};

// @desc    Driver accepts a ride
// @route   POST /api/rides/:rideId/accept
// @access  Protected (Driver)
const acceptRide = async (req, res) => {
  const driverUUID = req.authEntity.id;
  const { rideId } = req.params;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Check if ride is still available for this driver to accept
    const [rideRows] = await conn.query('SELECT status, driverId FROM Rides WHERE id = ? FOR UPDATE', [rideId]);
    if (rideRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Ride not found.' });
    }
    const ride = rideRows[0];
    if (ride.driverId !== driverUUID || ride.status !== RIDE_STATUS.AWAITING_DRIVER_ACCEPTANCE) {
      await conn.rollback();
      return res.status(403).json({ message: 'Ride not available for acceptance by you or already accepted/cancelled.' });
    }

    // Update ride status
    await conn.query('UPDATE Rides SET status = ?, acceptedAt = NOW(), updatedAt = NOW() WHERE id = ?', [RIDE_STATUS.ACCEPTED, rideId]);
    // Update driver status
    await conn.query('UPDATE Drivers SET availabilityStatus = ? WHERE id = ?', ['OnTrip', driverUUID]);

    await conn.commit();

    const [updatedRide] = await pool.query('SELECT * FROM Rides WHERE id = ?', [rideId]);
    res.json({ message: 'Ride accepted.', ride: updatedRide[0] });

  } catch (error) {
    console.error('Accept Ride Error:', error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ message: 'Server error accepting ride.' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

// @desc    Driver rejects a ride
// @route   POST /api/rides/:rideId/reject
// @access  Protected (Driver)
const rejectRide = async (req, res) => {
  const driverUUID = req.authEntity.id;
  const { rideId } = req.params;

  try {
    // Check if ride was offered to this driver
    const [rideRows] = await pool.query('SELECT status, driverId FROM Rides WHERE id = ?', [rideId]);
    if (rideRows.length === 0) {
      return res.status(404).json({ message: 'Ride not found.' });
    }
    const ride = rideRows[0];
    if (ride.driverId !== driverUUID || ride.status !== RIDE_STATUS.AWAITING_DRIVER_ACCEPTANCE) {
      // If already accepted or cancelled, or not for this driver, can't reject
      return res.status(403).json({ message: 'Ride cannot be rejected at this stage or was not offered to you.' });
    }

    // Set ride status to REJECTED_BY_DRIVER or back to PENDING_ASSIGNMENT for another driver to pick up
    // For simplicity, let's revert to PENDING_ASSIGNMENT and clear driverId
    await pool.query('UPDATE Rides SET status = ?, driverId = NULL, updatedAt = NOW() WHERE id = ?', [RIDE_STATUS.PENDING_ASSIGNMENT, rideId]);
    // Driver remains 'Online'

    res.json({ message: 'Ride rejected. It will be offered to other drivers.' });
  } catch (error) {
    console.error('Reject Ride Error:', error);
    res.status(500).json({ message: 'Server error rejecting ride.' });
  }
};

// @desc    Driver marks arrival at pickup
// @route   POST /api/rides/:rideId/arrive
// @access  Protected (Driver)
const arriveAtPickup = async (req, res) => {
  const driverUUID = req.authEntity.id;
  const { rideId } = req.params;

  try {
    const [rideRows] = await pool.query('SELECT status, driverId FROM Rides WHERE id = ?', [rideId]);
    if (rideRows.length === 0) {
      return res.status(404).json({ message: 'Ride not found.' });
    }
    const ride = rideRows[0];
    if (ride.driverId !== driverUUID || ride.status !== RIDE_STATUS.ACCEPTED) {
      return res.status(403).json({ message: 'Cannot mark arrival for this ride at its current state.' });
    }

    const [result] = await pool.query('UPDATE Rides SET status = ?, updatedAt = NOW() WHERE id = ?', [RIDE_STATUS.ARRIVED, rideId]);
    
    if (result.affectedRows === 0) {
        return res.status(500).json({ message: 'Failed to update ride status to ARRIVED.' });
    }

    const [updatedRideRows] = await pool.query('SELECT * FROM Rides WHERE id = ?', [rideId]);
    res.json({ message: 'Arrival confirmed.', ride: updatedRideRows[0] });

  } catch (error) {
    console.error('Arrive at Pickup Error:', error);
    res.status(500).json({ message: 'Server error marking arrival.' });
  }
};

// @desc    Driver starts the ride with the passenger
// @route   POST /api/rides/:rideId/start
// @access  Protected (Driver)
const startRide = async (req, res) => {
  const driverUUID = req.authEntity.id;
  const { rideId } = req.params;

  try {
    const [rideRows] = await pool.query('SELECT status, driverId FROM Rides WHERE id = ?', [rideId]);
    if (rideRows.length === 0) {
      return res.status(404).json({ message: 'Ride not found.' });
    }
    const ride = rideRows[0];
    if (ride.driverId !== driverUUID || ride.status !== RIDE_STATUS.ARRIVED) {
      return res.status(403).json({ message: 'Cannot start this ride at its current state. Please mark arrival first.' });
    }

    // Assuming a 'startedAt' column exists or can be added
    const [result] = await pool.query('UPDATE Rides SET status = ?, startedAt = NOW(), updatedAt = NOW() WHERE id = ?', [RIDE_STATUS.ONGOING, rideId]);

    if (result.affectedRows === 0) {
        return res.status(500).json({ message: 'Failed to update ride status to ONGOING.' });
    }

    const [updatedRideRows] = await pool.query('SELECT * FROM Rides WHERE id = ?', [rideId]);
    res.json({ message: 'Ride started.', ride: updatedRideRows[0] });

  } catch (error) {
    console.error('Start Ride Error:', error);
    res.status(500).json({ message: 'Server error starting ride.' });
  }
};


// @desc    Driver completes a ride
// @route   POST /api/rides/:rideId/complete
// @access  Protected (Driver)
const completeRide = async (req, res) => {
  const driverUUID = req.authEntity.id;
  const { rideId } = req.params;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [rideRows] = await conn.query('SELECT status, driverId FROM Rides WHERE id = ? FOR UPDATE', [rideId]);
    if (rideRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Ride not found.' });
    }
    const ride = rideRows[0];
    // Stricter check: ride must be ONGOING to be completed.
    if (ride.driverId !== driverUUID || ride.status !== RIDE_STATUS.ONGOING) {
      await conn.rollback();
      return res.status(403).json({ message: 'Ride cannot be completed by you or is not currently ongoing.' });
    }

    await conn.query('UPDATE Rides SET status = ?, completedAt = NOW(), updatedAt = NOW() WHERE id = ?', [RIDE_STATUS.COMPLETED, rideId]);
    await conn.query('UPDATE Drivers SET availabilityStatus = ? WHERE id = ?', ['Online', driverUUID]);

    await conn.commit();

    const [updatedRide] = await pool.query('SELECT * FROM Rides WHERE id = ?', [rideId]);
    res.json({ message: 'Ride completed successfully.', ride: updatedRide[0] });

  } catch (error) {
    console.error('Complete Ride Error:', error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ message: 'Server error completing ride.' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

// @desc    Get status of a specific ride
// @route   GET /api/rides/:rideId/status
// @access  Protected (User or Driver associated with the ride)
const getRideStatus = async (req, res) => {
  const { rideId } = req.params;
  const entityId = req.authEntity.id; // User or Driver UUID
  const entityType = req.authEntity.type;

  try {
    const [rideRows] = await pool.query(
      `SELECT r.*, 
              u.fullName as passengerName, u.email as passengerEmail, u.contactPhone as passengerContact,
              d.id as driverSystemDbId, d.driverId as driverPublicId, d.fullName as driverName, d.vehicleModel as driverVehicle, d.licensePlate as driverLicensePlate, d.profileImageUrl as driverImageUrl, d.phone as driverPhone, d.rating as driverRating
       FROM Rides r
       LEFT JOIN Users u ON r.userId = u.id
       LEFT JOIN Drivers d ON r.driverId = d.id
       WHERE r.id = ?`, [rideId]);

    if (rideRows.length === 0) {
      return res.status(404).json({ message: 'Ride not found.' });
    }
    const ride = rideRows[0];
    // Authorization check: User must be the passenger or Driver must be assigned driver
    if ((entityType === 'user' && ride.userId !== entityId) && (entityType === 'driver' && ride.driverId !== entityId)) {
      return res.status(403).json({ message: 'Not authorized to view this ride.' });
    }
    res.json(ride);
  } catch (error) {
    console.error('Get Ride Status Error:', error);
    res.status(500).json({ message: 'Server error retrieving ride status.' });
  }
};


// @desc    Get current active/pending ride for a user
// @route   GET /api/rides/user/current
// @access  Protected (User)
const getCurrentUserRide = async (req, res) => {
    const userId = req.authEntity.id;
    try {
        const [rides] = await pool.query(
          `SELECT r.*, 
                  d.id as driverSystemDbId, d.driverId as driverPublicId, d.fullName as driverName, d.vehicleModel as driverVehicle, d.licensePlate as driverLicensePlate, d.profileImageUrl as driverImageUrl, d.phone as driverPhone, d.rating as driverRating
           FROM Rides r
           LEFT JOIN Drivers d ON r.driverId = d.id
           WHERE r.userId = ? AND r.status NOT IN (?, ?, ?) 
           ORDER BY r.requestedAt DESC LIMIT 1`,
          [userId, RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED_BY_USER, RIDE_STATUS.CANCELLED_BY_DRIVER] // Add other terminal states as needed
        );
        if (rides.length > 0) {
            res.json(rides[0]);
        } else {
            res.json(null); // No active ride
        }
    } catch (error) {
        console.error('Get Current User Ride Error:', error);
        res.status(500).json({ message: 'Server error retrieving current ride for user.' });
    }
};


module.exports = {
  requestRide,
  getNewRideForDriver,
  acceptRide,
  rejectRide,
  arriveAtPickup,
  startRide,
  completeRide,
  getRideStatus,
  getCurrentUserRide,
};