const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// Public routes
router.get('/state', storeController.getStoreStats);
router.get('/', authMiddleware, authorize(['admin']), storeController.getAllStores);
router.get('/:id', authMiddleware, authorize(['admin', 'cashier']), storeController.getStoreById);

// Protected routes
router.post('/', authMiddleware, authorize(['admin']), storeController.createStore);
router.put('/:id', authMiddleware, authorize(['admin']), storeController.updateStore);
router.delete('/:id', authMiddleware, authorize(['admin']), storeController.deleteStore);

module.exports = router;
