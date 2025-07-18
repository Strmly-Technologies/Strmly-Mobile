import ThemedText from '@/components/ThemedText'
import ThemedView from '@/components/ThemedView'
import React from 'react'
import { useFonts } from 'expo-font';
import { Signinstyles } from '@/styles/signin'
import { Image, TouchableOpacity } from 'react-native';

const Signin = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/poppins/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/poppins/Poppins-Medium.ttf'),
    'Poppins-Light': require('../../assets/fonts/poppins/Poppins-Light.ttf'),
    'Inter-Light': require('../../assets/fonts/inter/Inter-Light.ttf'),
  });

  if (!fontsLoaded) return null;


  return (
    <ThemedView style={Signinstyles.Container}>
      <Image source={require('../../assets/icons/logo.svg')}></Image>
      <ThemedText style={Signinstyles.Title}> Sign up for Strmly </ThemedText>
      <ThemedText style={Signinstyles.Text}> Create a profile in India&apos;s first<br/> decrentralized social media platform. </ThemedText>
      <TouchableOpacity onPress={() => alert("Email Sign-in")} style={Signinstyles.button}>use email</TouchableOpacity>
      <TouchableOpacity onPress={() => alert("Google Sign-in")} style={Signinstyles.button}>Continue with Google</TouchableOpacity>
      <ThemedText style={Signinstyles.Text}>By continuing, you agree to Strmly&apos;s Terms <br/>of Use.</ThemedText>
      <br/>
      <ThemedText style={Signinstyles.Text16R}>Already have an account?<ThemedText style={Signinstyles.Text16M}> Sign In</ThemedText></ThemedText>
      
    </ThemedView>
  )
}


export default Signin