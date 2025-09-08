// Google Play Billing Service
import {
  endConnection,
  getProducts,
  initConnection,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  Product,
  Purchase,
  PurchaseError,
} from "react-native-iap";

export interface BillingProduct {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
}

export const WALLET_PRODUCTS = [
  { productId: "add_money_to_wallet_10", amount: 10, price: "₹10" },
  { productId: "add_money_to_wallet_50", amount: 50, price: "₹50" },
  { productId: "add_money_to_wallet_100", amount: 100, price: "₹100" },
  { productId: "add_money_to_wallet_200", amount: 200, price: "₹200" },
  { productId: "add_money_to_wallet_500", amount: 500, price: "₹500" },
];

class GooglePlayBillingService {
  private isInitialized = false;
  private purchaseUpdateSub: any = null;
  private purchaseErrorSub: any = null;

  // keep last purchase for resolve
  private lastPurchase: Purchase | null = null;

  async initialize(): Promise<void> {
    try {
      await initConnection();

      if (!this.purchaseUpdateSub) {
        this.purchaseUpdateSub = purchaseUpdatedListener(
          async (purchase: Purchase) => {
            console.log("Purchase updated:", purchase);
            this.lastPurchase = purchase;

            if (purchase.transactionReceipt) {
              try {
                await finishTransaction({ purchase, isConsumable: true });
                console.log("Transaction finished successfully");
              } catch (err) {
                console.error("finishTransaction error:", err);
              }
            }
          }
        );
      }

      if (!this.purchaseErrorSub) {
        this.purchaseErrorSub = purchaseErrorListener(
          (error: PurchaseError) => {
            console.error("Purchase error:", error);
          }
        );
      }

      this.isInitialized = true;
      console.log("Google Play Billing initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Google Play Billing:", error);
      throw new Error("Failed to initialize Google Play Billing");
    }
  }

  async getProducts(): Promise<BillingProduct[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const products: Product[] = await getProducts({
      skus: WALLET_PRODUCTS.map((p) => p.productId),
    });

    return products.map((p) => ({
      productId: p.productId,
      price: p.localizedPrice ?? p.price ?? "",
      currency: p.currency ?? "",
      title: p.title,
      description: p.description,
    }));
  }

  async purchaseProduct(productId: string): Promise<Purchase> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // ensure product exists
    const products = await getProducts({ skus: [productId] });
    if (!products || products.length === 0) {
      throw new Error(`Product ${productId} not found in Play Console`);
    }

    console.log(`Initiating purchase for product: ${productId}`);
    await requestPurchase({ skus: [productId] });

    // wait for listener to set lastPurchase
    return new Promise<Purchase>((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.lastPurchase) {
          clearInterval(checkInterval);
          const p = this.lastPurchase;
          this.lastPurchase = null; // reset
          resolve(p);
        }
      }, 500);

      // timeout after 30s
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Purchase timed out"));
      }, 30000);
    });
  }

  getProductIdForAmount(amount: number): string {
    const product = WALLET_PRODUCTS.find((p) => p.amount === amount);
    return product ? product.productId : `add_money_to_wallet_${amount}`;
  }

  async cleanup(): Promise<void> {
    try {
      await endConnection();
      this.purchaseUpdateSub?.remove();
      this.purchaseErrorSub?.remove();
      this.purchaseUpdateSub = null;
      this.purchaseErrorSub = null;
      this.isInitialized = false;
      console.log("Google Play Billing connection closed");
    } catch (error) {
      console.error("Failed to cleanup Google Play Billing:", error);
    }
  }
}

export const googlePlayBillingService = new GooglePlayBillingService();
