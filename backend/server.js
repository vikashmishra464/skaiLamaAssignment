require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import models to ensure they're registered
require('./models/userModel');
require('./models/eventModel');
require('./models/eventLogModel');

const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔧 Please check your MongoDB connection string and ensure MongoDB is running');
    process.exit(1);
});
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
});
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.get("/health", (req, res) => {
    res.json({ 
        success: true, 
        message: "Event Management System API is running",
        timestamp: new Date().toISOString()
    });
});
app.get("/", (req, res) => {
    res.json({ 
        success: true, 
        message: "Welcome to Event Management System API",
        version: "1.0.0"
    });
});
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
});