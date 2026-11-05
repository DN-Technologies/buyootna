import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DiscountCodeField,
  PaymentMethodList,
  PaymentSummary,
  PurchaseCard,
} from './components/CheckoutSections';
import PaymentResultModal from './components/PaymentResultModal';
import { type CheckoutParams, useCheckout } from './useCheckout';

/**
 * «الدفع» (Figma 5557:142956): what is bought, «كود الخصم», «طريقة الدفع»,
 * «ملخص الدفع» and «اتمام الدفع», which opens Tap's page on the chosen
 * method. The outcome comes back as a popup.
 */
export default function CheckoutScreen({ params }: { params: CheckoutParams }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checkout = useCheckout(params);
  const { quote } = checkout;
  const canPay = !!quote && !!checkout.method && !checkout.isPaying;

  const leave = () =>
    router.canGoBack() ? router.back() : router.replace('/(individual)/home');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back on the right, «الدفع» centred */}
        <View className="h-[52px] flex-row items-center px-[16px] pb-[8px]">
          <TouchableOpacity
            testID="checkout-back"
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            onPress={leave}
            className="size-[32px] items-center justify-center"
          >
            <Image
              source={require('@/assets/icons/checkout/back.svg')}
              style={{ width: 20, height: 20, transform: [{ scaleX: -1 }] }}
              contentFit="contain"
            />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-cairo-semibold text-[18px] leading-[23px] text-[#111111]">
            الدفع
          </Text>
          <View className="size-[32px]" />
        </View>

        {checkout.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#15304D" />
          </View>
        ) : !quote ? (
          <View className="flex-1 items-center justify-center px-[24px]" style={{ gap: 12 }}>
            <Text className="text-center font-cairo-medium text-[14px] text-[#6B6A6A]">
              {checkout.loadError}
            </Text>
            <TouchableOpacity onPress={() => void checkout.reload()}>
              <Text className="font-cairo-bold text-[14px] text-[#15304D]">إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            testID="checkout-scroll"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24, gap: 24 }}
          >
            <PurchaseCard quote={quote} />
            <DiscountCodeField
              value={checkout.codeInput}
              onChange={checkout.changeCode}
              applied={checkout.appliedCode}
              error={checkout.codeError}
              isApplying={checkout.isApplyingCode}
              onApply={() => void checkout.applyCode()}
              onRemove={checkout.removeCode}
            />
            <PaymentMethodList
              methods={checkout.methods}
              selected={checkout.method}
              onSelect={checkout.selectMethod}
            />
            <PaymentSummary quote={quote} purpose={params.purpose} />
          </ScrollView>
        )}

        {/* «اتمام الدفع»: grey until a method is chosen */}
        <View
          className="bg-white px-[12px] pt-[16px]"
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
            shadowColor: '#9D9D9D',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 2.45,
            elevation: 4,
          }}
        >
          <TouchableOpacity
            testID="checkout-pay"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canPay }}
            disabled={!canPay}
            onPress={() => void checkout.pay()}
            className="h-[48px] items-center justify-center rounded-[24px]"
            style={{ backgroundColor: canPay || checkout.isPaying ? '#15304D' : '#A6A6A6' }}
          >
            {checkout.isPaying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-cairo-bold text-[16px] tracking-[0.32px] text-white">
                اتمام الدفع
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <PaymentResultModal
        result={checkout.result}
        onClose={() => {
          const success = checkout.result?.kind === 'success';
          checkout.dismissResult();
          if (success) leave();
        }}
        onRetry={checkout.retry}
      />
    </SafeAreaView>
  );
}
