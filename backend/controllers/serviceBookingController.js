const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new service booking
// @route   POST /api/service-bookings
// @access  Protected (User)
const createServiceBooking = async (req, res) => {
  const {
    userId, // Should come from authenticated user (req.authEntity.id)
    serviceType, // 'HOTEL', 'FLIGHT', 'COURIER'
    clientFullName,
    clientEmail,
    clientContact,
    originatingServiceTitle,
    // Hotel
    hotelName, checkInDate, checkOutDate, roomType, numberOfGuestsHotel,
    // Flight
    departureAirport, arrivalAirport, departureDate, returnDate, flightClass, numberOfPassengersFlight,
    // Courier
    courierPickupAddress, courierDropoffAddress, packageDescription, packageWeightKg, deliverySpeed,
    // Common
    notes 
  } = req.body;

  const authenticatedUserId = req.authEntity.id;

  // Basic validation
  if (!authenticatedUserId || !serviceType || !clientFullName || !clientEmail || !clientContact) {
    return res.status(400).json({ message: 'Missing required common booking fields or authentication problem.' });
  }

  // Service type specific validation
  if (serviceType === 'HOTEL' && (!hotelName || !checkInDate || !checkOutDate)) {
    return res.status(400).json({ message: 'Missing required fields for hotel booking (hotel name, check-in/out dates).' });
  }
  if (serviceType === 'FLIGHT' && (!departureAirport || !arrivalAirport || !departureDate)) {
    return res.status(400).json({ message: 'Missing required fields for flight booking (airports, departure date).' });
  }
  if (serviceType === 'COURIER' && (!courierPickupAddress || !courierDropoffAddress || !packageDescription)) {
    return res.status(400).json({ message: 'Missing required fields for courier booking (addresses, description).' });
  }
  
  const bookingId = uuidv4();

  try {
    const [result] = await pool.query(
      `INSERT INTO ServiceBookings (
        id, userId, serviceType, clientFullName, clientEmail, clientContact, originatingServiceTitle,
        hotelName, checkInDate, checkOutDate, roomType, numberOfGuestsHotel,
        departureAirport, arrivalAirport, departureDate, returnDate, flightClass, numberOfPassengersFlight,
        courierPickupAddress, courierDropoffAddress, packageDescription, packageWeightKg, deliverySpeed,
        notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_CONFIRMATION')`,
      [
        bookingId, authenticatedUserId, serviceType, clientFullName, clientEmail, clientContact, originatingServiceTitle,
        hotelName || null, checkInDate || null, checkOutDate || null, roomType || null, numberOfGuestsHotel || null,
        departureAirport || null, arrivalAirport || null, departureDate || null, returnDate || null, flightClass || null, numberOfPassengersFlight || null,
        courierPickupAddress || null, courierDropoffAddress || null, packageDescription || null, packageWeightKg || null, deliverySpeed || null,
        notes || null
      ]
    );

    if (result.affectedRows === 1) {
      // Fetch the created booking to return it (optional, but good practice)
      const [newBookingRows] = await pool.query('SELECT * FROM ServiceBookings WHERE id = ?', [bookingId]);
      res.status(201).json({
        message: `${originatingServiceTitle || serviceType} request submitted successfully. We will contact you for confirmation.`,
        booking: newBookingRows[0],
      });
    } else {
      res.status(500).json({ message: `Error submitting ${originatingServiceTitle || serviceType} request.` });
    }
  } catch (error) {
    console.error('Create Service Booking Error:', error);
    res.status(500).json({ message: 'Server error during service booking submission.' });
  }
};

// @desc    Get all service bookings for an admin (example)
// @route   GET /api/service-bookings
// @access  Protected (Admin - needs new role/middleware)
const getAllServiceBookings = async (req, res) => {
    // This is a placeholder for admin functionality.
    // Ensure you have admin authorization middleware if implementing.
    // if (req.authEntity.type !== 'admin') {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    try {
        const [bookings] = await pool.query('SELECT sb.*, u.fullName as userFullName FROM ServiceBookings sb JOIN Users u ON sb.userId = u.id ORDER BY sb.createdAt DESC');
        res.json(bookings);
    } catch (error) {
        console.error('Get All Service Bookings Error:', error);
        res.status(500).json({ message: 'Server error retrieving service bookings.' });
    }
};

// @desc    Get service bookings for the authenticated user
// @route   GET /api/service-bookings/my-bookings
// @access  Protected (User)
const getMyServiceBookings = async (req, res) => {
    const userId = req.authEntity.id;
    try {
        const [bookings] = await pool.query('SELECT * FROM ServiceBookings WHERE userId = ? ORDER BY createdAt DESC', [userId]);
        res.json(bookings);
    } catch (error) {
        console.error('Get My Service Bookings Error:', error);
        res.status(500).json({ message: 'Server error retrieving your service bookings.' });
    }
};


module.exports = {
  createServiceBooking,
  getAllServiceBookings, // Example, needs admin auth
  getMyServiceBookings,  // For users to see their own
};