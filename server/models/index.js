const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Transaction = require('./Transaction');
const Budget = require('./Budget');

// ==========================================
// Definisi Relasi Antar Model
// ==========================================

// User -> Transactions (One to Many)
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Budgets (One to Many)
User.hasMany(Budget, { foreignKey: 'user_id', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category -> Transactions (One to Many)
Category.hasMany(Transaction, { foreignKey: 'category_id', as: 'transactions' });
Transaction.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Category -> Budgets (One to Many)
Category.hasMany(Budget, { foreignKey: 'category_id', as: 'budgets' });
Budget.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = {
    sequelize,
    User,
    Category,
    Transaction,
    Budget,
};
