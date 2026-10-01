import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { LoginIcon } from '@/assets/icons/settings';
import {
  type LoginMethod,
  type LoginMethodResponse,
  settingsService,
} from '@/shared/api/settings.service';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import LoginMethodToast from './LoginMethodToast';

export const PHONE_NOT_VERIFIED_MESSAGE =
  'يجب التحقق من رقم الهاتف أولاً، يمكنك التحقق من رقم الهاتف من تعديل الملف الشخصي.';
const NO_EMAIL_MESSAGE =
  'أضف بريداً إلكترونياً إلى حسابك أولاً لاستخدامه في تسجيل الدخول.';

interface LoginMethodSheetProps {
  // Called after a successful save, with the server's message
  onSaved: (message: string) => void;
}

interface OptionProps {
  id: LoginMethod;
  title: string;
  subtitle?: string | null;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}

function Radio({ selected, disabled }: { selected: boolean; disabled: boolean }) {
  return (
    <View
      className={`h-[18px] w-[18px] items-center justify-center rounded-full border ${
        selected ? 'border-[#15304D]' : 'border-[#A6A6A6]'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      {selected && <View className="h-[10px] w-[10px] rounded-full bg-[#15304D]" />}
    </View>
  );
}

function Option({ id, title, subtitle, selected, disabled, onPress }: OptionProps) {
  return (
    <TouchableOpacity
      testID={`login-method-${id}`}
      activeOpacity={0.7}
      onPress={onPress}
      // Greyed out but still tappable: tapping says why it can't be chosen
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityHint={disabled ? 'غير متاح حالياً' : undefined}
      className="rounded-[10px] items-start border border-[#ECECEC] bg-white px-3 py-3"
    >
      <View className="flex-row items-center gap-2">
        <Radio selected={selected} disabled={disabled} />
        <Text
          className={`font-cairo-medium text-[14px] ${
            disabled ? 'text-[#A6A6A6]' : 'text-[#111111]'
          }`}
        >
          {title}
        </Text>
      </View>
      {!!subtitle && (
        <Text
          className="mt-1 pl-7 font-cairo text-[12px] text-[#6B6A6A]"
          style={{ writingDirection: 'ltr' }}
        >
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/**
 * طريقة تسجيل الدخول: which identifier password login accepts -- email or
 * phone, or (the default) either. The phone can only be chosen once it is
 * SMS-verified (Edit Profile); tapping it before that explains why.
 */
const LoginMethodSheet = forwardRef<BottomSheetModal, LoginMethodSheetProps>(
  ({ onSaved }, ref) => {
    const [data, setData] = useState<LoginMethodResponse | null>(null);
    const [selected, setSelected] = useState<LoginMethod>('BOTH');
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);
    const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dismiss = useCallback(() => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    }, [ref]);

    const showWarning = (message: string) => {
      setWarning(message);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      warningTimer.current = setTimeout(() => setWarning(null), 4000);
    };

    useEffect(
      () => () => {
        if (warningTimer.current) clearTimeout(warningTimer.current);
      },
      [],
    );

    // Fresh state every time the sheet opens
    const load = async () => {
      setData(null);
      setLoadError(null);
      setWarning(null);
      try {
        const current = await settingsService.getLoginMethod();
        setData(current);
        setSelected(current.loginMethod);
      } catch (e) {
        setLoadError(getApiErrorMessage(e, 'تعذر تحميل طريقة تسجيل الدخول'));
      }
    };

    const choose = (method: LoginMethod) => {
      if (method === 'PHONE' && !data?.phoneVerified) {
        showWarning(PHONE_NOT_VERIFIED_MESSAGE);
        return;
      }
      if (method === 'EMAIL' && !data?.email) {
        showWarning(NO_EMAIL_MESSAGE);
        return;
      }
      setSelected(method);
    };

    const save = async () => {
      if (!data || isSaving) return;
      if (selected === data.loginMethod) {
        dismiss();
        return;
      }
      setIsSaving(true);
      try {
        const result = await settingsService.setLoginMethod(selected);
        dismiss();
        onSaved(result.message ?? 'تم تحديث طريقة تسجيل الدخول بنجاح.');
      } catch (e) {
        showWarning(getApiErrorMessage(e, 'تعذر حفظ طريقة تسجيل الدخول'));
      } finally {
        setIsSaving(false);
      }
    };

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
        onChange={(index) => {
          if (index === 0) void load();
        }}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#111111', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView className="px-4 pb-8 pt-2">
          {warning && (
            <LoginMethodToast kind="warning" message={warning} inline />
          )}

          <View className="items-center pt-2">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#F9FAFE]">
              <LoginIcon size={26} color="#15304D" />
            </View>
            <Text className="mb-4 font-cairo-semibold text-[18px] text-[#111111]">
              طريقة تسجيل الدخول
            </Text>
          </View>

          {!data && !loadError && (
            <ActivityIndicator className="my-10" color="#15304D" />
          )}
          {loadError && (
            <Text className="my-8 text-center font-cairo-medium text-sm text-red-500">
              {loadError}
            </Text>
          )}

          {data && (
            <View className="gap-3">
              <Option
                id="BOTH"
                title="البريد الالكتروني أو رقم الهاتف"
                selected={selected === 'BOTH'}
                disabled={false}
                onPress={() => choose('BOTH')}
              />
              <Option
                id="EMAIL"
                title="البريد الالكتروني"
                subtitle={data.email}
                selected={selected === 'EMAIL'}
                disabled={!data.email}
                onPress={() => choose('EMAIL')}
              />
              <Option
                id="PHONE"
                title="رقم الهاتف"
                subtitle={data.phone}
                selected={selected === 'PHONE'}
                disabled={!data.phoneVerified}
                onPress={() => choose('PHONE')}
              />
            </View>
          )}

          <View className="gap-2 pt-5">
            <TouchableOpacity
              testID="login-method-save"
              activeOpacity={0.8}
              disabled={!data || isSaving}
              onPress={save}
              className={`h-[48px] items-center justify-center rounded-[24px] bg-[#15304D] ${
                !data || isSaving ? 'opacity-60' : ''
              }`}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="font-cairo-semibold text-[14px] text-white">
                  حفظ
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              testID="login-method-cancel"
              activeOpacity={0.8}
              onPress={dismiss}
              className="h-[48px] items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
            >
              <Text className="font-cairo-semibold text-[14px] text-[#111111]">
                تراجع
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

LoginMethodSheet.displayName = 'LoginMethodSheet';

export default LoginMethodSheet;
