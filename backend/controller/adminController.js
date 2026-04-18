import Admin from '../models/admin.js';
import { generateToken } from '../utils/jwt.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists.',
      });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: 'admin',
    });

    const token = generateToken(admin._id);
    
    // Set cookie if using cookie-parser (optional - remove if using headers only)
    if (res.cookie) {
      res.cookie('token', token, cookieOptions);
    }

    res.status(201).json({
      success: true,
      loggedIn: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        role: admin.role,
      },
      token, // Always return token in response for header-based auth
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(admin._id);

    const cookieOpts = { ...cookieOptions };
    if (remember) {
      cookieOpts.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    // Set cookie if using cookie-parser (optional - remove if using headers only)
    if (res.cookie) {
      res.cookie('token', token, cookieOpts);
    }

    res.status(200).json({
      success: true,
      loggedIn: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        role: admin.role,
      },
      token, // Always return token for header-based auth
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      loggedIn: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        avatar: req.admin.avatar,
        role: req.admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin data.',
    });
  }
};

export const logoutAdmin = (req, res) => {
  if (res.cookie) {
    res.cookie('token', 'logged-out', {
      httpOnly: true,
      expires: new Date(Date.now() + 5 * 1000),
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};