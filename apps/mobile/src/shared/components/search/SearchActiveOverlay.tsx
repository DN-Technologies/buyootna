import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface SearchActiveOverlayProps {
  recentSearches: string[];
  popularSearches: string[];
  onSelectSearch: (term: string) => void;
  onRemoveRecent: (term: string) => void;
}

const CloseIcon = ({
  size = 16,
  color = '#94A3B8',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SearchActiveOverlay({
  recentSearches,
  popularSearches,
  onSelectSearch,
  onRemoveRecent,
}: SearchActiveOverlayProps) {
  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <View className="px-5 py-6">
        {/* --- Section 1: Most Searched (الأكثر بحثاً) --- */}
        {popularSearches.length > 0 && (
          <View className="mb-8">
            <Text
              className="mb-4 w-full font-cairo-semibold text-sm text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الأكثر بحثاً
            </Text>
            <View className="flex-row flex-wrap">
              {popularSearches.map((term, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => onSelectSearch(term)}
                  className="ml-2 rounded-full bg-[#F5F7F9] px-4 py-2"
                >
                  <Text className="font-cairo-medium text-sm leading-[20px] text-[#111111]">
                    {term}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* --- Section 2: Recent Searches (عمليات البحث الأخيرة) --- */}
        {recentSearches.length > 0 && (
          <View>
            <Text
              className="mb-2 w-full font-cairo-semibold text-sm text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              عمليات البحث الأخيرة
            </Text>

            <View className="gap-1">
              {recentSearches.map((term, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-1"
                >
                  {/* Right: Search Term */}
                  <TouchableOpacity
                    className="p-1"
                    onPress={() => onSelectSearch(term)}
                  >
                    <Text className="w-full text-right font-cairo-medium text-base text-[#111111]">
                      {term}
                    </Text>
                  </TouchableOpacity>

                  {/* Left: Remove (X) Icon */}
                  <TouchableOpacity onPress={() => onRemoveRecent(term)}>
                    <CloseIcon size={16} color="#989898" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
