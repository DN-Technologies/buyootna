import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  MAX_SAVED_LOCATIONS,
  SavedLocationsService,
} from '../saved-locations.service';

type WriteArgs = { where?: unknown; data: Record<string, unknown> };
const firstArg = (mock: jest.Mock) => (mock.mock.calls as [WriteArgs][])[0][0];

describe('SavedLocationsService', () => {
  const prisma = {
    savedLocation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const service = new SavedLocationsService(prisma as unknown as PrismaService);
  const home = {
    label: 'HOME' as const,
    address: 'السالمية، قطعة 6',
    latitude: 29.33,
    longitude: 48.07,
    details: { block: '6', street: ' شارع 10 ', building: '' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.savedLocation.count.mockResolvedValue(0);
  });

  it('lists المنزل and العمل before custom places', async () => {
    prisma.savedLocation.findMany.mockResolvedValue([
      { id: 'o', label: 'OTHER' },
      { id: 'w', label: 'WORK' },
      { id: 'h', label: 'HOME' },
    ]);
    const list = await service.list('u1');
    expect(list.map((l) => l.id)).toEqual(['h', 'w', 'o']);
  });

  it('saves a place with only the filled address details', async () => {
    prisma.savedLocation.findFirst.mockResolvedValue(null);

    await service.create('u1', home);

    expect(firstArg(prisma.savedLocation.create).data).toMatchObject({
      userId: 'u1',
      label: 'HOME',
      name: null,
      details: { block: '6', street: 'شارع 10' },
    });
  });

  it('a second المنزل replaces the first', async () => {
    prisma.savedLocation.findFirst.mockResolvedValue({ id: 'old-home' });

    await service.create('u1', home);

    expect(firstArg(prisma.savedLocation.update).where).toEqual({
      id: 'old-home',
    });
    expect(prisma.savedLocation.create).not.toHaveBeenCalled();
  });

  it('a custom place needs a name', async () => {
    await expect(
      service.create('u1', { ...home, label: 'OTHER' }),
    ).rejects.toThrow('اكتب اسماً للموقع');
  });

  it(`stops at ${MAX_SAVED_LOCATIONS} places`, async () => {
    prisma.savedLocation.count.mockResolvedValue(MAX_SAVED_LOCATIONS);
    await expect(
      service.create('u1', { ...home, label: 'OTHER', name: 'بيت الأهل' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('no details clears the column', async () => {
    prisma.savedLocation.findFirst.mockResolvedValue(null);
    await service.create('u1', { ...home, details: undefined });
    expect(firstArg(prisma.savedLocation.create).data.details).toBe(
      Prisma.DbNull,
    );
  });

  it("someone else's place is not found", async () => {
    prisma.savedLocation.findFirst.mockResolvedValue(null);
    await expect(service.remove('u1', 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.update('u1', 'x', { name: 'y' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.savedLocation.delete).not.toHaveBeenCalled();
  });

  it('relabelling to العمل replaces the current العمل', async () => {
    prisma.savedLocation.findFirst.mockResolvedValue({
      id: 'p1',
      label: 'OTHER',
      name: 'مكتب',
    });

    await service.update('u1', 'p1', { label: 'WORK' });

    expect(prisma.savedLocation.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1', label: 'WORK', NOT: { id: 'p1' } },
    });
    expect(firstArg(prisma.savedLocation.update).data).toMatchObject({
      label: 'WORK',
      name: null,
    });
  });
});
