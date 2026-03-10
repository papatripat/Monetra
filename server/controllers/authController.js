const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
};

// @desc    Register user baru
// @route   POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Cek apakah email sudah terdaftar
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email sudah terdaftar',
            });
        }

        // Buat user baru
        const user = await User.create({ name, email, password });
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah',
            });
        }

        // Verifikasi password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah',
            });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mendapatkan profil user saat ini
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: { user: req.user.toJSON() },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe };
