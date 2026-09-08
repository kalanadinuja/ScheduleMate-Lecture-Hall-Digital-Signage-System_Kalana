const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', verifyToken, getProfile);

module.exports = router;
