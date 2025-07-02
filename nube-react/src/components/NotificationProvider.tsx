import React, { useEffect, createContext, useContext, type ReactNode } from 'react';
import {
    requestNotificationPermission,
    setupForegroundNotifications,
    listenToNotifications
} from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import type {NotificationData} from "../services/functionsService.ts";

interface NotificationContextType {
    notifications: NotificationData[];
    loading: boolean;
    unreadCount: number;
    loadNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    requestNotificationPermission: () => Promise<boolean>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const notificationData = useNotifications();

    const requestNotificationPermissionEnhanced = async (): Promise<boolean> => {
        if (!user?.uid) return false;

        try {
            const permission = await requestNotificationPermission(user.uid);
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    };

    useEffect(() => {
        if (user?.uid) {
            requestNotificationPermission(user.uid);
            setupForegroundNotifications();

            const unsubscribe = listenToNotifications(user.uid, () => {
                notificationData.loadNotifications();
            });

            return () => unsubscribe();
        }
    }, [user]);

    const contextValue: NotificationContextType = {
        ...notificationData,
        requestNotificationPermission: requestNotificationPermissionEnhanced,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};