import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import FieldLabel from '@/features/company/components/invoice/FieldLabel';

import { MAX_IMAGES } from './useAddProject';

interface ProjectImagesFieldProps {
  images: string[];
  onPick: () => void;
  onRemove: (uri: string) => void;
}

// Gallery thumbnails plus the dashed upload dropzone (up to MAX_IMAGES)
export default function ProjectImagesField({
  images,
  onPick,
  onRemove,
}: ProjectImagesFieldProps) {
  return (
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
                onPress={() => onRemove(uri)}
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
          onPress={onPick}
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
        className="mt-0.5 font-cairo-medium text-[10px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        يمكن إضافة حتى {MAX_IMAGES} صور.
      </Text>
    </View>
  );
}
