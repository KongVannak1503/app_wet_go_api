const express = require('express');
const router = express.Router();
const txCtrl = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/auth'); // JWT auth

router.get('/active/:storeId', authMiddleware, txCtrl.getTransactionsActive);

router.post('/', authMiddleware, txCtrl.createTodayTransactions);
router.post('/mark-paid', authMiddleware, txCtrl.markPaid);
router.put('/:id', authMiddleware, txCtrl.updateTransaction);
router.delete('/:id', authMiddleware, txCtrl.deleteTransaction);
router.get('/', authMiddleware, txCtrl.getAllTransactions);
router.get('/all', authMiddleware, txCtrl.getAllTransactions);
router.get('/unpaid', authMiddleware, txCtrl.getTransactions);
router.get('/dashboard', authMiddleware, txCtrl.getDashboard);
router.get('/get-unpaid', authMiddleware, txCtrl.getUnpaidSummary);
router.get('/make-paid', authMiddleware, txCtrl.getUnpaidSummary);
router.post('/payment/:storeId', authMiddleware, txCtrl.markPayment);


module.exports = router;
