import { View } from 'react-native';

// Placeholder blocks shaped like the sections while settings load
const BLOCK_HEIGHTS = [44, 44, 44, 52, 44];

export default function SettingsSkeleton() {
  return (
    <View className="gap-6 px-5">
      {BLOCK_HEIGHTS.map((height, index) => (
        <View
          key={index}
          className="rounded-xl bg-slate-100"
          style={{ height }}
        />
      ))}
    </View>
  );
}
