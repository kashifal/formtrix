import React from 'react';
import { useAuth } from '../../contexts/StrapiAuthContext';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
    const { auth } = useAuth();

    if (!auth) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default AuthGuard;
