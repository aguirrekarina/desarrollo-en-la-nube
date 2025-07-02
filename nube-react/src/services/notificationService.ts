import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app, db } from '../Firebase/firebaseConfig';
import { doc, setDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

const messaging = getMessaging(app);

export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            });

            if (token) {
                await setDoc(doc(db, 'fcmTokens', userId), {
                    token,
                    userId,
                    createdAt: serverTimestamp()
                });
                return token;
            }
        }
        return null;
    } catch (error) {
        console.error('Error con permisos:', error);
        return null;
    }
};

export const sendNotificationToAll = async (title: string, body: string, authorId: string, authorName: string) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            title,
            body,
            authorId,
            authorName,
            createdAt: serverTimestamp(),
            type: 'new_post'
        });
        console.log('Notificación guardada en Firestore');
    } catch (error) {
        console.error('Error guardando notificación:', error);
    }
};

export const setupForegroundNotifications = () => {
    onMessage(messaging, (payload) => {
        if (payload.notification) {
            new Notification(payload.notification.title || 'Nueva notificación', {
                body: payload.notification.body,
                icon: '/logo192.png'
            });
        }
    });
};

export const listenToNotifications = (userId: string, callback: (notification: any) => void) => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const notification = change.doc.data();
                if (notification.authorId !== userId) {
                    if (Notification.permission === 'granted') {
                        new Notification(notification.title, {
                            body: notification.body,
                            icon: '/logo192.png'
                        });
                    }
                    callback(notification);
                }
            }
        });
    });
};