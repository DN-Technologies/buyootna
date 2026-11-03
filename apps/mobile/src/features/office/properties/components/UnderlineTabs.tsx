import { Text, TouchableOpacity, View } from 'react-native';

export interface UnderlineTab<T extends string> {
  id: T;
  label: string;
}

/** Figma "Component 21": equal tabs, navy and underlined when active. */
export default function UnderlineTabs<T extends string>({
  tabs,
  active,
  onChange,
  testID = 'underline-tabs',
}: {
  tabs: UnderlineTab<T>[];
  active: T;
  onChange: (id: T) => void;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      className="flex-row items-center border-b border-[#EBECEE] px-4"
      style={{ gap: 8 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <TouchableOpacity
            key={tab.id}
            testID={`${testID}-${tab.id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.id)}
            className="h-11 flex-1 items-center justify-between pt-3.5"
          >
            <Text
              className={`text-[15px] leading-[18px] ${
                isActive
                  ? 'font-almarai-bold text-[#15304D]'
                  : 'font-almarai text-[#6B6A6A]'
              }`}
            >
              {tab.label}
            </Text>
            <View
              className={`h-[2px] w-full rounded-t-[6px] ${
                isActive ? 'bg-[#15304D]' : 'bg-transparent'
              }`}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
