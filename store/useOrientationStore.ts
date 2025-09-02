import { create } from "zustand";
import * as ScreenOrientation from "expo-screen-orientation";

interface OrientationState {
  isLandscape: boolean;
  setOrientation: (orientation: boolean) => void;
}

let subscription: ScreenOrientation.Subscription | null = null;

export const useOrientationStore = create<OrientationState>((set) => ({
  isLandscape: false,

  setOrientation: (orientation)=> {
    set({
        isLandscape: orientation
    })
  }

}));