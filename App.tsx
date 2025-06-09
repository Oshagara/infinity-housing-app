import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/errorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}