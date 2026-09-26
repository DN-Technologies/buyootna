import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { FeatureIcon } from '@/assets/icons/activity';
import { CloseIcon } from '@/assets/icons/home/property';
import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';

interface FeatureAdSheetProps {
  propertyId?: string;
  onSuccess?: () => void;
}

interface Package {
  id: string;
  price: number;
  durationLabel: string;
  description: string;
  badge?: string;
  badgeColors?: [string, string, ...string[]];
  badgeTextColor?: string;
  showDiamond?: boolean;
}

const DiamondIcon = ({
  color = '#111111',
  size = 11,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 3h12l4 6-10 13L2 9z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11 3L8 9l4 13 4-13-3-6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 9h20"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PACKAGES: Package[] = [
  {
    id: 'day',
    price: 10,
    durationLabel: 'تمييز ليوم',
    description: 'تعزيز سريع للإعلان.',
  },
  {
    id: 'week',
    price: 50,
    durationLabel: 'تمييز لاسبوع',
    description: 'ظهور أقوى لمدة أطول.',
    badge: 'الأكثر اختياراً',
    badgeColors: ['#00D290', '#15304D'],
    badgeTextColor: 'text-white',
  },
  {
    id: 'month',
    price: 100,
    durationLabel: 'تمييز لشهر',
    description: 'أفضل انتشار لإعلانك.',
    badge: 'موصى به',
    badgeColors: ['#FA9E1B', '#FAD961'],
    badgeTextColor: 'text-[#111111]',
    showDiamond: true,
  },
];

const FeatureAdSheet = forwardRef<BottomSheetModal, FeatureAdSheetProps>(
  ({ propertyId, onSuccess }, ref) => {
    // Snap points: 80% is ideal to show pricing list, details and action bar
    const snapPoints = useMemo(() => ['82%'], []);
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
      null,
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const handleClose = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleSelectPackage = (id: string) => {
      setSelectedPackageId(id);
    };

    const handlePayment = () => {
      if (!selectedPackageId) return;
      // Close sheet and trigger parent callback
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    };

    const selectedPackage = PACKAGES.find(
      (pkg) => pkg.id === selectedPackageId,
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleComponent={null} // custom header handles closing
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView className="flex-1 justify-between bg-white px-5 pb-8 pt-5">
          <View>
            {/* --- Header Row --- */}
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="font-cairo-bold text-lg leading-[24px] text-[#111111]">
                تمييز الإعلان
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.7}
                className="h-8 w-8 items-center justify-center rounded-full"
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            {/* --- Banner Promo Section --- */}
            <LinearGradient
              colors={['#FA9E1B', '#FAD961']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <View className="flex-row items-center gap-3">
                <FeatureIcon size={25} color="#111111" />
                <View className="flex-1">
                  <Text
                    className="font-cairo-bold text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    ميز اعلانك حتى:
                  </Text>
                  <Text
                    className="font-cairo-medium text-[12px] leading-[18px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    يظهر أعلى القائمة • يعرض في الصفحة الرئيسية • يحصد شارة
                    إعلان مميز • تصلك مشاهدات أكثر.
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* --- Coupon Notification --- */}
            <View className="mb-5 flex-row items-center rounded-xl border border-[#EBF2FF] bg-[#F6F9FF] p-3">
              <Text className="text-base">🉐</Text>
              <Text className="ml-2 font-cairo-semibold text-[12px] text-[#15304D]">
                {'خصم 10% عند استخدامك كود "BYOUTNA10".'}
              </Text>
            </View>

            {/* --- Packages List --- */}
            <Text className="mb-3 text-right font-cairo-bold text-[14px] text-[#111111]">
              اختر الباقة المناسبة لك
            </Text>

            <View className="gap-3">
              {PACKAGES.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <TouchableOpacity
                    key={pkg.id}
                    activeOpacity={0.9}
                    onPress={() => handleSelectPackage(pkg.id)}
                    className={`flex-row items-center justify-between rounded-xl border p-4 ${
                      isSelected
                        ? 'border-[#15304D] bg-[#F7F9FC]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Right: Package details */}
                    <View className="">
                      <Text
                        className="mb-0.5 font-cairo-bold text-[14px] text-[#111111]"
                        style={{ writingDirection: 'rtl' }}
                      >
                        {pkg.durationLabel}
                      </Text>
                      <Text className="font-cairo text-[11px] text-[#1C1D1F]">
                        {pkg.description}
                      </Text>
                    </View>
                    {/* Left: Pricing & optional Badge */}
                    <View className="items-center justify-center gap-1.5">
                      <View className="flex-row items-baseline gap-1">
                        <Text className="font-cairo-bold text-[22px] leading-[26px] text-[#15304D]">
                          {pkg.price}
                        </Text>
                        <Text className="font-cairo-bold text-[20px] text-[#15304D]">
                          د.ك
                        </Text>
                      </View>
                      {pkg.badge && (
                        <LinearGradient
                          colors={pkg.badgeColors || ['#15304D', '#15304D']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            borderRadius: 22,
                            paddingVertical: 4,
                            paddingHorizontal: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <View className="flex-row items-center gap-1">
                            {pkg.showDiamond && (
                              <DiamondIcon color="#111111" size={10} />
                            )}
                            <Text
                              className={`font-cairo-bold text-[10px] leading-[18px] ${pkg.badgeTextColor}`}
                            >
                              {pkg.badge}
                            </Text>
                          </View>
                        </LinearGradient>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* --- Checkout Bottom Button --- */}
          <View className="mt-6">
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!selectedPackageId}
              onPress={handlePayment}
              className={`h-[48px] w-full items-center justify-center rounded-full ${
                selectedPackageId ? 'bg-[#15304D]' : 'bg-[#D1D5DB]'
              }`}
            >
              <Text className="font-cairo-semibold text-sm text-white">
                {selectedPackage
                  ? `إتمام الدفع • ${selectedPackage.price} د.ك`
                  : 'إتمام الدفع'}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

FeatureAdSheet.displayName = 'FeatureAdSheet';

export default FeatureAdSheet;
