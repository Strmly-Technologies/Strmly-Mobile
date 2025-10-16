import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function VideoPage() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Playing video: {id}</Text>
      {/* Replace with your actual video player */}
    </View>
  );
}
