import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import RewardConfetti from '@/components/RewardConfetti';

const screenWidth = Dimensions.get('window').width;
// const [showConfetti, setShowConfetti] = useState(false);

export default function NumberGame() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const shuffled = Array.from({ length: 10 }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5
    );
    setNumbers(shuffled);
  }, []);

  const handlePress = (num: number) => {
    if (num === current) {
      if (current === 10) {
        Alert.alert('🎉 Great Job!', 'You tapped all the numbers!');
        // setShowConfetti(true);
        // setTimeout(() => setShowConfetti(false), 3000);
      }
      setCurrent(current + 1);
    } else {
      Alert.alert('Oops!', 'Tap the correct next number!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Number Tap</Text>
        <Text style={{ width: 60 }} />
      </View>

      {/* Number grid */}
      <View style={styles.grid}>
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            onPress={() => handlePress(num)}
            disabled={num < current}
            style={[
              styles.numberBox,
              num < current && styles.passedBox,
            ]}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* <RewardConfetti visible={showConfetti} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: {
    height: 60,
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#e2ac30',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 40,
  },
  numberBox: {
    width: (screenWidth - 80) / 4,
    height: 60,
    backgroundColor: '#e0e0e0',
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  passedBox: {
    backgroundColor: '#c8e6c9',
  },
  numberText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});
