import React, { useState } from 'react';
import { Paper, TextField, Button, Box, Avatar, CircularProgress, Input } from '@mui/material';
import { Send, Image, Close } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { cloudinaryService } from '../services/cloudinaryService';

export const CreatePost: React.FC = () => {
    const { user, userProfile } = useAuth();
    const { createPost, loading } = usePosts();
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen debe ser menor a 5MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert('Solo se permiten archivos de imagen');
            return;
        }

        setImageFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setUploading(true);

        try {
            let imageURL: string | undefined;
            if (imageFile) {
                try {
                    imageURL = await cloudinaryService.uploadImage(imageFile);
                } catch (imageError) {
                    console.error('Error uploading image:', imageError);
                    alert('Error al subir la imagen. El post se creará sin imagen.');
                }
            }
            await createPost({
                content: content.trim(),
                imageURL
            });
            setContent('');
            setImageFile(null);
            setImagePreview('');
            const fileInput = document.getElementById('image-upload') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }

        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error al crear el post. Inténtalo de nuevo.');
        } finally {
            setUploading(false);
        }
    };
    const isSubmitDisabled = !content.trim() || loading || uploading;

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
                            disabled={uploading}
                        />
                        {imagePreview && (
                            <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        borderRadius: '8px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <Button
                                    onClick={removeImage}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        minWidth: 'auto',
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                        }
                                    }}
                                    disabled={uploading}
                                >
                                    <Close fontSize="small" />
                                </Button>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Input
                                type="file"
                                onChange={handleImageUpload}
                                sx={{ display: 'none' }}
                                id="image-upload"
                                inputProps={{ accept: 'image/*' }}
                                disabled={uploading}
                            />
                            <label htmlFor="image-upload">
                                <Button
                                    component="span"
                                    startIcon={<Image />}
                                    size="small"
                                    disabled={uploading}
                                >
                                    Imagen
                                </Button>
                            </label>

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitDisabled}
                                startIcon={
                                    uploading ? <CircularProgress size={16} /> :
                                        loading ? <CircularProgress size={16} /> :
                                            <Send />
                                }
                                size="small"
                            >
                                {uploading ? 'Subiendo imagen...' :
                                    loading ? 'Publicando...' :
                                        'Publicar'}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Box>
        </Paper>
    );
};