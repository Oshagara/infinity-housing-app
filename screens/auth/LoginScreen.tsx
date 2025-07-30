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

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (field: string, value: string) => setForm({ ...form, [field]: value });

 /**  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await login({
        email: form.email,
        password: form.password,
      });

      if (response.availableRoles.length > 1) {
        // Show role selection prompt
        Alert.alert(
          'Select Role',
          'You have accounts as both Agent and Tenant. Please select which role you want to use:',
          [
            {
              text: 'Agent',
              onPress: () => {
                // Use agent data
                console.log('Login successful as Agent:', response.agentData);
                navigation.navigate('AgentHome');
              },
            },
            {
              text: 'Tenant',
              onPress: () => {
                // Use tenant data
                console.log('Login successful as Tenant:', response.tenantData);
                navigation.navigate('TenantHome');
              },
            },
          ]
        );
      } else {
        // Single role available, proceed with login
        const role = response.availableRoles[0];
        const data = role === 'agent' ? response.agentData : response.tenantData;
        console.log(`Login successful as ${role}:`, data);
        navigation.navigate(role === 'agent' ? 'AgentHome' : 'TenantHome');
      }
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Please check your credentials and try again'
      );
    } finally {
      setIsLoading(false);
    }
  }; **/


const handleLogin = async () => {
  if (!form.email.trim() || !form.password.trim()) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  try {
    setIsLoading(true);
    const response = await login({
      email: form.email,
      password: form.password,
    });

    // Debug full response
    console.log('🔍 FULL LOGIN RESPONSE:', response);

    if (response.availableRoles.length > 1) {
      Alert.alert(
        'Select Role',
        'You have accounts as both Agent and Tenant. Please select which role you want to use:',
        [
          {
            text: 'Agent',
            onPress: async () => {
              const token = response.agentData.access_token;
              const agent = response.agentData.agent;

              await AsyncStorage.setItem('access_token', token);
              await AsyncStorage.setItem('agent_info', JSON.stringify(agent));

              console.log('✅ Stored agent token:', token);
              console.log('✅ Stored agent info:', agent);

              navigation.navigate('AgentHome');
            },
          },
          {
            text: 'Tenant',
            onPress: async () => {
              const token = response.tenantData.access_token;
              const tenant = response.tenantData.agent; // adjust if different key

              await AsyncStorage.setItem('access_token', token);
              await AsyncStorage.setItem('agent_info', JSON.stringify(tenant)); // still use same key if structure matches

              console.log('✅ Stored tenant token:', token);
              console.log('✅ Stored tenant info:', tenant);

              navigation.navigate('TenantHome');
            },
          },
        ]
      );
    } else {
      // Single role — Agent or Tenant
      const role = response.availableRoles[0];
      const isAgent = role === 'landlord';
      const data = isAgent ? response.agentData : response.tenantData;

      const token = data.access_token;
      const user = data.agent;

      await AsyncStorage.setItem('access_token', token);
      await AsyncStorage.setItem('agent_info', JSON.stringify(user));
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('email', form.email.trim().toLowerCase());
      await AsyncStorage.setItem('name', user.name); // Store name if available
      console.log(`✅ Stored ${role} token:`, token);
      console.log(`✅ Stored ${role} info:`, user);

      navigation.navigate(isAgent ? 'AgentHome' : 'TenantHome');
    }
  } catch (error) {
    Alert.alert(
      'Login Failed',
      error instanceof Error ? error.message : 'Please check your credentials and try again'
    );
  } finally {
    setIsLoading(false);
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
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => handleChange('email', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
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
            <ActivityIndicator color="#fff" />
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
    color: '#111111ff',
  },
  subtitle: {
    fontSize: 16,
    color: '#111111ff',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#111111ff',
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
