import React, { useState } from 'react';
import { Paper, TextField, Button, Box, Avatar, CircularProgress, Input } from '@mui/material';
import { Send, Image } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const CreatePost: React.FC = () => {
    const { user, userProfile } = useAuth();
    const { createPost, loading } = usePosts();
    const [content, setContent] = useState('');
    const [imageData, setImageData] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen debe ser menor a 5MB');
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            setImageData(base64);
        } catch (error) {
            console.error('Error al cargar imagen:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await createPost({
                content: content.trim(),
                imageURL: imageData || undefined
            });
            setContent('');
            setImageData('');
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar
                    src={userProfile?.photoURL || user?.photoURL || undefined}
                    sx={{ width: 40, height: 40 }}
                />
                <Box sx={{ flex: 1 }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="¿Qué estás pensando?"
                            variant="outlined"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        {imageData && (
                            <Box sx={{ mb: 2 }}>
                                <img
                                    src={imageData}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                                />
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Input
                                type="file"
                                onChange={handleImageUpload}
                                sx={{ display: 'none' }}
                                id="image-upload"
                            />
                            <label htmlFor="image-upload">
                                <Button component="span" startIcon={<Image />} size="small">
                                    Imagen
                                </Button>
                            </label>

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!content.trim() || loading}
                                startIcon={loading ? <CircularProgress size={16} /> : <Send />}
                                size="small"
                            >
                                {loading ? 'Publicando...' : 'Publicar'}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Box>
        </Paper>
    );
};