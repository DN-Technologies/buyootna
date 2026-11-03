import 'reflect-metadata';

import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { BulkPropertiesDto } from '../dto/bulk-properties.dto';
import { PropertiesMutationsService } from './properties-mutations.service';

const ID = '11111111-1111-4111-8111-111111111111';

describe('PropertiesMutationsService close and bulk', () => {
  const prisma = {
    property: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  // Only the parts close / bulk touch
  const service = Object.create(
    PropertiesMutationsService.prototype,
  ) as PropertiesMutationsService;
  Object.assign(service, { prisma });

  beforeEach(() => {
    jest.resetAllMocks();
    jest
      .spyOn(service, 'verifyOwnership')
      .mockResolvedValue({ id: ID } as never);
  });

  describe('close (تم البيع)', () => {
    it('moves a live ad of the owner to the archive', async () => {
      prisma.property.updateMany.mockResolvedValue({ count: 1 });

      await service.close('office', ID);

      expect(service.verifyOwnership).toHaveBeenCalledWith('office', ID);
      expect(prisma.property.updateMany).toHaveBeenCalledWith({
        where: { id: ID, identityId: 'office', status: 'ACTIVE' },
        data: { status: 'CLOSED' },
      });
    });

    it('refuses an ad that is not live', async () => {
      prisma.property.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.close('office', ID)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('bulk', () => {
    it.each([
      ['hide', true],
      ['show', false],
    ] as const)('%s: only the caller’s own ads', async (action, isHidden) => {
      prisma.property.updateMany.mockResolvedValue({ count: 2 });

      expect(await service.bulk('office', action, [ID, 'x'])).toEqual({
        count: 2,
      });
      expect(prisma.property.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [ID, 'x'] }, identityId: 'office' },
        data: { isHidden },
      });
    });

    it('delete: only the caller’s own ads', async () => {
      prisma.property.deleteMany.mockResolvedValue({ count: 1 });

      expect(await service.bulk('office', 'delete', [ID])).toEqual({
        count: 1,
      });
      expect(prisma.property.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [ID] }, identityId: 'office' },
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
