import React from 'react';
import { Container, AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../components/UserProfile';

export const Profile: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
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
                    <Button color="inherit" onClick={() => navigate('/dashboard')}>
                        Dashboard
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md">
                <UserProfile />
            </Container>
        </>
    );
};