import { AlertAuctionsState } from '@/shared/components/add-alert/AlertAuctionsTab';
import { AlertPropertiesState } from '@/shared/components/add-alert/AlertPropertiesTab';

import {
  mapAuctionsStateToPayload,
  mapPropertiesStateToPayload,
} from '../alerts.service';

function buildPropertiesState(
  overrides: Partial<AlertPropertiesState> = {},
): AlertPropertiesState {
  return {
    operationType: 'sale',
    governorate: { id: 'capital', label: 'العاصمة' },
    area: null,
    category: null,
    price: '',
    rentValue: '',
    areaSize: '',
    rooms: 0,
    baths: 0,
    floors: 0,
    requestYear: '',
    requiredYear: '',
    amenities: [],
    ...overrides,
  };
}

function buildAuctionsState(
  overrides: Partial<AlertAuctionsState> = {},
): AlertAuctionsState {
  return {
    governorate: { id: 'hawally', label: 'حولي' },
    area: null,
    category: null,
    startDate: null,
    endDate: null,
    ...overrides,
  };
}

describe('mapPropertiesStateToPayload', () => {
  it('flattens governorate/area/category to their bare ids and uppercases operationType', () => {
    const state = buildPropertiesState({
      area: { id: 'capital_1', label: 'مدينة جابر الأحمد' },
      category: { id: 'apartment', label: 'شقة' },
    });

    const payload = mapPropertiesStateToPayload(state);

    expect(payload).toMatchObject({
      type: 'PROPERTIES',
      governorateId: 'capital',
      areaId: 'capital_1',
      categoryId: 'apartment',
      operationType: 'SALE',
    });
  });

  it('coerces numeric string fields to numbers and treats empty strings as undefined', () => {
    const state = buildPropertiesState({
      operationType: 'sale',
      price: '50000',
      areaSize: '',
    });

    const payload = mapPropertiesStateToPayload(state);

    expect(payload.price).toBe(50000);
    expect(payload.areaSize).toBeUndefined();
  });

  it('only sends exchange-specific fields when operationType is exchange', () => {
    const state = buildPropertiesState({
      operationType: 'exchange',
      rooms: 3,
      baths: 2,
      floors: 1,
      requestYear: '2019',
      requiredYear: '2025',
    });

    const payload = mapPropertiesStateToPayload(state);

    expect(payload).toMatchObject({
      operationType: 'EXCHANGE',
      rooms: 3,
      baths: 2,
      floors: 1,
      requestYear: 2019,
      requiredYear: 2025,
    });
    expect(payload.price).toBeUndefined();
    expect(payload.rentValue).toBeUndefined();
  });

  it('flattens selected amenities to their bare ids', () => {
    const state = buildPropertiesState({
      amenities: [
        { id: 'pool', label: 'حمام سباحة' },
        { id: 'garage', label: 'كراج' },
      ],
    });

    const payload = mapPropertiesStateToPayload(state);

    expect(payload.amenities).toEqual(['pool', 'garage']);
  });
});

describe('mapAuctionsStateToPayload', () => {
  it('flattens governorate/area/category and serializes dates to ISO strings', () => {
    const state = buildAuctionsState({
      area: { id: 'hawally_1', label: 'السالمية' },
      startDate: new Date('2026-10-01T00:00:00.000Z'),
      endDate: new Date('2026-10-15T00:00:00.000Z'),
    });

    const payload = mapAuctionsStateToPayload(state);

    expect(payload).toMatchObject({
      type: 'AUCTIONS',
      governorateId: 'hawally',
      areaId: 'hawally_1',
      startDate: '2026-10-01T00:00:00.000Z',
      endDate: '2026-10-15T00:00:00.000Z',
    });
  });

  it('omits startDate/endDate when null', () => {
    const state = buildAuctionsState();

    const payload = mapAuctionsStateToPayload(state);

    expect(payload.startDate).toBeUndefined();
    expect(payload.endDate).toBeUndefined();
  });
});
