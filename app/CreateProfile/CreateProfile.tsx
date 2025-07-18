import ThemedText from '@/components/ThemedText'
import ThemedView from '@/components/ThemedView'
import React, { useState } from 'react'
import { useFonts } from 'expo-font';
import { CreateProfileStyles } from '@/styles/createprofile'
import { Image, TextInput, TouchableOpacity, View } from 'react-native';

const CreateProfile = () => {
  const [Step, setStep] = useState(1)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/poppins/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/poppins/Poppins-SemiBold.ttf'),
    'Poppins-Medium': require('../../assets/fonts/poppins/Poppins-Medium.ttf'),
    'Poppins-Light': require('../../assets/fonts/poppins/Poppins-Light.ttf'),
    'Inter-Light': require('../../assets/fonts/inter/Inter-Light.ttf'),
    'Inter-SemiBold': require('../../assets/fonts/inter/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../../assets/fonts/inter/Inter-Bold.ttf'),
    'Inter-ExtraBold': require('../../assets/fonts/inter/Inter-ExtraBold.ttf'),
  });

  const HandleStep = (val: boolean) => {
    if (Step > 1 && !val) {
      setStep(prev => prev - 1);
    }

    if (val) {
      setStep(prev => prev + 1);
    }

  }


  if (!fontsLoaded) return null;

  if (Step === 1) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View style={CreateProfileStyles.TopBar}>
          <TouchableOpacity onPress={() => HandleStep(false)}
            style={CreateProfileStyles.BackIcon}>
            <Image
              source={require('../../assets/icons/back.svg')}
            /></TouchableOpacity>
          <ThemedText style={CreateProfileStyles.TopBarTitle}>Create username</ThemedText>
        </View>
        <br />
        <TextInput style={CreateProfileStyles.Input} placeholder='username' value={username} onChangeText={setUsername} />
        <TouchableOpacity onPress={() => HandleStep(true)} style={CreateProfileStyles.button}>Continue</TouchableOpacity>
      </ThemedView>
    )
  }

  if (Step === 2) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View style={CreateProfileStyles.TopBar}>
          <TouchableOpacity onPress={() => HandleStep(false)}
            style={CreateProfileStyles.BackIcon}>
            <Image
              source={require('../../assets/icons/back.svg')}
            /></TouchableOpacity>
          <ThemedText style={CreateProfileStyles.TopBarTitle}>Create a password</ThemedText>
        </View>
        <br />
        <TextInput style={CreateProfileStyles.Input} placeholder='Password' value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity onPress={() => HandleStep(true)} style={CreateProfileStyles.button}>Continue</TouchableOpacity>
      </ThemedView>
    )
  }

  if (Step === 3) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View style={CreateProfileStyles.TopBar}>
          <TouchableOpacity onPress={() => HandleStep(false)}
            style={CreateProfileStyles.BackIcon}>
            <Image
              source={require('../../assets/icons/back.svg')}
            /></TouchableOpacity>
          <ThemedText style={CreateProfileStyles.TopBarTitle} >Enter your email</ThemedText>
        </View>
        <br />
        <TextInput style={CreateProfileStyles.Input} placeholder='Email' value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TouchableOpacity onPress={() => HandleStep(true)} style={CreateProfileStyles.button}>Verify</TouchableOpacity>
      </ThemedView>
    )
  }

  if (Step === 4) {
    return (
      <ThemedView style={CreateProfileStyles.Container}>
        <View style={CreateProfileStyles.TopBar}>
          <TouchableOpacity onPress={() => HandleStep(false)}
            style={CreateProfileStyles.BackIcon}>
            <Image
              source={require('../../assets/icons/back.svg')}
            /></TouchableOpacity>
          <ThemedText style={CreateProfileStyles.TopBarTitle}>Verify email</ThemedText>
        </View>
        <br />
        <ThemedText style={CreateProfileStyles.Text}>Enter the confirmation code that we sent<br/> to {email}</ThemedText>
        <TextInput style={CreateProfileStyles.Input} placeholder='Confirmation Code' value={confirmationCode} onChangeText={setConfirmationCode} />
        <TouchableOpacity onPress={() => HandleStep(true)} style={CreateProfileStyles.button}>Finish</TouchableOpacity>
        <TouchableOpacity><ThemedText style={CreateProfileStyles.ExtraBold}>Resend Code</ThemedText></TouchableOpacity>
      </ThemedView>
    )
  }


  return "Internal Error, Try restarting the app."
}


export default CreateProfile