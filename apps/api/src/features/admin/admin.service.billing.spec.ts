import type { AdminService } from './admin.service';
import { setupAdminService } from './admin.service.harness';

describe('AdminService facade: plans, invoices, coupons and the paid catalogs', () => {
  const harness = setupAdminService();
  const {
    adminCouponService,
    adminPlansService,
    adminInvoicesService,
    adminPlanCatalogService,
    adminFeaturePackagesService,
  } = harness;
  let service: AdminService;
  beforeEach(() => {
    service = harness.service;
  });

  it('delegates getWallet to AdminPlansService', async () => {
    const mockResult = { freeAdsRemaining: 0 };
    adminPlansService.getWallet.mockResolvedValue(mockResult);

    const result = await service.getWallet('u-1', 'i-1');

    expect(adminPlansService.getWallet).toHaveBeenCalledWith('u-1', 'i-1');
    expect(result).toBe(mockResult);
  });

  it('delegates changePlan to AdminPlansService', async () => {
    const dto = { planId: 'plan-1' };
    const mockResult = { freeAdsRemaining: 0 };
    adminPlansService.changePlan.mockResolvedValue(mockResult);

    const result = await service.changePlan('u-1', dto, 'admin-1');

    expect(adminPlansService.changePlan).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates grantExceptionalFeature to AdminPlansService', async () => {
    const dto = { adsCount: 3 };
    const mockResult = { message: 'تم منح المميزات الاستثنائية بنجاح' };
    adminPlansService.grantExceptionalFeature.mockResolvedValue(mockResult);

    const result = await service.grantExceptionalFeature('u-1', dto, 'admin-1');

    expect(adminPlansService.grantExceptionalFeature).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates getInvoicesForUser to AdminInvoicesService', async () => {
    const mockResult: any[] = [];
    adminInvoicesService.getInvoicesForUser.mockResolvedValue(mockResult);

    const result = await service.getInvoicesForUser('u-1', 'i-1');

    expect(adminInvoicesService.getInvoicesForUser).toHaveBeenCalledWith(
      'u-1',
      'i-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates getCouponHistoryForUser to AdminInvoicesService', async () => {
    const mockResult: any[] = [];
    adminInvoicesService.getCouponHistoryForUser.mockResolvedValue(mockResult);

    const result = await service.getCouponHistoryForUser('u-1');

    expect(adminInvoicesService.getCouponHistoryForUser).toHaveBeenCalledWith(
      'u-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates getAvailableCoupons to AdminCouponService', () => {
    const mockCoupons = [{ id: 'c1', name: 'Coupon 1' }];
    adminCouponService.getAvailableCoupons.mockReturnValue(mockCoupons);

    const result = service.getAvailableCoupons();

    expect(adminCouponService.getAvailableCoupons).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockCoupons);
  });

  it('delegates grantCoupon to AdminCouponService', async () => {
    const dto = { couponCode: 'PROMO10' };
    const mockResult = { message: 'تم المنح' };
    adminCouponService.grantCoupon.mockResolvedValue(mockResult);

    const result = await service.grantCoupon('u-1', dto, 'admin-1');

    expect(adminCouponService.grantCoupon).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates grantBulkCoupon to AdminCouponService', async () => {
    const dto = { userIds: ['u1', 'u2'], couponCode: 'PROMO10' };
    const mockResult = { grantedCount: 2 };
    adminCouponService.grantBulkCoupon.mockResolvedValue(mockResult);

    const result = await service.grantBulkCoupon(dto, 'admin-1');

    expect(adminCouponService.grantBulkCoupon).toHaveBeenCalledWith(
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates the plan catalog to AdminPlanCatalogService', async () => {
    await service.getPlanCatalog();
    await service.updatePlan('plan-1', { price: 3 }, 'admin-1');
    expect(adminPlanCatalogService.list).toHaveBeenCalled();
    expect(adminPlanCatalogService.update).toHaveBeenCalledWith(
      'plan-1',
      { price: 3 },
      'admin-1',
    );
  });

  it('delegates list/create/update to AdminFeaturePackagesService', async () => {
    adminFeaturePackagesService.list.mockResolvedValue([]);
    adminFeaturePackagesService.create.mockResolvedValue({ id: 'p' });
    adminFeaturePackagesService.update.mockResolvedValue({ id: 'p' });
    const dto = { label: 'تمييز ليوم', durationDays: 1, price: 1 };

    await service.getFeaturePackages();
    await service.createFeaturePackage(dto, 'admin-1');
    await service.updateFeaturePackage('p', { price: 2 }, 'admin-1');

    expect(adminFeaturePackagesService.list).toHaveBeenCalled();
    expect(adminFeaturePackagesService.create).toHaveBeenCalledWith(
      dto,
      'admin-1',
    );
    expect(adminFeaturePackagesService.update).toHaveBeenCalledWith(
      'p',
      { price: 2 },
      'admin-1',
    );
  });
});
