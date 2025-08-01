import React, { createContext, useContext } from 'react';
import { useFCM } from '../hooks/useFCM';

interface NotificationContextType {
    fcmToken: string | null;
    isInitialized: boolean;
    sendTokenToBackend: (authToken: string) => Promise<boolean>;
    scheduleNotification: (data: any) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
}) => {
    const {
        fcmToken,
        isInitialized,
        sendTokenToBackend,
        scheduleNotification,
    } = useFCM();

    const contextValue: NotificationContextType = {
        fcmToken,
        isInitialized,
        sendTokenToBackend,
        scheduleNotification,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};