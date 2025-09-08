import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  validateAmount,
  initiateGooglePlayBilling,
} from "@/utils/paymentUtils";

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  onCreateOrder: (amount: number) => Promise<any>;
  onVerifyPayment: (
    orderId: string,
    productId: string,
    purchaseToken: string,
    amount: number
  ) => Promise<any>;
  onError?: (error: Error) => void;
}

const quickAmounts = [10, 50, 100, 200, 500];

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onCreateOrder,
  onVerifyPayment,
  onError,
}) => {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!visible) {
      setAmount("");
      setIsProcessing(false);
    }
  }, [visible]);

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleAddMoney = async () => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      Alert.alert("Error", validation.error);
      return;
    }

    const numAmount = parseFloat(amount);
    setIsProcessing(true);

    try {
      const order = await onCreateOrder(numAmount);
      if (!order) throw new Error("Failed to create wallet load order");

      const billingResponse = await initiateGooglePlayBilling({
        amount: numAmount,
        currency: "INR",
      });

      // ✅ FIX: check productId instead of signature
      if (
        !billingResponse?.purchaseToken ||
        !billingResponse?.productId
      ) {
        throw new Error("Incomplete billing response");
      }

      await onVerifyPayment(
        billingResponse.orderId ?? "",
        billingResponse.productId,
        billingResponse.purchaseToken,
        numAmount
      );

      onSuccess(numAmount);
      Alert.alert("Success", `₹${numAmount} added to your wallet successfully!`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("AddMoneyModal error:", error);
      Alert.alert("Error", error.message || "Google Play Billing failed");
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <View className="border-2 border-gray-600 bg-gray-900 rounded-t-3xl p-6">
          <Text className="text-white text-xl font-semibold mb-2 text-center">
            Add Money to Wallet
          </Text>
          <Text className="text-gray-400 text-sm mb-6 text-center">
            Payment via Google Play Billing
          </Text>

          <Text className="text-gray-300 text-sm mb-3">Quick Add</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                onPress={() => handleQuickAmount(quickAmount)}
                className="bg-gray-700 px-4 py-2 rounded-lg"
              >
                <Text className="text-white">₹{quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {amount && (
            <TextInput
              value={amount}
              editable={false} // keep input non-editable
              placeholderTextColor="#666"
              keyboardType="numeric"
              className="bg-gray-800 text-white p-4 rounded-lg mb-6 text-lg"
            />
          )}

          <View className="flex-row justify-center gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isProcessing}
              className="flex-1 bg-gray-600 justify-center p-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddMoney}
              disabled={isProcessing || !amount}
              className={`flex-grow p-4 rounded-xl justify-center ${
                isProcessing || !amount ? "bg-gray-500" : "bg-white"
              }`}
            >
              {isProcessing ? (
                <View className="flex-row items-center justify-center gap-2">
                  <ActivityIndicator size="small" color="#000" />
                  <Text className="text-black text-center font-semibold">
                    Processing...
                  </Text>
                </View>
              ) : (
                <Text className="text-black text-center font-semibold">
                  Pay ₹{amount || "0"} via Google Play
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddMoneyModal;
