import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PrismaService } from '../../core/prisma/prisma.service';
import { GetMapBoundsDto } from './dto/get-map-bounds.dto';
import { MapService } from './map.service';

const bounds = { ne_lat: 30, ne_lng: 49, sw_lat: 28, sw_lng: 47 };

describe('MapService location filter', () => {
  let prisma: {
    property: { findMany: jest.Mock };
    companyIdentityData: { findMany: jest.Mock };
    governorate: { findMany: jest.Mock };
    area: { findMany: jest.Mock };
  };
  let service: MapService;

  const propertyWhere = () =>
    (
      prisma.property.findMany.mock.calls[0] as [
        { where: Record<string, unknown> },
      ]
    )[0].where;
  const companyWhere = () =>
    (
      prisma.companyIdentityData.findMany.mock.calls[0] as [
        { where: { AND?: { OR: unknown[] }[] } },
      ]
    )[0].where;

  beforeEach(() => {
    prisma = {
      property: { findMany: jest.fn().mockResolvedValue([]) },
      companyIdentityData: { findMany: jest.fn().mockResolvedValue([]) },
      governorate: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ name: 'حولي' }, { name: 'الجهراء' }]),
      },
      area: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ name: 'القرين' }, { name: 'العدان' }]),
      },
    };
    service = new MapService(prisma as unknown as PrismaService);
  });

  it('reads several ids from a comma-separated or repeated query param', () => {
    const dto = plainToInstance(GetMapBoundsDto, {
      ...bounds,
      governorateIds: 'g1,g2',
      areaIds: ['a1', 'a2,a3'],
    });
    expect(validateSync(dto)).toEqual([]);
    expect(dto.governorateIds).toEqual(['g1', 'g2']);
    expect(dto.areaIds).toEqual(['a1', 'a2', 'a3']);
  });

  it('shows ads in any of the chosen governorates', async () => {
    await service.discover({
      ...bounds,
      type: 'sell',
      governorateIds: ['g1', 'g2'],
    });
    expect(propertyWhere().governorateId).toEqual({ in: ['g1', 'g2'] });
    expect(propertyWhere()).not.toHaveProperty('areaId');
  });

  it('narrows to the chosen areas when areas are picked', async () => {
    await service.discover({
      ...bounds,
      type: 'rent',
      governorateIds: ['g1'],
      areaIds: ['a1', 'a2'],
    });
    expect(propertyWhere().areaId).toEqual({ in: ['a1', 'a2'] });
    expect(propertyWhere()).not.toHaveProperty('governorateId');
  });

  it('still accepts the single governorateId/areaId older app builds send', async () => {
    await service.discover({ ...bounds, type: 'sell', governorateId: 'g1' });
    expect(propertyWhere().governorateId).toEqual({ in: ['g1'] });
  });

  it('matches companies based in or serving any chosen area', async () => {
    await service.discover({
      ...bounds,
      type: 'company',
      areaIds: ['a1', 'a2'],
    });
    const or = companyWhere().AND?.[0].OR ?? [];
    expect(or).toEqual(
      expect.arrayContaining([
        { hqLocation: { contains: 'القرين', mode: 'insensitive' } },
        { serviceAreas: { contains: 'العدان', mode: 'insensitive' } },
      ]),
    );
    expect(prisma.governorate.findMany).not.toHaveBeenCalled();
  });

  it('applies no location filter when nothing is chosen', async () => {
    await service.discover({ ...bounds, type: 'sell' });
    expect(propertyWhere()).not.toHaveProperty('governorateId');
    expect(propertyWhere()).not.toHaveProperty('areaId');
  });
});
