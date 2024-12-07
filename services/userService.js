const User = require('../models/userModel');

exports.getUserById = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        throw new Error('Error fetching user');
    }
};
