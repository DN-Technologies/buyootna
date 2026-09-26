import {
  alertToAuctionsState,
  alertToPropertiesState,
} from '@/features/individual/utils/alertForm';
import {
  AlertItem,
  mapAuctionsStateToPayload,
  mapPropertiesStateToPayload,
} from '@/shared/api/alerts.service';

const base: AlertItem = {
  id: 'a1',
  type: 'PROPERTIES',
  operationType: 'RENT',
  governorateId: 'hawally',
  areaId: 'hawally_2',
  categoryId: 'apartment',
  price: null,
  rentValue: 500,
  areaSize: 150,
  rooms: null,
  baths: null,
  floors: null,
  requestYear: null,
  requiredYear: null,
  amenities: ['pool', 'elevator'],
  startDate: null,
  endDate: null,
  createdAt: '2026-09-01T00:00:00.000Z',
};

describe('alertToPropertiesState', () => {
  it('fills the form with the saved selections', () => {
    const state = alertToPropertiesState(base);

    expect(state.operationType).toBe('rent');
    expect(state.governorate).toEqual({ id: 'hawally', label: 'حولي' });
    expect(state.area).toEqual({ id: 'hawally_2', label: 'السالمية' });
    expect(state.category).toEqual({ id: 'apartment', label: 'شقة' });
    expect(state.rentValue).toBe('500');
    expect(state.areaSize).toBe('150');
    expect(state.amenities.map((a) => a.id)).toEqual(['pool', 'elevator']);
  });

  it('round-trips back to the same payload when saved unchanged', () => {
    const payload = mapPropertiesStateToPayload(alertToPropertiesState(base));

    expect(payload).toEqual(
      expect.objectContaining({
        type: 'PROPERTIES',
        operationType: 'RENT',
        governorateId: 'hawally',
        areaId: 'hawally_2',
        categoryId: 'apartment',
        rentValue: 500,
        areaSize: 150,
        amenities: ['pool', 'elevator'],
      }),
    );
  });

  it('round-trips an exchange alert', () => {
    const exchange: AlertItem = {
      ...base,
      operationType: 'EXCHANGE',
      rentValue: null,
      areaSize: null,
      rooms: 3,
      baths: 2,
      floors: 1,
      requestYear: 2026,
      requiredYear: 2027,
      amenities: [],
    };

    expect(mapPropertiesStateToPayload(alertToPropertiesState(exchange))).toEqual(
      expect.objectContaining({
        operationType: 'EXCHANGE',
        rooms: 3,
        baths: 2,
        floors: 1,
        requestYear: 2026,
        requiredYear: 2027,
      }),
    );
  });

  it('drops amenity ids the form no longer offers', () => {
    const state = alertToPropertiesState({
      ...base,
      amenities: ['pool', 'retired-amenity'],
    });
    expect(state.amenities.map((a) => a.id)).toEqual(['pool']);
  });
});

describe('alertToAuctionsState', () => {
  it('round-trips an auction alert with its date window', () => {
    const auction: AlertItem = {
      ...base,
      type: 'AUCTIONS',
      operationType: null,
      governorateId: 'capital',
      areaId: null,
      categoryId: 'commercial',
      startDate: '2026-10-01T00:00:00.000Z',
      endDate: '2026-10-15T00:00:00.000Z',
    };

    expect(mapAuctionsStateToPayload(alertToAuctionsState(auction))).toEqual({
      type: 'AUCTIONS',
      governorateId: 'capital',
      areaId: undefined,
      categoryId: 'commercial',
      startDate: '2026-10-01T00:00:00.000Z',
      endDate: '2026-10-15T00:00:00.000Z',
    });
  });
});
