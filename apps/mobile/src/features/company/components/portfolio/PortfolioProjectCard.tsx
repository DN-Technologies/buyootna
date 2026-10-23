import { Image } from 'expo-image';
import { Text, TouchableOpacity, useWindowDimensions,View } from 'react-native';

import type { MyCompanyProject } from '@/shared/api/company.service';
import { formatTimeAgo } from '@/shared/utils/helpers/property';

import ProjectPhotoCarousel from './ProjectPhotoCarousel';

// Figma 343 × 211.85 at a 375-wide screen
const PHOTO_RATIO = 211.853 / 343;

interface PortfolioProjectCardProps {
  project: MyCompanyProject;
  onEdit: (project: MyCompanyProject) => void;
}

/** One project on معرض الأعمال (Figma 4410:169523): photos, «مخفي», title, age, description and «تعديل». */
export default function PortfolioProjectCard({
  project,
  onEdit,
}: PortfolioProjectCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const width = screenWidth - 32;

  return (
    <View testID={`portfolio-project-${project.id}`} className="gap-2">
      <View>
        <ProjectPhotoCarousel
          images={project.images}
          width={width}
          height={width * PHOTO_RATIO}
        />
        {project.isHidden && (
          // Top-left corner of the photo (right-* under forced RTL)
          <View
            testID={`portfolio-project-hidden-${project.id}`}
            className="absolute right-3 top-3 h-5 items-center justify-center rounded-br-[10px] rounded-tl-[8px] rounded-tr-[10px] bg-white/80 px-2"
          >
            <Text className="font-almarai-regular text-[12px] text-[#111111]">
              مخفي
            </Text>
          </View>
        )}
      </View>

      <View className="gap-[10px]">
        <View className="flex-row items-center gap-2">
          <Text
            className="flex-1 font-cairo-semibold text-[14px] leading-[21px] tracking-[0.28px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {project.title}
          </Text>
          <Text className="font-cairo-medium text-[12px] text-[#A0A0A0]">
            {formatTimeAgo(project.createdAt)}
          </Text>
        </View>
        <Text
          className="font-cairo-medium text-[12px] leading-[16px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
          numberOfLines={4}
        >
          {project.description}
        </Text>
      </View>

      <TouchableOpacity
        testID={`portfolio-edit-${project.id}`}
        activeOpacity={0.8}
        onPress={() => onEdit(project)}
        className="h-9 flex-row items-center justify-center gap-[6px] rounded-[24px] bg-[#F5F7F9] px-2"
      >
        <Text className="font-cairo-bold text-[14px] text-[#15304D]">تعديل</Text>
        <Image
          source={require('@/assets/icons/portfolio/edit.svg')}
          style={{ width: 16, height: 16 }}
          contentFit="contain"
        />
      </TouchableOpacity>
    </View>
  );
}
