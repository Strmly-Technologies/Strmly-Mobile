import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useGiftingStore } from "@/store/useGiftingStore";

type series = {
  _id: string;
  title: string;
  type: string;
  price: number;
  created_by: {
    _id:string;
    username: string;
    name?: string;
    profile_photo?: string;
  }
} | null;

type ActionModalProps = {
  isVisible: boolean;
  onClose: (value: boolean) => void;
  series: series;
};

const SeriesPurchaseMessage = ({
  isVisible,
  onClose,
  series,
}: ActionModalProps) => {
  const { clearSeriesData } = useGiftingStore();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={async () => {
        onClose(false);
        clearSeriesData();
      }} // Allows closing with the back button on Android
    >
      {/* Semi-transparent backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={async () => {
          onClose(false);
          clearSeriesData();
        }}
      >
        <View className="bg-black border border-gray-800 items-center justify-center rounded-2xl px-2 py-6">
          <View className="rounded-full bg-gray-500">
            <Image
              source={
                series?.created_by?.profile_photo
                  ? { uri: series?.created_by?.profile_photo }
                  : require("../../../../assets/images/user.png")
              }
              className="size-16 rounded-full"
            />
          </View>

          {series?.created_by?.name && (
            <Text className="text-white text-2xl font-bold text-center mt-5">
              {series?.created_by?.name}
            </Text>
          )}

          <Pressable style={styles.modalContainer}>
            <Text className="text-white text-lg text-center">
              Successfully bought the {series?.title} series of {series?.created_by?.username}
            </Text>
          </Pressable>

          <View className="flex-row items-center justify-center gap-5">
            <Text className="text-white text-6xl text-center">₹{series?.price}</Text>
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

export default SeriesPurchaseMessage;
