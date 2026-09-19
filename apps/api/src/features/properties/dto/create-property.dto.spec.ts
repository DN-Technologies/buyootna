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
    const dto = buildSaleListing({ price: 50000 as any });
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
