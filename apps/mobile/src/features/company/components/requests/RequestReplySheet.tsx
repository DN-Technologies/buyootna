import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import SuccessBottomSheet from '@/shared/components/feedback/SuccessBottomSheet';
import { showAlert } from '@/shared/utils/alert';

import { STATUS_CONFIGS } from './CompanyRequestListItem';
import type { CompanyRequestItem } from './types';

const MESSAGE_MAX = 2000;
const EXCLUDES_MAX = 1000;
const NOTES_MAX = 1000;

interface RequestReplySheetProps {
  // The request being answered; the sheet is presented once it's set
  request: CompanyRequestItem | null;
  onSent?: () => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  height,
  testID,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  maxLength: number;
  height: number;
  testID: string;
}) {
  return (
    <View className="w-full gap-3">
      <Text
        className="font-cairo-medium text-[14px] leading-[21px] text-[#111111]"
        style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
      >
        {label} <Text className="text-[#A0A0A0]">(اختياري)</Text>
      </Text>
      <BottomSheetTextInput
        testID={testID}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#979797"
        maxLength={maxLength}
        multiline
        textAlignVertical="top"
        className="w-full rounded-[6px] border border-[#ECECEC] bg-white px-3 py-4 font-cairo-regular text-[14px] text-[#111111]"
        style={{ height, writingDirection: 'rtl', textAlign: 'right' }}
      />
    </View>
  );
}

/**
 * الرد على العميل (Figma 4410:165224): the request in short, then
 * العرض يشمل, العرض لا يشمل and ملاحظات (shown as تفاصيل الرد), all optional
 * but one needed, sent as the company's offer. The client is notified; تم إرسال ردك بنجاح! follows.
 */
const RequestReplySheet = forwardRef<BottomSheetModal, RequestReplySheetProps>(
  ({ request, onSent }, ref) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const queryClient = useQueryClient();
    const successRef = useRef<BottomSheetModal>(null);
    const [message, setMessage] = useState('');
    const [excludes, setExcludes] = useState('');
    const [notes, setNotes] = useState('');
    const [sending, setSending] = useState(false);

    const canSend =
      !!(message.trim() || excludes.trim() || notes.trim()) && !sending;

    const dismiss = useCallback(() => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    }, [ref]);

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

    const send = async () => {
      if (!request || !canSend) return;
      setSending(true);
      try {
        await companyRequestsService.respond(request.id, {
          ...(message.trim() ? { message: message.trim() } : {}),
          ...(excludes.trim() ? { excludes: excludes.trim() } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        });
        queryClient.invalidateQueries({ queryKey: ['companyRequests'] });
        queryClient.invalidateQueries({
          queryKey: ['companyRequest', request.id],
        });
        setMessage('');
        setExcludes('');
        setNotes('');
        dismiss();
        successRef.current?.present();
        onSent?.();
      } catch (error: any) {
        if (handleSubscriptionRequired(error, router)) return;
        const backendMsg = error?.response?.data?.message;
        showAlert(
          'تعذر إرسال الرد',
          Array.isArray(backendMsg)
            ? backendMsg.join('\n')
            : backendMsg || 'حدث خطأ ما، حاول مرة أخرى',
        );
      } finally {
        setSending(false);
      }
    };

    const status = request
      ? (STATUS_CONFIGS[request.status] ?? STATUS_CONFIGS.pending)
      : STATUS_CONFIGS.pending;
    const subtitle = [request?.category, request?.offerType]
      .filter(Boolean)
      .join(' • ');

    return (
      <>
        <BottomSheetModal
          ref={ref}
          topInset={insets.top}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          handleIndicatorStyle={{ backgroundColor: '#000000', width: 45, height: 5 }}
          backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
        >
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="flex-row items-center justify-between px-4 py-1.5">
              <Text className="font-cairo-semibold text-[18px] text-[#111111]">
                الرد على العميل
              </Text>
              <TouchableOpacity
                testID="request-reply-close"
                accessibilityLabel="إغلاق"
                onPress={dismiss}
                className="size-8 items-center justify-center rounded-full"
              >
                <Feather name="x" size={20} color="#111111" />
              </TouchableOpacity>
            </View>

            <View className="gap-4 px-4 pt-4">
              {/* The request in short */}
              <View className="w-full flex-row items-center gap-3 rounded-[8px] bg-[#F5F7F9] p-3">
                <View className="flex-1 gap-2 py-1.5">
                  <Text
                    testID="request-reply-title"
                    className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                    numberOfLines={2}
                  >
                    {request?.title}
                  </Text>
                  {!!subtitle && (
                    <Text
                      className="font-cairo-medium text-[12px] text-[#6B6A6A]"
                      style={{ writingDirection: 'rtl' }}
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
                <View
                  className={`h-5 items-center justify-center rounded-br-[8px] rounded-tl-[8px] rounded-tr-[8px] px-2 ${status.bgClass}`}
                >
                  <Text className={`font-almarai-regular text-[12px] ${status.textClass}`}>
                    {status.label}
                  </Text>
                </View>
              </View>

              <Field
                testID="request-reply-message"
                label="العرض يشمل"
                value={message}
                onChange={setMessage}
                placeholder="اكتب تفاصيل عرضك وما يشمله..."
                maxLength={MESSAGE_MAX}
                height={140}
              />
              <Field
                testID="request-reply-excludes"
                label="العرض لا يشمل"
                value={excludes}
                onChange={setExcludes}
                placeholder="اكتب ما لا يشمله العرض..."
                maxLength={EXCLUDES_MAX}
                height={96}
              />
              <Field
                testID="request-reply-notes"
                label="ملاحظات"
                value={notes}
                onChange={setNotes}
                placeholder="اكتب أي ملاحظات اضافية للعميل.."
                maxLength={NOTES_MAX}
                height={96}
              />
            </View>

            <View className="gap-2 px-4 pt-6">
              <TouchableOpacity
                testID="request-reply-send"
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSend }}
                disabled={!canSend}
                activeOpacity={0.8}
                onPress={send}
                className={`h-12 w-full items-center justify-center rounded-[24px] ${
                  canSend ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
                }`}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-cairo-semibold text-[14px] leading-[21px] text-white">
                    ارسال الرد
                  </Text>
                )}
              </TouchableOpacity>
              <Text
                className="w-full text-center font-cairo-medium text-[14px] leading-[21px] text-[#A0A0A0]"
                style={{ letterSpacing: -0.408 }}
              >
                سيتم اشعار العميل فورا بقبولك للطلب
              </Text>
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>

        <SuccessBottomSheet
          ref={successRef}
          title="تم إرسال ردك بنجاح!"
          description="تم إرسال ردك إلى العميل، وسيتم إشعارك بعد أن يراجع العميل الرد ويقبله أو يرفضه."
          buttonText="حسنًا"
          onPress={() => successRef.current?.dismiss()}
        />
      </>
    );
  },
);

RequestReplySheet.displayName = 'RequestReplySheet';

export default RequestReplySheet;
