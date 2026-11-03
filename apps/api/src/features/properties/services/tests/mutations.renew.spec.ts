import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import {
  AD,
  DAY_MS,
  OWNER,
  setupMutationsService,
  SILVER_QUOTA,
} from './mutations.harness';

describe('PropertiesMutationsService.renew', () => {
  const h = setupMutationsService();

  beforeEach(() => {
    h.property.update.mockResolvedValue({ id: AD, status: 'ACTIVE' });
    h.quotaService.resolvePublishQuota.mockResolvedValue(SILVER_QUOTA);
  });

  // Two photos, so the quota is asked for two
  const ownedWithPhotos = (status: string) =>
    h.owned(status, { images: ['a.jpg', 'b.jpg'] });

  it.each(['EXPIRED', 'CLOSED'])(
    'republishes a %s ad with the picked credit and fresh dates',
    async (status) => {
      ownedWithPhotos(status);
      const before = Date.now();

      const result = await h.service.renew(OWNER, AD, 'slot-silver');

      expect(h.property.updateMany).toHaveBeenCalledWith({
        where: { id: AD, status: { in: ['EXPIRED', 'CLOSED'] } },
        data: { status: 'ACTIVE' },
      });
      expect(h.quotaService.resolvePublishQuota).toHaveBeenCalledWith(
        OWNER,
        'slot-silver',
        2,
        expect.anything(),
      );
      const data = h.updated()[0] as {
        publishedAt: Date;
        endDate: Date;
        featuredUntil: Date | null;
      };
      expect(data).toMatchObject({
        status: 'ACTIVE',
        planSlotId: 'slot-silver',
        isFeatured: true,
        isPriority: true,
      });
      expect(data.publishedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(data.endDate.getTime() - data.publishedAt.getTime()).toBe(
        30 * DAY_MS,
      );
      expect(data.featuredUntil!.getTime() - data.publishedAt.getTime()).toBe(
        5 * DAY_MS,
      );
      expect(result.message).toBe('تم تجديد نشر الإعلان بنجاح');
      expect(h.alertMatching.notifyMatchesForProperty).toHaveBeenCalledWith(AD);
    },
  );

  it.each(['ACTIVE', 'DRAFT'])(
    'refuses a %s ad without spending a credit',
    async (status) => {
      ownedWithPhotos(status);

      await expect(h.service.renew(OWNER, AD)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(h.quotaService.resolvePublishQuota).not.toHaveBeenCalled();
      expect(h.property.updateMany).not.toHaveBeenCalled();
    },
  );

  it('refuses a second, concurrent republish without spending a credit', async () => {
    ownedWithPhotos('EXPIRED');
    h.property.updateMany.mockResolvedValue({ count: 0 });

    await expect(h.service.renew(OWNER, AD)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(h.quotaService.resolvePublishQuota).not.toHaveBeenCalled();
    expect(h.property.update).not.toHaveBeenCalled();
    expect(h.alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });

  it('lets a spending failure abort the republish (the transaction rolls back)', async () => {
    ownedWithPhotos('EXPIRED');
    h.quotaService.resolvePublishQuota.mockRejectedValue(
      new ForbiddenException('ليس لديك رصيد إعلانات نشط.'),
    );

    await expect(h.service.renew(OWNER, AD)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(h.property.update).not.toHaveBeenCalled();
    expect(h.alertMatching.notifyMatchesForProperty).not.toHaveBeenCalled();
  });
});
