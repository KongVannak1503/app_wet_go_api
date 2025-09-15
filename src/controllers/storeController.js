const Store = require('../models/Store');

// Get all stores
exports.getAllStores = async (req, res) => {
    try {
        const stores = await Store.find()
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        res.status(200).json({ success: true, data: stores });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get store statistics
exports.getStoreStats = async (req, res) => {
    try {
        const totalStore = await Store.countDocuments();
        const totalStoreActive = await Store.countDocuments({ isActive: true });
        const totalStoreInactive = await Store.countDocuments({ isActive: false });

        res.status(200).json({
            success: true,
            data: {
                totalStore,
                totalStoreActive,
                totalStoreInactive
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};


// Get single store by id
exports.getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await Store.findById(id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        if (!store) return res.status(404).json({ success: false, error: 'Store not found' });
        res.status(200).json({ success: true, data: store });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Create a new store
exports.createStore = async (req, res) => {
    try {
        const { stallId, name, owner, group, amount, isActive } = req.body;

        // Validate required fields
        if (!stallId || !name || !owner || !group || amount === undefined) {
            return res.status(400).json({
                success: false,
                error: "Stall ID, name, owner, group, and amount are required."
            });
        }

        const newStore = new Store({
            stallId: stallId.trim(), // take from input
            name: name.trim(),
            owner: owner.trim(),
            group: group.trim(),
            amount: Number(amount),
            isActive: isActive ?? false,
            // createdBy: req.user._id,
            // updatedBy: req.user._id,
        });

        const savedStore = await newStore.save();
        res.status(201).json({ success: true, data: savedStore });
    } catch (err) {
        // Handle duplicate stallId error
        if (err.code === 11000 && err.keyPattern?.stallId) {
            return res.status(400).json({ success: false, error: "Stall ID already exists." });
        }

        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, error: err.message });
        }

        res.status(500).json({ success: false, error: err.message });
    }
};
// Update a store
exports.updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const { stallId, name, owner, group, amount, isActive } = req.body;

        const updatedStore = await Store.findByIdAndUpdate(
            id,
            {
                stallId,
                name,
                owner,
                group,
                amount,
                isActive,
                updatedBy: req.user._id,
            },
            { new: true }
        );

        if (!updatedStore) return res.status(404).json({ success: false, error: 'Store not found' });

        res.status(200).json({ success: true, data: updatedStore });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete a store
exports.deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStore = await Store.findByIdAndDelete(id);
        if (!deletedStore) return res.status(404).json({ success: false, error: 'Store not found' });

        res.status(200).json({ success: true, data: deletedStore });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
