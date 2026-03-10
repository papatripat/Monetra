const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { handleValidationErrors } = require('../middleware/errorHandler');
const auth = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', validateRegister, handleValidationErrors, register);

// POST /api/auth/login
router.post('/login', validateLogin, handleValidationErrors, login);

// GET /api/auth/me
router.get('/me', auth, getMe);

module.exports = router;
