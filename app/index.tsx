import StrmlyStudio from "./studio/StrmlyStudio";
import HistoryPage from "./(dashboard)/profile/History";
import PersonalCommunityPage from "./(dashboard)/communities/personal/PersonalComm";
import Dashboard from "./(dashboard)/profile/Dashboard";
import PublicCommunityPage from "./(communities)/public/publicComm";
import Interests from "./(InterestsSection)/Interests";
import Setting from "./Setting/Setting";
import PublicProfilePageWithId from "./(dashboard)/profile/public/[id]";
import CreateCommunityPage from "./(communities)/CreateCommunityPage";
import SearchTab from "./(tabs)/search";

// const Home = () => {
//   return (
//     // <ThemedView style={styles.container}>

//     // <SignUp/>
//     // <ForgotPassword/>

//     // <SearchTab/>

//     // <Interests/>

//     // <CreateProfile/>
//     // <AddCreatorPass/>
//     // <EditProfilePage/>

//     // <HistoryPage/>

//     // <Setting/>
//     // <PersonalProfilePage/>
//     // <PublicProfilePageWithId/>

//     // <PublicCommunityPage/>
//     // <PersonalCommunityPage/>
//     // <CreateCommunityPage/>
//     // <EditCommunityPage/>

//       // <KYCForm/>
//       // <VideoContentGifting creatorProfile='' creatorName='Irshad' creatorUsername='@User123'/>
//       <VideoFeed/>
//       // <CommentsSection isOpen={true} onClose={() => {}} videoId={'1'} longVideosOnly={false} />
//       // <WalletPage/>
//       // <Dashboard/>
//       // <StrmlyStudio/>

//     // </ThemedView>
//   )
// }

// export default Home

import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";

export default function Index() {
  const { token, isLoggedIn, user, isOnboarded, hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [token, isLoggedIn]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!hasHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "white", marginTop: 10 }}>Hydrating...</Text>
      </View>
    );
  }

  // Redirect based on authentication status
  if (token && isLoggedIn && !user?.isOnboarded) {
    console.log("✅ User not completed Onboarding, redirecting to Onboarding");
    return <Redirect href="/Interests" />;
  }
  if (token && isLoggedIn) {
    console.log("✅ User is authenticated, redirecting to home");
    return <Redirect href="/(tabs)/home" />;
  } else {
    console.log("❌ User not authenticated, redirecting to sign-in");
    return <Redirect href="/(auth)/Sign-up" />;
  }
}
