import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/Supabase';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';

export default function AvatarUploader() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Fetch avatar error:', error.message);
      } else {
        setAvatarUrl(data.avatar_url || null);
      }
    };

    fetchAvatar();
  }, []);

  const handleUpload = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  
    if (result.canceled || !result.assets || !result.assets[0].base64) {
      return;
    }
  
    try {
      setLoading(true);
      const base64Data = result.assets[0].base64;
      const buffer = decode(base64Data); // 转为 ArrayBuffer
  
      const filePath = `${user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, buffer, {
          upsert: true,
          contentType: 'image/jpeg',
        });
  
      if (uploadError) {
        console.error('Upload Failed:', uploadError.message);
        Alert.alert('Upload Failed', uploadError.message);
        setLoading(false);
        return;
      }
  
      const { data: publicURLData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
  
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicURLData.publicUrl })
        .eq('user_id', user.id);
  
      if (updateError) {
        console.error('Failed to update user record:', updateError.message);
        Alert.alert('Failed to update user info');
      } else {
        setAvatarUrl(publicURLData.publicUrl);
        Alert.alert('Upload Success!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleUpload} disabled={loading}>
        {loading ? (
          <View style={styles.avatarPlaceholder}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" style={styles.avatarIcon} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    backgroundColor: '#ccc',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 50,
    color: '#fff',
  },
});