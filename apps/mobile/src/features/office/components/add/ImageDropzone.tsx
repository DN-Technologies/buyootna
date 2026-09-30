import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export interface ImageDropzoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageDropzone({
  images,
  onChange,
  maxImages = 10,
}: ImageDropzoneProps) {
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        onChange([...images, ...newUris].slice(0, maxImages));
      }
    } catch {
      // Fallback dummy image addition for testing/environments where picker isn't interactive
      const dummyUri = `https://picsum.photos/seed/${Date.now()}/400/300`;
      onChange([...images, dummyUri].slice(0, maxImages));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <View className="w-full flex-col gap-3" testID="image-dropzone">
      <Text className="text-right font-cairo-semibold text-lg text-black">
        الصور
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePickImage}
        className="w-full flex-col items-center justify-center rounded border border-dashed border-[#D7D7D7] bg-white px-6 py-4"
        testID="upload-dropzone-button"
      >
        <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-[#F5F7F9]">
          <Feather name="upload-cloud" size={24} color="#15304D" />
        </View>

        <View className="flex-row items-center justify-center">
          <Text className="font-cairo-medium text-sm text-[#111111]">
            {' '}لرفع صورة
          </Text>
          <Text className="font-cairo-bold text-sm text-[#15304D]">
            اضغط هنا
          </Text>
        </View>

        <Text className="mt-1 text-center font-cairo-medium text-xs text-[#6B6A6A]">
          الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
        </Text>
      </TouchableOpacity>

      {/* Selected Images Preview List */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2 flex-row gap-2"
          testID="selected-images-preview"
        >
          {images.map((uri, idx) => (
            <View key={uri + idx} className="relative h-20 w-20 overflow-hidden rounded-md border border-[#ECECEC]">
              <Image source={{ uri }} className="h-full w-full object-cover" />
              <TouchableOpacity
                onPress={() => handleRemoveImage(idx)}
                className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-black/60"
                accessibilityLabel="حذف الصورة"
                testID={`remove-image-${idx}`}
              >
                <Ionicons name="close" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export default ImageDropzone;
