import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  avatar?: string;
  provider?: string;
  providerAccountId?: string;
  username?: string;
  bio?: string;
  dob?: string;
  is_onboarded?: boolean;
  is_verified?: boolean;
  location?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
  joinedDate?: string;
  interests?: string[];
  profile_photo?: string;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  hasHydrated: boolean;
  setHasHydrated: () => void;
  login: (token: string, user?: User) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
};

// ✅ Custom secure storage with 30-day expiry
const secureStorage: PersistStorage<AuthStore> = {
  getItem: async (key) => {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        await SecureStore.deleteItemAsync(key);
        return null;
      }
      return parsed.state; // Zustand expects `{ state, version }`
    } catch (err) {
      console.error("Failed to parse SecureStore item", err);
      return null;
    }
  },

  setItem: async (key, value) => {
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const payload = JSON.stringify({ state: value, expiresAt });
    await SecureStore.setItemAsync(key, payload);
  },

  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isOnboarded: false,
      hasHydrated: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      login: async (token: string, user?: User) => {
        console.log(`🔐 Auth Store Login:
          - Token received: ${!!token}
          - Token length: ${token?.length || 0}
          - User: ${user?.username || 'No user'}
          - User ID: ${user?.id || 'No ID'}`);
        
        set({
          token,
          user: user || null,
          isLoggedIn: true,
          isOnboarded: user?.is_onboarded || false,
        });
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false, isOnboarded: false });
      },

      setUser: (user: User) => {
        set({
          user,
          isLoggedIn: true,
          isOnboarded: user?.is_onboarded || false,
        });
      },
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
          isOnboarded: state.user?.is_onboarded || false,
        }));
      },
    }),
    {
      name: "auth-storage",
      storage: secureStorage,
      onRehydrateStorage: () => (state) => {
        console.log(`🔄 Auth Store Rehydrated:
          - Has state: ${!!state}
          - Token exists: ${!!state?.token}
          - Token length: ${state?.token?.length || 0}
          - User: ${state?.user?.username || 'No user'}
          - Is logged in: ${state?.isLoggedIn || false}`);
        state?.setHasHydrated();
      },
    }
  )
);
