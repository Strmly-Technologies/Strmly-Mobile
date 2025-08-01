import { Stack } from 'expo-router';

export default function TermsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TermsAndConditions" />
      <Stack.Screen name="PrivacyPolicy" />
    </Stack>
  );
}