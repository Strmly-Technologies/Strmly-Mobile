import { Image, Pressable, Text, View } from "react-native";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";

const InteractOptions = () => {
  const [liked, setLiked] = useState(false);

  return (
    <View className="p-1">
      <View className="gap-5">
        <View className="items-center gap-1">
          <Pressable onPress={() => setLiked(!liked)}>
            <FontAwesome
              name={liked ? "heart" : "heart-o"}
              size={28}
              color={liked ? "red" : "white"}
            />
          </Pressable>

          <Text className="text-white text-sm">10K</Text>
        </View>

        <View className="items-center gap-1">
          <Image
            className="size-7"
            source={require("../../../../assets/images/comments.png")}
          />
          <Text className="text-white text-sm">120K</Text>
        </View>

        <View className="items-center gap-1">
          <Image
            className="size-7"
            source={require("../../../../assets/images/repost.png")}
          />
          <Text className="text-white text-sm">999</Text>
        </View>

        <View className="items-center gap-1">
          <Pressable onPress={() => alert("Donate")}>
            <Image
              className="size-7"
              source={require("../../../../assets/images/rupee.png")}
            />
          </Pressable>
          <Text className="text-white text-sm">100</Text>
        </View>
      </View>
    </View>
  );
};

export default InteractOptions;
