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
        selectionLimit: 10 - images.length,
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
        className="mb-3 font-cairo-semibold text-lg text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        الصور
      </Text>

      {/* --- Selected Images Previews --- */}
      {images.length > 0 && (
        <View className="mb-4 flex-row flex-wrap justify-end gap-3">
          {images.map((uri, index) => (
            <View
              key={index}
              className="relative h-[90px] w-[90px] overflow-hidden rounded-xl border border-gray-200"
            >
              <Image
                source={{ uri }}
                className="h-full w-full"
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
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handlePickImages}
        className="w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white py-8 px-4"
      >
        <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-[#F4F8FB]">
          <Feather name="file-plus" size={26} color="#15304D" />
        </View>
        <Text className="mb-1 text-center font-cairo-medium text-[15px] text-[#111111]">
          اضغط <Text className="font-cairo-bold text-[#15304D]">هنا</Text> لرفع صورة
        </Text>
        <Text className="px-4 text-center font-cairo-medium text-[11px] leading-5 text-[#94A3B8]">
          الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
        </Text>
      </TouchableOpacity>
    </View>
  );
}
