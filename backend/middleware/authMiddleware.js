
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Attach user/driver info to request object
      // In a real app, you'd fetch the user/driver from DB to ensure they still exist/are active
      req.authEntity = decoded; // Contains { id, type: 'user'/'driver', driverId (if driver) }

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorizeDriver = (req, res, next) => {
    if (req.authEntity && req.authEntity.type === 'driver') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a driver' });
    }
};

const authorizeUser = (req, res, next) => {
    if (req.authEntity && req.authEntity.type === 'user') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a user' });
    }
};


module.exports = { protect, authorizeDriver, authorizeUser };
