const { Op, fn, col, literal } = require('sequelize');
const { Transaction, Category, Budget } = require('../models');

// @desc    Ringkasan keuangan (total pemasukan, pengeluaran, saldo)
// @route   GET /api/dashboard/summary
const getSummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

        const result = await Transaction.findAll({
            where: {
                user_id: req.userId,
                transaction_date: { [Op.between]: [startDate, endDate] },
            },
            attributes: [
                'type',
                [fn('SUM', col('amount')), 'total'],
                [fn('COUNT', col('id')), 'count'],
            ],
            group: ['type'],
            raw: true,
        });

        let totalIncome = 0;
        let totalExpense = 0;
        let incomeCount = 0;
        let expenseCount = 0;

        result.forEach((item) => {
            if (item.type === 'income') {
                totalIncome = parseFloat(item.total);
                incomeCount = parseInt(item.count);
            } else {
                totalExpense = parseFloat(item.total);
                expenseCount = parseInt(item.count);
            }
        });

        res.json({
            success: true,
            data: {
                total_income: totalIncome,
                total_expense: totalExpense,
                balance: totalIncome - totalExpense,
                income_count: incomeCount,
                expense_count: expenseCount,
                month: targetMonth,
                year: targetYear,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Pengeluaran per kategori
// @route   GET /api/dashboard/expense-by-category
const getExpenseByCategory = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

        const expenses = await Transaction.findAll({
            where: {
                user_id: req.userId,
                type: 'expense',
                transaction_date: { [Op.between]: [startDate, endDate] },
            },
            attributes: [
                'category_id',
                [fn('SUM', col('amount')), 'total'],
            ],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name', 'icon', 'color'],
                },
            ],
            group: ['category_id', 'category.id', 'category.name', 'category.icon', 'category.color'],
            order: [[literal('total'), 'DESC']],
            raw: true,
            nest: true,
        });

        const data = expenses.map((item) => ({
            category_id: item.category_id,
            category_name: item.category.name,
            icon: item.category.icon,
            color: item.category.color,
            total: parseFloat(item.total),
        }));

        res.json({
            success: true,
            data: { expenses: data, month: targetMonth, year: targetYear },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Tren pemasukan vs pengeluaran per bulan (12 bulan terakhir)
// @route   GET /api/dashboard/monthly-trend
const getMonthlyTrend = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth() + 1, 1);
        const startDateStr = startDate.toISOString().split('T')[0];

        const transactions = await Transaction.findAll({
            where: {
                user_id: req.userId,
                transaction_date: { [Op.gte]: startDateStr },
            },
            attributes: [
                'type',
                [fn('date_trunc', 'month', col('transaction_date')), 'month'],
                [fn('SUM', col('amount')), 'total'],
            ],
            group: ['type', literal("date_trunc('month', transaction_date)")],
            order: [[literal("date_trunc('month', transaction_date)"), 'ASC']],
            raw: true,
        });

        // Buat array 12 bulan terakhir
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.push({
                month: key,
                label: d.toLocaleString('id-ID', { month: 'short', year: 'numeric' }),
                income: 0,
                expense: 0,
            });
        }

        // Fill data
        transactions.forEach((item) => {
            const date = new Date(item.month);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthData = months.find((m) => m.month === key);
            if (monthData) {
                if (item.type === 'income') {
                    monthData.income = parseFloat(item.total);
                } else {
                    monthData.expense = parseFloat(item.total);
                }
            }
        });

        res.json({
            success: true,
            data: { trend: months },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Status anggaran vs pengeluaran aktual
// @route   GET /api/dashboard/budget-status
const getBudgetStatus = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

        // Ambil semua budget bulan ini
        const budgets = await Budget.findAll({
            where: { user_id: req.userId, month: targetMonth, year: targetYear },
            include: [{ model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }],
            raw: true,
            nest: true,
        });

        // Ambil pengeluaran aktual
        const expenses = await Transaction.findAll({
            where: {
                user_id: req.userId,
                type: 'expense',
                transaction_date: { [Op.between]: [startDate, endDate] },
            },
            attributes: ['category_id', [fn('SUM', col('amount')), 'total']],
            group: ['category_id'],
            raw: true,
        });

        const spendingMap = {};
        expenses.forEach((e) => { spendingMap[e.category_id] = parseFloat(e.total); });

        const status = budgets.map((b) => {
            const spent = spendingMap[b.category_id] || 0;
            const limit = parseFloat(b.limit_amount);
            return {
                category_id: b.category_id,
                category_name: b.category.name,
                icon: b.category.icon,
                color: b.category.color,
                limit_amount: limit,
                spent,
                remaining: limit - spent,
                percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
                is_over_budget: spent > limit,
            };
        });

        res.json({
            success: true,
            data: { budget_status: status, month: targetMonth, year: targetYear },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Analisis aturan 50/30/20
// @route   GET /api/dashboard/fifty-thirty-twenty
const getFiftyThirtyTwenty = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

        // Total pemasukan bulan ini
        const incomeResult = await Transaction.findOne({
            where: {
                user_id: req.userId,
                type: 'income',
                transaction_date: { [Op.between]: [startDate, endDate] },
            },
            attributes: [[fn('SUM', col('amount')), 'total']],
            raw: true,
        });

        const totalIncome = parseFloat(incomeResult.total) || 0;

        // Pengeluaran per tipe kategori (needs, wants, savings)
        const expenses = await Transaction.findAll({
            where: {
                user_id: req.userId,
                type: 'expense',
                transaction_date: { [Op.between]: [startDate, endDate] },
            },
            attributes: [[fn('SUM', col('amount')), 'total']],
            include: [{
                model: Category,
                as: 'category',
                attributes: ['type'],
            }],
            group: ['category.id', 'category.type'],
            raw: true,
            nest: true,
        });

        const breakdown = { needs: 0, wants: 0, savings: 0 };
        expenses.forEach((e) => {
            if (breakdown.hasOwnProperty(e.category.type)) {
                breakdown[e.category.type] += parseFloat(e.total);
            }
        });

        const totalExpense = breakdown.needs + breakdown.wants + breakdown.savings;

        // Hitung persentase ideal vs aktual
        const analysis = {
            total_income: totalIncome,
            total_expense: totalExpense,
            breakdown: {
                needs: {
                    amount: breakdown.needs,
                    percentage: totalIncome > 0 ? Math.round((breakdown.needs / totalIncome) * 100) : 0,
                    ideal_percentage: 50,
                    ideal_amount: totalIncome * 0.5,
                    status: totalIncome > 0 && (breakdown.needs / totalIncome) * 100 <= 50 ? 'good' : 'over',
                },
                wants: {
                    amount: breakdown.wants,
                    percentage: totalIncome > 0 ? Math.round((breakdown.wants / totalIncome) * 100) : 0,
                    ideal_percentage: 30,
                    ideal_amount: totalIncome * 0.3,
                    status: totalIncome > 0 && (breakdown.wants / totalIncome) * 100 <= 30 ? 'good' : 'over',
                },
                savings: {
                    amount: breakdown.savings,
                    percentage: totalIncome > 0 ? Math.round((breakdown.savings / totalIncome) * 100) : 0,
                    ideal_percentage: 20,
                    ideal_amount: totalIncome * 0.2,
                    status: totalIncome > 0 && (breakdown.savings / totalIncome) * 100 >= 20 ? 'good' : 'under',
                },
            },
            month: targetMonth,
            year: targetYear,
        };

        res.json({
            success: true,
            data: analysis,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummary,
    getExpenseByCategory,
    getMonthlyTrend,
    getBudgetStatus,
    getFiftyThirtyTwenty,
};
