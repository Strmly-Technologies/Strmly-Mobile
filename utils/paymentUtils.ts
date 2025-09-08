import { googlePlayBillingService } from "@/services/googlePlayBilling";
import { Purchase } from "react-native-iap";

export interface PaymentOrder {
  id?: string;
  amount: number;
  currency: string;
}

export interface GooglePlayBillingResponse {
  orderId?: string;        // make optional
  purchaseToken: string;
  signature?: string;
  productId: string;
}

// Google Play Billing integration using the service
export const initiateGooglePlayBilling = async (
  order: PaymentOrder
): Promise<GooglePlayBillingResponse> => {
  try {
    const productId = googlePlayBillingService.getProductIdForAmount(order.amount);
    console.log("productId", productId);

    if (!productId) {
      throw new Error(`No product mapping found for amount: ${order.amount}`);
    }

    const purchase: Purchase = await googlePlayBillingService.purchaseProduct(productId);
    console.log("Purchase received:", purchase);

    // safely extract Android-specific fields
    const orderId = "orderId" in purchase ? (purchase as any).orderId : undefined;
    const signature = "signature" in purchase ? (purchase as any).signature : undefined;

    if (!purchase.purchaseToken) {
      throw new Error("Invalid purchase result: missing purchaseToken");
    }

    return {
      orderId,
      purchaseToken: purchase.purchaseToken,
      signature,
      productId: purchase.productId || productId,
    };
  } catch (error: any) {
    console.error("[Billing] Error during billing flow:", error);
    throw new Error(error.message || "Google Play Billing failed");
  }
};


// Format currency for display
export const formatCurrency = (
  amount: number,
  currency: string = "INR"
): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Validate payment amount
export const validateAmount = (
  amount: string
): { isValid: boolean; error?: string } => {
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { isValid: false, error: "Please enter a valid amount" };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  if (numAmount < 10) {
    return { isValid: false, error: "Minimum amount is ₹10" };
  }

  if (numAmount > 500) {
    return { isValid: false, error: "Maximum amount is ₹500" };
  }

  return { isValid: true };
};
