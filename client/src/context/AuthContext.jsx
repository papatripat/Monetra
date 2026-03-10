import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth harus digunakan dalam AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('monetra_token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const res = await getMe();
            setUser(res.data.data.user);
        } catch {
            localStorage.removeItem('monetra_token');
            localStorage.removeItem('monetra_user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await loginUser({ email, password });
        const { user, token } = res.data.data;
        localStorage.setItem('monetra_token', token);
        localStorage.setItem('monetra_user', JSON.stringify(user));
        setUser(user);
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await registerUser({ name, email, password });
        const { user, token } = res.data.data;
        localStorage.setItem('monetra_token', token);
        localStorage.setItem('monetra_user', JSON.stringify(user));
        setUser(user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('monetra_token');
        localStorage.removeItem('monetra_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
