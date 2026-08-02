import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CompanySignupFormValues } from '@/features/auth/companyAuthSchemas';
import { CompanySignupForm } from '@/features/auth/components/company/CompanySignupForm';
import apiClient from '@/shared/api/api';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function AddIdentityOfficeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [logoFile, setLogoFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [licenseFile, setLicenseFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const pickLogo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/svg+xml'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLogoFile(result.assets[0]);
    }
  };

  const pickLicense = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLicenseFile(result.assets[0]);
    }
  };

  const onSubmit = async (data: CompanySignupFormValues): Promise<boolean> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('licenseNumber', data.licenseNumber);
      formData.append('services', data.services || '');
      formData.append('hqLocation', data.hqLocation || '');
      formData.append('about', data.about || '');
      formData.append('licenseActivity', data.licenseActivity || '');
      formData.append('licenseExpiry', data.licenseExpiry || '');

      if (logoFile) {
        formData.append('logo', {
          uri: logoFile.uri,
          name: logoFile.name || 'logo.jpg',
          type: logoFile.mimeType || 'image/jpeg',
        } as any);
      }

      if (licenseFile) {
        formData.append('license', {
          uri: licenseFile.uri,
          name: licenseFile.name || 'license.jpg',
          type: licenseFile.mimeType || 'image/jpeg',
        } as any);
      }

      await apiClient.post('/identities/office', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await refreshProfile();
      return true;
    } catch (error: any) {
      let errorMsg = 'حدث خطأ أثناء إضافة الهوية';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        errorMsg = Array.isArray(message) ? message.join('\n') : message;
      }
      Alert.alert('خطأ', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
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
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Feather name="arrow-right" size={20} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-bold text-lg text-charcoal">
            إضافة هوية مكتب
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
            type="office"
            onSubmit={onSubmit}
            logoFile={logoFile}
            pickLogo={pickLogo}
            licenseFile={licenseFile}
            pickLicense={pickLicense}
            isLoading={isLoading}
            includeAccountFields={false}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
