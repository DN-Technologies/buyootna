import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Share } from 'react-native';

import type { InvoiceItem } from '@/features/company/components/invoice/InvoiceItemsStep';
import { companyService } from '@/shared/api/company.service';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { formatNumber } from '@/shared/utils/formatNumber';

type WizardStep = 1 | 2 | 3;

function generateProvisionalInvoiceNo() {
  const year = new Date().getFullYear();
  const serial = 1 + Math.floor(Math.random() * 999999);
  return `INV-${year}-${String(serial).padStart(6, '0')}`;
}

/**
 * اصدار فاتورة's three-step wizard: بيانات عامة → بنود الفاتورة →
 * مراجعة الفاتورة. The invoice is either tied to an accepted request
 * (its client receives it in-app) or issued to a typed name.
 */
export function useCreateInvoice() {
  const router = useRouter();
  const { displayName, avatarUrl } = useIdentity();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const queryClient = useQueryClient();

  const [step, setStep] = useState<WizardStep>(1);
  const [clientName, setClientName] = useState('');
  // Set when the client was picked from an accepted request
  const [requestId, setRequestId] = useState<string | null>(null);
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
  const clientPickerSheetRef = useRef<BottomSheetModal>(null);

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

  const selectClient = (client: { requestId?: string; clientName?: string } | null) => {
    setRequestId(client?.requestId ?? null);
    setClientName(client?.clientName ?? '');
  };

  const addItem = (item: InvoiceItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const applyDiscount = (value: number) => {
    setDiscount(value);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await companyService.createInvoice({
        ...(requestId
          ? { requestId }
          : { clientName: clientName.trim() }),
        title: title.trim(),
        warrantyMonths: warrantyMonths.trim() || undefined,
        issueDate: issueDate.toISOString(),
        items,
        discount: appliedDiscount || undefined,
      });
      refreshProfile();
      void queryClient.invalidateQueries({
        queryKey: ['service-invoices', 'company'],
      });
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
          `- ${item.name} × ${item.qty}: ${formatNumber(item.price * item.qty)} د.ك`,
      ),
      appliedDiscount > 0
        ? `الخصم: ${formatNumber(appliedDiscount)} د.ك`
        : null,
      `الاجمالي: ${formatNumber(total)} د.ك`,
    ].filter(Boolean);

    Share.share({ message: summaryLines.join('\n') });
  };

  const handleReset = () => {
    successSheetRef.current?.dismiss();
    setStep(1);
    setClientName('');
    setRequestId(null);
    setTitle('');
    setWarrantyMonths('');
    setIssueDate(new Date());
    setItems([]);
    setDiscount(0);
  };

  const primaryAction = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else handleSubmit();
  };

  return {
    // Wizard navigation
    step,
    headerTitle: step === 3 ? 'مراجعة الفاتورة' : 'اصدار فاتورة',
    ctaLabel:
      step === 1
        ? 'متابعة للبنود'
        : step === 2
          ? 'مراجعة وارسال'
          : 'ارسال الفاتورة',
    isCtaDisabled,
    goBack: () => router.back(),
    goToPreviousStep: () => setStep((step - 1) as WizardStep),
    primaryAction,
    // Step 1 fields
    clientName,
    setClientName,
    requestId,
    selectClient,
    openClientPicker: () => clientPickerSheetRef.current?.present(),
    invoiceNo,
    title,
    setTitle,
    warrantyMonths,
    setWarrantyMonths,
    issueDate,
    setIssueDate,
    // Step 2 items & totals
    items,
    addItem,
    removeItem,
    openAddItemSheet: () => itemSheetRef.current?.present(),
    openDiscountSheet: () => discountSheetRef.current?.present(),
    applyDiscount,
    subtotal,
    appliedDiscount,
    total,
    // Step 3 receipt data
    companyName: displayName,
    logoUrl: avatarUrl,
    // Sheets
    successSheetRef,
    itemSheetRef,
    discountSheetRef,
    clientPickerSheetRef,
    viewInvoices: () => {
      successSheetRef.current?.dismiss();
      router.push('/(company)/company-service-invoices');
    },
    resetAndDismiss: handleReset,
    // Success copy
    successDescription: `تم ارسال فاتورة "${title}" الى "${clientName}"`,
  };
}
