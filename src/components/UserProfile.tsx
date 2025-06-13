import React, { useState } from 'react';
import {
    Box, Container, Paper, Typography, Avatar, Button, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Chip, AppBar, Toolbar
} from '@mui/material';
import {
    Email, Google, Facebook, Link as LinkIcon, LinkOff, AccountCircle, ArrowBack, Security
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PersonalInfoSection } from './PersonalInfoSection';
import { type ProviderInfo } from '../types/auth';

export const UserProfile: React.FC = () => {
    const { user, linkProvider, unlinkProvider, getLinkedProviders, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [linkEmailDialog, setLinkEmailDialog] = useState(false);
    const [emailData, setEmailData] = useState({ email: '', password: '' });

    if (!user) return null;

    const linkedProviders = getLinkedProviders();

    const providers: ProviderInfo[] = [
        {
            id: 'password',
            name: 'Email/Contraseña',
            icon: 'email',
            connected: linkedProviders.includes('password')
        },
        {
            id: 'google.com',
            name: 'Google',
            icon: 'google',
            connected: linkedProviders.includes('google.com')
        },
        {
            id: 'facebook.com',
            name: 'Facebook',
            icon: 'facebook',
            connected: linkedProviders.includes('facebook.com')
        }
    ];

    const getProviderIcon = (iconType: string) => {
        switch (iconType) {
            case 'email': return <Email />;
            case 'google': return <Google />;
            case 'facebook': return <Facebook />;
            default: return <AccountCircle />;
        }
    };

    const handleLinkProvider = async (providerId: string) => {
        if (providerId === 'password') {
            setLinkEmailDialog(true);
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const providerType = providerId === 'google.com' ? 'google' : 'facebook';
            await linkProvider(providerType);
            setSuccess(`Proveedor ${providerType} vinculado exitosamente`);
        } catch (error: any) {
            if (error.code === 'auth/credential-already-in-use') {
                setError('Esta cuenta ya está vinculada a otro usuario');
            } else if (error.code === 'auth/provider-already-linked') {
                setError('Este proveedor ya está vinculado');
            } else {
                setError(error.message || 'Error al vincular proveedor');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLinkEmail = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await linkProvider('email', emailData.email, emailData.password);
            setSuccess('Email/contraseña vinculado exitosamente');
            setLinkEmailDialog(false);
            setEmailData({ email: '', password: '' });
        } catch (error: any) {
            setError(error.message || 'Error al vincular email');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlinkProvider = async (providerId: string) => {
        if (linkedProviders.length <= 1) {
            setError('No puedes desvincular tu último método de autenticación');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await unlinkProvider(providerId);
            setSuccess('Proveedor desvinculado exitosamente');
        } catch (error: any) {
            setError(error.message || 'Error al desvincular proveedor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/dashboard')}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Mi Perfil
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                            src={user.photoURL || undefined}
                            sx={{ width: 80, height: 80, mr: 3 }}
                        />
                        <Box>
                            <Typography variant="h4">
                                {user.displayName || 'Usuario'}
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                {user.email}
                            </Typography>
                            <Chip
                                label={`${linkedProviders.length} método${linkedProviders.length !== 1 ? 's' : ''} vinculado${linkedProviders.length !== 1 ? 's' : ''}`}
                                color="primary"
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        </Box>
                    </Box>
                </Paper>
                <PersonalInfoSection />
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Métodos de Autenticación
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    )}

                    <List>
                        {providers.map((provider) => (
                            <ListItem key={provider.id}>
                                <ListItemIcon>
                                    {getProviderIcon(provider.icon)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={provider.name}
                                    secondary={provider.connected ? 'Conectado' : 'No conectado'}
                                />
                                <ListItemSecondaryAction>
                                    {provider.connected ? (
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleUnlinkProvider(provider.id)}
                                            disabled={loading || linkedProviders.length <= 1}
                                            color="error"
                                            title={linkedProviders.length <= 1 ? 'No puedes desvincular tu último método' : 'Desvincular'}
                                        >
                                            <LinkOff />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleLinkProvider(provider.id)}
                                            disabled={loading}
                                            color="primary"
                                            title="Vincular"
                                        >
                                            <LinkIcon />
                                        </IconButton>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Acciones de Cuenta
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/dashboard')}
                            sx={{ flex: 1 }}
                        >
                            Volver al Dashboard
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={logout}
                            sx={{ flex: 1 }}
                        >
                            Cerrar Sesión
                        </Button>
                    </Box>
                </Paper>
            </Container>

            <Dialog open={linkEmailDialog} onClose={() => setLinkEmailDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Vincular Email/Contraseña</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={emailData.email}
                        onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Contraseña"
                        type="password"
                        value={emailData.password}
                        onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                        margin="normal"
                        required
                        helperText="La contraseña debe tener al menos 6 caracteres"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setLinkEmailDialog(false);
                        setEmailData({ email: '', password: '' });
                    }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleLinkEmail}
                        disabled={loading || !emailData.email || !emailData.password}
                        variant="contained"
                    >
                        {loading ? 'Vinculando...' : 'Vincular'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};