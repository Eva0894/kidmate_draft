import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppProviders from '../components/AppProviders'; 
import { StyleSheet } from 'react-native';
import { LanguageProvider } from '../components/LanguageProvider';
import { UserProvider } from '../components/UserContext';
import { useUsage } from '../src/hooks/useUsage';
import { ThemeProvider } from '@/components/ThemeContext';

export default function RootLayout() {
  useUsage(); // ✅ 启用全局时长控制

  return (
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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', 
  },
});

