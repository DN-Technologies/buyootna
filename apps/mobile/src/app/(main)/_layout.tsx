import { Tabs } from 'expo-router';

import CustomTabBar from '@/core/components/CustomTabBar';

export default function MainLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />

      {/* The Center Add Button */}
      <Tabs.Screen
        name="add"
        options={
          {
            // Optional: If we want clicking 'Add' to open a bottom sheet instead of a real screen,
            // we would handle that inside the CustomTabBar onPress logic.
            // For now, it routes to a screen called add.tsx
          }
        }
      />

      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
