import {
    collection,
    doc,
    addDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    type QuerySnapshot,
    type DocumentData
} from 'firebase/firestore';
import { db } from '../Firebase/firebaseConfig';
import type { Post, CreatePostData } from '../types/post';

export class PostRepository {
    private readonly COLLECTION_NAME = 'posts';

    async createPost(userId: string, userDisplayName: string, userPhotoURL: string | undefined, postData: CreatePostData): Promise<string> {
        try {
            const postsRef = collection(db, this.COLLECTION_NAME);
            const docRef = await addDoc(postsRef, {
                userId,
                userDisplayName,
                userPhotoURL: userPhotoURL || '',
                content: postData.content,
                imageURL: postData.imageURL || '',
                likesCount: 0,
                commentsCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    async deletePost(postId: string): Promise<void> {
        try {
            const postRef = doc(db, this.COLLECTION_NAME, postId);
            await deleteDoc(postRef);
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }

    async getUserPosts(userId: string): Promise<Post[]> {
        try {
            const postsRef = collection(db, this.COLLECTION_NAME);
            const q = query(
                postsRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return this.mapSnapshotToPosts(querySnapshot);
        } catch (error) {
            console.error('Error getting user posts:', error);
            throw error;
        }
    }

    async getAllPosts(): Promise<Post[]> {
        try {
            const postsRef = collection(db, this.COLLECTION_NAME);
            const q = query(postsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return this.mapSnapshotToPosts(querySnapshot);
        } catch (error) {
            console.error('Error getting all posts:', error);
            throw error;
        }
    }

    private mapSnapshotToPosts(querySnapshot: QuerySnapshot<DocumentData>): Post[] {
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Post));
    }
}