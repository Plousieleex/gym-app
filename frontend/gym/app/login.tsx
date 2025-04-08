import React, { useEffect } from "react";
import { View, Text, Button, Linking } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "LoginScreen">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
 

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Hello</Text>
    </View>
  );
};

export default LoginScreen;
