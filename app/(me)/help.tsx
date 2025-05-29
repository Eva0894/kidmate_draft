import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import meStyles from './meStyles';
import { useNavigation } from '@react-navigation/native';

export default function HelpFeedbackPage() {
  const router = useRouter();
  const navigation = useNavigation();
  
  const handleNavigateBack = () => {
    try {
      console.log('[help] 尝试返回');
      // 先尝试使用router.replace
      console.log('[help] 使用router.replace()');
      router.replace('/(tabs)/me');
    } catch (error) {
      console.error('[help] 导航错误:', error);
      // 如果失败，尝试使用navigation.goBack()
      if (navigation && navigation.canGoBack()) {
        console.log('[help] 降级到navigation.goBack()');
        navigation.goBack();
      } else {
        console.log('[help] 使用router.back()');
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
        <Text style={meStyles.header}>Help & Feedback</Text>

        <Text style={meStyles.sectionLabel}>Need help?</Text>
        <Text style={meStyles.content}>
          If you run into problems using this app, please don't hesitate to get in touch.
        </Text>

        <Text style={meStyles.sectionLabel}>Contact us</Text>
        <View style={meStyles.contactBox}>
          <Text style={meStyles.contactLine}>support@gmail.com</Text>
        </View>

        <Text style={meStyles.sectionLabel}>Your feedback matters</Text>
        <Text style={meStyles.content}>
          We' re working hard to improve your experience. Let us know what you like, what can be better, or if you have any new ideas!
        </Text>
      </ScrollView>
    </View>
  );
}

