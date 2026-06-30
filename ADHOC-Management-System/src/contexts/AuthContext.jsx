// ADHOC-Management-System/src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Decode JWT expiry without a server round-trip
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Date.now() / 1000;
    } catch {
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const token = localStorage.getItem('token');

        if (currentUser && token && !isTokenExpired(token)) {
            // Token is still valid — use cached user instantly, no server call
            setUser(currentUser);
            setLoading(false);
        } else if (currentUser && token) {
            // Token exists but may be expired — verify with backend
            authService.getMe().then(userData => {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify({ ...currentUser, ...userData }));
                setLoading(false);
            }).catch(() => {
                authService.logout();
                setUser(null);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (loginData) => {
        const userData = await authService.login(loginData);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};