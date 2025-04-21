import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ParentMainPage() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Parent Dashboard</Text>

      <View style={styles.sectionGroup}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={32} color="#E5911B" />
          {/* <Text style={styles.backText}>Back</Text> */}
        </TouchableOpacity>
        {/* Edu History */}
        <Section title="Education History">
          <Text style={styles.subText}>
            Summary of learning activities will be shown here.
          </Text>
        </Section>

        {/* Library History */}
        <Section title="Library History">
          <Text style={styles.subText}>
            Books read by child accounts will appear here.
          </Text>
        </Section>

        {/* AI Chat History */}
        <Section title="AI Chat History">
          <Text style={styles.subText}>
            Conversations with AI assistant will be visible here.
          </Text>
        </Section>

        {/* Parental Control */}
        <Section title="Parental Control">
          <Text style={styles.subText}>
            Set limits, manage access and content filters here.
          </Text>
        </Section>

        {/* Weekly Report */}
        <TouchableSection title="📈 Weekly Report" path="/(parent)/weekly-report" />

        {/* Profile & Subscription */}
        <TouchableSection title="👤 Profile & Subscription" path="/(parent)/profile" />
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function TouchableSection({ title, path }: { title: string; path: Href<string> }) {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push(path)} style={styles.linkCard}>
      <Text style={styles.linkCardText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8EC',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionGroup: {
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkCard: {
    backgroundColor: '#FFF8DC',
    borderColor: '#FACC15',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  linkCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B45309',
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
});
