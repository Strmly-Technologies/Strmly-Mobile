import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import React, { useState } from "react";
import { useFonts } from "expo-font";
import { Signinstyles } from "@/styles/signin";
import {
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { Alert } from "react-native";
import {
  useGoogleAuth,
  BACKEND_API_URL,
  getGoogleClientId,
} from "@/utils/authConfig";
import axios from "axios";

const SignUp = () => {
  const [useEmail, setUseEmail] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/poppins/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../../assets/fonts/poppins/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/poppins/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("../../assets/fonts/poppins/Poppins-Medium.ttf"),
    "Poppins-Light": require("../../assets/fonts/poppins/Poppins-Light.ttf"),
    "Inter-Light": require("../../assets/fonts/inter/Inter-Light.ttf"),
    "Inter-SemiBold": require("../../assets/fonts/inter/Inter-SemiBold.ttf"),
  });

  // Conditionally use Google Auth only if properly configured
  let googleAuth;
  try {
    googleAuth = useGoogleAuth();
  } catch (error) {
    console.warn("Google Auth not properly configured:", error);
    googleAuth = { promptAsync: null, response: null };
  }

  const { promptAsync, response } = googleAuth;

  const registerWithGoogle = async () => {
    if (!promptAsync) {
      Alert.alert("Error", "Google authentication is not properly configured");
      return;
    }

    try {
      const clientId = getGoogleClientId();
      const result = await promptAsync();
      // console.log(clientId, result);

      if (result.type === "success") {
        const id_token = result.authentication?.idToken;

        const res = await axios.post(
          `${BACKEND_API_URL}/auth/register/google`,
          {
            credential: id_token,
            clientId,
            select_by: "user",
          }
        );

        console.log("User registered:", res.data);
        // Store token, navigate, etc.

        const data = res.data;

        if (res.status !== 201) {
          return Alert.alert("Error", data.message || "Google signup failed");
        }

        console.log("Signed in:", data);

        router.replace("/Profile/CreateProfile"); // Navigate after signup
      } else if (result.type === "dismiss") {
        console.log("User dismissed Google login");
      } else {
        console.log("Unexpected result:", result);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong during signup.");
    }
  };

  if (!fontsLoaded) return null;

  return (
    <ThemedView style={Signinstyles.Container} className="px-4">      
      <Image
        source={require("../../assets/images/logo2.png")}
        className="size-20 text-white"
      ></Image>
      {/* <ThemedText style={Signinstyles.Title}> Sign up for Strmly </ThemedText> */}
      <ThemedText style={Signinstyles.Title}> Welcome to Strmly </ThemedText>
      <Text className="text-center text-[#B0B0B0] text-sm justify-center w-60">
        Create a profile in India&apos;s first decrentralized social media
        platform.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/Profile/CreateProfile")}
        style={Signinstyles.button}
      >
        <View className="items-center justify-between w-full px-4">
          {/* <Image
            source={require("../../assets/images/user.png")}
            className="size-7"
          /> */}
          <Text className="text-white text-center text-[20px]">Sign up</Text>
          {/* <View></View> */}
        </View>
      </TouchableOpacity>

            {/* OR */}
            <View className="h-[0.5px] relative text-white w-full items-center justify-center bg-white">
              <Text className="absolute text-white text-lg bg-black p-2">OR</Text>
            </View>

      {/* Sign in button */}
      <TouchableOpacity
        onPress={() => router.push("/(auth)/Sign-in")}
        style={Signinstyles.button}
      >
        <View className="items-center justify-between w-full px-4">
          <Text className="text-white w-full text-center text-[20px]">Sign in</Text>
        </View>
      </TouchableOpacity>

      {/* Google button */}

      {/* <TouchableOpacity
        onPress={registerWithGoogle}
        style={Signinstyles.button}
      >
        <View className="flex-row items-center justify-between w-full px-4">
          <Image
            source={require("../../assets/images/google.png")}
            className="size-7"
          />
          <Text className="text-white text-[16px]">Continue with Google</Text>
          <View></View>
        </View>
      </TouchableOpacity> */}
      <ThemedText style={Signinstyles.Text}>
        By continuing, you agree to Strmly&apos;s
        <Link className="text-blue-500" href={"https://strmly.com/legal/terms"}> Terms of Use </Link>
        and
        <Link className="text-blue-500" href={"https://strmly.com/legal/privacy"}> Privacy Policy.</Link>
      </ThemedText>

      {/* <Link
        href={"/(auth)/Sign-in"}
        className="mt-14"
        style={Signinstyles.Text16R}
      >
        Already have an account?
        <ThemedText style={Signinstyles.Text16M}> Sign in</ThemedText>
      </Link> */}

      <Link
        href={"/(auth)/ForgotPassword"}
        className="mt-14"
        style={Signinstyles.Text16R}
      >
        <ThemedText style={Signinstyles.Text16M}> Forgot Password?</ThemedText>
      </Link>
    </ThemedView>
  );
};

export default SignUp;
// import * as React from "react";
// import { Button, Platform, View, Text, StyleSheet } from "react-native";
// import * as WebBrowser from "expo-web-browser";
// import * as AuthSession from "expo-auth-session";
// import * as Crypto from "expo-crypto";
// import Constants from "expo-constants";

// // This is a necessary boilerplate for the web platform.
// WebBrowser.maybeCompleteAuthSession();

// // The discovery document contains all of Google's OAuth endpoints.
// const discovery = {
//   authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
//   tokenEndpoint: "https://oauth2.googleapis.com/token",
//   revocationEndpoint: "https://oauth2.googleapis.com/revoke",
// };

// export const SignUp = () => {
//   // 1. Select the correct NATIVE Client ID for the platform.
//   //    With development builds, we always use the native client IDs.
//   //    The Web Client ID is no longer needed for mobile sign-in.
//   const clientId = React.useMemo(() => {
//     return Platform.select({
//       ios: Constants.expoConfig?.extra?.googleClientIdIOS,
//       android: Constants.expoConfig?.extra?.googleClientIdAndroid,
//     });
//   }, []);

//   // 2. Configure the deep link redirect URI.
//   //    This uses the "scheme" from your app.config.js. The proxy is no longer used.
//   const redirectUri = AuthSession.makeRedirectUri({
//     scheme: 'strmly', // IMPORTANT: This must match the scheme in your app config.
//     path: 'auth'      // You can add a path for specific routing if needed.
//   });

//   // This log will now show your app's deep link, e.g., "strmly://auth"
//   console.log("EXACT REDIRECT URI:", redirectUri);

//   // 3. Set up the `useAuthRequest` hook.
//   //    The `useProxy` option is now false by default, which is what we want.
//   const [request, response, promptAsync] = AuthSession.useAuthRequest(
//     {
//       clientId: clientId || "", // Fallback to empty string if not loaded
//       scopes: ["openid", "profile", "email"],
//       redirectUri, // This is now your deep link, e.g., "strmly://auth"
//       responseType: "id_token",
//       extraParams: {
//         // A nonce is a random string used to prevent replay attacks.
//         nonce: Crypto.randomUUID(),
//       },
//     },
//     discovery
//   );

//   // 4. Handle the authentication response (NO CHANGE NEEDED HERE).
//   React.useEffect(() => {
//     if (response?.type === "success") {
//       const { id_token } = response.params;
//       if (id_token) {
//         console.log("✅ Authentication successful! Got ID token.");
//         // TODO: Send this id_token to your backend server for verification.
//       }
//     } else if (response?.type === "error") {
//       console.error("❌ Authentication Error:", response.error?.message);
//     }
//   }, [response]);

//   // 5. Render the sign-in button and UI feedback (NO CHANGE NEEDED HERE).
//   return (
//     <View style={styles.container}>
//       <Button
//         title="Sign in with Google"
//         disabled={!request || !clientId}
//         onPress={() => {
//           promptAsync();
//         }}
//       />
//       {!clientId && (
//         <Text style={styles.errorText}>
//           Google Client ID is not configured. Check your app.config.js and .env
//           file.
//         </Text>
//       )}
//     </View>
//   );
// };

// // Basic styling for the component
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   errorText: {
//     color: "red",
//     marginTop: 10,
//     textAlign: "center",
//     paddingHorizontal: 20,
//   },
// });
