import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import React, { useState, useEffect, useCallback } from "react";
import throttle from "lodash.throttle";
import { useFonts } from "expo-font";
import { CreateProfileStyles } from "@/styles/createprofile";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import ModalMessage from "@/components/AuthModalMessage";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import { useNavigation } from "expo-router";

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

  const [needButton, setNeedButton] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState("");

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

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

  const checkUsername = useCallback(
    throttle(async (uname: string) => {
      try {
        const res = await fetch(
          `${BACKEND_API_URL}/auth/check-username/${uname}`
        );
        const data = await res.json();
        setUsernameExists(data.exists);
      } catch (err) {
        console.error("Username check failed", err);
      }
    }, 1000),
    []
  );

  const checkEmail = useCallback(
    throttle(async (emailVal: string) => {
      try {
        const res = await fetch(
          `${BACKEND_API_URL}/auth/check-email/${emailVal}`
        );
        const data = await res.json();
        setEmailExists(data.exists);
      } catch (err) {
        console.error("Email check failed", err);
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

  const handleRegisterEmail = async () => {
    setIsLoading(true);
    console.log(email);
    try {
      const res = await fetch(`${BACKEND_API_URL}/auth/register/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Email Registration failed");
      }

      console.log("Email Registration successful", data);

      setAlert("OTP sent to your email.");
      setShowAlert(true);
      setNeedButton(true);
      setTimeout(() => setStep(2), 1000);
    } catch (err: any) {
      console.error("Email Registration error:", err);
      setAlert(err.message || "Something went wrong");
      setShowAlert(true);
      setNeedButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterUser = async () => {
    setIsLoading(true);
    console.log(email, username, password);
    try {
      const res = await fetch(`${BACKEND_API_URL}/auth/register/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Registration failed");
      }

      console.log("Registration successful", data);

      // Save token and partially registered user
      await useAuthStore.getState().login(data.token, data.user);

      setAlert("Registration successful.");
      setShowAlert(true);
      setNeedButton(false);

      setTimeout(
        () =>
          navigation.reset({
            routes: [{ name: "(InterestsSection)/Interests" }],
          }),
        1000
      );
    } catch (err: any) {
      console.error("Registration error:", err);
      setAlert(err.message || "Something went wrong");
      setShowAlert(true);
      setNeedButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Verification failed");
      }

      console.log("Verification successful", data);

      // Update auth store to mark email_verified
      useAuthStore.getState().updateUser({ is_verified: true });

      setAlert("Email verified successfully!");
      setShowAlert(true);
      setNeedButton(true);
      setTimeout(() => setStep(3), 1000);
    } catch (err: any) {
      console.error("OTP Verification error:", err);
      setAlert(err.message || "Something went wrong");
      setShowAlert(true);
      setNeedButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      setIsLoading(true);

      const res = await fetch(`${BACKEND_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "RATE_LIMITED") {
          setAlert(`Too Many Requests
             ${data.message}`);
          setShowAlert(true);
          setNeedButton(true);
          setCooldown(60); // Start cooldown
        } else if (data.code === "ALREADY_VERIFIED") {
          setAlert(`Already Verified
             ${data.message}`);
          setShowAlert(true);
          setNeedButton(true);
        } else {
          setAlert(`Resend Failed
             ${data.message || "Please try again later"}`);
          setShowAlert(true);
          setNeedButton(true);
        }
        return;
      }

      setAlert(`OTP Sent 
        A new verification code was sent to your email.`);
      setShowAlert(true);
      setNeedButton(true);
    } catch (error: any) {
      setAlert(`Error 
        ${error.message || "Network error"}`);
      setShowAlert(true);
      setNeedButton(true);
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

    if (Step === 1) {
      if (!email.includes("@") || email.length < 5) {
        setAlert("Please enter a valid email");
        setShowAlert(true);
        setNeedButton(true);
        return;
      }

      if (emailExists === true) {
        setAlert("Email already exists");
        setShowAlert(true);
        setNeedButton(true);
        return;
      }

      if (emailExists === null) {
        setAlert("Checking email... please wait");
        setShowAlert(true);
        setNeedButton(true);
        return;
      }
    }

    if (Step === 2 && confirmationCode.trim().length < 4) {
      setAlert("Invalid confirmation code");
      setShowAlert(true);
      setNeedButton(true);
      return;
    }

    // validation for each step
    if (Step === 3) {
      if (!username || username.length <= 3) {
        setAlert("Username must be at least 4 characters");
        setShowAlert(true);
        setNeedButton(true);
        return;
      }

      if (usernameExists === true) {
        setAlert("Username already exists");
        setShowAlert(true);
        setNeedButton(true);
        return;
      }

      if (usernameExists === null) {
        setAlert("Checking username... please wait");
        setShowAlert(true);
        setNeedButton(true);
        return;
      }
    }

    if (Step === 4 && password.length < 6) {
      setAlert("Password must be at least 6 characters");
      setShowAlert(true);
      setNeedButton(true);
      return;
    }

    setStep((prev) => prev + 1);
  };

  if (!fontsLoaded) return null;

  if (Step === 1) {
    return (
      <ThemedView style={{ height: "100%", gap: 10, alignItems: "center" }}>
        <View className="items-center justify-between flex-row w-full pt-10 px-4 mb-10">
          <TouchableOpacity onPress={() => router.back()} className="w-fit">
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
          onPress={handleRegisterEmail}
          style={CreateProfileStyles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="font-semibold text-lg">Continue</Text>
          )}
        </TouchableOpacity>

        <ModalMessage
          visible={showAlert}
          text={alert}
          needCloseButton={needButton}
          onClose={setShowAlert}
        />
      </ThemedView>
    );
  }

  if (Step === 2) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full pt-10 px-4 mb-10">
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
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="font-semibold text-lg">Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity disabled={isLoading} onPress={handleResend}>
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <ThemedText style={CreateProfileStyles.ExtraBold}>
              Resend Code
            </ThemedText>
          )}
        </TouchableOpacity>

        <ModalMessage
          visible={showAlert}
          text={alert}
          needCloseButton={needButton}
          onClose={setShowAlert}
        />
      </ThemedView>
    );
  }

  if (Step === 3) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full px-4 pt-10 mb-10">
          <TouchableOpacity onPress={() => HandleStep(false)}>
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
          <Text className="text-green-500 text-center">Username available</Text>
        )}
        {usernameExists && (
          <Text className="text-red-500 text-center">
            Username already exists
          </Text>
        )}

        <TouchableOpacity
          onPress={() => HandleStep(true)}
          style={CreateProfileStyles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="font-semibold text-lg">Continue</Text>
          )}
        </TouchableOpacity>

        <ModalMessage
          visible={showAlert}
          text={alert}
          needCloseButton={needButton}
          onClose={setShowAlert}
        />
      </ThemedView>
    );
  }

  if (Step === 4) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View className="items-center justify-between flex-row w-full pt-10 px-4 mb-10">
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
          onPress={handleRegisterUser}
          style={CreateProfileStyles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="font-semibold text-lg">Save & Continue</Text>
          )}
        </TouchableOpacity>

        <ModalMessage
          visible={showAlert}
          text={alert}
          needCloseButton={needButton}
          onClose={setShowAlert}
        />
      </ThemedView>
    );
  }

  return "Internal Error, Try restarting the app.";
};

export default CreateProfile;
