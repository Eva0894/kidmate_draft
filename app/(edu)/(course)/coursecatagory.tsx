import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const categories = [
  'Literacy',
  'Math',
  'Science',
  'Art',
  'Sport',
  'Emotion',
];

export default function CourseCategoryScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState('Literacy');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#D38300" />
        </TouchableOpacity>
        <Text style={styles.title}>Courses</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.row}>
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, selected === cat && styles.selectedBtn]}
                onPress={() => setSelected(cat)}
              >
                <Text
                  style={[styles.categoryText, selected === cat && styles.selectedText]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.contentArea}>
          {/* 👇后续可添加课程展示 */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D38300',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 100,
    backgroundColor: '#E5E5E5',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingVertical: 16,
  },
  categoryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectedBtn: {
    backgroundColor: '#fff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#c47a00',
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#D38300',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: -8,
    padding: 16,
  },
});