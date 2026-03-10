import { useState, useEffect } from 'react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../../api/transactions';
import { getCategories } from '../../api/categories';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateShort, getToday } from '../../utils/dateHelpers';
import Modal from '../../components/ui/Modal';
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineFilter,
    HiOutlineSearch,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filters, setFilters] = useState({ type: '', category_id: '', page: 1 });
    const [formData, setFormData] = useState({
        type: 'expense',
        category_id: '',
        amount: '',
        description: '',
        transaction_date: getToday(),
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data.data.categories);
        } catch {
            toast.error('Gagal memuat kategori');
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = { page: filters.page, limit: 15 };
            if (filters.type) params.type = filters.type;
            if (filters.category_id) params.category_id = filters.category_id;
            const res = await getTransactions(params);
            setTransactions(res.data.data.transactions);
            setPagination(res.data.data.pagination);
        } catch {
            toast.error('Gagal memuat transaksi');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingTransaction(null);
        setFormData({
            type: 'expense',
            category_id: '',
            amount: '',
            description: '',
            transaction_date: getToday(),
        });
        setModalOpen(true);
    };

    const openEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            type: transaction.type,
            category_id: transaction.category_id,
            amount: transaction.amount,
            description: transaction.description || '',
            transaction_date: transaction.transaction_date,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, formData);
                toast.success('Transaksi berhasil diubah');
            } else {
                await createTransaction(formData);
                toast.success('Transaksi berhasil ditambahkan');
            }
            setModalOpen(false);
            fetchTransactions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan transaksi');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return;
        try {
            await deleteTransaction(id);
            toast.success('Transaksi berhasil dihapus');
            fetchTransactions();
        } catch {
            toast.error('Gagal menghapus transaksi');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Transaksi</h1>
                    <p className="text-dark-400 mt-1">Kelola pemasukan dan pengeluaranmu</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlus className="w-5 h-5" />
                    Tambah Transaksi
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                        className="input-field w-auto min-w-[150px]"
                    >
                        <option value="">Semua Tipe</option>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                    </select>
                    <select
                        value={filters.category_id}
                        onChange={(e) => setFilters({ ...filters, category_id: e.target.value, page: 1 })}
                        className="input-field w-auto min-w-[180px]"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Transaction List */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : transactions.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-700/50">
                                        <th className="text-left p-4 text-dark-400 text-sm font-medium">Tanggal</th>
                                        <th className="text-left p-4 text-dark-400 text-sm font-medium">Kategori</th>
                                        <th className="text-left p-4 text-dark-400 text-sm font-medium">Deskripsi</th>
                                        <th className="text-left p-4 text-dark-400 text-sm font-medium">Tipe</th>
                                        <th className="text-right p-4 text-dark-400 text-sm font-medium">Jumlah</th>
                                        <th className="text-right p-4 text-dark-400 text-sm font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                                            <td className="p-4 text-dark-300 text-sm">{formatDateShort(tx.transaction_date)}</td>
                                            <td className="p-4">
                                                <span className="text-sm text-dark-200">
                                                    {tx.category?.icon} {tx.category?.name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-dark-400 text-sm max-w-xs truncate">{tx.description || '-'}</td>
                                            <td className="p-4">
                                                <span className={tx.type === 'income' ? 'badge-income' : 'badge-expense'}>
                                                    {tx.type === 'income' ? 'Masuk' : 'Keluar'}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-right font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEditModal(tx)}
                                                        className="p-2 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                                    >
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tx.id)}
                                                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-dark-800/50">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                        style={{ backgroundColor: (tx.category?.color || '#6B7280') + '20' }}>
                                        {tx.category?.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-dark-200 truncate">{tx.category?.name}</p>
                                        <p className="text-xs text-dark-500">{formatDateShort(tx.transaction_date)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEditModal(tx)} className="p-1.5 text-dark-400 hover:text-primary-400 rounded-lg">
                                            <HiOutlinePencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(tx.id)} className="p-1.5 text-dark-400 hover:text-red-400 rounded-lg">
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-dark-700/50">
                                <p className="text-dark-500 text-sm">
                                    Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} transaksi)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={pagination.page <= 1}
                                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                        className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        disabled={pagination.page >= pagination.totalPages}
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                        className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-dark-400 font-medium">Belum ada transaksi</p>
                        <p className="text-dark-500 text-sm mt-1">Mulai catat pemasukan dan pengeluaranmu</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Tipe</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'income' })}
                                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${formData.type === 'income'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-dark-800 text-dark-400 border border-dark-700/50 hover:bg-dark-700'
                                    }`}
                            >
                                Pemasukan
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'expense' })}
                                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${formData.type === 'expense'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'bg-dark-800 text-dark-400 border border-dark-700/50 hover:bg-dark-700'
                                    }`}
                            >
                                Pengeluaran
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Kategori</label>
                        <select
                            className="input-field"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            required
                        >
                            <option value="">Pilih kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Jumlah (Rp)</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="0"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Deskripsi</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Keterangan transaksi (opsional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Tanggal</label>
                        <input
                            type="date"
                            className="input-field"
                            value={formData.transaction_date}
                            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
                            Batal
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            {editingTransaction ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TransactionList;
