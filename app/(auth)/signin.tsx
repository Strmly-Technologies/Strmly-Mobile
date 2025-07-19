import ThemedText from '@/components/ThemedText'
import ThemedView from '@/components/ThemedView'
import React, { useState } from 'react'
import { useFonts } from 'expo-font';
import { Signinstyles } from '@/styles/signin'
import { Image, TextInput, TouchableOpacity } from 'react-native';
import { CreateProfileStyles } from '@/styles/createprofile';

const Signin = () => {
  const [useEmail, setUseEmail] = useState(false)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/poppins/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/poppins/Poppins-Medium.ttf'),
    'Poppins-Light': require('../../assets/fonts/poppins/Poppins-Light.ttf'),
    'Inter-Light': require('../../assets/fonts/inter/Inter-Light.ttf'),
    'Inter-SemiBold': require('../../assets/fonts/inter/Inter-SemiBold.ttf'),
  });

  if (!fontsLoaded) return null;

  if (!useEmail) {
    return (
      <ThemedView style={Signinstyles.Container}>
        <Image source={require('../../assets/icons/logo.svg')}></Image>
        <ThemedText style={Signinstyles.Title}> Sign up for Strmly </ThemedText>
        <ThemedText style={Signinstyles.Text}> Create a profile in India&apos;s first<br /> decrentralized social media platform. </ThemedText>
        <TouchableOpacity onPress={() => setUseEmail(true)} style={Signinstyles.button}>use email</TouchableOpacity>
        <TouchableOpacity onPress={() => alert("Google Sign-in")} style={Signinstyles.button}>Continue with Google</TouchableOpacity>
        <ThemedText style={Signinstyles.Text}>By continuing, you agree to Strmly&apos;s Terms <br />of Use.</ThemedText>
        <br />
        <ThemedText style={Signinstyles.Text16R}>Already have an account?<ThemedText style={Signinstyles.Text16M}> Sign In</ThemedText></ThemedText>

      </ThemedView>
    )
  }
  else {
    return (
      <ThemedView style={Signinstyles.Container}>
        <Image source={require('../../assets/icons/logo.svg')}></Image>
        <ThemedText style={Signinstyles.Title}> Sign in to Strmly </ThemedText>

        <ThemedText style={Signinstyles.Text}>Welcome back to India&apos;s first decentralized<br/> social media platform.</ThemedText>
        <TextInput style={CreateProfileStyles.Input} placeholder='username' value={username} onChangeText={setUsername} />
        <TextInput style={CreateProfileStyles.Input} placeholder='Password' value={password} onChangeText={setPassword} secureTextEntry />
                <TouchableOpacity style={CreateProfileStyles.button}>Sign in</TouchableOpacity>
        <ThemedText style={Signinstyles.Text16R}><ThemedText style={Signinstyles.Text16M}> Forgotten password?</ThemedText></ThemedText>

      </ThemedView>
    )
  }

}

export default Signin