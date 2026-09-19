import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

export interface RequestDetailsAttachmentsProps {
  images?: string[];
  totalAttachmentsCount?: number;
  onPhotoPress?: (index: number) => void;
}

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
];

export default function RequestDetailsAttachments({
  images = DEFAULT_IMAGES,
  totalAttachmentsCount = 3,
  onPhotoPress,
}: RequestDetailsAttachmentsProps) {
  const displayImages = images.length > 0 ? images.slice(0, 3) : DEFAULT_IMAGES;
  const extraCount = Math.max(0, totalAttachmentsCount - 2);

  return (
    <View className="mt-4">
      {/* Section Title */}
      <Text
        testID="request-details-attachments-title"
        className="mb-2.5 font-cairo-bold text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        الصور المرفقة
      </Text>

      {/* Thumbnails Row (RTL order: Child 0 visual Right, Child 1 middle, Child 2 visual Left) */}
      <View className="flex-row items-center gap-2">
        {displayImages.map((uri, index) => {
          const isLastWithOverlay = index === 2 && extraCount > 0;
          return (
            <TouchableOpacity
              key={index}
              testID={`request-details-photo-${index}`}
              activeOpacity={0.8}
              onPress={() => onPhotoPress?.(index)}
              className="h-[74px] flex-1 overflow-hidden rounded-[6px] bg-[#ECECEC]"
            >
              <Image
                source={{ uri }}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
                transition={200}
              />
              {isLastWithOverlay && (
                <View className="absolute inset-0 items-center justify-center bg-black/40">
                  <Text
                    testID="request-details-photo-extra-count"
                    className="font-cairo-medium text-[16px] text-white"
                  >
                    +{extraCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
