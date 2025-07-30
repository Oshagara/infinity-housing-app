import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/errorBoundary';
import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { View, Text } from 'react-native';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF',
    accent: '#34C759',
    background: '#fdfdfd',
    surface: '#fff',
    text: '#222',
  },
};

export default function App() {
  const backPressCount = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (backPressCount.current === 0) {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        backPressCount.current = 1;
        setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);
        return true; // prevent default behavior
      } else {
        BackHandler.exitApp();
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