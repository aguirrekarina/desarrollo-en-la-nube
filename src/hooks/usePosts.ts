import { useContext } from 'react';
import { PostContext } from '../components/PostProvider';
import { type PostContextType } from '../types/post';

export const usePosts = (): PostContextType => {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error('usePosts must be used within a PostProvider');
    }
    return context;
};