import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import meStyles from './meStyles';

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
      <TouchableOpacity onPress={() => router.back()} style={meStyles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#D4A017" />
        <Text style={meStyles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={meStyles.container}>
        <Text style={meStyles.title}>About This App</Text>

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
