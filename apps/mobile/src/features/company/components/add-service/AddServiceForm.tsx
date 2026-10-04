import { Text, TextInput, View } from 'react-native';

import FieldLabel from '@/features/company/components/invoice/FieldLabel';

import ServiceTypeField from './ServiceTypeField';
import { DESCRIPTION_MAX_LENGTH } from './useAddService';

const inputClassName =
  'h-[46px] w-full rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

interface AddServiceFormProps {
  serviceType: string;
  onServiceTypeChange: (value: string) => void;
  serviceTypeOptions: { id: string; label: string }[];
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onSelectServiceType: (label: string) => void;
  serviceTitle: string;
  onServiceTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export default function AddServiceForm({
  serviceType,
  onServiceTypeChange,
  serviceTypeOptions,
  isDropdownOpen,
  onToggleDropdown,
  onSelectServiceType,
  serviceTitle,
  onServiceTitleChange,
  description,
  onDescriptionChange,
}: AddServiceFormProps) {
  return (
    <View className="gap-5 px-4 pb-6 pt-3">
      {/* 1. Service type (combo: pick or type) */}
      <ServiceTypeField
        value={serviceType}
        onChange={onServiceTypeChange}
        options={serviceTypeOptions}
        isOpen={isDropdownOpen}
        onToggleOpen={onToggleDropdown}
        onSelect={onSelectServiceType}
      />

      {/* 2. Service title */}
      <View className="gap-1.5">
        <FieldLabel text="عنوان الخدمة" />
        <TextInput
          value={serviceTitle}
          onChangeText={onServiceTitleChange}
          placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
          placeholderTextColor="#979797"
          className={inputClassName}
          style={{ writingDirection: 'rtl' }}
        />
      </View>

      {/* 3. Description */}
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
          className="h-[119px] w-full rounded-md border border-[#ECECEC] bg-white px-3 pt-4 text-right font-cairo text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        />
        <Text
          className="mt-0.5 font-cairo-medium text-[10px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          يجب أن لا يتخطى الوصف {DESCRIPTION_MAX_LENGTH} حرف.
        </Text>
      </View>
    </View>
  );
}
