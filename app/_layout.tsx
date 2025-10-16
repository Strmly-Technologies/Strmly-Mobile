import { Colors } from "@/Constants/Colors";
import { router, Stack, usePathname } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  View,
} from "react-native";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useOrientationStore } from "@/store/useOrientationStore";
import * as ScreenOrientation from "expo-screen-orientation";
import BottomNavBar from "@/components/BottomNavBar";
import { useLinkingURL } from "expo-linking";

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const { setOrientation, isLandscape } = useOrientationStore();
  const pathname = usePathname();
  const url = useLinkingURL();

  useEffect(() => {
    // let url = 'strmly://(dashboard)/ShareVideos/video/68ee9ecbf5b93d68d154e8cd';
    if (url) {
      const parsed = new URL(url);
      const pathname = parsed.pathname; // e.g., /video/68ee9ecbf5b93d68d154e8cd
      console.log("pathname", pathname);
      const id = pathname.split("/").pop() ?? "";
      if (pathname.startsWith("/ShareVideos")) {
        setTimeout(() => {
          router.push({
            pathname: "/(dashboard)/ShareVideos/video/[id]",
            params: { id },
          });
        }, 100);
      }
    }
  }, [url]);

  useEffect(() => {
    console.log("pathname : ", pathname);
    const lockOrientation = async () => {
      if (
        pathname !== "/(dashboard)/long/VideosFeed" ||
        "/(dashboard)/long/GlobalVideoPlayer"
      ) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        setOrientation(false);
      }
    };

    lockOrientation();
  }, [pathname]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "black" }}
        edges={isLandscape ? ["right", "left"] : ["bottom"]}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={{ flex: 1 }}>
              {/* Routed Screens */}
              <Stack
                // style={{ flex: 1 }}
                screenOptions={{
                  headerStyle: { backgroundColor: theme.navBackground },
                  headerTintColor: theme.title,
                  headerShown: false,
                }}
              >
                <Stack.Screen name="index" options={{ title: "Signin" }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </View>
          </KeyboardAvoidingView>

          {/* Bottom Navigation */}
          {!isLandscape && (
            <SafeAreaView edges={[]} style={{ backgroundColor: "black" }}>
              <BottomNavBar />
            </SafeAreaView>
          )}
        </GestureHandlerRootView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
