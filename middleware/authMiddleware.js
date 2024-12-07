const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = async (req, res, next) => {
    // const token = req.headers.authorization || req.query.token;
    const token = req.headers.authorization.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication token is missing.' });
    }

    try {
        // Verify the token and extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID and token
        const user = await User.findOne({ _id: decoded._id, token });

        if (!user) {
            return res.status(401).json({ error: 'Invalid authentication token.' });
        }

        // Attach the user object to the request for use in subsequent middleware or routes
        req.user = user;

        // Continue to the next middleware or route
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Authentication token has expired.' });
        }

        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { authenticate };
