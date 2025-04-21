import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import meStyles from './meStyles';

export default function InfoListPage() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <TouchableOpacity style={meStyles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={32} color="#E5911B" />
        {/* <Text style={meStyles.backText}>Back</Text> */}
      </TouchableOpacity>

      <ScrollView contentContainerStyle={meStyles.container}>
        <Text style={meStyles.header}>Information Collection List</Text>

        <Text style={meStyles.sectionLabel}>We may collect the following:</Text>
        <View style={meStyles.listBox}>
          <Text style={meStyles.listItem}>• User ID</Text>
          <Text style={meStyles.listItem}>• Email Address</Text>
          <Text style={meStyles.listItem}>• Profile Photo</Text>
          <Text style={meStyles.listItem}>• App usage statistics</Text>
        </View>

        <Text style={meStyles.sectionLabel}>Why we collect this data:</Text>
        <Text style={meStyles.content}>
          This information is used to personalize your experience, enable core features, and improve overall app performance.
        </Text>
      </ScrollView>
    </View>
  );
}