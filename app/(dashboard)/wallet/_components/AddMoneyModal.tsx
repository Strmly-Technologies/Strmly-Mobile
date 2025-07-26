import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { validateAmount, initiateGooglePlayBilling } from '@/utils/paymentUtils';

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  onCreateOrder: (amount: number) => Promise<any>;
  onVerifyPayment: (orderId: string, paymentId: string, signature: string) => Promise<any>;
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onCreateOrder,
  onVerifyPayment
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleAddMoney = async () => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      Alert.alert('Error', validation.error);
      return;
    }

    const numAmount = parseFloat(amount);
    setIsProcessing(true);

    try {
      // Create order
      const order = await onCreateOrder(numAmount);
      
      // Initiate Google Play Billing
      const billingResponse = await initiateGooglePlayBilling({
        id: order.id,
        amount: numAmount,
        currency: 'INR'
      });

      // Verify payment with Google Play Billing response
      await onVerifyPayment(
        billingResponse.orderId,
        billingResponse.purchaseToken,
        billingResponse.signature
      );

      onSuccess(numAmount);
      setAmount('');
      onClose();
      Alert.alert('Success', `₹${numAmount} added to your wallet successfully!`);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google Play Billing failed');
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
        <View className="bg-[#1E1E1E] rounded-t-3xl p-6">
          <Text className="text-white text-xl font-semibold mb-2 text-center">
            Add Money to Wallet
          </Text>
          <Text className="text-gray-400 text-sm mb-6 text-center">
            Payment via Google Play Billing
          </Text>

          {/* Quick Amount Buttons */}
          <Text className="text-gray-300 text-sm mb-3">Quick Add</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {quickAmounts.map((quickAmount) => (
              <Pressable
                key={quickAmount}
                onPress={() => handleQuickAmount(quickAmount)}
                className="bg-gray-700 px-4 py-2 rounded-lg"
              >
                <Text className="text-white">₹{quickAmount}</Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Amount Input */}
          <Text className="text-gray-300 text-sm mb-2">Enter Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            placeholderTextColor="#666"
            keyboardType="numeric"
            className="bg-gray-800 text-white p-4 rounded-lg mb-6 text-lg"
          />

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              disabled={isProcessing}
              className="flex-1 bg-gray-600 p-4 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleAddMoney}
              disabled={isProcessing || !amount}
              className={`flex-1 p-4 rounded-lg ${
                isProcessing || !amount ? 'bg-gray-500' : 'bg-white'
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
                  Pay ₹{amount || '0'} via Google Play
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddMoneyModal;