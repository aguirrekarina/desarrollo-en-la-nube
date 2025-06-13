import React from 'react';
import {
    Box, Container, Typography, Paper, Card, CardContent, Button,
    AppBar, Toolbar, Avatar, Menu, MenuItem, IconButton
} from '@mui/material';
import {
    AccountCircle, Security, Settings } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PersonalInfoSection } from './../components/PersonalInfoSection';

export const Dashboard: React.FC = () => {
    const { user, userProfile, logout, getLinkedProviders } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        navigate('/profile');
        handleClose();
    };

    const handleLogout = async () => {
        await logout();
        handleClose();
    };

    const linkedProviders = getLinkedProviders();

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Mi Aplicación
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            {userProfile?.displayName || user?.displayName || user?.email}
                        </Typography>
                        <IconButton size="large" onClick={handleMenu} color="inherit">
                            <Avatar
                                src={userProfile?.photoURL || user?.photoURL || undefined}
                                sx={{ width: 32, height: 32 }}
                            />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                            <MenuItem onClick={handleProfile}>
                                <AccountCircle sx={{ mr: 1 }} />
                                Perfil
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 3,
                        mb: 3
                    }}
                >
                    <Box sx={{ flex: 2 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                ¡Bienvenido, {userProfile?.displayName || user?.displayName || 'Usuario'}!
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Gestiona tu perfil y configuración de seguridad desde aquí.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/profile')}
                                startIcon={<Settings />}
                            >
                                Ir a Perfil
                            </Button>
                        </Paper>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Seguridad
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Métodos de autenticación activos:
                                </Typography>
                                <Typography variant="h4" color="primary">
                                    {linkedProviders.length}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {linkedProviders.length === 1 ? 'método configurado' : 'métodos configurados'}
                                </Typography>
                                <Button
                                    size="small"
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate('/profile')}
                                >
                                    Gestionar
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
                <PersonalInfoSection />
            </Container>
        </Box>
    );
};