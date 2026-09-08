const express = require('express');
const router = express.Router();
const {
    getAllLecturers,
    getLecturerById,
    createLecturer,
    updateLecturer,
    deleteLecturer
} = require('../controllers/lecturerController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllLecturers);
router.get('/:id', getLecturerById);
router.post('/', createLecturer);
router.put('/:id', updateLecturer);
router.delete('/:id', deleteLecturer);

module.exports = router;
