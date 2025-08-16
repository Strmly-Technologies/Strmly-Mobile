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
};

export const useGiftingStore = create<GiftingState>((set) => ({
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

  initiateGifting: (creator, videoId) => {
    set({
      creator,
      videoId,
      hasFetched: false,
      isGifted: false,
      giftSuccessMessage: null,
    });
  },

  initiateVideoAccess: (creator, videoName, videoId) => {
    set({
      creator,
      videoName,
      videoId,
      hasFetched: false,
      isVideoPurchased: false,
      giftSuccessMessage: null,
    });
  },

  initiateCreatorPass: (creator) => {
    set({
      creator,
      hasFetched: false,
      isPurchasedPass: false,
      giftSuccessMessage: null,
    });
  },

  initiateCommunityPass: (creator) => {
    set({
      creator,
      hasFetched: false,
      isPurchasedPass: false,
      giftSuccessMessage: null,
    });
  },

  initiateSeries: (series: series) => {
    set({
      series,
      hasFetched: false,
      isPurchasedSeries: false,
    });
  },

  loadGiftingContext: async () => {
    // TODO: Implement loading gifting context if needed
  },

  fetchGiftingData: async () => {
    // TODO: Implement fetching gifting data if needed
  },

  completeGifting: (amount) => {
    set({
      giftSuccessMessage: amount,
      isGifted: true,
      hasFetched: true,
    });
  },

  completeVideoAccess: (amount) => {
    set({
      giftSuccessMessage: amount,
      isVideoPurchased: true,
      hasFetched: true,
    });
  },

  completePass: (amount) => {
    set({
      giftSuccessMessage: amount,
      isPurchasedPass: true,
      hasFetched: true,
    });
  },

  completeCommunityPass: (amount) => {
    set({
      giftSuccessMessage: amount,
      isPurchasedCommunityPass: true,
      hasFetched: true,
    });
  },

  completeSeriesPurchasing: () => {
    set({
      isPurchasedSeries: true,
      hasFetched: true,
    });
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