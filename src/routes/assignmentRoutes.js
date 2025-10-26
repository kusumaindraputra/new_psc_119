const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { auth, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Protected routes
router.get('/', auth, assignmentController.getAllAssignments);
router.get('/my', auth, assignmentController.getMyAssignments);
router.get('/:assignmentId', auth, assignmentController.getAssignmentById);

// Dispatcher/Admin routes (create assignment)
router.post('/', auth, authorize('dispatcher', 'admin'), assignmentController.createAssignment);

// Field officer routes (update assignment)
router.put('/:assignmentId/status', auth, authorize('field_officer', 'dispatcher', 'admin'), upload.single('photo'), assignmentController.updateAssignmentStatus);

module.exports = router;
