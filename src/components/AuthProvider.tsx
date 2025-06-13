import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { AuthContextType, UserProfile } from '../types/auth';
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
import {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    calculateAge
} from '../Firebase/firestore';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async (currentUser: User) => {
        try {
            let profile = await getUserProfile(currentUser.uid);

            if (!profile) {
                const basicProfile: Partial<UserProfile> = {
                    email: currentUser.email || '',
                    displayName: currentUser.displayName || '',
                    photoURL: currentUser.photoURL || ''
                };

                await createUserProfile(currentUser.uid, basicProfile);
                profile = await getUserProfile(currentUser.uid);
            }

            setUserProfile(profile);
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (user) => {
            setUser(user);

            if (user) {
                await loadUserProfile(user);
            } else {
                setUserProfile(null);
            }

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

    const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
        if (!user) throw new Error('No user logged in');

        try {
            // Si se actualiza la fecha de nacimiento, calcular la edad
            if (updates.fechaNacimiento) {
                updates.edad = calculateAge(updates.fechaNacimiento);
            }

            await updateUserProfile(user.uid, updates);
            await refreshProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const refreshProfile = async (): Promise<void> => {
        if (!user) return;
        await loadUserProfile(user);
    };

    const getLinkedProvidersForCurrentUser = (): string[] => {
        return user ? getLinkedProviders(user) : [];
    };

    const value: AuthContextType = {
        user,
        userProfile,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signInWithFacebook,
        linkProvider,
        unlinkProvider,
        logout,
        getLinkedProviders: getLinkedProvidersForCurrentUser,
        updateProfile,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};