export const options = {
  headerShown: false,
};

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ParentMainPage() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.sectionGroup}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.header}>👪 Parent Dashboard</Text>

        {/* Parental Control */}
        <TouchableOpacity
          onPress={() => router.push('/(parent)/parental-control')}
          style={styles.imageCard}
        >
          <Image
            source={require('@/assets/images/time-control.jpg')}
            style={styles.iconImage}
            resizeMode="contain"
          />
          <Text style={styles.imageLabel}>Parental Control</Text>
        </TouchableOpacity>

        {/* Weekly Report */}
        <TouchableOpacity
          onPress={() => router.push('/(parent)/weekly-report')}
          style={styles.imageCard}
        >
          <Image
            source={require('@/assets/images/weekly-report.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
          <Text style={styles.imageLabel}>Weekly Report</Text>
        </TouchableOpacity>

        {/* Subscription */}
        <TouchableOpacity
          onPress={() => router.push('/(parent)/subscription')}
          style={styles.imageCard}
        >
          <Image
            source={require('@/assets/images/subscribe.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
          <Text style={styles.imageLabel}>Subscription</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E5911B',
    marginBottom: 20,
    paddingHorizontal: 4,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  sectionGroup: {
    gap: 16,
    marginBottom: 30,
  },
  imageCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconImage: {
    width: 120,
    height: 120,
  },
  imageLabel: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

