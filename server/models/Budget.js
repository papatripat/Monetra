const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
    },
    limit_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: { args: [0], msg: 'Batas anggaran tidak boleh negatif' },
        },
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 12,
        },
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 2000,
            max: 2100,
        },
    },
}, {
    tableName: 'budgets',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'category_id', 'month', 'year'],
            name: 'unique_budget_per_category_month',
        },
    ],
});

module.exports = Budget;
