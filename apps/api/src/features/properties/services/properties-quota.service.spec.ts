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

  // What the slot id points at when it can't be spent (for the message)
  type StoredSlot = {
    identityId: string;
    status: string;
    adsRemaining: number;
    identity: { userId: string };
  } | null;

  const makeTx = (
    slot: typeof silver | null,
    freeAdsRemaining = 1,
    stored: StoredSlot = null,
  ) => ({
    identity: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'identity-1',
        userId: 'user-1',
        freeAdsRemaining,
      }),
      // The conditional free-ad decrement: 1 row when one was left
      updateMany: jest
        .fn()
        .mockResolvedValue({ count: freeAdsRemaining > 0 ? 1 : 0 }),
    },
    userPlanSlot: {
      findMany: jest.fn().mockResolvedValue(slot ? [slot] : []),
      findFirst: jest.fn().mockResolvedValue(slot),
      findUnique: jest.fn().mockResolvedValue(stored),
      update: jest.fn(),
    },
  });

  const slotQuery = (tx: ReturnType<typeof makeTx>) =>
    (
      tx.userPlanSlot.findFirst.mock.calls as [
        Prisma.UserPlanSlotFindFirstArgs,
      ][]
    )[0][0].where;

  const resolve = (
    tx: ReturnType<typeof makeTx>,
    slotId: string | undefined,
    images = 1,
  ) =>
    service.resolvePublishQuota(
      'identity-1',
      slotId,
      images,
      tx as unknown as Prisma.TransactionClient,
    );

  it("spends a credit of this persona's own, featuring the ad", async () => {
    const tx = makeTx(silver);

    const quota = await resolve(tx, 'slot-silver', 3);

    // Only this persona's credits: not the same account's other personas'
    expect(slotQuery(tx)).toMatchObject({
      id: 'slot-silver',
      identityId: 'identity-1',
    });
    expect(slotQuery(tx)).not.toHaveProperty('OR');
    expect(quota).toMatchObject({ planSlotId: 'slot-silver', featuredDays: 5 });
    expect(tx.userPlanSlot.update).toHaveBeenCalledWith({
      where: { id: 'slot-silver' },
      data: { adsRemaining: 3, status: 'ACTIVE' },
    });
    // The free ad isn't touched when a slot is picked
    expect(tx.identity.updateMany).not.toHaveBeenCalled();
  });

  it("refuses another account's credit without saying it exists", async () => {
    const tx = makeTx(null, 1, {
      identityId: 'identity-9',
      status: 'ACTIVE',
      adsRemaining: 3,
      identity: { userId: 'user-9' },
    });

    const attempt = resolve(tx, 'someone-elses-slot');
    await expect(attempt).rejects.toBeInstanceOf(ForbiddenException);
    await expect(attempt).rejects.toThrow(
      'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات.',
    );
    expect(tx.userPlanSlot.update).not.toHaveBeenCalled();
  });

  it('tells the user a credit belongs to their other persona', async () => {
    const tx = makeTx(null, 1, {
      identityId: 'identity-company',
      status: 'ACTIVE',
      adsRemaining: 3,
      identity: { userId: 'user-1' },
    });

    const attempt = resolve(tx, 'company-slot');
    await expect(attempt).rejects.toThrow(
      'هذه الباقة تابعة لحساب آخر لديك (فرد/شركة). بدّل الحساب للنشر منها.',
    );
    // Tells the app to offer the packages still available
    await expect(attempt).rejects.toMatchObject({
      response: { code: 'PACKAGE_UNUSABLE' },
    });
    expect(tx.userPlanSlot.update).not.toHaveBeenCalled();
  });

  it('tells the user a used-up credit has no ads left', async () => {
    const tx = makeTx(null, 1, {
      identityId: 'identity-1',
      status: 'EXHAUSTED',
      adsRemaining: 0,
      identity: { userId: 'user-1' },
    });

    await expect(resolve(tx, 'slot-silver')).rejects.toThrow(
      'نفدت إعلانات هذه الباقة.',
    );
  });

  it('refuses an unknown credit id', async () => {
    const tx = makeTx(null);

    await expect(resolve(tx, 'no-such-slot')).rejects.toThrow(
      'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات.',
    );
  });

  it("spends the persona's own free ad for FREE_QUOTA", async () => {
    const tx = makeTx(silver);

    const quota = await resolve(tx, 'FREE_QUOTA');

    expect(tx.identity.updateMany).toHaveBeenCalledWith({
      where: { id: 'identity-1', freeAdsRemaining: { gt: 0 } },
      data: { freeAdsRemaining: { decrement: 1 } },
    });
    expect(quota).toMatchObject({ planSlotId: null, featuredDays: 0 });
  });

  it('refuses FREE_QUOTA once the persona has used its free ad', async () => {
    const tx = makeTx(silver, 0);

    await expect(resolve(tx, 'FREE_QUOTA')).rejects.toThrow(
      'لقد استنفذت الإعلان المجاني الترحيبي الخاص بك.',
    );
  });

  it('uses the free ad by default when no credit is picked and one is left', async () => {
    const tx = makeTx(silver);

    await resolve(tx, undefined);

    expect(tx.identity.updateMany).toHaveBeenCalled();
    expect(tx.userPlanSlot.findMany).not.toHaveBeenCalled();
  });
});
