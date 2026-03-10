const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Token tidak ditemukan.',
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid. User tidak ditemukan.',
            });
        }

        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token sudah kedaluwarsa. Silakan login kembali.',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid.',
        });
    }
};

module.exports = auth;
