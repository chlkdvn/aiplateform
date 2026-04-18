import express from 'express';
import { registerAdmin, loginAdmin, getMe, logoutAdmin } from '../controller/adminController.js';
import { protect } from '../auth/auth.js';

const router = express.Router();

// Verify protect is a function (debugging)
if (typeof protect !== 'function') {
  console.error('CRITICAL ERROR: protect is not a function:', protect);
}

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes - ensure protect is passed as reference, not called
router.get('/me', protect, getMe);
router.get('/logout', protect, logoutAdmin);

export default router;