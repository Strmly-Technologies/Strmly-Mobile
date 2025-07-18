// utils/useVisibleItem.ts
import { useState, useRef } from "react";
import { ViewToken } from "react-native";

export const useVisibleItem = () => {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index ?? 0);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  return { visibleIndex, onViewRef, viewConfigRef };
};
