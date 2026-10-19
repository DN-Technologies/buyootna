import { useLocalSearchParams } from 'expo-router';

import EndRequestScreen from '@/features/company/components/requests/end/EndRequestScreen';

export default function EndRequestRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <EndRequestScreen id={id} />;
}
