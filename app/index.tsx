import { StyleSheet } from 'react-native';
import ThemedView from "../components/ThemedView";
import VideoFeed from './(dashboard)/long/VideoFeed';

import WalletPage from './(dashboard)/wallet/wallet';
import VideoContentGifting from './(payments)/Video/VideoContentGifting';

const Home = () => {
  return (
    // <ThemedView style={styles.container}>
      
      <VideoContentGifting creatorProfile='' creatorName='Irshad' creatorUsername='@User123'/>
      // <VideoFeed/>
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