import { Text, TouchableOpacity, View } from 'react-native';

export type OfficeTab = 'about' | 'services' | 'listings';

interface OfficeTabsSwitcherProps {
  activeTab: OfficeTab;
  onTabChange: (tab: OfficeTab) => void;
}

const TABS: { id: OfficeTab; label: string }[] = [
  { id: 'about', label: 'عن المكتب' },
  { id: 'services', label: 'الخدمات' },
  { id: 'listings', label: 'الاعلانات' },
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
              // Figma "company tabs": Almarai 14, bold when active
              className={`text-[14px] leading-[20px] ${
                isActive
                  ? 'font-almarai-bold text-[#15304D]'
                  : 'font-almarai text-[#6B6A6A]'
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
