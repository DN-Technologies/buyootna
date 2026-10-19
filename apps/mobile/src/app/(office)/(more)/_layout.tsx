import { Stack } from 'expo-router';

import { useResetStackOnBlur } from '@/shared/navigation/useResetStackOnBlur';

// Explicit Stack layout for this nested group so that screens rendered in this group
// (such as office-edit-profile) are presented as full-screen stacks without the
// floating CustomTabBar from the parent Tabs navigator appearing on top.
export default function OfficeMoreLayout() {
  // Leaving this group forgets its screens, so "back" from the next one
  // opened here never lands on an older form left underneath
  useResetStackOnBlur();
  return <Stack screenOptions={{ headerShown: false }} />;
}
