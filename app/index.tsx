import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";

export default function Index() {
  const { token, isLoggedIn, user, hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [token, isLoggedIn]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >        
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!hasHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "white", marginTop: 10 }}>Hydrating...</Text>
      </View>
    );
  }

  // Redirect based on authentication status
  if (token && isLoggedIn && !user?.is_onboarded) {
    console.log("✅ User not completed Onboarding, redirecting to Onboarding");
    return <Redirect href="/Interests" />;
  }
  if (token && isLoggedIn) {
    console.log("✅ User is authenticated, redirecting to home");
    return <Redirect href="/(tabs)/home" />;
  } else {
    console.log("❌ User not authenticated, redirecting to sign-in");
    return <Redirect href="/(auth)/Sign-up" />;
  }
}