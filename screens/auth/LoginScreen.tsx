// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStack';
import { login } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);

      // Clear all existing data before storing new user data
      await clearAllUserData();

      const response = await login({
        email: form.email,
        password: form.password,
      });

      // Debug full response
      console.log('🔍 FULL LOGIN RESPONSE:', response);

      // Extract user data and role from response
      const user = response.user;
      const role = response.role; // This is now the verified role from database
      const token = response.token;
      const isLandlord = role === 'landlord';

      console.log('🔍 Login Response Summary:');
      console.log('🔍 User ID:', user?.id || user?.userId || user?._id);
      console.log('🔍 User Email:', user?.email);
      console.log('🔍 User Name:', user?.name || user?.fullName);
      console.log('🔍 Verified Role:', role);
      console.log('🔍 Is Landlord:', isLandlord);
      console.log('🔍 Token Available:', !!token);

      if (!user || !token) {
        throw new Error('No valid user data or token found');
      }

      // Store all necessary data with fallbacks
      try {
        // Store token
        if (token) {
          await AsyncStorage.setItem('access_token', token);
          console.log('✅ Stored access_token');
        }

        // Store user info
        if (user) {
          await AsyncStorage.setItem('user_info', JSON.stringify(user));
          console.log('✅ Stored user_info', user);
        }

        // Store role
        await AsyncStorage.setItem('role', role);
        console.log('✅ Stored role:', role);

        // Debug: Verify role was stored correctly
        const storedRole = await AsyncStorage.getItem('role');
        console.log('🔍 Verification - Stored role:', storedRole);
        console.log('🔍 Verification - Role matches:', storedRole === role);

        // Store email
        await AsyncStorage.setItem('email', form.email.trim().toLowerCase());
        console.log('✅ Stored email');

        // Store name (with fallback)
        const userName = user?.name || user?.fullName || 'User';
        await AsyncStorage.setItem('name', userName);
        console.log('✅ Stored name:', userName);

        // Store user ID (with fallback)
        const userId = user?.id || user?.userId || user?._id || '';
        if (userId) {
          await AsyncStorage.setItem('user_id', userId);
          console.log('✅ Stored user_id:', userId);
        }

        // Store role-specific info
        if (role === 'landlord') {
          await AsyncStorage.setItem('landlord_info', JSON.stringify(user));
          console.log('✅ Stored landlord_info');
        } else if (role === 'tenant') {
          await AsyncStorage.setItem('tenant_info', JSON.stringify(user));
          console.log('✅ Stored tenant_info');
        }

        // Store additional user data
        if (user?.phone) {
          await AsyncStorage.setItem('phone', user.phone);
          console.log('✅ Stored phone');
        }

        if (user?.email) {
          await AsyncStorage.setItem('user_email', user.email);
          console.log('✅ Stored user_email');
        }

        // Final verification - check all stored data
        console.log('🔍 Final verification of stored data:');
        const finalRole = await AsyncStorage.getItem('role');
        const finalUserInfo = await AsyncStorage.getItem('user_info');
        const finalLandlordInfo = await AsyncStorage.getItem('landlord_info');
        const finalTenantInfo = await AsyncStorage.getItem('tenant_info');
        
        console.log('🔍 Final role:', finalRole);
        console.log('🔍 Final user_info exists:', !!finalUserInfo);
        console.log('🔍 Final landlord_info exists:', !!finalLandlordInfo);
        console.log('🔍 Final tenant_info exists:', !!finalTenantInfo);

        console.log(`✅ Successfully stored all data for ${role}`);
        console.log(`✅ User data:`, user);
        console.log(`✅ Token:`, token);

        // Navigate based on verified role
        console.log('🔍 About to navigate...');
        console.log('🔍 role value:', role);

        if (isLandlord) {
          console.log('🚀 Navigating to LandlordHome');
          navigation.navigate('LandlordHome');
        } else {
          console.log('🚀 Navigating to TenantHome');
          navigation.navigate('TenantHome');
        }

      } catch (storageError) {
        console.error('❌ Error storing data:', storageError);
        Alert.alert('Storage Error', 'Failed to save login data');
      }
    } catch (error) {
      // console.error('❌ Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error instanceof Error ? error.message : 'Please check your credentials and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllUserData = async () => {
    try {
      console.log('🧹 Clearing all existing user data...');

      // Clear all authentication and user data
      const keysToRemove = [
        'user_info',
        'user',
        'access_token',
        'role',
        'email',
        'name',
        'user_id',
        'phone',
        'user_email',
        'landlord_info',
        'tenant_info',
        'saved_properties', // Also clear saved properties
      ];

      for (const key of keysToRemove) {
        await AsyncStorage.removeItem(key);
      }

      console.log('✅ All user data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>Kindly login to access our premium/reliable property Listings</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9a9a9aff"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => handleChange('email', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9a9a9aff"
          secureTextEntry
          value={form.password}
          onChangeText={(v) => handleChange('password', v)}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator
              color="#fff"
              size="large"
            />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('UserType')}
        >
          <Text style={styles.registerText}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#292929ff',
  },
  subtitle: {
    fontSize: 16,
    color: '#424242ff',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
    color: '#161616ff',
  },
  button: {
    backgroundColor: '#007AFF',
    color: '#ffffffff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
