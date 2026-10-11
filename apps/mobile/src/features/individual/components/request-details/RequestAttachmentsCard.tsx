import { Image } from 'expo-image';
import { TouchableOpacity, View } from 'react-native';

import { RequestSectionCard } from '@/features/individual/components/request-details/RequestCard';
import { useImageViewer } from '@/shared/components/media/ImageViewer';

/** مرفقات: the request's photos, three per row; tap opens the full-screen viewer. */
export default function RequestAttachmentsCard({
  images,
  muted,
}: {
  images: string[];
  muted?: boolean;
}) {
  const { open, viewer } = useImageViewer();
  if (!images.length) return null;

  return (
    <RequestSectionCard title="مرفقات" muted={muted}>
      <View className="flex-row flex-wrap gap-2">
        {images.map((uri, index) => (
          <TouchableOpacity
            key={`${uri}-${index}`}
            testID={`request-attachment-${index}`}
            accessibilityRole="imagebutton"
            accessibilityLabel={`عرض المرفق ${index + 1}`}
            activeOpacity={0.85}
            onPress={() => open(images, index)}
            className="h-[52px] overflow-hidden rounded-[2px]"
            style={{ width: '31.5%' }}
          >
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
      {viewer}
    </RequestSectionCard>
  );
}
