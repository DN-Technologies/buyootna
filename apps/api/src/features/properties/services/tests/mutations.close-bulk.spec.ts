import 'reflect-metadata';

import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { BulkPropertiesDto } from '../../dto/bulk-properties.dto';
import { AD, setupMutationsService } from './mutations.harness';

const ID = '11111111-1111-4111-8111-111111111111';
const OFFICE = 'office';

describe('PropertiesMutationsService close and bulk', () => {
  const h = setupMutationsService();

  describe('close (تم البيع)', () => {
    it('moves a live ad of the owner to the archive', async () => {
      h.owned('ACTIVE', {}, OFFICE);

      await h.service.close(OFFICE, AD);

      expect(h.property.updateMany).toHaveBeenCalledWith({
        where: { id: AD, identityId: OFFICE, status: 'ACTIVE' },
        data: { status: 'CLOSED' },
      });
    });

    it("refuses someone else's ad, changing nothing", async () => {
      h.owned('ACTIVE', {}, 'another-office');

      await expect(h.service.close(OFFICE, AD)).rejects.toThrow();
      expect(h.property.updateMany).not.toHaveBeenCalled();
    });

    it('refuses an ad that is not live', async () => {
      h.owned('DRAFT', {}, OFFICE);
      h.property.updateMany.mockResolvedValue({ count: 0 });

      await expect(h.service.close(OFFICE, AD)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('bulk', () => {
    it.each([
      ['hide', true],
      ['show', false],
    ] as const)("%s: only the caller's own ads", async (action, isHidden) => {
      h.property.updateMany.mockResolvedValue({ count: 2 });

      expect(await h.service.bulk(OFFICE, action, [ID, 'x'])).toEqual({
        count: 2,
      });
      expect(h.property.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [ID, 'x'] }, identityId: OFFICE },
        data: { isHidden },
      });
    });

    it("delete: only the caller's own ads", async () => {
      h.property.deleteMany.mockResolvedValue({ count: 1 });

      expect(await h.service.bulk(OFFICE, 'delete', [ID])).toEqual({
        count: 1,
      });
      expect(h.property.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [ID] }, identityId: OFFICE },
      });
    });
  });
});

describe('BulkPropertiesDto', () => {
  const errorsOf = async (plain: object) =>
    (await validate(plainToInstance(BulkPropertiesDto, plain))).map(
      (e) => e.property,
    );

  it('takes an action and up to 100 ad ids', async () => {
    expect(await errorsOf({ action: 'hide', ids: [ID] })).toEqual([]);
  });

  it.each([
    ['an unknown action', { action: 'archive', ids: [ID] }, 'action'],
    ['no ids', { action: 'hide', ids: [] }, 'ids'],
    ['a non-id', { action: 'hide', ids: ['abc'] }, 'ids'],
    ['more than 100', { action: 'delete', ids: Array(101).fill(ID) }, 'ids'],
  ])('refuses %s', async (_label, plain, field) => {
    expect(await errorsOf(plain)).toEqual([field]);
  });
});
