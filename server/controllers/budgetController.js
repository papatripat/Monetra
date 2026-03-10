const { Budget, Category, Transaction } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// @desc    Mendapatkan anggaran user (bulan & tahun tertentu)
// @route   GET /api/budgets
const getBudgets = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        const budgets = await Budget.findAll({
            where: {
                user_id: req.userId,
                month: targetMonth,
                year: targetYear,
            },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'type', 'icon', 'color'],
                },
            ],
            order: [[{ model: Category, as: 'category' }, 'name', 'ASC']],
        });

        // Hitung pengeluaran aktual per kategori untuk bulan ini
        const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

        const actualSpending = await Transaction.findAll({
            where: {
                user_id: req.userId,
                type: 'expense',
                transaction_date: { [Op.between]: [startDate, endDate] },
            },
            attributes: [
                'category_id',
                [fn('SUM', col('amount')), 'total_spent'],
            ],
            group: ['category_id'],
            raw: true,
        });

        const spendingMap = {};
        actualSpending.forEach((item) => {
            spendingMap[item.category_id] = parseFloat(item.total_spent);
        });

        // Gabungkan budget dengan pengeluaran aktual
        const budgetsWithSpending = budgets.map((budget) => {
            const spent = spendingMap[budget.category_id] || 0;
            const remaining = parseFloat(budget.limit_amount) - spent;
            const percentage = parseFloat(budget.limit_amount) > 0
                ? Math.round((spent / parseFloat(budget.limit_amount)) * 100)
                : 0;

            return {
                ...budget.toJSON(),
                spent,
                remaining,
                percentage,
                is_over_budget: spent > parseFloat(budget.limit_amount),
            };
        });

        res.json({
            success: true,
            data: {
                budgets: budgetsWithSpending,
                month: targetMonth,
                year: targetYear,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Membuat atau mengubah anggaran
// @route   POST /api/budgets
const createOrUpdateBudget = async (req, res, next) => {
    try {
        const { category_id, limit_amount, month, year } = req.body;

        // Pastikan kategori ada
        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori tidak ditemukan',
            });
        }

        // Cek apakah budget sudah ada (upsert)
        const [budget, created] = await Budget.findOrCreate({
            where: {
                user_id: req.userId,
                category_id,
                month,
                year,
            },
            defaults: { limit_amount },
        });

        if (!created) {
            await budget.update({ limit_amount });
        }

        const fullBudget = await Budget.findByPk(budget.id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'type', 'icon', 'color'],
                },
            ],
        });

        res.status(created ? 201 : 200).json({
            success: true,
            message: created ? 'Anggaran berhasil dibuat' : 'Anggaran berhasil diubah',
            data: { budget: fullBudget },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Menghapus anggaran
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res, next) => {
    try {
        const budget = await Budget.findOne({
            where: { id: req.params.id, user_id: req.userId },
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Anggaran tidak ditemukan',
            });
        }

        await budget.destroy();

        res.json({
            success: true,
            message: 'Anggaran berhasil dihapus',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getBudgets, createOrUpdateBudget, deleteBudget };
