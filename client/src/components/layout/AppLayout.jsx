import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

const AppLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center animate-pulse">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <p className="text-dark-400 text-sm">Memuat...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-dark-950">
            <Sidebar />
            <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
