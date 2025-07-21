import { View, Text, FlatList, Image } from 'react-native'
import React from 'react'

// data/balanceHistory.ts
const balanceHistory = [
  {
    id: 1,
    name: 'Add to wallet',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    amount: 500,
    amountType: 'spend',
    date: '2025-07-15',
  },
  {
    id: 2,
    name: 'Add to wallet',
    photo: 'https://randomuser.me/api/portraits/women/45.jpg',
    amount: 1200,
    amountType: 'spend',
    date: '2025-07-14',
  },
  {
    id: 3,
    name: 'Withdraw from wallet',
    photo: 'https://randomuser.me/api/portraits/men/21.jpg',
    amount: 300,
    date: '2025-07-13',
    amountType: 'credit',
  },
  {
    id: 4,
    name: 'Add to wallet',
    photo: 'https://randomuser.me/api/portraits/women/12.jpg',
    amount: 150,
    date: '2025-07-12',
    amountType: 'spend',
  },
  {
    id: 5,
    name: 'Add to wallet',
    photo: 'https://randomuser.me/api/portraits/men/44.jpg',
    amount: 800,
    date: '2025-07-11',
    amountType: 'spend',
  },
  {
    id: 6,
    name: 'Add to wallet',
    photo: 'https://randomuser.me/api/portraits/women/60.jpg',
    amount: 2500,
    amountType: 'spend',
    date: '2025-07-10',
  },
  {
    id: 7,
    name: 'Add to wallet',
    photo: 'https://randomuser.me/api/portraits/men/10.jpg',
    amount: 1000,
    amountType: 'spend',
    date: '2025-07-09',
  },
  {
    id: 8,
    name: 'Withdraw from wallet',
    photo: 'https://randomuser.me/api/portraits/women/24.jpg',
    amount: 400,
    amountType: 'credit',
    date: '2025-07-08',
  },
  {
    id: 9,
    name: 'Withdraw from wallet',
    photo: '',
    amount: 40,
    amountType: 'credit',
    date: '2025-07-08',
  },
]

const TotalBalanceHistory = () => {
  return (
    <View className="">

      <FlatList
        data={balanceHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="flex-row items-center my-2">
            <View className='flex-row items-center gap-3 flex-1'>
                {/* Profile Picture */}
                <Image
                source={require('../../../../assets/images/bank-icon.png')}
                className="w-12 h-12 rounded-full bg-gray-500"
                />

                {/* User Info */}
                <View className='justify-center items-start'>
                    <Text className="text-sm text-white">{item.name}</Text>
                    <Text className="text-xs text-gray-500">{item.date}</Text>
                </View>
            </View>

            {/* Amount */}
            <Text className={`${item.amountType === 'spend' ? 'text-red-500' : 'text-green-500'} text-[16px]`}>
              {item.amountType === 'spend' ? '-' : '+'} ₹{item.amount}
            </Text>
          </View>
        )}
      />
    </View>
  )
}

export default TotalBalanceHistory;