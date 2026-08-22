import { Test, TestingModule } from '@nestjs/testing';
import { IdentitiesService } from './identities.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import { BadRequestException } from '@nestjs/common';
import { IdentityType } from '@prisma/client';

interface IdentityCreateArgs {
  data: {
    userId: string;
    type: IdentityType;
    isActive: boolean;
    individualData: {
      create: {
        name?: string;
        whatsapp?: string;
        avatarUrl?: string;
      };
    };
  };
}

describe('IdentitiesService', () => {
  let service: IdentitiesService;

  const mockPrismaService = {
    identity: {
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentitiesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    service = module.get<IdentitiesService>(IdentitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createIndividual', () => {
    it('throws BadRequestException when the user already has an INDIVIDUAL identity', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue({
        id: 'identity-existing',
        userId: 'user-1',
        type: IdentityType.INDIVIDUAL,
      });

      await expect(service.createIndividual('user-1', {})).rejects.toThrow(
        BadRequestException,
      );

      expect(mockPrismaService.identity.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: IdentityType.INDIVIDUAL },
      });
      expect(mockPrismaService.identity.create).not.toHaveBeenCalled();
    });

    it('creates the identity with isActive:true when this is the very first identity for the user', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(null);
      mockPrismaService.identity.count.mockResolvedValue(0);
      mockPrismaService.identity.create.mockResolvedValue({
        id: 'identity-1',
        userId: 'user-1',
        type: IdentityType.INDIVIDUAL,
        isActive: true,
      });

      await service.createIndividual('user-1', { name: 'Ali' });

      const createCalls = mockPrismaService.identity.create.mock
        .calls as IdentityCreateArgs[][];
      const createArgs = createCalls[0][0];
      expect(createArgs.data.userId).toBe('user-1');
      expect(createArgs.data.type).toBe(IdentityType.INDIVIDUAL);
      expect(createArgs.data.isActive).toBe(true);
    });

    it('creates the identity with isActive:false when the user already has other identities', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(null);
      mockPrismaService.identity.count.mockResolvedValue(1);
      mockPrismaService.identity.create.mockResolvedValue({
        id: 'identity-2',
        userId: 'user-1',
        type: IdentityType.INDIVIDUAL,
        isActive: false,
      });

      await service.createIndividual('user-1', {});

      const createCalls = mockPrismaService.identity.create.mock
        .calls as IdentityCreateArgs[][];
      expect(createCalls[0][0].data.isActive).toBe(false);
    });

    it('passes dto.name/whatsapp/avatarUrl through to individualData.create', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(null);
      mockPrismaService.identity.count.mockResolvedValue(0);
      mockPrismaService.identity.create.mockResolvedValue({
        id: 'identity-1',
      });

      await service.createIndividual('user-1', {
        name: 'Ali',
        whatsapp: '+96555123456',
        avatarUrl: 'https://example.com/avatar.png',
      });

      const createCalls = mockPrismaService.identity.create.mock
        .calls as IdentityCreateArgs[][];
      expect(createCalls[0][0].data.individualData.create).toEqual({
        name: 'Ali',
        whatsapp: '+96555123456',
        avatarUrl: 'https://example.com/avatar.png',
      });
    });

    it('succeeds with an empty DTO, since all individual identity fields are optional', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(null);
      mockPrismaService.identity.count.mockResolvedValue(0);
      mockPrismaService.identity.create.mockResolvedValue({
        id: 'identity-1',
      });

      await expect(
        service.createIndividual('user-1', {}),
      ).resolves.toBeDefined();

      const createCalls = mockPrismaService.identity.create.mock
        .calls as IdentityCreateArgs[][];
      expect(createCalls[0][0].data.individualData.create).toEqual({
        name: undefined,
        whatsapp: undefined,
        avatarUrl: undefined,
      });
    });
  });
});
