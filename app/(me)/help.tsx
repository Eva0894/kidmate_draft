import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpFeedbackPage() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#D4A017" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Help & Feedback</Text>

        <Text style={styles.sectionLabel}>Need help?</Text>
        <Text style={styles.content}>
          If you run into problems using this app, please don't hesitate to get in touch.
        </Text>

        <Text style={styles.sectionLabel}>Contact us</Text>
        <View style={styles.contactBox}>
          <Text style={styles.contactLine}>support@gmail.com</Text>
        </View>

        <Text style={styles.sectionLabel}>Your feedback matters</Text>
        <Text style={styles.content}>
          We’re working hard to improve your experience. Let us know what you like, what can be better, or if you have any new ideas!
        </Text>
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
    marginBottom: 8,
    color: '#222',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  contactBox: {
    backgroundColor: '#fce9c6',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  contactLine: {
    fontSize: 16,
    color: '#222',
  },
});
