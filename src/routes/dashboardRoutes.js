const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, authorize } = require('../middlewares/auth');

// Dashboard routes (managerial/admin/dispatcher access)
router.get('/metrics', auth, authorize('admin', 'managerial', 'dispatcher'), dashboardController.getMetrics);
router.get('/activity', auth, authorize('admin', 'managerial', 'dispatcher'), dashboardController.getRecentActivity);
router.get('/performance', auth, authorize('admin', 'managerial'), dashboardController.getPerformanceByOfficer);

module.exports = router;
