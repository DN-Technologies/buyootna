import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useId, useRef } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RequestQuoteAttachments from '@/features/individual/components/request-quote/RequestQuoteAttachments';
import RequestQuoteHeader from '@/features/individual/components/request-quote/RequestQuoteHeader';
import RequestQuotePriceRange from '@/features/individual/components/request-quote/RequestQuotePriceRange';
import RequestQuoteSubmitButton from '@/features/individual/components/request-quote/RequestQuoteSubmitButton';
import { PLACEHOLDER_COLOR, requestQuoteInputStyle } from '@/features/individual/components/request-quote/styles';
import {
  SPECIALTY_OPTIONS,
  useRequestQuoteForm,
} from '@/features/individual/hooks/useRequestQuoteForm';
import SuccessBottomSheet from '@/shared/components/feedback/SuccessBottomSheet';
import InlineDropdown from '@/shared/components/filters/InlineDropdown';
import GovAreaFields from '@/shared/components/forms/GovAreaFields';
import RequirementMark from '@/shared/components/ui/RequirementMark';
import { getIdentityHomeRoute } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function RequestQuoteScreen() {
  const router = useRouter();
  const activeIdentity = useAuthStore((state) => state.activeIdentity);
  const successSheetRef = useRef<BottomSheetModal>(null);
  const keyboardAccessoryId = useId();

  const {
    specialtyId,
    setSpecialtyId,
    requestTypeId,
    setRequestTypeId,
    requestTypeOptions,
    priceFrom,
    setPriceFrom,
    priceTo,
    setPriceTo,
    govArea,
    description,
    setDescription,
    attachments,
    isSubmitting,
    handlePickAttachments,
    removeAttachment,
    handleSubmit,
  } = useRequestQuoteForm();

  const handleSuccess = () => {
    successSheetRef.current?.present();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <RequestQuoteHeader onBack={() => router.back()} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- مجال التخصص --- */}
          <InlineDropdown
            testID="request-specialty"
            title="مجال التخصص"
            required
            placeholder="اختر نوع الخدمة أو اسم الشركة.."
            options={SPECIALTY_OPTIONS}
            value={specialtyId}
            onChange={setSpecialtyId}
          />

          {/* --- نوع الطلب --- */}
          {/* The chosen specialty's types (the services catalogue) */}
          <InlineDropdown
            testID="request-type"
            title="نوع الطلب"
            optional
            placeholder={
              specialtyId ? 'حدد الخدمة اللي ترغب بها' : 'اختر مجال التخصص أولاً'
            }
            disabled={!specialtyId}
            options={requestTypeOptions}
            value={requestTypeId}
            onChange={setRequestTypeId}
          />

          {/* --- نطاق السعر --- */}
          <RequestQuotePriceRange
            priceFrom={priceFrom}
            priceTo={priceTo}
            onPriceFromChange={setPriceFrom}
            onPriceToChange={setPriceTo}
            keyboardAccessoryId={keyboardAccessoryId}
          />

          {/* --- المحافظة / المنطقة (no map pin) --- */}
          <GovAreaFields value={govArea} />

          {/* --- وصف --- */}
          <View className="mb-6 w-full">
            <Text
              className="mb-2 font-cairo-medium text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              وصف
              <RequirementMark required />
            </Text>
            <TextInput
              testID="request-quote-description"
              value={description}
              onChangeText={setDescription}
              placeholder="اشرح تفاصيل الخدمة المطلوبة..."
              placeholderTextColor={PLACEHOLDER_COLOR}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              inputAccessoryViewID={
                Platform.OS === 'ios' ? keyboardAccessoryId : undefined
              }
              style={[requestQuoteInputStyle, { height: 100, paddingTop: 12 }]}
            />
          </View>

          {/* --- مرفقات --- */}
          <RequestQuoteAttachments
            attachments={attachments}
            onPickAttachments={handlePickAttachments}
            onRemoveAttachment={removeAttachment}
          />
        </ScrollView>

        {/* --- Submit Button --- */}
        <RequestQuoteSubmitButton
          isSubmitting={isSubmitting}
          onSubmit={() => handleSubmit(handleSuccess)}
        />
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={keyboardAccessoryId}>
          <View className="flex-row items-center justify-end border-t border-gray-200 bg-[#F8FAFC] px-4 py-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Keyboard.dismiss()}
            >
              <Text className="font-cairo-bold text-[15px] text-[#15304D]">
                تم
              </Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}


      <SuccessBottomSheet
        ref={successSheetRef}
        title="تم إرسال طلبك بنجاح"
        description="تم إرسال طلبك إلى الشركات المناسبة، وستتلقى عروض الأسعار قريباً."
        buttonText="متابعة العروض"
        onPress={() => {
          successSheetRef.current?.dismiss();
          router.replace('/activity');
        }}
        secondaryButtonText="العودة للرئيسية"
        onSecondaryPress={() => {
          successSheetRef.current?.dismiss();
          router.replace(getIdentityHomeRoute(activeIdentity?.type));
        }}
      />
    </SafeAreaView>
  );
}
