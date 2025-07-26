// Utility to test which endpoints actually exist on the backend
import { CONFIG } from '@/Constants/config';

export const testUserEndpoints = async (token: string) => {
  console.log('=== TESTING USER ENDPOINTS ===');
  console.log(`Base URL: ${CONFIG.API_BASE_URL}`);
  console.log(`Token: ${token ? 'Present' : 'Missing'}`);
  
  const endpoints = [
    '/api/v1/user/profile',
    '/api/v1/user/earnings', 
    '/api/v1/user/videos',
    '/api/v1/user/communities',
    '/api/v1/user/followers',
    '/api/v1/user/following',
    '/api/v1/user/interactions',
    '/api/v1/user/notifications',
    '/api/v1/user/feed',
    '/api/v1/user/history'
  ];

  const results: { [key: string]: { status: number; exists: boolean; error?: string } } = {};

  for (const endpoint of endpoints) {
    try {
      console.log(`\n--- Testing: ${endpoint} ---`);
      const url = `${CONFIG.API_BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseText = await response.text();
      const isHtml = responseText.trim().startsWith('<');
      
      results[endpoint] = {
        status: response.status,
        exists: !isHtml && (response.status < 500), // Not HTML and not server error
      };

      if (response.ok) {
        console.log(`✅ ${endpoint}: SUCCESS (${response.status})`);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint}: NOT FOUND (404)`);
      } else if (response.status === 401 || response.status === 403) {
        console.log(`🔒 ${endpoint}: AUTH ERROR (${response.status})`);
      } else if (isHtml) {
        console.log(`❌ ${endpoint}: HTML RESPONSE (${response.status}) - endpoint doesn't exist`);
      } else {
        console.log(`⚠️  ${endpoint}: ERROR (${response.status})`);
      }

    } catch (error) {
      console.log(`❌ ${endpoint}: NETWORK ERROR - ${error}`);
      results[endpoint] = {
        status: 0,
        exists: false,
        error: String(error)
      };
    }
  }

  console.log('\n=== ENDPOINT TEST SUMMARY ===');
  Object.entries(results).forEach(([endpoint, result]) => {
    const status = result.exists ? '✅ EXISTS' : '❌ MISSING';
    console.log(`${status} ${endpoint} (${result.status})`);
  });
  console.log('=============================\n');

  return results;
};