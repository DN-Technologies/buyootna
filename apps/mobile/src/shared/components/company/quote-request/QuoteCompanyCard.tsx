import { Feather } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Text, View } from 'react-native';

interface QuoteCompanyCardProps {
  name: string;
  subtitle?: string;
  logoUrl?: string;
}

// Who the quote goes to: logo, name and a one-line subtitle
export default function QuoteCompanyCard({
  name,
  subtitle,
  logoUrl,
}: QuoteCompanyCardProps) {
  return (
    <View className="mb-6 flex-row items-center gap-3 rounded-xl bg-[#F5F7F9] p-3">
      <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#111111]">
        {logoUrl ? (
          <ExpoImage
            source={{ uri: logoUrl }}
            className="h-full w-full"
            contentFit="cover"
          />
        ) : (
          <Feather name="briefcase" size={20} color="#FFFFFF" />
        )}
      </View>
      <View className="flex-1">
        <Text
          className="font-cairo-bold text-[14px] text-[#15304D]"
          style={{ writingDirection: 'rtl' }}
        >
          {name}
        </Text>
        {!!subtitle && (
          <Text
            numberOfLines={1}
            className="font-cairo text-[14px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
