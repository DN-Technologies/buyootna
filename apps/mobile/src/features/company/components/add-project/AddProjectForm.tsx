import { Text, TextInput, View } from 'react-native';

import FieldLabel from '@/features/company/components/invoice/FieldLabel';

import ProjectImagesField from './ProjectImagesField';
import { DESCRIPTION_MAX_LENGTH } from './useAddProject';

const inputClassName =
  'h-[46px] w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

interface AddProjectFormProps {
  projectTitle: string;
  onProjectTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  images: string[];
  onPickImages: () => void;
  onRemoveImage: (uri: string) => void;
}

export default function AddProjectForm({
  projectTitle,
  onProjectTitleChange,
  description,
  onDescriptionChange,
  images,
  onPickImages,
  onRemoveImage,
}: AddProjectFormProps) {
  return (
    <View className="gap-5 px-4 pb-6 pt-5">
      {/* 1. Project title */}
      <View className="gap-1.5">
        <FieldLabel text="عنوان المشروع" />
        <TextInput
          value={projectTitle}
          onChangeText={onProjectTitleChange}
          placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
          placeholderTextColor="#979797"
          className={inputClassName}
          style={{ writingDirection: 'rtl' }}
        />
      </View>

      {/* 2. Description */}
      <View className="gap-1.5">
        <FieldLabel text="الوصف" />
        <TextInput
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
          placeholderTextColor="#979797"
          multiline
          textAlignVertical="top"
          maxLength={DESCRIPTION_MAX_LENGTH}
          className="h-[95px] w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 pt-4 text-right font-cairo text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        />
        <Text
          className="mt-0.5 font-cairo-medium text-[12px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          يجب أن لا يتخطى الوصف {DESCRIPTION_MAX_LENGTH} حرف.
        </Text>
      </View>

      {/* 3. Images */}
      <ProjectImagesField
        images={images}
        onPick={onPickImages}
        onRemove={onRemoveImage}
      />
    </View>
  );
}
