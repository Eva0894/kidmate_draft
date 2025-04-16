import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppProviders from '../components/AppProviders'; 
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { LanguageProvider } from '../components/LanguageProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AppProviders>
            <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
              <Slot />
            </SafeAreaView>
          </AppProviders>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', 
  },
});
