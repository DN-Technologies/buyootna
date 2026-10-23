import { useLocalSearchParams } from 'expo-router';

import { EditProjectScreen } from '@/features/company/components/portfolio';

export default function EditProjectPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditProjectScreen projectId={String(id)} />;
}
