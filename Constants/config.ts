// App configuration constants
export const CONFIG = {
  // Dynamic IP configuration - uses IP from env variable
  IP_ADDRESS: process.env.EXPO_PUBLIC_IP_ADDRESS || 'localhost',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || `http://${process.env.EXPO_PUBLIC_IP_ADDRESS || 'localhost'}:3001`,
  
  // Google Play Billing
  GOOGLE_PLAY_LICENSE_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLAY_LICENSE_KEY || '',
  
  // Wallet limits
  MIN_WALLET_AMOUNT: 1,
  MAX_WALLET_AMOUNT: 100000,
  MIN_WITHDRAWAL_AMOUNT: 100,
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  
  // Currency
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  
  // Payment method
  PAYMENT_METHOD: 'google_play_billing'
};

export default CONFIG;