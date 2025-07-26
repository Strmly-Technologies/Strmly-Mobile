// Payment utility functions for Google Play Billing integration
import { googlePlayBillingService } from '@/services/googlePlayBilling';

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface GooglePlayBillingResponse {
  orderId: string;
  purchaseToken: string;
  signature: string;
  productId: string;
}

// Google Play Billing integration using the service
export const initiateGooglePlayBilling = async (order: PaymentOrder): Promise<GooglePlayBillingResponse> => {
  try {
    // Get the product ID for the amount
    const productId = googlePlayBillingService.getProductIdForAmount(order.amount);
    
    // Purchase the product
    const purchaseResult = await googlePlayBillingService.purchaseProduct(productId, order.id);
    
    return {
      orderId: purchaseResult.orderId,
      purchaseToken: purchaseResult.purchaseToken,
      signature: purchaseResult.signature,
      productId: purchaseResult.productId
    };
  } catch (error: any) {
    throw new Error(error.message || 'Google Play Billing failed');
  }
};

// Real Google Play Billing implementation would look like this:
/*
import { 
  initConnection, 
  purchaseUpdatedListener, 
  purchaseErrorListener,
  requestPurchase,
  Product,
  Purchase
} from 'react-native-iap';

export const initiateGooglePlayBilling = async (order: PaymentOrder): Promise<GooglePlayBillingResponse> => {
  try {
    // Initialize connection
    await initConnection();
    
    // Set up listeners
    const purchaseUpdateSubscription = purchaseUpdatedListener((purchase: Purchase) => {
      // Handle successful purchase
      return {
        orderId: order.id,
        purchaseToken: purchase.purchaseToken,
        signature: purchase.signature,
        productId: purchase.productId
      };
    });

    const purchaseErrorSubscription = purchaseErrorListener((error) => {
      throw new Error(error.message);
    });

    // Request purchase
    await requestPurchase({
      sku: `wallet_recharge_${order.amount}`,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });

  } catch (error) {
    throw new Error('Google Play Billing failed');
  }
};
*/

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Validate payment amount
export const validateAmount = (amount: string): { isValid: boolean; error?: string } => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid amount' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (numAmount < 1) {
    return { isValid: false, error: 'Minimum amount is ₹1' };
  }
  
  if (numAmount > 100000) {
    return { isValid: false, error: 'Maximum amount is ₹1,00,000' };
  }
  
  return { isValid: true };
};