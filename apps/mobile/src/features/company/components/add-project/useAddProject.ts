import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { companyService } from '@/shared/api/company.service';
import { propertiesService } from '@/shared/api/properties.service';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

export const DESCRIPTION_MAX_LENGTH = 100;
export const MAX_IMAGES = 3;

/**
 * اضافة مشروع لمعرض الأعمال's state and submission: images are picked from
 * the gallery (up to MAX_IMAGES), uploaded via the properties media
 * endpoint, and the project is created on the company persona.
 */
export function useAddProject() {
  const router = useRouter();
  const { activeIdentity } = useIdentity();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successSheetRef = useRef<BottomSheetModal>(null);

  const isValid =
    projectTitle.trim().length > 0 &&
    description.trim().length > 0 &&
    description.length <= DESCRIPTION_MAX_LENGTH &&
    images.length > 0;

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('إذن مطلوب', 'نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك!', [
          { text: 'حسناً' },
        ]);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: MAX_IMAGES - images.length,
      });

      if (!result.canceled && result.assets) {
        setImages((prev) =>
          [...prev, ...result.assets.map((asset) => asset.uri)].slice(
            0,
            MAX_IMAGES,
          ),
        );
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((image) => image !== uri));
  };

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const urls = await propertiesService.uploadImages(images);
      await companyService.createProject({
        title: projectTitle.trim(),
        description: description.trim(),
        images: urls,
      });
      refreshProfile();
      setIsSubmitting(false);
      successSheetRef.current?.present();
    } catch (error) {
      setIsSubmitting(false);
      showAlert(
        'فشل نشر المشروع',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    }
  };

  const viewProject = () => {
    successSheetRef.current?.dismiss();
    if (activeIdentity?.id) {
      router.push(`/company/${activeIdentity.id}` as never);
    } else {
      router.back();
    }
  };

  const addAnother = () => {
    successSheetRef.current?.dismiss();
    setProjectTitle('');
    setDescription('');
    setImages([]);
  };

  return {
    // Navigation
    goBack: () => router.back(),
    // Fields
    projectTitle,
    setProjectTitle,
    description,
    setDescription,
    // Images
    images,
    pickImages,
    removeImage,
    // Submit
    isValid,
    isSubmitting,
    submit,
    // Success sheet actions
    successSheetRef,
    viewProject,
    addAnother,
  };
}
