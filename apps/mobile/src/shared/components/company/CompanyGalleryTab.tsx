import { Image as ExpoImage } from 'expo-image';
import { Text, View } from 'react-native';

export interface CompanyProjectItemData {
  id: string;
  title: string;
  category?: string;
  imageUrl?: string;
  completedDate?: string;
}

interface CompanyGalleryTabProps {
  projects?: CompanyProjectItemData[];
}

const DEFAULT_PROJECTS: CompanyProjectItemData[] = [
  {
    id: '1',
    title: 'تصميم واجهة قسيمة في خيران',
    category: 'ديكورات وتصميم',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
    completedDate: '2026-05',
  },
  {
    id: '2',
    title: 'تأثيث مكاتب برج العاصمة',
    category: 'أثاث',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
    completedDate: '2026-04',
  },
  {
    id: '3',
    title: 'تركيب شبكات إنترنت لشركة حلول',
    category: 'شبكات نت',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800',
    completedDate: '2026-03',
  },
];

export default function CompanyGalleryTab({
  projects = DEFAULT_PROJECTS,
}: CompanyGalleryTabProps) {
  return (
    <View className="flex-1 pb-24 space-y-4">
      {projects.map((proj) => (
        <View
          key={proj.id}
          className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
        >
          {/* Project Image */}
          <View className="h-44 w-full bg-slate-100">
            <ExpoImage
              source={{ uri: proj.imageUrl }}
              className="h-full w-full"
              contentFit="cover"
            />
          </View>

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
    </View>
  );
}
