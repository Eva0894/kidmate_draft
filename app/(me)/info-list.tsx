import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import meStyles from './meStyles';
import { useNavigation } from '@react-navigation/native';

export default function InfoListPage() {
  const router = useRouter();
  const navigation = useNavigation();

  const handleNavigateBack = () => {
    try {
      console.log('[info] 尝试返回');
      // 先尝试使用router.replace
      console.log('[info] 使用router.replace()');
      router.replace('/(tabs)/me');
    } catch (error) {
      console.error('[info] 导航错误:', error);
      // 如果失败，尝试使用navigation.goBack()
      if (navigation && navigation.canGoBack()) {
        console.log('[info] 降级到navigation.goBack()');
        navigation.goBack();
      } else {
        console.log('[info] 使用router.back()');
        router.back();
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <TouchableOpacity style={meStyles.backButton} onPress={handleNavigateBack}>
        <Ionicons name="arrow-back" size={32} color="#E5911B" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={meStyles.container}>
        <Text style={meStyles.header}>Information Collection List</Text>

        <Text style={meStyles.sectionLabel}>We may collect the following:</Text>
        <View style={meStyles.listBox}>
          <Text style={meStyles.listItem}>• User ID</Text>
          <Text style={meStyles.listItem}>• Email Address</Text>
          <Text style={meStyles.listItem}>• Profile Photo</Text>
          <Text style={meStyles.listItem}>• App usage statistics</Text>
        </View>

        <Text style={meStyles.sectionLabel}>Why we collect this data:</Text>
        <Text style={meStyles.content}>
          This information is used to personalize your experience, enable core features, and improve overall app performance.
        </Text>
      </ScrollView>
    </View>
  );
}