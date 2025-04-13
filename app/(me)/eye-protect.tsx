import { Stack, useRouter } from 'expo-router';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function EyeProtectPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Eye Protection',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/mepage')}>
              <Ionicons name="arrow-back" size={24} color="#D4A017" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.row}>
        <Text style={styles.text}>Enable Eye Protection Mode</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
});
