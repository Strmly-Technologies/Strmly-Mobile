import { View, Text, Pressable } from 'react-native'
import React from 'react'

const WalletButtons = () => {
  const handlePress = () => {
    console.log('Button Pressed!')
  }

  return (
    <View className="gap-3 mb-10">
      <Pressable
        onPress={handlePress}
        className="bg-white rounded-3xl h-[45px] justify-center items-center"
      >
        <Text className="text-black text-base font-semibold">Add to wallet</Text>
      </Pressable>

      <Pressable
        onPress={handlePress}
        className="bg-white rounded-3xl h-[45px] justify-center items-center"
      >
        <Text className="text-black text-base font-semibold">Withdraw</Text>
      </Pressable>
    </View>
  )
}

export default WalletButtons