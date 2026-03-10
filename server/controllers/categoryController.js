const { Category } = require('../models');

// @desc    Mendapatkan semua kategori
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            order: [['type', 'ASC'], ['name', 'ASC']],
        });

        res.json({
            success: true,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCategories };
