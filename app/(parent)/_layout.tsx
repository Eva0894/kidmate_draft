import { Stack } from 'expo-router';

export default function MeLayout() {
  return (
<Stack
  screenOptions={{
    headerShown: true,
    headerTitleAlign: 'center',
    headerBackTitleVisible: false,
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