import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import React, { useState } from "react";
import { useFonts } from "expo-font";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CreatorPassStyles } from "@/styles/CreatorPass";

const AddCreatorPass = () => {
  const [Step, setStep] = useState(1);
  const [Amount, setAmount] = useState("99");
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
    "Inter-ExtraLight": require("../../assets/fonts/inter/Inter-ExtraLight.ttf"),
  });

  if (!fontsLoaded) return null;

  if (Step === 1) {
    return (
      <ThemedView style={CreatorPassStyles.Container}>
        <View style={CreatorPassStyles.TopBar}>
          <TouchableOpacity style={CreatorPassStyles.BackIcon}>
            <Image source={require("../../assets/icons/cross.svg")} />
          </TouchableOpacity>
        </View>
        <View style={{ height: 16 }} />
        <View style={CreatorPassStyles.Centered}>
          <ThemedText style={CreatorPassStyles.Title}>Creator pass</ThemedText>

          <View style={CreatorPassStyles.PriceRow}>
            <Text style={CreatorPassStyles.RupeeSymbol}>₹</Text>
            <TextInput
              style={CreatorPassStyles.PriceInput}
              keyboardType="numeric"
              value={Amount}
              onChangeText={setAmount}
              placeholder="99"
              placeholderTextColor="#999"
            />
            <Text style={CreatorPassStyles.PerMonth}>/Month</Text>
          </View>

          <TouchableOpacity style={CreatorPassStyles.button}>
            <Text style={{ color: "#000", fontFamily: "Inter-SemiBold" }}>
              Add Creator pass
            </Text>
          </TouchableOpacity>

          <View>
            <ThemedText style={CreatorPassStyles.Text}>
              By enabling the Creator Pass, you agree to offer all your
            </ThemedText>
            <ThemedText style={CreatorPassStyles.Text}>
              paid content to users who subscribe to your pass at the
            </ThemedText>
            <ThemedText style={CreatorPassStyles.Text}>
              price you set. You&apos;ll earn revenue from each subscription
            </ThemedText>
            <ThemedText style={CreatorPassStyles.Text}>
              after platform fees and taxes.
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Internal Error, Try restarting the app.</Text>
    </View>
  );
};

export default AddCreatorPass;
