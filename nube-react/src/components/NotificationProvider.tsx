import React, { useEffect, createContext, type ReactNode } from 'react';
import {
    requestNotificationPermission,
    setupForegroundNotifications,
    listenToNotifications
} from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext(null);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user } = useAuth();

    useEffect(() => {
        if (user?.uid) {
            requestNotificationPermission(user.uid);
            setupForegroundNotifications();

            const unsubscribe = listenToNotifications(user.uid, (notification) => {
                console.log('Nueva notificación recibida:', notification);
            });

            return () => unsubscribe();
        }
    }, [user]);

    return (
        <NotificationContext.Provider value={null}>
            {children}
        </NotificationContext.Provider>
    );
};