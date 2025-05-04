import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const Index = () => {
  const router = useRouter();
  useEffect(() => {
    const checkOnboarding = async () => {
      const onboardingStatus = await SecureStore.getItemAsync('onboarding_done');
      console.log('Onboarding status:', onboardingStatus);
      if (onboardingStatus) {
        router.replace('/screens/home');
      } else {
        router.replace('/screens/onboarding');
      }
    };
    checkOnboarding();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hello Canboteus Aurelius</Text>
    </View>
  )
}

export default Index

const styles = StyleSheet.create({})