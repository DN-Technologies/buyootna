import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface AuthGuardSheetProps {
  onClose?: () => void;
}

const AuthGuardSheet = forwardRef<BottomSheetModal, AuthGuardSheetProps>(
  ({ onClose }, ref) => {
    const router = useRouter();
    const snapPoints = useMemo(() => ['45%'], []);

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

    const handleDismiss = () => {
      // @ts-ignore
      ref.current?.dismiss();
      if (onClose) onClose();
    };

    const handleSignUp = () => {
      handleDismiss();
      router.push('/(auth)/selection');
    };

    const handleLogin = () => {
      handleDismiss();
      router.push('/(auth)/individual-auth');
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#111111', width: 40, height: 4 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 28 }}
      >
        <BottomSheetView className="flex-1 items-center px-6 pb-8 pt-4">
          {/* Warning Icon Container */}
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2]">
            <Feather name="alert-triangle" size={24} color="#BA0003" />
          </View>

          {/* Title */}
          <Text className="font-cairo-bold text-lg text-[#111111] text-center mb-2">
            سجل حسابك للمتابعة
          </Text>

          {/* Description */}
          <Text className="font-cairo-semibold text-[13px] leading-[20px] text-[#6B6A6A] text-center mb-6">
            سجل حسابك لنشر الاعلانات، وحفظ العقارات، واضافة التنبيهات، والتواصل بسهولة وحفظ المحادثات.
          </Text>

          {/* Action Buttons Column */}
          <View className="w-full gap-3">
            {/* Create Account Button (Primary Navy) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignUp}
              className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
            >
              <Text className="font-cairo-bold text-[15px] text-white">
                إنشاء حساب
              </Text>
            </TouchableOpacity>

            {/* Login Button (Outlined) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              className="h-12 w-full items-center justify-center rounded-full border border-[#15304D] bg-white"
            >
              <Text className="font-cairo-bold text-[15px] text-[#15304D]">
                تسجيل دخول
              </Text>
            </TouchableOpacity>

            {/* Later Button (Borderless text) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDismiss}
              className="w-full items-center justify-center py-2"
            >
              <Text className="font-cairo-bold text-[14px] text-[#6B6A6A]">
                لاحقاً
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

AuthGuardSheet.displayName = 'AuthGuardSheet';
export default AuthGuardSheet;
