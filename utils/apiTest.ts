// Simple API test utility
import { CONFIG } from '@/Constants/config';

export const testApiConnection = async (token: string) => {
  console.log('=== API CONNECTION TEST ===');
  console.log(`API Base URL: ${CONFIG.API_BASE_URL}`);
  console.log(`Token: ${token ? 'Present' : 'Missing'}`);
  
  // Test 1: Basic connection
  try {
    console.log('\n--- Test 1: Basic API connection ---');
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`Response length: ${responseText.length}`);
    console.log(`Response starts with: ${responseText.substring(0, 100)}`);
    
    if (responseText.trim().startsWith('<')) {
      console.log('❌ PROBLEM: Server returned HTML instead of JSON');
      console.log('This usually means:');
      console.log('1. The endpoint does not exist (404 error page)');
      console.log('2. Authentication failed (login page)');
      console.log('3. Server error (error page)');
    } else {
      console.log('✅ Server returned non-HTML response');
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Valid JSON response');
        console.log('Data keys:', Object.keys(data));
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }
    
  } catch (error) {
    console.log('❌ Network error:', error);
  }
  
  // Test 2: Check if backend is running
  try {
    console.log('\n--- Test 2: Backend health check ---');
    const healthResponse = await fetch(`${CONFIG.API_BASE_URL}/`, {
      method: 'GET'
    });
    console.log(`Health check status: ${healthResponse.status}`);
    const healthText = await healthResponse.text();
    console.log(`Health response: ${healthText.substring(0, 100)}`);
  } catch (error) {
    console.log('❌ Backend not responding:', error);
  }
  
  console.log('=== END API TEST ===\n');
};