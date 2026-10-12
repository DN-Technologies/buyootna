import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity } from 'react-native';

import FormField, {
  INPUT_BOX_CLASS,
} from '@/shared/components/add-listing/FormField';

interface PropertyMapFieldProps {
  mapLocation: string | null;
  mapLocationLabel: string | null;
  onPress: () => void;
  onClear: () => void;
}

export default function PropertyMapField({
  mapLocation,
  mapLocationLabel,
  onPress,
  onClear,
}: PropertyMapFieldProps) {
  const hasLocation = !!(mapLocationLabel || mapLocation);

  return (
    <FormField label="الموقع على الخريطة" required>
      <TouchableOpacity
        testID="map-field"
        activeOpacity={0.8}
        onPress={onPress}
        className={`${INPUT_BOX_CLASS} justify-between`}
      >
        <Text
          className={`flex-1 font-cairo text-[14px] ${hasLocation ? 'text-[#111111]' : 'text-[#979797]'}`}
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {mapLocationLabel || mapLocation || 'حدد الموقع على الخريطة'}
        </Text>

        {hasLocation ? (
          <TouchableOpacity onPress={onClear} className="p-1">
            <Feather name="x-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : (
          <Image
            source={require('@/assets/icons/add-listing/field-map.svg')}
            style={{ width: 18, height: 18 }}
            contentFit="contain"
          />
        )}
      </TouchableOpacity>
    </FormField>
  );
}
