import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { companyService } from '@/shared/api/company.service';
import { propertiesService } from '@/shared/api/properties.service';
import SuccessBottomSheet from '@/shared/components/feedback/SuccessBottomSheet';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

const DESCRIPTION_MAX_LENGTH = 100;
const MAX_IMAGES = 3;

function FieldLabel({ text }: { text: string }) {
  return (
    <View className="flex-row items-center justify-end">
      <Text
        className="font-cairo-medium text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {text}
      </Text>
      <Text className="font-cairo-medium text-[14px] text-[#D12121]"> *</Text>
    </View>
  );
}

export default function AddProjectScreen() {
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

  const handlePickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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

  const handleRemoveImage = (uri: string) => {
    setImages((prev) => prev.filter((image) => image !== uri));
  };

  const handleSubmit = async () => {
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

  const handleViewProject = () => {
    successSheetRef.current?.dismiss();
    if (activeIdentity?.id) {
      router.push(`/company/${activeIdentity.id}` as never);
    } else {
      router.back();
    }
  };

  const handleAddAnother = () => {
    successSheetRef.current?.dismiss();
    setProjectTitle('');
    setDescription('');
    setImages([]);
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
            onPress={() => router.back()}
            className="h-8 w-8 items-center justify-center"
          >
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </TouchableOpacity>
          <Text
            className="flex-1 text-center font-cairo-semibold text-[18px] leading-[23px] text-[#111111]"
            numberOfLines={1}
          >
            اضافة مشروع لمعرض الأعمال
          </Text>
          <View className="h-8 w-8" />
        </View>

        {/* --- Form --- */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <View className="gap-5 px-4 pb-6 pt-3">
            {/* 1. Project title */}
            <View className="gap-1.5">
              <FieldLabel text="عنوان المشروع" />
              <TextInput
                value={projectTitle}
                onChangeText={setProjectTitle}
                placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
                placeholderTextColor="#979797"
                className="h-[46px] w-full rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              />
            </View>

            {/* 2. Description */}
            <View className="gap-1.5">
              <FieldLabel text="الوصف" />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
                placeholderTextColor="#979797"
                multiline
                textAlignVertical="top"
                maxLength={DESCRIPTION_MAX_LENGTH}
                className="h-[119px] w-full rounded-md border border-[#ECECEC] bg-white px-3 pt-4 text-right font-cairo text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              />
              <Text
                className="mt-0.5 text-right font-cairo-medium text-[12px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                يجب أن لا يتخطى الوصف 100 حرف.
              </Text>
            </View>

            {/* 3. Images */}
            <View className="gap-1.5">
              <FieldLabel text="الصور" />

              {/* Selected image thumbnails */}
              {images.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {images.map((uri) => (
                    <View
                      key={uri}
                      className="h-20 w-20 overflow-hidden rounded-md border border-[#ECECEC]"
                    >
                      <Image
                        source={{ uri }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => handleRemoveImage(uri)}
                        className="absolute left-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-black/60"
                      >
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {images.length < MAX_IMAGES && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handlePickImages}
                  className="items-center justify-center rounded border border-dashed border-[#D7D7D7] bg-white px-6 py-4"
                  style={{ borderStyle: 'dashed' }}
                >
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F5F7F9]">
                    <Ionicons
                      name="file-tray-full-outline"
                      size={24}
                      color="#15304D"
                    />
                  </View>
                  <View className="mt-2 flex-row items-center justify-center">
                    <Text className="font-cairo-bold text-[14px] text-[#15304D]">
                      اضغط هنا
                    </Text>
                    <Text
                      className="font-cairo-medium text-[14px] text-[#111111]"
                      style={{ writingDirection: 'rtl' }}
                    >
                      {' '}
                      لرفع صورة
                    </Text>
                  </View>
                  <Text
                    className="mt-2 text-center font-cairo-medium text-[12px] leading-[17px] text-[#6B6A6A]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
                  </Text>
                </TouchableOpacity>
              )}

              <Text
                className="mt-0.5 text-right font-cairo-medium text-[10px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                يمكن إضافة حتى 3 صور.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* --- Fixed bottom CTA --- */}
        <View className="px-4 pb-6 pt-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`h-12 w-full items-center justify-center rounded-full ${
              !isValid || isSubmitting ? 'bg-[#A6A6A6]' : 'bg-[#15304D]'
            }`}
          >
            <Text className="font-cairo-semibold text-[14px] text-white">
              نشر المشروع
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* --- Success bottom sheet --- */}
      <SuccessBottomSheet
        ref={successSheetRef}
        title="تم نشر المشروع بنجاح!"
        description="أصبح الآن المشروع ظاهرًا في معرض الأعمال."
        buttonText="عرض المشروع"
        onPress={handleViewProject}
        secondaryButtonText="إضافة مشروع آخر"
        onSecondaryPress={handleAddAnother}
        secondaryButtonVariant="neutral"
      />
    </SafeAreaView>
  );
}
