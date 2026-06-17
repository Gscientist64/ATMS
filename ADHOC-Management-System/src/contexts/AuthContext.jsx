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

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const currentUser = authService.getCurrentUser();
        
        if (currentUser) {
            setUser(currentUser);
            // Verify token with backend
            authService.getMe().then(userData => {
                setUser(userData);
                setLoading(false);
            }).catch(() => {
                // Token invalid, logout
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