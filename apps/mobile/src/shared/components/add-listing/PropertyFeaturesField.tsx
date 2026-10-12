import { Image } from 'expo-image';
import { useRef } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import FormField, {
  INPUT_BOX_CLASS,
} from '@/shared/components/add-listing/FormField';
import SelectionDrawer, {
  type SelectionItem,
} from '@/shared/components/filters/SelectionDrawer';

interface PropertyFeaturesFieldProps {
  // What this listing type can pick from
  options: SelectionItem[];
  // The picked features, by label
  selected: string[];
  onChange: (labels: string[]) => void;
}

/** المزايا: a dropdown that opens a multi-select sheet. */
export default function PropertyFeaturesField({
  options,
  selected,
  onChange,
}: PropertyFeaturesFieldProps) {
  const drawerRef = useRef<{ present: () => void }>(null);
  const selectedItems = options.filter((o) => selected.includes(o.label));

  return (
    <FormField label="المزايا">
      <TouchableOpacity
        testID="features-field"
        activeOpacity={0.8}
        onPress={() => drawerRef.current?.present()}
        className={`${INPUT_BOX_CLASS} justify-between`}
      >
        <Text
          className={`flex-1 font-cairo text-[14px] ${selected.length ? 'text-[#111111]' : 'text-[#979797]'}`}
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {selected.length ? selected.join('، ') : 'ما يميز عقارك'}
        </Text>
        <Image
          source={require('@/assets/icons/add-listing/chevron-down.svg')}
          style={{ width: 18, height: 18 }}
          contentFit="contain"
        />
      </TouchableOpacity>

      <SelectionDrawer
        ref={drawerRef}
        title="المزايا"
        data={options}
        multiSelect
        selectedItems={selectedItems}
        onSelectMultiple={(items) => onChange(items.map((i) => i.label))}
      />
    </FormField>
  );
}
