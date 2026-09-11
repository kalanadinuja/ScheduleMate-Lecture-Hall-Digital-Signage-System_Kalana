import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'schedulemate_auth';

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Failed to parse auth storage', e);
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (auth) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [auth]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await authApi.login(email, password);
            if (res.data && res.data.success && res.data.data) {
                const { token, admin } = res.data.data;
                const authPayload = { token, admin };
                setAuth(authPayload);
                return { success: true, admin };
            } else {
                return { success: false, message: res.data?.message || 'Login failed' };
            }
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials or server error';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setAuth(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const isAuthenticated = Boolean(auth?.token);

    return (
        <AuthContext.Provider value={{ auth, admin: auth?.admin, token: auth?.token, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
