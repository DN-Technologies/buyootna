import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminRequestsService } from './admin-requests.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CompanyRequestsService } from '../../../company/company-requests/company-requests.service';

describe('AdminRequestsService', () => {
  let service: AdminRequestsService;
  let prisma: { user: { findUnique: jest.Mock } };
  let companyRequestsService: { findForIdentityAsAdmin: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          role: 'INDIVIDUAL',
          identities: [{ id: 'identity-1', type: 'INDIVIDUAL' }],
        }),
      },
    };
    companyRequestsService = {
      findForIdentityAsAdmin: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRequestsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CompanyRequestsService, useValue: companyRequestsService },
      ],
    }).compile();

    service = module.get<AdminRequestsService>(AdminRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws NotFoundException when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.getRequestsForUser('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns an empty array when the user has no identity', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'INDIVIDUAL',
      identities: [],
    });

    const result = await service.getRequestsForUser('user-1');
    expect(result).toEqual([]);
    expect(
      companyRequestsService.findForIdentityAsAdmin,
    ).not.toHaveBeenCalled();
  });

  it('delegates to CompanyRequestsService with the identity id and type', async () => {
    await service.getRequestsForUser('user-1');

    expect(companyRequestsService.findForIdentityAsAdmin).toHaveBeenCalledWith(
      'identity-1',
      'INDIVIDUAL',
    );
  });
});
