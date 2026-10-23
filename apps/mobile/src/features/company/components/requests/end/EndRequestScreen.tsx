import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { showAlert } from '@/shared/utils/alert';

import { BackChevronIcon } from '../details/icons';
import type { CompletedVia } from '../types';

type Finished = 'yes' | 'no';

function RadioCard({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      activeOpacity={0.8}
      onPress={onPress}
      className={`h-[46px] w-full flex-row items-center gap-1 rounded-[16px] border px-4 ${
        selected ? 'border-[#15304D]' : 'border-[#D7D7D7]'
      }`}
    >
      <View
        className={`size-6 items-center justify-center rounded-full border-[1.5px] ${
          selected ? 'border-[#15304D]' : 'border-[#6B6A6A]'
        }`}
      >
        {selected && <View className="size-3 rounded-full bg-[#15304D]" />}
      </View>
      <Text
        className={`flex-1 font-cairo-medium text-[14px] ${
          selected ? 'text-[#15304D]' : 'text-[#111111]'
        }`}
        style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Question({ children }: { children: string }) {
  return (
    <Text
      className="font-cairo-semibold text-[16px] text-[#111111]"
      style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
    >
      {children}
    </Text>
  );
}

/**
 * انهاء الطلب (Figma 7432:129227 / 129251 / 129288): was the service
 * finished, and if so where was the final agreement made. «لا» changes
 * nothing; «نعم» ends the request and the list says تم إنهاء الطلب بنجاح.
 */
export default function EndRequestScreen({ id }: { id?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [finished, setFinished] = useState<Finished | null>(null);
  const [via, setVia] = useState<CompletedVia | null>(null);
  const [saving, setSaving] = useState(false);

  const ready = finished === 'no' || (finished === 'yes' && !!via);

  const submit = async () => {
    if (!ready || saving) return;
    // Still going: nothing to record
    if (finished === 'no' || !id || !via) {
      router.back();
      return;
    }
    setSaving(true);
    try {
      await companyRequestsService.complete(id, via);
      queryClient.invalidateQueries({ queryKey: ['companyRequests'] });
      queryClient.invalidateQueries({ queryKey: ['companyRequest', id] });
      // Off the requests stack, onto the list, which shows the toast
      if (router.canDismiss()) router.dismissAll();
      router.navigate({
        pathname: '/(company)/company-requests',
        params: { ended: '1' },
      } as never);
    } catch (error: any) {
      const backendMsg = error?.response?.data?.message;
      showAlert(
        'تعذر إنهاء الطلب',
        Array.isArray(backendMsg)
          ? backendMsg.join('\n')
          : backendMsg || 'حدث خطأ ما، حاول مرة أخرى',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="h-[52px] flex-row items-center px-4">
        <TouchableOpacity
          testID="end-request-back"
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="الرجوع"
          className="size-8 items-center justify-center rounded-full"
        >
          <BackChevronIcon size={20} color="#111111" />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center font-cairo-semibold text-[18px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          انهاء الطلب
        </Text>
        <View className="size-8" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <Text
          className="self-center text-center font-cairo-medium text-[14px] text-[#6B6A6A]"
          // No negative letterSpacing on wrapping Arabic: iOS stacks the lines
          style={{ maxWidth: 287, writingDirection: 'rtl' }}
        >
          ساعدنا في تحسين تجربة الاستخدام من خلال اختيار الحالة المناسبة.
        </Text>

        <View className="gap-3">
          <Question>هل تم الانتهاء من الخدمة ؟</Question>
          <View className="gap-2">
            <RadioCard
              testID="end-request-finished-yes"
              label="نعم"
              selected={finished === 'yes'}
              onPress={() => setFinished('yes')}
            />
            <RadioCard
              testID="end-request-finished-no"
              label="لا، مازال الطلب مستمرًا"
              selected={finished === 'no'}
              onPress={() => {
                setFinished('no');
                setVia(null);
              }}
            />
          </View>
        </View>

        {finished === 'yes' && (
          <View className="gap-3">
            <Question>أين تم الاتفاق النهائي؟</Question>
            <View className="gap-2">
              <RadioCard
                testID="end-request-via-in_app"
                label="من خلال التطبيق"
                selected={via === 'in_app'}
                onPress={() => setVia('in_app')}
              />
              <RadioCard
                testID="end-request-via-outside"
                label="خارج التطبيق"
                selected={via === 'outside'}
                onPress={() => setVia('outside')}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View
        className="bg-white px-3 pb-3 pt-4"
        style={{
          elevation: 4,
          shadowColor: '#9D9D9D',
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 2.45,
        }}
      >
        <TouchableOpacity
          testID="end-request-submit"
          accessibilityRole="button"
          accessibilityState={{ disabled: !ready || saving }}
          disabled={!ready || saving}
          activeOpacity={0.8}
          onPress={submit}
          className={`h-12 items-center justify-center rounded-[24px] ${
            ready ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-cairo-bold text-[14px] text-white">
              تحديث الحالة
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
