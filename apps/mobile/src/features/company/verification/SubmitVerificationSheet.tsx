import { Feather } from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarClockIcon, FileUploadDropzoneIcon } from '@/assets/icons/more';
import SelectionBottomSheet from '@/shared/components/feedback/SelectionBottomSheet';
import { SPECIALTIES } from '@/shared/data/serviceCatalog';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import { formatExpiryDate } from './format';
import { LicenseFile, verificationService } from './verification.service';
import {
  renderSheetBackdrop,
  SHEET_BACKGROUND,
  SHEET_HANDLE,
  SheetHeader,
} from './VerificationParts';

// «بحد أقصى 10 ميجا لكل ملف»
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function pickLicenseFile(): Promise<LicenseFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets.length) return null;
  const asset = result.assets[0];
  if (asset.size && asset.size > MAX_FILE_BYTES) {
    showAlert('تنبيه', 'حجم الملف أكبر من 10 ميجا');
    return null;
  }
  return { uri: asset.uri, name: asset.name, mimeType: asset.mimeType };
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <View className="w-full flex-row items-center">
      <Text className="font-cairo-medium text-[14px] leading-[21px] text-[#111111]">
        {text}
      </Text>
      {required ? (
        <Text className="font-cairo-medium text-[14px] leading-[21px] text-[#D12121]">
          *
        </Text>
      ) : null}
    </View>
  );
}

/** «الصورة»: the dashed drop zone, or the picked file. */
export function LicenseDropzone({
  file,
  onPick,
}: {
  file: LicenseFile | null;
  onPick: () => void;
}) {
  return (
    <TouchableOpacity
      testID="verification-license-file"
      activeOpacity={0.7}
      onPress={onPick}
      className="w-full items-center justify-center rounded-[4px] border border-dashed border-[#D7D7D7] bg-white px-6 py-4"
    >
      {file ? (
        <View className="items-center gap-1">
          <Feather name="check-circle" size={28} color="#018B1B" />
          <Text
            numberOfLines={1}
            className="text-center font-cairo-bold text-[14px] text-[#111111]"
          >
            {file.name || 'license'}
          </Text>
          <Text className="font-cairo-medium text-[12px] text-[#15304D]">
            اضغط لتغيير الملف
          </Text>
        </View>
      ) : (
        <View className="w-full items-center gap-2">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F5F7F9]">
            <FileUploadDropzoneIcon size={24} color="#15304D" />
          </View>
          <Text className="text-center font-cairo-medium text-[14px] leading-[21px] text-[#111111]">
            <Text className="font-cairo-bold text-[#15304D]">اضغط هنا</Text>{' '}
            لرفع صورة
          </Text>
          <Text className="w-full text-center font-cairo-medium text-[12px] leading-[14px] text-[#6B6A6A]">
            الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const INPUT =
  'h-[46px] w-full flex-row items-center justify-between rounded-[8px] border border-[#ECECEC] bg-white px-3';

interface Props {
  identityId?: string;
  // Sent: the parent refreshes and shows «تم إرسال طلبك بنجاح»
  onSent: () => void;
}

/** «تقديم طلب توثيق» (Figma 10305:136105). */
const SubmitVerificationSheet = forwardRef<BottomSheetModal, Props>(
  ({ identityId, onSent }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    useImperativeHandle(ref, () => sheetRef.current as BottomSheetModal);
    const activitySheetRef = useRef<BottomSheetModal>(null);
    const { bottom } = useSafeAreaInsets();

    const [activity, setActivity] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [file, setFile] = useState<LicenseFile | null>(null);
    const [isSending, setIsSending] = useState(false);

    const reset = () => {
      setActivity('');
      setLicenseNumber('');
      setExpiry('');
      setShowDatePicker(false);
      setFile(null);
    };

    const pick = async () => {
      const picked = await pickLicenseFile();
      if (picked) setFile(picked);
    };

    const send = async () => {
      if (!identityId || isSending) return;
      if (!licenseNumber.trim()) {
        showAlert('تنبيه', 'رقم الرخصة مطلوب');
        return;
      }
      if (!file) {
        showAlert('تنبيه', 'صورة الرخصة مطلوبة');
        return;
      }
      setIsSending(true);
      try {
        await verificationService.submit(identityId, {
          licenseNumber: licenseNumber.trim(),
          licenseActivity: activity || undefined,
          licenseExpiry: expiry || undefined,
          file,
        });
        sheetRef.current?.dismiss();
        reset();
        onSent();
      } catch (error) {
        showAlert('خطأ', getApiErrorMessage(error, 'تعذر إرسال الطلب'));
      } finally {
        setIsSending(false);
      }
    };

    return (
      <>
        <BottomSheetModal
          ref={sheetRef}
          enableDynamicSizing
          backdropComponent={renderSheetBackdrop}
          handleIndicatorStyle={SHEET_HANDLE}
          backgroundStyle={SHEET_BACKGROUND}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
        >
          <BottomSheetView>
            <View className="px-4">
              <SheetHeader
                title="تقديم طلب توثيق"
                onClose={() => sheetRef.current?.dismiss()}
              />
            </View>

            <View className="gap-4 px-4 pt-4">
              {/* النشاط */}
              <View className="w-full gap-3">
                <FieldLabel text="النشاط" />
                <TouchableOpacity
                  testID="verification-activity"
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
                    {activity || 'تشطيبات،بناء،ديكور،كهرباء'}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#111111" />
                </TouchableOpacity>
              </View>

              {/* رقم الرخصة* */}
              <View className="w-full gap-3">
                <FieldLabel text="رقم الرخصة" required />
                <View className={INPUT}>
                  <BottomSheetTextInput
                    testID="verification-license-number"
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                    placeholder="6743963845"
                    placeholderTextColor="#979797"
                    keyboardType="number-pad"
                    style={{
                      flex: 1,
                      fontFamily: 'Cairo_400Regular',
                      fontSize: 14,
                      color: '#111111',
                      textAlign: 'right',
                      writingDirection: 'rtl',
                    }}
                  />
                </View>
              </View>

              {/* تاريخ انتهاء */}
              <View className="w-full gap-3">
                <FieldLabel text="تاريخ انتهاء" />
                <TouchableOpacity
                  testID="verification-expiry"
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
                    {expiry || '15 ابريل 2027'}
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

              {/* الصورة */}
              <View className="w-full gap-3">
                <Text
                  className="w-full font-cairo-medium text-[14px] leading-[21px] text-black"
                  style={{ writingDirection: 'rtl' }}
                >
                  الصورة
                </Text>
                <View className="w-full gap-2">
                  <LicenseDropzone file={file} onPick={pick} />
                  <Text
                    className="w-full font-cairo-medium text-[12px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    صورة الرخصة تؤهلك لتوثيق حسابك
                  </Text>
                </View>
              </View>
            </View>

            <View
              className="bg-white px-4 pt-7"
              style={{ paddingBottom: 16 + bottom }}
            >
              <TouchableOpacity
                testID="verification-submit"
                activeOpacity={0.8}
                disabled={isSending}
                onPress={send}
                className="h-12 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
              >
                {isSending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-cairo-semibold text-[14px] leading-[21px] text-white">
                    ارسال الطلب
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        <SelectionBottomSheet
          ref={activitySheetRef}
          title="اختر النشاط"
          options={SPECIALTIES}
          selectedValue={activity}
          onSelect={setActivity}
        />
      </>
    );
  },
);

SubmitVerificationSheet.displayName = 'SubmitVerificationSheet';

export default SubmitVerificationSheet;
