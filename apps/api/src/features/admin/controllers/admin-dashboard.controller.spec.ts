import { Role } from '@prisma/client';
import type { Response } from 'express';
import { AdminDashboardController } from './admin-dashboard.controller';
import { setupAdminControllers } from './admin.controller.harness';

describe('AdminDashboardController', () => {
  const harness = setupAdminControllers();
  let controller: AdminDashboardController;
  let adminService: typeof harness.adminService;
  beforeEach(() => {
    controller = harness.get(AdminDashboardController);
    adminService = harness.adminService;
  });

  it('exportUsers should set headers and return CSV string', async () => {
    adminService.exportUsersCsv.mockResolvedValue('csv-content');
    const mockSetHeader = jest.fn();
    const mockRes = {
      setHeader: mockSetHeader,
    } as unknown as Response;

    const result = await controller.exportUsers(
      { role: Role.INDIVIDUAL },
      mockRes,
    );

    expect(adminService.exportUsersCsv).toHaveBeenCalled();
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="buyootna-users.csv"',
    );
    expect(result).toBe('csv-content');
  });
});
