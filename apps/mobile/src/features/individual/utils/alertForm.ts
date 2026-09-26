import type { AlertItem } from '@/shared/api/alerts.service';
import {
  type AlertAuctionsState,
  DEFAULT_ALERT_AUCTIONS_STATE,
} from '@/shared/components/add-alert/AlertAuctionsTab';
import {
  type AlertPropertiesState,
  AMENITIES_OPTIONS,
  CATEGORY_OPTIONS,
  DEFAULT_ALERT_PROPERTIES_STATE,
  type OperationType,
} from '@/shared/components/add-alert/AlertPropertiesTab';
import type { SelectionItem } from '@/shared/components/filters/SelectionDrawer';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

// Reverse of mapPropertiesStateToPayload / mapAuctionsStateToPayload: fills
// the add-alert form from a saved alert so it can be edited.

function findItem(
  list: SelectionItem[],
  id: string | null | undefined,
): SelectionItem | null {
  if (!id) return null;
  return list.find((item) => item.id === id) ?? null;
}

const toText = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

function locationOf(alert: AlertItem) {
  return {
    governorate: findItem(GOVERNORATES, alert.governorateId),
    area: findItem(AREAS[alert.governorateId] ?? [], alert.areaId),
    category: findItem(CATEGORY_OPTIONS, alert.categoryId),
  };
}

export function alertToPropertiesState(alert: AlertItem): AlertPropertiesState {
  return {
    ...DEFAULT_ALERT_PROPERTIES_STATE,
    ...locationOf(alert),
    operationType: (alert.operationType?.toLowerCase() ??
      'sale') as OperationType,
    price: toText(alert.price),
    rentValue: toText(alert.rentValue),
    areaSize: toText(alert.areaSize),
    rooms: alert.rooms ?? 0,
    baths: alert.baths ?? 0,
    floors: alert.floors ?? 0,
    requestYear: toText(alert.requestYear),
    requiredYear: toText(alert.requiredYear),
    // Ids the form no longer offers are dropped rather than shown raw
    amenities: (alert.amenities ?? [])
      .map((id) => findItem(AMENITIES_OPTIONS, id))
      .filter((item): item is SelectionItem => item !== null),
  };
}

export function alertToAuctionsState(alert: AlertItem): AlertAuctionsState {
  return {
    ...DEFAULT_ALERT_AUCTIONS_STATE,
    ...locationOf(alert),
    startDate: alert.startDate ? new Date(alert.startDate) : null,
    endDate: alert.endDate ? new Date(alert.endDate) : null,
  };
}
