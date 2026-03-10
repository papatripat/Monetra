import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            toast.success('Login berhasil!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-700/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
                        <span className="text-white font-bold text-2xl">M</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Selamat Datang</h1>
                    <p className="text-dark-400 mt-2">Masuk ke akun Monetra Anda</p>
                </div>

                {/* Form */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="nama@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Masukkan password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-dark-400 text-sm mt-6">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
