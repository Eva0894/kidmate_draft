/*import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const { width, height } = Dimensions.get('window');

export default function BalloonPopGame() {
  const router = useRouter();
  const [targetColor, setTargetColor] = useState('');
  const [balloons, setBalloons] = useState<any[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  useEffect(() => {
    startGame();
    const interval = setInterval(() => {
      spawnBalloon();
    }, 1000);

    const speedInterval = setInterval(() => {
      setSpeedMultiplier((prev) => prev + 0.2);
    }, 5000); // 每5秒加速

    return () => {
      clearInterval(interval);
      clearInterval(speedInterval);
    };
  }, []);

  const startGame = () => {
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  const spawnBalloon = () => {
    const animation = new Animated.Value(height);
    const id = Date.now();
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const x = Math.random() * (width - 60);

    const newBalloon = { id, color, animation, x };
    setBalloons((prev) => [...prev, newBalloon]);

    Animated.timing(animation, {
      toValue: -100, // 飞出屏幕顶部
      duration: 6000 / speedMultiplier,
      useNativeDriver: true,
    }).start(() => {
      setBalloons((prev) => prev.filter((b) => b.id !== id));
    });
  };

  const handleBalloonPress = (id: number, color: string) => {
    if (color === targetColor) {
      Alert.alert('🎯 成功！', `你成功点破了 ${color} 气球！`);
      setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{'< back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Balloon Pop Game</Text>
      <Text style={styles.target}>🎯 请点击 {targetColor} 气球！</Text>

      <View style={styles.gameArea}>
        {balloons.map((balloon) => (
          <Animated.View
            key={balloon.id}
            style={[
              styles.balloon,
              {
                backgroundColor: balloon.color,
                transform: [{ translateX: balloon.x }, { translateY: balloon.animation }],
                position: 'absolute',
              },
            ]}
          >
            <TouchableOpacity style={{ flex: 1 }} onPress={() => handleBalloonPress(balloon.id, balloon.color)} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    paddingTop: 50,
  },
  backButton: {
    marginLeft: 10,
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#00796b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#00695c',
  },
  target: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#004d40',
  },
  gameArea: {
    flex: 1,
    overflow: 'hidden',
  },
  balloon: {
    width: 60,
    height: 80,
    borderRadius: 30,
    backgroundColor: 'red',
  },
});*/

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];
const TARGET_TIME = 30; // 游戏时间（秒）

export default function BalloonPopGame() {
  const router = useRouter();
  const [balloons, setBalloons] = useState<any[]>([]);
  const [targetColor, setTargetColor] = useState('red');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TARGET_TIME);
  const [gameOver, setGameOver] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      endGame();
    }
  }, [timeLeft]);

  const resetGame = () => {
    setBalloons([]);
    setScore(0);
    setTimeLeft(TARGET_TIME);
    setTargetColor(randomColor());
    setGameOver(false);
    startTimer();
    startSpawning();
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
  };

  const startSpawning = () => {
    spawnBalloon();
    spawnBalloon();
    const spawnInterval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(spawnInterval);
        return;
      }
      spawnBalloon();
    }, 1200);
  };

  const spawnBalloon = () => {
    const left = Math.random() * (screenWidth - 60);
    const color = randomColor();
    const translateY = new Animated.Value(Dimensions.get('window').height);

    const balloon = {
      id: Math.random().toString(),
      color,
      left,
      translateY,
    };

    setBalloons(prev => [...prev, balloon]);

    Animated.timing(translateY, {
      toValue: -100,
      duration: 6000,
      useNativeDriver: true,
    }).start(() => {
      setBalloons(prev => prev.filter(b => b.id !== balloon.id));
    });
  };

  const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  const handlePop = (id: string, color: string) => {
    setBalloons(prev => prev.filter(b => b.id !== id));
    if (color === targetColor) {
      setScore(prev => prev + 1);
      setTargetColor(randomColor());
    }
  };

  const endGame = () => {
    clearInterval(intervalRef.current);
    setGameOver(true);
    Alert.alert('GAME OVER', `YOU GET ${score}SCORES SUCCESSFULY`, [
      { text: 'RESTART', onPress: resetGame },
      { text: 'BACK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{'< back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Balloon Pop Game</Text>
      <Text style={styles.targetText}>🎯 please press {targetColor} balloon！</Text>

      <Text style={styles.infoText}>⏱ TIME：{timeLeft}s   🎈 GOAL：{score}</Text>

      <View style={styles.balloonContainer}>
        {balloons.map(balloon => (
          <Animated.View
            key={balloon.id}
            style={[
              styles.balloon,
              {
                backgroundColor: balloon.color,
                left: balloon.left,
                transform: [{ translateY: balloon.translateY }],
              },
            ]}
          >
            <TouchableOpacity
              style={{ width: '100%', height: '100%' }}
              onPress={() => handlePop(balloon.id, balloon.color)}
              activeOpacity={0.8}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f7f9',
  },
  backButton: {
    margin: 12,
  },
  backText: {
    color: '#1f7a8c',
    fontSize: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#1f7a8c',
  },
  targetText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f7a8c',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#1f7a8c',
  },
  balloonContainer: {
    flex: 1,
  },
  balloon: {
    position: 'absolute',
    width: 60,
    height: 80,
    borderRadius: 30,
  },
});


