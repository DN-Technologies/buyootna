import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ChangePasswordOtpSheet } from '@/features/individual/components/more/change-password';
import {
  contactPhoneService,
  ContactPhoneState,
} from '@/shared/api/contactPhone.service';
import { useOtpVerification } from '@/shared/hooks/useOtpVerification';
import { localPhone } from '@/shared/hooks/usePhoneVerification';
import { showAlert } from '@/shared/utils/alert';

/**
 * رقم التواصل for the active persona: by default people reach it on the
 * account's phone; unticked, it gets its own number (e.g. a company's line),
 * proven with an SMS code. Saves on its own, separately from the form.
 */
export default function IdentityContactPhone() {
  const [state, setState] = useState<ContactPhoneState | null>(null);
  const [ownNumber, setOwnNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // Unticked locally, before the persona's own number is verified
  const [editingOwn, setEditingOwn] = useState(false);

  useEffect(() => {
    contactPhoneService
      .get()
      .then((s) => {
        setState(s);
        setOwnNumber(localPhone(s.contactPhone));
        setEditingOwn(!s.useAccountPhone);
      })
      .catch(() => setState(null));
  }, []);

  const check = useOtpVerification(
    { request: contactPhoneService.requestOtp, verify: contactPhoneService.verify },
    async () => {
      const next = await contactPhoneService.get();
      setState(next);
      showAlert('نجاح', 'تم التحقق من رقم التواصل لهذه الهوية');
    },
  );

  if (!state) return null;

  const useAccount = !editingOwn;
  const ownIsSavedAndVerified =
    state.contactPhoneVerified &&
    localPhone(state.contactPhone) === localPhone(ownNumber);

  const setUseAccount = async (value: boolean) => {
    if (!value) {
      // Unticking: show the own-number field; it saves once verified
      setEditingOwn(true);
      return;
    }
    setEditingOwn(false);
    if (state.useAccountPhone) return;
    setIsSaving(true);
    try {
      setState(await contactPhoneService.setUseAccountPhone(true));
    } catch (error: any) {
      setEditingOwn(true);
      showAlert('خطأ', error?.response?.data?.message || 'تعذر حفظ رقم التواصل');
    } finally {
      setIsSaving(false);
    }
  };

  const saveOwnNumber = async () => {
    if (localPhone(ownNumber).length !== 8) {
      showAlert('تنبيه', 'أدخل رقم هاتف كويتياً صحيحاً من 8 أرقام');
      return;
    }
    // The verified number is just switched back on; a new one needs the code
    if (ownIsSavedAndVerified) {
      setIsSaving(true);
      try {
        setState(await contactPhoneService.setUseAccountPhone(false));
      } catch (error: any) {
        showAlert('خطأ', error?.response?.data?.message || 'تعذر حفظ رقم التواصل');
      } finally {
        setIsSaving(false);
      }
      return;
    }
    await check.start(localPhone(ownNumber));
  };

  const ownActive = !state.useAccountPhone && ownIsSavedAndVerified;

  return (
    <View testID="identity-contact-phone">
      <TouchableOpacity
        testID="identity-contact-phone-checkbox"
        activeOpacity={0.7}
        disabled={isSaving}
        onPress={() => setUseAccount(!useAccount)}
        className="flex-row items-center gap-2"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: useAccount }}
      >
        <View
          className={`h-5 w-5 items-center justify-center rounded border-[1.5px] ${
            useAccount ? 'border-[#15304D] bg-[#15304D]' : 'border-[#6B6A6A]'
          }`}
        >
          {useAccount && <Feather name="check" size={13} color="#FFFFFF" />}
        </View>
        <Text
          className="flex-1 font-cairo-medium leading-[22px] text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          استخدم رقم هاتف الحساب للتواصل مع هذه الهوية
        </Text>
        {isSaving && <ActivityIndicator size="small" color="#15304D" />}
      </TouchableOpacity>

      {useAccount ? (
        <Text
          className="mt-1.5 font-cairo text-xs text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {state.accountPhone
            ? `يتواصل معك الناس على ${localPhone(state.accountPhone)}`
            : 'أضف رقم هاتف للحساب ليتمكن الناس من التواصل معك'}
        </Text>
      ) : (
        <View className="mt-3">
          <Text
            className="mb-1.5 font-cairo-medium text-sm text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            رقم التواصل لهذه الهوية
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              testID="identity-contact-phone-input"
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-right font-cairo-medium text-[#111111]"
              value={ownNumber}
              onChangeText={setOwnNumber}
              keyboardType="phone-pad"
              textAlign="right"
              maxLength={8}
            />
            <View className="w-24 items-center justify-center rounded-xl border border-gray-200 bg-white px-3">
              <Text className="font-cairo-medium text-sm leading-[22px] text-[#64748B]">
                +965
              </Text>
            </View>
          </View>
          {ownActive ? (
            <Text
              className="mt-1.5 font-cairo text-xs text-[#15803D]"
              style={{ writingDirection: 'rtl' }}
            >
              ✓ رقم موثّق، يتواصل الناس مع هذه الهوية عليه
            </Text>
          ) : (
            <TouchableOpacity
              testID="identity-contact-phone-save"
              activeOpacity={0.8}
              disabled={isSaving}
              onPress={saveOwnNumber}
              className="mt-2 self-start rounded-full bg-[#15304D] px-4 py-2"
            >
              <Text className="font-cairo-semibold leading-[20px] text-xs text-white">
                {ownIsSavedAndVerified ? 'استخدم هذا الرقم' : 'تحقق من الرقم واحفظه'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ChangePasswordOtpSheet
        ref={check.sheetRef}
        testID="contact-phone-otp-sheet"
        otpInputRef={check.otpInputRef}
        otp={check.otp}
        onOtpChange={check.setOtp}
        otpError={check.otpError}
        maskedPhone={check.destination}
        secondsLeft={check.secondsLeft}
        isReady={check.isReady}
        limitReachedMessage={check.limitReachedMessage}
        onResendOtp={check.resend}
        onVerifyOtp={check.verify}
        isSubmitting={check.isSubmitting}
      />
    </View>
  );
}
