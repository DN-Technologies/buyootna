import { PlanSlotsExpiryService } from './plan-slots-expiry.service';

describe('PlanSlotsExpiryService', () => {
  it('marks active credits past their validity EXPIRED', async () => {
    const prisma = {
      userPlanSlot: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
    };
    const service = new PlanSlotsExpiryService(prisma as never);
    const now = new Date('2026-11-11T10:00:00Z');

    await expect(service.expireDue(now)).resolves.toBe(2);
    expect(prisma.userPlanSlot.updateMany).toHaveBeenCalledWith({
      where: { status: 'ACTIVE', expiresAt: { lte: now } },
      data: { status: 'EXPIRED' },
    });
  });
});
