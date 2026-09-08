const express = require('express');
const router = express.Router();
const {
    getAllSessions,
    getSessionById,
    createSession,
    updateSession,
    cancelSession,
    rescheduleSession,
    deleteSession
} = require('../controllers/lectureSessionController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllSessions);
router.get('/:id', getSessionById);
router.post('/', createSession);
router.put('/:id', updateSession);
router.patch('/:id/cancel', cancelSession);
router.patch('/:id/reschedule', rescheduleSession);
router.delete('/:id', deleteSession);

module.exports = router;
