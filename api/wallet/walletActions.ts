// Wallet API Actions
import { CONFIG } from '@/Constants/config';

const API_BASE_URL = CONFIG.API_BASE_URL;
console.log('Wallet API Base URL:', API_BASE_URL);

// Types
export interface WalletBalance {
  id: string;
  balance: number;
  currency: string;
  type: string;
  status: string;
  totalLoaded: number;
  totalSpent: number;
  totalReceived: number;
  lastTransactionAt: string;
  recentTransfers: any[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  status: string;
}

export interface BankAccount {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

// Wallet Load APIs
export const getWalletDetails = async (token: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/wallet`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const responseText = await res.text();
    console.log('Wallet details raw response:', responseText);

    if (!res.ok) {
      let errorMessage = "Failed to get wallet details";
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.message || errorMessage;
      } catch (parseError) {
        errorMessage = `HTTP ${res.status}: ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error('getWalletDetails error:', error);
    throw error;
  }
};

export const createWalletLoadOrder = async (token: string, amount: number) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/load/create-order`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ amount })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create load order");
  }

  return await res.json();
};

export const verifyWalletLoad = async (
  token: string, 
  orderId: string, 
  purchaseToken: string, 
  signature: string
) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/load/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ 
      orderId, 
      purchaseToken, 
      signature,
      paymentMethod: 'google_play_billing'
    })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Google Play Billing verification failed");
  }

  return await res.json();
};

// Transfer APIs
export const transferForSeries = async (token: string, seriesId: string, amount: number) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/transfer-series`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ seriesId, amount })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Transfer failed");
  }

  return await res.json();
};

export const transferCommunityFee = async (token: string, communityId: string, amount: number) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/transfer/community-fee`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ communityId, amount })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Transfer failed");
  }

  return await res.json();
};

// Transaction History APIs
export const getTransactionHistory = async (
  token: string, 
  page: number = 1, 
  limit: number = 10
) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/transactions?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to get transaction history");
  }

  return await res.json();
};

export const getGiftHistory = async (
  token: string, 
  page: number = 1, 
  limit: number = 10
) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/gifts?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to get gift history");
  }

  return await res.json();
};

// Withdrawal APIs
export const setupBankAccount = async (
  token: string, 
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  }
) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/withdrawal/setup-bank`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(bankDetails)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Invalid bank details");
  }

  return await res.json();
};

export const createWithdrawalRequest = async (token: string, amount: number) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/withdrawal/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ amount })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create withdrawal request");
  }

  return await res.json();
};

export const getWithdrawalHistory = async (
  token: string, 
  page: number = 1, 
  limit: number = 10
) => {
  // Endpoint doesn't exist yet, return empty data
  console.log('Withdrawal history endpoint not implemented yet');
  return {
    success: true,
    withdrawals: [],
    pagination: { page, limit, total: 0 }
  };
};

export const getWithdrawalStatus = async (token: string, withdrawalId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/withdrawal/status/${withdrawalId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Withdrawal not found");
  }

  return await res.json();
};