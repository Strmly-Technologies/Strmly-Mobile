import React, { useState } from "react";
import {
    Image,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { useFonts } from "expo-font";
import { Link, router } from "expo-router";

import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { Signinstyles } from "@/styles/signin";
import { CreateProfileStyles } from "@/styles/createprofile";
import { useAuthStore } from "@/store/useAuthStore";
import { CONFIG } from "@/Constants/config";

const SignIn = () => {
    const [useEmail, setUseEmail] = useState(false);
    const [nameOrEmail, setNameOrEmail] = useState("");
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

    const handleLogin = async () => {
        if (!nameOrEmail || !password) {
            alert("Please fill in both fields");
            return;
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nameOrEmail);
        const loginType = isEmail ? "email" : "username";
        console.log(loginType);

        try {
            console.log('start')
            const res = await fetch(`${CONFIG.API_BASE_URL}/api/v1/auth/login/${loginType}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    [loginType]: nameOrEmail, // dynamic key: email or username
                    password,
                }),
            });
            console.log('res')

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Login failed");
            }

            // Save in zustand and secure store
            await useAuthStore.getState().login(data.token, data.user);

            // Debug: Log the token that was saved
            console.log('=== SIGN-IN SUCCESS ===');
            console.log('Token received:', data.token);
            console.log('Token length:', data.token?.length);
            console.log('User data:', data.user);
            console.log('Auth store state after login:', useAuthStore.getState());
            console.log('=====================');

            alert("Login successful!");
            setTimeout(()=> router.push('/(dashboard)/long/VideoFeed'), 300)

        } catch (error: any) {
            console.error("Login Error", error);
            alert(error.message || "Something went wrong");
        }
    };


    if (!fontsLoaded) return null;

    const renderTopbar = () => {
        return (
            <Pressable
                onPress={() => setUseEmail(false)}
                className="absolute left-10 top-20"
            >
                <Image
                    source={require("../../assets/images/back.png")}
                    className="size-5"
                />
            </Pressable>
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
                <Text className="text-white text-lg">Use email</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => alert("Google Sign-in")}
                style={Signinstyles.button}
            >
                <Text className="text-white text-lg">Continue with Google</Text>
            </TouchableOpacity>
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
            <TouchableOpacity style={CreateProfileStyles.button} onPress={handleLogin}>
                <Text className="text-lg font-semibold">Sign in</Text>
            </TouchableOpacity>
            <ThemedText className="text-white mt-8">
                <ThemedText style={Signinstyles.Text16M}>
                    Forgotten password?
                </ThemedText>
            </ThemedText>
        </>
    );

    const renderLink = () => (
        <Link
            className="mt-14"
            href={'/(auth)/Sign-up'}
            style={Signinstyles.Text16R}
        >
            Already have an account?
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
            {!useEmail && renderLink()}
        </ThemedView>
    );
};

export default SignIn;