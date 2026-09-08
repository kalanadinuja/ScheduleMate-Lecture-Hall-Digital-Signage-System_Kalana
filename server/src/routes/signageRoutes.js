const express = require('express');
const router = express.Router();
const { getSignageData, getRoomStatusData } = require('../controllers/signageController');

// Public signage routes - No JWT token required
router.get('/:displayId', getSignageData);
router.get('/:displayId/room-status', getRoomStatusData);

module.exports = router;
