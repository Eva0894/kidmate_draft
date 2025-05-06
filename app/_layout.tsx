import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppProviders from '../components/AppProviders'; 
import { StyleSheet } from 'react-native';
import { LanguageProvider } from '../components/LanguageProvider';
import { UserProvider } from '../components/UserContext';
import { useUsage } from '@/hooks/useUsage'; // ✅ 引入时长控制 Hook

export default function RootLayout() {
  useUsage(); // ✅ 启用全局时长控制

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AppProviders>
            <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
              <UserProvider>
                <Slot />
              </UserProvider>
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

