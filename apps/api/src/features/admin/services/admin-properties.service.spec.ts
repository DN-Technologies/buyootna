import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminPropertiesService } from './admin-properties.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AdminAuditLogService } from './admin-audit-log.service';

describe('AdminPropertiesService', () => {
  let service: AdminPropertiesService;
  let prisma: {
    property: { findUnique: jest.Mock; update: jest.Mock };
  };
  let auditLog: { log: jest.Mock };

  beforeEach(async () => {
    prisma = {
      property: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'prop-1',
          identity: { userId: 'owner-1' },
        }),
        update: jest.fn().mockResolvedValue({ id: 'prop-1' }),
      },
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPropertiesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AdminAuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AdminPropertiesService>(AdminPropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws NotFoundException when the property does not exist', async () => {
    prisma.property.findUnique.mockResolvedValue(null);
    await expect(
      service.updateProperty('missing', { isHidden: true }, 'admin-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('updates only the provided fields', async () => {
    await service.updateProperty('prop-1', { isHidden: true }, 'admin-1');

    expect(prisma.property.update).toHaveBeenCalledWith({
      where: { id: 'prop-1' },
      data: { isHidden: true },
    });
  });

  it('logs PROPERTY_HIDDEN when isHidden is set to true', async () => {
    await service.updateProperty('prop-1', { isHidden: true }, 'admin-1');

    expect(auditLog.log).toHaveBeenCalledWith({
      actorAdminId: 'admin-1',
      action: 'PROPERTY_HIDDEN',
      targetType: 'PROPERTY',
      targetId: 'prop-1',
      targetUserId: 'owner-1',
    });
  });

  it('logs PROPERTY_UNHIDDEN when isHidden is set to false', async () => {
    await service.updateProperty('prop-1', { isHidden: false }, 'admin-1');

    expect(auditLog.log).toHaveBeenCalledWith({
      actorAdminId: 'admin-1',
      action: 'PROPERTY_UNHIDDEN',
      targetType: 'PROPERTY',
      targetId: 'prop-1',
      targetUserId: 'owner-1',
    });
  });

  it('logs PROPERTY_FEATURED when isFeatured is set to true', async () => {
    await service.updateProperty('prop-1', { isFeatured: true }, 'admin-1');

    expect(auditLog.log).toHaveBeenCalledWith({
      actorAdminId: 'admin-1',
      action: 'PROPERTY_FEATURED',
      targetType: 'PROPERTY',
      targetId: 'prop-1',
      targetUserId: 'owner-1',
    });
  });

  it('logs PROPERTY_REPUBLISHED when status is set to ACTIVE', async () => {
    await service.updateProperty('prop-1', { status: 'ACTIVE' }, 'admin-1');

    expect(auditLog.log).toHaveBeenCalledWith({
      actorAdminId: 'admin-1',
      action: 'PROPERTY_REPUBLISHED',
      targetType: 'PROPERTY',
      targetId: 'prop-1',
      targetUserId: 'owner-1',
    });
  });

  it('does not log anything when no logged field changes', async () => {
    await service.updateProperty('prop-1', { status: 'DRAFT' }, 'admin-1');
    expect(auditLog.log).not.toHaveBeenCalled();
  });
});
