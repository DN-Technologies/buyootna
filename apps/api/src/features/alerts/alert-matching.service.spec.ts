import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AlertMatchingService } from './alert-matching.service';

describe('AlertMatchingService', () => {
  let service: AlertMatchingService;

  const prisma = {
    property: { findUnique: jest.fn() },
    alert: { findMany: jest.fn(), updateMany: jest.fn() },
    alertMatch: { findMany: jest.fn(), createMany: jest.fn() },
    notificationPreferences: { findMany: jest.fn() },
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
  };
  const notifications = { create: jest.fn() };

  const listing = {
    id: 'prop-1',
    status: 'ACTIVE',
    type: 'RENT',
    category: 'APARTMENT',
    governorateId: 'hawally',
    areaId: 'hawally_1',
    area: { name: 'السلام' },
    location: 'حولي',
    identityId: 'owner-identity',
    price: 450,
    areaSize: 120,
    beds: 3,
    baths: 2,
    floors: 1,
    requestYear: null,
    requiredYear: null,
    startDate: null,
  };

  const rentAlert = (id: string, userId: string, overrides = {}) => ({
    id,
    identityId: `identity-${userId}`,
    identity: { userId },
    type: 'PROPERTIES',
    operationType: 'RENT',
    governorateId: 'hawally',
    areaId: null,
    categoryId: null,
    price: null,
    rentValue: 500,
    areaSize: null,
    rooms: null,
    baths: null,
    floors: null,
    requestYear: null,
    requiredYear: null,
    startDate: null,
    endDate: null,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.property.findUnique.mockResolvedValue(listing);
    prisma.alertMatch.findMany.mockResolvedValue([]);
    prisma.notificationPreferences.findMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertMatchingService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();
    service = module.get(AlertMatchingService);
  });

  it('only considers active alerts of the right type and governorate, excluding the owner', async () => {
    prisma.alert.findMany.mockResolvedValue([]);

    await service.notifyMatchesForProperty('prop-1');

    expect(prisma.alert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          type: 'PROPERTIES',
          governorateId: 'hawally',
          identityId: { not: 'owner-identity' },
        },
      }),
    );
  });

  it('records matches, stamps lastMatchedAt, and notifies each user once', async () => {
    prisma.alert.findMany.mockResolvedValue([
      rentAlert('a1', 'user-1'),
      rentAlert('a2', 'user-1'), // same user, second alert
      rentAlert('a3', 'user-2'),
      rentAlert('a4', 'user-3', { rentValue: 300 }), // too cheap: no match
    ]);

    await service.notifyMatchesForProperty('prop-1');

    expect(prisma.alertMatch.createMany).toHaveBeenCalledWith({
      data: [
        { alertId: 'a1', propertyId: 'prop-1' },
        { alertId: 'a2', propertyId: 'prop-1' },
        { alertId: 'a3', propertyId: 'prop-1' },
      ],
      skipDuplicates: true,
    });
    expect(prisma.alert.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['a1', 'a2', 'a3'] } },
      data: { lastMatchedAt: expect.any(Date) },
    });
    expect(notifications.create).toHaveBeenCalledTimes(2);
    expect(notifications.create).toHaveBeenCalledWith({
      userId: 'user-1',
      identityId: 'identity-user-1',
      type: 'ALERT_MATCH',
      title: 'تطابق جديد لتنبيهك',
      body: 'شقة للإيجار في السلام',
    });
  });

  it('does not notify again for alerts that already matched this listing', async () => {
    prisma.alert.findMany.mockResolvedValue([rentAlert('a1', 'user-1')]);
    prisma.alertMatch.findMany.mockResolvedValue([{ alertId: 'a1' }]);

    await service.notifyMatchesForProperty('prop-1');

    expect(prisma.alertMatch.createMany).not.toHaveBeenCalled();
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('skips users who turned off in-app notifications', async () => {
    prisma.alert.findMany.mockResolvedValue([
      rentAlert('a1', 'user-1'),
      rentAlert('a2', 'user-2'),
    ]);
    prisma.notificationPreferences.findMany.mockResolvedValue([
      { userId: 'user-2' },
    ]);

    await service.notifyMatchesForProperty('prop-1');

    // The match is still recorded for the muted user's card
    expect(prisma.alertMatch.createMany).toHaveBeenCalled();
    expect(notifications.create).toHaveBeenCalledTimes(1);
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' }),
    );
  });

  it('ignores listings that are not active', async () => {
    prisma.property.findUnique.mockResolvedValue({
      ...listing,
      status: 'DRAFT',
    });

    await service.notifyMatchesForProperty('prop-1');

    expect(prisma.alert.findMany).not.toHaveBeenCalled();
  });

  it('never throws, so publishing is unaffected by matching errors', async () => {
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    prisma.alert.findMany.mockRejectedValue(new Error('db down'));

    await expect(
      service.notifyMatchesForProperty('prop-1'),
    ).resolves.toBeUndefined();
  });
});
