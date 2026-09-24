import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminIdentityService } from './admin-identity.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { MailService } from '../../../core/mail/mail.service';
import { AdminAuditLogService } from './admin-audit-log.service';

interface MockPrismaService {
  identity: {
    findUnique: jest.Mock;
  };
  companyIdentityData: {
    update: jest.Mock;
  };
  officeIdentityData: {
    update: jest.Mock;
  };
  reviewRequest: {
    create: jest.Mock;
  };
}

interface MockNotificationsService {
  create: jest.Mock;
}

interface MockMailService {
  sendMail: jest.Mock;
}

describe('AdminIdentityService', () => {
  let service: AdminIdentityService;
  let prisma: MockPrismaService;
  let notifications: MockNotificationsService;
  let mail: MockMailService;
  let auditLog: { log: jest.Mock };

  beforeEach(async () => {
    prisma = {
      identity: {
        findUnique: jest.fn(),
      },
      companyIdentityData: {
        update: jest.fn(),
      },
      officeIdentityData: {
        update: jest.fn(),
      },
      reviewRequest: {
        create: jest.fn().mockResolvedValue({ id: 'review-request-1' }),
      },
    };

    notifications = {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    mail = {
      sendMail: jest.fn().mockResolvedValue({ success: true }),
    };

    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminIdentityService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: NotificationsService,
          useValue: notifications,
        },
        {
          provide: MailService,
          useValue: mail,
        },
        {
          provide: AdminAuditLogService,
          useValue: auditLog,
        },
      ],
    }).compile();

    service = module.get<AdminIdentityService>(AdminIdentityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateIdentityStatus', () => {
    const companyIdentity = {
      id: 'identity-company-1',
      userId: 'user-1',
      type: 'COMPANY',
      companyData: { id: 'company-data-1' },
      officeData: null,
      user: {
        id: 'user-1',
        email: 'company@example.com',
        name: 'شركة الاختبار',
      },
    };

    it('creates a ReviewRequest with the reason when rejecting with one', async () => {
      prisma.identity.findUnique.mockResolvedValue(companyIdentity);

      await service.updateIdentityStatus(
        'identity-company-1',
        {
          status: 'REJECTED',
          reason: 'الرخصة منتهية الصلاحية',
        },
        'admin-1',
      );

      expect(prisma.reviewRequest.create).toHaveBeenCalledWith({
        data: {
          status: 'REJECTED',
          notes: 'الرخصة منتهية الصلاحية',
          companyIdentityDataId: 'company-data-1',
        },
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actorAdminId: 'admin-1',
          action: 'IDENTITY_REJECTED',
          targetType: 'IDENTITY',
          targetId: 'identity-company-1',
          targetUserId: 'user-1',
          metadata: { reason: 'الرخصة منتهية الصلاحية' },
        }),
      );
    });

    it('does not create a ReviewRequest when approving', async () => {
      prisma.identity.findUnique.mockResolvedValue(companyIdentity);

      await service.updateIdentityStatus('identity-company-1', {
        status: 'APPROVED',
      });

      expect(prisma.reviewRequest.create).not.toHaveBeenCalled();
    });

    it('skips the in-app notification when notifyInApp is false', async () => {
      prisma.identity.findUnique.mockResolvedValue(companyIdentity);

      await service.updateIdentityStatus('identity-company-1', {
        status: 'APPROVED',
        notifyInApp: false,
      });

      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('skips the email when notifyEmail is false', async () => {
      prisma.identity.findUnique.mockResolvedValue(companyIdentity);

      await service.updateIdentityStatus('identity-company-1', {
        status: 'APPROVED',
        notifyEmail: false,
      });

      expect(mail.sendMail).not.toHaveBeenCalled();
    });

    it('sends both notification channels by default', async () => {
      prisma.identity.findUnique.mockResolvedValue(companyIdentity);

      await service.updateIdentityStatus('identity-company-1', {
        status: 'APPROVED',
      });

      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'IDENTITY_APPROVED',
        }),
      );
      expect(mail.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'company@example.com' }),
      );
    });

    it('still succeeds when the notification email fails to send', async () => {
      prisma.identity.findUnique.mockResolvedValue(companyIdentity);
      mail.sendMail.mockRejectedValueOnce(new Error('Invalid `to` field'));

      await expect(
        service.updateIdentityStatus('identity-company-1', {
          status: 'APPROVED',
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('requestIdentityEdit', () => {
    const officeIdentity = {
      id: 'identity-office-1',
      userId: 'user-2',
      type: 'OFFICE',
      companyData: null,
      officeData: { id: 'office-data-1', status: 'PENDING' },
      user: {
        id: 'user-2',
        email: 'office@example.com',
        name: 'مكتب الاختبار',
      },
    };

    it('creates a PENDING ReviewRequest with the notes and leaves the identity untouched', async () => {
      prisma.identity.findUnique.mockResolvedValue(officeIdentity);

      const result = await service.requestIdentityEdit(
        'identity-office-1',
        { notes: 'يرجى رفع صورة رخصة أوضح' },
        'admin-1',
      );

      expect(prisma.reviewRequest.create).toHaveBeenCalledWith({
        data: {
          status: 'PENDING',
          notes: 'يرجى رفع صورة رخصة أوضح',
          officeIdentityDataId: 'office-data-1',
        },
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actorAdminId: 'admin-1',
          action: 'IDENTITY_EDIT_REQUESTED',
          targetType: 'IDENTITY',
          targetId: 'identity-office-1',
          targetUserId: 'user-2',
          metadata: { notes: 'يرجى رفع صورة رخصة أوضح' },
        }),
      );
      expect(prisma.officeIdentityData.update).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('notifies with type IDENTITY_EDIT_REQUESTED by default', async () => {
      prisma.identity.findUnique.mockResolvedValue(officeIdentity);

      await service.requestIdentityEdit('identity-office-1', {
        notes: 'يرجى رفع صورة رخصة أوضح',
      });

      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-2',
          type: 'IDENTITY_EDIT_REQUESTED',
        }),
      );
      expect(mail.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'office@example.com' }),
      );
    });

    it('throws BadRequestException for an individual identity', async () => {
      prisma.identity.findUnique.mockResolvedValue({
        id: 'identity-ind-1',
        userId: 'user-3',
        type: 'INDIVIDUAL',
        companyData: null,
        officeData: null,
        user: { id: 'user-3', email: 'ind@example.com', name: 'فرد' },
      });

      await expect(
        service.requestIdentityEdit('identity-ind-1', { notes: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when the identity does not exist', async () => {
      prisma.identity.findUnique.mockResolvedValue(null);

      await expect(
        service.requestIdentityEdit('missing-id', { notes: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
