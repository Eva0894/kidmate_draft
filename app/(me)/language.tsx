import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LanguagePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Language',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/mepage')}>
              <Ionicons name="arrow-back" size={24} color="#D4A017" />
            </TouchableOpacity>
          ),
        }}
      />
      <Text style={styles.text}>Select your preferred language.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
  },
});
