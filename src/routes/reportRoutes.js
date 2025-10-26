const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public routes (no authentication required)
router.post('/', upload.single('photo'), reportController.createReport);
router.get('/track/:phone', reportController.trackReportByPhone);

// Protected routes
router.get('/', auth, reportController.getAllReports);
router.get('/:reportId', auth, reportController.getReportById);

// Dispatcher/Admin routes
router.put('/:reportId/status', auth, authorize('dispatcher', 'admin'), reportController.updateReportStatus);

// Field officer routes
router.post('/:reportId/logs', auth, authorize('field_officer', 'dispatcher', 'admin'), upload.single('photo'), reportController.addReportLog);

module.exports = router;
