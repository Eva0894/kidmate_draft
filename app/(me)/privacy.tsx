import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#D4A017" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Privacy Policy</Text>

        <Text style={styles.sectionLabel}>1. Data We Collect</Text>
        <Text style={styles.content}>
          We only collect information that you explicitly provide during registration and use, such as:
        </Text>
        <View style={styles.listBox}>
          <Text style={styles.listItem}>• Email address</Text>
          <Text style={styles.listItem}>• User ID</Text>
          <Text style={styles.listItem}>• Profile photo</Text>
          <Text style={styles.listItem}>• Birthday & role</Text>
        </View>

        <Text style={styles.sectionLabel}>2. How We Use Your Data</Text>
        <Text style={styles.content}>
          Your information is used to:
        </Text>
        <View style={styles.listBox}>
          <Text style={styles.listItem}>• Personalize your experience</Text>
          <Text style={styles.listItem}>• Enable user authentication</Text>
          <Text style={styles.listItem}>• Provide secure parental controls</Text>
        </View>

        <Text style={styles.sectionLabel}>3. Permissions</Text>
        <Text style={styles.content}>
          The app may request access to certain device features for functionality:
        </Text>
        <View style={styles.listBox}>
          <Text style={styles.listItem}>• Media Library – for uploading avatars</Text>
          <Text style={styles.listItem}>• Internet – for syncing with Supabase</Text>
        </View>

        <Text style={styles.sectionLabel}>4. Data Storage & Security</Text>
        <Text style={styles.content}>
          All personal data is securely stored in Supabase. Access is restricted via authenticated sessions. No data is shared with third parties.
        </Text>

        <Text style={styles.sectionLabel}>5. Your Rights</Text>
        <Text style={styles.content}>
          You can request access, correction, or deletion of your data at any time by contacting us at:
        </Text>
        <View style={styles.contactBox}>
          <Text style={styles.contactText}>📧 support@gmail.com</Text>
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
    marginBottom: 24,
    color: '#333',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#222',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  listBox: {
    backgroundColor: '#fce9c6',
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  listItem: {
    fontSize: 16,
    color: '#333',
    lineHeight: 28,
  },
  contactBox: {
    backgroundColor: '#e9f5db',
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
  },
});
