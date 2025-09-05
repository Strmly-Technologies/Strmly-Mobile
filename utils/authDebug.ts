import { CONFIG } from '@/Constants/config';

export const testTokenValidity = async (token: string): Promise<{
  isValid: boolean;
  error?: string;
  status?: number;
}> => {
  try {
    console.log(`🧪 Testing token validity...`);
    console.log(`Token: ${token.substring(0, 20)}...`);
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`🧪 Token test response: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Token is valid! User: ${data.user?.username || 'Unknown'}`);
      return { isValid: true };
    } else {
      const errorText = await response.text();
      console.log(`❌ Token is invalid: ${response.status} - ${errorText.substring(0, 100)}`);
      return { 
        isValid: false, 
        error: errorText.substring(0, 100),
        status: response.status 
      };
    }
  } catch (error) {
    console.error(`🚨 Token test failed:`, error);
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const debugAuthState = (token: string | null, user: any) => {
  console.log(`🔍 Auth Debug:
    - Token exists: ${!!token}
    - Token length: ${token?.length || 0}
    - Token preview: ${token?.substring(0, 30)}...
    - User exists: ${!!user}
    - Username: ${user?.username || 'N/A'}
    - User ID: ${user?.id || 'N/A'}
    - Is onboarded: ${user?.is_onboarded || false}`);
};