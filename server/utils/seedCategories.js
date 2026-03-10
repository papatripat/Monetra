const { Category } = require('../models');

const defaultCategories = [
    // Kebutuhan (Needs) - 50%
    { name: 'Makanan & Minuman', type: 'needs', icon: '🍔', color: '#EF4444' },
    { name: 'Transportasi', type: 'needs', icon: '🚗', color: '#F59E0B' },
    { name: 'Tagihan & Utilitas', type: 'needs', icon: '💡', color: '#F97316' },
    { name: 'Kesehatan', type: 'needs', icon: '🏥', color: '#EC4899' },
    { name: 'Pendidikan', type: 'needs', icon: '📚', color: '#8B5CF6' },
    { name: 'Sewa/Cicilan Rumah', type: 'needs', icon: '🏠', color: '#6366F1' },

    // Keinginan (Wants) - 30%
    { name: 'Hiburan', type: 'wants', icon: '🎬', color: '#14B8A6' },
    { name: 'Belanja', type: 'wants', icon: '🛍️', color: '#06B6D4' },
    { name: 'Liburan', type: 'wants', icon: '✈️', color: '#3B82F6' },
    { name: 'Langganan', type: 'wants', icon: '📱', color: '#6366F1' },
    { name: 'Makan di Luar', type: 'wants', icon: '🍽️', color: '#A855F7' },

    // Tabungan (Savings) - 20%
    { name: 'Tabungan', type: 'savings', icon: '🏦', color: '#10B981' },
    { name: 'Investasi', type: 'savings', icon: '📈', color: '#059669' },
    { name: 'Dana Darurat', type: 'savings', icon: '🛡️', color: '#047857' },

    // Pemasukan (digunakan untuk transaksi income)
    { name: 'Gaji', type: 'needs', icon: '💰', color: '#10B981' },
    { name: 'Freelance', type: 'needs', icon: '💻', color: '#06B6D4' },
    { name: 'Hadiah', type: 'needs', icon: '🎁', color: '#F59E0B' },
    { name: 'Lainnya', type: 'needs', icon: '📦', color: '#6B7280' },
];

const seedCategories = async () => {
    try {
        const count = await Category.count();
        if (count === 0) {
            await Category.bulkCreate(defaultCategories);
            console.log('✅ Kategori default berhasil ditambahkan');
        } else {
            console.log('ℹ️  Kategori sudah ada, skip seeding');
        }
    } catch (error) {
        console.error('❌ Gagal menambahkan kategori default:', error.message);
    }
};

module.exports = seedCategories;
