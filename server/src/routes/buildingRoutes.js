const express = require('express');
const router = express.Router();
const {
    getAllBuildings,
    getBuildingById,
    createBuilding,
    updateBuilding,
    deleteBuilding
} = require('../controllers/buildingController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllBuildings);
router.get('/:id', getBuildingById);
router.post('/', createBuilding);
router.put('/:id', updateBuilding);
router.delete('/:id', deleteBuilding);

module.exports = router;
