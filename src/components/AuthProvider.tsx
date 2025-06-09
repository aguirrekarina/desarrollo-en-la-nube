import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { AuthContextType } from '../types/auth';
import {
    onAuthStateChange,
    signUpWithEmail as firebaseSignUp,
    signInWithEmail as firebaseSignIn,
    signInWithGoogle as firebaseGoogleSignIn,
    signInWithFacebook as firebaseFacebookSignIn,
    linkGoogleProvider,
    linkFacebookProvider,
    linkEmailProvider,
    unlinkProvider as firebaseUnlinkProvider,
    getLinkedProviders,
    logOut
} from '../Firebase/auth';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signUpWithEmail = async (email: string, password: string): Promise<void> => {
        try {
            await firebaseSignUp(email, password);
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string): Promise<void> => {
        try {
            await firebaseSignIn(email, password);
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    };

    const signInWithGoogle = async (): Promise<void> => {
        try {
            await firebaseGoogleSignIn();
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signInWithFacebook = async (): Promise<void> => {
        try {
            await firebaseFacebookSignIn();
        } catch (error) {
            console.error('Error signing in with Facebook:', error);
            throw error;
        }
    };

    const linkProvider = async (
        provider: 'google' | 'facebook' | 'email',
        email?: string,
        password?: string
    ): Promise<void> => {
        if (!user) throw new Error('No user logged in');

        try {
            switch (provider) {
                case 'google':
                    await linkGoogleProvider(user);
                    break;
                case 'facebook':
                    await linkFacebookProvider(user);
                    break;
                case 'email':
                    if (!email || !password) throw new Error('Email and password required');
                    await linkEmailProvider(user, email, password);
                    break;
            }
        } catch (error) {
            console.error(`Error linking ${provider} provider:`, error);
            throw error;
        }
    };

    const unlinkProvider = async (providerId: string): Promise<void> => {
        if (!user) throw new Error('No user logged in');

        try {
            await firebaseUnlinkProvider(user, providerId);
        } catch (error) {
            console.error('Error unlinking provider:', error);
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await logOut();
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    };

    const getLinkedProvidersForCurrentUser = (): string[] => {
        return user ? getLinkedProviders(user) : [];
    };

    const value: AuthContextType = {
        user,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signInWithFacebook,
        linkProvider,
        unlinkProvider,
        logout,
        getLinkedProviders: getLinkedProvidersForCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};