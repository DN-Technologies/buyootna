import { View } from 'react-native';

import type { AlertDetailRow } from '@/features/individual/utils/alertDetails';

import AlertDetailBox from './AlertDetailBox';

export default function AlertDetailsGrid({ rows }: { rows: AlertDetailRow[] }) {
  return (
    <View className="gap-3 py-4">
      {rows.map((row) => (
        <View key={row.map((f) => f.key).join('-')} className="flex-row gap-3">
          {row.map((field) => (
            <AlertDetailBox
              key={field.key}
              title={field.title}
              value={field.value}
              className="flex-1"
              testID={`alert-detail-${field.key}`}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
