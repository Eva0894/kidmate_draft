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

// 忽略特定警告，这些警告通常在Android上产生
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed',
  'EventEmitter.removeListener'
]);

// 错误边界组件
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, errorInfo: ErrorInfo | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error("组件渲染错误:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>应用发生错误</Text>
          <Text style={{ marginBottom: 10 }}>错误: {this.state.error?.toString()}</Text>
          <Text>组件栈: {this.state.errorInfo?.componentStack}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  useUsage(); // ✅ 启用全局时长控制

  // 添加导航相关调试日志
  useEffect(() => {
    console.log('[RootLayout] 初始化');
    return () => console.log('[RootLayout] 卸载');
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

