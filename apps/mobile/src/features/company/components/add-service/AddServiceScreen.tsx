import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CompanyFormHeader from '../CompanyFormHeader';
import CompanySubmitButton from '../CompanySubmitButton';
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
        <CompanyFormHeader onBack={service.goBack} title="إضافة خدمة" />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <AddServiceForm service={service} />
        </ScrollView>

        {/* --- Fixed bottom CTA --- */}
        <View className="px-4 pb-8 pt-3">
          <CompanySubmitButton
            label="إضافة الخدمة"
            disabled={!service.isValid || service.isSubmitting}
            onPress={service.submit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
