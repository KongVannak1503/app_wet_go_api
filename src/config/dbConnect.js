const mongoose = require("mongoose");

const db = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ Database connected: ${connect.connection.host}, Database: ${connect.connection.name}`);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1); // Exit the process if the connection fails
    }
};

module.exports = db;
