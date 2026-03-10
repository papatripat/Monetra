const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));
        return res.status(400).json({
            success: false,
            message: 'Validasi gagal',
            errors: formattedErrors,
        });
    }
    next();
};

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Sequelize Validation Error
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            message: 'Validasi database gagal',
            errors,
        });
    }

    // Sequelize Unique Constraint Error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const errors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(409).json({
            success: false,
            message: 'Data duplikat ditemukan',
            errors,
        });
    }

    // Default Error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { handleValidationErrors, errorHandler };
