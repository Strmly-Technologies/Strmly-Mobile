import { StyleSheet } from 'react-native';
import ThemedView from "../components/ThemedView";
import VideoFeed from './(dashboard)/long/VideoFeed';
import Signin from './(auth)/signin';
import ForgotPassword from './(auth)/forgotpass';
import CreateProfile from './CreateProfile/CreateProfile';

const Home = () => {
  return (
    // <ThemedView style={styles.container}>

      //<VideoFeed/>
      <CreateProfile/>
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