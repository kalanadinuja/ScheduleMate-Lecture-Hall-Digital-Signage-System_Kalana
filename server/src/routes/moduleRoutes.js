const express = require('express');
const router = express.Router();
const {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllModules);
router.get('/:id', getModuleById);
router.post('/', createModule);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);

module.exports = router;
