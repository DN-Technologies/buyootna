import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PropertiesQuotaService } from './properties-quota.service';

describe('PropertiesQuotaService.resolvePublishQuota', () => {
  const service = new PropertiesQuotaService({} as PrismaService);

  const silver = {
    id: 'slot-silver',
    adsRemaining: 4,
    plan: {
      name: 'فضية',
      maxImagesPerAd: 10,
      durationDays: 30,
      featuredDays: 5,
      prioritySearch: true,
    },
  };

  const makeTx = (slot: typeof silver | null) => ({
    identity: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'identity-1', userId: 'user-1' }),
    },
    user: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', freeAdsRemaining: 1 }),
      update: jest.fn(),
    },
    userPlanSlot: {
      findMany: jest.fn().mockResolvedValue(slot ? [slot] : []),
      findFirst: jest.fn().mockResolvedValue(slot),
      update: jest.fn(),
    },
  });

  const slotQuery = (tx: ReturnType<typeof makeTx>) =>
    (
      tx.userPlanSlot.findFirst.mock.calls as [
        Prisma.UserPlanSlotFindFirstArgs,
      ][]
    )[0][0].where;

  it('spends a legacy slot owned by the same user (identityId null), featuring the ad', async () => {
    const tx = makeTx(silver);

    const quota = await service.resolvePublishQuota(
      'identity-1',
      'slot-silver',
      3,
      tx as unknown as Prisma.TransactionClient,
    );

    expect(slotQuery(tx)).toMatchObject({
      id: 'slot-silver',
      OR: [
        { identityId: 'identity-1' },
        { identityId: null, userId: 'user-1' },
      ],
    });
    expect(quota).toMatchObject({ planSlotId: 'slot-silver', featuredDays: 5 });
    expect(tx.userPlanSlot.update).toHaveBeenCalledWith({
      where: { id: 'slot-silver' },
      data: { adsRemaining: 3, status: 'ACTIVE' },
    });
    // The free ad isn't touched when a slot is picked
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it("refuses a slot that isn't this identity's or its user's", async () => {
    const tx = makeTx(null);

    await expect(
      service.resolvePublishQuota(
        'identity-1',
        'someone-elses-slot',
        1,
        tx as unknown as Prisma.TransactionClient,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.userPlanSlot.update).not.toHaveBeenCalled();
  });

  it('spends the free ad for FREE_QUOTA', async () => {
    const tx = makeTx(silver);

    const quota = await service.resolvePublishQuota(
      'identity-1',
      'FREE_QUOTA',
      1,
      tx as unknown as Prisma.TransactionClient,
    );

    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { freeAdsRemaining: { decrement: 1 } },
    });
    expect(quota).toMatchObject({ planSlotId: null, featuredDays: 0 });
  });
});
