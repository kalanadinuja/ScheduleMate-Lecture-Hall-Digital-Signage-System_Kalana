const express = require('express');
const router = express.Router();
const {
    getAllDisplays,
    getDisplayById,
    createDisplay,
    updateDisplay,
    deleteDisplay
} = require('../controllers/digitalDisplayController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllDisplays);
router.get('/:id', getDisplayById);
router.post('/', createDisplay);
router.put('/:id', updateDisplay);
router.delete('/:id', deleteDisplay);

module.exports = router;
