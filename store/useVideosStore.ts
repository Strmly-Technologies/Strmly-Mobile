import { VideoItemType } from "@/types/VideosType";
import { create } from "zustand";

interface VideosState {
  storedVideos: VideoItemType[];
  setVideosInZustand: (videos: VideoItemType[]) => void;
  storeVideo: VideoItemType | null;
  setVideo: (video: VideoItemType | null) => void;
  setVideoType: (type: string | null) => void;
  videoType: string | null;
  appendVideos: (videos: VideoItemType[]) => void;
  clearVideos: () => void;
}

export const useVideosStore = create<VideosState>((set) => ({
  storedVideos: [],
  storeVideo: null,
  videoType: null,

  setVideoType: (type) =>
    set(() => ({
      videoType: type,
    })),

  setVideo: (video) =>
    set(() => ({
      storeVideo: video, // replaces old data with new
    })),

  setVideosInZustand: (videos) =>
    set(() => ({
      storedVideos: [...videos], // replaces old data with new
    })),

  appendVideos: (videos) =>
    set((state) => ({
      storedVideos: [...state.storedVideos, ...videos],
    })),

  clearVideos: () => set({ storedVideos: [] }),
}));
