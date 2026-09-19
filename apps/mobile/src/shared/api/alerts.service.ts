import apiClient from '@/shared/api/api';
import { AlertAuctionsState } from '@/shared/components/add-alert/AlertAuctionsTab';
import { AlertPropertiesState } from '@/shared/components/add-alert/AlertPropertiesTab';

export interface AlertItem {
  id: string;
  type: 'PROPERTIES' | 'AUCTIONS';
  operationType: 'SALE' | 'RENT' | 'EXCHANGE' | null;
  governorateId: string;
  areaId: string | null;
  categoryId: string | null;
  price: number | null;
  rentValue: number | null;
  areaSize: number | null;
  rooms: number | null;
  baths: number | null;
  floors: number | null;
  requestYear: number | null;
  requiredYear: number | null;
  amenities: string[];
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface CreateAlertPayload {
  type: 'PROPERTIES' | 'AUCTIONS';
  governorateId: string;
  areaId?: string;
  categoryId?: string;
  operationType?: 'SALE' | 'RENT' | 'EXCHANGE';
  price?: number;
  rentValue?: number;
  areaSize?: number;
  rooms?: number;
  baths?: number;
  floors?: number;
  requestYear?: number;
  requiredYear?: number;
  amenities?: string[];
  startDate?: string;
  endDate?: string;
}

function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function mapPropertiesStateToPayload(
  state: AlertPropertiesState,
): CreateAlertPayload {
  const isExchange = state.operationType === 'exchange';

  return {
    type: 'PROPERTIES',
    governorateId: state.governorate!.id,
    areaId: state.area?.id,
    categoryId: state.category?.id,
    operationType: state.operationType.toUpperCase() as
      | 'SALE'
      | 'RENT'
      | 'EXCHANGE',
    price: state.operationType === 'sale' ? toNumber(state.price) : undefined,
    rentValue:
      state.operationType === 'rent' ? toNumber(state.rentValue) : undefined,
    areaSize:
      state.operationType === 'sale' || state.operationType === 'rent'
        ? toNumber(state.areaSize)
        : undefined,
    rooms: isExchange ? state.rooms : undefined,
    baths: isExchange ? state.baths : undefined,
    floors: isExchange ? state.floors : undefined,
    requestYear: isExchange ? toNumber(state.requestYear) : undefined,
    requiredYear: isExchange ? toNumber(state.requiredYear) : undefined,
    amenities: state.amenities.map((item) => item.id),
  };
}

export function mapAuctionsStateToPayload(
  state: AlertAuctionsState,
): CreateAlertPayload {
  return {
    type: 'AUCTIONS',
    governorateId: state.governorate!.id,
    areaId: state.area?.id,
    categoryId: state.category?.id,
    startDate: state.startDate ? state.startDate.toISOString() : undefined,
    endDate: state.endDate ? state.endDate.toISOString() : undefined,
  };
}

export const alertsService = {
  create: async (payload: CreateAlertPayload): Promise<AlertItem> => {
    const response = await apiClient.post<AlertItem>('/alerts', payload);
    return response.data;
  },

  getMine: async (): Promise<AlertItem[]> => {
    const response = await apiClient.get<AlertItem[]>('/alerts/me');
    return response.data;
  },

  remove: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/alerts/${id}`);
    return response.data;
  },
};
