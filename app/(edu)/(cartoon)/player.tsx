import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';
export default function CartoonPlayerPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const videoRef = useRef(null);
  const [cartoon, setCartoon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartoon = async () => {
      const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .eq('id', id)
        .single();

      //if (!error) setCartoon(data);
      if (!error && data) {
        setCartoon(data);
      
        const { error: updateError } = await supabase
          .from('cartoon')
          .update({ recent_played_at: new Date().toISOString() })
          .eq('id', id);
      
        if (updateError) {
          console.error('❌ recent_played_at 更新失败:', updateError.message);
        } else {
          console.log('✅ recent_played_at 更新成功');
        }
      }
//新加的   
      setLoading(false);
    };

    if (id) fetchCartoon();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}><Text>Loading...</Text></View>
    );
  }

  if (!cartoon) {
    return (
      <View style={styles.center}><Text>Cartoon not found</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#D38300" />
      </TouchableOpacity>
      <Text style={styles.title}>{cartoon.title}</Text>
      <Video
        ref={videoRef}
        source={{ uri: cartoon.video_url }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  video: {
    width: '90%',
    height: 220,
    borderRadius: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});

