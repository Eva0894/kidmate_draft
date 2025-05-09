import { Stack } from 'expo-router';

export default function MeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,        // ✅ 隐藏顶部标题栏
        headerTitleAlign: 'center', 
        headerBackVisible: true,  
        headerTintColor: '#D4A017',
        headerStyle: {
          backgroundColor: '#FDF8EC',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#333',
        },
      }}
    />
  );
}
