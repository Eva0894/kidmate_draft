import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';

const puzzleSize = 50;
const tolerance = 10;

const CaptchaSlider = ({ onSuccess }: { onSuccess: () => void }) => {
  const [targetX] = useState(Math.floor(Math.random() * 100) + 100); // 缺口位置
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        const distance = Math.abs(gesture.dx - targetX);
        if (distance < tolerance) {
          Alert.alert('验证成功', '您通过了人机验证');
          onSuccess();
        } else {
          Alert.alert('验证失败', '请再试一次');
          pan.setValue({ x: 0, y: 0 });
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Text style={styles.tip}>请拖动拼图滑块完成验证</Text>
      <View style={styles.imageContainer}>
        {/* 背景图 */}
        <Image
          source={require('@/assets/slider_bg.jpg')}
          style={styles.image}
        />

        {/* 缺口遮罩 */}
        <View
          style={[
            styles.cutout,
            {
              left: targetX,
            },
          ]}
        />

        {/* 拼图块 */}
        <Animated.Image
          source={require('@/assets/puzzle_piece.png')}
          style={[
            styles.puzzle,
            {
              transform: [{ translateX: pan.x }],
              top: 30,
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    alignItems: 'center',
  },
  tip: {
    fontSize: 16,
    marginBottom: 10,
  },
  imageContainer: {
    width: 300,
    height: 150,
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cutout: {
    position: 'absolute',
    width: puzzleSize,
    height: puzzleSize,
    backgroundColor: '#ccc',
    opacity: 0.6,
    top: 30,
    borderRadius: 6,
  },
  puzzle: {
    position: 'absolute',
    width: puzzleSize,
    height: puzzleSize,
    borderRadius: 6,
    zIndex: 10,
  },
});

export default CaptchaSlider;