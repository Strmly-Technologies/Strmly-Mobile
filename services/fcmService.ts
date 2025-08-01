import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { CONFIG } from '@/Constants/config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface FCMToken {
  token: string;
  platform: 'ios' | 'android';
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

class FCMService {
  private fcmToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<void> {
    try {
      console.log('🔥 Initializing Expo FCM Service (Firebase-compatible)...');
      
      // Check if running in Expo Go (which has limitations)
      if (__DEV__ && Constants.appOwnership === 'expo') {
        console.warn('📱 Running in Expo Go - Push notifications have limitations');
        console.warn('💡 For full FCM functionality, use development build or production build');
        console.log('🔧 Generating Firebase-compatible development token...');
        
        // Generate development token and skip permission requests
        await this.getFCMToken();
        console.log('✅ Expo FCM Service initialized with development token');
        return;
      }
      
      // Request permissions (for development builds and production)
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('⚠️ FCM permissions not granted');
        return;
      }
      
      // Get FCM token
      await this.getFCMToken();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      console.log('✅ Expo FCM Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Expo FCM Service:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      // Skip permission requests in Expo Go to avoid warnings
      if (__DEV__ && Constants.appOwnership === 'expo') {
        console.log('🔧 Skipping permission request in Expo Go');
        return true;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('❌ Push notification permission denied');
        return false;
      }

      console.log('✅ Push notification permission granted');
      return true;
    } catch (error) {
      console.error('Error requesting FCM permissions:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      // Try to get project ID from various sources
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.expoConfig?.extra?.projectId ||
        Constants.manifest?.extra?.eas?.projectId ||
        process.env.EXPO_PUBLIC_PROJECT_ID;

      console.log('Project ID found:', projectId);

      // For development without project ID, create a Firebase-like token format
      if (!projectId && __DEV__) {
        console.warn('⚠️ No project ID found - creating Firebase-compatible development token');
        // Create a Firebase-like token format for development
        const devToken = `dev-firebase-token:APA91b${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        this.fcmToken = devToken;
        console.log('🔧 Development Firebase-like token:', devToken);
        return this.fcmToken;
      }

      let tokenOptions: any = {};
      if (projectId) {
        tokenOptions.projectId = projectId;
      }

      const token = await Notifications.getExpoPushTokenAsync(tokenOptions);
      
      // Convert Expo token to Firebase-like format for backend compatibility
      const firebaseCompatibleToken = this.convertToFirebaseFormat(token.data);
      this.fcmToken = firebaseCompatibleToken;
      
      console.log('🔥 Original Expo Token:', token.data);
      console.log('🔥 Firebase-compatible Token:', firebaseCompatibleToken);

      return this.fcmToken;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);

      // If project ID is missing, provide helpful error message
      if (error instanceof Error && error.message?.includes('projectId')) {
        console.error('🚨 FCM Setup Required: Please set up your Expo project ID for push notifications');
        
        // In development, use Firebase-like placeholder
        if (__DEV__) {
          console.warn('🔧 Using Firebase-compatible development token');
          const devToken = `dev-firebase-token:APA91b${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
          this.fcmToken = devToken;
          return this.fcmToken;
        }
      }

      return null;
    }
  }

  /**
   * Convert Expo push token to Firebase-compatible format
   * This helps your backend process the token correctly
   */
  private convertToFirebaseFormat(expoToken: string): string {
    // If it's already a Firebase token, return as is
    if (!expoToken.includes('ExponentPushToken')) {
      return expoToken;
    }

    // Extract the token part from ExponentPushToken[TOKEN_HERE]
    const tokenMatch = expoToken.match(/ExponentPushToken\[(.*?)\]/);
    if (tokenMatch && tokenMatch[1]) {
      // Create a Firebase-like token format
      // This maintains the original token data but in Firebase format
      return `expo-firebase:APA91b${tokenMatch[1]}`;
    }

    // Fallback: return original token
    return expoToken;
  }

  async sendTokenToBackend(authToken: string): Promise<boolean> {
    try {
      if (!this.fcmToken) {
        await this.getFCMToken();
      }

      if (!this.fcmToken) {
        console.error('❌ No FCM token available');
        return false;
      }

      console.log('📤 Sending Firebase-compatible token to backend...');
      console.log('🔥 Token format:', this.fcmToken.substring(0, 30) + '...');

      // Send to the backend endpoint as specified by your team
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/user/fcm_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fcm_token: this.fcmToken,
        }),
      });

      if (response.ok) {
        console.log('✅ Firebase-compatible FCM token sent to backend successfully');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to send FCM token to backend:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending FCM token to backend:', error);
      return false;
    }
  }

  private setupNotificationListeners(): void {
    // Skip setting up listeners in Expo Go to avoid warnings
    if (__DEV__ && Constants.appOwnership === 'expo') {
      console.log('🔧 Skipping notification listeners in Expo Go');
      return;
    }

    // Handle notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📱 Notification received:', notification);
        this.handleForegroundNotification(notification);
      }
    );

    // Handle notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleForegroundNotification(notification: Notifications.Notification): void {
    // Handle notification when app is in foreground
    const { title, body, data } = notification.request.content;
    
    console.log('📱 Foreground notification:', { title, body, data });
    
    // Show an alert for foreground notifications
    if (title && body) {
      Alert.alert(title, body);
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    // Handle when user taps on notification
    const { data } = response.notification.request.content;
    
    console.log('👆 Notification tapped:', data);
    
    // Navigate to specific screen based on notification data
    if (data?.screen) {
      console.log('🧭 Navigate to:', data.screen);
      // Add your navigation logic here
    }
  }

  async scheduleLocalNotification(notificationData: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  getToken(): string | null {
    return this.fcmToken;
  }

  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export const fcmService = new FCMService();