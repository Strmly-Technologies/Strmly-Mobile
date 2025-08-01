# Firebase FCM Setup Guide

## 🔥 **What's Changed**

Your app now uses **Firebase FCM directly** instead of Expo push notifications, as requested by your backend team. This will generate real Firebase FCM tokens that your backend can use.

## 📋 **Token Format Comparison**

### **Before (Expo):**
```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

### **After (Firebase):**
```
fGHJ123abc:APA91bF... (Firebase FCM token - much longer)
```

## ⚙️ **Firebase Configuration Required**

You need to add Firebase configuration files to your project:

### **1. Android Configuration**
Create `android/app/google-services.json` with your Firebase project config:

```json
{
  "project_info": {
    "project_number": "123456789",
    "project_id": "your-firebase-project-id",
    "storage_bucket": "your-project.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789:android:abc123",
        "android_client_info": {
          "package_name": "com.yourapp.package"
        }
      }
    }
  ]
}
```

### **2. iOS Configuration**
Create `ios/GoogleService-Info.plist` with your Firebase project config.

### **3. Get Configuration Files**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create one)
3. Go to Project Settings
4. Download `google-services.json` for Android
5. Download `GoogleService-Info.plist` for iOS

## 🔧 **Implementation Details**

### **What's Implemented:**
- ✅ **Firebase FCM Integration**: Uses `@react-native-firebase/messaging`
- ✅ **Real FCM Tokens**: Generates actual Firebase tokens
- ✅ **Permission Handling**: Requests proper FCM permissions
- ✅ **Background Messages**: Handles notifications when app is closed
- ✅ **Foreground Messages**: Shows alerts when app is open
- ✅ **Token Refresh**: Automatically updates tokens when they change
- ✅ **Backend Integration**: Sends tokens to your `/api/v1/user/fcm_token` endpoint

### **Key Features:**
- **Real Firebase Tokens**: Your backend will receive proper FCM tokens
- **Cross-Platform**: Works on both iOS and Android
- **Background Handling**: Processes notifications even when app is closed
- **Token Refresh**: Automatically handles token updates
- **Error Handling**: Graceful fallbacks and error logging

## 🧪 **Testing**

### **1. Check Token Generation**
Add the test component to see the token:
```tsx
import { FCMTestComponent } from '@/components/FCMTestComponent';
// Add <FCMTestComponent /> to any screen
```

### **2. Console Logs**
Look for these logs:
```
🔥 Initializing Firebase FCM Service...
✅ Firebase messaging permission granted
🔥 Firebase FCM Token: fGHJ123abc:APA91bF...
✅ Firebase FCM Service initialized successfully
📤 Sending Firebase FCM token to backend...
✅ Firebase FCM token sent to backend successfully
```

### **3. Backend Verification**
Your backend should now receive real Firebase tokens instead of Expo tokens.

## 🚨 **Important Notes**

### **Development vs Production:**
- **Development**: May show warnings about missing config files
- **Production**: Requires proper Firebase configuration files
- **Testing**: Use development build or production build for full functionality

### **Permissions:**
- **Android 13+**: Automatically requests notification permission
- **iOS**: Requests Firebase messaging permission
- **Background**: Handles messages even when app is closed

## 📱 **Platform-Specific Setup**

### **Android:**
1. Place `google-services.json` in `android/app/`
2. Ensure `@react-native-firebase/app` is properly configured
3. Build with `eas build` or `expo run:android`

### **iOS:**
1. Place `GoogleService-Info.plist` in `ios/` folder
2. Add to Xcode project
3. Build with `eas build` or `expo run:ios`

## 🔄 **Migration Benefits**

- ✅ **Backend Compatibility**: Works directly with Firebase Admin SDK
- ✅ **Real Tokens**: No more placeholder tokens
- ✅ **Better Performance**: Direct Firebase integration
- ✅ **More Features**: Access to all Firebase FCM features
- ✅ **Production Ready**: Works in all environments

## 📝 **Next Steps**

1. **Get Firebase Config**: Download config files from Firebase Console
2. **Add Config Files**: Place them in your project
3. **Build App**: Use development build or production build
4. **Test Tokens**: Verify real Firebase tokens are generated
5. **Backend Testing**: Confirm your backend receives proper tokens

The Firebase FCM integration is complete and ready to generate real tokens for your backend! 🚀