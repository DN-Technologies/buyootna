import { Text, TextInput, View } from 'react-native';

import FieldLabel from '@/features/company/components/invoice/FieldLabel';

import ServiceTypeField from './ServiceTypeField';
import SpecialtyField from './SpecialtyField';
import type { useAddService } from './useAddService';
import { DESCRIPTION_MAX_LENGTH } from './useAddService';

interface AddServiceFormProps {
  service: ReturnType<typeof useAddService>;
}

export default function AddServiceForm({ service }: AddServiceFormProps) {
  return (
    <View className="gap-5 px-4 pb-6 pt-5">
      <SpecialtyField
        value={service.specialty}
        locked={service.isSpecialtyLocked}
        isOpen={service.openField === 'specialty'}
        onToggleOpen={() => service.toggleField('specialty')}
        onSelect={service.selectSpecialty}
      />

      <ServiceTypeField
        options={service.typeOptions}
        selected={service.selectedTypes}
        disabled={service.disabledTypes}
        label={service.typesLabel}
        isOpen={service.openField === 'types'}
        onToggleOpen={() => service.toggleField('types')}
        onToggleType={service.toggleType}
      />

      {/* Only an "اخرى" service has a title of its own (Figma 8455:25047) */}
      {service.hasOther && (
        <View className="gap-1.5">
          <FieldLabel text="عنوان الخدمة" required={false} />
          <TextInput
            testID="service-title"
            value={service.serviceTitle}
            onChangeText={service.setServiceTitle}
            placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
            placeholderTextColor="#979797"
            maxLength={100}
            className="h-[46px] w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          />
        </View>
      )}

      <View className="gap-1.5">
        <FieldLabel text="الوصف" required={false} />
        <TextInput
          testID="service-description"
          value={service.description}
          onChangeText={service.setDescription}
          placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
          placeholderTextColor="#979797"
          multiline
          textAlignVertical="top"
          maxLength={DESCRIPTION_MAX_LENGTH}
          className="h-[95px] w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 pt-4 text-right font-cairo text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        />
        <Text
          className="font-cairo-medium text-[10px] leading-[16px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          يجب أن لا يتخطى الوصف {DESCRIPTION_MAX_LENGTH} حرف.
        </Text>
      </View>
    </View>
  );
}
