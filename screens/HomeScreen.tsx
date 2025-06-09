// screens/HomeScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'AgentHome'>;

export default function HomeScreen({ navigation }: Props) {
  const handleLogout = () => {
    // Optional: clear token if you're using AsyncStorage
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏡 Welcome to Infinity Housing</Text>
      <Text style={styles.subtitle}>You are successfully logged in.</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 20 },
});
