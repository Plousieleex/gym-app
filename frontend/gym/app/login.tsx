import React, { useEffect } from "react";
import { View, Text, Button, Linking, TextInput, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { navigate } from "expo-router/build/global-state/routing";
import { useRouter } from "expo-router";

type Props = NativeStackScreenProps<RootStackParamList, "LoginScreen">;

const LoginScreen: React.FC<Props> = ({ }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  const router = useRouter();

  const handleEmailChange = (text: string) => setEmail(text);
  const handlePasswordChange = (text: string) => setPassword(text);
  const handleLogin = async () => {
    fetch('http://10.0.2.2:3000/Api/v1/auth/loginEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then(response => response.json())
      .then(async data => {
        console.log('Success:', data);
        if (data.token) {
          await SecureStore.setItemAsync('auth_token', data.token);
          setIsSuccess(true);
        } else {
          setIsSuccess(false);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    if (isSuccess) {
      router.push('/screens/home');
    }
    else {
      setShowError(true);
    }
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>LOGIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        onChange={(e) => handleEmailChange(e.nativeEvent.text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry={true}
        autoComplete='password'
        onChange={(e) => handlePasswordChange(e.nativeEvent.text)}
      />
      <View style={{ width: '80%', marginTop: 20 }}>
        <Button onPress={() => handleLogin()} title='Login' />
      </View>
      {showError && (
        <Text style={{ color: 'red', marginTop: 10 }}>
          Invalid email or password. Please try again.
        </Text>
      )}
      <Text style={{ marginTop: 50 }}>Or</Text>
      <View style={{ marginTop: 50 }}>
        <Button onPress={() => router.navigate('/register')} title="Create New Account" />
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 12,
    padding: 10,
    width: '80%',
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
    color: '#333',
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})