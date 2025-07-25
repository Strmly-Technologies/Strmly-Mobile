import ThemedView from "@/components/ThemedView";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ChevronDownIcon } from "lucide-react-native";

const KYCForm = () => {
  const [bankName, setBankName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [reAccountNumber, setReAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankType, setBankType] = useState<"Saving" | "Current" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (
      !bankName ||
      !holderName ||
      !accountNumber ||
      !reAccountNumber ||
      !ifsc ||
      !bankType
    ) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (accountNumber !== reAccountNumber) {
      Alert.alert("Error", "Account numbers do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://<YOUR_BACKEND_URL>/api/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bankName,
          holderName,
          accountNumber,
          ifsc,
          bankType,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "KYC details submitted successfully!");
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to submit KYC details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView className="relative justify-between flex-1 p-5">
      <View></View>

      <View className="">
        <Text className="text-white font-thin text-sm mb-1">Bank Name</Text>
        <TextInput
          value={bankName}
          onChangeText={setBankName}
          className="p-3 mb-3 h-14 border border-[##B0B0B0] rounded-xl"
        />

        <Text className="text-white font-thin text-sm mb-1">
          Account Holder Name
        </Text>
        <TextInput
          value={holderName}
          onChangeText={setHolderName}
          className="border border-[##B0B0B0] rounded-xl h-14 p-3 mb-3"
        />

        <Text className="text-white font-thin text-sm mb-1">
          Account Number
        </Text>
        <TextInput
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="numeric"
          className="border border-[##B0B0B0] rounded-xl h-14 p-3 mb-3"
        />

        <Text className="text-white font-thin text-sm mb-1">
          Re-enter Account Number
        </Text>
        <TextInput
          value={reAccountNumber}
          onChangeText={setReAccountNumber}
          keyboardType="numeric"
          className="border border-[##B0B0B0] rounded-xl h-14 p-3 mb-3"
        />

        <Text className="text-white font-thin text-sm mb-1">IFSC Code</Text>
        <TextInput
          value={ifsc}
          onChangeText={setIfsc}
          className="border border-[##B0B0B0] rounded-xl h-14 p-3 mb-3"
        />

        <Text className="text-white font-thin text-sm mb-1">Bank Type</Text>
        <View className="relative border border-[#B0B0B0] h-14 rounded-xl mb-4">
          <Picker
            selectedValue={bankType}
            onValueChange={(itemValue) => setBankType(itemValue)}
            style={{
              color: "white",
            }}
          >
            <Picker.Item label="Select" value="" />
            <Picker.Item label="Saving" value="Saving" />
            <Picker.Item label="Current" value="Current" />
          </Picker>

          <View className="absolute bottom-4 right-4">
            <ChevronDownIcon color={'white'} size={20}/>
          </View>
        </View>
      </View>

      <View></View>

      <View className="absolute bottom-24 w-full right-5">
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="bg-white p-4 rounded-xl items-center"
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-black text-lg font-semibold">Complete Your KYC</Text>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
};

export default KYCForm;
