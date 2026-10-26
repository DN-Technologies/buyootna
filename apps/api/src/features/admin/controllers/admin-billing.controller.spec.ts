import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { AdminBillingController } from './admin-billing.controller';
import { setupAdminControllers } from './admin.controller.harness';

const ADMIN_REQ_USER = { userId: 'admin-1' } as RequestUser;

describe('AdminBillingController', () => {
  const harness = setupAdminControllers();
  let controller: AdminBillingController;
  let adminService: typeof harness.adminService;
  beforeEach(() => {
    controller = harness.get(AdminBillingController);
    adminService = harness.adminService;
  });

  it('getWallet should forward id and identityId to service', async () => {
    adminService.getWallet.mockResolvedValue({ freeAdsRemaining: 0 });
    await controller.getWallet('u-1', { identityId: 'i-1' });
    expect(adminService.getWallet).toHaveBeenCalledWith('u-1', 'i-1');
  });

  it('changePlan should forward id, dto and adminUserId to service', async () => {
    adminService.changePlan.mockResolvedValue({});
    const dto = { planId: 'plan-1' };
    await controller.changePlan(ADMIN_REQ_USER, 'u-1', dto);
    expect(adminService.changePlan).toHaveBeenCalledWith('u-1', dto, 'admin-1');
  });

  it('grantExceptionalFeature should forward id, dto and adminUserId to service', async () => {
    adminService.grantExceptionalFeature.mockResolvedValue({ message: 'ok' });
    const dto = { adsCount: 3 };
    await controller.grantExceptionalFeature(ADMIN_REQ_USER, 'u-1', dto);
    expect(adminService.grantExceptionalFeature).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
  });

  it('getInvoicesForUser should forward id and identityId to service', async () => {
    adminService.getInvoicesForUser.mockResolvedValue([]);
    await controller.getInvoicesForUser('u-1', {});
    expect(adminService.getInvoicesForUser).toHaveBeenCalledWith(
      'u-1',
      undefined,
    );
  });

  it('getCouponHistoryForUser should forward id to service', async () => {
    adminService.getCouponHistoryForUser.mockResolvedValue([]);
    await controller.getCouponHistoryForUser('u-1');
    expect(adminService.getCouponHistoryForUser).toHaveBeenCalledWith('u-1');
  });

  it('getAvailableCoupons should delegate to service', () => {
    adminService.getAvailableCoupons.mockReturnValue([
      { id: 'c1', name: 'Byoutna10', code: 'LAUNCHPROMO26', discount: '10%' },
    ]);
    const result = controller.getAvailableCoupons();
    expect(adminService.getAvailableCoupons).toHaveBeenCalled();
    expect(result[0].code).toBe('LAUNCHPROMO26');
  });

  it('grantCoupon should forward params, dto and adminUserId to service', async () => {
    adminService.grantCoupon.mockResolvedValue({
      message: 'تم اضافة كوبون خصم للمستخدم “على البالي” بنجاح.',
    });
    const dto = { couponCode: 'LAUNCHPROMO26', couponName: 'Byoutna10' };
    const result = await controller.grantCoupon(ADMIN_REQ_USER, 'u-1', dto);
    expect(adminService.grantCoupon).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
    expect(result.message).toContain('تم اضافة كوبون خصم للمستخدم');
  });

  it('grantBulkCoupon should forward dto and adminUserId to service', async () => {
    adminService.grantBulkCoupon.mockResolvedValue({
      message: 'تم اضافة كوبون خصم لـ 2 مستخدمين بنجاح.',
      grantedCount: 2,
    });
    const dto = {
      userIds: ['u-1', 'u-2'],
      couponCode: 'LAUNCHPROMO26',
      couponName: 'Byoutna10',
    };
    const result = await controller.grantBulkCoupon(ADMIN_REQ_USER, dto);
    expect(adminService.grantBulkCoupon).toHaveBeenCalledWith(dto, 'admin-1');
    expect(result.grantedCount).toBe(2);
  });
});
