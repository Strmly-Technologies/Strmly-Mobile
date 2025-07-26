import { StyleSheet } from 'react-native';
import ThemedView from "../components/ThemedView";
import VideoFeed from './(dashboard)/long/VideoFeed';
import WalletPage from './(dashboard)/wallet/wallet';
import VideoContentGifting from './(payments)/Video/VideoContentGifting';
import CommentsSection from './(dashboard)/long/_components/CommentSection';
import KYCForm from './(dashboard)/wallet/_components/KYCForm';
import PublicProfilePage from './(dashboard)/profile/public/PublicProfile';
import PersonalProfilePage from './(dashboard)/profile/personal.PersonalProfile';
import SignIn from './(auth)/Sign-in';


const Home = () => {
  return (
    // <ThemedView style={styles.container}>

    <SignIn/>

    // <PersonalProfilePage/>
    // <PublicProfilePage/>
    // <PublicCommunityPage/>

      // <KYCForm/>
      // <VideoContentGifting creatorProfile='' creatorName='Irshad' creatorUsername='@User123'/>
      // <VideoFeed/>
      // <CommentsSection isOpen={true} onClose={() => {}} videoId={'1'} longVideosOnly={false} />
      // <WalletPage/>


    // </ThemedView>

  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    marginVertical: 20
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    marginVertical: 10,
    borderBottomWidth: 1
  },
})