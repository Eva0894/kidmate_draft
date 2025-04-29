/*import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

// ✅ 多张图片
const IMAGE_SOURCES = [
  require('@/assets/images/puzzle1.png'),
  require('@/assets/images/puzzle2.png'),
  require('@/assets/images/puzzle3.png'),

];

const GRID_SIZE = 3;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;
const TILE_SIZE = 100;

export default function PuzzleGame() {
  const router = useRouter();
  const [tiles, setTiles] = useState<number[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [currentImage, setCurrentImage] = useState(() => randomImage());

  useEffect(() => {
    resetPuzzle();
  }, []);

  function randomImage() {
    return IMAGE_SOURCES[Math.floor(Math.random() * IMAGE_SOURCES.length)];
  }

  const resetPuzzle = () => {
    let arr = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    do {
      arr = shuffle(arr);
    } while (!isSolvable(arr));
    setTiles(arr);
    setCurrentImage(randomImage()); // ✅ 每次重新开始换一张图
  };

  const shuffle = (array: number[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const isSolvable = (arr: number[]) => {
    let inversions = 0;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] !== TOTAL_TILES - 1 && arr[j] !== TOTAL_TILES - 1 && arr[i] > arr[j]) inversions++;
      }
    }
    return inversions % 2 === 0;
  };

  const handleTilePress = (index: number) => {
    const emptyIndex = tiles.indexOf(TOTAL_TILES - 1);
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);

      if (checkWin(newTiles)) {
        Alert.alert('恭喜！拼图完成 🎉');
      }
    }
  };

  const getValidMoves = (emptyIndex: number) => {
    const moves = [];
    const row = Math.floor(emptyIndex / GRID_SIZE);
    const col = emptyIndex % GRID_SIZE;

    if (row > 0) moves.push(emptyIndex - GRID_SIZE);
    if (row < GRID_SIZE - 1) moves.push(emptyIndex + GRID_SIZE);
    if (col > 0) moves.push(emptyIndex - 1);
    if (col < GRID_SIZE - 1) moves.push(emptyIndex + 1);

    return moves;
  };

  const checkWin = (tilesArr: number[]) => {
    return tilesArr.every((tile, idx) => tile === idx);
  };

  const handleAutoSolve = () => {
    const solvedTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    setTiles(solvedTiles);
    setTimeout(() => {
      Alert.alert('自动完成啦！🎯');
    }, 300);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{'< back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Puzzle Game</Text>

      <View style={styles.grid}>
        {tiles.map((tile, index) => {
          if (tile === TOTAL_TILES - 1 && !showOriginal) {
            return <View key={index} style={[styles.tile, styles.emptyTile]} />;
          }

          const row = Math.floor(tile / GRID_SIZE);
          const col = tile % GRID_SIZE;

          return (
            <TouchableOpacity
              key={index}
              style={styles.tile}
              onPress={() => handleTilePress(index)}
              activeOpacity={0.8}
            >
              <Image
                source={currentImage} // ✅ 显示当前随机出来的那张图
                style={{
                  width: TILE_SIZE * GRID_SIZE,
                  height: TILE_SIZE * GRID_SIZE,
                  transform: [
                    { translateX: -col * TILE_SIZE },
                    { translateY: -row * TILE_SIZE },
                  ],
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => setShowOriginal(true)}
          onPressOut={() => setShowOriginal(false)}
        >
          <Text style={styles.buttonText}>查看原图</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAutoSolve}>
          <Text style={styles.buttonText}>自动复原</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={resetPuzzle}>
          <Text style={styles.buttonText}>重新开始</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#D4A017',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#d28c00',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: TILE_SIZE * GRID_SIZE,
    height: TILE_SIZE * GRID_SIZE,
    alignSelf: 'center',
    marginBottom: 20,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyTile: {
    backgroundColor: '#eee',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#f4c430',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
*/

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const IMAGE_SOURCES = [
  require('@/assets/images/puzzle1.png'),
  require('@/assets/images/puzzle2.png'),
  require('@/assets/images/puzzle3.png'),
];

const TILE_SIZE = 100;

export default function PuzzleGame() {
  const router = useRouter();

  const [gridSize, setGridSize] = useState(3);
  const [tiles, setTiles] = useState<number[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [currentImage, setCurrentImage] = useState(() => randomImage());
  const [moveCount, setMoveCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  const TOTAL_TILES = gridSize * gridSize;

  useEffect(() => {
    resetPuzzle();
  }, [gridSize]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  function randomImage() {
    return IMAGE_SOURCES[Math.floor(Math.random() * IMAGE_SOURCES.length)];
  }

  const resetPuzzle = () => {
    let arr = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    do {
      arr = shuffle(arr);
    } while (!isSolvable(arr));
    setTiles(arr);
    setCurrentImage(randomImage());
    setMoveCount(0);
    setTimeElapsed(0);
    setIsRunning(true);
  };

  const shuffle = (array: number[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const isSolvable = (arr: number[]) => {
    let inversions = 0;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] !== TOTAL_TILES - 1 && arr[j] !== TOTAL_TILES - 1 && arr[i] > arr[j]) inversions++;
      }
    }
    return inversions % 2 === 0;
  };

  const handleTilePress = (index: number) => {
    const emptyIndex = tiles.indexOf(TOTAL_TILES - 1);
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoveCount((prev) => prev + 1);

      if (checkWin(newTiles)) {
        setIsRunning(false);
        Alert.alert(`🎉 恭喜完成!`, `用时 ${timeElapsed} 秒，步数 ${moveCount + 1} 步`);
      }
    }
  };

  const getValidMoves = (emptyIndex: number) => {
    const moves = [];
    const row = Math.floor(emptyIndex / gridSize);
    const col = emptyIndex % gridSize;

    if (row > 0) moves.push(emptyIndex - gridSize);
    if (row < gridSize - 1) moves.push(emptyIndex + gridSize);
    if (col > 0) moves.push(emptyIndex - 1);
    if (col < gridSize - 1) moves.push(emptyIndex + 1);

    return moves;
  };

  const checkWin = (tilesArr: number[]) => {
    return tilesArr.every((tile, idx) => tile === idx);
  };

  const handleAutoSolve = () => {
    const solvedTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    setTiles(solvedTiles);
    setMoveCount(0);
    setIsRunning(false);
    setTimeout(() => {
      Alert.alert(`🔗 自动完成！`, `用时 ${timeElapsed} 秒`);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>{'< back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Puzzle Game</Text>

      {/* 关卡选择按钮 */}
      <View style={styles.levelContainer}>
        {[3, 4, 5].map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.levelButton, gridSize === size && styles.levelButtonActive]}
            onPress={() => setGridSize(size)}
          >
            <Text style={styles.levelText}>{size}x{size}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 计时器和步数显示 */}
      <Text style={styles.infoText}>⏱ {timeElapsed}s | 👣 {moveCount}步</Text>

      {/* 拼图网格 */}
      <View style={[styles.grid, { width: TILE_SIZE * gridSize, height: TILE_SIZE * gridSize }]}>
        {tiles.map((tile, index) => {
          if (tile === TOTAL_TILES - 1 && !showOriginal) {
            return <View key={index} style={[styles.tile, styles.emptyTile]} />;
          }

          const row = Math.floor(tile / gridSize);
          const col = tile % gridSize;

          return (
            <TouchableOpacity
              key={index}
              style={styles.tile}
              onPress={() => handleTilePress(index)}
              activeOpacity={0.8}
            >
              <Image
                source={currentImage}
                style={{
                  width: TILE_SIZE * gridSize,
                  height: TILE_SIZE * gridSize,
                  transform: [
                    { translateX: -col * TILE_SIZE },
                    { translateY: -row * TILE_SIZE },
                  ],
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 辅助按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => setShowOriginal(true)}
          onPressOut={() => setShowOriginal(false)}
        >
          <Text style={styles.buttonText}>查看原图</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAutoSolve}>
          <Text style={styles.buttonText}>自动复原</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={resetPuzzle}>
          <Text style={styles.buttonText}>重新开始</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#D4A017',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#d28c00',
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  levelButton: {
    backgroundColor: '#eee',
    marginHorizontal: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelButtonActive: {
    backgroundColor: '#d4a017',
  },
  levelText: {
    color: '#333',
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
    color: '#888',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    marginBottom: 20,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyTile: {
    backgroundColor: '#eee',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#f4c430',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
