import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, Button } from 'react-native';

const OtpInput = () => {
    const [code, setCode] = useState('');
    const [codeValidFlag, setCodeValidFlag] = useState(true);
    const [isSuccessFlag, setIsSuccessFlag] = useState(true);
    const [timeLeft, setTimeLeft] = useState(60);

    const inputRef = useRef<TextInput>(null);
    const router = useRouter();

    const handleChange = (text: string) => {
        // Sadece rakam ve en fazla 6 karakter al
        const sanitized = text.replace(/[^0-9]/g, '').slice(0, 6);
        setCode(sanitized);
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleVerifyCode = () => {

        if (code.length !== 6) {
            setCodeValidFlag(false);
            return;
        }

        if (isSuccessFlag && codeValidFlag) {
            router.replace('/screens/home');
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, }}>VERIFICATION CODE</Text>
            <TouchableWithoutFeedback onPress={() => inputRef.current && inputRef.current.focus()}>
                <View style={styles.container}>
                    {/* Gizli TextInput */}
                    <TextInput
                        ref={inputRef}
                        value={code}
                        onChangeText={handleChange}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={styles.hiddenInput}
                        autoFocus
                    />
                    {/* Görsel kutular */}
                    <View style={styles.boxContainer}>
                        {[...Array(6)].map((_, index) => (
                            <View key={index} style={styles.box}>
                                <Text style={styles.digit}>{code[index] || ''}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <Text style={{ marginTop: 20 }}>Enter the code sent to your email</Text>
            <View style={{ width: '60%', marginTop: 20 }}>
                <Button title='Verify' onPress={() => handleVerifyCode()} />
            </View>
            {codeValidFlag ? <></> : !codeValidFlag && (
                <Text style={{ color: 'red', marginTop: 10 }}>
                    Please enter a valid code.
                </Text>
            )
            }
            {!isSuccessFlag && codeValidFlag ? <></> : !isSuccessFlag && (
                <Text style={{ color: 'red', marginTop: 10 }}>
                    Code could not verified! Please try again.
                </Text>
            )}

            <Text style={{ marginTop: 20, fontSize: 16, color: timeLeft === 0 ? 'red' : 'black' }}>
                {timeLeft > 0 ? `Code expires in ${timeLeft} seconds` : 'Code expired!'}
            </Text>

            <TouchableWithoutFeedback onPress={() => setTimeLeft(60)} disabled={timeLeft > 0}>
                <Text style={{ marginTop: 50 }}>Resend Code</Text>
            </TouchableWithoutFeedback>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 100,
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
    },
    boxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 280,
    },
    box: {
        width: 40,
        height: 50,
        borderWidth: 2,
        borderColor: '#888',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    digit: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default OtpInput;
