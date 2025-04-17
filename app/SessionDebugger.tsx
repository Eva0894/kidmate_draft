import React from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function SessionDebugger() {
  const { isLoaded, isSignedIn, sessionId, userId, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Clerk Session 调试工具</Text>
      <Text>✅ isLoaded: {String(isLoaded)}</Text>
      <Text>✅ isSignedIn: {String(isSignedIn)}</Text>
      <Text>🆔 userId: {userId ?? '无'}</Text>
      <Text>🔑 sessionId: {sessionId ?? '无'}</Text>

      {isSignedIn && (
        <Button title="退出登录" onPress={() => signOut()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
