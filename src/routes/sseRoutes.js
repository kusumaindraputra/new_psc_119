const express = require('express');
const router = express.Router();
const { streamEvents } = require('../events/sseController');
const { auth } = require('../middlewares/auth');

// SSE endpoint - requires authentication
router.get('/events', auth, streamEvents);

module.exports = router;
