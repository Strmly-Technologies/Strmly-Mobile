import { Image, Text, View } from "react-native";
import React from "react";

const CommonTopBar = () => {
  return (
    <View className="flex-row items-center justify-between">
      <Image source={require('../assets/images/back.png')} alt='back-button' style={{ width: 12, height: 22.67 }} />

      <Text className="text-[20px] text-center font-medium text-white">My wallet</Text>

      <Text> </Text>
    </View>
  );
};

export default CommonTopBar;
