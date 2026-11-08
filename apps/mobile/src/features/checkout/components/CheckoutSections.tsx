import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type {
  CheckoutPurpose,
  CheckoutQuote,
  PaymentMethod,
} from '@/shared/api/payments.service';

import { formatKwd, priceLabel } from '../checkoutText';

const RTL = { writingDirection: 'rtl' as const };

// Amounts read left to right as in the design: «5 د.ك», «-2 د.ك» (under
// the app's RTL they came out «د.ك 5» and «د.ك 2-»)
const AMOUNT = { writingDirection: 'ltr' as const };

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      className="font-cairo-semibold text-[16px] leading-[24px] tracking-[-0.408px] text-[#111111]"
      style={RTL}
    >
      {children}
    </Text>
  );
}

/** What is bought, with its price in green (the «user plans» card). */
export function PurchaseCard({ quote }: { quote: CheckoutQuote }) {
  return (
    <View
      testID="checkout-purchase"
      className="flex-row items-start rounded-[6px] bg-[#F5F7F9] p-[16px]"
      style={{ borderWidth: 0.5, borderColor: '#ECECEC' }}
    >
      <View className="flex-1" style={{ gap: 4 }}>
        <Text className="font-cairo-semibold text-[15px] leading-[22px] text-[#111111]" style={RTL}>
          {quote.title}
        </Text>
        <Text className="font-cairo text-[14px] leading-[21px] text-[#6B6A6A]" style={RTL}>
          {quote.subtitle}
        </Text>
      </View>
      <Text testID="checkout-purchase-price" className="font-cairo-bold text-[15px] text-[#15A72B]" style={AMOUNT}>
        {formatKwd(quote.price)}
      </Text>
    </View>
  );
}

interface DiscountCodeFieldProps {
  value: string;
  onChange: (text: string) => void;
  applied: string | null;
  error: string | null;
  isApplying: boolean;
  onApply: () => void;
  onRemove: () => void;
}

/** «كود الخصم»: the field, «تطبيق» (grey until typed), and its outcome. */
export function DiscountCodeField({
  value,
  onChange,
  applied,
  error,
  isApplying,
  onApply,
  onRemove,
}: DiscountCodeFieldProps) {
  const canApply = !!value.trim() && !isApplying;
  return (
    <View style={{ gap: 14 }}>
      <SectionTitle>كود الخصم</SectionTitle>
      <View style={{ gap: 6 }}>
        <View
          className="h-[46px] flex-row items-center rounded-[8px] border bg-white px-[12px]"
          style={{ gap: 8, borderColor: error ? '#9C1E28' : '#ECECEC' }}
        >
          <Image
            source={require('@/assets/icons/checkout/coupon.svg')}
            style={{ width: 16, height: 16 }}
            contentFit="contain"
          />
          <TextInput
            testID="checkout-code-input"
            value={applied ?? value}
            onChangeText={onChange}
            editable={!applied}
            placeholder="ادخل كود الخصم"
            placeholderTextColor="#979797"
            autoCapitalize="characters"
            autoCorrect={false}
            onSubmitEditing={onApply}
            returnKeyType="done"
            className="flex-1 font-cairo text-[14px] text-[#111111]"
            style={{ textAlign: 'right', writingDirection: 'rtl', paddingVertical: 0 }}
          />
          {applied ? (
            <TouchableOpacity testID="checkout-code-remove" onPress={onRemove} className="h-[40px] justify-center px-[8px]">
              <Text className="font-cairo-bold text-[14px] text-[#9C1E28]">إزالة</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              testID="checkout-code-apply"
              accessibilityState={{ disabled: !canApply }}
              disabled={!canApply}
              onPress={onApply}
              className="h-[40px] justify-center px-[8px]"
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#15304D" />
              ) : (
                <Text
                  className="font-cairo-bold text-[14px]"
                  style={{ color: canApply ? '#15304D' : '#A6A6A6' }}
                >
                  تطبيق
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        {applied ? (
          <Text testID="checkout-code-applied" className="font-cairo text-[12px] text-[#15A72B]" style={RTL}>
            تم تطبيق كود الخصم
          </Text>
        ) : error ? (
          <Text testID="checkout-code-error" className="font-cairo text-[12px] text-[#9C1E28]" style={RTL}>
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  apple_pay: 'ApplePay',
  google_pay: 'Google Pay',
  card: 'Visa / Mastercard',
  knet: 'K-net',
};

function MethodIcon({ method }: { method: PaymentMethod }) {
  if (method === 'apple_pay') {
    return <Image source={require('@/assets/icons/checkout/apple.svg')} style={{ width: 24, height: 24 }} contentFit="contain" />;
  }
  if (method === 'google_pay') {
    return <Image source={require('@/assets/icons/checkout/google.svg')} style={{ width: 18, height: 18, margin: 3 }} contentFit="contain" />;
  }
  if (method === 'card') {
    return (
      <View className="flex-row items-center" style={{ gap: 4, direction: 'ltr' }}>
        <Image source={require('@/assets/icons/checkout/visa.png')} style={{ width: 24, height: 24 }} contentFit="cover" />
        <Image source={require('@/assets/icons/checkout/mastercard.svg')} style={{ width: 16, height: 16 }} contentFit="contain" />
      </View>
    );
  }
  // The KNET logo, cropped as in the design
  return (
    <View
      className="overflow-hidden rounded-[2px]"
      style={{ width: 31.978, height: 24, direction: 'ltr' }}
    >
      <Image
        source={require('@/assets/icons/checkout/knet.png')}
        style={{
          position: 'absolute',
          width: 35.9,
          height: 35.9,
          transform: [{ translateX: -1.92 }, { translateY: -5.94 }],
        }}
        contentFit="fill"
      />
    </View>
  );
}

interface PaymentMethodListProps {
  methods: PaymentMethod[];
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

/** «طريقة الدفع»: each row opens Tap's page on that method. */
export function PaymentMethodList({ methods, selected, onSelect }: PaymentMethodListProps) {
  return (
    <View style={{ gap: 14 }}>
      <SectionTitle>طريقة الدفع</SectionTitle>
      <View style={{ gap: 12 }}>
        {methods.map((method) => {
          const isSelected = selected === method;
          return (
            <TouchableOpacity
              key={method}
              testID={`checkout-method-${method}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              activeOpacity={0.8}
              onPress={() => onSelect(method)}
              className="h-[46px] flex-row items-center rounded-[16px] px-[16px]"
              style={{
                gap: 6,
                borderWidth: isSelected ? 1.5 : 1,
                borderColor: isSelected ? '#15304D' : '#D7D7D7',
              }}
            >
              <Text
                className="flex-1 text-[14px]"
                style={{ fontWeight: '600', color: '#111111', textAlign: 'right', writingDirection: 'rtl' }}
              >
                {METHOD_LABELS[method]}
              </Text>
              <MethodIcon method={method} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function SummaryRow({ label, value, testID }: { label: string; value: string; testID: string }) {
  return (
    <View className="flex-row items-center py-[8px]" style={{ gap: 8 }}>
      <Text className="flex-1 font-cairo text-[14px] leading-[21px] text-[#6B6A6A]" style={RTL}>
        {label}
      </Text>
      <Text testID={testID} className="font-cairo-bold text-[14px] leading-[21px] text-[#111111]" style={AMOUNT}>
        {value}
      </Text>
    </View>
  );
}

/** «ملخص الدفع»: the price, the code's discount, the total. */
export function PaymentSummary({
  quote,
  purpose,
}: {
  quote: CheckoutQuote;
  purpose: CheckoutPurpose;
}) {
  return (
    <View style={{ gap: 14 }}>
      <SectionTitle>ملخص الدفع</SectionTitle>
      <View className="rounded-[6px] border border-[#ECECEC] bg-white px-[16px] py-[12px]" style={{ gap: 10 }}>
        <View>
          <SummaryRow label={priceLabel(purpose)} value={formatKwd(quote.price)} testID="checkout-summary-price" />
          {quote.discount > 0 && (
            <SummaryRow label="الخصم" value={formatKwd(quote.discount, true)} testID="checkout-summary-discount" />
          )}
        </View>
        <Image
          source={require('@/assets/icons/checkout/dashed-line.svg')}
          style={{ width: '100%', height: 1 }}
          contentFit="fill"
        />
        <SummaryRow label="الإجمالي" value={formatKwd(quote.total)} testID="checkout-summary-total" />
      </View>
    </View>
  );
}
