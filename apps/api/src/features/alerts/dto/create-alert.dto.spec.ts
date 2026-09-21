import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateAlertDto } from './create-alert.dto';

function buildPropertiesAlert(overrides: Partial<CreateAlertDto> = {}) {
  return plainToInstance(CreateAlertDto, {
    type: 'PROPERTIES',
    operationType: 'SALE',
    governorateId: 'capital',
    ...overrides,
  });
}

function buildAuctionsAlert(overrides: Partial<CreateAlertDto> = {}) {
  return plainToInstance(CreateAlertDto, {
    type: 'AUCTIONS',
    governorateId: 'capital',
    ...overrides,
  });
}

describe('CreateAlertDto', () => {
  it('fails when governorateId is missing, regardless of type', async () => {
    const dto = buildPropertiesAlert({ governorateId: undefined as any });
    const errors = await validate(dto);

    expect(errors.find((e) => e.property === 'governorateId')).toBeDefined();
  });

  it('passes a minimal PROPERTIES alert with just type/operationType/governorateId', async () => {
    const dto = buildPropertiesAlert();
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid operationType for a PROPERTIES alert', async () => {
    const dto = buildPropertiesAlert({ operationType: 'NOT_A_TYPE' as any });
    const errors = await validate(dto);

    expect(errors.find((e) => e.property === 'operationType')).toBeDefined();
  });

  it('does not require operationType/price/amenities for an AUCTIONS alert', async () => {
    const dto = buildAuctionsAlert();
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('does not validate a PROPERTIES-only field (price) when type is AUCTIONS, even if malformed', async () => {
    const dto = buildAuctionsAlert({ price: 'not-a-number' as any });
    const errors = await validate(dto);

    expect(errors.find((e) => e.property === 'price')).toBeUndefined();
  });

  it('validates startDate/endDate as ISO date strings for an AUCTIONS alert', async () => {
    const dto = buildAuctionsAlert({ startDate: 'not-a-date' });
    const errors = await validate(dto);

    expect(errors.find((e) => e.property === 'startDate')).toBeDefined();
  });

  it('accepts a fully-populated AUCTIONS alert', async () => {
    const dto = buildAuctionsAlert({
      startDate: '2026-10-01T00:00:00.000Z',
      endDate: '2026-10-15T00:00:00.000Z',
      areaId: 'capital_1',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
