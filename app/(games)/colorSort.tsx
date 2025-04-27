import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
// import RewardConfetti from '@/components/RewardConfetti';

const screenWidth = Dimensions.get('window').width;

const COLORS = [
  { name: 'red', hex: '#e74c3c' },
  { name: 'blue', hex: '#3498db' },
  { name: 'yellow', hex: '#f1c40f' },
];

type Ball = {
  id: number;
  color: string;
  position: Animated.ValueXY;
  original: { x: number, y: number };
  placed: boolean;
};

function getRandomPosition(index: number) {
  const x = Math.floor(Math.random() * (screenWidth - 80));
  const y = 120 + index * 60 + Math.floor(Math.random() * 40);
  return { x, y };
}

export default function ColorSortGame() {
  const router = useRouter();
  // const [showConfetti, setShowConfetti] = useState(false);

  const [balls, setBalls] = useState<Ball[]>(
    COLORS.flatMap((c, i) => {
      const pos1 = getRandomPosition(i);
      const pos2 = getRandomPosition(i + 3);
      return [
        {
          id: i * 2,
          color: c.name,
          position: new Animated.ValueXY(pos1),
          original: pos1,
          placed: false,
        },
        {
          id: i * 2 + 1,
          color: c.name,
          position: new Animated.ValueXY(pos2),
          original: pos2,
          placed: false,
        },
      ];
    })
  );

  const checkCompletion = (updated: Ball[]) => {
    if (updated.every((b) => b.placed)) {
      // setShowConfetti(true);
      Alert.alert('🎉 Well done!', 'You sorted all the colors!');
      // setTimeout(() => setShowConfetti(false), 2500);
    }
  };

  const createResponder = (ball: Ball, index: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !ball.placed,
      onPanResponderGrant: () => {
        ball.position.setOffset({
          x: ball.position.x._value,
          y: ball.position.y._value,
        });
        ball.position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: ball.position.x, dy: ball.position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        ball.position.flattenOffset();

        let success = false;
        let newX = 0;
        let newY = 0;

        COLORS.forEach((c, idx) => {
          const bucketX = (screenWidth / 3) * idx + screenWidth / 6 - 40;
          const bucketY = 420;
          const withinX = Math.abs(gesture.moveX - bucketX) < 110;
          const withinY = Math.abs(gesture.moveY - bucketY) < 110;
          if (withinX && withinY && c.name === ball.color) {
            success = true;
            newX = bucketX - 40;
            newY = bucketY - 80;
          }
        });

        if (success) {
          const updated = [...balls];
          updated[index].placed = true;
          setBalls(updated);
          ball.position.setValue({ x: newX, y: newY });
          checkCompletion(updated);
        } else {
          Animated.spring(ball.position, {
            toValue: {
              x: ball.original.x,
              y: ball.original.y,
            },
            useNativeDriver: false,
          }).start();
        }
      },
    });

  return (
    <View style={styles.container}>
      {/* <RewardConfetti visible={showConfetti} /> */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Color Sort</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.bucketRow}>
        {COLORS.map((c) => (
          <View key={c.name} style={[styles.bucket, { backgroundColor: c.hex + '33' }]}>
            <Text style={{ color: c.hex, fontWeight: 'bold' }}>{c.name.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      {balls.map((ball, index) => {
        const pan = createResponder(ball, index).panHandlers;
        return (
          <Animated.View
            key={ball.id}
            style={[styles.ball, { backgroundColor: ball.color }, ball.position.getLayout()]}
            {...pan}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 60,
    marginTop: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#e2ac30',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  bucketRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 60,
  },
  bucket: {
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#aaa',
  },
  ball: {
    width: 50,
    height: 50,
    position: 'absolute',
    borderRadius: 25,
  },
});