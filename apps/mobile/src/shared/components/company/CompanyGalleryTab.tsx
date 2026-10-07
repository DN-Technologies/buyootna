import { Image as ExpoImage } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { useImageViewer } from '@/shared/components/media/ImageViewer';

export interface CompanyProjectItemData {
  id: string;
  title: string;
  category?: string;
  imageUrl?: string;
  // All of the project's photos (older APIs only send imageUrl)
  images?: string[];
  completedDate?: string;
}

interface CompanyGalleryTabProps {
  projects?: CompanyProjectItemData[];
}

export default function CompanyGalleryTab({
  projects = [],
}: CompanyGalleryTabProps) {
  // Tap a project: its photos full screen, swipe, pinch / double-tap to zoom
  const { open: openViewer, viewer } = useImageViewer();

  // Real projects only (no stock photos when a company has none yet)
  if (projects.length === 0) {
    return (
      <View testID="company-gallery-empty" className="items-center py-12">
        <Text className="font-cairo-medium text-sm text-[#6B6A6A]">
          لا توجد أعمال في المعرض بعد
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 pb-24 space-y-4">
      {projects.map((proj) => (
        <View
          key={proj.id}
          className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
        >
          {/* Project Image */}
          <TouchableOpacity
            activeOpacity={0.95}
            disabled={!proj.imageUrl && !proj.images?.length}
            testID={`company-project-photo-${proj.id}`}
            accessibilityRole="imagebutton"
            accessibilityLabel={`صور ${proj.title}`}
            onPress={() =>
              openViewer(
                proj.images?.length ? proj.images : [proj.imageUrl ?? ''],
                0,
              )
            }
            className="h-44 w-full bg-slate-100"
          >
            <ExpoImage
              source={{ uri: proj.imageUrl }}
              className="h-full w-full"
              contentFit="cover"
            />
            {(proj.images?.length ?? 0) > 1 && (
              <View className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5">
                <Text className="font-cairo-semibold text-xs text-white">
                  {proj.images!.length} صور
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Details */}
          <View className="p-4">
            {proj.category && (
              <Text className="mb-1 text-right font-cairo-medium text-xs text-[#B28648]">
                {proj.category}
              </Text>
            )}
            <Text className="text-right font-cairo-bold text-base leading-[22px] text-[#111111]">
              {proj.title}
            </Text>
          </View>
        </View>
      ))}

      {viewer}
    </View>
  );
}
