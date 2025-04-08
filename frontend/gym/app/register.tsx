import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

export default function Register() {
    const [nameSurname, setNameSurname] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [phone, setPhone] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [passwordAgain, setPasswordAgain] = React.useState('')

    const handleNameSurnameChange = (text: string) => setNameSurname(text)
    const handleEmailChange = (text: string) => setEmail(text)
    const handlePhoneChange = (text: string) => setPhone(text)
    const handlePasswordChange = (text: string) => setPassword(text)
    const handlePasswordAgainChange = (text: string) => setPasswordAgain(text)

    const handleRegister = () => {
        fetch('http://10.0.2.2:3000/Api/v1/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name_surname: nameSurname,
                email,
                phone_number: phone,
                password,
                passwordConfirmation: passwordAgain,
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Name Surname"
                placeholderTextColor="#888"
                onChange={(e) => handleNameSurnameChange(e.nativeEvent.text)}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                onChange={(e) => handleEmailChange(e.nativeEvent.text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#888"
                keyboardType='numeric'
                onChange={(e) => handlePhoneChange(e.nativeEvent.text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={true}
                autoComplete='password'
                onChange={(e) => handlePasswordChange(e.nativeEvent.text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password Again"
                placeholderTextColor="#888"
                secureTextEntry={true}
                autoComplete='password'
                onChange={(e) => handlePasswordAgainChange(e.nativeEvent.text)}
            />
            <Button onPress={() => handleRegister()} title='Register' />
        </View>
    )
}

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