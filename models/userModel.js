const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const defaultTokenExpiration = '1h';

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    token: String
}, {
    versionKey: false, // Disable the version key
});

// Method to generate a JWT token with expiration
userSchema.methods.generateAuthToken = function () {
    const expiration = process.env.TOKEN_EXPIRATION || defaultTokenExpiration;
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: expiration });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
