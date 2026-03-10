const express = require('express');
const router = express.Router();
const { getBudgets, createOrUpdateBudget, deleteBudget } = require('../controllers/budgetController');
const { validateBudget, validateId } = require('../middleware/validate');
const { handleValidationErrors } = require('../middleware/errorHandler');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/budgets
router.get('/', getBudgets);

// POST /api/budgets
router.post('/', validateBudget, handleValidationErrors, createOrUpdateBudget);

// DELETE /api/budgets/:id
router.delete('/:id', validateId, handleValidationErrors, deleteBudget);

module.exports = router;
