import { useCallback, useState } from 'react';
import { View } from 'react-native';

import InlineDropdown from '@/shared/components/filters/InlineDropdown';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

/**
 * Where a quote request is for: the governorate, then an area of it (the
 * request forms used a map pin before). Sent as one "المحافظة - المنطقة"
 * line in the request's location.
 */
export function useGovArea() {
  const [governorateId, setGovernorateIdState] = useState('');
  const [areaId, setAreaId] = useState('');

  // Another governorate has other areas
  const setGovernorateId = useCallback((id: string) => {
    setGovernorateIdState(id);
    setAreaId('');
  }, []);

  const reset = useCallback(() => {
    setGovernorateIdState('');
    setAreaId('');
  }, []);

  const governorate = GOVERNORATES.find((item) => item.id === governorateId);
  const area = (AREAS[governorateId] ?? []).find((item) => item.id === areaId);

  return {
    governorateId,
    setGovernorateId,
    areaId,
    setAreaId,
    reset,
    isComplete: !!governorate && !!area,
    locationLabel:
      governorate && area ? `${governorate.label} - ${area.label}` : '',
  };
}

export type GovArea = ReturnType<typeof useGovArea>;

/** المحافظة, then المنطقة (off until a governorate is picked). */
export default function GovAreaFields({ value }: { value: GovArea }) {
  return (
    <View className="w-full">
      <InlineDropdown
        testID="request-governorate"
        title="المحافظة"
        required
        placeholder="اختر المحافظة"
        options={GOVERNORATES}
        value={value.governorateId}
        onChange={value.setGovernorateId}
      />
      <InlineDropdown
        testID="request-area"
        title="المنطقة"
        required
        placeholder={
          value.governorateId ? 'اختر المنطقة' : 'اختر المحافظة أولاً'
        }
        disabled={!value.governorateId}
        options={AREAS[value.governorateId] ?? []}
        value={value.areaId}
        onChange={value.setAreaId}
      />
    </View>
  );
}
