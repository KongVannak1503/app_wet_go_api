require('dotenv').config(); // Load .env
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Store = require('./models/Store');

// Connect to MongoDB using MONGO_URI from .env
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

async function seed() {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Store.deleteMany({});

        // Create admin user
        const hashedPassword = await bcrypt.hash('123456', 10); // you can change password
        const adminUser = await User.create({
            email: 'admin@example.com',
            phone: '097885687',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
        });
        console.log('Admin user created:', adminUser.email);

        // Array of 8 stores
        const storesData = [
            { stallId: 'M001', name: 'VK OE', owner: 'Vannak', group: 'V1', amount: 1000 },
            { stallId: 'M002', name: 'Fresh Fish', owner: 'Sophea', group: 'V2', amount: 1200 },
            { stallId: 'M003', name: 'Green Veg', owner: 'Rithy', group: 'V1', amount: 900 },
            { stallId: 'M004', name: 'Fruit Paradise', owner: 'Srey Mom', group: 'V3', amount: 1500 },
            { stallId: 'M005', name: 'Rice & Grain', owner: 'Vichea', group: 'V2', amount: 2000 },
            { stallId: 'M006', name: 'Meat Market', owner: 'Sophal', group: 'V3', amount: 1800 },
            { stallId: 'M007', name: 'Spices & Herbs', owner: 'Chenda', group: 'V1', amount: 1100 },
            { stallId: 'M008', name: 'Bakery Corner', owner: 'Ratha', group: 'V2', amount: 1300 },
        ];

        const storesWithUser = storesData.map(store => ({
            ...store,
            isActive: true,
            createdBy: adminUser._id,
            updatedBy: adminUser._id,
        }));

        const stores = await Store.insertMany(storesWithUser);
        console.log(`${stores.length} stores created successfully.`);

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        mongoose.connection.close();
    }
}

seed();
