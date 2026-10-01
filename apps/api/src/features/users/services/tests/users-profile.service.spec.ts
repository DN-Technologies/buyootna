import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersProfileService } from '../users-profile.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { StorageService } from '../../../../core/storage/storage.service';
import { AccountStateService } from '../account-state.service';

describe('UsersProfileService', () => {
  let service: UsersProfileService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn().mockResolvedValue({ phone: '+96599998888' }),
      },
      identity: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'identity-1',
          companyData: {},
          officeData: {},
        }),
      },
      companyIdentityData: { update: jest.fn().mockResolvedValue({}) },
      officeIdentityData: { update: jest.fn().mockResolvedValue({}) },
      companyProject: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({
          id: 'project-1',
          identityId: 'identity-1',
        }),
        delete: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersProfileService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: StorageService,
          useValue: {},
        },
        { provide: AccountStateService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersProfileService>(UsersProfileService);
    jest.spyOn(service, 'findFullUser').mockResolvedValue({} as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('name validation (individual profiles only)', () => {
    it('rejects an individual name containing an emoji', async () => {
      await expect(
        service.updateProfile('user-1', Role.INDIVIDUAL, {
          name: 'Ahmed 🚀',
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an individual name containing digits/symbols', async () => {
      await expect(
        service.updateProfile('user-1', Role.INDIVIDUAL, {
          name: 'Ahmed123',
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('does not restrict a company name to letters-only', async () => {
      await service.updateProfile('user-1', Role.COMPANY, {
        name: '24/7 Real Estate Co.',
      });

      expect(prisma.companyIdentityData.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: '24/7 Real Estate Co.' }),
        }),
      );
    });
  });

  describe('phone (a sign-in identifier)', () => {
    it('refuses a new number -- it only changes through the SMS check', async () => {
      const attempt = service.updateProfile('user-1', Role.COMPANY, {
        phone: '55556666',
      });
      await expect(attempt).rejects.toBeInstanceOf(BadRequestException);
      await expect(attempt).rejects.toThrow('يجب التحقق منه');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('an empty phone means "not sent": no change, no error', async () => {
      await service.updateProfile('user-1', Role.COMPANY, {
        phone: '',
        whatsapp: '99998888',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { whatsapp: '99998888' },
      });
    });

    it('accepts the unchanged number in another form and leaves it alone', async () => {
      await service.updateProfile('user-1', Role.COMPANY, {
        phone: '99998888',
        whatsapp: '99998888',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { whatsapp: '99998888' },
      });
    });
  });

  describe('listMyProjects / deleteMyProject', () => {
    it('scopes listMyProjects to the caller company identity', async () => {
      await service.listMyProjects('user-1');
      expect(prisma.companyProject.findMany).toHaveBeenCalledWith({
        where: { identityId: 'identity-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('throws when deleting a project owned by a different identity', async () => {
      prisma.companyProject.findUnique.mockResolvedValue({
        id: 'project-1',
        identityId: 'someone-elses-identity',
      });

      await expect(
        service.deleteMyProject('user-1', 'project-1'),
      ).rejects.toThrow();
      expect(prisma.companyProject.delete).not.toHaveBeenCalled();
    });

    it('deletes a project owned by the caller', async () => {
      await service.deleteMyProject('user-1', 'project-1');
      expect(prisma.companyProject.delete).toHaveBeenCalledWith({
        where: { id: 'project-1' },
      });
    });
  });
});
