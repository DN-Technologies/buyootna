import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { AdminModerationController } from './admin-moderation.controller';
import { setupAdminControllers } from './admin.controller.harness';

const ADMIN_REQ_USER = { userId: 'admin-1' } as RequestUser;

describe('AdminModerationController', () => {
  const harness = setupAdminControllers();
  let controller: AdminModerationController;
  let adminService: typeof harness.adminService;
  beforeEach(() => {
    controller = harness.get(AdminModerationController);
    adminService = harness.adminService;
  });

  it('getReports should forward filters to service', async () => {
    const filters = { status: 'PENDING' as const, page: 1, limit: 10 };
    adminService.getReports.mockResolvedValue({ data: [] });

    await controller.getReports(filters);
    expect(adminService.getReports).toHaveBeenCalledWith(filters);
  });

  it('getReportById should forward id to service', async () => {
    adminService.getReportById.mockResolvedValue({ id: 'rep-1' });
    const result = await controller.getReportById('rep-1');
    expect(adminService.getReportById).toHaveBeenCalledWith('rep-1');
    expect(result.id).toBe('rep-1');
  });

  it('updateReport should forward reqUser, id, and dto to service', async () => {
    const dto = { status: 'RESOLVED' as const };
    adminService.updateReport.mockResolvedValue({ id: 'rep-1' });

    await controller.updateReport(ADMIN_REQ_USER, 'rep-1', dto);
    expect(adminService.updateReport).toHaveBeenCalledWith(
      'rep-1',
      dto,
      'admin-1',
    );
  });

  it('bulkResolveReports should forward reqUser and ids to service', async () => {
    adminService.resolveReports.mockResolvedValue({ updatedCount: 2 });

    await controller.bulkResolveReports(ADMIN_REQ_USER, {
      ids: ['rep-1', 'rep-2'],
    });
    expect(adminService.resolveReports).toHaveBeenCalledWith(
      ['rep-1', 'rep-2'],
      'admin-1',
    );
  });

  it('bulkDismissReports should forward reqUser and ids to service', async () => {
    adminService.dismissReports.mockResolvedValue({ updatedCount: 1 });

    await controller.bulkDismissReports(ADMIN_REQ_USER, { ids: ['rep-1'] });
    expect(adminService.dismissReports).toHaveBeenCalledWith(
      ['rep-1'],
      'admin-1',
    );
  });

  it('getReportsForUser should forward id and filters to service', async () => {
    const filters = { page: 1, limit: 10 };
    adminService.getReportsForUser.mockResolvedValue({ data: [] });

    await controller.getReportsForUser('u-1', filters);
    expect(adminService.getReportsForUser).toHaveBeenCalledWith('u-1', filters);
  });

  it('getReportsForProperty should forward id to service', async () => {
    adminService.getReportsForProperty.mockResolvedValue([]);
    await controller.getReportsForProperty('prop-1');
    expect(adminService.getReportsForProperty).toHaveBeenCalledWith('prop-1');
  });

  it('removeReportedProperty should forward id, reason and adminUserId to service', async () => {
    adminService.removeReportedProperty.mockResolvedValue({
      message: 'تم حذف الإعلان بنجاح',
    });

    await controller.removeReportedProperty(ADMIN_REQ_USER, 'prop-1', {
      reason: 'مخالفة',
    });
    expect(adminService.removeReportedProperty).toHaveBeenCalledWith(
      'prop-1',
      'مخالفة',
      'admin-1',
    );
  });

  it('updateProperty should forward id, dto and adminUserId to service', async () => {
    adminService.updateProperty.mockResolvedValue({ id: 'prop-1' });

    const dto = { isHidden: true };
    await controller.updateProperty(ADMIN_REQ_USER, 'prop-1', dto);
    expect(adminService.updateProperty).toHaveBeenCalledWith(
      'prop-1',
      dto,
      'admin-1',
    );
  });

  it('getAssignableAdmins should delegate to service', async () => {
    adminService.getAssignableAdmins.mockResolvedValue([
      { id: 'admin-1', name: 'أحمد', email: null },
    ]);

    const result = await controller.getAssignableAdmins();
    expect(adminService.getAssignableAdmins).toHaveBeenCalledTimes(1);
    expect(result[0].id).toBe('admin-1');
  });
});
