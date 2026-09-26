import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddItemSheet from '@/features/company/components/invoice/AddItemSheet';
import DiscountSheet from '@/features/company/components/invoice/DiscountSheet';
import InvoiceGeneralDataStep from '@/features/company/components/invoice/InvoiceGeneralDataStep';
import InvoiceItemsStep, {
  type InvoiceItem,
} from '@/features/company/components/invoice/InvoiceItemsStep';
import InvoiceProgressBar from '@/features/company/components/invoice/InvoiceProgressBar';
import InvoiceReceipt from '@/features/company/components/invoice/InvoiceReceipt';
import { companyService } from '@/shared/api/company.service';
import SuccessBottomSheet from '@/shared/components/feedback/SuccessBottomSheet';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

type WizardStep = 1 | 2 | 3;

function generateProvisionalInvoiceNo() {
  const year = new Date().getFullYear();
  const serial = 1 + Math.floor(Math.random() * 999999);
  return `INV-${year}-${String(serial).padStart(6, '0')}`;
}

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { displayName, avatarUrl } = useIdentity();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [step, setStep] = useState<WizardStep>(1);
  const [clientName, setClientName] = useState('');
  const [invoiceNo] = useState(generateProvisionalInvoiceNo);
  const [title, setTitle] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('');
  const [issueDate, setIssueDate] = useState(new Date());
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successSheetRef = useRef<BottomSheetModal>(null);
  const itemSheetRef = useRef<BottomSheetModal>(null);
  const discountSheetRef = useRef<BottomSheetModal>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const appliedDiscount = Math.min(discount, subtotal);
  const total = subtotal - appliedDiscount;

  const isStep1Valid =
    clientName.trim().length > 0 &&
    title.trim().length > 0 &&
    issueDate instanceof Date;
  const isCtaDisabled =
    (step === 1 && !isStep1Valid) ||
    (step === 2 && items.length === 0) ||
    isSubmitting;

  const handleAddItem = (item: InvoiceItem) => {
    setItems((prev) => [...prev, item]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyDiscount = (value: number) => {
    setDiscount(value);
  };

  const handlePrimaryAction = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await companyService.createInvoice({
        clientName: clientName.trim(),
        title: title.trim(),
        warrantyMonths: warrantyMonths.trim() || undefined,
        issueDate: issueDate.toISOString(),
        items,
        discount: appliedDiscount || undefined,
      });
      refreshProfile();
      setIsSubmitting(false);

      shareInvoice(response?.invoice?.invoiceNo ?? invoiceNo);
      successSheetRef.current?.present();
    } catch (error) {
      setIsSubmitting(false);
      showAlert(
        'فشل انشاء الفاتورة',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    }
  };

  const shareInvoice = (finalInvoiceNo: string) => {
    const summaryLines = [
      `فاتورة ${finalInvoiceNo}`,
      `من: ${displayName ?? 'شركة'}`,
      `الى: ${clientName.trim()}`,
      `العنوان: ${title.trim()}`,
      ...items.map(
        (item) =>
          `- ${item.name} × ${item.qty}: ${(item.price * item.qty).toLocaleString('en-US')} د.ك`,
      ),
      appliedDiscount > 0
        ? `الخصم: ${appliedDiscount.toLocaleString('en-US')} د.ك`
        : null,
      `الاجمالي: ${total.toLocaleString('en-US')} د.ك`,
    ].filter(Boolean);

    Share.share({ message: summaryLines.join('\n') });
  };

  const handleReset = () => {
    successSheetRef.current?.dismiss();
    setStep(1);
    setClientName('');
    setTitle('');
    setWarrantyMonths('');
    setIssueDate(new Date());
    setItems([]);
    setDiscount(0);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* --- Header --- */}
        <View className="h-[52px] flex-row items-center px-4 py-[6px]">
          <TouchableOpacity
            onPress={() =>
              step === 1 ? router.back() : setStep((step - 1) as WizardStep)
            }
            className="h-8 w-8 items-center justify-center"
          >
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-cairo-semibold text-[18px] leading-[23px] text-[#111111]">
            {step === 3 ? 'مراجعة الفاتورة' : 'اصدار فاتورة'}
          </Text>
          <View className="h-8 w-8" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="gap-5 px-4 pb-6 pt-2">
            {step < 3 && <InvoiceProgressBar step={step} />}

            {step === 1 && (
              <InvoiceGeneralDataStep
                clientName={clientName}
                onChangeClientName={setClientName}
                invoiceNo={invoiceNo}
                title={title}
                onChangeTitle={setTitle}
                warrantyMonths={warrantyMonths}
                onChangeWarrantyMonths={setWarrantyMonths}
                issueDate={issueDate}
                onChangeIssueDate={setIssueDate}
              />
            )}

            {step === 2 && (
              <InvoiceItemsStep
                items={items}
                onRemoveItem={handleRemoveItem}
                onOpenAddItemSheet={() => itemSheetRef.current?.present()}
                onOpenDiscountSheet={() =>
                  discountSheetRef.current?.present()
                }
                subtotal={subtotal}
                appliedDiscount={appliedDiscount}
                total={total}
              />
            )}

            {step === 3 && (
              <InvoiceReceipt
                invoiceNo={invoiceNo}
                clientName={clientName}
                title={title}
                issueDate={issueDate}
                items={items}
                appliedDiscount={appliedDiscount}
                total={total}
                companyName={displayName}
                logoUrl={avatarUrl}
              />
            )}
          </View>
        </ScrollView>

        {/* --- Fixed bottom CTA --- */}
        <View className="px-4 pb-6 pt-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePrimaryAction}
            disabled={isCtaDisabled}
            className={`h-12 w-full items-center justify-center rounded-full ${
              isCtaDisabled ? 'bg-[#A6A6A6]' : 'bg-[#15304D]'
            }`}
          >
            <Text className="font-cairo-semibold text-[14px] text-white">
              {step === 1
                ? 'متابعة للبنود'
                : step === 2
                  ? 'مراجعة وارسال'
                  : 'ارسال الفاتورة'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* --- Add item bottom sheet --- */}
      <AddItemSheet ref={itemSheetRef} onAdd={handleAddItem} />

      {/* --- Discount bottom sheet --- */}
      <DiscountSheet ref={discountSheetRef} onApply={handleApplyDiscount} />

      {/* --- Success bottom sheet --- */}
      <SuccessBottomSheet
        ref={successSheetRef}
        title="تم انشاء وارسال الفاتورة بنجاح!"
        description={`تم ارسال فاتورة "${title}" الى "${clientName}"`}
        buttonText="عرض الفاتورة"
        onPress={() => successSheetRef.current?.dismiss()}
        secondaryButtonText="انشاء فاتورة جديدة"
        onSecondaryPress={handleReset}
        secondaryButtonVariant="neutral"
      />
    </SafeAreaView>
  );
}
