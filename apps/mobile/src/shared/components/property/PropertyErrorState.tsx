import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { isNetworkError } from '@/shared/utils/getApiErrorMessage';

/** Why the ad couldn't be shown. */
export type PropertyErrorKind = 'offline' | 'not-found' | 'failed';

/** Offline, a real 404 (gone), or anything else. */
export function propertyErrorKind(error: unknown): PropertyErrorKind {
  if (!error) return 'not-found';
  if (isNetworkError(error)) return 'offline';
  const status = (error as { response?: { status?: number } }).response
    ?.status;
  return status === 404 ? 'not-found' : 'failed';
}

const CONTENT: Record<
  PropertyErrorKind,
  { icon: keyof typeof Feather.glyphMap; title: string; body: string }
> = {
  // QA: offline showed «حدث خطأ ما» and «غير موجود أو تم حذفه»
  offline: {
    icon: 'wifi-off',
    title: 'لا يوجد اتصال بالإنترنت',
    body: 'تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.',
  },
  'not-found': {
    icon: 'alert-circle',
    title: 'الإعلان غير متوفر',
    body: 'عذراً، هذا العقار غير موجود أو تم حذفه',
  },
  failed: {
    icon: 'alert-circle',
    title: 'تعذر تحميل الإعلان',
    body: 'حدث خطأ أثناء تحميل الإعلان، يرجى المحاولة مرة أخرى.',
  },
};

interface PropertyErrorStateProps {
  kind?: PropertyErrorKind;
  onBack: () => void;
  // Offline / failed only: load it again
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function PropertyErrorState({
  kind = 'not-found',
  onBack,
  onRetry,
  isRetrying = false,
}: PropertyErrorStateProps) {
  const content = CONTENT[kind];
  const canRetry = kind !== 'not-found' && !!onRetry;
  return (
    <View
      testID={`property-error-${kind}`}
      className="flex-1 items-center justify-center bg-[#F8FAFC] px-6"
    >
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <Feather name={content.icon} size={32} color="#EF4444" />
      </View>
      <Text className="mb-2 text-center font-cairo-bold text-2xl text-[#111111]">
        {content.title}
      </Text>
      <Text className="mb-8 px-4 text-center font-cairo-semibold text-base leading-6 text-[#6B6A6A]">
        {content.body}
      </Text>
      {canRetry ? (
        <TouchableOpacity
          testID="property-error-retry"
          activeOpacity={0.8}
          disabled={isRetrying}
          onPress={onRetry}
          className="mb-3 w-full items-center justify-center rounded-3xl bg-[#0B2239] py-4"
          accessibilityRole="button"
          accessibilityLabel="إعادة المحاولة"
        >
          {isRetrying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-cairo-bold text-lg text-white">
              إعادة المحاولة
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onBack}
        className={`w-full items-center justify-center rounded-3xl py-4 ${
          canRetry ? 'border border-[#E2E8F0] bg-white' : 'bg-[#0B2239]'
        }`}
        accessibilityRole="button"
        accessibilityLabel="الرجوع للخلف"
      >
        <Text
          className={`font-cairo-bold text-lg ${canRetry ? 'text-[#111111]' : 'text-white'}`}
        >
          الرجوع للخلف
        </Text>
      </TouchableOpacity>
    </View>
  );
}
