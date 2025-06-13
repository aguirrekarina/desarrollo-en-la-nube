import type { User } from 'firebase/auth';

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    direccion?: string;
    fechaNacimiento?: string;
    edad?: number;
    createdAt?: any;
    updatedAt?: any;
}

export interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
    linkProvider: (provider: 'google' | 'facebook' | 'email', email?: string, password?: string) => Promise<void>;
    unlinkProvider: (providerId: string) => Promise<void>;
    logout: () => Promise<void>;
    getLinkedProviders: () => string[];
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface SignUpFormData extends LoginFormData {
    confirmPassword: string;
}

export interface ProfileFormData {
    displayName: string;
    direccion: string;
    fechaNacimiento: string;
}

export interface ProviderInfo {
    id: string;
    name: string;
    icon: string;
    connected: boolean;
}