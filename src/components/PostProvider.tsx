import React, { createContext, useState, type ReactNode } from 'react';
import type { Post, PostContextType, CreatePostData } from '../types/post';
import { PostRepository } from '../repository/postRepository';
import { useAuth } from '../hooks/useAuth';
import { sendNotificationToAll } from '../services/notificationService';

export const PostContext = createContext<PostContextType | null>(null);

interface PostProviderProps {
    children: ReactNode;
}

export const PostProvider: React.FC<PostProviderProps> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const { user, userProfile } = useAuth();
    const postRepository = new PostRepository();

    const createPost = async (postData: CreatePostData): Promise<void> => {
        if (!user || !userProfile) throw new Error('No user logged in');

        try {
            setLoading(true);
            await postRepository.createPost(
                user.uid,
                userProfile.displayName || user.displayName || 'Usuario',
                userProfile.photoURL || user.photoURL || undefined,
                postData
            );
            const authorName = userProfile.displayName || user.displayName || 'Alguien';
            await sendNotificationToAll(
                'Nuevo Post',
                `${authorName} publicó algo nuevo`,
                user.uid,
                authorName
            );
            await refreshPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId: string): Promise<void> => {
        if (!user) throw new Error('No user logged in');

        try {
            setLoading(true);
            await postRepository.deletePost(postId);
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getUserPosts = async (userId: string): Promise<Post[]> => {
        try {
            return await postRepository.getUserPosts(userId);
        } catch (error) {
            console.error('Error getting user posts:', error);
            throw error;
        }
    };

    const getAllPosts = async (): Promise<void> => {
        try {
            setLoading(true);
            const allPosts = await postRepository.getAllPosts();
            setPosts(allPosts);
        } catch (error) {
            console.error('Error getting all posts:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const refreshPosts = async (): Promise<void> => {
        await getAllPosts();
    };

    const value: PostContextType = {
        posts,
        loading,
        createPost,
        deletePost,
        getUserPosts,
        getAllPosts,
        refreshPosts
    };

    return (
        <PostContext.Provider value={value}>
            {children}
        </PostContext.Provider>
    );
};