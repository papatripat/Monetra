const express = require('express');
const router = express.Router();
const {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} = require('../controllers/transactionController');
const { validateTransaction, validateId } = require('../middleware/validate');
const { handleValidationErrors } = require('../middleware/errorHandler');
const auth = require('../middleware/auth');

// Semua route membutuhkan authentication
router.use(auth);

// GET /api/transactions
router.get('/', getTransactions);

// POST /api/transactions
router.post('/', validateTransaction, handleValidationErrors, createTransaction);

// PUT /api/transactions/:id
router.put('/:id', validateId, validateTransaction, handleValidationErrors, updateTransaction);

// DELETE /api/transactions/:id
router.delete('/:id', validateId, handleValidationErrors, deleteTransaction);

module.exports = router;
