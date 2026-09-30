import { Stack } from 'expo-router';

// Explicit Stack layout for this nested group so that screens rendered in this group
// (such as office-edit-profile) are presented as full-screen stacks without the
// floating CustomTabBar from the parent Tabs navigator appearing on top.
export default function OfficeMoreLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
