const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
require('dotenv').config();


const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');


const PORT = process.env.PORT || 3000;

dbConnect();

const app = express();
const path = require('path');
app.use(express.json());

app.use(express.urlencoded({
    extended: true,
}));
app.use(cors());


app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));