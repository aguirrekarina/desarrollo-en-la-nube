import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};