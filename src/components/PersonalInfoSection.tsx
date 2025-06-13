import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Alert, IconButton, Collapse } from '@mui/material';
import { Person, LocationOn, Cake, Numbers, Email, Badge,  Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import type { UserProfile } from '../types/auth';

export const PersonalInfoSection: React.FC = () => {
    const { user, userProfile, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        displayName: userProfile?.displayName || user?.displayName || '',
        direccion: userProfile?.direccion || '',
        fechaNacimiento: userProfile?.fechaNacimiento || ''
    });

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'No especificado';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleInputChange = (field: keyof typeof formData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
        setFormData({
            displayName: userProfile?.displayName || user?.displayName || '',
            direccion: userProfile?.direccion || '',
            fechaNacimiento: userProfile?.fechaNacimiento || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        setSuccess('');
        setFormData({
            displayName: userProfile?.displayName || user?.displayName || '',
            direccion: userProfile?.direccion || '',
            fechaNacimiento: userProfile?.fechaNacimiento || ''
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const updates: Partial<UserProfile> = {};

            if (formData.displayName !== (userProfile?.displayName || '')) {
                updates.displayName = formData.displayName;
            }

            if (formData.direccion !== (userProfile?.direccion || '')) {
                updates.direccion = formData.direccion;
            }

            if (formData.fechaNacimiento !== (userProfile?.fechaNacimiento || '')) {
                updates.fechaNacimiento = formData.fechaNacimiento;
            }

            if (Object.keys(updates).length > 0) {
                await updateProfile(updates);
                setSuccess('Información personal actualizada exitosamente');
                setIsEditing(false);
            } else {
                setIsEditing(false);
            }
        } catch (error: any) {
            setError(error.message || 'Error al actualizar la información');
        } finally {
            setLoading(false);
        }
    };

    const personalInfo = [
        {
            icon: <Email sx={{ mr: 2, color: 'primary.main' }} />,
            label: 'Email',
            value: userProfile?.email || user?.email || 'No especificado',
            editable: false
        },
        {
            icon: <Badge sx={{ mr: 2, color: 'primary.main' }} />,
            label: 'Nombre Completo',
            value: userProfile?.displayName || user?.displayName || 'No especificado',
            editable: true,
            field: 'displayName' as keyof typeof formData
        },
        {
            icon: <LocationOn sx={{ mr: 2, color: 'primary.main' }} />,
            label: 'Dirección',
            value: userProfile?.direccion || 'No especificada',
            editable: true,
            field: 'direccion' as keyof typeof formData
        },
        {
            icon: <Cake sx={{ mr: 2, color: 'primary.main' }} />,
            label: 'Fecha de Nacimiento',
            value: formatDate(userProfile?.fechaNacimiento),
            editable: true,
            field: 'fechaNacimiento' as keyof typeof formData,
            type: 'date'
        },
        {
            icon: <Numbers sx={{ mr: 2, color: 'primary.main' }} />,
            label: 'Edad',
            value: userProfile?.edad ? `${userProfile.edad} años` : 'No calculada',
            editable: false
        }
    ];

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                    <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Información Personal
                </Typography>
                {!isEditing ? (
                    <IconButton onClick={handleEdit} color="primary">
                        <Edit />
                    </IconButton>
                ) : (
                    <Box>
                        <IconButton onClick={handleCancel} color="secondary" sx={{ mr: 1 }}>
                            <Cancel />
                        </IconButton>
                        <IconButton onClick={handleSave} color="primary" disabled={loading}>
                            <Save />
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Collapse in={Boolean(error)} sx={{ mb: 2 }}>
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Collapse>

            <Collapse in={Boolean(success)} sx={{ mb: 2 }}>
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Collapse>

            {!isEditing ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {personalInfo.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                            {item.icon}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {item.label}
                                </Typography>
                                <Typography variant="body1">{item.value}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 3,
                            flexWrap: 'wrap'
                        }}
                    >
                        {personalInfo
                            .filter((item) => item.editable)
                            .map((item, index) => (
                                <TextField
                                    key={index}
                                    fullWidth
                                    label={item.label}
                                    type={item.type || 'text'}
                                    value={formData[item.field!]}
                                    onChange={handleInputChange(item.field!)}
                                    InputLabelProps={item.type === 'date' ? { shrink: true } : undefined}
                                    variant="outlined"
                                    sx={{ flex: 1, minWidth: '250px' }}
                                />
                            ))}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Email sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Email (No editable)
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {userProfile?.email || user?.email || 'No especificado'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}
        </Paper>
    );
};
