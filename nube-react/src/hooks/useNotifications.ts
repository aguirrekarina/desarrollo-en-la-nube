import { useState, useEffect, useCallback } from 'react';
import { FunctionsService, type NotificationData } from '../services/functionsService';
import { useAuth } from './useAuth';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    const loadNotifications = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const userNotifications = await FunctionsService.getUserNotifications();
            setNotifications(userNotifications);

            const unread = userNotifications.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = async (notificationId: string) => {
        try {
            await FunctionsService.markNotificationAsRead(notificationId);

            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );

            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
        }
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    };

    useEffect(() => {
        loadNotifications();
        requestNotificationPermission();
    }, [loadNotifications]);

    useEffect(() => {
        if (!user) return;

        const interval = setInterval(async () => {
            try {
                const freshNotifications = await FunctionsService.getUserNotifications();

                const newNotifications = freshNotifications.filter(fresh =>
                    !notifications.some(current => current.id === fresh.id)
                );

                if (newNotifications.length > 0) {
                    setNotifications(freshNotifications);
                    setUnreadCount(freshNotifications.filter(n => !n.read).length);
                }
            } catch (error) {
                console.error('Error en polling de notificaciones:', error);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user, notifications]);

    return {
        notifications,
        loading,
        unreadCount,
        loadNotifications,
        markAsRead,
        requestNotificationPermission
    };
};