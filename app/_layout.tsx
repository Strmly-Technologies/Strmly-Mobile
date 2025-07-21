import { Colors } from "@/Constants/Colors";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import '../global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark'
  const theme = Colors[colorScheme]

  return (
    <>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.title,
        headerShown: false,
      }}>

        {/* Groups */}
        {/* <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} /> */}

        {/* Individual Screens */}
        <Stack.Screen name="index" options={{ title: "Signin" }} />
      </Stack>
    </>
  )
}