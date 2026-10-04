import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { InvoiceableClient } from '@/shared/api/serviceInvoices.service';

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
  // The accepted request the invoice is for (its client gets the invoice)
  requestId: string | null;
  onSelectClient: (client: InvoiceableClient | null) => void;
  // Opens the client-picker bottom sheet (ابحث عن عميل...)
  onOpenClientPicker: () => void;
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
  requestId,
  onSelectClient,
  onOpenClientPicker,
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
          {/* Client search pill (Figma 4410:167377): opens the accepted
              requests picker sheet; shows the picked client once selected */}
          <TouchableOpacity
            testID="invoice-client-picker-trigger"
            activeOpacity={0.7}
            onPress={onOpenClientPicker}
            className="h-[42px] w-full flex-row items-center gap-1.5 rounded-full border border-[#ECECEC] bg-[#F9FAFE] px-3"
          >
            <Ionicons name="search" size={20} color="#989898" />
            <Text
              numberOfLines={1}
              className={`flex-1 text-right font-cairo text-[13px] ${requestId ? 'text-[#111111]' : 'text-[#989898]'}`}
              style={{ writingDirection: 'rtl' }}
            >
              {requestId ? clientName : 'ابحث عن عميل...'}
            </Text>
          </TouchableOpacity>
          {!requestId && (
            <>
              <TextInput
                testID="invoice-client-name"
                value={clientName}
                onChangeText={onChangeClientName}
                placeholder="أو اكتب اسم عميل من خارج التطبيق"
                placeholderTextColor="#979797"
                className={inputClassName}
                style={{ writingDirection: 'rtl' }}
              />
              {!!clientName.trim() && (
                <Text
                  className="font-cairo text-[11px] text-[#B97500]"
                  style={{ writingDirection: 'rtl' }}
                >
                  لن تصل الفاتورة لحساب العميل في التطبيق
                </Text>
              )}
            </>
          )}
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
