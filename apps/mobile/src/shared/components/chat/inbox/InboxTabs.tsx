import { Text, TouchableOpacity, View } from 'react-native';

import type { InboxTab } from './inboxRow';

const TABS: { id: InboxTab; label: string; width: number }[] = [
  { id: 'ALL', label: 'الكل', width: 86 },
  { id: 'UNREAD', label: 'غير المقروء', width: 112 },
];

/** The yellow الكل / غير المقروء pill (Figma 9191:31834). */
export default function InboxTabs({
  active,
  onChange,
}: {
  active: InboxTab;
  onChange: (tab: InboxTab) => void;
}) {
  return (
    <View className="h-[46px] w-[230px] flex-row items-center justify-center rounded-full bg-[#FBEFCD] px-3 py-1">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            testID={`chat-inbox-tab-${tab.id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.id)}
            className={`h-[34px] items-center justify-center rounded-2xl px-3 ${
              isActive ? 'bg-white' : ''
            }`}
            style={{ width: tab.width }}
          >
            {/* One line: Android measured a negative letter spacing
                narrower than it drew, and wrapped 'غير المقروء' (QA) */}
            <Text
              testID={`chat-inbox-tab-label-${tab.id}`}
              numberOfLines={1}
              className={`text-[14px] leading-[24px] ${
                isActive
                  ? 'font-cairo-bold text-[#111111]'
                  : 'font-cairo-medium text-[#6B6A6A]'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
