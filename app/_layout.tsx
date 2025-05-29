import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppProviders from '../components/AppProviders'; 
import { StyleSheet } from 'react-native';
import { LanguageProvider } from '../components/LanguageProvider';
import { UserProvider } from '../components/UserContext';
import { useUsage } from '../src/hooks/useUsage';
import { ThemeProvider } from '@/components/ThemeContext';
import React, { ErrorInfo, useEffect } from 'react';
import { View, Text, LogBox } from 'react-native';

// Ignore specific warnings, these typically occur on Android
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed',
  'EventEmitter.removeListener'
]);

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, errorInfo: ErrorInfo | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render can show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to a reporting service
    console.error("Component rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can customize the fallback UI and render it
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Application Error</Text>
          <Text style={{ marginBottom: 10 }}>Error: {this.state.error?.toString()}</Text>
          <Text>Component Stack: {this.state.errorInfo?.componentStack}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  useUsage(); // ✅ Enable global time control

  // Add navigation-related debug logs
  useEffect(() => {
    console.log('[RootLayout] Initialized');
    return () => console.log('[RootLayout] Unmounted');
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
        <ThemeProvider>
            <LanguageProvider>
              <AppProviders>
                <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
                  <UserProvider>
                    <Slot />
                  </UserProvider>
                </SafeAreaView>
              </AppProviders>
            </LanguageProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', 
  },
});

