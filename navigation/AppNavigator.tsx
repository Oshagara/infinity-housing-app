import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import LandlordHomeScreen from '../screens/landlord/LandlordHomeScreen';
import LandlordListingsScreen from '../screens/landlord/LandlordListingsScreen';
import LandlordChatbotScreen from '../screens/landlord/LandlordChatbotScreen';
import InquiriesScreen from '../screens/shared/InquiriesScreen';
import { RootStackParamList } from '../types/RootStack';
import PreviewScreen from '../screens/auth/PreviewScreen';
import UserTypeScreen from '../screens/auth/UserTypeScreen';
import AddPropertyScreen from '../screens/landlord/AddPropertyScreen';
import TenantHomeScreen from '../screens/tenant/TenantHomeScreen';
import HomeScreen from '../screens/tenant/HomeScreen';
import PropertyDetails from '../screens/shared/PropertyDetailsScreen';
import EditProfileScreen from '../screens/shared/EditProfileScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import SavedItemsScreen from '../screens/tenant/SavedItemsScreen';
import ChatbotScreen from '../screens/tenant/ChatbotScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import SearchScreen from '../screens/shared/SearchScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';

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
        <Stack.Screen name="LandlordHome" component={LandlordHomeScreen} />
        <Stack.Screen name="TenantHome" component={TenantHomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LandlordListings" component={LandlordListingsScreen} />
        <Stack.Screen name="LandlordChatbot" component={LandlordChatbotScreen} options={{ title: 'Landlord Assistant' }} />
        <Stack.Screen name="Inquiries" component={InquiriesScreen} />
        <Stack.Screen name="AddProperty" component={AddPropertyScreen} options={{ title: 'Add Property' }} />
        <Stack.Screen name="PropertyDetails" component={PropertyDetails} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen name="SavedItems" component={SavedItemsScreen} options={{ title: 'Saved Items' }} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Chat Assistant' }} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: 'Verify Email' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
