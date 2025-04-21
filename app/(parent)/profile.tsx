import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { supabase } from '@/utils/Supabase';
import { useUser } from '@/components/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Href } from 'expo-router';


export default function ProfilePage() {
  const { userId } = useUser();
  const [childAccounts, setChildAccounts] = useState<any[]>([]);
  const [newChildEmail, setNewChildEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchChildAccounts();
  }, []);

  const fetchChildAccounts = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('parent_child')
      .select('child_id, children:child_id (email)')
      .eq('parent_id', userId);
    if (error) {
      console.error('获取失败:', error.message);
    } else {
      setChildAccounts(data || []);
    }
  };

  const handleAddChild = async () => {
    if (!userId || !newChildEmail) return;
    const { data: childUser, error: fetchError } = await supabase
      .from('users')
      .select('user_id')
      .ilike('email', newChildEmail.trim())
      .single();
    console.log('正在尝试绑定 child 邮箱:', newChildEmail);

    if (fetchError || !childUser) {
      Alert.alert('Cannot find this account');
      return;
    }
    const { error } = await supabase
      .from('parent_child')
      .insert({ parent_id: userId, child_id: childUser.user_id });
    if (error) {
      Alert.alert('fail to link', error.message);
    } else {
      setNewChildEmail('');
      fetchChildAccounts();
    }
  };

  const handleRemoveChild = async (childId: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('parent_child')
      .delete()
      .match({ parent_id: userId, child_id: childId });
    if (error) {
      Alert.alert('删除失败', error.message);
    } else {
      fetchChildAccounts();
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout failed', error.message);
    } else {
      router.replace('/');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={32} color="#E5911B" />
        {/* <Text style={styles.backText}>Back</Text> */}
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 子账户列表 */}
      <View style={styles.section}>
        <Text style={styles.privacyTitle}>My Children</Text>
        {childAccounts.length > 0 ? (
          childAccounts.map((child) => (
            <View key={child.child_id} style={styles.item}>
              <Text style={styles.itemText}>{child.children?.email}</Text>
              <TouchableOpacity onPress={() => handleRemoveChild(child.child_id)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ padding: 20, color: '#999' }}>No bound child account yet</Text>
        )}
      </View>

      {/* 添加子账户 */}
      <View style={styles.section}>
        <Text style={styles.privacyTitle}>Add Child Email</Text>
        <TextInput
          value={newChildEmail}
          onChangeText={setNewChildEmail}
          placeholder="Enter child's email"
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddChild}>
          <Text style={styles.addButtonText}>Add Link</Text>
        </TouchableOpacity>
      </View>

      {/* 隐私政策 */}
      <Text style={styles.privacyTitle}>Privacy</Text>
      <View style={styles.section}>
        {[
          { title: 'Privacy policy', path: '/(me)/privacy' },
          { title: 'Information collection list', path: '/(me)/info-list' },
          { title: 'Help & Feedback', path: '/(me)/help' },
          { title: 'About', path: '/(me)/about' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            // onPress={() => router.push(item.path)}
            onPress={() => router.push(item.path as Href<string>)}
          >
            <Text style={styles.itemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A017" />
          </TouchableOpacity>
        ))}
      </View>

      {/* 退出按钮 */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8EC',
  },
  header: {
    backgroundColor: '#FDF1D6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  privacyTitle: {
    backgroundColor: '#FCF2D9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: '#F2E7C7',
  },
  itemText: {
    fontSize: 16,
    color: '#222',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    margin: 16,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutBtn: {
    marginVertical: 30,
    marginHorizontal: 50,
    paddingVertical: 14,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  
});
