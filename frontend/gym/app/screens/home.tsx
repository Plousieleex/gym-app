import React from "react";
import { View, Text, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "HomeScreen">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
 
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Hoş geldiniz! 🎉</Text>
      
    </View>
  );
};

export default HomeScreen;
