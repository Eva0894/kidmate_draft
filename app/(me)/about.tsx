import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, LogBox } from 'react-native';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import meStyles from './meStyles';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function AboutPage() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    // Log component loading
    console.log('[About] Component mounted');
    
    navigation.setOptions({
      headerShown: true,
      title: 'About',
    });
    
    return () => {
      // Log component unloading
      console.log('[About] Component unmounted');
    };
  }, [navigation]);

  const handleNavigateBack = () => {
    try {
      console.log('[about] Attempting to return');
      // First try using router.replace
      console.log('[about] Using router.replace()');
      router.replace('/(tabs)/me');
    } catch (error) {
      console.error('[about] Navigation error:', error);
      // If that fails, try using navigation.goBack()
      if (navigation && navigation.canGoBack()) {
        console.log('[about] Falling back to navigation.goBack()');
        navigation.goBack();
      } else {
        console.log('[about] Using router.back()');
        router.back();
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <TouchableOpacity onPress={handleNavigateBack} style={meStyles.backButton}>
        <Ionicons name="arrow-back" size={32} color="#E5911B" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={meStyles.container}>
        <Text style={meStyles.header}>About This App</Text>

        <Text style={meStyles.sectionTitle}>Purpose</Text>
        <Text style={meStyles.content}>
          This app provides a personalized, AI-powered learning experience designed especially for children, with built-in parental guidance tools.
        </Text>

        <Text style={meStyles.sectionTitle}>Core Features</Text>
        <Text style={meStyles.listItem}>• Interactive educational activities</Text>
        <Text style={meStyles.listItem}>• Chat with AI</Text>
        <Text style={meStyles.listItem}>• Multi-language support</Text>
        <Text style={meStyles.listItem}>• Parental control and profile management</Text>

        <View style={styles.versionBox}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyRight}>© 2025 Your Company Name. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  versionBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#f9e7c1',
    borderRadius: 10,
  },
  versionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  copyRight: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
});
