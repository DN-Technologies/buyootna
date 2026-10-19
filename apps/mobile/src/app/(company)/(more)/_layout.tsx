import { Stack } from 'expo-router';

import { useResetStackOnBlur } from '@/shared/navigation/useResetStackOnBlur';

// Explicit Stack layout for this nested group -- without it, leaving these
// screens undeclared in the parent (company)/_layout.tsx's <Tabs> was NOT
// enough to stop that Tabs navigator's floating CustomTabBar from
// rendering on top of them (confirmed live, even after a full Metro
// restart with a cleared cache). A real nested navigator boundary is what
// actually guarantees the outer Tabs' `tabBar` render prop is never
// invoked for anything in this group, instead of relying on Expo Router's
// implicit "no _layout.tsx = passthrough" behavior.
export default function CompanyMoreLayout() {
  // Leaving this group forgets its screens, so "back" from the next one
  // opened here never lands on an older form left underneath
  useResetStackOnBlur();
  return <Stack screenOptions={{ headerShown: false }} />;
}
