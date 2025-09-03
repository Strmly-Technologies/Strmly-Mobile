import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFonts } from "expo-font";
import { Link, router, useNavigation } from "expo-router";

import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { Signinstyles } from "@/styles/signin";
import { CreateProfileStyles } from "@/styles/createprofile";
import { useAuthStore } from "@/store/useAuthStore";
import CONFIG from "@/Constants/config";
import ModalMessage from "@/components/AuthModalMessage";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

const SignIn = () => {
  const [useEmail, setUseEmail] = useState(true);
  const [nameOrEmail, setNameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [needButton, setNeedButton] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState("");

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/poppins/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../../assets/fonts/poppins/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/poppins/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("../../assets/fonts/poppins/Poppins-Medium.ttf"),
    "Poppins-Light": require("../../assets/fonts/poppins/Poppins-Light.ttf"),
    "Inter-Light": require("../../assets/fonts/inter/Inter-Light.ttf"),
    "Inter-SemiBold": require("../../assets/fonts/inter/Inter-SemiBold.ttf"),
  });

  const handleLogin = async () => {
    if (!nameOrEmail || !password) {
      setShowAlert(true);
      setAlert("Please fill in both fields");
      setNeedButton(true);
      return;
    }

    setIsLoading(true);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nameOrEmail);
    const loginType = isEmail ? "email" : "username";

    try {
      const loginUrl = `${CONFIG.API_BASE_URL}/auth/login/${loginType}`;
      console.log("🔗 Login URL:", loginUrl);

      const res = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [loginType]: nameOrEmail, // dynamic key: email or username
          password,
        }),
      });

      if (!res.ok) {
        const errorText: { message: string } = await res.json();
        setAlert(errorText.message || "Something went wrong");
        setShowAlert(() => true);
        setNeedButton(true);
        // throw new Error(`Login failed: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();
      console.log("✅ Login successful:", data);

      // Save in zustand and secure store
      await useAuthStore.getState().login(data.token, data.user);

      setAlert("Login successful!");
      setShowAlert(() => true);
      setNeedButton(false);
      if(data.user.is_onboarded){
        setTimeout(
          () =>
            navigation.reset({
              routes: [{ name: "(tabs)" }],
            }),
          1000
        );
      } else{
        setTimeout(
          () =>
            navigation.reset({
              routes: [{ name: "(InterestsSection)/Interests" }],
            }),
          1000
        );
      }
    } catch (error: any) {
      console.error("Login Error", error);
      setAlert("Something went wrong");
      // setShowAlert(() => true);
      // setNeedButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  const renderTopbar = () => {
    return (
      <Pressable
        onPress={() => router.back()}
        className="absolute left-5 top-10"
      >
        <Image
          source={require("../../assets/images/back.png")}
          className="size-5"
        />
      </Pressable>
      // <Pressable
      //   onPress={() => setUseEmail(false)}
      //   className="absolute left-5 top-20"
      // >
      //   <Image
      //     source={require("../../assets/images/back.png")}
      //     className="size-5"
      //   />
      // </Pressable>
    );
  };

  const renderLogo = () => (
    <Image
      source={require("../../assets/images/logo2.png")}
      className={useEmail ? "size-14" : "size-20"}
    />
  );

  const renderWelcomeText = () => (
    <Text className="text-center text-[#B0B0B0] text-sm w-72">
      Welcome back to India&apos;s first decentralized social media platform.
    </Text>
  );

  const renderTitle = () => (
    <ThemedText style={Signinstyles.Title}>
      {useEmail ? "Sign in to Strmly" : "Sign in for Strmly"}
    </ThemedText>
  );

  const renderSocialOptions = () => (
    <>
      <TouchableOpacity
        onPress={() => setUseEmail(true)}
        style={Signinstyles.button}
      >
        <View className="flex-row items-center justify-between w-full px-4">
          <Image
            source={require("../../assets/images/user.png")}
            className="size-7"
          />
          <Text className="text-white text-[16px]">Use Email</Text>
          <View></View>
        </View>
      </TouchableOpacity>
      {/* <TouchableOpacity
        onPress={() => {
          setAlert("Google Sign-in");
          setShowAlert(true);
        }}
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
    </>
  );

  const renderEmailForm = () => (
    <>
      <TextInput
        style={CreateProfileStyles.Input}
        placeholder="Username or Email"
        className="placeholder:text-[#B0B0B0]"
        value={nameOrEmail}
        onChangeText={setNameOrEmail}
      />
      <TextInput
        style={CreateProfileStyles.Input}
        placeholder="Password"
        className="placeholder:text-[#B0B0B0]"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        disabled={isLoading}
        style={CreateProfileStyles.button}
        onPress={handleLogin}
      >
        {isLoading && <ActivityIndicator className="size-5" />}
        <Text className="text-lg font-semibold">Sign in</Text>
      </TouchableOpacity>
      <View className="">
        <Link href={"/(auth)/ForgotPassword"} className="text-white mt-8">
          <ThemedText style={Signinstyles.Text16M}>
            Forgot password?
          </ThemedText>
        </Link>

        <Link href={"/Profile/VerifyEmail"} className="text-white mt-8">
          <ThemedText style={{...Signinstyles.Text16M, color: '#3b82f6'}}>Verify Email?</ThemedText>
        </Link>
      </View>
    </>
  );

  const renderLink = () => (
    <Link
      className="mt-4"
      href={"/(auth)/Sign-up"}
      style={Signinstyles.Text16R}
    >
      Don't have an account?
      <ThemedText style={Signinstyles.Text16M}> Sign Up</ThemedText>
    </Link>
  );

  return (
    <ThemedView style={Signinstyles.Container} className="px-4">
      {useEmail && renderTopbar()}
      {renderLogo()}
      {renderTitle()}
      {renderWelcomeText()}
      {useEmail ? renderEmailForm() : renderSocialOptions()}
      {useEmail && renderLink()}

      {/* 🔔 Modal overlays the screen */}
      <ModalMessage
        visible={showAlert}
        text={alert}
        needCloseButton={needButton}
        onClose={() => setShowAlert(false)}
      />
    </ThemedView>
  );
};

export default SignIn;
