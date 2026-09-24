import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import type { RequestUser } from '../auth/strategies/jwt.strategy';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: { create: jest.Mock };

  beforeEach(async () => {
    reportsService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: reportsService }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should forward reqUser, targetUserId, and dto to the service', async () => {
    const reqUser = {
      userId: 'user-1',
      identityId: 'ident-1',
    } as RequestUser;
    const dto = { reason: 'معلومات غير صحيحة' };
    reportsService.create.mockResolvedValue({ message: 'تم الإرسال' });

    const result = await controller.create(reqUser, 'user-2', dto);

    expect(reportsService.create).toHaveBeenCalledWith(
      'user-1',
      'ident-1',
      'user-2',
      dto,
    );
    expect(result.message).toBe('تم الإرسال');
  });
});
