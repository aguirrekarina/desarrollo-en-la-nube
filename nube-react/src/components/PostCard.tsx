import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Avatar, Typography, Box, IconButton, Menu, MenuItem, Divider, CircularProgress,
    Snackbar, Alert } from '@mui/material';
import { MoreVert, Delete, ThumbUp, ThumbDown, ThumbUpOutlined, ThumbDownOutlined } from '@mui/icons-material';
import type { Post } from '../types/post';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { FunctionsService } from '../services/functionsService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../Firebase/firebaseConfig';

interface PostCardProps {
    post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const { user } = useAuth();
    const { deletePost } = usePosts();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [likingPost, setLikingPost] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const isOwner = user?.uid === post.userId;
    const currentUserId = user?.uid || '';

    const [localPost, setLocalPost] = useState(post);
    const [localLikesCount, setLocalLikesCount] = useState(post.likesCount || 0);
    const [localDislikesCount, setLocalDislikesCount] = useState(post.dislikesCount || 0);
    const [userHasLiked, setUserHasLiked] = useState(post.likedBy?.includes(currentUserId) || false);
    const [userHasDisliked, setUserHasDisliked] = useState(post.dislikedBy?.includes(currentUserId) || false);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'posts', post.id), (doc) => {
            if (doc.exists()) {
                const updatedPost = { ...doc.data(), id: doc.id } as Post;
                setLocalPost(updatedPost);
                setLocalLikesCount(updatedPost.likesCount || 0);
                setLocalDislikesCount(updatedPost.dislikesCount || 0);
                setUserHasLiked(updatedPost.likedBy?.includes(currentUserId) || false);
                setUserHasDisliked(updatedPost.dislikedBy?.includes(currentUserId) || false);
            }
        });

        return () => unsubscribe();
    }, [post.id, currentUserId]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = async () => {
        try {
            await deletePost(post.id);
            handleMenuClose();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleLikeDislike = async (action: 'like' | 'dislike') => {
        if (!user || isOwner || likingPost) return;

        setLikingPost(true);

        try {
            await FunctionsService.handleLikeDislike({
                postId: post.id,
                action,
                userId: currentUserId
            });

            if (action === 'like') {
                if (userHasLiked) {
                    setLocalLikesCount(prev => prev - 1);
                    setUserHasLiked(false);
                } else {
                    setLocalLikesCount(prev => prev + 1);
                    setUserHasLiked(true);

                    if (userHasDisliked) {
                        setLocalDislikesCount(prev => prev - 1);
                        setUserHasDisliked(false);
                    }
                }
            } else if (action === 'dislike') {
                if (userHasDisliked) {
                    setLocalDislikesCount(prev => prev - 1);
                    setUserHasDisliked(false);
                } else {
                    setLocalDislikesCount(prev => prev + 1);
                    setUserHasDisliked(true);

                    if (userHasLiked) {
                        setLocalLikesCount(prev => prev - 1);
                        setUserHasLiked(false);
                    }
                }
            }

            setSnackbar({
                open: true,
                message: action === 'like' ? '¡Like enviado!' : '¡Dislike enviado!',
                severity: 'success'
            });

        } catch (error) {
            console.error('Error en like/dislike:', error);
            setSnackbar({
                open: true,
                message: 'Error al procesar la acción',
                severity: 'error'
            });
        } finally {
            setLikingPost(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                            src={localPost.userPhotoURL}
                            sx={{ width: 40, height: 40, mr: 2 }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {localPost.userDisplayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDate(localPost.createdAt)}
                                {(localPost.isModerated || localPost.moderated) && (
                                    <Typography component="span" variant="caption" color="warning.main" sx={{ ml: 1 }}>
                                        • Contenido moderado
                                    </Typography>
                                )}
                            </Typography>
                        </Box>
                        {isOwner && (
                            <>
                                <IconButton onClick={handleMenuOpen}>
                                    <MoreVert />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleDelete}>
                                        <Delete sx={{ mr: 1 }} />
                                        Eliminar
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {localPost.content}
                    </Typography>

                    {localPost.imageURL && (
                        <CardMedia
                            component="img"
                            image={localPost.imageURL}
                            alt="Post image"
                            sx={{
                                maxHeight: 400,
                                objectFit: 'cover',
                                borderRadius: 1,
                                mb: 2
                            }}
                        />
                    )}

                    {user && (
                        <>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {!isOwner ? (
                                        <IconButton
                                            onClick={() => handleLikeDislike('like')}
                                            disabled={likingPost}
                                            color={userHasLiked ? 'primary' : 'default'}
                                            size="small"
                                        >
                                            {likingPost ? (
                                                <CircularProgress size={20} />
                                            ) : userHasLiked ? (
                                                <ThumbUp />
                                            ) : (
                                                <ThumbUpOutlined />
                                            )}
                                        </IconButton>
                                    ) : (
                                        <ThumbUpOutlined sx={{ color: 'action.disabled', mr: 1 }} />
                                    )}
                                    <Typography variant="body2" color="text.secondary">
                                        {localLikesCount}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {!isOwner ? (
                                        <IconButton
                                            onClick={() => handleLikeDislike('dislike')}
                                            disabled={likingPost}
                                            color={userHasDisliked ? 'error' : 'default'}
                                            size="small"
                                        >
                                            {userHasDisliked ? (
                                                <ThumbDown />
                                            ) : (
                                                <ThumbDownOutlined />
                                            )}
                                        </IconButton>
                                    ) : (
                                        <ThumbDownOutlined sx={{ color: 'action.disabled', mr: 1 }} />
                                    )}
                                    <Typography variant="body2" color="text.secondary">
                                        {localDislikesCount}
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={closeSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};