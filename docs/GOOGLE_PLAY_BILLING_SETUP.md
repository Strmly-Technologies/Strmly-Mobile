# Google Play Billing Setup Guide

This guide explains how to set up Google Play Billing for wallet recharge functionality in the Strmly Mobile app.

## Overview

The app uses Google Play Billing to handle wallet recharge payments. When users want to add money to their wallet, they select an amount and are redirected to Google Play's payment system.

## Files Modified for Google Play Billing

### Core Files
- `utils/paymentUtils.ts` - Updated to use Google Play Billing
- `services/googlePlayBilling.ts` - New service for billing operations
- `api/wallet/walletActions.ts` - Updated verification to handle Google Play purchases
- `app/(dashboard)/wallet/_components/AddMoneyModal.tsx` - Updated UI for Google Play
- `Constants/config.ts` - Added Google Play configuration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install react-native-iap
```

For React Native 0.60+:
```bash
cd ios && pod install
```

### 2. Google Play Console Setup

#### Create In-App Products
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to **Monetize > Products > In-app products**
4. Create the following products:

| Product ID | Price | Title |
|------------|-------|-------|
| `wallet_recharge_100` | ₹100 | Wallet Recharge ₹100 |
| `wallet_recharge_500` | ₹500 | Wallet Recharge ₹500 |
| `wallet_recharge_1000` | ₹1000 | Wallet Recharge ₹1000 |
| `wallet_recharge_2000` | ₹2000 | Wallet Recharge ₹2000 |
| `wallet_recharge_5000` | ₹5000 | Wallet Recharge ₹5000 |

#### Configure Testing
1. Go to **Setup > License testing**
2. Add test accounts for testing purchases
3. Enable **License testing** for development

### 3. Environment Variables

Add to your `.env` file:
```env
EXPO_PUBLIC_API_URL=your_backend_api_url
EXPO_PUBLIC_GOOGLE_PLAY_LICENSE_KEY=your_google_play_license_key
```

### 4. Backend API Updates

Update your backend `/api/v1/load/verify` endpoint to handle Google Play purchases:

```javascript
// Example backend verification
app.post('/api/v1/load/verify', async (req, res) => {
  const { orderId, purchaseToken, signature, paymentMethod } = req.body;
  
  if (paymentMethod === 'google_play_billing') {
    // Verify Google Play purchase
    const isValid = await verifyGooglePlayPurchase(purchaseToken, signature);
    
    if (isValid) {
      // Add money to user's wallet
      await addMoneyToWallet(userId, amount);
      res.json({ message: 'Payment verified', transaction: {...} });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  }
});
```

### 5. Replace Mock Implementation

Update `services/googlePlayBilling.ts` with actual implementation:

```typescript
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  Product,
  Purchase
} from 'react-native-iap';

class GooglePlayBillingService {
  async initialize(): Promise<void> {
    try {
      await initConnection();
      this.isInitialized = true;
    } catch (error) {
      throw new Error('Failed to initialize Google Play Billing');
    }
  }

  async getProducts(): Promise<BillingProduct[]> {
    const productIds = WALLET_PRODUCTS.map(p => p.productId);
    const products = await getProducts({ skus: productIds });
    return products;
  }

  async purchaseProduct(productId: string, orderId: string): Promise<PurchaseResult> {
    const purchase = await requestPurchase({ sku: productId });
    return {
      orderId: orderId,
      purchaseToken: purchase.purchaseToken,
      signature: purchase.signature,
      productId: purchase.productId,
      transactionDate: purchase.transactionDate
    };
  }
}
```

### 6. App-Level Purchase Listeners

Add to your main App component:

```typescript
import { purchaseUpdatedListener, purchaseErrorListener } from 'react-native-iap';

export default function App() {
  useEffect(() => {
    const purchaseUpdateSubscription = purchaseUpdatedListener((purchase: Purchase) => {
      console.log('Purchase successful:', purchase);
      // Handle successful purchase
    });

    const purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.log('Purchase error:', error);
      // Handle purchase error
    });

    return () => {
      purchaseUpdateSubscription?.remove();
      purchaseErrorSubscription?.remove();
    };
  }, []);

  return <YourAppContent />;
}
```

## Testing

### Development Testing
1. Use test accounts configured in Google Play Console
2. Test with actual Google Play Billing (sandbox mode)
3. Verify backend receives correct purchase data

### Production Testing
1. Upload signed APK to Google Play Console
2. Test with internal testing track
3. Verify real payments work correctly

## Flow Diagram

```
User selects amount → AddMoneyModal opens → User clicks "Pay via Google Play"
                                                        ↓
Backend creates order ← API call ← Google Play Billing initiated
                                                        ↓
Google Play payment UI → User completes payment → Purchase successful
                                                        ↓
Backend verifies purchase ← API call ← Purchase token & signature
                                                        ↓
Wallet balance updated → Success message → Modal closes
```

## Error Handling

The implementation handles these error scenarios:
- Google Play Billing initialization failure
- Product not found
- Purchase cancelled by user
- Network errors during verification
- Invalid purchase tokens

## Security Considerations

1. **Server-side verification**: Always verify purchases on your backend
2. **Purchase token validation**: Validate purchase tokens with Google Play API
3. **Signature verification**: Verify purchase signatures
4. **Duplicate purchase prevention**: Check for duplicate purchase tokens
5. **Amount validation**: Validate amounts match product prices

## Troubleshooting

### Common Issues

1. **"Product not found"**
   - Ensure products are created in Google Play Console
   - Check product IDs match exactly
   - Verify app is published (at least to internal testing)

2. **"Purchase failed"**
   - Check test account setup
   - Verify Google Play Services is updated
   - Ensure app is signed with release key for testing

3. **"Verification failed"**
   - Check backend API endpoint
   - Verify purchase token format
   - Ensure signature validation is correct

### Debug Mode

Enable debug logging in development:

```typescript
// In your app initialization
if (__DEV__) {
  console.log('Google Play Billing debug mode enabled');
}
```

## Support

For issues with Google Play Billing:
1. Check [Google Play Billing documentation](https://developer.android.com/google/play/billing)
2. Review [react-native-iap documentation](https://github.com/dooboolab/react-native-iap)
3. Test with Google Play Console's testing tools