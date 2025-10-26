const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const reportRoutes = require('./reportRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const adminRoutes = require('./adminRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const sseRoutes = require('./sseRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/stream', sseRoutes);

module.exports = router;
