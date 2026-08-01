import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import {
  AreaIcon,
  BathIcon,
  BedIcon,
  FloorIcon,
  LicenseIcon,
  LocationIcon,
  RequestIcon,
} from '@/assets/icons/home/property';

export interface PropertyOverviewProps {
  type: 'SALE' | 'RENT' | 'EXCHANGE';
  title: string;
  price: number;
  isFeatured?: boolean;
  timeAgo: string;
  views: number;
  area: number;
  location: string;
  // Sale/Rent specific
  floor?: number;
  beds?: number;
  baths?: number;
  // Exchange specific
  requestYear?: string;
  requiredYear?: string;
  licenseNumber?: string;
  exchangeRequirement?: string;
}

export default function PropertyOverview({
  type,
  title,
  price,
  isFeatured = false,
  timeAgo,
  views,
  area,
  location,
  floor,
  beds,
  baths,
  requestYear,
  requiredYear,
  licenseNumber,
  exchangeRequirement,
}: PropertyOverviewProps) {
  return (
    <View className="bg-white px-5 pt-5">
      {/* -- Badges & Meta (Time/Views) --- */}
      <View className="flex-row items-center justify-between">
        {/* -- Price & Title --- */}
        <View className="items-start gap-1">
          {/*  Title */}
          <Text className="font-cairo-semibold text-base text-[#111111]">
            {title}
          </Text>
          {licenseNumber && (
            <View className="mt-1 flex-row items-center gap-1.5">
              <LicenseIcon color="#15304D" size={16} />
              <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
                رقم الرخصة {licenseNumber}
              </Text>
            </View>
          )}
          {/*  Price (Hidden for Exchange usually, but handles 0 gracefully) */}
          {type !== 'EXCHANGE' ? (
            <View className="items-start">
              <Text className="text-2xl font-semibold text-[#111111]">
                {price.toLocaleString()}{' '}
                <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
                  د.ك {type === 'RENT' && '/ شهرياً'}
                </Text>
              </Text>
            </View>
          ) : (
            <View /> // Empty view to push Title to the right
          )}
        </View>

        <View className="mb-3 items-end gap-3">
          {/*  Badges */}
          <View className="flex-row">
            {isFeatured && (
              <LinearGradient
                colors={['#FF8D28', '#FACC15']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  width: 65,
                  height: 20,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 10,
                  borderBottomLeftRadius: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text className="font-almarai text-[12px] leading-[14.4px] text-[#111111]">
                  مميز
                </Text>
              </LinearGradient>
            )}
          </View>
          {/*  Meta */}
          <View className="flex-row items-center">
            <Text className="mr-1 font-cairo-semibold text-xs text-[#6B6A6A]">
              {timeAgo} -
            </Text>
            <Feather
              name="eye"
              size={12}
              color="#6B6A6A"
              className="relative -top-0.5"
            />
            <Text className="ml-1 font-cairo-semibold text-xs text-[#6B6A6A]">
              {views}
            </Text>
          </View>
        </View>
      </View>

      {/* ---  DYNAMIC Specs Row --- */}
      <View className="mb-6 flex-row items-center">
        {type === 'EXCHANGE' ? (
          // EXCHANGE SPECS (سنة الطلب / السنة المطلوبة)
          <>
            <View className="flex-row items-center gap-1.5">
              <RequestIcon color="#15304D" size={16} />
              <Text className="font-cairo-semibold text-sm leading-[20px] text-[#111111]">
                سنة الطلب {requestYear}
              </Text>
            </View>

            <View className="mx-4 h-4 w-[1px] bg-gray-300" />

            <View className="flex-row items-center gap-1.5">
              <RequestIcon color="#15304D" size={16} />
              <Text className="font-cairo-semibold text-sm leading-[20px] text-[#111111]">
                السنة المطلوبة {requiredYear}
              </Text>
            </View>
          </>
        ) : (
          // SALE/RENT SPECS (حمام / غرف / دور)
          <>
            <View className="flex-row items-center gap-1.5">
              <FloorIcon color="#15304D" size={16} />
              <Text className="font-cairo-semibold text-sm leading-[20px] text-[#111111]">
                {floor} دور
              </Text>
            </View>

            <View className="mx-4 h-4 w-[1px] bg-gray-300" />

            <View className="flex-row items-center gap-1.5">
              <BedIcon color="#15304D" size={18} />
              <Text className="font-cairo-semibold text-sm leading-[20px] text-[#111111]">
                {beds} غرف
              </Text>
            </View>

            <View className="mx-4 h-4 w-[1px] bg-gray-300" />

            <View className="flex-row items-center gap-1.5">
              <BathIcon color="#15304D" size={16} />
              <Text className="font-cairo-semibold text-sm leading-[20px] text-[#111111]">
                {baths} حمام
              </Text>
            </View>
          </>
        )}
      </View>

      {/* --- EXCHANGE REQUIREMENT --- */}
      {type === 'EXCHANGE' && exchangeRequirement && (
        <View className="mb-6 items-start">
          <Text
            className="mb-2 font-cairo-semibold text-sm text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            المطلوب
          </Text>
          <Text
            className="font-cairo-semibold text-sm leading-6 text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {exchangeRequirement}
          </Text>
        </View>
      )}

      {/* --- Area & Location --- */}
      <View className="space-y-2">
        <View className="mb-2 flex-row items-center gap-1.5">
          <AreaIcon color="#15304D" size={16} />
          <Text className="font-cairo-semibold text-sm text-[#111111]">
            مساحة {area} م²
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <LocationIcon color="#15304D" size={14} />
          <Text className="font-cairo-semibold text-sm text-[#111111]">
            {location}
          </Text>
        </View>
      </View>
    </View>
  );
}
