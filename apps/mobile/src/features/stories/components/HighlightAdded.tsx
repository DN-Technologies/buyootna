import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

const GOLD = '#C5A36D';

/** «أضيفت إلى «…»»: shown a moment before the sheet closes. */
export default function HighlightAdded({ title }: { title: string }) {
  return (
    <View testID="highlight-added" className="items-center px-6 py-8" style={{ gap: 10 }}>
      <View
        className="size-[56px] items-center justify-center rounded-full"
        style={{ backgroundColor: `${GOLD}26` }}
      >
        <Feather name="check" size={26} color={GOLD} />
      </View>
      <Text className="font-cairo-semibold text-[16px] text-[#111111]">
        أضيفت إلى «{title}»
      </Text>
    </View>
  );
}
