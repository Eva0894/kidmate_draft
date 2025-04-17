import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import meStyles from './meStyles';

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <TouchableOpacity onPress={() => router.back()} style={meStyles.backButton}>
        <Ionicons name="arrow-back" size={22} color="#D4A017" />
        <Text style={meStyles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={meStyles.container}>
        <Text style={meStyles.title}>Privacy Policy</Text>

        <Text style={meStyles.sectionLabel}>1. Data We Collect</Text>
        <Text style={meStyles.content}>
          We only collect information that you explicitly provide during registration and use, such as:
        </Text>
        <View style={meStyles.listBox}>
          <Text style={meStyles.listItem}>• Email address</Text>
          <Text style={meStyles.listItem}>• User ID</Text>
          <Text style={meStyles.listItem}>• Profile photo</Text>
          <Text style={meStyles.listItem}>• Birthday & role</Text>
        </View>

        <Text style={meStyles.sectionLabel}>2. How We Use Your Data</Text>
        <Text style={meStyles.content}>
          Your information is used to:
        </Text>
        <View style={meStyles.listBox}>
          <Text style={meStyles.listItem}>• Personalize your experience</Text>
          <Text style={meStyles.listItem}>• Enable user authentication</Text>
          <Text style={meStyles.listItem}>• Provide secure parental controls</Text>
        </View>

        <Text style={meStyles.sectionLabel}>3. Permissions</Text>
        <Text style={meStyles.content}>
          The app may request access to certain device features for functionality:
        </Text>
        <View style={meStyles.listBox}>
          <Text style={meStyles.listItem}>• Media Library – for uploading avatars</Text>
          <Text style={meStyles.listItem}>• Internet – for syncing with Supabase</Text>
        </View>

        <Text style={meStyles.sectionLabel}>4. Data Storage & Security</Text>
        <Text style={meStyles.content}>
          All personal data is securely stored in Supabase. Access is restricted via authenticated sessions. No data is shared with third parties.
        </Text>

        <Text style={meStyles.sectionLabel}>5. Your Rights</Text>
        <Text style={meStyles.content}>
          You can request access, correction, or deletion of your data at any time by contacting us at:
        </Text>
        <View style={meStyles.contactBox}>
          <Text style={meStyles.contactText}>📧 support@gmail.com</Text>
        </View>
      </ScrollView>
    </View>
  );
}