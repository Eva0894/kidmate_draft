import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../utils/Supabase';

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const { email, password, firstName, lastName, dob } = useLocalSearchParams();

  const handleCheckEmailVerified = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Missing email or password.');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(email),
      password: String(password),
    });

    if (signInError) {
      console.error('Sign-in error:', signInError.message);
      Alert.alert('Login Failed', 'Please try again.');
      return;
    }

    // 登录成功，插入 users 表
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error('Get user error:', userError?.message);
      Alert.alert('Error', 'Please try again later.');
      return;
    }

    const userId = userData.user.id;

    // 随机默认头像
    const animalList = [
      'eagle', 'fox', 'giraffe', 'koala', 'lion', 'owl', 'panda', 'penguin', 'tiger', 'zebra'
    ];
    const randomAnimal = animalList[Math.floor(Math.random() * animalList.length)];
    const avatarUrl = `https://dgizrlyymkxenkeddmdj.supabase.co/storage/v1/object/public/default-avatar/${randomAnimal}.png`;

    const randomUsername = randomAnimal + Math.floor(1000 + Math.random() * 9000);

    // 写入用户表
    const { error: insertError } = await supabase.from('users').insert({
      user_id: userId,
      email: email,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dob,
      avatar_url: avatarUrl,
      user_name: randomUsername,
      is_active: true,
    });

    if (insertError) {
      console.error('Insert user error:', insertError.message);
      Alert.alert('Error', 'Failed to create user profile.');
      return;
    }

    Alert.alert('Registration Completed!', 'Welcome!');
    router.replace('/(tabs)/main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please Check Your Email</Text>
      <Text style={styles.subtitle}>We have sent a verification link to your email address.</Text>

      <TouchableOpacity style={styles.button} onPress={handleCheckEmailVerified}>
        <Text style={styles.buttonText}>I Have Verified</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#ff69b4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});