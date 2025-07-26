// import { StyleSheet } from 'react-native';
// import ThemedView from "../components/ThemedView";
// import VideoFeed from './(dashboard)/long/VideoFeed';
// import WalletPage from './(dashboard)/wallet/wallet';
// import VideoContentGifting from './(payments)/Video/VideoContentGifting';
// import CommentsSection from './(dashboard)/long/_components/CommentSection';
// import KYCForm from './(dashboard)/wallet/_components/KYCForm';
// import PublicCommunityPage from './(dashboard)/public/publicComm';
// import PublicProfilePage from './(dashboard)/profile/public/PublicProfile';
// import PersonalProfilePage from './(dashboard)/profile/personal.PersonalProfile';
// import CreateProfile from './CreateProfile/CreateProfile';
// import SignUp from './(auth)/Sign-up';

// const Home = () => {
//   return (
//     // <ThemedView style={styles.container}>

//     // <SignUp/>
//     // <CreateProfile/>

//     // <PersonalProfilePage/>
//     // <PublicProfilePage/>
//     // <PublicCommunityPage/>

//       // <KYCForm/>
//       // <VideoContentGifting creatorProfile='' creatorName='Irshad' creatorUsername='@User123'/>
//       // <VideoFeed/>
//       // <CommentsSection isOpen={true} onClose={() => {}} videoId={'1'} longVideosOnly={false} />
//       // <WalletPage/>

//     // </ThemedView>
//   )
// }

// export default Home

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   img: {
//     marginVertical: 20
//   },
//   title: {
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   link: {
//     marginVertical: 10,
//     borderBottomWidth: 1
//   },
// })

import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function Index() {
  const { token, isLoggedIn } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give some time for the auth store to hydrate from SecureStore
    const timer = setTimeout(() => {
      console.log('=== APP ENTRY POINT ===');
      console.log('Token:', token);
      console.log('Is logged in:', isLoggedIn);
      console.log('Token length:', token?.length);
      console.log('=====================');
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [token, isLoggedIn]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication status
  if (token && isLoggedIn) {
    console.log('✅ User is authenticated, redirecting to home');
    return <Redirect href="/(tabs)/home" />;
  } else {
    console.log('❌ User not authenticated, redirecting to sign-in');
    return <Redirect href="/(auth)/Sign-in" />;
  }
}
