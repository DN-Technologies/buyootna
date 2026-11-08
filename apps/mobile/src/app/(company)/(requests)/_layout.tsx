import { Stack } from 'expo-router';

import { useResetStackOnBlur } from '@/shared/navigation/useResetStackOnBlur';

export default function CompanyRequestsGroupLayout() {
  // Each visit starts from the request just opened: a request left in this
  // stack (a private one opened from the home) was what «رجوع» from a public
  // request opened from «الطلبات» landed on (QA)
  useResetStackOnBlur();
  return <Stack screenOptions={{ headerShown: false }} />;
}
