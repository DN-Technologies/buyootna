import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

interface LogoutBottomSheetProps {
  onLogout: () => void;
  onCancel?: () => void;
}

const LogoutBottomSheet = forwardRef<BottomSheetModal, LogoutBottomSheetProps>(
  ({ onLogout, onCancel }, ref) => {
    const snapPoints = useMemo(() => ['42%'], []);

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

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 28 }}
      >
        <SafeBottomSheetView className="flex-1 items-center px-6 pb-8 pt-4">
          {/* Circular Icon Container */}
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-[#F5F7FA]">
            <Feather
              name="log-out"
              size={24}
              color="#15304D"
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </View>

          {/* Title */}
          <Text className="font-cairo-bold text-lg text-[#111111] text-center mb-2">
            هل ترغب في تسجيل الخروج؟
          </Text>

          {/* Description */}
          <Text className="font-cairo-semibold text-[13px] leading-[20px] text-[#6B6A6A] text-center mb-6">
            ستحتاج إلى تسجيل الدخول مجدداً للوصول إلى إعلاناتك، ورسائلك، وتنبيهاتك.
          </Text>

          {/* Action Buttons Column */}
          <View className="w-full gap-3">
            {/* Logout Confirm */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onLogout}
              className="h-12 w-full items-center justify-center rounded-full bg-[#9C1E28]"
            >
              <Text className="font-cairo-bold text-[15px] text-white">
                تسجيل الخروج
              </Text>
            </TouchableOpacity>

            {/* Cancel / Decline */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              className="h-12 w-full items-center justify-center rounded-full border border-gray-200 bg-white"
            >
              <Text className="font-cairo-bold text-[15px] text-[#111111]">
                تراجع
              </Text>
            </TouchableOpacity>
          </View>
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  }
);

LogoutBottomSheet.displayName = 'LogoutBottomSheet';
export default LogoutBottomSheet;
