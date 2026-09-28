import { Text, TouchableOpacity, View } from 'react-native';

export type FavoritesTab = 'properties' | 'companies' | 'offices';

interface FavoritesTabsProps {
  activeTab: FavoritesTab;
  onTabChange: (tab: FavoritesTab) => void;
}

export default function FavoritesTabs({
  activeTab,
  onTabChange,
}: FavoritesTabsProps) {
  const tabs: { key: FavoritesTab; label: string }[] = [
    { key: 'properties', label: 'عقارات' },
    { key: 'companies', label: 'شركات' },
    { key: 'offices', label: 'مكاتب' },
  ];

  return (
    <View className="w-full flex-row items-center justify-center border-b border-[#EBECEE] px-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onTabChange(tab.key)}
            className="h-11 flex-1 flex-col items-center justify-between pt-3.5"
          >
            <Text
              className={`text-[15px] ${
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
