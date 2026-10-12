import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePropertyDto } from './create-property.dto';

function buildSaleListing(overrides: Partial<CreatePropertyDto> = {}) {
  return plainToInstance(CreatePropertyDto, {
    isDraft: false,
    type: 'SALE',
    category: 'APARTMENT',
    areaSize: 150,
    beds: 3,
    baths: 2,
    location: 'العاصمة - مدينة جابر الأحمد',
    description: 'test listing',
    images: ['https://example.com/a.jpg'],
    ...overrides,
  });
}

describe('CreatePropertyDto price validation', () => {
  it('passes with no price at all, for a SALE listing (Add Price toggle off)', async () => {
    const dto = buildSaleListing();
    const errors = await validate(dto);

    expect(errors.find((e) => e.property === 'price')).toBeUndefined();
  });

  it('passes with a valid numeric price', async () => {
    const dto = buildSaleListing({ price: 50000 });
    const errors = await validate(dto);

    expect(errors.find((e) => e.property === 'price')).toBeUndefined();
  });

  it('still rejects a non-numeric price when one is provided', async () => {
    const dto = buildSaleListing({ price: 'not-a-number' as any });
    const errors = await validate(dto);

    const priceError = errors.find((e) => e.property === 'price');
    expect(priceError).toBeDefined();
    expect(priceError?.constraints).toEqual(
      expect.objectContaining({
        isNumber: 'السعر يجب أن يكون رقماً',
      }),
    );
  });
});

describe('CreatePropertyDto category-dependent fields', () => {
  it('accepts land with no rooms or baths', async () => {
    const dto = buildSaleListing({
      category: 'LAND',
      beds: undefined,
      baths: undefined,
    });

    expect(await validate(dto)).toEqual([]);
  });

  it('accepts a farm, with a WhatsApp number and no phone', async () => {
    const dto = buildSaleListing({
      category: 'FARM',
      beds: undefined,
      baths: undefined,
      whatsappNumber: '58094586',
    });

    expect(await validate(dto)).toEqual([]);
  });

  it('accepts an allocation status on an exchange ad', async () => {
    const dto = buildSaleListing({
      type: 'EXCHANGE',
      category: 'LAND',
      requestYear: 2019,
      requiredYear: 2025,
      allocationStatus: 'مخصصة',
    });

    expect(await validate(dto)).toEqual([]);
  });

  it('still rejects a non-numeric room count', async () => {
    const dto = buildSaleListing({ beds: 'three' as any });
    const errors = await validate(dto);

    expect(errors.find((e) => e.property === 'beds')).toBeDefined();
  });
});
