import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import RewardConfetti from '@/components/RewardConfetti';

const screenWidth = Dimensions.get('window').width;

const SHAPES = [
  { type: 'square', color: '#3498db' },
  { type: 'circle', color: '#e67e22' },
  { type: 'triangle', color: '#9b59b6' },
];

const TARGET_X = screenWidth - 130;
const TARGET_Y_START = 200;
const TARGET_SPACING = 110;

export default function ShapeMatchGame() {
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [positions, setPositions] = useState(
    SHAPES.reduce((acc, shape) => {
      acc[shape.type] = new Animated.ValueXY();
      return acc;
    }, {} as Record<string, Animated.ValueXY>)
  );
  const router = useRouter();

  const checkSuccess = (newPlaced: Record<string, boolean>) => {
    const allPlaced = SHAPES.every((s) => newPlaced[s.type]);
    if (allPlaced) {
      Alert.alert('🎉 Well done!', 'You matched all the shapes!');
    }
  };

  const getTargetBounds = (index: number) => {
    const x = TARGET_X + 50;
    const y = TARGET_Y_START + TARGET_SPACING * index + 50;
    return { x, y };
  };

  const createResponder = (shape: string, index: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !placed[shape],
      onPanResponderMove: Animated.event([null, { dx: positions[shape].x, dy: positions[shape].y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        const { x, y } = getTargetBounds(index);
        const withinX = Math.abs(gesture.moveX - x) < 60;
        const withinY = Math.abs(gesture.moveY - y) < 60;

        if (withinX && withinY) {
          Animated.spring(positions[shape], {
            toValue: { x: x - 50, y: y - 50 },
            useNativeDriver: false,
          }).start();

          const newPlaced = { ...placed, [shape]: true };
          setPlaced(newPlaced);
          checkSuccess(newPlaced);
        } else {
          Animated.spring(positions[shape], {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    });

  const renderShape = (type: string, color: string, style: any) => {
    switch (type) {
      case 'circle':
        return <View style={[styles.shapeBase, style, { backgroundColor: color, borderRadius: 50 }]} />;
      case 'square':
        return <View style={[styles.shapeBase, style, { backgroundColor: color }]} />;
      case 'triangle':
        return (
          <View
            style={[
              styles.triangle,
              { borderBottomColor: color },
              style,
            ]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Shape Match</Text>
        <Text style={{ width: 60 }} />
      </View>

      {/* Targets */}
      {SHAPES.map((shape, i) => (
        <View key={shape.type} style={[styles.targetOutline, { top: TARGET_Y_START + i * TARGET_SPACING, left: TARGET_X }]}>
          {renderShape(shape.type, '#ccc', styles.targetShape)}
        </View>
      ))}

      {/* Draggable shapes */}
      {SHAPES.map((shape, i) => {
        const panHandlers = createResponder(shape.type, i).panHandlers;
        return (
          <Animated.View
            key={shape.type}
            style={[positions[shape.type].getLayout(), { position: 'absolute', top: 200 + i * TARGET_SPACING, left: 40 }]}
            {...panHandlers}
          >
            {renderShape(shape.type, shape.color, {})}
          </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  shapeBase: {
    width: 100,
    height: 100,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 100,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  targetOutline: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#aaa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetShape: {
    opacity: 0.3,
  },
});
