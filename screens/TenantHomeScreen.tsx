import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'TenantHome'>;

const TenantHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const userJson = await AsyncStorage.getItem('agent_info');
        if (userJson) {
          const user = JSON.parse(userJson);
          setName(user.name || 'Tenant');
        }
      } catch (e) {
        setName('Tenant');
      }
    })();
  }, []);

  const handleLogout = () => {
    // TODO: Implement logout logic (clear tokens, navigate to login, etc.)
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoutButtonContainer}>
        <IconButton
          icon="logout"
          size={24}
          onPress={handleLogout}
          accessibilityLabel="Logout"
        />
      </View>
      <Text style={styles.title}>Hi, {name}!</Text>
      <Text style={styles.subtitle}>Browse, rent, or buy your dream home.</Text>
      <Button
        mode="contained"
        style={[styles.button, { backgroundColor: '#007AFF' }]}
        onPress={() => navigation.navigate('Home')}
      >
        View Properties
      </Button>
      <Button
        mode="outlined"
        style={styles.button}
        labelStyle={{ color: '#007AFF', fontWeight: 'bold' }}
        onPress={() => navigation.navigate('Inquiries')}
      >
        My Inquiries
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  logoutButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4a4a4aff',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    minWidth: 200,
  },
});

export default TenantHomeScreen; 