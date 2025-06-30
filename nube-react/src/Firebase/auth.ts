import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    linkWithPopup,
    unlink,
    type User,
    type UserCredential
} from 'firebase/auth';
import { app } from './firebaseConfig';

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

googleProvider.addScope('profile');
googleProvider.addScope('email');
facebookProvider.addScope('email');

export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async (): Promise<UserCredential> => {
    return await signInWithPopup(auth, googleProvider);
};

export const signInWithFacebook = async (): Promise<UserCredential> => {
    return await signInWithPopup(auth, facebookProvider);
};

export const logOut = async (): Promise<void> => {
    return await signOut(auth);
};

export const linkGoogleProvider = async (user: User): Promise<UserCredential> => {
    return await linkWithPopup(user, googleProvider);
};

export const linkFacebookProvider = async (user: User): Promise<UserCredential> => {
    return await linkWithPopup(user, facebookProvider);
};

export const linkEmailProvider = async (user: User, email: string, password: string): Promise<UserCredential> => {
    const { EmailAuthProvider, linkWithCredential } = await import('firebase/auth');
    const credential = EmailAuthProvider.credential(email, password);
    return await linkWithCredential(user, credential);
};

export const unlinkProvider = async (user: User, providerId: string): Promise<User> => {
    return await unlink(user, providerId);
};

export const getLinkedProviders = (user: User): string[] => {
    return user.providerData.map(provider => provider.providerId);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};