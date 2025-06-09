import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

export const Login: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <LoginForm />;
};