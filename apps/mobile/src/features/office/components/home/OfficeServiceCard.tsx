import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { OfficeService } from '../../types';

interface OfficeServiceCardProps {
  service: OfficeService;
  onPress?: () => void;
  onActionPress?: () => void;
}

export default function OfficeServiceCard({
  service,
  onPress,
  onActionPress,
}: OfficeServiceCardProps) {
  const renderIcon = () => {
    switch (service.iconName) {
      case 'building':
        return <Feather name="home" size={20} color="#FFFFFF" />;
      case 'search':
        return <Ionicons name="search-outline" size={20} color="#FFFFFF" />;
      case 'repeat':
        return (
          <MaterialCommunityIcons
            name="swap-horizontal"
            size={22}
            color="#FFFFFF"
          />
        );
      default:
        return <Feather name="layers" size={20} color="#FFFFFF" />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="w-[309px] rounded-[6px] border border-[#ECECEC] bg-white p-4 justify-between"
      accessibilityRole="button"
      accessibilityLabel={service.title}
    >
      <View>
        {/* Circular Dark Icon */}
        <View className="mb-3 items-end">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#15304D]">
            {renderIcon()}
          </View>
        </View>

        {/* Title */}
        <Text
          className="font-cairo-bold text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {service.title}
        </Text>

        {/* Description */}
        <Text
          className="mt-1 font-cairo-medium text-[12px] leading-[18px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {service.description}
        </Text>
      </View>

      {/* Footer Action and Tag */}
      <View className="mt-4 flex-row items-center justify-between pt-2">
        {/* Action Button */}
        <TouchableOpacity
          onPress={onActionPress || onPress}
          activeOpacity={0.8}
          className="rounded-[20px] py-1"
          accessibilityRole="button"
          accessibilityLabel={service.actionLabel || 'إدارة الخدمة'}
        >
          <Text
            className="font-cairo-semibold text-[14px] text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
          >
            {service.actionLabel || 'إدارة الخدمة'}
          </Text>
        </TouchableOpacity>

        {/* Optional Pill Tag (from Figma 140318) */}
        {service.requestTag ? (
          <View className="rounded-bl-[10px] rounded-tl-[10px] rounded-tr-[8px] bg-[#F9FAFE] px-2.5 py-1">
            <Text
              className="font-cairo text-[12px] text-[#15304D]"
              style={{ writingDirection: 'rtl' }}
            >
              {service.requestTag}
            </Text>
          </View>
        ) : (
          <View />
        )}
      </View>
    </TouchableOpacity>
  );
}
