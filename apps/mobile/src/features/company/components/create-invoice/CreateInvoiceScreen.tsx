import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddItemSheet from '@/features/company/components/invoice/AddItemSheet';
import ClientPickerSheet from '@/features/company/components/invoice/ClientPickerSheet';
import DiscountSheet from '@/features/company/components/invoice/DiscountSheet';
import InvoiceClientSearch from '@/features/company/components/invoice/InvoiceClientSearch';
import InvoiceGeneralDataStep from '@/features/company/components/invoice/InvoiceGeneralDataStep';
import InvoiceItemsStep from '@/features/company/components/invoice/InvoiceItemsStep';
import InvoiceProgressBar from '@/features/company/components/invoice/InvoiceProgressBar';
import InvoiceReceipt from '@/features/company/components/invoice/InvoiceReceipt';

import CompanyFormHeader from '../CompanyFormHeader';
import CompanySubmitButton from '../CompanySubmitButton';
import CompanySuccessSheet from '../CompanySuccessSheet';
import { useCreateInvoice } from './useCreateInvoice';

export default function CreateInvoiceScreen() {
  const wizard = useCreateInvoice();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* --- Header --- */}
        <CompanyFormHeader
          onBack={wizard.step === 1 ? wizard.goBack : wizard.goToPreviousStep}
          title={wizard.headerTitle}
        />

        {/* --- Client search, step 1 only --- */}
        {wizard.step === 1 && (
          <InvoiceClientSearch onPress={wizard.openClientPicker} />
        )}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <View className="gap-5 px-4 pb-6 pt-3">
            {wizard.step < 3 && (
              <InvoiceProgressBar step={wizard.step} />
            )}

            {wizard.step === 1 && (
              <InvoiceGeneralDataStep
                clientName={wizard.clientName}
                onChangeClientName={wizard.setClientName}
                requestId={wizard.requestId}
                onSelectClient={wizard.selectClient}
                invoiceNo={wizard.invoiceNo}
                title={wizard.title}
                onChangeTitle={wizard.setTitle}
                warrantyMonths={wizard.warrantyMonths}
                onChangeWarrantyMonths={wizard.setWarrantyMonths}
                issueDate={wizard.issueDate}
                onChangeIssueDate={wizard.setIssueDate}
              />
            )}

            {wizard.step === 2 && (
              <InvoiceItemsStep
                items={wizard.items}
                onRemoveItem={wizard.removeItem}
                onOpenAddItemSheet={wizard.openAddItemSheet}
                onOpenDiscountSheet={wizard.openDiscountSheet}
                subtotal={wizard.subtotal}
                appliedDiscount={wizard.appliedDiscount}
                total={wizard.total}
              />
            )}

            {wizard.step === 3 && (
              <InvoiceReceipt
                invoiceNo={wizard.invoiceNo}
                clientName={wizard.clientName}
                title={wizard.title}
                issueDate={wizard.issueDate}
                items={wizard.items}
                appliedDiscount={wizard.appliedDiscount}
                total={wizard.total}
                companyName={wizard.companyName}
                logoUrl={wizard.logoUrl}
                companySpecialty={wizard.companySpecialty}
                warrantyMonths={wizard.warrantyMonths}
              />
            )}
          </View>
        </ScrollView>

        {/* --- Fixed bottom CTA --- */}
        <View className="px-4 pb-8 pt-3">
          <CompanySubmitButton
            label={wizard.ctaLabel}
            disabled={wizard.isCtaDisabled}
            onPress={wizard.primaryAction}
          />
        </View>
      </KeyboardAvoidingView>

      {/* --- Client picker bottom sheet --- */}
      <ClientPickerSheet
        ref={wizard.clientPickerSheetRef}
        selectedRequestId={wizard.requestId}
        onSelect={wizard.selectClient}
      />

      {/* --- Add item bottom sheet --- */}
      <AddItemSheet ref={wizard.itemSheetRef} onAdd={wizard.addItem} />

      {/* --- Discount bottom sheet --- */}
      <DiscountSheet ref={wizard.discountSheetRef} onApply={wizard.applyDiscount} />

      {/* --- Success bottom sheet --- */}
      <CompanySuccessSheet
        ref={wizard.successSheetRef}
        title="تم انشاء وارسال الفاتورة بنجاح!"
        description={wizard.successDescription}
        primaryLabel="عرض الفواتير"
        onPrimary={wizard.viewInvoices}
        secondaryLabel="انشاء فاتورة جديدة"
        onSecondary={wizard.resetAndDismiss}
      />
    </SafeAreaView>
  );
}
