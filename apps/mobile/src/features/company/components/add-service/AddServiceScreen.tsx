import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SuccessBottomSheet from '@/shared/components/feedback/SuccessBottomSheet';

import CompanySubmitButton from '../CompanySubmitButton';
import CompanyEditProfileHeader from '../edit-profile/CompanyEditProfileHeader';
import AddServiceForm from './AddServiceForm';
import { useAddService } from './useAddService';

export default function AddServiceScreen() {
  const service = useAddService();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* --- Header --- */}
        <CompanyEditProfileHeader
          onBack={service.goBack}
          title="إضافة خدمة"
        />

        {/* --- Form --- */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <AddServiceForm
            serviceType={service.serviceType}
            onServiceTypeChange={service.setServiceType}
            serviceTypeOptions={service.filteredOptions}
            isDropdownOpen={service.isDropdownOpen}
            onToggleDropdown={() =>
              service.setIsDropdownOpen(!service.isDropdownOpen)
            }
            onSelectServiceType={service.selectOption}
            serviceTitle={service.serviceTitle}
            onServiceTitleChange={service.setServiceTitle}
            description={service.description}
            onDescriptionChange={service.setDescription}
          />
        </ScrollView>

        {/* --- Fixed bottom CTA --- */}
        <View className="px-4 pb-6 pt-3">
          <CompanySubmitButton
            label="إضافة الخدمة"
            disabled={!service.isValid || service.isSubmitting}
            onPress={service.submit}
          />
        </View>
      </KeyboardAvoidingView>

      {/* --- Success bottom sheet --- */}
      <SuccessBottomSheet
        ref={service.successSheetRef}
        title="تمت إضافة الخدمة بنجاح!"
        description="الخدمة الآن نشطة ومتاحة في ملفك العقاري. يمكن للمستخدمين تصفحها وبدء التواصل معك مباشرة عبر واتساب، الاتصال، أو المحادثات."
        buttonText="عرض الخدمة"
        onPress={service.viewService}
        secondaryButtonText="إضافة خدمة أخرى"
        onSecondaryPress={service.addAnother}
        secondaryButtonVariant="neutral"
      />
    </SafeAreaView>
  );
}
