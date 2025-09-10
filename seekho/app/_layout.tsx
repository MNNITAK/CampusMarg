
import { Stack } from 'expo-router';
import {AppProvider} from '@/context/Pathfinder';


export default function RootLayout() {
  return (
    <AppProvider>
    <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="current-destination-select" />
     <Stack.Screen name="current-destination-details" />
     
      <Stack.Screen name="destination-details" />
       <Stack.Screen name="destination-select" />
      <Stack.Screen name="accessibility" />
      <Stack.Screen name="ar-navigation" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </AppProvider>
  );
}