import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Text, TouchableOpacity, View } from 'react-native';

import { useListingStore } from '@/shared/store/useListingStore';
import { showAlert } from '@/shared/utils/alert';

export default function ImageUploadZone() {
  const { images, addImages, removeImage } = useListingStore();

  const handlePickImages = async () => {
    try {
      // Request permission first
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
        selectionLimit: 10 - images.length, // Limit total to 10
      });

      if (!result.canceled && result.assets) {
        const selectedUris = result.assets.map((asset) => asset.uri);
        addImages(selectedUris);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showAlert('خطأ', 'حدث خطأ أثناء اختيار الصور. حاول مرة أخرى.', [
        { text: 'حسناً' },
      ]);
    }
  };

  return (
    <View className="mb-2 w-full">
      <Text
        className="mb-2 font-cairo-semibold text-lg text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        الصور
      </Text>

      {/* --- Image Grid (if images are selected) --- */}
      {images.length > 0 && (
        <View className="mb-4 flex-row flex-wrap justify-end gap-3">
          {images.map((uri, index) => (
            <View
              key={index}
              className="relative h-[100px] w-[100px] overflow-hidden rounded-lg border border-gray-200"
            >
              <Image
                source={{ uri }}
                className="h-full w-full"
                contentFit="cover"
              />

              {/* Delete Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => removeImage(index)}
                className="absolute right-1 top-1 z-10 h-6 w-6 items-center justify-center rounded-full bg-red-500"
              >
                <Feather name="x" size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* --- Dashed Upload Zone --- */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePickImages}
        className="w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-8"
      >
        <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-[#F4F8FB]">
          <Feather name="image" size={24} color="#15304D" />
        </View>
        <Text className="mb-1 font-cairo-semibold text-[15px] text-[#111111]">
          اضغط هنا <Text className="font-cairo-medium">لرفع صورة</Text>
        </Text>
        <Text className="px-8 text-center font-cairo-medium text-[11px] leading-5 text-[#94A3B8]">
          الصيغ المدعومة: JPG, PNG, WEBP (بحد أقصى 10 ميجا لكل ملف)
        </Text>
      </TouchableOpacity>
    </View>
  );
}
