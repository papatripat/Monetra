const { body, query, param } = require('express-validator');

const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama tidak boleh kosong')
        .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2-100 karakter'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email tidak boleh kosong')
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password tidak boleh kosong')
        .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email tidak boleh kosong')
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password tidak boleh kosong'),
];

const validateTransaction = [
    body('category_id')
        .notEmpty().withMessage('Kategori wajib dipilih')
        .isInt({ min: 1 }).withMessage('ID kategori tidak valid'),
    body('type')
        .notEmpty().withMessage('Tipe transaksi wajib diisi')
        .isIn(['income', 'expense']).withMessage('Tipe harus income atau expense'),
    body('amount')
        .notEmpty().withMessage('Jumlah wajib diisi')
        .isFloat({ min: 0.01 }).withMessage('Jumlah harus lebih dari 0'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Deskripsi maksimal 500 karakter'),
    body('transaction_date')
        .notEmpty().withMessage('Tanggal transaksi wajib diisi')
        .isISO8601().withMessage('Format tanggal tidak valid'),
];

const validateBudget = [
    body('category_id')
        .notEmpty().withMessage('Kategori wajib dipilih')
        .isInt({ min: 1 }).withMessage('ID kategori tidak valid'),
    body('limit_amount')
        .notEmpty().withMessage('Batas anggaran wajib diisi')
        .isFloat({ min: 0 }).withMessage('Batas anggaran tidak boleh negatif'),
    body('month')
        .notEmpty().withMessage('Bulan wajib diisi')
        .isInt({ min: 1, max: 12 }).withMessage('Bulan harus antara 1-12'),
    body('year')
        .notEmpty().withMessage('Tahun wajib diisi')
        .isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid'),
];

const validateId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID tidak valid'),
];

module.exports = {
    validateRegister,
    validateLogin,
    validateTransaction,
    validateBudget,
    validateId,
};
