import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/errorBoundary';
import { PaperProvider } from 'react-native-paper';

export default function App() {
  return (
      <ErrorBoundary>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </ErrorBoundary>
  );
}