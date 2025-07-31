import React, { useState, useRef, useContext, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { AuthContext } from './contexts/AuthContext';
import axios from 'axios';
import { Vibration} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const OTP_LENGTH = 6;
const RESEND_LIMIT = 5;

export default function VerifyEmailScreen({ navigation }: any) {
    const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [resendCount, setResendCount] = useState(0);
    const inputs = useRef<Array<TextInput | null>>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { setAuthState, email } = useContext(AuthContext); // email must be set during registration
    const [error, setError] = useState(false);

    const handleChange = (value: string, index: number) => {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }

        const fullCode = newCode.join('');
        if (fullCode.length === OTP_LENGTH && !newCode.includes('')) {
            verifyCode(fullCode);
        }
        if (newCode.every(c => c.length === 1)) {
            verifyCode(); // Optional auto-submit
        }
    };

    const verifyCode = async (codeString?: string) => {
        const fullCode = codeString || code.join('');
        const email = await AsyncStorage.getItem('email');
        if (fullCode.length !== OTP_LENGTH) {
            Vibration.vibrate(100);
            return Alert.alert('Incomplete', 'Enter all 6 digits');
        }

        if (!email) {
            Vibration.vibrate(100);
            return Toast.show({
                type: 'error',
                text1: 'Missing Email',
                text2: 'Please restart the registration process.',
            });
        }

        try {
            setLoading(true);
            const res = await axios.post('https://infinity-housing.onrender.com/auth/verify', {
                email,
                code: fullCode,
            });

            const token = res.data.token;
            setAuthState({ isVerified: true, token, email });

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Email Successfully verified 🎉',
            });

            const role = res.data.user.role;
            navigation.reset({
                index: 0,
                routes: [{ name: role === 'landlord' ? 'AgentHome' : 'TenantHome' }],
            });
        } catch (err: any) {
            Vibration.vibrate(100);
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: err?.response?.data?.message || 'Try again',
            });
        } finally {
            setLoading(false);
        }
    };


    const handleResendCode = async () => {
        if (resendCount >= RESEND_LIMIT) return;
        const email = await AsyncStorage.getItem('email');
        console.log('📤 Resending code for:', email);

        try {
            setLoading(true);
            const res = await axios.post('https://infinity-housing.onrender.com/auth/resend-code', {
                email,
            });

            const { resendCooldown, resendCount: updatedCount } = res.data;

            if (resendCooldown) {
                const diff = Math.ceil((new Date(resendCooldown).getTime() - Date.now()) / 1000);
                setCooldown(diff > 0 ? diff : 0);
            }

            setResendCount(updatedCount || resendCount + 1);
            Toast.show({
                type: 'success',
                text1: 'Code Sent',
                text2: 'A new verification code was sent to your email.',
            });
        } catch (err: any) {
            Vibration.vibrate(100);
            Toast.show({
                type: 'error',
                text1: 'Resend Failed',
                text2: err?.response?.data?.message || 'Please try again later',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cooldown > 0) {
            timerRef.current = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [cooldown]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Email</Text>
            <View style={styles.otpContainer}>
                {code.map((digit, i) => (
                    <TextInput
                        key={i}
                        style={[styles.input, error && styles.inputError]}
                        value={digit}
                        maxLength={1}
                        keyboardType="numeric"
                        onChangeText={(v) => {
                            if (v.length === OTP_LENGTH) {
                                const split = v.split('');
                                setCode(split);
                                inputs.current[OTP_LENGTH - 1]?.focus();
                                verifyCode(); // Optional
                            } else {
                                handleChange(v, i);
                            }
                        }}

                        ref={(ref: TextInput | null): void => {
                            inputs.current[i] = ref;
                        }}
                        onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === 'Backspace' && !code[i] && i > 0) {
                                inputs.current[i - 1]?.focus();
                            }
                        }}
                    />
                ))}
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.disabled]}
                onPress={() => verifyCode()}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.resendButton, cooldown > 0 || resendCount >= RESEND_LIMIT ? styles.disabled : null]}
                onPress={handleResendCode}
                disabled={cooldown > 0 || resendCount >= RESEND_LIMIT}
            >
                <Text style={styles.resendText}>
                    {resendCount >= RESEND_LIMIT
                        ? 'Resend Limit Reached'
                        : cooldown > 0
                            ? `Try again in ${cooldown}s`
                            : 'Resend Code'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
    otpContainer: { flexDirection: 'row', justifyContent: 'center' },
    input: {
        width: 40,
        height: 50,
        margin: 5,
        padding: 2,
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 18,
        borderColor: '#757575ff',
        color: '#363636ff',
    },
    inputError: {
        borderColor: 'red',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        marginTop: 30,
        borderRadius: 8,
        width: '60%',
        alignItems: 'center',
    },
    disabled: {
        backgroundColor: '#999',
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    resendButton: {
        marginTop: 20,
        padding: 10,
    },
    resendText: {
        color: '#007AFF',
        fontSize: 14,
    },
});
