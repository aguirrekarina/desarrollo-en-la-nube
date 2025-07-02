import { httpsCallable } from 'firebase/functions';
import { functions } from '../Firebase/firebaseConfig';

export interface LikeDislikeRequest {
    postId: string;
    action: 'like' | 'dislike';
    userId: string;
}

export interface LikeDislikeResponse {
    success: boolean;
    message: string;
}

export interface NotificationData {
    id: string;
    userId: string;
    fromUserId: string;
    fromUserName?: string;
    fromUserPhoto?: string;
    postId: string;
    type: 'like' | 'dislike' | 'comment' | 'moderation';
    message: string;
    read: boolean;
    createdAt: any;
}

export interface GetNotificationsResponse {
    notifications: NotificationData[];
}

export interface MarkNotificationRequest {
    notificationId: string;
}

export class FunctionsService {
    static async handleLikeDislike(data: LikeDislikeRequest): Promise<LikeDislikeResponse> {
        try {
            const handleLikeDislikeFunction = httpsCallable<LikeDislikeRequest, LikeDislikeResponse>(
                functions,
                'handleLikeDislike'
            );

            const result = await handleLikeDislikeFunction(data);
            return result.data;
        } catch (error) {
            console.error('Error en handleLikeDislike:', error);
            throw error;
        }
    }

    static async getUserNotifications(): Promise<NotificationData[]> {
        try {
            const getUserNotificationsFunction = httpsCallable<void, GetNotificationsResponse>(
                functions,
                'getUserNotifications'
            );

            const result = await getUserNotificationsFunction();
            return result.data.notifications;
        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            throw error;
        }
    }

    static async markNotificationAsRead(notificationId: string): Promise<void> {
        try {
            const markNotificationFunction = httpsCallable<MarkNotificationRequest, {success: boolean}>(
                functions,
                'markNotificationAsRead'
            );

            await markNotificationFunction({ notificationId });
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
            throw error;
        }
    }
}