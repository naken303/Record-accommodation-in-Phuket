const User = require('../models/userModel');
const { getUserById } = require('../services/userService')

// Function to get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to create a user
exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to log in a user
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const usertest = await User.find();
        console.log(usertest);
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const passwordMatch = (password === user.password)
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate and save a new token with expisration
        const token = user.generateAuthToken();
        user.token = token;
        await user.save();
        
        res.status(200).json({ token: token, _id: user._id })

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to log out a user
exports.logoutUser = async (req, res) => {
    try {
        const user = await getUserById(req.body.id)
        
        user.token = undefined;
        await user.save();

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
