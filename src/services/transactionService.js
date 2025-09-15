const Store = require('../models/Store');
const Transaction = require('../models/Transaction');

/**
 * Ensure daily transactions exist for all active stores.
 * If some already exist, only add missing ones.
 */
async function createDailyTransactions(userId) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // 1. Find all active stores
    const activeStores = await Store.find({ isActive: true });

    // 2. Find stores that already have transaction today
    const existingTx = await Transaction.find({ date: today });
    const existingStoreIds = new Set(existingTx.map(t => String(t.storeId)));

    // 3. Filter stores that don’t have a transaction yet
    const missingStores = activeStores.filter(s => !existingStoreIds.has(String(s._id)));

    if (missingStores.length === 0) {
        return { created: 0, message: 'All active stores already have today’s transactions' };
    }

    // 4. Create transactions for missing stores
    const docs = missingStores.map(store => ({
        storeId: store._id,
        date: today,
        amount: store.amount,
        status: 'Unpaid',
        createdBy: req.user._id,
    }));

    const created = await Transaction.insertMany(docs);

    return { created: created.length, transactions: created };
}

module.exports = { createDailyTransactions };
