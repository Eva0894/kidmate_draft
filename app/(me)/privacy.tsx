import { Stack } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import meStyles from './meStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicy() {
  const router = useRouter();
  const navigation = useNavigation();
  
  const handleNavigateBack = () => {
    try {
      console.log('[privacy] 尝试返回');
      // 先尝试使用router.replace
      console.log('[privacy] 使用router.replace()');
      router.replace('/(tabs)/me');
    } catch (error) {
      console.error('[privacy] 导航错误:', error);
      // 如果失败，尝试使用navigation.goBack()
      if (navigation && navigation.canGoBack()) {
        console.log('[privacy] 降级到navigation.goBack()');
        navigation.goBack();
      } else {
        console.log('[privacy] 使用router.back()');
        router.back();
      }
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff8ee' }}>
      <View style={{ flex: 1, backgroundColor: '#fff8ee' }}>
        <TouchableOpacity onPress={handleNavigateBack} style={meStyles.backButton}>
          <Ionicons name="arrow-back" size={32} color="#E5911B" />
          {/* <Text style={meStyles.backText}>Back</Text> */}
        </TouchableOpacity>

        <ScrollView contentContainerStyle={meStyles.container}>
          <Text style={meStyles.header}>Privacy Policy</Text>

          <Text style={meStyles.sectionLabel}>1. Data We Collect</Text>
          <Text style={meStyles.content}>
            We only collect information that you explicitly provide during registration and use, such as:
          </Text>
          <View style={meStyles.listBox}>
            <Text style={meStyles.listItem}>• Email address</Text>
            <Text style={meStyles.listItem}>• User ID</Text>
            <Text style={meStyles.listItem}>• Profile photo</Text>
            <Text style={meStyles.listItem}>• Birthday & role</Text>
          </View>

          <Text style={meStyles.sectionLabel}>2. How We Use Your Data</Text>
          <Text style={meStyles.content}>
            Your information is used to:
          </Text>
          <View style={meStyles.listBox}>
            <Text style={meStyles.listItem}>• Personalize your experience</Text>
            <Text style={meStyles.listItem}>• Enable user authentication</Text>
            <Text style={meStyles.listItem}>• Provide secure parental controls</Text>
          </View>

          <Text style={meStyles.sectionLabel}>3. Permissions</Text>
          <Text style={meStyles.content}>
            The app may request access to certain device features for functionality:
          </Text>
          <View style={meStyles.listBox}>
            <Text style={meStyles.listItem}>• Media Library – for uploading avatars</Text>
            <Text style={meStyles.listItem}>• Internet – for syncing with Supabase</Text>
          </View>

          <Text style={meStyles.sectionLabel}>4. Data Storage & Security</Text>
          <Text style={meStyles.content}>
            All personal data is securely stored in Supabase. Access is restricted via authenticated sessions. No data is shared with third parties.
          </Text>

          <Text style={meStyles.sectionLabel}>5. Your Rights</Text>
          <Text style={meStyles.content}>
            You can request access, correction, or deletion of your data at any time by contacting us at:
          </Text>
          <View style={meStyles.contactBox}>
            <Text style={meStyles.contactText}>📧 support@gmail.com</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}