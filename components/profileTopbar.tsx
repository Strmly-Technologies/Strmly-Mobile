import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MoreHorizontal, LogOut, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router"; // Use useRouter from expo-router
import { useAuthStore } from "@/store/useAuthStore";

interface ProfileTopbarProps {
  hashtag: boolean;
  name: string;
}

const ProfileTopbar = ({ hashtag, name }: ProfileTopbarProps) => {
  // Ensure name is always a string
  const safeName = String(name || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      // Call your logout API route
      // Ensure this is a full URL if your backend is not on the same host/port as your Expo app
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        // credentials: "include" is not directly applicable in React Native fetch for cookies like in web.
        // If your auth relies on tokens, ensure they are cleared on the backend side as well.
      });

      if (!response.ok) {
        // If the backend indicates an issue even after attempting logout
        throw new Error("Logout failed on server side.");
      }

      // Clear the auth store
      logout();

      // Redirect to login page
    //   router.push("/login");
      Alert.alert("Success", "Logged out successfully!"); // Replaced toast.success
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to logout. Please try again."
      ); // Replaced toast.error
    } finally {
      setShowDropdown(false);
    }
  };

  return (
    <View className="mx-4 relative top-6 z-20"> {/* Higher z-index for dropdown */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2" // Add some padding for easier tapping
        >
          <ChevronLeft size={28} color={'white'} className="text-white" />
        </TouchableOpacity>

        <View>
          <Text className="text-lg pr-5 capitalize font-semibold text-white">
            {hashtag && <Text className="text-[#F1C40F]">#</Text>}{safeName}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 relative">
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            className="p-2"
          >
            <MoreHorizontal size={14} color={'white'} />
          </TouchableOpacity>

          {showDropdown && (
            <View className="absolute right-0 mt-12 w-28 bg-white rounded-md shadow-lg z-30">
              <TouchableOpacity
                onPress={handleLogout}
                className="w-full py-2 px-4 flex flex-row items-center justify-end gap-2"
              >
                <LogOut size={16}  color={'black'} />
                <Text className="text-sm text-gray-700">Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ProfileTopbar;