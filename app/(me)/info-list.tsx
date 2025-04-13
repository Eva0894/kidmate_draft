import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InfoListPage() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#D4A017" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Information Collection List</Text>

        <Text style={styles.sectionLabel}>We may collect the following:</Text>
        <View style={styles.listBox}>
          <Text style={styles.listItem}>• User ID</Text>
          <Text style={styles.listItem}>• Email Address</Text>
          <Text style={styles.listItem}>• Profile Photo</Text>
          <Text style={styles.listItem}>• App usage statistics</Text>
        </View>

        <Text style={styles.sectionLabel}>Why we collect this data:</Text>
        <Text style={styles.content}>
          This information is used to personalize your experience, enable core features, and improve overall app performance.
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
    marginBottom: 12,
    color: '#222',
  },
  listBox: {
    backgroundColor: '#fce9c6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 28,
    color: '#333',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});
