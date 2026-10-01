import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePropertyDto } from '../../features/properties/dto/create-property.dto';
import {
  AddressDetailsDto,
  addressDetailsWrite,
  toAddressDetailsJson,
} from './address-details.dto';

describe('address details', () => {
  it('keeps only the filled, trimmed parts', () => {
    expect(
      toAddressDetailsJson({
        block: ' 6 ',
        street: '',
        landmark: 'قرب الجمعية',
      }),
    ).toEqual({ block: '6', landmark: 'قرب الجمعية' });
    expect(toAddressDetailsJson({ block: ' ' })).toBeNull();
  });

  it('an update without the field leaves it; sent empty clears it', () => {
    expect(addressDetailsWrite(undefined)).toEqual({});
    expect(addressDetailsWrite({})).toEqual({ addressDetails: Prisma.DbNull });
    expect(addressDetailsWrite({ building: '12' })).toEqual({
      addressDetails: { building: '12' },
    });
  });

  it('is validated inside the property body', async () => {
    const dto = plainToInstance(CreatePropertyDto, {
      addressDetails: { block: 'x'.repeat(61) },
    });
    const errors = await validate(dto);
    const nested = errors.find((e) => e.property === 'addressDetails');
    expect(nested?.children?.[0]?.constraints).toHaveProperty('maxLength');
  });

  it('accepts a normal address', async () => {
    const dto = plainToInstance(AddressDetailsDto, {
      block: '6',
      street: 'شارع أحمد الجابر',
      avenue: '3',
      building: '12',
      landmark: 'بجانب الجمعية',
    });
    expect(await validate(dto)).toHaveLength(0);
  });
});
