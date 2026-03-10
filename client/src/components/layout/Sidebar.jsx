import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineCurrencyDollar,
    HiOutlineChartPie,
    HiOutlineLogout,
    HiOutlineMenu,
    HiOutlineX,
} from 'react-icons/hi';

const navItems = [
    { path: '/', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/transactions', label: 'Transaksi', icon: HiOutlineCurrencyDollar },
    { path: '/budget', label: 'Anggaran', icon: HiOutlineChartPie },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-dark-700/50">
                <img src="/logo.png" alt="Monetra" className="w-10 h-10 rounded-xl flex-shrink-0" />
                {!collapsed && (
                    <div className="overflow-hidden">
                        <h1 className="text-xl font-bold text-white tracking-tight">Monetra</h1>
                        <p className="text-xs text-dark-400 truncate">Kelola Keuanganmu</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                                }`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : 'group-hover:text-primary-400'}`} />
                            {!collapsed && <span className="font-medium text-sm">{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="px-3 py-4 border-t border-dark-700/50 space-y-2">
                {!collapsed && (
                    <div className="px-4 py-2">
                        <p className="text-sm font-medium text-dark-200 truncate">{user?.name}</p>
                        <p className="text-xs text-dark-500 truncate">{user?.email}</p>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
                >
                    <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium text-sm">Keluar</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-dark-900/80 backdrop-blur-xl border-r border-dark-700/50 transition-all duration-300 z-40
          ${collapsed ? 'w-20' : 'w-64'}`}
            >
                <SidebarContent />
                {/* Toggle Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-dark-800 border border-dark-700 rounded-full flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                >
                    <span className="text-xs">{collapsed ? '→' : '←'}</span>
                </button>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Monetra" className="w-8 h-8 rounded-lg" />
                    <h1 className="text-lg font-bold text-white">Monetra</h1>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-dark-400 hover:text-white"
                >
                    {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-dark-950/80" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-dark-900 border-r border-dark-700/50 animate-slide-up">
                        <SidebarContent />
                    </aside>
                </div>
            )}
        </>
    );
};

export default Sidebar;
