const { Op } = require('sequelize');
const { Transaction, Category } = require('../models');

// @desc    Mendapatkan semua transaksi user
// @route   GET /api/transactions
const getTransactions = async (req, res, next) => {
    try {
        const { type, category_id, start_date, end_date, page = 1, limit = 20 } = req.query;

        const where = { user_id: req.userId };

        // Filter berdasarkan tipe
        if (type && ['income', 'expense'].includes(type)) {
            where.type = type;
        }

        // Filter berdasarkan kategori
        if (category_id) {
            where.category_id = parseInt(category_id);
        }

        // Filter berdasarkan rentang tanggal
        if (start_date && end_date) {
            where.transaction_date = {
                [Op.between]: [start_date, end_date],
            };
        } else if (start_date) {
            where.transaction_date = { [Op.gte]: start_date };
        } else if (end_date) {
            where.transaction_date = { [Op.lte]: end_date };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'type', 'icon', 'color'],
                },
            ],
            order: [['transaction_date', 'DESC'], ['created_at', 'DESC']],
            limit: parseInt(limit),
            offset,
        });

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Membuat transaksi baru
// @route   POST /api/transactions
const createTransaction = async (req, res, next) => {
    try {
        const { category_id, type, amount, description, transaction_date } = req.body;

        // Pastikan kategori ada
        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori tidak ditemukan',
            });
        }

        const transaction = await Transaction.create({
            user_id: req.userId,
            category_id,
            type,
            amount,
            description,
            transaction_date,
        });

        // Ambil transaksi beserta kategori
        const fullTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'type', 'icon', 'color'],
                },
            ],
        });

        res.status(201).json({
            success: true,
            message: 'Transaksi berhasil dibuat',
            data: { transaction: fullTransaction },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mengubah transaksi
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({
            where: { id: req.params.id, user_id: req.userId },
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaksi tidak ditemukan',
            });
        }

        const { category_id, type, amount, description, transaction_date } = req.body;

        // Jika mengubah kategori, pastikan kategori ada
        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Kategori tidak ditemukan',
                });
            }
        }

        await transaction.update({
            category_id: category_id || transaction.category_id,
            type: type || transaction.type,
            amount: amount || transaction.amount,
            description: description !== undefined ? description : transaction.description,
            transaction_date: transaction_date || transaction.transaction_date,
        });

        const updatedTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'type', 'icon', 'color'],
                },
            ],
        });

        res.json({
            success: true,
            message: 'Transaksi berhasil diubah',
            data: { transaction: updatedTransaction },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Menghapus transaksi
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({
            where: { id: req.params.id, user_id: req.userId },
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaksi tidak ditemukan',
            });
        }

        await transaction.destroy();

        res.json({
            success: true,
            message: 'Transaksi berhasil dihapus',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
