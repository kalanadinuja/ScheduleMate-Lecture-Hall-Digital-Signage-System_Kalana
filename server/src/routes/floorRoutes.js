const express = require('express');
const router = express.Router();
const {
    getAllFloors,
    getFloorById,
    createFloor,
    updateFloor,
    deleteFloor
} = require('../controllers/floorController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllFloors);
router.get('/:id', getFloorById);
router.post('/', createFloor);
router.put('/:id', updateFloor);
router.delete('/:id', deleteFloor);

module.exports = router;
