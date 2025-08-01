import { Router } from 'expo-router';

export interface NotificationData {
  screen?: string;
  videoId?: string;
  userId?: string;
  communityId?: string;
  seriesId?: string;
  type?: 'video' | 'profile' | 'community' | 'series' | 'general';
}

export const handleNotificationNavigation = (router: Router, data: NotificationData) => {
  console.log('Notification navigation data:', data);

  try {
    // Handle specific screen navigation
    if (data.screen) {
      router.push(data.screen as any);
      return;
    }

    // Handle navigation based on type and IDs
    switch (data.type) {
      case 'video':
        if (data.videoId) {
          // Since there's no individual video route, go to video feed
          // You could store the videoId in a global state to highlight it
          router.push('/(dashboard)/long/VideoFeed' as any);
        }
        break;

      case 'profile':
        if (data.userId) {
          router.push('/(dashboard)/profile/Dashboard' as any);
        }
        break;

      case 'community':
        if (data.communityId) {
          router.push('/(communities)/CommunitiesPage' as any);
        }
        break;

      case 'series':
        if (data.seriesId) {
          router.push('/studio/StrmlyStudio' as any);
        }
        break;

      default:
        // Default navigation to video feed
        router.push('/(dashboard)/long/VideoFeed' as any);
        break;
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to home screen
    router.push('/(dashboard)/long/VideoFeed' as any);
  }
};