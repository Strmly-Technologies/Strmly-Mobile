# Wallet API Integration

This document outlines the wallet API integration implemented in the Strmly Mobile app.

## Files Created/Modified

### API Layer
- `api/wallet/walletActions.ts` - All wallet-related API calls
- `utils/paymentUtils.ts` - Payment utility functions

### Components
- `app/(dashboard)/wallet/wallet.tsx` - Main wallet page (updated)
- `app/(dashboard)/wallet/_components/useWallet.ts` - Custom hook for wallet operations
- `app/(dashboard)/wallet/_components/WalletButtons.tsx` - Wallet action buttons (updated)
- `app/(dashboard)/wallet/_components/AddMoneyModal.tsx` - Modal for adding money to wallet

### Configuration
- `Constants/config.ts` - App configuration constants

## API Endpoints Integrated

### Wallet Load APIs
- `GET /api/v1/load` - Get wallet details
- `POST /api/v1/load/create-order` - Create wallet load order
- `POST /api/v1/load/verify` - Verify wallet load payment

### Transfer APIs
- `POST /api/v1/transfer-series` - Transfer money for series purchase
- `POST /api/v1/transfer/community-fee` - Transfer community fee

### Transaction APIs
- `GET /api/v1/transactions` - Get transaction history
- `GET /api/v1/gifts` - Get gift history

### Withdrawal APIs
- `POST /api/v1/withdrawal/setup-bank` - Setup bank account
- `POST /api/v1/withdrawal/create` - Create withdrawal request
- `GET /api/v1/withdrawal/history` - Get withdrawal history
- `GET /api/v1/withdrawal/status/:withdrawalId` - Check withdrawal status

## Features Implemented

### 1. Wallet Balance Display
- Real-time wallet balance fetching
- Loading states and error handling
- Automatic refresh after transactions

### 2. Add Money to Wallet
- Quick amount selection (₹100, ₹500, ₹1000, ₹2000, ₹5000)
- Custom amount input
- Payment gateway integration (mock implementation)
- Order creation and payment verification

### 3. Withdraw Money
- Withdrawal request creation
- Balance validation
- Success/error notifications
- Withdrawal history display

### 4. Transaction Management
- Transaction history fetching
- Gift history tracking
- Pagination support

### 5. Error Handling
- Comprehensive error handling for all API calls
- User-friendly error messages
- Loading states for better UX

## Setup Instructions

### 1. Environment Variables
Add these to your `.env` file:
```
EXPO_PUBLIC_API_URL=your_backend_api_url
EXPO_PUBLIC_RAZORPAY_KEY=your_razorpay_key
```

### 2. Authentication Token
Update the token retrieval in `wallet.tsx`:
```typescript
// Replace this line:
const token = "your-auth-token";

// With actual token from your auth context/store:
const { token } = useAuth(); // or however you manage auth
```

### 3. Google Play Billing Integration
The app uses Google Play Billing for wallet recharge payments:

1. Install react-native-iap:
```bash
npm install react-native-iap
```

2. Set up products in Google Play Console (see `docs/GOOGLE_PLAY_BILLING_SETUP.md`)

3. Update `services/googlePlayBilling.ts` with actual implementation:
```typescript
import { initConnection, requestPurchase } from 'react-native-iap';

// Replace mock implementation with actual Google Play Billing calls
```

4. Configure environment variables:
```env
EXPO_PUBLIC_GOOGLE_PLAY_LICENSE_KEY=your_license_key
```

## Usage Examples

### Using the Wallet Hook
```typescript
const { 
  walletData, 
  isLoading, 
  error, 
  fetchWalletDetails,
  createLoadOrder,
  verifyPayment,
  requestWithdrawal 
} = useWallet(token);

// Fetch wallet details
useEffect(() => {
  fetchWalletDetails();
}, []);

// Create withdrawal request
const handleWithdraw = async (amount: number) => {
  try {
    await requestWithdrawal(amount);
    Alert.alert('Success', 'Withdrawal request created');
  } catch (error) {
    Alert.alert('Error', 'Failed to create withdrawal request');
  }
};
```

### Direct API Calls
```typescript
import { getWalletDetails, createWithdrawalRequest } from '@/api/wallet/walletActions';

// Get wallet details
const wallet = await getWalletDetails(token);

// Create withdrawal
const withdrawal = await createWithdrawalRequest(token, 500);
```

## Error Handling

All API calls include comprehensive error handling:
- Network errors
- Authentication errors
- Validation errors
- Server errors

Errors are displayed to users via alerts and can be cleared using the `clearError` function from the wallet hook.

## Security Considerations

1. **Token Management**: Ensure secure token storage and refresh
2. **Payment Verification**: Always verify payments on the server side
3. **Amount Validation**: Validate amounts on both client and server
4. **Rate Limiting**: Implement rate limiting for sensitive operations
5. **Audit Logging**: Log all wallet transactions for audit purposes

## Testing

To test the wallet functionality:
1. Ensure your backend API is running
2. Update the API_BASE_URL in the config
3. Test with valid authentication tokens
4. Use the mock payment gateway for development
5. Test error scenarios (insufficient balance, network errors, etc.)