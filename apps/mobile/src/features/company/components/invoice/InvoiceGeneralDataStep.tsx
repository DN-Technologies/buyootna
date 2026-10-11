import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CalendarIcon } from '@/assets/icons/company-add';
import type { InvoiceableClient } from '@/shared/api/serviceInvoices.service';

import FieldLabel from './FieldLabel';

const inputClassName =
  'h-[46px] w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

const formatKwDate = (date: Date) =>
  date.toLocaleDateString('ar-KW-u-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

interface InvoiceGeneralDataStepProps {
  clientName: string;
  onChangeClientName: (value: string) => void;
  // The accepted request the invoice is for (its client gets the invoice)
  requestId: string | null;
  onSelectClient: (client: InvoiceableClient | null) => void;
  invoiceNo: string;
  title: string;
  onChangeTitle: (value: string) => void;
  warrantyMonths: string;
  onChangeWarrantyMonths: (value: string) => void;
  issueDate: Date;
  onChangeIssueDate: (date: Date) => void;
}

/**
 * Step 1, "بيانات عامة" (Figma 4410:167377). The client is picked from the
 * search pill above the progress bar, or typed here for someone outside
 * the app; typing over a picked client unlinks it from its request.
 */
export default function InvoiceGeneralDataStep({
  clientName,
  onChangeClientName,
  requestId,
  onSelectClient,
  invoiceNo,
  title,
  onChangeTitle,
  warrantyMonths,
  onChangeWarrantyMonths,
  issueDate,
  onChangeIssueDate,
}: InvoiceGeneralDataStepProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleClientNameChange = (value: string) => {
    if (requestId) onSelectClient(null);
    onChangeClientName(value);
  };

  return (
    <View className="gap-[14px]">
      <Text
        className="font-cairo-semibold text-[16px] leading-[20px] text-black"
        style={{ writingDirection: 'rtl' }}
      >
        بيانات عامة
      </Text>

      <View className="gap-5">
        <View className="gap-1.5">
          <FieldLabel text="العميل" />
          <TextInput
            testID="invoice-client-name"
            value={clientName}
            onChangeText={handleClientNameChange}
            placeholder="اسم العميل"
            placeholderTextColor="#979797"
            className={inputClassName}
            style={{ writingDirection: 'rtl' }}
          />
          {!requestId && !!clientName.trim() && (
            <Text
              className="font-cairo text-[11px] text-[#B97500]"
              style={{ writingDirection: 'rtl' }}
            >
              لن تصل الفاتورة لحساب العميل في التطبيق
            </Text>
          )}
        </View>

        <View className="gap-1.5">
          <FieldLabel text="رقم الفاتورة" />
          <TextInput
            value={invoiceNo}
            editable={false}
            className={`${inputClassName} text-[#979797]`}
            style={{ writingDirection: 'ltr' }}
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
          {/* The date on the right, the calendar on the left */}
          <TouchableOpacity
            testID="invoice-issue-date"
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(!showDatePicker)}
            className="h-[46px] w-full flex-row items-center justify-between rounded-[8px] border border-[#ECECEC] bg-white px-3"
          >
            <Text
              className="flex-1 font-cairo text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {formatKwDate(issueDate)}
            </Text>
            <CalendarIcon />
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
