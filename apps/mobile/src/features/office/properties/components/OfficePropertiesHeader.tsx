import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

interface OfficePropertiesHeaderProps {
  title: string;
  onMenuPress?: () => void;
  // The main tab: «+» adds an ad. A governorate: back instead
  onAddPress?: () => void;
  onBackPress?: () => void;
}

/** Figma "pages title": ⋮ on the left, the title, then + or back. */
export default function OfficePropertiesHeader({
  title,
  onMenuPress,
  onAddPress,
  onBackPress,
}: OfficePropertiesHeaderProps) {
  return (
    <View className="h-[52px] flex-row items-center justify-between px-4 py-1.5">
      {onBackPress ? (
        <TouchableOpacity
          testID="office-properties-back"
          accessibilityRole="button"
          accessibilityLabel="رجوع"
          onPress={onBackPress}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Image
            source={require('@/assets/icons/office-properties/header-back.svg')}
            style={{ width: 20, height: 20, transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          testID="office-properties-add"
          accessibilityRole="button"
          accessibilityLabel="اضافة اعلان"
          onPress={onAddPress}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Image
            source={require('@/assets/icons/office-properties/header-plus.svg')}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
      )}

      <Text
        numberOfLines={1}
        className="flex-1 text-center font-cairo-semibold text-[18px] leading-[23px] text-[#111111]"
      >
        {title}
      </Text>

      <TouchableOpacity
        testID="office-properties-menu"
        accessibilityRole="button"
        accessibilityLabel="خيارات"
        onPress={onMenuPress}
        disabled={!onMenuPress}
        className="h-8 w-8 items-center justify-center rounded-full"
      >
        <Image
          source={require('@/assets/icons/office-properties/header-menu.svg')}
          style={{ width: 20, height: 20 }}
        />
      </TouchableOpacity>
    </View>
  );
}
