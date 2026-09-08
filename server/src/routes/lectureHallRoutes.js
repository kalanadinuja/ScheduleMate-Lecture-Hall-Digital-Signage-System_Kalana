const express = require('express');
const router = express.Router();
const {
    getAllLectureHalls,
    getLectureHallById,
    createLectureHall,
    updateLectureHall,
    deleteLectureHall
} = require('../controllers/lectureHallController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllLectureHalls);
router.get('/:id', getLectureHallById);
router.post('/', createLectureHall);
router.put('/:id', updateLectureHall);
router.delete('/:id', deleteLectureHall);

module.exports = router;
