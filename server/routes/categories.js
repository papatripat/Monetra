const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');
const auth = require('../middleware/auth');

// GET /api/categories
router.get('/', auth, getCategories);

module.exports = router;
