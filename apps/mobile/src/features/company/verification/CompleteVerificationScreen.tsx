import { Feather } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarClockIcon } from '@/assets/icons/more';
import SelectionBottomSheet from '@/shared/components/feedback/SelectionBottomSheet';
import { SPECIALTIES } from '@/shared/data/serviceCatalog';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import CompanyFormHeader from '../components/CompanyFormHeader';
import { formatExpiryDate, formatSubmittedAt } from './format';
import { CheckLargeIcon } from './icons';
import { pickLicenseFile } from './SubmitVerificationSheet';
import { useCompanyVerification } from './useCompanyVerification';
import {
  LicenseFile,
  VerificationField,
  verificationService,
} from './verification.service';
import {
  IssueBox,
  IssueText,
  LicenseFileRow,
  Notice,
} from './VerificationParts';
import VerificationResultSheet from './VerificationResultSheet';

const FIELDS: VerificationField[] = [
  'licenseFile',
  'licenseNumber',
  'licenseActivity',
  'licenseExpiry',
];

const LABEL: Record<VerificationField, string> = {
  licenseFile: 'صورة الرخصة',
  licenseNumber: 'رقم الرخصة',
  licenseActivity: 'النشاط',
  licenseExpiry: 'تاريخ الانتهاء',
};

/** "أ، ب وج" */
const joinArabic = (items: string[]) =>
  items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join('، ')} و${items[items.length - 1]}`;

const INPUT =
  'h-[46px] w-full flex-row items-center justify-between rounded-[8px] border border-[#ECECEC] bg-white px-3';

function FieldCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="w-full gap-4 rounded-[6px] bg-[#FEFEFE] p-3.5">
      <View className="w-full gap-3">
        <Text
          className="font-cairo-bold text-[13px] leading-[16px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {title}
        </Text>
        <View className="h-px w-full bg-[#ECECEC]" />
      </View>
      {children}
    </View>
  );
}

function InputLabel({ text }: { text: string }) {
  return (
    <Text
      className="w-full font-cairo-medium text-[14px] leading-[21px] text-[#111111]"
      style={{ writingDirection: 'rtl' }}
    >
      {text}
    </Text>
  );
}

/**
 * «استكمال بيانات طلب التوثيق» (Figma 10311:141895, 10312:142425): the
 * fields the admin sent back, each with its reason, are filled again; the
 * rest were accepted and stay as sent.
 */
export default function CompleteVerificationScreen() {
  const router = useRouter();
  const { identityId, request, invalidate } = useCompanyVerification();
  const resultSheetRef = useRef<BottomSheetModal>(null);
  const activitySheetRef = useRef<BottomSheetModal>(null);

  const [file, setFile] = useState<LicenseFile | null>(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [activity, setActivity] = useState('');
  const [expiry, setExpiry] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const issues = request?.issues ?? {};
  const asked = FIELDS.filter((field) => issues[field]);
  const accepted = FIELDS.filter((field) => !issues[field]);
  // A general note, unless it's the same text as every field's
  const note =
    issues.note && asked.some((field) => issues[field] !== issues.note)
      ? issues.note
      : undefined;

  const pick = async () => {
    const picked = await pickLicenseFile();
    if (picked) setFile(picked);
  };

  const resend = async () => {
    if (!identityId || isSending) return;
    if (issues.licenseFile && !file) {
      showAlert('تنبيه', 'يرجى استبدال صورة الرخصة');
      return;
    }
    if (issues.licenseNumber && !licenseNumber.trim()) {
      showAlert('تنبيه', 'يرجى ادخال رقم الرخصة');
      return;
    }
    if (issues.licenseActivity && !activity) {
      showAlert('تنبيه', 'يرجى اختيار النشاط');
      return;
    }
    if (issues.licenseExpiry && !expiry) {
      showAlert('تنبيه', 'يرجى اختيار تاريخ الانتهاء');
      return;
    }
    setIsSending(true);
    try {
      await verificationService.resubmit(identityId, {
        licenseNumber: issues.licenseNumber ? licenseNumber.trim() : undefined,
        licenseActivity: issues.licenseActivity ? activity : undefined,
        licenseExpiry: issues.licenseExpiry ? expiry : undefined,
        file: issues.licenseFile ? file : undefined,
      });
      await invalidate();
      resultSheetRef.current?.present();
    } catch (error) {
      showAlert('خطأ', getApiErrorMessage(error, 'تعذر إرسال الطلب'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#F8F8F8]">
      <View className="border-b-[0.5px] border-[#ECECEC] pb-2">
        <CompanyFormHeader
          title="استكمال بيانات طلب التوثيق"
          onBack={() => router.back()}
        />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!request ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#15304D" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 16, gap: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="w-full gap-2">
              <Text
                className="w-full font-cairo-bold text-[15px] leading-[20px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {formatSubmittedAt(request.reviewedAt ?? request.submittedAt)}
              </Text>
              <Notice variant="warning">
                {`بعد مراجعة طلبك، نحتاج إلى تحديث البيانات التالية لاستكمال عملية التوثيق.${
                  note ? `\n${note}` : ''
                }`}
              </Notice>
            </View>

            <View className="w-full gap-3">
              <Text
                className="font-cairo-bold text-[15px] leading-[20px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                البيانات المطلوبة للتعديل
              </Text>

              {issues.licenseFile ? (
                <FieldCard title={LABEL.licenseFile}>
                  <IssueBox>
                    <LicenseFileRow
                      url={request.licenseFileUrl}
                      name={request.licenseFileName}
                      size={request.licenseFileSize}
                      mimeType={request.licenseFileType}
                      date={request.submittedAt}
                    />
                    <IssueText>{issues.licenseFile}</IssueText>
                  </IssueBox>
                  <TouchableOpacity
                    testID="verification-replace-file"
                    activeOpacity={0.7}
                    onPress={pick}
                    className="h-10 w-full flex-row items-center justify-center gap-2 rounded-[24px] border border-[#E2E8F0]"
                  >
                    {file ? (
                      <Feather name="check-circle" size={16} color="#018B1B" />
                    ) : null}
                    <Text
                      numberOfLines={1}
                      className="font-cairo-bold text-[14px] text-[#111111]"
                    >
                      {file
                        ? file.name || 'تم اختيار الصورة'
                        : 'استبدال صورة الرخصة'}
                    </Text>
                  </TouchableOpacity>
                </FieldCard>
              ) : null}

              {issues.licenseNumber ? (
                <FieldCard title={LABEL.licenseNumber}>
                  <IssueBox>
                    <Text
                      className="w-full font-cairo-medium text-[14px] leading-[17px] text-[#9C1E28]"
                      style={{ writingDirection: 'rtl' }}
                    >
                      {'رقم الرخصة الذي ادخلته '}
                      <Text className="font-cairo-bold">
                        “{request.licenseNumber}”
                      </Text>
                      {` ${issues.licenseNumber}`}
                    </Text>
                  </IssueBox>
                  <View className="w-full gap-3">
                    <InputLabel text="ادخل رقم الرخصة" />
                    <View className={INPUT}>
                      <TextInput
                        testID="verification-new-license-number"
                        value={licenseNumber}
                        onChangeText={setLicenseNumber}
                        placeholder="6743963845"
                        placeholderTextColor="#979797"
                        keyboardType="number-pad"
                        className="flex-1 font-cairo-regular text-[14px] text-[#111111]"
                        style={{ textAlign: 'right', writingDirection: 'rtl' }}
                      />
                    </View>
                  </View>
                </FieldCard>
              ) : null}

              {issues.licenseActivity ? (
                <FieldCard title={LABEL.licenseActivity}>
                  <IssueBox>
                    <IssueText>{issues.licenseActivity}</IssueText>
                  </IssueBox>
                  <View className="w-full gap-3">
                    <InputLabel text="اختر النشاط" />
                    <TouchableOpacity
                      testID="verification-new-activity"
                      activeOpacity={0.7}
                      onPress={() => activitySheetRef.current?.present()}
                      className={INPUT}
                    >
                      <Text
                        numberOfLines={1}
                        className={`flex-1 font-cairo-regular text-[14px] ${
                          activity ? 'text-[#111111]' : 'text-[#979797]'
                        }`}
                        style={{ writingDirection: 'rtl' }}
                      >
                        {activity || request.licenseActivity || 'اختر النشاط'}
                      </Text>
                      <Feather name="chevron-down" size={18} color="#111111" />
                    </TouchableOpacity>
                  </View>
                </FieldCard>
              ) : null}

              {issues.licenseExpiry ? (
                <FieldCard title={LABEL.licenseExpiry}>
                  <IssueBox>
                    <IssueText>{issues.licenseExpiry}</IssueText>
                  </IssueBox>
                  <View className="w-full gap-3">
                    <InputLabel text="اختر تاريخ الانتهاء" />
                    <TouchableOpacity
                      testID="verification-new-expiry"
                      activeOpacity={0.7}
                      onPress={() => setShowDatePicker((open) => !open)}
                      className={INPUT}
                    >
                      <Text
                        className={`flex-1 font-cairo-regular text-[14px] ${
                          expiry ? 'text-[#111111]' : 'text-[#979797]'
                        }`}
                        style={{ writingDirection: 'rtl' }}
                      >
                        {expiry || request.licenseExpiry || '15 ابريل 2027'}
                      </Text>
                      <CalendarClockIcon size={18} color="#111111" />
                    </TouchableOpacity>
                    {showDatePicker ? (
                      <DateTimePicker
                        value={new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={new Date()}
                        onChange={(_event, date) => {
                          if (Platform.OS !== 'ios') setShowDatePicker(false);
                          if (date) setExpiry(formatExpiryDate(date));
                        }}
                      />
                    ) : null}
                  </View>
                </FieldCard>
              ) : null}
            </View>

            {accepted.length ? (
              <View
                className="w-full flex-row items-start gap-1.5 rounded-[6px] bg-[#FEFEFE] px-3 pb-3 pt-2.5"
                style={{ borderStartWidth: 2, borderStartColor: '#018B1B' }}
              >
                <CheckLargeIcon width={24} height={24} />
                <View className="flex-1 items-start gap-2">
                  <Text
                    className="font-cairo-bold text-[14px] leading-[18px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    بيانات أخرى مقبولة
                  </Text>
                  <Text
                    className="w-full font-cairo-medium text-[12px] leading-[14px] text-[#6B6A6A]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    {`${joinArabic(accepted.map((field) => LABEL[field]))} ${
                      accepted.length > 1 ? 'تم قبولها' : 'تم قبوله'
                    } ولا تحتاج إلى تعديل.`}
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
        )}

        <View className="border-t border-[#ECECEC] bg-[#F8F8F8] px-3 pb-3 pt-4">
          <TouchableOpacity
            testID="verification-resubmit"
            activeOpacity={0.8}
            disabled={isSending || !request}
            onPress={resend}
            className="h-12 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
          >
            {isSending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-cairo-semibold text-[14px] leading-[21px] text-white">
                اعادة ارسال الطلب
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <SelectionBottomSheet
        ref={activitySheetRef}
        title="اختر النشاط"
        options={SPECIALTIES}
        selectedValue={activity}
        onSelect={setActivity}
      />
      <VerificationResultSheet
        ref={resultSheetRef}
        variant="sent"
        onDone={() => router.back()}
      />
    </SafeAreaView>
  );
}
