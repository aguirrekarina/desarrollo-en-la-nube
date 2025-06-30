import React from 'react';
import { Card, CardContent, CardMedia, Avatar, Typography, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert, Delete } from '@mui/icons-material';
import type { Post } from '../types/post';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';

interface PostCardProps {
    post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const { user } = useAuth();
    const { deletePost } = usePosts();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const isOwner = user?.uid === post.userId;

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

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        src={post.userPhotoURL}
                        sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {post.userDisplayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {formatDate(post.createdAt)}
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
                    {post.content}
                </Typography>

                {post.imageURL && (
                    <CardMedia
                        component="img"
                        image={post.imageURL}
                        alt="Post image"
                        sx={{
                            maxHeight: 400,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: 2
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
};