import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardSummary, getExpenseByCategory, getMonthlyTrend, getBudgetStatus, getFiftyThirtyTwenty } from '../../api/dashboard';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatMonthYear, getCurrentMonth, getCurrentYear } from '../../utils/dateHelpers';
import {
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlineCash,
    HiOutlineExclamation,
} from 'react-icons/hi';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#6366f1'];

const Dashboard = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [expenseByCategory, setExpenseByCategory] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [budgetStatus, setBudgetStatus] = useState([]);
    const [fiftyThirtyTwenty, setFiftyThirtyTwenty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [month] = useState(getCurrentMonth());
    const [year] = useState(getCurrentYear());

    useEffect(() => {
        fetchDashboardData();
    }, [month, year]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [summaryRes, expenseRes, trendRes, budgetRes, fttRes] = await Promise.all([
                getDashboardSummary({ month, year }),
                getExpenseByCategory({ month, year }),
                getMonthlyTrend(),
                getBudgetStatus({ month, year }),
                getFiftyThirtyTwenty({ month, year }),
            ]);
            setSummary(summaryRes.data.data);
            setExpenseByCategory(expenseRes.data.data.expenses);
            setMonthlyTrend(trendRes.data.data.trend);
            setBudgetStatus(budgetRes.data.data.budget_status);
            setFiftyThirtyTwenty(fttRes.data.data);
        } catch (error) {
            toast.error('Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-dark-400 text-sm">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    const overBudgetItems = budgetStatus.filter((b) => b.is_over_budget);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Halo, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-dark-400 mt-1">{formatMonthYear(month, year)}</p>
            </div>

            {/* Notifikasi Over Budget */}
            {overBudgetItems.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-slide-up">
                    <div className="flex items-start gap-3">
                        <HiOutlineExclamation className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-300">Peringatan Anggaran!</p>
                            <p className="text-red-400/80 text-sm mt-1">
                                {overBudgetItems.map((b) => b.category_name).join(', ')} telah melebihi batas anggaran.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-dark-400 text-sm">Total Pemasukan</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(summary?.total_income)}</p>
                            <p className="text-dark-500 text-xs mt-1">{summary?.income_count || 0} transaksi</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <HiOutlineTrendingUp className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-dark-400 text-sm">Total Pengeluaran</p>
                            <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(summary?.total_expense)}</p>
                            <p className="text-dark-500 text-xs mt-1">{summary?.expense_count || 0} transaksi</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
                            <HiOutlineTrendingDown className="w-6 h-6 text-red-400" />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-dark-400 text-sm">Saldo</p>
                            <p className={`text-2xl font-bold mt-1 ${(summary?.balance || 0) >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
                                {formatCurrency(summary?.balance)}
                            </p>
                            <p className="text-dark-500 text-xs mt-1">Bulan ini</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary-500/15 flex items-center justify-center">
                            <HiOutlineCash className="w-6 h-6 text-primary-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense by Category Pie Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Pengeluaran per Kategori</h3>
                    {expenseByCategory.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={expenseByCategory}
                                        dataKey="total"
                                        nameKey="category_name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        stroke="none"
                                    >
                                        {expenseByCategory.map((entry, index) => (
                                            <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '12px',
                                            color: '#f1f5f9',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 w-full md:w-auto">
                                {expenseByCategory.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <span
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-dark-300 truncate">{item.icon} {item.category_name}</span>
                                        <span className="text-dark-500 ml-auto">{formatCurrency(item.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <p className="text-dark-500 text-sm">Belum ada data pengeluaran</p>
                        </div>
                    )}
                </div>

                {/* Monthly Trend Bar Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Tren Pemasukan vs Pengeluaran</h3>
                    {monthlyTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyTrend} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: '#f1f5f9',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <p className="text-dark-500 text-sm">Belum ada data tren</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Budget Status & 50/30/20 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget Status */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Status Anggaran</h3>
                    {budgetStatus.length > 0 ? (
                        <div className="space-y-4">
                            {budgetStatus.map((budget, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-dark-300">{budget.icon} {budget.category_name}</span>
                                        <span className={budget.is_over_budget ? 'text-red-400 font-medium' : 'text-dark-400'}>
                                            {formatCurrency(budget.spent)} / {formatCurrency(budget.limit_amount)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${budget.percentage > 100 ? 'bg-red-500' : budget.percentage > 80 ? 'bg-amber-500' : 'bg-primary-500'
                                                }`}
                                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                        />
                                    </div>
                                    {budget.is_over_budget && (
                                        <p className="text-red-400 text-xs">⚠️ Melebihi batas {formatCurrency(Math.abs(budget.remaining))}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center">
                            <p className="text-dark-500 text-sm">Belum ada anggaran yang diatur</p>
                        </div>
                    )}
                </div>

                {/* 50/30/20 Analysis */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Analisis 50/30/20</h3>
                    {fiftyThirtyTwenty && fiftyThirtyTwenty.total_income > 0 ? (
                        <div className="space-y-5">
                            {[
                                { key: 'needs', label: 'Kebutuhan', emoji: '🏠', ideal: 50 },
                                { key: 'wants', label: 'Keinginan', emoji: '🎮', ideal: 30 },
                                { key: 'savings', label: 'Tabungan', emoji: '💰', ideal: 20 },
                            ].map(({ key, label, emoji, ideal }) => {
                                const data = fiftyThirtyTwenty.breakdown[key];
                                const isGood = data.status === 'good';
                                return (
                                    <div key={key} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-dark-300 text-sm">{emoji} {label}</span>
                                            <div className="text-right">
                                                <span className={`font-semibold text-sm ${isGood ? 'text-primary-400' : 'text-amber-400'}`}>
                                                    {data.percentage}%
                                                </span>
                                                <span className="text-dark-500 text-xs ml-1">/ {ideal}%</span>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-dark-800 rounded-full overflow-hidden relative">
                                            {/* Ideal marker */}
                                            <div
                                                className="absolute top-0 bottom-0 w-0.5 bg-dark-400 z-10"
                                                style={{ left: `${ideal}%` }}
                                            />
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isGood ? 'bg-primary-500' : 'bg-amber-500'}`}
                                                style={{ width: `${Math.min(data.percentage, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-dark-500">
                                            <span>Aktual: {formatCurrency(data.amount)}</span>
                                            <span>Ideal: {formatCurrency(data.ideal_amount)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center">
                            <p className="text-dark-500 text-sm">Masukkan pemasukan untuk melihat analisis</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
