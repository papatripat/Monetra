const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const { errorHandler } = require('./middleware/errorHandler');
const seedCategories = require('./utils/seedCategories');

// Import Routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware Global
// ==========================================

// Security Headers
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting untuk Auth Routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 20, // Max 20 request per window
    message: {
        success: false,
        message: 'Terlalu banyak percobaan. Coba lagi setelah 15 menit.',
    },
});

// ==========================================
// Routes
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Monetra API berjalan',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} tidak ditemukan`,
    });
});

// Error Handler
app.use(errorHandler);

// ==========================================
// Start Server
// ==========================================

const startServer = async () => {
    try {
        // Test koneksi database
        await sequelize.authenticate();
        console.log('✅ Koneksi database berhasil');

        // Sync models ke database (buat tabel jika belum ada)
        await sequelize.sync();
        console.log('✅ Model berhasil disinkronkan');

        // Seed kategori default
        await seedCategories();

        // Start server
        app.listen(PORT, () => {
            console.log(`\n🚀 Monetra Server berjalan di http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}\n`);
        });
    } catch (error) {
        console.error('❌ Gagal memulai server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;
