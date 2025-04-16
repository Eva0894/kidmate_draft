// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D4A017',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff8e1',
          borderTopWidth: 1,
          borderTopColor: '#eee3b2',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="main"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="eduPage"
        options={{
          title: 'Learning',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="me"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
