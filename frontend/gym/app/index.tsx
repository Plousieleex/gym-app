import React, { useEffect, useState } from "react";
import { Link, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./login";
import HomeScreen from "./screens/home";
import { RootStackParamList } from "../types/navigation";

import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();

  return (
   <View>
      <Button onPress={() => router.navigate('/register')} title="Go To Register" />
   </View>
  );
}
