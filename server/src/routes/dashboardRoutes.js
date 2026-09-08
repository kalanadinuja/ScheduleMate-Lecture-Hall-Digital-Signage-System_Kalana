const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getDashboardStats);

module.exports = router;
