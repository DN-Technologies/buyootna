import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CalendarClockIcon, FileUploadDropzoneIcon } from '@/assets/icons/more';

import type { PickedFile } from './useCompanyEditProfile';

interface CompanyLicenseSectionProps {
  licenseActivity: string;
  onOpenActivityModal: () => void;
  licenseNumber: string;
  setLicenseNumber: (val: string) => void;
  licenseExpiry: string;
  showDatePicker: boolean;
  setShowDatePicker: (val: boolean) => void;
  onDateChange: (event: any, date?: Date) => void;
  licenseFile: PickedFile | null;
  existingLicenseUrl?: string | null;
  onPickLicense: () => void;
}

export default function CompanyLicenseSection({
  licenseActivity,
  onOpenActivityModal,
  licenseNumber,
  setLicenseNumber,
  licenseExpiry,
  showDatePicker,
  setShowDatePicker,
  onDateChange,
  licenseFile,
  existingLicenseUrl,
  onPickLicense,
}: CompanyLicenseSectionProps) {
  return (
    <View>
      <Text
        className="mb-3 mt-7 font-cairo-semibold text-[17px] text-black"
        style={{ writingDirection: 'rtl' }}
      >
        الرخصة
      </Text>

      <View className="gap-4">
        {/* Field: النشاط */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            النشاط
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenActivityModal}
            className="h-[46px] flex-row items-center justify-between rounded-[8px] border border-[#ECECEC] bg-white px-3"
          >
            <Text
              numberOfLines={1}
              className={`flex-1 font-cairo-regular text-[14px] ${licenseActivity ? 'text-[#111111]' : 'text-[#979797]'}`}
              style={{ writingDirection: 'rtl' }}
            >
              {licenseActivity || 'اختر النشاط'}
            </Text>
            <Feather name="chevron-down" size={16} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Field: رقم الرخصة */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            رقم الرخصة
          </Text>
          <View className="h-[46px] rounded-[8px] border border-[#ECECEC] bg-white px-3 justify-center">
            <TextInput
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="أدخل رقم الرخصة"
              placeholderTextColor="#979797"
              keyboardType="numeric"
              className="font-cairo-regular text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            />
          </View>
        </View>

        {/* Field: تاريخ انتهاء */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            تاريخ انتهاء
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
            className="h-[46px] flex-row items-center justify-between rounded-[8px] border border-[#ECECEC] bg-white px-3"
          >
            <Text
              className={`flex-1 font-cairo-regular text-[14px] ${licenseExpiry ? 'text-[#111111]' : 'text-[#979797]'}`}
              style={{ writingDirection: 'rtl' }}
            >
              {licenseExpiry || 'اختر تاريخ الانتهاء'}
            </Text>
            <CalendarClockIcon size={18} color="#111111" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Field: الصورة (License Document Upload Dropzone) */}
        <View>
          <Text
            className="mb-1.5 font-cairo-medium text-[14px] text-black"
            style={{ writingDirection: 'rtl' }}
          >
            الصورة
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPickLicense}
            className="items-center justify-center rounded-[4px] border border-dashed border-[#D7D7D7] bg-white px-6 py-4"
          >
            {licenseFile ? (
              <View className="items-center">
                <Feather name="check-circle" size={28} color="#22C55E" />
                <Text className="mt-2 font-cairo-bold text-[14px] text-[#111111] text-center">
                  {licenseFile.name}
                </Text>
                <Text className="mt-1 font-cairo-medium text-[12px] text-[#15304D]">
                  اضغط لتغيير الملف
                </Text>
              </View>
            ) : existingLicenseUrl ? (
              <View className="items-center">
                <Feather name="file-text" size={28} color="#15304D" />
                <Text className="mt-2 font-cairo-bold text-[14px] text-[#111111] text-center">
                  تم إرفاق رخصة مسبقاً
                </Text>
                <Text className="mt-1 font-cairo-medium text-[12px] text-[#15304D]">
                  اضغط لتغيير الصورة
                </Text>
              </View>
            ) : (
              <View className="items-center">
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-[#F5F7F9]">
                  <FileUploadDropzoneIcon size={24} color="#15304D" />
                </View>
                <Text className="font-cairo-medium text-[14px] text-[#111111] text-center">
                  <Text className="font-cairo-bold text-[#15304D]">
                    اضغط هنا
                  </Text>{' '}
                  لرفع صورة
                </Text>
                <Text className="mt-1 font-cairo-medium text-[12px] text-[#6B6A6A] text-center">
                  الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text
            className="mt-2 font-cairo-medium text-[12px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            صورة الرخصة تؤهلك لتوثيق حسابك
          </Text>
        </View>
      </View>
    </View>
  );
}
