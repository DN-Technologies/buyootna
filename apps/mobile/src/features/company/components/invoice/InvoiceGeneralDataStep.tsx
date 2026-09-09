import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

import FieldLabel from './FieldLabel';

const inputClassName =
  'h-[46px] w-full rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

const formatKwDate = (date: Date) =>
  date.toLocaleDateString('ar-KW', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

interface InvoiceGeneralDataStepProps {
  clientName: string;
  onChangeClientName: (value: string) => void;
  invoiceNo: string;
  title: string;
  onChangeTitle: (value: string) => void;
  warrantyMonths: string;
  onChangeWarrantyMonths: (value: string) => void;
  issueDate: Date;
  onChangeIssueDate: (date: Date) => void;
}

export default function InvoiceGeneralDataStep({
  clientName,
  onChangeClientName,
  invoiceNo,
  title,
  onChangeTitle,
  warrantyMonths,
  onChangeWarrantyMonths,
  issueDate,
  onChangeIssueDate,
}: InvoiceGeneralDataStepProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <View className="gap-4">
      <Text
        className="font-cairo-semibold text-[16px] text-black"
        style={{ writingDirection: 'rtl' }}
      >
        بيانات عامة
      </Text>

      <View className="gap-5">
        <View className="gap-1.5">
          <FieldLabel text="العميل" />
          <TextInput
            value={clientName}
            onChangeText={onChangeClientName}
            placeholder="اسم العميل"
            placeholderTextColor="#979797"
            className={inputClassName}
            style={{ writingDirection: 'rtl' }}
          />
        </View>

        <View className="gap-1.5 opacity-60">
          <FieldLabel text="رقم الفاتورة" />
          <TextInput
            value={invoiceNo}
            editable={false}
            className={inputClassName}
            style={{ writingDirection: 'ltr', textAlign: 'left' }}
          />
        </View>

        <View className="gap-1.5">
          <FieldLabel text="عنوان الفاتورة" />
          <TextInput
            value={title}
            onChangeText={onChangeTitle}
            placeholder="اكتب عنوان للفاتورة حسب ما تم عمله"
            placeholderTextColor="#979797"
            className={inputClassName}
            style={{ writingDirection: 'rtl' }}
          />
        </View>

        <View className="gap-1.5">
          <FieldLabel text="كفالة الخدمة (ضمان)" required={false} />
          <TextInput
            value={warrantyMonths}
            onChangeText={onChangeWarrantyMonths}
            placeholder="اكتب فترة بالشهور"
            placeholderTextColor="#979797"
            keyboardType="number-pad"
            className={inputClassName}
            style={{ writingDirection: 'rtl' }}
          />
        </View>

        <View className="gap-1.5">
          <FieldLabel text="تاريخ الاصدار" />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(!showDatePicker)}
            className={`${inputClassName} flex-row items-center justify-between`}
          >
            <Ionicons name="calendar-outline" size={18} color="#989898" />
            <Text
              className="font-cairo text-[14px] text-[#979797]"
              style={{ writingDirection: 'rtl' }}
            >
              {formatKwDate(issueDate)}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={issueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              onChange={(_event, selectedDate) => {
                if (selectedDate) onChangeIssueDate(selectedDate);
                if (Platform.OS === 'android') setShowDatePicker(false);
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
