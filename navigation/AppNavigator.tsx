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
import AddPropertyScreen from '../screens/AddPropertyScreen';
import TenantHomeScreen from '../screens/TenantHomeScreen';
import HomeScreen from '../screens/HomeScreen';
import PropertyDetails from '../screens/PropertyDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          animationDuration: 50,
          presentation: 'card',
          contentStyle: { backgroundColor: '#fff' },
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="Preview" component={PreviewScreen} />
        <Stack.Screen name="UserType" component={UserTypeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AgentHome" component={AgentHomeScreen} />
        <Stack.Screen name="TenantHome" component={TenantHomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MyListings" component={MyListingsScreen} />
        <Stack.Screen name="Inquiries" component={InquiriesScreen} />
        <Stack.Screen name="AddProperty" component={AddPropertyScreen} options={{ title: 'Add Property' }} />
        <Stack.Screen name="PropertyDetails" component={PropertyDetails} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
