import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PlaceholderScreenProps {
  title: string;
}

export default function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="items-center px-6">
        <Text
          className="font-cairo-bold text-lg text-charcoal"
          style={{ writingDirection: 'rtl' }}
        >
          {title}
        </Text>
        <Text
          className="mt-2 font-cairo-medium text-sm text-gray-medium"
          style={{ writingDirection: 'rtl' }}
        >
          قريباً
        </Text>
      </View>
    </SafeAreaView>
  );
}
