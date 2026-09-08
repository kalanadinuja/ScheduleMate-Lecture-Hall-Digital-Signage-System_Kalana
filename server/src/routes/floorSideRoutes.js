const express = require('express');
const router = express.Router();
const {
    getAllFloorSides,
    getFloorSideById,
    createFloorSide,
    updateFloorSide,
    deleteFloorSide
} = require('../controllers/floorSideController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllFloorSides);
router.get('/:id', getFloorSideById);
router.post('/', createFloorSide);
router.put('/:id', updateFloorSide);
router.delete('/:id', deleteFloorSide);

module.exports = router;
