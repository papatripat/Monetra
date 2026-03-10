const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.ENUM('needs', 'wants', 'savings'),
        allowNull: false,
        comment: 'Tipe untuk aturan 50/30/20: needs=kebutuhan, wants=keinginan, savings=tabungan',
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '📦',
    },
    color: {
        type: DataTypes.STRING(7),
        allowNull: true,
        defaultValue: '#6B7280',
    },
}, {
    tableName: 'categories',
});

module.exports = Category;
