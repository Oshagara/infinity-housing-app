import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/errorBoundary';
import { useEffect, useRef } from 'react';
import { Platform, View, Text, AppState, AppStateStatus } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Conditionally import Android-specific APIs
let BackHandler: any = null;
let ToastAndroid: any = null;

if (Platform.OS === 'android') {
  try {
    const RN = require('react-native');
    BackHandler = RN.BackHandler;
    ToastAndroid = RN.ToastAndroid;
  } catch (error) {
    console.warn('Android APIs not available:', error);
  }
}

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF',
    accent: '#34C759',
    background: '#ffffffff',
    surface: '#ffffff',
    text: '#262626ff',
  },
};

export default function App() {
  const backPressCount = useRef(0);
  const appState = useRef(AppState.currentState);

  // Function to clear all user data
  const clearAllUserData = async () => {
    try {
      console.log('🚪 App closed - Clearing all user data...');
      
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
        'saved_properties',
      ];

      for (const key of keysToRemove) {
        await AsyncStorage.removeItem(key);
      }

      console.log('✅ All user data cleared on app close');
    } catch (error) {
      console.error('❌ Error clearing data on app close:', error);
    }
  };

  // Check for old data on app start
  useEffect(() => {
    const checkForOldData = async () => {
      try {
        console.log('🔍 Checking for user data on app start...');
        
        const accessToken = await AsyncStorage.getItem('access_token');
        const userInfo = await AsyncStorage.getItem('user_info');
        
        if (accessToken || userInfo) {
          console.log('✅ Found existing user data - user is logged in');
        } else {
          console.log('✅ No user data found on app start - user needs to login');
        }
      } catch (error) {
        console.error('❌ Error checking for user data:', error);
      }
    };

    checkForOldData();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log('📱 App state changed:', appState.current, '→', nextAppState);
      
      // Only clear data when app is being terminated, not when going to background
      if (
        appState.current === 'background' && 
        nextAppState === 'inactive'
      ) {
        console.log('🚪 App being terminated - logging out user');
        clearAllUserData();
      }
      
      // Ensure nextAppState is of type AppStateStatus
      appState.current = nextAppState as AppStateStatus;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Also clear data when component unmounts (app is being closed)
    return () => {
      console.log('🚪 App component unmounting - clearing user data');
      clearAllUserData();
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    // Only run on Android and if BackHandler is available
    if (Platform.OS !== 'android' || !BackHandler) return;

    const onBackPress = () => {
      if (backPressCount.current === 0) {
        if (ToastAndroid) {
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        }
        backPressCount.current = 1;
        setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);
        return true; // prevent default behavior
      } else {
        // Clear user data before exiting
        clearAllUserData();
        if (BackHandler && BackHandler.exitApp) {
          BackHandler.exitApp();
        }
        return true;
      }
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <ErrorBoundary>
        <AppNavigator />
        <Toast
          config={{
            success: (internalState) => (
              <View style={{ padding: 15, backgroundColor: 'green', borderRadius: 8 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{internalState.text1}</Text>
                <Text style={{ color: 'white' }}>{internalState.text2}</Text>
              </View>
            ),
          }}
        />

      </ErrorBoundary>
    </PaperProvider>
  );
}