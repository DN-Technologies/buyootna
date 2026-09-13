import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';
import { UserAccountStatusAction } from './dto/admin-update-status.dto';
import type { Response } from 'express';

interface MockAdminService {
  getUsers: jest.Mock;
  getUserById: jest.Mock;
  createIndividual: jest.Mock;
  exportUsersCsv: jest.Mock;
  updateUserStatus: jest.Mock;
  deleteUser: jest.Mock;
  updateIdentityStatus: jest.Mock;
}

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: MockAdminService;

  beforeEach(async () => {
    adminService = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      createIndividual: jest.fn(),
      exportUsersCsv: jest.fn(),
      updateUserStatus: jest.fn(),
      deleteUser: jest.fn(),
      updateIdentityStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: adminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getUsers should forward filters to service', async () => {
    const filters = { role: Role.INDIVIDUAL, page: 1, limit: 10 };
    adminService.getUsers.mockResolvedValue({ data: [] });

    await controller.getUsers(filters);
    expect(adminService.getUsers).toHaveBeenCalledWith(filters);
  });

  it('createIndividual should forward dto to service', async () => {
    const dto = { name: 'عمر المطيري', email: 'omar@example.com' };
    adminService.createIndividual.mockResolvedValue({ message: 'Success' });

    const result = await controller.createIndividual(dto);
    expect(adminService.createIndividual).toHaveBeenCalledWith(dto);
    expect(result.message).toBe('Success');
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

  it('updateUserStatus should forward params and dto', async () => {
    adminService.updateUserStatus.mockResolvedValue({ message: 'Updated' });
    await controller.updateUserStatus('u-1', {
      status: UserAccountStatusAction.ACTIVE,
    });
    expect(adminService.updateUserStatus).toHaveBeenCalledWith('u-1', {
      status: UserAccountStatusAction.ACTIVE,
    });
  });

  it('deleteUser should forward id to service', async () => {
    adminService.deleteUser.mockResolvedValue({ message: 'Deleted' });
    await controller.deleteUser('u-1');
    expect(adminService.deleteUser).toHaveBeenCalledWith('u-1');
  });
});
