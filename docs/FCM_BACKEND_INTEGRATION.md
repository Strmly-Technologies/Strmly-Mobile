# FCM Backend Integration Guide

## Backend API Endpoint

Your backend team has specified the endpoint for FCM token registration:

### POST /api/v1/user/fcm_token

```javascript
// Example Express.js endpoint
app.post('/api/v1/user/fcm_token', async (req, res) => {
  try {
    const { fcm_token } = req.body;
    const userId = req.user.id; // From JWT token middleware
    
    // Validate required fields
    if (!fcm_token) {
      return res.status(400).json({ 
        error: 'fcm_token is required' 
      });
    }

    // Store or update FCM token in your database
    // Example with MongoDB/Mongoose:
    await User.findByIdAndUpdate(
      userId,
      { 
        fcm_token,
        fcm_token_updated_at: new Date()
      }
    );

    res.json({ success: true, message: 'FCM token registered successfully' });
  } catch (error) {
    console.error('FCM registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Database Schema Example

```javascript
// MongoDB/Mongoose schema
const fcmTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  platform: { type: String, enum: ['ios', 'android', 'web'], required: true },
  deviceId: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

fcmTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
```

## Sending Push Notifications

### Using Expo Push Service

```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotification(userTokens, title, body, data = {}) {
  const messages = [];
  
  for (let pushToken of userTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  
  for (let chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }
  
  return tickets;
}

// Example usage
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { userIds, title, body, data } = req.body;
    
    // Get FCM tokens for users
    const tokens = await FCMToken.find({ 
      userId: { $in: userIds }, 
      isActive: true 
    }).select('token');
    
    const pushTokens = tokens.map(t => t.token);
    
    if (pushTokens.length === 0) {
      return res.json({ message: 'No active tokens found' });
    }
    
    const tickets = await sendPushNotification(pushTokens, title, body, data);
    
    res.json({ 
      success: true, 
      message: `Sent ${tickets.length} notifications` 
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});
```

## Frontend Usage Examples

### Basic Usage in Components

```typescript
import { useNotification } from '@/providers/NotificationProvider';

function MyComponent() {
  const { fcmToken, isInitialized, sendTokenToBackend } = useNotification();
  
  useEffect(() => {
    if (isInitialized && userId) {
      sendTokenToBackend(userId);
    }
  }, [isInitialized, userId]);
  
  return (
    <View>
      <Text>FCM Status: {isInitialized ? 'Ready' : 'Loading...'}</Text>
    </View>
  );
}
```

### Manual Token Refresh

```typescript
// In your user profile or settings
const handleRefreshToken = async () => {
  try {
    const success = await sendTokenToBackend(currentUser.id);
    if (success) {
      alert('Notification settings updated!');
    }
  } catch (error) {
    alert('Failed to update notification settings');
  }
};
```

## Testing Notifications

1. Use the `NotificationTest` component in your app
2. Test local notifications first
3. Test push notifications from your backend
4. Verify notification handling and navigation

## Important Notes

- FCM tokens can change, so refresh them periodically
- Handle token refresh on app updates
- Test on both iOS and Android devices
- Implement proper error handling for network failures
- Consider notification preferences and user consent