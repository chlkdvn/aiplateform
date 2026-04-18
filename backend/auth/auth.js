export const isAuthenticated = (req, res, next) => {
  console.log("USER:", req.user);

  if (req.user) {
    return next(); // ✅ clean, reliable
  }

  return res.status(401).json({
    success: false,
    message: "Unauthorized",
  });
};




import { verifyToken } from '../utils/jwt.js';
import Admin from '../models/admin.js';

// Protect routes - ensures user is authenticated as admin
export const protect = async (req, res, next) => {
  // Safety check: ensure next is a function
  if (typeof next !== 'function') {
    console.error('Protect middleware error: next is not a function');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error',
    });
  }

  try {
    let token;

    // Check for token in cookies (requires cookie-parser)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // Check for token in Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in. Please log in to access this resource.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
      }
      throw jwtError;
    }

    // Check if admin still exists
    const admin = await Admin.findById(decoded.id).select('-password -__v');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'The admin belonging to this token no longer exists.',
      });
    }

    // Grant access
    req.admin = admin;
    
    // Call next() to proceed to the next middleware/controller
    return next();
    
  } catch (error) {
    console.error('Protect middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed.' 
    });
  }
};

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};