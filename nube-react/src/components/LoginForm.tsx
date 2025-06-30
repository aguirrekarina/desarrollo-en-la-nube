import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Divider, Alert, Tab, Tabs, CircularProgress } from '@mui/material';
import { Google, Facebook, Email } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { type LoginFormData, type SignUpFormData } from '../types/auth';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
};

export const LoginForm: React.FC = () => {
    const { signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithFacebook } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [loginData, setLoginData] = useState<LoginFormData>({
        email: '',
        password: ''
    });

    const [signUpData, setSignUpData] = useState<SignUpFormData>({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmail(loginData.email, loginData.password);
        } catch (error: any) {
            setError(error.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (signUpData.password !== signUpData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            await signUpWithEmail(signUpData.email, signUpData.password);
        } catch (error: any) {
            setError(error.message || 'Error al crear cuenta');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (error: any) {
            setError(error.message || 'Error al iniciar sesión con Google');
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithFacebook();
        } catch (error: any) {
            setError(error.message || 'Error al iniciar sesión con Facebook');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Bienvenido
                </Typography>

                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label="Iniciar Sesión" />
                    <Tab label="Registrarse" />
                </Tabs>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <TabPanel value={tabValue} index={0}>
                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Contraseña"
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            margin="normal"
                            required
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3 }}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <Email />}
                        >
                            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </Button>
                    </form>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <form onSubmit={handleSignUp}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={signUpData.email}
                            onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Contraseña"
                            type="password"
                            value={signUpData.password}
                            onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Confirmar Contraseña"
                            type="password"
                            value={signUpData.confirmPassword}
                            onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                            margin="normal"
                            required
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3 }}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <Email />}
                        >
                            {loading ? 'Creando...' : 'Crear Cuenta'}
                        </Button>
                    </form>
                </TabPanel>

                <Divider sx={{ my: 3 }}>O continúa con</Divider>

                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    startIcon={<Google />}
                    sx={{ mb: 2 }}
                >
                    Google
                </Button>

                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleFacebookSignIn}
                    disabled={loading}
                    startIcon={<Facebook />}
                >
                    Facebook
                </Button>
            </Paper>
        </Box>
    );
};