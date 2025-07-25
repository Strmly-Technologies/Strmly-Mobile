import { Colors } from "@/Constants/Colors";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.navBackground },
            headerTintColor: theme.title,
            headerShown: false,
          }}
        >
          {/* Groups */}
          {/* <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} /> */}

          {/* Individual Screens */}
          <Stack.Screen name="index" options={{ title: "Signin" }} />
        </Stack>
      </GestureHandlerRootView>
    </>
  );
}
