import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import React, { useState } from "react";
import { useFonts } from "expo-font";
import { CreateProfileStyles } from "@/styles/createprofile";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import Constants from "expo-constants";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { set } from "lodash";
import ModalMessage from "@/components/AuthModalMessage";

const Interests = () => {
  const [Step, setStep] = useState(1);
  const [Type, setType] = useState("Netflix");
  const [Interests, setInterests] = useState<string[]>([]);
  const [Interests2, setInterests2] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, updateUser } = useAuthStore();
  const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL;

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

  const submitInterests = async () => {
    if (!token || Interests.length !== 3) return;

    setIsSubmitting(true);
    console.log("Submitting interests:", Interests, Interests2);
    try {
      const response = await fetch(`${BACKEND_API_URL}/user/interests`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interest1 : Interests,
          interest2 : Interests2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update interests");
      }

      // Success - navigate to next screen or show success message
      updateUser({ is_onboarded: true });

      setAlert("Your interests have been updated successfully!");
      setNeedButton(true);
      setShowAlert(true);
      router.replace("/(tabs)/home");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update interests";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const HandleStep = (val: boolean) => {
    if (Step > 1 && !val) {
      setStep((prev) => prev - 1);
    }

    if (val) {
      if (Step === 3) {
        submitInterests();
      } else {
        setStep((prev) => prev + 1);
      }
    }
  };

  const handleInterestToggle = (item: string) => {
    const currentInterests = Step === 2 ? Interests : Interests2;
    const setCurrentInterests = Step === 2 ? setInterests : setInterests2;

    if (currentInterests.includes(item)) {
      setCurrentInterests(currentInterests.filter((i) => i !== item));
    } else if (currentInterests.length < 3) {
      setCurrentInterests([...currentInterests, item]);
    }
  };

  const renderGrid = (items: string[]) => {
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(
        <View key={i} className="flex-row justify-between w-full py-3 px-2">
          {[0, 1].map((j) => {
            const item = items[i + j];
            const currentInterests = Step === 2 ? Interests : Interests2;
            const isSelected = currentInterests.includes(item);

            if (!item) {
              return <View key={j} className="w-1/2 px-2" />;
            }

            const shadowColor = isSelected ? "#FF0000" : "#000000";

            return (
              <View key={j} className="w-1/2 px-2">
                <View style={{ position: "relative" }}>
                  {/* Shadow Layer 3 - Furthest/Lightest */}
                  <View
                    style={{
                      position: "absolute",
                      top: 6,
                      left: -1,
                      right: -1,
                      bottom: -6,
                      backgroundColor: `${shadowColor}08`,
                      borderRadius: 12,
                      zIndex: 1,
                    }}
                  />

                  {/* Shadow Layer 2 - Middle */}
                  <View
                    style={{
                      position: "absolute",
                      top: 4,
                      left: 0,
                      right: 0,
                      bottom: -4,
                      backgroundColor: `${shadowColor}15`,
                      borderRadius: 12,
                      zIndex: 2,
                    }}
                  />

                  {/* Shadow Layer 1 - Closest/Darkest */}
                  <View
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 1,
                      right: -1,
                      bottom: -2,
                      backgroundColor: `${shadowColor}25`,
                      borderRadius: 12,
                      zIndex: 3,
                    }}
                  />

                  {/* 🔮 Bottom Blur */}
                  <BlurView
                    intensity={60}
                    tint="dark"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3.5,
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      zIndex: 5,
                    }}
                  />

                  {/* 🔮 Left Blur */}
                  <BlurView
                    intensity={60}
                    tint="dark"
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: -6,
                      width: 12,
                      borderTopLeftRadius: 12,
                      borderBottomLeftRadius: 12,
                      zIndex: 5,
                    }}
                  />

                  {/* 🔮 Right Blur */}
                  <BlurView
                    intensity={60}
                    tint="dark"
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      right: -6,
                      width: 12,
                      borderTopRightRadius: 12,
                      borderBottomRightRadius: 12,
                      zIndex: 5,
                    }}
                  />

                  {/* Main Button */}
                  <TouchableOpacity
                    onPress={() => handleInterestToggle(item)}
                    activeOpacity={0.3}
                    style={{
                      backgroundColor: isSelected ? "#1a1a1a" : "#000000",
                      borderRadius: 12,
                      height: 64,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 16,
                      borderBottomWidth: 2,
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                      borderColor: isSelected ? "#FF0000" : "#FFFFFF40",
                      position: "relative",
                      zIndex: 4,
                    }}
                  >
                    <Text
                      className="text-white text-center font-medium"
                      style={{
                        fontSize: 14,
                        lineHeight: 18,
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      );
    }
    return rows;
  };

  if (!fontsLoaded) return null;

  if (Step === 1) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <StatusBar backgroundColor={'black'} />
        <ThemedView style={CreateProfileStyles.TopBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-start w-full absolute top-20 z-10 left-5"
          >
            <Image
              source={require("../../assets/images/back.png")}
              className="h-7 w-4"
            />
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={CreateProfileStyles.Centered}>
          <ThemedText style={CreateProfileStyles.Heading}>
            Pick your kind of content
          </ThemedText>
          <ThemedView style={CreateProfileStyles.CardGrid}>
            <TouchableOpacity
              onPress={() => {
                setType("Netflix");
                setStep((prev) => prev + 1);
              }}
              style={CreateProfileStyles.InterestCard}
            >
              <LinearGradient
                colors={["#000000", "#ffffff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 6, y: 1 }}
                style={CreateProfileStyles.InterestCard}
              >
                <ThemedText style={CreateProfileStyles.InterestCardText}>
                  Netflix
                </ThemedText>
                <ThemedText style={CreateProfileStyles.CardContent}>
                  Short films, web series, dramas & movies.
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setType("Youtube");
                setStep((prev) => prev + 1);
              }}
              style={CreateProfileStyles.InterestCard}
            >
              <LinearGradient
                colors={["#000000", "#ffffff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 6, y: 1 }}
                style={CreateProfileStyles.InterestCard}
              >
                <ThemedText style={CreateProfileStyles.InterestCardText}>
                  Youtube
                </ThemedText>
                <ThemedText style={CreateProfileStyles.CardContent}>
                  Vlogs, comedy, food, beauty & Tech.
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  }

  if (Step === 2 || Step === 3) {
    const isCinema = Step === 2;
    const items = isCinema
      ? Type === "Netflix"
        ? [
            "Drama",
            "Comedy",
            "Action & Adventure",
            "Thriller & Suspense",
            "Horror",
            "Romance",
            "Sci-Fi & Fantasy",
            "Crime & Mystery",
            "Documentary",
            "Biography & True Story",
            "Family & Kids",
            "Teen & Young Adult",
            "Animation & Anime",
            "Reality & Unscripted",
            "Talk Shows & Stand-up Comedy",
            "Historical & Period Pieces",
            "Musical & Music-Based",
            "International & World Cinema",
            "Sports & Fitness",
            "Short Films & Anthologies",
          ]
        : [
            "Entertainment",
            "Education",
            "Gaming",
            "Commentary & Opinion",
            "Music & Audio",
            "Film & TV",
            "Vlogs & Lifestyle",
            "Health & Fitness",
            "Food & Cooking",
            "Beauty & Fashion",
            "Science & Technology",
            "Travel & Adventure",
            "DIY & Crafts",
            "Home & Family",
            "Business & Finance",
            "Motivation & Self-Improvement",
            "Career & Skill Development",
            "Spirituality & Philosophy",
            "Reviews & Unboxings",
            "Live Streams & Podcasts",
          ]
      : Type === "Netflix"
        ? [
            "Entertainment",
            "Education",
            "Gaming",
            "Commentary & Opinion",
            "Music & Audio",
            "Film & TV",
            "Vlogs & Lifestyle",
            "Health & Fitness",
            "Food & Cooking",
            "Beauty & Fashion",
            "Science & Technology",
            "Travel & Adventure",
            "DIY & Crafts",
            "Home & Family",
            "Business & Finance",
            "Motivation & Self-Improvement",
            "Career & Skill Development",
            "Spirituality & Philosophy",
            "Reviews & Unboxings",
            "Live Streams & Podcasts",
          ]
        : [
            "Drama",
            "Comedy",
            "Action & Adventure",
            "Thriller & Suspense",
            "Horror",
            "Romance",
            "Sci-Fi & Fantasy",
            "Crime & Mystery",
            "Documentary",
            "Biography & True Story",
            "Family & Kids",
            "Teen & Young Adult",
            "Animation & Anime",
            "Reality & Unscripted",
            "Talk Shows & Stand-up Comedy",
            "Historical & Period Pieces",
            "Musical & Music-Based",
            "International & World Cinema",
            "Sports & Fitness",
            "Short Films & Anthologies",
          ];
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <StatusBar backgroundColor={'black'} />
        <View style={CreateProfileStyles.TopBar}>
          <TouchableOpacity
            onPress={() => {
              HandleStep(false);
              Step === 2 ? setInterests([]) : setInterests2([]);
            }}
            className="items-start w-full absolute top-10 z-10 left-5"
          >
            <Image
              source={require("../../assets/images/back.png")}
              className="h-7 w-4"
            />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, marginTop: 20 }}>
          <ThemedText style={CreateProfileStyles.Heading}>
            Your Interests
          </ThemedText>
          <Text style={CreateProfileStyles.OptionsCardText}>
            Select only 3 of your interest from
            {isCinema ? " “Cinema content”" : " “Non-cinema content”"}
          </Text>

          <View style={{ marginBottom: 30, marginTop: 10 }}>
            {renderGrid(items)}
          </View>
        </ScrollView>
        <View className="px-4 w-full pb-10">
          <TouchableOpacity
            disabled={
              (Step === 2 ? Interests.length !== 3 : Interests2.length !== 3) ||
              (Step === 3 &&
                (Interests.length !== 3 || Interests2.length !== 3)) ||
              isSubmitting
            }
            onPress={() => HandleStep(true)}
            className="rounded-3xl z-10 bg-white items-center justify-center h-[55px]"
          >
            {isSubmitting ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-black text-xl">
                {Step === 3 ? "Submit" : "Continue"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ModalMessage
          visible={showAlert}
          text={alert}
          needCloseButton={needButton}
          onClose={() => setShowAlert(false)}
        />
      </ThemedView>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Internal Error, Try restarting the app.</Text>
    </View>
  );
};

export default Interests;
