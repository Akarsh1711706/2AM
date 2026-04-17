import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="mood" />
      <Stack.Screen name="matching" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="end" />
    </Stack>
  );
}
