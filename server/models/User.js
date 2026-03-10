const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Nama tidak boleh kosong' },
            len: { args: [2, 100], msg: 'Nama harus antara 2-100 karakter' },
        },
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: { msg: 'Email sudah terdaftar' },
        validate: {
            isEmail: { msg: 'Format email tidak valid' },
        },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: { args: [6, 255], msg: 'Password minimal 6 karakter' },
        },
    },
}, {
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
};

module.exports = User;
