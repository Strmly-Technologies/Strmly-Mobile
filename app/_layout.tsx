import { Colors } from "@/Constants/Colors";
import { Stack } from "expo-router";
import { Dimensions, useColorScheme } from "react-native";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get('window');

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.navBackground },
              headerTintColor: theme.title,
              headerShown: false,
            }}
          >
            {/* Individual Screens */}
            <Stack.Screen name="index" options={{ title: "Signin" }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(communities)"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
            <Stack.Screen name="(payments)" options={{ headerShown: false }} />
            <Stack.Screen name="(search)" options={{ headerShown: false }} />
            <Stack.Screen name="Profile" options={{ headerShown: false }} />
            <Stack.Screen name="Setting" options={{ headerShown: false }} />
            <Stack.Screen name="studio" options={{ headerShown: false }} />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}