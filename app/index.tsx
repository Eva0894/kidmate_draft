import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AnimatedIntro from '@/components/AnimatedIntro';
import BottomLoginSheet from '@/components/BottomLoginSheet';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';

const Page = () => {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace('/chat');
      } else {
        setCheckingSession(false); 
      }
    };
    checkSession();
  }, []);

  if (checkingSession) return null;

  return (
    <View style={styles.container}>
      <AnimatedIntro />
      <BottomLoginSheet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Page;
