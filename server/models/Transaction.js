const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
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
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: { args: [0.01], msg: 'Jumlah harus lebih dari 0' },
        },
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    transaction_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'transactions',
});

module.exports = Transaction;
