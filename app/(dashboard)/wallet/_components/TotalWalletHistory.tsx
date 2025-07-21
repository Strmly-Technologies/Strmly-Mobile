import { View, Text, FlatList, Image } from 'react-native'
import React from 'react'

// data/balanceHistory.ts
const walletHistory = [
  {
    id: 1,
    name: 'Aamir Khan',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    amount: 500,
    amountType: 'spend',
    date: '2025-07-15',
    description: 'Zomato Food Order',
  },
  {
    id: 2,
    name: 'Sara Ali',
    photo: 'https://randomuser.me/api/portraits/women/45.jpg',
    amount: 1200,
    amountType: 'spend',
    date: '2025-07-14',
    description: 'Flipkart Purchase',
  },
  {
    id: 3,
    name: 'John Doe',
    photo: 'https://randomuser.me/api/portraits/men/21.jpg',
    amount: 300,
    date: '2025-07-13',
    amountType: 'credit',
    description: 'Uber Ride',
  },
  {
    id: 4,
    name: 'Riya Sharma',
    photo: 'https://randomuser.me/api/portraits/women/12.jpg',
    amount: 150,
    date: '2025-07-12',
    amountType: 'spend',
    description: 'Coffee at Starbucks',
  },
  {
    id: 5,
    name: 'Mohit Verma',
    photo: 'https://randomuser.me/api/portraits/men/44.jpg',
    amount: 800,
    date: '2025-07-11',
    amountType: 'spend',
    description: 'Movie Tickets',
  },
  {
    id: 6,
    name: 'Neha Sinha',
    photo: 'https://randomuser.me/api/portraits/women/60.jpg',
    amount: 2500,
    amountType: 'spend',
    date: '2025-07-10',
    description: 'Myntra Shopping',
  },
  {
    id: 7,
    name: 'Dev Patel',
    photo: 'https://randomuser.me/api/portraits/men/10.jpg',
    amount: 1000,
    amountType: 'spend',
    date: '2025-07-09',
    description: 'Restaurant Dinner',
  },
  {
    id: 8,
    name: 'Anjali Mehra',
    photo: 'https://randomuser.me/api/portraits/women/24.jpg',
    amount: 400,
    amountType: 'credit',
    date: '2025-07-08',
    description: 'Grocery Shopping',
  },
  {
    id: 9,
    name: 'Irshad',
    photo: '',
    amount: 40,
    amountType: 'credit',
    date: '2025-07-08',
    description: 'Receive comment gift',
  },
]

const TotalWalletHistory = () => {
  return (
    <View className="">

      <FlatList
        data={walletHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="flex-row items-center my-2">
            <View className='flex-row items-center gap-3 flex-1'>
                {/* Profile Picture */}
                <Image
                source={{ uri: item.photo }}
                className="w-12 h-12 rounded-full bg-gray-500"
                />

                {/* User Info */}
                <View className='justify-center items-start'>
                    <Text className="font-medium text-white">{item.name}</Text>
                    <Text className="text-xs text-gray-500">{item.description} on {item.date}</Text>
                </View>
            </View>

            {/* Amount */}
            <Text className={`${item.amountType === 'spend' ? 'text-red-500' : 'text-green-500'} font-semibold`}>
              {item.amountType === 'spend' ? '-' : '+'} ₹{item.amount}
            </Text>
          </View>
        )}
      />
    </View>
  )
}

export default TotalWalletHistory;