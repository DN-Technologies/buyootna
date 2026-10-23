import type { AdminService } from './admin.service';
import { setupAdminService } from './admin.service.harness';

describe('AdminService facade: reports and moderated listings', () => {
  const harness = setupAdminService();
  const { adminReportsService, adminPropertiesService, adminUsersService } =
    harness;
  let service: AdminService;
  beforeEach(() => {
    service = harness.service;
  });

  it('delegates getReports to AdminReportsService', async () => {
    const filters = { page: 1, limit: 10 };
    const mockResult = { data: [] };
    adminReportsService.getReports.mockResolvedValue(mockResult);

    const result = await service.getReports(filters);

    expect(adminReportsService.getReports).toHaveBeenCalledWith(filters);
    expect(result).toBe(mockResult);
  });

  it('enforceReport removes the content, suspends its author and resolves the report (Guideline 1.2)', async () => {
    adminReportsService.removeReportedContent.mockResolvedValue({
      targetUserId: 'user-2',
      removed: 'PROPERTY',
    });
    adminReportsService.updateReport.mockResolvedValue({ id: 'rep-1' });

    await expect(service.enforceReport('rep-1', 'admin-1')).resolves.toEqual({
      id: 'rep-1',
    });
    expect(adminReportsService.removeReportedContent).toHaveBeenCalledWith(
      'rep-1',
      'admin-1',
    );
    expect(adminUsersService.updateUserStatus).toHaveBeenCalledWith(
      'user-2',
      { status: 'suspended' },
      'admin-1',
    );
    expect(adminReportsService.updateReport).toHaveBeenCalledWith(
      'rep-1',
      { status: 'RESOLVED' },
      'admin-1',
    );
  });

  it('enforceReport with no account on the report only removes and resolves', async () => {
    adminReportsService.removeReportedContent.mockResolvedValue({
      targetUserId: null,
      removed: null,
    });
    await service.enforceReport('rep-1', 'admin-1');
    expect(adminUsersService.updateUserStatus).not.toHaveBeenCalled();
    expect(adminReportsService.updateReport).toHaveBeenCalled();
  });

  it('delegates getReportById to AdminReportsService', async () => {
    const mockResult = { id: 'rep-1' };
    adminReportsService.getReportById.mockResolvedValue(mockResult);

    const result = await service.getReportById('rep-1');

    expect(adminReportsService.getReportById).toHaveBeenCalledWith('rep-1');
    expect(result).toBe(mockResult);
  });

  it('delegates updateReport to AdminReportsService', async () => {
    const dto = { status: 'RESOLVED' as const };
    const mockResult = { id: 'rep-1', status: 'RESOLVED' };
    adminReportsService.updateReport.mockResolvedValue(mockResult);

    const result = await service.updateReport('rep-1', dto, 'admin-1');

    expect(adminReportsService.updateReport).toHaveBeenCalledWith(
      'rep-1',
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates resolveReports to AdminReportsService', async () => {
    const mockResult = { updatedCount: 2 };
    adminReportsService.resolveReports.mockResolvedValue(mockResult);

    const result = await service.resolveReports(['rep-1', 'rep-2'], 'admin-1');

    expect(adminReportsService.resolveReports).toHaveBeenCalledWith(
      ['rep-1', 'rep-2'],
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates dismissReports to AdminReportsService', async () => {
    const mockResult = { updatedCount: 1 };
    adminReportsService.dismissReports.mockResolvedValue(mockResult);

    const result = await service.dismissReports(['rep-1'], 'admin-1');

    expect(adminReportsService.dismissReports).toHaveBeenCalledWith(
      ['rep-1'],
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates getReportsForUser to AdminReportsService', async () => {
    const filters = { page: 1, limit: 10 };
    const mockResult = { data: [] };
    adminReportsService.getReportsForUser.mockResolvedValue(mockResult);

    const result = await service.getReportsForUser('u-1', filters);

    expect(adminReportsService.getReportsForUser).toHaveBeenCalledWith(
      'u-1',
      filters,
    );
    expect(result).toBe(mockResult);
  });

  it('delegates getReportsForProperty to AdminReportsService', async () => {
    const mockResult: any[] = [];
    adminReportsService.getReportsForProperty.mockResolvedValue(mockResult);

    const result = await service.getReportsForProperty('prop-1');

    expect(adminReportsService.getReportsForProperty).toHaveBeenCalledWith(
      'prop-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates removeReportedProperty to AdminReportsService', async () => {
    const mockResult = { message: 'تم حذف الإعلان بنجاح' };
    adminReportsService.removeReportedProperty.mockResolvedValue(mockResult);

    const result = await service.removeReportedProperty(
      'prop-1',
      'مخالفة',
      'admin-1',
    );

    expect(adminReportsService.removeReportedProperty).toHaveBeenCalledWith(
      'prop-1',
      'مخالفة',
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates updateProperty to AdminPropertiesService', async () => {
    const dto = { isHidden: true };
    const mockResult = { id: 'prop-1', isHidden: true };
    adminPropertiesService.updateProperty.mockResolvedValue(mockResult);

    const result = await service.updateProperty('prop-1', dto, 'admin-1');

    expect(adminPropertiesService.updateProperty).toHaveBeenCalledWith(
      'prop-1',
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates getAssignableAdmins to AdminReportsService', async () => {
    const mockResult = [{ id: 'admin-1', name: 'أحمد', email: null }];
    adminReportsService.getAssignableAdmins.mockResolvedValue(mockResult);

    const result = await service.getAssignableAdmins();

    expect(adminReportsService.getAssignableAdmins).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResult);
  });
});
