import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowBackIcon } from '@/assets/icons/home/property';
import { CompanySignupFormValues } from '@/features/auth/companyAuthSchemas';
import { CompanySignupForm } from '@/features/auth/components/company/CompanySignupForm';
import apiClient from '@/shared/api/api';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { type PickedImage, pickSquareImage } from '@/shared/utils/pickImage';

export default function AddIdentityCompanyScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const switchIdentity = useAuthStore((state) => state.switchIdentity);
  // The company just created, opened by the success sheet's button
  const createdIdentityId = useRef<string | null>(null);

  const [logoFile, setLogoFile] = useState<PickedImage | null>(null);

  // The camera or the photo library, square-cropped: it opened the Files
  // app, where people don't keep their photos (QA)
  const pickLogo = async () => {
    const picked = await pickSquareImage();
    if (picked) setLogoFile(picked);
  };

  const onSubmit = async (data: CompanySignupFormValues): Promise<boolean> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      // «التخصص»; the licence comes later with «طلب التوثيق»
      formData.append('specialty', data.specialty || '');
      formData.append('services', data.services || '');
      formData.append('hqLocation', data.hqLocation || '');
      formData.append('serviceAreas', data.serviceAreas || '');
      formData.append('about', data.about || '');

      if (logoFile) {
        formData.append('logo', {
          uri: logoFile.uri,
          name: logoFile.name || 'logo.jpg',
          type: logoFile.mimeType || 'image/jpeg',
        } as any);
      }

      const response = await apiClient.post('/identities/company', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      createdIdentityId.current = response.data?.id ?? null;
      await refreshProfile();
      return true;
    } catch (error: any) {
      let errorMsg = 'حدث خطأ أثناء إضافة الهوية';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        errorMsg = Array.isArray(message) ? message.join('\n') : message;
      }
      showAlert('خطأ', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // «العودة الى الرئيسية»: switch to the new company and open its home,
  // not the individual one the account was on
  const openCompanyHome = async () => {
    const identityId = createdIdentityId.current;
    if (!identityId) {
      resetToIdentityHome(null);
      return;
    }
    try {
      await switchIdentity(identityId);
      resetToIdentityHome('COMPANY');
    } catch (error) {
      showAlert(
        'خطأ',
        getApiErrorMessage(error, 'تعذر فتح حساب الشركة، بدّل إليه من المزيد'),
      );
      resetToIdentityHome(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pb-4 pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <ArrowBackIcon size={16} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-semibold text-lg text-charcoal">
            إضافة هوية شركة
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <CompanySignupForm
            type="company"
            onSubmit={onSubmit}
            onSuccessDone={openCompanyHome}
            logoFile={logoFile}
            pickLogo={pickLogo}
            isLoading={isLoading}
            includeAccountFields={false}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
