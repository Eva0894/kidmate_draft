import React from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function WebViewPage() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();

  if (!url) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: '#999' }}>❌ No URL provided</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Preview</Text>
        <View style={{ width: 60 }} />
      </View>

      <WebView
        source={{ uri: decodeURIComponent(url) }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator size="large" color="#e2ac30" style={{ marginTop: 30 }} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backText: {
    fontSize: 16,
    color: '#e2ac30',
    fontWeight: '600',
  },
});
