import { Text, TouchableOpacity, View } from 'react-native';

export type OfficeTab = 'about' | 'services' | 'listings';

interface OfficeTabsSwitcherProps {
  activeTab: OfficeTab;
  onTabChange: (tab: OfficeTab) => void;
}

const TABS: { id: OfficeTab; label: string }[] = [
  { id: 'about', label: 'عن المكتب' },
  { id: 'services', label: 'الخدمات' },
  { id: 'listings', label: 'الإعلانات' },
];

export default function OfficeTabsSwitcher({
  activeTab,
  onTabChange,
}: OfficeTabsSwitcherProps) {
  return (
    <View className="mb-6 flex-row items-center border-b border-gray-200">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.id)}
            className={`flex-1 items-center border-b-2 pb-3 ${
              isActive ? 'border-[#15304D]' : 'border-transparent'
            }`}
          >
            <Text
              className={`font-cairo-bold text-base ${
                isActive ? 'text-[#15304D]' : 'text-[#6B6A6A]'
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
