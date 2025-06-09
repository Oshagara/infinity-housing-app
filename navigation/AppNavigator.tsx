import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import AgentHomeScreen from '../screens/AgentHomeScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import InquiriesScreen from '../screens/InquiriesScreen';
import { RootStackParamList } from '../types/RootStack';
import PreviewScreen from '../screens/PreviewScreen';
import UserTypeScreen from '../screens/UserTypeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Preview" component={PreviewScreen} />
        <Stack.Screen name="UserType" component={UserTypeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AgentHome" component={AgentHomeScreen} />
        <Stack.Screen name="MyListings" component={MyListingsScreen} />
        <Stack.Screen name="Inquiries" component={InquiriesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
