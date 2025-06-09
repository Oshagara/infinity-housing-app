// screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardTypeOptions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';
import { register } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

type RegistrationData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type Step = {
  title: string;
  field: keyof RegistrationData;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
  secureTextEntry?: boolean;
};
export default function RegisterScreen({ route, navigation }: Props) {
  const { userType } = route.params ?? { userType: undefined };
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const steps: Step[] = [
    {
      title: 'Tell me your name, Buddy!',
      field: 'name',
      placeholder: 'Enter your full name',
      keyboardType: 'default',
    },
    {
      title: 'Would like to Send you updates',
      field: 'email',
      placeholder: 'Enter your email',
      keyboardType: 'email-address',
    },
    {
      title: 'Just for Emergency!',
      field: 'phone',
      placeholder: 'Enter your phone number',
      keyboardType: 'phone-pad',
    },
    {
      title: 'Secure your account now!',
      field: 'password',
      placeholder: 'Create a password',
      keyboardType: 'default',
      secureTextEntry: true,
    },
    {
      title: 'For Clarity!',
      field: 'confirmPassword',
      placeholder: 'Confirm your password',
      keyboardType: 'default',
      secureTextEntry: true,
    },
  ];

  const validateField = (field: keyof RegistrationData, value: string): boolean => {
    switch (field) {
      case 'name':
        if (!value.trim()) {
          setError('Please enter your name');
          return false;
        }
        break;
      case 'email':
        if (!value.trim()) {
          setError('Please enter your email');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(value)) {
          setError('Please enter a valid email');
          return false;
        }
        break;
      case 'phone':
        if (!value.trim()) {
          setError('Please enter your phone number');
          return false;
        }
        if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          setError('Please enter a valid 10-digit phone number');
          return false;
        }
        break;
      case 'password':
        if (!value) {
          setError('Please enter a password');
          return false;
        }
        if (value.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          setError('Please confirm your password');
          return false;
        }
        if (value !== formData.password) {
          setError('Passwords do not match');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const openEmailApp = async () => {
    try {
      // Try to open Gmail first
      const gmailUrl = 'googlegmail://co';
      const canOpenGmail = await Linking.canOpenURL(gmailUrl);
      
      if (canOpenGmail) {
        await Linking.openURL(gmailUrl);
      } else {
        // Try to open Outlook
        const outlookUrl = 'ms-outlook://';
        const canOpenOutlook = await Linking.canOpenURL(outlookUrl);
        
        if (canOpenOutlook) {
          await Linking.openURL(outlookUrl);
        } else {
          // Fallback to default mailto
          await Linking.openURL('mailto:');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email app');
    }
  };

  const handleContinue = async () => {
    const currentField = steps[currentStep].field;
    if (!validateField(currentField, formData[currentField])) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        setIsLoading(true);
        await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: userType,
        });
        
        Alert.alert(
          'Registration Successful!',
          'Please check your email for verification link to complete your registration.',
          [
            {
              text: 'Open Email',
              onPress: openEmailApp,
            },
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } catch (error) {
        Alert.alert(
          'Registration Failed',
          error instanceof Error ? error.message : 'Please try again later'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const currentField = steps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.subtitle}>
        {userType === 'tenant' ? 'Tenant Registration' : 'Agent Registration'}
      </Text>

      <View style={styles.content}>
        <Text style={styles.title}>{currentField.title}</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder={currentField.placeholder}
          value={formData[currentField.field as keyof RegistrationData]}
          onChangeText={(text) => {
            setFormData({ ...formData, [currentField.field]: text });
            setError(''); // Clear error when user types
          }}
          keyboardType={currentField.keyboardType}
          secureTextEntry={currentField.secureTextEntry}
        />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {currentStep === steps.length - 1 ? 'Complete Registration' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: -20,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
