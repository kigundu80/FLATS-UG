const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid'); 
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Default to 1 hour

const generateToken = (id, type, additionalData = {}) => {
  return jwt.sign({ id, type, ...additionalData }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/user/signup
// @access  Public
const userSignup = async (req, res) => {
  const { fullName, email, password, contactPhone } = req.body;

  if (!fullName || !email || !password || !contactPhone) {
    return res.status(400).json({ message: 'Please provide all required fields: fullName, email, password, contactPhone.' });
  }
  // Basic validation (more can be added, e.g., password strength, email format)
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
   if (!/^(?:\+256|0)\d{9}$/.test(contactPhone.replace(/\s/g, ''))) {
    return res.status(400).json({ message: 'Invalid Ugandan phone number format.'});
  }


  try {
    const [existingUsers] = await pool.query('SELECT email FROM Users WHERE email = ? OR contactPhone = ?', [email, contactPhone]);
    if (existingUsers.length > 0) {
      const existingField = existingUsers[0].email === email ? 'email' : 'phone number';
      return res.status(409).json({ message: `User with this ${existingField} already exists.` });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    const [result] = await pool.query(
      'INSERT INTO Users (id, fullName, email, passwordHash, contactPhone) VALUES (?, ?, ?, ?, ?)',
      [userId, fullName, email, passwordHash, contactPhone]
    );

    if (result.affectedRows === 1) {
      // Optionally, generate a token and log them in directly, or just confirm registration
      res.status(201).json({
        message: 'User registered successfully. Please login.',
        // No token returned here to enforce separate login step, or you could return one:
        // user: { id: userId, fullName, email, contactPhone },
        // token: generateToken(userId, 'user'),
      });
    } else {
      res.status(500).json({ message: 'Error registering user due to a server issue.' });
    }
  } catch (error) {
    console.error('User Signup Error:', error);
    res.status(500).json({ message: 'Server error during user registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/user/login
// @access  Public
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const [users] = await pool.query('SELECT id, fullName, email, contactPhone, passwordHash, isActive FROM Users WHERE email = ?', [email]);
    const user = users[0];

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      if (!user.isActive) {
        return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
      }
      res.json({
        message: 'User login successful.',
        user: { 
          id: user.id, 
          fullName: user.fullName, 
          email: user.email,
          contact: user.contactPhone // Send contactPhone as contact
        },
        token: generateToken(user.id, 'user'),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('User Login Error:', error);
    res.status(500).json({ message: 'Server error during user login.' });
  }
};

// @desc    Register a new driver (Admin Only)
// @route   POST /api/auth/driver/signup
// @access  Admin Protected
const driverSignupByAdmin = async (req, res) => {
    // In a real app, this should be protected by an admin-only middleware.
    const { fullName, email, password, contactPhone, vehicleModel, licensePlate, serviceTypes } = req.body;

    // --- Validation ---
    if (!fullName || !email || !password || !contactPhone || !vehicleModel || !licensePlate) {
        return res.status(400).json({ message: 'Please provide all required fields for driver creation.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (!/^(?:\+256|0)\d{9}$/.test(contactPhone.replace(/\s/g, ''))) {
        return res.status(400).json({ message: 'Invalid Ugandan phone number format.' });
    }
    if (serviceTypes && !Array.isArray(serviceTypes)) {
        return res.status(400).json({ message: 'serviceTypes must be an array of strings.' });
    }


    try {
        // --- Check for uniqueness across users and drivers ---
        const [existingUser] = await pool.query('SELECT email FROM Users WHERE email = ? OR contactPhone = ?', [email, contactPhone]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'A user account with this email or phone already exists.' });
        }
        const [existingDriver] = await pool.query('SELECT email FROM Drivers WHERE email = ? OR phone = ?', [email, contactPhone]);
        if (existingDriver.length > 0) {
            return res.status(409).json({ message: 'A driver account with this email or phone already exists.' });
        }

        // --- Generate new Driver ID ---
        const [lastDriver] = await pool.query("SELECT driverId FROM Drivers ORDER BY CAST(SUBSTRING(driverId, 4) AS SIGNED) DESC LIMIT 1");
        let newIdNumber = 1;
        if (lastDriver.length > 0) {
            const lastId = lastDriver[0].driverId;
            const lastNumber = parseInt(lastId.replace('DRV', ''), 10);
            newIdNumber = lastNumber + 1;
        }
        const newDriverId = `DRV${String(newIdNumber).padStart(3, '0')}`;

        // --- Create Driver Record ---
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const driverUUID = uuidv4();

        const [result] = await pool.query(
            `INSERT INTO Drivers (id, driverId, fullName, email, passwordHash, phone, vehicleModel, licensePlate, availabilityStatus, verificationStatus, isActive, rating, serviceTypes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Offline', 'APPROVED', 1, 5.0, ?)`,
            [driverUUID, newDriverId, fullName, email, passwordHash, contactPhone, vehicleModel, licensePlate, JSON.stringify(serviceTypes || [])]
        );

        if (result.affectedRows === 1) {
            res.status(201).json({
                message: 'Driver account created successfully.',
                driver: {
                    id: driverUUID,
                    driverId: newDriverId,
                    fullName,
                    email,
                    contactPhone,
                    serviceTypes: serviceTypes || [],
                    // Note: We don't return the password or hash.
                },
            });
        } else {
            res.status(500).json({ message: 'Error creating driver account due to a server issue.' });
        }
    } catch (error) {
        console.error('Driver Signup Error:', error);
        res.status(500).json({ message: 'Server error during driver registration.' });
    }
};


// @desc    Authenticate driver & get token
// @route   POST /api/auth/driver/login
// @access  Public
const driverLogin = async (req, res) => {
  const { driverId, password } = req.body; 

  if (!driverId || !password) {
    return res.status(400).json({ message: 'Please provide Driver ID and password.' });
  }

  try {
    const [drivers] = await pool.query(
      'SELECT id, driverId, fullName, email, phone, vehicleModel, licensePlate, profileImageUrl, rating, passwordHash, availabilityStatus, verificationStatus, isActive FROM Drivers WHERE driverId = ?',
      [driverId] // Using the human-readable driverId for login lookup
    );
    const driver = drivers[0];

    if (driver && (await bcrypt.compare(password, driver.passwordHash))) {
      if (!driver.isActive) {
        return res.status(403).json({ message: 'Your driver account is inactive. Please contact support.' });
      }
      if (driver.verificationStatus !== 'APPROVED') {
        return res.status(403).json({ message: `Your driver account status is ${driver.verificationStatus.toLowerCase()}. Login not permitted until approved.` });
      }

      res.json({
        message: 'Driver login successful.',
        driver: { // Send back more complete profile for frontend state
          id: driver.id,
          driverId: driver.driverId,
          fullName: driver.fullName,
          email: driver.email,
          phone: driver.phone,
          vehicleModel: driver.vehicleModel,
          licensePlate: driver.licensePlate,
          profileImageUrl: driver.profileImageUrl,
          rating: driver.rating,
          availabilityStatus: driver.availabilityStatus,
        },
        token: generateToken(driver.id, 'driver', { driverSystemId: driver.driverId }), // driver.id is UUID, driver.driverId is human readable
      });
    } else {
      res.status(401).json({ message: 'Invalid Driver ID or password.' });
    }
  } catch (error) {
    console.error('Driver Login Error:', error);
    res.status(500).json({ message: 'Server error during driver login.' });
  }
};

const logout = async (req, res) => {
    res.status(200).json({ message: 'Logout successful (client should clear token).' });
};

module.exports = {
  userSignup,
  userLogin,
  driverLogin,
  driverSignupByAdmin,
  logout,
};