
const pool = require('../config/db');

// @desc    Get current driver's profile
// @route   GET /api/drivers/me
// @access  Protected (Driver)
const getDriverProfile = async (req, res) => {
  try {
    const driverId = req.authEntity.id; // UUID of the driver
    const [drivers] = await pool.query(
      'SELECT id, driverId as driverSystemId, fullName, email, phone, vehicleModel, licensePlate, profileImageUrl, rating, availabilityStatus, verificationStatus, isActive FROM Drivers WHERE id = ?', 
      [driverId]
    );

    if (drivers.length === 0) {
      return res.status(404).json({ message: 'Driver not found.' });
    }
    res.json(drivers[0]);
  } catch (error) {
    console.error('Get Driver Profile Error:', error);
    res.status(500).json({ message: 'Server error retrieving driver profile.' });
  }
};

// @desc    Update driver's availability status
// @route   PUT /api/drivers/me/availability
// @access  Protected (Driver)
const updateDriverAvailability = async (req, res) => {
  const { availability } = req.body; // Expected: 'Online', 'Offline'
  const driverUUID = req.authEntity.id;

  if (!availability || !['Online', 'Offline'].includes(availability)) {
    return res.status(400).json({ message: 'Invalid availability status provided. Must be "Online" or "Offline".' });
  }

  try {
    const [drivers] = await pool.query('SELECT availabilityStatus FROM Drivers WHERE id = ?', [driverUUID]);
    if (drivers.length === 0) {
      return res.status(404).json({ message: 'Driver not found.' });
    }

    const currentStatus = drivers[0].availabilityStatus;

    if (availability === 'Offline' && currentStatus === 'OnTrip') {
      return res.status(400).json({ message: 'Cannot go offline while on a trip. Please complete your current ride first.' });
    }
    
    // Check for active ride requests assigned to this driver if trying to go Offline (more complex logic for real app)
    // For now, only 'OnTrip' blocks going 'Offline'.

    const [result] = await pool.query('UPDATE Drivers SET availabilityStatus = ? WHERE id = ?', [availability, driverUUID]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Driver not found or status unchanged.' });
    }

    res.json({ message: `Driver availability updated to ${availability}.`, availabilityStatus: availability });
  } catch (error) {
    console.error('Update Driver Availability Error:', error);
    res.status(500).json({ message: 'Server error updating driver availability.' });
  }
};

module.exports = {
  getDriverProfile,
  updateDriverAvailability,
};
