import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export type CategoryType = 'all' | 'drawing' | 'cartoon' | 'course' | 'reading';

interface CategoryTab {
  id: CategoryType;
  label: string;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', label: '全部' },
  { id: 'drawing', label: '绘画' },
  { id: 'cartoon', label: '动画' },
  { id: 'course', label: '课程' },
  { id: 'reading', label: '阅读' },
];

interface CategoryTabsProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <View style={styles.categoryContainer}>
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.tab,
            activeCategory === category.id && styles.activeTab
          ]}
          onPress={() => onCategoryChange(category.id)}
        >
          <Text 
            style={[
              styles.tabText,
              activeCategory === category.id && styles.activeTabText
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginVertical: 5,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
}); 