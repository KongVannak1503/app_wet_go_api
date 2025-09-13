const express = require('express');
const router = express.Router();
const { registerUser, loginUser, testUser, getUsers, getUser, deleteUser, updateUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/', authMiddleware, authorize(['admin', 'cashier']), getUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/test', testUser);
router.get('/:id', authMiddleware, authorize('admin'), getUser);
router.put('/:id', authMiddleware, authorize('admin'), updateUser);
router.delete('/:id', authMiddleware, authorize('admin'), deleteUser);


module.exports = router;
