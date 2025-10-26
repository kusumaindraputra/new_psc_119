const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middlewares/auth');

// All admin routes require authentication and admin/managerial role
const adminAuth = [auth, authorize('admin', 'managerial')];

// Categories
router.get('/categories', auth, adminController.getAllCategories);
router.post('/categories', adminAuth, adminController.createCategory);
router.put('/categories/:categoryId', adminAuth, adminController.updateCategory);
router.delete('/categories/:categoryId', adminAuth, adminController.deleteCategory);

// Units
router.get('/units', auth, adminController.getAllUnits);
router.post('/units', adminAuth, adminController.createUnit);
router.put('/units/:unitId', adminAuth, adminController.updateUnit);
router.delete('/units/:unitId', adminAuth, adminController.deleteUnit);

// Vehicles
router.get('/vehicles', auth, adminController.getAllVehicles);
router.post('/vehicles', adminAuth, adminController.createVehicle);
router.put('/vehicles/:vehicleId', adminAuth, adminController.updateVehicle);
router.delete('/vehicles/:vehicleId', adminAuth, adminController.deleteVehicle);

module.exports = router;
