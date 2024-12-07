// set up library
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');

// config
const config = require('./config/config.js');

// routes
const userRoutes = require('./routes/userRoutes');
const hotelRoutes = require('./routes/hotelRoutes');

// authenticate
const { authenticate } = require('./middleware/authMiddleware');

// Load environment variables from .env
require('dotenv').config();

// use express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(config.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Auth route
app.get('/api/checkAuth', authenticate, (req, res) => {
    const user = req.user;
    res.status(200).json({data: user, message: 'vertify success.'})
})

// Routes
// app.use('/api/hotel', authenticate);
app.use('/api/hotel', authenticate, hotelRoutes);
app.use('/api/user', userRoutes);

// Define the directory where your static files are located
const staticDirectory = path.join(__dirname, 'src');

// Serve static files from the 'public' directory
app.use(express.static(staticDirectory));

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`);
});
