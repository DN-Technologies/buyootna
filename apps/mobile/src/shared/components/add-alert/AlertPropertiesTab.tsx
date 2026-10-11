import { View } from 'react-native';

import InlineDropdown from '@/shared/components/filters/InlineDropdown';

import AmenitiesPicker from './properties/AmenitiesPicker';
import { type AlertPropertiesState, CATEGORY_OPTIONS } from './properties/constants';
import ExchangeFields from './properties/ExchangeFields';
import LocationPickers from './properties/LocationPickers';
import OperationTypeSelector from './properties/OperationTypeSelector';
import PriceAreaFields from './properties/PriceAreaFields';
import type { AlertPropertiesChange } from './properties/types';

// Constants and state types live in ./properties/constants; re-exported here
// so existing imports from this file keep working.
export {
  type AlertPropertiesState,
  AMENITIES_OPTIONS,
  CATEGORY_OPTIONS,
  DEFAULT_ALERT_PROPERTIES_STATE,
  OPERATION_OPTIONS,
  type OperationType,
} from './properties/constants';

interface AlertPropertiesTabProps {
  value: AlertPropertiesState;
  onChange: AlertPropertiesChange;
}

export default function AlertPropertiesTab({
  value,
  onChange,
}: AlertPropertiesTabProps) {
  return (
    <View>
      <OperationTypeSelector
        value={value.operationType}
        onChange={(type) => onChange('operationType', type)}
      />

      <LocationPickers
        governorate={value.governorate}
        area={value.area}
        onGovernorateChange={(item) => {
          onChange('governorate', item);
          onChange('area', null);
        }}
        onAreaChange={(item) => onChange('area', item)}
      />

      {/* --- فئة العقار --- */}
      <InlineDropdown
        title="فئة العقار"
        optional
        placeholder="اختر نوع عقارك"
        options={CATEGORY_OPTIONS.map((c) => ({ id: c.id, label: c.label }))}
        value={value.category?.id || ''}
        onChange={(id) =>
          onChange(
            'category',
            CATEGORY_OPTIONS.find((c) => c.id === id) || null,
          )
        }
      />

      {/* --- Fields for the chosen نوع العملية --- */}
      {value.operationType === 'exchange' ? (
        <ExchangeFields value={value} onChange={onChange} />
      ) : (
        <PriceAreaFields value={value} onChange={onChange} />
      )}

      <AmenitiesPicker
        value={value.amenities}
        onChange={(items) => onChange('amenities', items)}
      />
    </View>
  );
}
