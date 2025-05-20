import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import meStyles from './meStyles';

export default function HelpFeedbackPage() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <TouchableOpacity style={meStyles.backButton} onPress={() => router.replace('/(tabs)/me')}>
        <Ionicons name="arrow-back" size={32} color="#E5911B" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={meStyles.container}>
        <Text style={meStyles.header}>Help & Feedback</Text>

        <Text style={meStyles.sectionLabel}>Need help?</Text>
        <Text style={meStyles.content}>
          If you run into problems using this app, please don't hesitate to get in touch.
        </Text>

        <Text style={meStyles.sectionLabel}>Contact us</Text>
        <View style={meStyles.contactBox}>
          <Text style={meStyles.contactLine}>support@gmail.com</Text>
        </View>

        <Text style={meStyles.sectionLabel}>Your feedback matters</Text>
        <Text style={meStyles.content}>
          We' re working hard to improve your experience. Let us know what you like, what can be better, or if you have any new ideas!
        </Text>
      </ScrollView>
    </View>
  );
}

