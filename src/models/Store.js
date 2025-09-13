const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    stallId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    group: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model('Store', userSchema);
