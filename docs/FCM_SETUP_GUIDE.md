# FCM Push Notifications Setup Guide

## Current Issue
Your app is showing this error:
```
Error getting FCM token: [Error: No "projectId" found. If "projectId" can't be inferred from the manifest (for instance, in bare workflow), you have to pass it in yourself.]
```

This happens because Expo needs a project ID to generate push tokens for notifications.

## Quick Fix Options

### Option 1: Use EAS (Recommended)
This is the easiest and most reliable approach:

1. **Install EAS CLI** (if not already installed):
```bash
npm install -g @expo/eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Initialize EAS in your project**:
```bash
cd Strmly-Mobile
eas build:configure
```

4. **This will create an `eas.json` file and set up your project ID automatically**

### Option 2: Manual Project ID Setup

1. **Get your Expo Project ID**:
   - Go to [expo.dev](https://expo.dev)
   - Login and find your project
   - Copy the project ID from the URL or project settings

2. **Add to your app.config.js**:
```javascript
export default {
  "expo": {
    "name": "native-movie",
    "slug": "native-movie",
    // ... other config
    extra: {
      BACKEND_API_URL: process.env.BACKEND_API_URL,
      eas: {
        projectId: "your-project-id-here" // Add this line
      }
    },
    // ... rest of config
  }
}
```

3. **Or add to your .env file**:
```bash
EXPO_PUBLIC_PROJECT_ID=your-project-id-here
```

### Option 3: Create New Expo Project (if needed)

If you don't have an Expo project yet:

1. **Create project on Expo**:
```bash
eas project:create
```

2. **Follow the prompts to set up your project**

## Testing the Fix

After setting up the project ID:

1. **Restart your development server**:
```bash
npm start
```

2. **Check the logs** - you should see:
```
Project ID found: your-project-id
FCM Token: ExponentPushToken[...]
```

3. **Test FCM functionality** using the test component:
```tsx
import { FCMTestComponent } from '@/components/FCMTestComponent';
// Add <FCMTestComponent /> to any screen
```

## Alternative: Development-Only Solution

If you just want to test other features without FCM for now, you can temporarily disable FCM token generation:

1. **Update your FCM service** to skip token generation in development:
```typescript
// In services/fcmService.ts
async getFCMToken(): Promise<string | null> {
  if (__DEV__ && !Constants.expoConfig?.extra?.eas?.projectId) {
    console.log('Skipping FCM token in development - no project ID');
    return 'dev-token-placeholder';
  }
  // ... rest of the method
}
```

## Production Considerations

For production builds, you'll definitely need:
- ✅ Proper Expo project ID
- ✅ EAS configuration
- ✅ Push notification certificates (iOS)
- ✅ Firebase project setup (if using Firebase)

## Next Steps

1. **Choose Option 1 (EAS)** - it's the most straightforward
2. **Test the implementation** after setup
3. **Verify backend integration** works correctly
4. **Test end-to-end notifications**

## Need Help?

If you run into issues:
1. Check the Expo documentation: https://docs.expo.dev/push-notifications/overview/
2. Verify your project exists on expo.dev
3. Make sure you're logged into the correct Expo account

The FCM implementation is ready - it just needs the project ID to generate tokens! 🚀