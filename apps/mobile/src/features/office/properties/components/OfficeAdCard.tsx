import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import AdImageGallery from '@/features/individual/components/activity/ads/AdImageGallery';
import { featuredBadgeLabel } from '@/features/office/components/home/OfficeListingCard';
import { SafeLinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import type { ActivityItem } from '@/shared/hooks/properties/useMyActivity';
import { formatNumber } from '@/shared/utils/formatNumber';
import {
  formatArabicDate,
  getArabicCategoryLabel,
  publishedDate,
} from '@/shared/utils/helpers/property';

const IMAGE_HEIGHT = 163;

function Badge({ ad }: { ad: ActivityItem }) {
  const corners = 'h-5 items-center justify-center rounded-br-[10px] rounded-tl-[8px] rounded-tr-[10px] px-2';
  const text = 'font-almarai text-[12px] text-[#111111]';
  if (ad.isHidden) {
    return (
      <View className={`${corners} bg-[#F4F8EE]`}>
        <Text className={text}>اعلان مخفي</Text>
      </View>
    );
  }
  const featured = featuredBadgeLabel({
    isFeatured: !!ad.isPremium,
    featuredUntil: ad.featuredUntil ?? null,
  });
  if (featured) {
    return (
      <SafeLinearGradient
        colors={['#FF8D28', '#FACC15']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className={corners}
      >
        <Text className={text} style={{ writingDirection: 'rtl' }}>
          {featured}
        </Text>
      </SafeLinearGradient>
    );
  }
  return (
    <SafeLinearGradient
      colors={['#AADB53', '#33D679']}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      className={corners}
    >
      <Text className={text}>نشط</Text>
    </SafeLinearGradient>
  );
}

function Stat({ label, value, muted }: { label: string; value: number; muted: boolean }) {
  return (
    <View className="flex-1 items-start p-2" style={{ gap: 6 }}>
      <Text
        className={`font-cairo-medium text-[12px] leading-[15px] ${
          muted ? 'text-[#A0A0A0]' : 'text-[#6B6A6A]'
        }`}
      >
        {label}
      </Text>
      <Text
        className={`font-cairo-semibold text-[14px] leading-[18px] ${
          muted ? 'text-[#A0A0A0]' : 'text-[#15304D]'
        }`}
      >
        {String(value)}
      </Text>
    </View>
  );
}

const Divider = () => <View className="h-8 w-[0.5px] bg-[#D7D7D7]" />;

interface OfficeAdCardProps {
  ad: ActivityItem;
  onPress: () => void;
  // «تحديد متعدد»: a tap picks the ad instead of opening it
  selecting?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

/** One ad in a governorate (Figma 4494:145847 / 145876 / 145905). */
export default function OfficeAdCard({
  ad,
  onPress,
  selecting = false,
  selected = false,
  onToggleSelect,
}: OfficeAdCardProps) {
  const handlePress = selecting ? onToggleSelect : onPress;
  const muted = !!ad.isHidden;

  return (
    <View
      className="w-full rounded-[4px]"
      style={{
        shadowColor: '#919191',
        shadowOpacity: 0.25,
        shadowRadius: 1,
        shadowOffset: { width: 0, height: 0 },
        elevation: 1,
      }}
    >
      <View className="overflow-hidden rounded-[2px]" style={{ height: IMAGE_HEIGHT }}>
        <AdImageGallery
          images={ad.images}
          onPress={handlePress}
          height={IMAGE_HEIGHT}
          testID={`office-ad-gallery-${ad.id}`}
        >
          {/* On the photo's left as in Figma: the app's RTL swaps left and right */}
          <View className="absolute right-3 top-3 flex-row" pointerEvents="none">
            <Badge ad={ad} />
          </View>
          {selecting && (
            <View
              testID={`office-ad-check-${ad.id}${selected ? '-on' : ''}`}
              pointerEvents="none"
              className={`absolute left-3 top-3 h-6 w-6 items-center justify-center rounded-full border-2 ${
                selected ? 'border-[#15304D] bg-[#15304D]' : 'border-white bg-black/20'
              }`}
            >
              {selected && <Feather name="check" size={14} color="#FFFFFF" />}
            </View>
          )}
        </AdImageGallery>
      </View>

      {/* The details panel rises over the photo's bottom edge */}
      <TouchableOpacity
        testID={`office-ad-${ad.id}`}
        accessibilityRole={selecting ? 'checkbox' : 'button'}
        accessibilityState={selecting ? { checked: selected } : undefined}
        activeOpacity={0.85}
        onPress={handlePress}
        className={`rounded-[6px] bg-[#FEFEFE] px-3 pb-3 pt-[18px] ${
          selected ? 'border border-[#15304D]' : ''
        }`}
        style={{ marginTop: -18 }}
      >
        <View style={{ gap: 6 }}>
          <View className="flex-row items-start pb-1" style={{ gap: 8 }}>
            <View className="flex-1 items-start" style={{ gap: 8 }}>
              <Text
                className="font-cairo text-[14px] leading-[18px] text-[#15304D]"
                style={{ writingDirection: 'rtl' }}
              >
                {getArabicCategoryLabel(ad.category)}
              </Text>
              <View className="flex-row items-end" style={{ gap: 2 }}>
                {ad.price != null ? (
                  <>
                    <Text className="font-cairo-semibold text-[22px] leading-[26px] text-[#15304D]">
                      {formatNumber(ad.price)}
                    </Text>
                    <Text className="font-cairo-semibold text-[12px] leading-[15px] text-[#15304D]">
                      د.ك
                    </Text>
                  </>
                ) : (
                  <Text className="font-cairo-semibold text-[18px] leading-[26px] text-[#15304D]">
                    السعر غير معلن
                  </Text>
                )}
              </View>
            </View>
            <Text className="font-cairo text-[12px] leading-[15px] text-[#6B6A6A]">
              {formatArabicDate(publishedDate(ad) ?? ad.updatedAt)}
            </Text>
          </View>

          <View className="flex-row items-center rounded-[6px] bg-[#F9FAFE] px-3" style={{ gap: 8 }}>
            <Stat label="عدد المشاهدات" value={ad.views ?? 0} muted={muted} />
            <Divider />
            <Stat label="مرات الحفظ" value={ad.favoritesCount ?? 0} muted={muted} />
            <Divider />
            <Stat label="عدد التواصل" value={ad.chatsCount ?? 0} muted={muted} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
