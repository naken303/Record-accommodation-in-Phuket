const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

// Versioning the API
const API_VERSION = 'v1';

router.get(`/${API_VERSION}/allUsers`, userController.getAllUsers);
router.post(`/${API_VERSION}/create`, userController.createUser);

router.post(`/${API_VERSION}/login`, userController.loginUser);
router.put(`/${API_VERSION}/logout`, authenticate , userController.logoutUser)

module.exports = router;
