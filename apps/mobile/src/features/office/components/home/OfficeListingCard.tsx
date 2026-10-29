import { Feather, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  I18nManager,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { NO_IMAGE_SOURCE } from '@/constants/images';
import { SafeLinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import { formatNumber } from '@/shared/utils/formatNumber';
import {
  formatArabicDate,
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';

import { OfficeDashboardListing } from '../../types';

const CARD_WIDTH = 247;
const IMAGE_HEIGHT = 163;

interface OfficeListingCardProps {
  listing: OfficeDashboardListing;
  onPress?: () => void;
  onManagePress?: () => void;
}

// "التمييز نشط حتى 25 مايو" while a paid feature runs, else just "مميز"
export function featuredBadgeLabel(
  listing: Pick<OfficeDashboardListing, 'isFeatured' | 'featuredUntil'>,
): string | null {
  if (!listing.isFeatured) return null;
  if (!listing.featuredUntil) return 'مميز';
  const until = formatArabicDate(listing.featuredUntil).replace(/ \d{4}$/, '');
  return until ? `التمييز نشط حتى ${until}` : 'مميز';
}

// RTL: the icon (first) on the right of its count
function Stat({ value, icon }: { value: number; icon: React.ReactNode }) {
  return (
    <View className="min-h-5 flex-row items-center gap-1.5">
      {icon}
      <Text
        className="font-cairo text-[14px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function OfficeListingCard({
  listing,
  onPress,
  onManagePress,
}: OfficeListingCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = listing.images.length ? listing.images : [null];
  const title = [
    getArabicCategoryLabel(listing.category),
    getArabicTypeLabel(listing.type),
  ]
    .filter(Boolean)
    .join(' ');
  const badge = featuredBadgeLabel(listing);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const raw = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
    // In RTL the first photo sits at the largest raw offset
    const last = images.length - 1;
    const index = I18nManager.isRTL ? last - raw : raw;
    setActiveIndex(Math.min(Math.max(index, 0), last));
  };

  return (
    <View className="w-[247px] rounded-[4px]" style={{ elevation: 1 }}>
      <View style={{ height: IMAGE_HEIGHT }} className="overflow-hidden rounded-[2px] bg-gray-100">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {images.map((uri, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.95}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={title}
            >
              <Image
                source={uri ? { uri } : NO_IMAGE_SOURCE}
                style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {badge && (
          <View className="absolute right-3 top-2.5" pointerEvents="none">
            <SafeLinearGradient
              colors={['#FF8D28', '#FACC15']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-5 items-center justify-center rounded-br-[10px] rounded-tl-[8px] rounded-tr-[10px] px-2"
            >
              <Text
                className="font-almarai text-[12px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {badge}
              </Text>
            </SafeLinearGradient>
          </View>
        )}

        {images.length > 1 && (
          <View
            className="absolute left-0 right-0 flex-row items-center justify-center gap-1"
            style={{ top: 133 }}
            pointerEvents="none"
          >
            {images.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full ${
                  index === activeIndex ? 'w-3.5 bg-white' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </View>
        )}
      </View>

      {/* The details panel rises over the photo's bottom edge */}
      <View
        className="items-start gap-1 rounded-b-[2px] rounded-t-[6px] border border-[#ECECEC] bg-[#FEFEFE] p-3"
        style={{ marginTop: -18 }}
      >
        <Text
          className="font-cairo text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View className="mt-1.5 flex-row items-end gap-0.5 pb-1">
          {listing.price !== null ? (
            <>
              <Text className="font-cairo-semibold text-[22px] leading-[26px] text-[#15304D]">
                {formatNumber(listing.price)}
              </Text>
              <Text className="font-cairo-semibold text-[12px] text-[#15304D]">
                د.ك
              </Text>
            </>
          ) : (
            <Text
              className="font-cairo-semibold text-[18px] leading-[26px] text-[#15304D]"
              style={{ writingDirection: 'rtl' }}
            >
              السعر غير معلن
            </Text>
          )}
        </View>

        <View className="flex-row items-center gap-5">
          <Stat
            value={listing.views}
            icon={<Ionicons name="eye-outline" size={16} color="#6B6A6A" />}
          />
          <Stat
            value={listing.favoritesCount}
            icon={<Ionicons name="heart-outline" size={16} color="#6B6A6A" />}
          />
          <Stat
            value={listing.chatsCount}
            icon={<Feather name="message-square" size={15} color="#6B6A6A" />}
          />
        </View>

        <TouchableOpacity
          onPress={onManagePress || onPress}
          activeOpacity={0.8}
          className="mt-1 h-8 w-full items-center justify-center rounded-[8px] bg-[#F5F7F9]"
          accessibilityRole="button"
          accessibilityLabel="إدارة الإعلان"
        >
          <Text
            className="font-cairo-semibold text-[14px] text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
          >
            إدارة الإعلان
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
