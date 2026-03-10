import { useState, useEffect } from 'react';
import { getBudgets, createOrUpdateBudget, deleteBudget } from '../../api/budgets';
import { getCategories } from '../../api/categories';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatMonthYear, getCurrentMonth, getCurrentYear } from '../../utils/dateHelpers';
import Modal from '../../components/ui/Modal';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';

const BudgetPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [month, setMonth] = useState(getCurrentMonth());
    const [year, setYear] = useState(getCurrentYear());
    const [formData, setFormData] = useState({
        category_id: '',
        limit_amount: '',
        month: getCurrentMonth(),
        year: getCurrentYear(),
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchBudgets();
    }, [month, year]);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data.data.categories);
        } catch {
            toast.error('Gagal memuat kategori');
        }
    };

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const res = await getBudgets({ month, year });
            setBudgets(res.data.data.budgets);
        } catch {
            toast.error('Gagal memuat anggaran');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createOrUpdateBudget({
                ...formData,
                month,
                year,
            });
            toast.success('Anggaran berhasil disimpan');
            setModalOpen(false);
            fetchBudgets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan anggaran');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus anggaran ini?')) return;
        try {
            await deleteBudget(id);
            toast.success('Anggaran berhasil dihapus');
            fetchBudgets();
        } catch {
            toast.error('Gagal menghapus anggaran');
        }
    };

    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limit_amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const overBudgetCount = budgets.filter((b) => b.is_over_budget).length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Anggaran</h1>
                    <p className="text-dark-400 mt-1">Atur batas pengeluaran per kategori</p>
                </div>
                <button onClick={() => {
                    setFormData({ category_id: '', limit_amount: '', month, year });
                    setModalOpen(true);
                }} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlus className="w-5 h-5" />
                    Tambah Anggaran
                </button>
            </div>

            {/* Month Selector */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="input-field w-auto"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(2024, i).toLocaleString('id-ID', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="input-field w-auto"
                    >
                        {Array.from({ length: 5 }, (_, i) => {
                            const y = getCurrentYear() - 2 + i;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="stat-card">
                    <p className="text-dark-400 text-sm">Total Anggaran</p>
                    <p className="text-xl font-bold text-white mt-1">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="stat-card">
                    <p className="text-dark-400 text-sm">Total Terpakai</p>
                    <p className={`text-xl font-bold mt-1 ${totalSpent > totalBudget ? 'text-red-400' : 'text-primary-400'}`}>
                        {formatCurrency(totalSpent)}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="text-dark-400 text-sm">Melebihi Batas</p>
                    <p className={`text-xl font-bold mt-1 ${overBudgetCount > 0 ? 'text-red-400' : 'text-primary-400'}`}>
                        {overBudgetCount} kategori
                    </p>
                </div>
            </div>

            {/* Budget List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : budgets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgets.map((budget) => (
                        <div key={budget.id} className={`glass-card p-5 ${budget.is_over_budget ? 'border-red-500/30' : ''}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                        style={{ backgroundColor: (budget.category?.color || '#6B7280') + '20' }}
                                    >
                                        {budget.category?.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-dark-200">{budget.category?.name}</p>
                                        <p className="text-xs text-dark-500 capitalize">{budget.category?.type === 'needs' ? 'Kebutuhan' : budget.category?.type === 'wants' ? 'Keinginan' : 'Tabungan'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(budget.id)}
                                    className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-dark-400">Terpakai</span>
                                    <span className={budget.is_over_budget ? 'text-red-400 font-medium' : 'text-dark-300'}>
                                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit_amount)}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${budget.percentage > 100 ? 'bg-red-500' : budget.percentage > 80 ? 'bg-amber-500' : 'bg-primary-500'
                                            }`}
                                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-dark-500">{budget.percentage}%</span>
                                    <span className={budget.remaining >= 0 ? 'text-dark-500' : 'text-red-400'}>
                                        {budget.remaining >= 0
                                            ? `Sisa: ${formatCurrency(budget.remaining)}`
                                            : `Lebih: ${formatCurrency(Math.abs(budget.remaining))}`}
                                    </span>
                                </div>
                            </div>

                            {budget.is_over_budget && (
                                <div className="mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">
                                    <HiOutlineExclamation className="w-4 h-4 flex-shrink-0" />
                                    <span>Pengeluaran melebihi anggaran!</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card flex flex-col items-center justify-center py-16">
                    <div className="text-4xl mb-3">📊</div>
                    <p className="text-dark-400 font-medium">Belum ada anggaran</p>
                    <p className="text-dark-500 text-sm mt-1">Atur batas pengeluaran untuk setiap kategori</p>
                </div>
            )}

            {/* Add Budget Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Tambah Anggaran"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label className="block text-sm font-medium text-dark-300 mb-2">Batas Anggaran (Rp)</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="0"
                            value={formData.limit_amount}
                            onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                            min="0"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
                            Batal
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BudgetPage;
