import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import React, { useState, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import { useFonts } from "expo-font";
import { CreateProfileStyles } from "@/styles/createprofile";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";

const CreateProfile = () => {
  const [Step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  const [usernameExists, setUsernameExists] = useState<boolean | null>(null);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);

  const [otp, setOtp] = useState("");

  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/poppins/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../../assets/fonts/poppins/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/poppins/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("../../assets/fonts/poppins/Poppins-Medium.ttf"),
    "Poppins-Light": require("../../assets/fonts/poppins/Poppins-Light.ttf"),
    "Inter-Light": require("../../assets/fonts/inter/Inter-Light.ttf"),
    "Inter-SemiBold": require("../../assets/fonts/inter/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../../assets/fonts/inter/Inter-Bold.ttf"),
    "Inter-ExtraBold": require("../../assets/fonts/inter/Inter-ExtraBold.ttf"),
  });

  const checkUsername = useCallback(
    throttle(async (uname: string) => {
      try {
        console.log(`Checking username: ${uname} at ${CONFIG.API_BASE_URL}/api/v1/auth/check-username/${uname}`);

        const res = await fetch(
          `${CONFIG.API_BASE_URL}/api/v1/auth/check-username/${uname}`
        );

        console.log(`Response status: ${res.status}`);
        console.log(`Response headers:`, res.headers);

        if (!res.ok) {
          console.error(`HTTP error! status: ${res.status}`);
          setUsernameExists(null);
          return;
        }

        const responseText = await res.text();
        console.log(`Raw response: ${responseText}`);

        if (!responseText) {
          console.error("Empty response from server");
          setUsernameExists(null);
          return;
        }

        const data = JSON.parse(responseText);
        console.log(`Parsed data:`, data);
        setUsernameExists(data.exists);
      } catch (err) {
        console.error("Username check failed", err);
        setUsernameExists(null);
      }
    }, 1000),
    []
  );

  const checkEmail = useCallback(
    throttle(async (emailVal: string) => {
      try {
        console.log(`Checking email: ${emailVal} at ${CONFIG.API_BASE_URL}/api/v1/auth/check-email/${emailVal}`);

        const res = await fetch(
          `${CONFIG.API_BASE_URL}/api/v1/auth/check-email/${emailVal}`
        );

        console.log(`Email check response status: ${res.status}`);

        if (!res.ok) {
          console.error(`HTTP error! status: ${res.status}`);
          setEmailExists(null);
          return;
        }

        const responseText = await res.text();
        console.log(`Email check raw response: ${responseText}`);

        if (!responseText) {
          console.error("Empty response from server");
          setEmailExists(null);
          return;
        }

        const data = JSON.parse(responseText);
        console.log(`Email check parsed data:`, data);
        setEmailExists(data.exists);
      } catch (err) {
        console.error("Email check failed", err);
        setEmailExists(null);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    if (username.length > 3) checkUsername(username);
  }, [username]);

  useEffect(() => {
    if (email.includes("@")) checkEmail(email);
  }, [email]);

  const handleRegisterUser = async () => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error messages
        if (data?.message?.includes("email")) {
          throw new Error("Failed to send verification email. Please check your email address and try again.");
        }
        throw new Error(data?.message || "Registration failed");
      }

      console.log("Registration successful", data);

      // Save token and partially registered user
      await useAuthStore.getState().login(data.token, data.user);

      // Debug: Log the token that was saved
      console.log('=== REGISTRATION SUCCESS ===');
      console.log('Token received:', data.token);
      console.log('Token length:', data.token?.length);
      console.log('User data:', data.user);
      console.log('Auth store state after login:', useAuthStore.getState());
      console.log('===========================');

      alert("OTP sent to your email. Please check your inbox and spam folder.");
      setTimeout(() => setStep(4), 1000);
    } catch (err: any) {
      console.error("Registration error:", err);

      // Show user-friendly error messages
      if (err.message.includes("email")) {
        alert("Email service is currently unavailable. Please try again later or contact support.");
      } else {
        alert(err.message || "Registration failed. Please try again.");
      }
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/v1/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otp,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Verification failed");
      }

      console.log("Verification successful", data);

      // Update auth store to mark email_verified
      useAuthStore.getState().updateUser({ isVerified: true });

      alert("Email verified successfully!");
      setTimeout(() => router.replace("/(dashboard)/long/VideoFeed"), 1000); // or push to dashboard if already logged in
    } catch (err: any) {
      console.error("OTP Verification error:", err);
      alert(err.message || "Something went wrong");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      setIsLoading(true);

      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/v1/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "RATE_LIMITED") {
          Alert.alert("Too Many Requests", data.message);
          setCooldown(60); // Start cooldown
        } else if (data.code === "ALREADY_VERIFIED") {
          Alert.alert("Already Verified", data.message);
        } else {
          Alert.alert(
            "Resend Failed",
            data.message || "Please try again later"
          );
        }
        return;
      }

      Alert.alert(
        "OTP Sent",
        "A new verification code was sent to your email."
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | number;

    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const HandleStep = (next: boolean) => {
    if (!next) {
      setStep((prev) => Math.max(prev - 1, 1));
      return;
    }

    // validation for each step
    if (Step === 1) {
      if (!username || username.length <= 3) {
        alert("Username must be at least 4 characters");
        return;
      }

      if (usernameExists === true) {
        alert("Username already exists");
        return;
      }

      if (usernameExists === null) {
        alert("Checking username... please wait");
        return;
      }
    }

    if (Step === 2 && password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (Step === 3) {
      if (!email.includes("@") || email.length < 5) {
        alert("Please enter a valid email");
        return;
      }

      if (emailExists === true) {
        alert("Email already exists");
        return;
      }

      if (emailExists === null) {
        alert("Checking email... please wait");
        return;
      }
    }

    if (Step === 4 && confirmationCode.trim().length < 4) {
      alert("Invalid confirmation code");
      return;
    }

    setStep((prev) => prev + 1);
  };

  if (!fontsLoaded) return null;

  if (Step === 1) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full pt-20 px-4 mb-10">
          <TouchableOpacity onPress={() => router.push("/(auth)/Sign-up")}>
            <Image
              className="w-5 h-5 mt-1"
              source={require("../../assets/images/back.png")}
            />
          </TouchableOpacity>
          <ThemedText className="text-white text-2xl text-center w-full">
            Create username
          </ThemedText>
        </View>
        <TextInput
          style={CreateProfileStyles.Input}
          placeholder="username"
          className="placeholder:text-[#B0B0B0]"
          value={username}
          onChangeText={setUsername}
        />

        {username.length > 3 && usernameExists === false && (
          <Text className="text-green-500">Username available</Text>
        )}
        {usernameExists && (
          <Text className="text-red-500">Username already exists</Text>
        )}

        <TouchableOpacity
          onPress={() => HandleStep(true)}
          style={CreateProfileStyles.button}
        >
          <Text className="font-semibold text-lg">Continue</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (Step === 2) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full pt-20 px-4 mb-10">
          <TouchableOpacity onPress={() => HandleStep(false)} className="w-fit">
            <Image
              className="w-5 h-5"
              source={require("../../assets/images/back.png")}
            />
          </TouchableOpacity>
          <ThemedText className="text-white text-2xl text-center w-full">
            Create a password
          </ThemedText>
        </View>
        <TextInput
          style={CreateProfileStyles.Input}
          placeholder="Password"
          className="placeholder:text-[#B0B0B0]"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() => HandleStep(true)}
          style={CreateProfileStyles.button}
        >
          <Text className="font-semibold text-lg">Continue</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (Step === 3) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full pt-20 px-4 mb-10">
          <TouchableOpacity onPress={() => HandleStep(false)} className="w-fit">
            <Image
              className="w-5 h-5"
              source={require("../../assets/images/back.png")}
            />
          </TouchableOpacity>
          <ThemedText className="text-white text-2xl text-center w-full">
            Enter your email
          </ThemedText>
        </View>
        <TextInput
          style={CreateProfileStyles.Input}
          placeholder="Email"
          className="placeholder:text-[#B0B0B0]"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TouchableOpacity
          onPress={handleRegisterUser}
          style={CreateProfileStyles.button}
        >
          <Text className="font-semibold text-lg">Verify</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (Step === 4) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full pt-20 px-4 mb-10">
          <TouchableOpacity onPress={() => HandleStep(false)}>
            <Image
              className="w-5 h-5 mt-1"
              source={require("../../assets/images/back.png")}
            />
          </TouchableOpacity>
          <ThemedText className="text-white text-2xl text-center w-full">
            Verify email
          </ThemedText>
        </View>
        <ThemedText style={CreateProfileStyles.Text}>
          Enter the confirmation code that we sent to {email}
        </ThemedText>

        <TextInput
          style={CreateProfileStyles.Input}
          className="placeholder:text-[#B0B0B0]"
          value={otp}
          onChangeText={setOtp}
          placeholder="Enter 6-digit OTP"
        />

        <TouchableOpacity
          onPress={handleVerifyOTP}
          style={CreateProfileStyles.button}
        >
          <Text className="font-semibold text-lg">Finish</Text>
        </TouchableOpacity>

        <Text
          className={`text-base ${cooldown > 0 ? "text-gray-400" : "text-blue-600"}`}
        >
          {cooldown > 0 ? `Try again in ${cooldown}s` : "Resend OTP"}
        </Text>

        <TouchableOpacity onPress={handleResend}>
          <ThemedText style={CreateProfileStyles.ExtraBold}>
            Resend Code
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return "Internal Error, Try restarting the app.";
};

export default CreateProfile;