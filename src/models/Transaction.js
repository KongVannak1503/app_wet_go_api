const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    date: { type: String },
    baseAmount: Number,
    absentMultiplier: { type: Number, default: 1 },
    adjustment: { type: Number, default: 0 },
    ownerDiscountShare: { type: Number, default: 0 },
    finalAmount: Number,
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    note: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
