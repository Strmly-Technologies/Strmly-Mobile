import { Tabs } from 'expo-router';
import React from 'react';
import { View, Image } from 'react-native';
import { PaperclipIcon, Search } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-8 h-8 items-center justify-center ${focused ? 'opacity-100' : 'opacity-60'}`}>
              <PaperclipIcon size={24} color="white" />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="studio"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-8 h-8 items-center justify-center ${focused ? 'opacity-100' : 'opacity-60'}`}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path 
                  d="M12 17.5c2.33 0 4.24-1.91 4.24-4.24S14.33 8.76 12 8.76s-4.24 1.91-4.24 4.24S9.67 17.5 12 17.5zM12 10.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z"
                  fill="white"
                />
                <Path 
                  d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM20 18H4V6h4.05l.48-.64L9.88 4h4.24l1.35 1.36.48.64H20v12z"
                  fill="white"
                />
              </Svg>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-8 h-8 items-center justify-center ${focused ? 'opacity-100' : 'opacity-60'}`}>
              <Search size={24} color="white" />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-8 h-8 items-center justify-center ${focused ? 'opacity-100' : 'opacity-60'}`}>
              <View className="w-7 h-7 bg-gray-600 rounded-full overflow-hidden">
                <View className="w-full h-full bg-gradient-to-b from-gray-500 to-gray-700 items-center justify-center">
                  <View className="w-3 h-3 bg-white rounded-full mb-1" />
                  <View className="w-5 h-2 bg-white rounded-t-full" />
                </View>
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
