const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, authorize } = require('../middlewares/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

// Allow dispatcher/admin/managerial to list field officers for assignment
router.get('/users/field-officers', auth, authorize('dispatcher', 'admin', 'managerial'), authController.getFieldOfficers);

// Admin only routes
router.get('/users', auth, authorize('admin', 'managerial'), authController.getAllUsers);
router.put('/users/:userId', auth, authorize('admin'), authController.updateUser);

module.exports = router;
