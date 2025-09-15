const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Store = require('../models/Store');


exports.getDashboard = async (req, res) => {
    try {
        // Total sum of finalAmount in transactions
        const totalAmountAgg = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    totalFinalAmount: { $sum: '$finalAmount' } // sum all finalAmount
                }
            }
        ]);
        const totalFinalAmount = totalAmountAgg[0]?.totalFinalAmount || 0;

        // Count all users
        const userCount = await User.countDocuments();

        // Count all stores
        const storeCount = await Store.countDocuments();
        console.log("Store", storeCount);
        console.log("user", userCount);

        res.json({
            success: true,
            data: {
                totalFinalAmount,
                userCount,
                storeCount
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


// 📌 1. Create today's transactions (bulk)
exports.createTodayTransactions = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const activeStores = await Store.find({ isActive: true });

        const existingTx = await Transaction.find({ date: today });
        const existingStoreIds = new Set(existingTx.map(t => String(t.storeId)));

        // Find stores missing transactions
        const missingStores = activeStores.filter(
            s => !existingStoreIds.has(String(s._id))
        );

        if (missingStores.length === 0) {
            return res.json({
                success: true,
                message: "All active stores already have today’s transactions",
            });
        }

        // Create new transactions
        const docs = missingStores.map(store => ({
            storeId: store._id,
            date: today,
            amount: store.amount,
            status: 'Unpaid',
            createdBy: req.user._id,
        }));

        const created = await Transaction.insertMany(docs);

        res.json({
            success: true,
            created: created.length,
            transactions: created,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 📌 2. Mark Paid (via QR scan)
exports.markPaid = async (req, res) => {
    try {
        const { storeId } = req.body;
        const today = new Date().toISOString().slice(0, 10);

        let tx = await Transaction.findOne({ storeId, date: today });

        if (!tx) {
            return res.status(404).json({ success: false, message: "Transaction not found for today" });
        }

        tx.status = 'Paid';
        tx.amount = req.body.amount ?? tx.amount; // allow override
        tx.note = req.body.note ?? tx.note;
        tx.createdBy = req.user._id;
        tx.paidAt = new Date();

        await tx.save();

        res.json({ success: true, transaction: tx });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 📌 3. Update transaction (admin/collector edits)
exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const tx = await Transaction.findByIdAndUpdate(id, updates, { new: true });

        if (!tx) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        res.json({ success: true, transaction: tx });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 📌 4. Delete transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const tx = await Transaction.findByIdAndDelete(id);

        if (!tx) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        res.json({ success: true, message: "Transaction deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 📌 5. Get transactions (with filters)
// 📌 Get all transactions for today (no filter object)
exports.getTransactions = async (req, res) => {
    try {
        // Get all transactions
        let transactions = await Transaction.find()
            .populate('storeId', 'stallId name owner group amount')
            .populate('createdBy', 'username');

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Filter in JS for today
        transactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= startOfDay && txDate < endOfDay;
        });
        res.json({
            success: true,
            count: transactions.length,
            data: transactions,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const { name, date } = req.query;
        let filter = {};
        if (date) {
            const start = new Date(date + 'T00:00:00.000Z');
            const end = new Date(date + 'T23:59:59.999Z');
            filter.createdAt = { $gte: start, $lte: end };
        }

        // Fetch all transactions with populated fields
        let transactions = await Transaction.find(filter)
            .populate('storeId', 'stallId name owner group amount')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        // Filter by store name (case-insensitive) after population
        if (name) {
            const nameLower = name.toLowerCase();
            transactions = transactions.filter(t =>
                t.storeId && t.storeId.name.toLowerCase().includes(nameLower)
            );
        }
        res.json({ success: true, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};



// 📌 5. Get transactions (with filters)
// controller
exports.getTransactionsActive = async (req, res) => {
    try {
        const { storeId } = req.params;

        if (!storeId) {
            return res.status(400).json({ success: false, message: "storeId is required" });
        }

        const transactions = await Transaction.find({
            storeId: storeId,
            status: "Unpaid",
        })
            .populate('storeId', 'amount')
            .sort({ date: 1 });
        res.json({
            success: true,
            data: transactions,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.getUnpaidSummary = async (req, res) => {
    try {
        const { storeId } = req.body;

        if (!storeId) {
            return res.status(400).json({ success: false, message: "storeId is required" });
        }

        // Find all unpaid transactions for this store
        const unpaidTx = await Transaction.find({ storeId, status: "Unpaid" });

        if (unpaidTx.length === 0) {
            return res.json({ success: true, message: "No unpaid transactions", total: 0, transactions: [] });
        }

        // Calculate total amount
        const totalAmount = unpaidTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);

        res.json({
            success: true,
            totalAmount,
            transactions: unpaidTx,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.markAllUnpaidPaid = async (req, res) => {
    try {
        const { storeId } = req.body;
        const collectorId = req.user._id;
        const today = new Date().toISOString().slice(0, 10);

        const unpaidTx = await Transaction.find({ storeId, status: "Unpaid" });

        if (unpaidTx.length === 0) {
            return res.json({ success: false, message: "No unpaid transactions" });
        }

        let totalAmount = 0;

        for (let tx of unpaidTx) {
            tx.status = "Paid";
            tx.paidAt = new Date();
            tx.createdBy = collectorId;
            totalAmount += tx.amount || 0;
            await tx.save();
        }

        res.json({
            success: true,
            message: `${unpaidTx.length} transactions marked as paid`,
            totalAmount,
            transactions: unpaidTx,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.markPayment = async (req, res) => {
    try {
        const { storeId } = req.params;

        if (!storeId) {
            return res.status(400).json({ success: false, message: "storeId is required" });
        }

        // Find all unpaid transactions for this store
        const unpaidTransactions = await Transaction.find({
            storeId,
            status: "Unpaid",
        }).populate('storeId', 'amount').sort({ date: 1 }); // oldest first

        if (!unpaidTransactions.length) {
            return res.status(404).json({ success: false, message: "No unpaid transactions found" });
        }

        const latestTransaction = unpaidTransactions[unpaidTransactions.length - 1];
        const amountToPay = latestTransaction.storeId.amount;
        console.log(unpaidTransactions);

        await Transaction.updateMany(
            { storeId, status: "Unpaid" },
            {
                $set: {
                    status: "Paid",
                    date: new Date(),
                    finalAmount: amountToPay,
                    updatedBy: req.user._id
                },
            }
        );

        res.json({
            success: true,
            message: "All unpaid transactions marked as Paid",
            paidAmount: amountToPay,
            count: unpaidTransactions.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};
