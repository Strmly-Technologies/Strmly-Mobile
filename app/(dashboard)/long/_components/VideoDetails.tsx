import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { ChevronDownIcon, Hash, PlusSquare } from "lucide-react-native";

const episodes = [
  "Episode : 01",
  "Episode : 02",
  "Episode : 03",
  "Episode : 04",
  "Episode : 05",
];
const paid = [
  {
    content: "Content access",
    price: "29",
  },
  {
    content: "Creator pass",
    price: "99/month",
  },
];

type VideoDetailsProps = {
  onToggleFullScreen: () => void;
  isFullScreen: boolean;
};

const VideoDetails = ({ onToggleFullScreen, isFullScreen }: VideoDetailsProps) => {
  const [screenIconEffect, setScreenIconEffect] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  return (
    <View className="w-full gap-3">
      {/* Top tags */}
      <View className="flex-row items-center justify-start gap-2">
        <View className="items-center flex-row gap-0.5">
          <Hash color={"white"} size={14} />
          <Text className="text-white">Startup India</Text>
        </View>
        <PlusSquare color={"white"} size={20} />
      </View>

      {/* Username + Paid */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-white font-semibold">Rohith</Text>
          <TouchableOpacity className="border border-white rounded-md px-2">
            <Text className="font-semibold text-sm text-white">Follow</Text>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity
            onPress={() => {
              setShowPriceDropdown((prev) => !prev);
              setShowDropdown(false);
            }}
            className="border border-white rounded-md px-2"
          >
            <Text className="font-semibold text-sm text-white">Paid</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Episode + Fullscreen */}
      <View className="flex-row items-center justify-between relative">
        <View className="flex-row items-center gap-1">
          <Text className="text-white uppercase">Death</Text>
          <TouchableOpacity
            className="border border-white rounded-xl px-2 py-0.5"
            onPress={() => {
              setShowDropdown((prev) => !prev);
              setShowPriceDropdown(false);
            }}
          >
            <View className="flex-row items-center">
              <Text className="font-semibold text-xs text-white mr-1">
                Ep: 0{selectedEpisodeIndex + 1}
              </Text>
              <ChevronDownIcon color={"white"} size={12} />
            </View>
          </TouchableOpacity>
        </View>

        <Pressable onPress={onToggleFullScreen}>
          <Image
            source={require("../../../../assets/images/fullscreen.png")}
            className={`size-4 ${isFullScreen ? "scale-110" : "scale-100"} ease-in-out`}
          />
        </Pressable>

        {/* Paid Dropdown */}
        {showPriceDropdown && (
          <View className="absolute bottom-12 right-0 rounded-xl p-2 w-80">
            {paid.map((sub, idx) => (
              <TouchableOpacity
                key={idx}
                className="mb-0.5"
                onPress={() => {
                  setShowPriceDropdown(false);
                  setShowDropdown(false);
                }}
              >
                <View
                  className={`bg-black h-11 px-2 py-1 flex-row items-center justify-between ${
                    idx == 0 && "rounded-t-xl"
                  } ${idx == paid.length - 1 && "rounded-b-xl"}`}
                >
                  <Text className="text-white text-[16px] flex-row items-center">
                    {sub.content}
                  </Text>
                  <Text className="text-white text-[16px]">₹{sub.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Episode Dropdown */}
        {showDropdown && (
          <View className="absolute bottom-3 left-11 rounded-xl p-2 w-56">
            {episodes.map((ep, idx) => (
              <TouchableOpacity
                key={idx}
                className="mb-0.5"
                onPress={() => {
                  setSelectedEpisodeIndex(idx);
                  setShowDropdown(false);
                }}
              >
                <View
                  className={`bg-black px-2 py-1 flex-row items-center ${
                    idx == 0 && "rounded-t-xl"
                  } ${idx == episodes.length - 1 && "rounded-b-xl"} ${selectedEpisodeIndex === idx && "gap-2"}`}
                >
                  <Text className="text-white text-[18px] flex-row items-center">
                    {ep}
                  </Text>
                  {selectedEpisodeIndex === idx && (
                    <Text className="text-white">✔</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default VideoDetails;
