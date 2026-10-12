import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Text, TouchableOpacity, View } from 'react-native';

import SectionTitle from '@/shared/components/add-listing/SectionTitle';
import { SafeImage } from '@/shared/components/ui/SafeImage';
import { useListingStore } from '@/shared/store/useListingStore';
import { showAlert } from '@/shared/utils/alert';

const MAX_IMAGES = 10;

export default function ImageUploadZone() {
  const { images, addImages, removeImage } = useListingStore();
  const remainingSlots = Math.max(0, MAX_IMAGES - images.length);
  const hasReachedLimit = remainingSlots === 0;

  const handlePickImages = async () => {
    if (hasReachedLimit) {
      showAlert('الحد الأقصى للصور', 'الحد الأقصى للصور هو 10 صور.', [
        { text: 'حسناً' },
      ]);
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          'إذن مطلوب',
          'نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك!',
          [{ text: 'حسناً' }],
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets) {
        // Defensive clamp in case the native picker ever returns more than
        // the requested selectionLimit -- never let the store exceed MAX_IMAGES.
        const selectedUris = result.assets
          .map((asset) => asset.uri)
          .slice(0, remainingSlots);
        addImages(selectedUris);

        if (result.assets.length > remainingSlots) {
          showAlert('الحد الأقصى للصور', 'الحد الأقصى للصور هو 10 صور.', [
            { text: 'حسناً' },
          ]);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showAlert('خطأ', 'حدث خطأ أثناء اختيار الصور. حاول مرة أخرى.', [
        { text: 'حسناً' },
      ]);
    }
  };

  return (
    <View className="w-full" style={{ gap: 16 }}>
      <SectionTitle>الصور</SectionTitle>

      {/* --- Selected Images Previews --- */}
      {images.length > 0 && (
        <View className="flex-row flex-wrap gap-3">
          {images.map((uri, index) => (
            <View
              key={index}
              className="relative h-[90px] w-[90px] overflow-hidden rounded-xl border border-gray-200"
            >
              <SafeImage
                source={{ uri }}
                style={{ width: 90, height: 90 }}
                contentFit="cover"
              />

              {/* Remove Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => removeImage(index)}
                className="absolute right-1 top-1 z-10 h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-sm"
              >
                <Feather name="x" size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* --- Dashed Upload Card --- */}
      {hasReachedLimit ? (
        <View className="w-full items-center justify-center rounded border border-dashed border-[#D7D7D7] bg-gray-50 px-6 py-4">
          <Text className="text-center font-cairo-medium text-[13px] text-[#94A3B8]">
            الحد الأقصى للصور هو 10 صور
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          testID="image-dropzone"
          activeOpacity={0.75}
          onPress={handlePickImages}
          className="w-full items-center justify-center rounded border border-dashed border-[#D7D7D7] bg-white px-6 py-4"
          style={{ gap: 8 }}
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F5F7F9]">
            <Image
              source={require('@/assets/icons/add-listing/file-arrow-up.svg')}
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />
          </View>
          <Text className="text-center font-cairo-medium text-sm text-[#111111]">
            <Text className="font-cairo-bold text-[#15304D]">اضغط هنا</Text> لرفع
            صورة
          </Text>
          <Text className="text-center font-cairo-medium text-xs text-[#6B6A6A]">
            الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
