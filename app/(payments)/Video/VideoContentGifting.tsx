import ThemedView from "@/components/ThemedView";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import CreatorInfo from "./_components/CreatorInfo";

type CreatorData = {
  creatorProfile: string;
  creatorName: string;
  creatorUsername: string;
};

const VideoContentGifting = ({
  creatorProfile,
  creatorName,
  creatorUsername,
}: CreatorData) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (text: string) => {
    const filtered = text.replace(/[^0-9]/g, "");
    setAmount(filtered);
  };

  const handleProceed = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    Keyboard.dismiss();
  };

  return (
    <ThemedView className="flex-1 bg-black">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between px-5 py-6">
            {/* Top section */}
            <View className="mt-10">
              <CreatorInfo
                profile={creatorProfile}
                name={creatorName}
                username={creatorUsername}
              />
            </View>

            {/* Middle section */}
            <View className="gap-2 flex-row items-center justify-center">
              <Text className="text-2xl text-white">₹</Text>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                returnKeyType={Platform.OS === "ios" ? "done" : "none"}
                placeholder="0"
                className="text-3xl text-white placeholder:text-white font-semibold items-center justify-center"
              />
            </View>

            {/* Bottom section - This will move up with keyboard */}
            <View className="gap-2 justify-end">
              <Pressable disabled={loading || !amount} onPress={handleProceed}>
                <View className="bg-[#008A3C] p-4 rounded-lg items-center justify-center">
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 18 }}>Proceed</Text>
                  )}
                </View>
              </Pressable>

              <View className="items-center justify-center mt-1">
                <Text className="text-white text-sm">Total balance ₹10</Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default VideoContentGifting;
