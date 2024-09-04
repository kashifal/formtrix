import React, { createContext, useState, useContext, useEffect } from 'react';
import { setAuthHeader } from 'axios.config';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);

    const history = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuth({ token });
            // Set the Authorization header for axios
            setAuthHeader(token);
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        setAuth({ token });
        setAuthHeader(token);
        history('/dashboard/default');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuth(null);
        setAuthHeader(null);
    };

    return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
