/*
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const TOTAL_HOLES = GRID_SIZE * GRID_SIZE;
const GAME_DURATION = 30; // 30 seconds

const moleImg = require('@/assets/images/mole.png');
const bgImg = require('@/assets/images/bg.png');

export default function WhackAMoleGame() {
  const router = useRouter();
  const [holes, setHoles] = useState<number[]>(Array(TOTAL_HOLES).fill(0));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    if (playing && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setPlaying(false);
      Alert.alert('🎉 Great job!', `Your final score: ${score}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [timeLeft, playing]);

  useEffect(() => {
    if (playing) {
      const interval = setInterval(() => {
        showMoles();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [playing]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setPlaying(true);
    showMoles();
  };

  const showMoles = () => {
    const newHoles = Array(TOTAL_HOLES).fill(0);
    const moleCount = Math.floor(Math.random() * 2) + 1; // 1~2 moles at a time

    for (let i = 0; i < moleCount; i++) {
      const idx = Math.floor(Math.random() * TOTAL_HOLES);
      newHoles[idx] = 1;
    }
    setHoles(newHoles);
  };

  const hitMole = (index: number) => {
    if (holes[index] === 1) {
      const newHoles = [...holes];
      newHoles[index] = 0;
      setHoles(newHoles);
      setScore(prev => prev + 1);
    }
  };

  const renderHole = (index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.hole}
        activeOpacity={0.7}
        onPress={() => hitMole(index)}
      >
        {holes[index] === 1 && (
          <Image source={moleImg} style={styles.mole} resizeMode="contain" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={bgImg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{'< back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Whack-a-Mole</Text>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>⏰ Time: {timeLeft}s</Text>
        <Text style={styles.statsText}>🎯 Score: {score}</Text>
      </View>

      <View style={styles.grid}>
        {Array.from({ length: TOTAL_HOLES }).map((_, idx) => renderHole(idx))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backText: {
    fontSize: 16,
    color: '#0077CC',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#0077CC',
  },
  statsRow: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-around',
    width: '80%',
  },
  statsText: {
    fontSize: 18,
    color: '#005577',
  },
  grid: {
    width: width * 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  hole: {
    width: width * 0.22,
    height: width * 0.22,
    margin: 6,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mole: {
    width: '80%',
    height: '80%',
  },
});
*/
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const TOTAL_HOLES = GRID_SIZE * GRID_SIZE;
const GAME_DURATION = 30; // 30 seconds

const moleImg = require('@/assets/images/mole.png');
const bgImg = require('@/assets/images/bg.png');
const explosionImg = require('@/assets/images/explosion.png'); // ✅ 新增爆炸图片

// ✅ 改成对象数组
type Hole = { hasMole: boolean; isExploding: boolean };

export default function WhackAMoleGame() {
  const router = useRouter();
  const [holes, setHoles] = useState<Hole[]>(Array(TOTAL_HOLES).fill({ hasMole: false, isExploding: false }));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    if (playing && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setPlaying(false);
      Alert.alert('🎉 Great job!', `Your final score: ${score}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [timeLeft, playing]);

  useEffect(() => {
    if (playing) {
      const interval = setInterval(() => {
        showMoles();
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [playing]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setPlaying(true);
    showMoles();
  };

  const showMoles = () => {
    const newHoles = Array(TOTAL_HOLES).fill({ hasMole: false, isExploding: false });
    const moleCount = Math.floor(Math.random() * 2) + 1; // 1~2 moles

    for (let i = 0; i < moleCount; i++) {
      const idx = Math.floor(Math.random() * TOTAL_HOLES);
      newHoles[idx] = { hasMole: true, isExploding: false };
    }
    setHoles(newHoles);
  };

  const hitMole = (index: number) => {
    if (holes[index].hasMole) {
      const newHoles = [...holes];
      newHoles[index] = { hasMole: false, isExploding: true };
      setHoles(newHoles);
      setScore(prev => prev + 1);

      // 💥 爆炸图显示300ms
      setTimeout(() => {
        const clearedHoles = [...newHoles];
        clearedHoles[index] = { hasMole: false, isExploding: false };
        setHoles(clearedHoles);
      }, 300);
    }
  };

  const renderHole = (index: number) => {
    const hole = holes[index];

    return (
      <TouchableOpacity
        key={index}
        style={styles.hole}
        activeOpacity={0.7}
        onPress={() => hitMole(index)}
      >
        {hole.hasMole && !hole.isExploding && (
          <Image source={moleImg} style={styles.mole} resizeMode="contain" />
        )}
        {hole.isExploding && (
          <Image source={explosionImg} style={styles.mole} resizeMode="contain" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={bgImg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{'< back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Whack-a-Mole</Text>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>⏰ Time: {timeLeft}s</Text>
        <Text style={styles.statsText}>🎯 Score: {score}</Text>
      </View>

      <View style={styles.grid}>
        {Array.from({ length: TOTAL_HOLES }).map((_, idx) => renderHole(idx))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backText: {
    fontSize: 16,
    color: '#0077CC',
  },
  
  statsRow: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-around',
    width: '80%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF', // 白色字体
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)', // 黑色阴影
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  statsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // 白色字体
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)', // 黑色阴影
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  grid: {
    width: width * 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  hole: {
    width: width * 0.22,
    height: width * 0.22,
    margin: 6,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mole: {
    width: '80%',
    height: '80%',
  },
});