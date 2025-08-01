import { useEffect, useState } from 'react';
import { fcmService, NotificationData } from '../services/fcmService';

export interface UseFCMReturn {
  fcmToken: string | null;
  isInitialized: boolean;
  sendTokenToBackend: (authToken: string) => Promise<boolean>;
  scheduleNotification: (data: NotificationData) => Promise<void>;
}

export const useFCM = (): UseFCMReturn => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeFCM = async () => {
      try {
        await fcmService.initialize();
        const token = fcmService.getToken();
        setFcmToken(token);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize FCM:', error);
        setIsInitialized(false);
      }
    };

    initializeFCM();

    return () => {
      fcmService.cleanup();
    };
  }, []);

  const sendTokenToBackend = async (authToken: string): Promise<boolean> => {
    return await fcmService.sendTokenToBackend(authToken);
  };

  const scheduleNotification = async (data: NotificationData): Promise<void> => {
    await fcmService.scheduleLocalNotification(data);
  };

  return {
    fcmToken,
    isInitialized,
    sendTokenToBackend,
    scheduleNotification,
  };
};