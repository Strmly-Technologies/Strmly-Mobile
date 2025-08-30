import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useGiftingStore } from "@/store/useGiftingStore";
import CONFIG from "@/Constants/config";

type created_by = {
  _id: string;
  username: string;
  name?: string;
  profile_photo?: string;
} | null;

type ActionModalProps = {
  isVisible: boolean;
  onClose: (value: boolean) => void;
  creator: created_by;
  amount: number | null;
};

const CommunityPassBuyMessage = ({
  isVisible,
  onClose,
  creator,
  amount
}: ActionModalProps) => {
  const { clearCommunityPassData } = useGiftingStore();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={async () => {
        onClose(false);
        clearCommunityPassData();
      }} // Allows closing with the back button on Android
    >
      {/* Semi-transparent backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={async () => {
          onClose(false);
          clearCommunityPassData();
        }}
      >
        <View className="bg-black border border-gray-700 items-center justify-center rounded-2xl px-2 py-6">
          <View className="rounded-full bg-gray-500">
            <Image
              source={
                creator?.profile_photo
                  ? { uri: creator?.profile_photo }
                  : { uri: CONFIG.DEFAULT_COMMUNITY_PROFILE_PHOTO }
              }
              className="size-16 rounded-full"
            />
          </View>

          {creator?.name && (
            <Text className="text-white text-2xl font-bold text-center mt-5">
              {creator?.name}
            </Text>
          )}

          <Pressable style={styles.modalContainer}>
            <Text className="text-white text-lg text-center">
              Successfully bought the Creator Pass of {creator?.username}
            </Text>
          </Pressable>

          <View className="flex-row items-center justify-center gap-5">
            <Text className="text-white text-6xl text-center">
              ₹{amount}
            </Text>
            <Image
              source={require("../../../../assets/images/successGift.png")}
              className="size-10"
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000000AF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  modalContainer: {
    width: "100%",
    padding: 24,
    alignItems: "center",
  },
});

export default CommunityPassBuyMessage;
