import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { usePosts } from '../hooks/usePosts';

export const PostsFeed: React.FC = () => {
    const { posts, loading, getAllPosts } = usePosts();

    useEffect(() => {
        getAllPosts();
    }, []);

    if (loading && posts.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <CreatePost />

            {posts.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                        No hay posts todavía
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ¡Sé el primero en compartir algo!
                    </Typography>
                </Box>
            ) : (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            )}
        </Box>
    );
};