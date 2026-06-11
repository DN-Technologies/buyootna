import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { useListingStore } from '@/core/store/useListingStore';

export default function ImageUploadZone() {
  const { images, addImages, removeImage } = useListingStore();

  const handlePickImages = async () => {
    // Request permission (you can also handle this more robustly in a real app)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restricted to images as requested
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      addImages(selectedUris);
    }
  };

  return (
    <View className="mb-8 w-full">
      <Text className="mb-4 text-right font-cairo-bold text-lg text-[#111111]">
        الصور
      </Text>

      {/* --- Image Grid (if images are selected) --- */}
      {images.length > 0 && (
        <View className="mb-4 flex-row flex-wrap justify-end gap-3">
          {images.map((uri, index) => (
            <View
              key={index}
              className="relative h-[100px] w-[100px] overflow-hidden rounded-xl border border-gray-200"
            >
              <Image
                source={{ uri }}
                className="h-full w-full"
                resizeMode="cover"
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
        className="w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white py-8"
      >
        <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-[#F4F8FB]">
          <Feather name="file" size={24} color="#15304D" />
        </View>
        <Text className="mb-1 font-cairo-bold text-[15px] text-[#111111]">
          اضغط هنا <Text className="font-cairo-medium">لرفع صورة أو فيديو</Text>
        </Text>
        <Text className="px-8 text-center font-cairo-medium text-[11px] leading-5 text-[#94A3B8]">
          الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
        </Text>
      </TouchableOpacity>
    </View>
  );
}
