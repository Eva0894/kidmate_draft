// app/index.tsx
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AnimatedIntro from '@/components/AnimatedIntro';
import BottomLoginSheet from '@/components/BottomLoginSheet';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';

export default function IndexPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
  
        if (session?.access_token) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
  
          if (userError) {
            console.log('Error getting user:', userError.message);
            setCheckingSession(false);
            return;
          }
  
          if (userData?.user) {
            router.replace('/main');
          } else {
            setCheckingSession(false);
          }
        } else {
          setCheckingSession(false);
        }
      } catch (error) {
        console.log('Unexpected error:', error);
        setCheckingSession(false);
      }
    };
  
    checkSession();
  }, []);
  
  

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A017" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedIntro />
      <BottomLoginSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
  },
});
