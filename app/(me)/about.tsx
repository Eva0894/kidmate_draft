import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutPage() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'About',
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#D4A017" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>About This App</Text>

        <Text style={styles.sectionTitle}>Purpose</Text>
        <Text style={styles.content}>
          This app provides a personalized, AI-powered learning experience designed especially for children, with built-in parental guidance tools.
        </Text>

        <Text style={styles.sectionTitle}>Core Features</Text>
        <Text style={styles.listItem}>• Interactive educational activities</Text>
        <Text style={styles.listItem}>• Chat with AI</Text>
        <Text style={styles.listItem}>• Multi-language support</Text>
        <Text style={styles.listItem}>• Parental control and profile management</Text>

        <View style={styles.versionBox}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyRight}>© 2025 Your Company Name. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backText: {
    fontSize: 16,
    color: '#D4A017',
    marginLeft: 8,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#222',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  listItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    marginLeft: 10,
  },
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
