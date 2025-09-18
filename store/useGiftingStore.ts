import { create } from "zustand";

type creator = {
  _id: string;
  username: string;
  name?: string;
  profile_photo: string;
};

type series = {
  _id: string;
  title: string;
  type: string;
  price: number;
  total_episodes?: number;
  episodes?: [];
} | null;

type GiftingState = {
  isGifted: boolean;
  isVideoPurchased: boolean;
  isPurchasedPass: boolean;
  isPurchasedSeries: boolean;
  isPurchasedCommunityPass: boolean;
  giftSuccessMessage: number | null;
  hasFetched: boolean;
  creator: creator | null;
  videoName: string | null;
  series: series;
  videoId: string | null;
  purchaseSuccessCallback?: () => void; // Add this to the type definition
  initiateGifting: (creator: creator, videoId: string) => Promise<void>;
  initiateVideoAccess: (creator: creator, videoName: string, videoId: string) => Promise<void>;
  initiateCreatorPass: (creator: creator) => Promise<void>;
  initiateCommunityPass: (creator: creator) => Promise<void>;
  initiateSeries: (series: series) => void;
  loadGiftingContext: () => Promise<void>;
  fetchGiftingData: () => Promise<void>;
  completeGifting: (amount: number) => Promise<void>;
  completeVideoAccess: (amount: number) => Promise<void>;
  completePass: (amount: number) => Promise<void>;
  completeCommunityPass: (amount: number) => Promise<void>;
  completeSeriesPurchasing: () => void;
  clearGiftingData: () => void;
  clearVideoAccessData: () => void;
  clearPassData: () => void;
  clearSeriesData: () => void;
  clearCommunityPassData: () => void;
  setPurchaseSuccessCallback: (callback: () => void) => void; // Add this to type
  triggerPurchaseSuccess: () => void; // Add this to type
};

export const useGiftingStore = create<GiftingState>((set, get) => ({
  isGifted: false,
  isVideoPurchased: false,
  isPurchasedPass: false,
  isPurchasedSeries: false,
  isPurchasedCommunityPass: false,
  giftSuccessMessage: null,
  hasFetched: false,
  creator: null,
  videoName: null,
  series: null,
  videoId: null,
  purchaseSuccessCallback: undefined,

  initiateGifting: async (creator, videoId) => {
    const state = get();
    state.clearGiftingData();

    set({
      creator,
      videoId,
      hasFetched: false,
      isGifted: false,
      giftSuccessMessage: null,
    });
  },

  initiateVideoAccess: async (creator, videoName, videoId) => {
    const state = get();
    state.clearVideoAccessData();

    set({
      creator,
      videoName,
      videoId,
      hasFetched: false,
      isVideoPurchased: false,
      giftSuccessMessage: null,
    });
  },

  initiateCreatorPass: async (creator) => {
    const state = get();
    state.clearPassData();

    set({
      creator,
      hasFetched: false,
      isPurchasedPass: false,
      giftSuccessMessage: null,
    });
  },

  initiateCommunityPass: async (creator) => {
    const state = get();
    state.clearCommunityPassData();

    set({
      creator,
      hasFetched: false,
      isPurchasedCommunityPass: false,
      giftSuccessMessage: null,
    });
  },

  initiateSeries: (series: series) => {
    const state = get();
    state.clearSeriesData();

    set({
      series,
      hasFetched: false,
      isPurchasedSeries: false,
    });
  },

  setPurchaseSuccessCallback: (callback) => {
    set({ purchaseSuccessCallback: callback });
  },

  triggerPurchaseSuccess: () => {
    const state = get();
    if (state.purchaseSuccessCallback) {
      state.purchaseSuccessCallback();
    }
  },

  loadGiftingContext: async () => {
    // TODO: Implement loading gifting context if needed
  },

  fetchGiftingData: async () => {
    // TODO: Implement fetching gifting data if needed
  },

  completeGifting: async (amount) => {
    set({
      giftSuccessMessage: amount,
      isGifted: true,
      hasFetched: true,
    });
  },

  completeVideoAccess: async (amount) => {
    set({
      giftSuccessMessage: amount,
      isVideoPurchased: true,
      hasFetched: true,
    });
    
    // Trigger purchase success callback
    const state = get();
    state.triggerPurchaseSuccess();
  },

  completePass: async (amount) => {
    set({
      giftSuccessMessage: amount,
      isPurchasedPass: true,
      hasFetched: true,
    });
    
    const state = get();
    state.triggerPurchaseSuccess();
  },

  completeCommunityPass: async (amount) => {
    set({
      giftSuccessMessage: amount,
      isPurchasedCommunityPass: true,
      hasFetched: true,
    });
    
    const state = get();
    state.triggerPurchaseSuccess();
  },

  completeSeriesPurchasing: () => {
    set({
      isPurchasedSeries: true,
      hasFetched: true,
    });
    
    const state = get();
    state.triggerPurchaseSuccess();
  },

  clearGiftingData: () => {
    set({
      isGifted: false,
      giftSuccessMessage: null,
      hasFetched: false,
      creator: null,
      videoId: null,
    });
  },

  clearVideoAccessData: () => {
    set({
      isVideoPurchased: false,
      giftSuccessMessage: null,
      hasFetched: false,
      creator: null,
      videoId: null,
      videoName: null
    });
  },

  clearPassData: () => {
    set({
      isPurchasedPass: false,
      giftSuccessMessage: null,
      hasFetched: false,
      creator: null,
    });
  },

  clearCommunityPassData: () => {
    set({
      isPurchasedCommunityPass: false,
      giftSuccessMessage: null,
      hasFetched: false,
      creator: null,
    });
  },

  clearSeriesData: () => {
    set({
      isPurchasedSeries: false,
      hasFetched: false,
      creator: null,
      series: null,
    });
  },
}));