import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { CONFIG } from '@/Constants/config';
import { getUserProfile, getUserVideos, getUserEarnings } from '@/api/user/userActions';

const AuthDebug = () => {
  const { token, user, isLoggedIn } = useAuthStore();

  const testTokenValidity = async () => {
    if (!token) {
      Alert.alert('No Token', 'Please sign in first');
      return;
    }

    try {
      console.log('=== TESTING TOKEN VALIDITY ===');
      console.log('Token:', token);
      console.log('API URL:', CONFIG.API_BASE_URL);
      
      // Test 1: Direct fetch
      console.log('\n--- Test 1: Direct API call ---');
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response (first 300 chars):', responseText.substring(0, 300));

      if (response.ok) {
        console.log('✅ Direct API call successful');
        
        // Test 2: Using our API functions
        console.log('\n--- Test 2: Using API functions ---');
        try {
          const profile = await getUserProfile(token);
          console.log('✅ getUserProfile successful:', profile);
          
          const videos = await getUserVideos(token);
          console.log('✅ getUserVideos successful:', videos);
          
          const earnings = await getUserEarnings(token);
          console.log('✅ getUserEarnings successful:', earnings);
          
          Alert.alert('Success', 'All API calls successful! Check console for details.');
        } catch (apiError) {
          console.log('❌ API function error:', apiError);
          Alert.alert('Partial Success', 'Direct call worked but API functions failed. Check console.');
        }
      } else {
        console.log('❌ Direct API call failed');
        Alert.alert('Error', `Token invalid: ${response.status}\nCheck console for details`);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      Alert.alert('Error', 'Network error - check console');
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#1a1a1a', margin: 10, borderRadius: 10 }}>
      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Auth Debug Info
      </Text>
      
      <Text style={{ color: 'white', marginBottom: 5 }}>
        Logged In: {isLoggedIn ? '✅ Yes' : '❌ No'}
      </Text>
      
      <Text style={{ color: 'white', marginBottom: 5 }}>
        Token: {token ? `✅ Present (${token.length} chars)` : '❌ Missing'}
      </Text>
      
      <Text style={{ color: 'white', marginBottom: 5 }}>
        User: {user ? `✅ ${user.username || user.email}` : '❌ No user data'}
      </Text>
      
      <Text style={{ color: 'white', marginBottom: 10 }}>
        API URL: {CONFIG.API_BASE_URL}
      </Text>

      <TouchableOpacity
        onPress={testTokenValidity}
        style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 5, marginTop: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Test Token</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg0ZDA3NzZkNTg5OGI0YmE1YjdkZmIiLCJpYXQiOjE3NTM1MzU2MzksImV4cCI6MTc1NjEyNzYzOX0.4E3WD_puBZrFr6Kvgn3jl9py4XrkRxyycI_L_-2_SjM";
          useAuthStore.getState().login(testToken, {
            id: "6884d0776d5898b4ba5b7dfb",
            name: "Test User",
            email: "test@example.com",
            username: "testuser"
          });
          Alert.alert('Success', 'Test token set!');
        }}
        style={{ backgroundColor: '#28a745', padding: 10, borderRadius: 5, marginTop: 5 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Set Test Token</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthDebug;