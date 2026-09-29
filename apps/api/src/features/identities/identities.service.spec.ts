import { Test, TestingModule } from '@nestjs/testing';
import { IdentitiesService } from './identities.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import { ConflictException } from '@nestjs/common';
import { IdentityType, Prisma } from '@prisma/client';

interface IdentityCreateArgs {
  data: {
    userId: string;
    type: IdentityType;
    isActive: boolean;
    individualData?: {
      create: { name?: string; whatsapp?: string; avatarUrl?: string };
    };
    companyData?: { create: { licenseNumber: string; logoUrl: string | null } };
    officeData?: { create: { licenseNumber: string } };
  };
}

const file = { originalname: 'x.png' } as Express.Multer.File;

describe('IdentitiesService', () => {
  let service: IdentitiesService;

  const mockPrismaService = {
    identity: {
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    companyIdentityData: { findFirst: jest.fn() },
    officeIdentityData: { findFirst: jest.fn() },
    reviewRequest: { create: jest.fn() },
    $executeRaw: jest.fn(),
    $transaction: jest.fn(),
  };
  const mockStorage = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const createCalls = () =>
    mockPrismaService.identity.create.mock.calls as IdentityCreateArgs[][];

  const reviewRequestData = () =>
    (
      mockPrismaService.reviewRequest.create.mock.calls as [
        { data: Record<string, unknown> },
      ][]
    )[0][0].data;

  beforeEach(async () => {
    jest.clearAllMocks();
    // The transaction client is the same mock, so checks inside it are visible
    mockPrismaService.$transaction.mockImplementation(
      (cb: (tx: typeof mockPrismaService) => unknown) => cb(mockPrismaService),
    );
    mockPrismaService.identity.findFirst.mockResolvedValue(null);
    mockPrismaService.identity.count.mockResolvedValue(0);
    mockPrismaService.companyIdentityData.findFirst.mockResolvedValue(null);
    mockPrismaService.officeIdentityData.findFirst.mockResolvedValue(null);
    mockStorage.uploadFile.mockImplementation(
      (_f: unknown, folder: string) => `https://bucket/${folder}/f.png`,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentitiesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<IdentitiesService>(IdentitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createIndividual', () => {
    it('throws 409 when the user already has an INDIVIDUAL identity', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue({
        id: 'identity-existing',
      });

      await expect(service.createIndividual('user-1', {})).rejects.toThrow(
        ConflictException,
      );

      expect(mockPrismaService.identity.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: IdentityType.INDIVIDUAL },
        select: { id: true },
      });
      expect(mockPrismaService.identity.create).not.toHaveBeenCalled();
    });

    it('creates the identity with isActive:true when this is the very first identity for the user', async () => {
      mockPrismaService.identity.create.mockResolvedValue({ id: 'identity-1' });

      await service.createIndividual('user-1', { name: 'Ali' });

      const createArgs = createCalls()[0][0];
      expect(createArgs.data.userId).toBe('user-1');
      expect(createArgs.data.type).toBe(IdentityType.INDIVIDUAL);
      expect(createArgs.data.isActive).toBe(true);
    });

    it('creates the identity with isActive:false when the user already has other identities', async () => {
      mockPrismaService.identity.count.mockResolvedValue(1);
      mockPrismaService.identity.create.mockResolvedValue({ id: 'identity-2' });

      await service.createIndividual('user-1', {});

      expect(createCalls()[0][0].data.isActive).toBe(false);
    });

    it('passes dto.name/whatsapp/avatarUrl through to individualData.create', async () => {
      mockPrismaService.identity.create.mockResolvedValue({ id: 'identity-1' });

      await service.createIndividual('user-1', {
        name: 'Ali',
        whatsapp: '+96555123456',
        avatarUrl: 'https://example.com/avatar.png',
      });

      expect(createCalls()[0][0].data.individualData?.create).toEqual({
        name: 'Ali',
        whatsapp: '+96555123456',
        avatarUrl: 'https://example.com/avatar.png',
      });
    });
  });

  describe('createCompany / createOffice', () => {
    const companyDto = { name: 'شركة', licenseNumber: ' ١٢٣ ٤٥ ' };

    beforeEach(() => {
      mockPrismaService.identity.create.mockImplementation(
        (args: IdentityCreateArgs) =>
          Promise.resolve({
            id: 'identity-c',
            companyData: args.data.companyData ? { id: 'cd-1' } : null,
            officeData: args.data.officeData ? { id: 'od-1' } : null,
          }),
      );
    });

    it('stores the normalised licence and opens an approval request', async () => {
      await service.createCompany('user-1', companyDto, file);

      const data = createCalls()[0][0].data;
      expect(data.type).toBe(IdentityType.COMPANY);
      expect(data.companyData?.create.licenseNumber).toBe('12345');
      expect(data.companyData?.create.logoUrl).toBe(
        'https://bucket/company-logos/f.png',
      );
      expect(reviewRequestData()).toMatchObject({
        status: 'PENDING',
        companyIdentityDataId: 'cd-1',
      });
      // Locked on both the persona slot and the licence
      expect(mockPrismaService.$executeRaw).toHaveBeenCalledTimes(2);
    });

    it('refuses a second company with 409 and uploads nothing', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue({ id: 'c-old' });

      await expect(
        service.createCompany('user-1', companyDto, file, file),
      ).rejects.toThrow('لديك حساب شركة بالفعل');
      expect(mockStorage.uploadFile).not.toHaveBeenCalled();
      expect(mockPrismaService.identity.create).not.toHaveBeenCalled();
    });

    it('refuses a licence already used by an office with 409 and uploads nothing', async () => {
      mockPrismaService.officeIdentityData.findFirst.mockResolvedValue({
        id: 'od-other',
      });

      await expect(
        service.createCompany('user-1', companyDto, file),
      ).rejects.toThrow('رقم الترخيص مسجل مسبقاً');
      expect(
        mockPrismaService.companyIdentityData.findFirst,
      ).toHaveBeenCalledWith({
        where: { licenseNumber: '12345' },
        select: { id: true },
      });
      expect(mockStorage.uploadFile).not.toHaveBeenCalled();
    });

    it('deletes the uploaded files and returns 409 when a concurrent create wins the licence', async () => {
      mockPrismaService.identity.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('dup', {
          code: 'P2002',
          clientVersion: 'x',
          meta: { target: ['licenseNumber'] },
        }),
      );

      await expect(
        service.createOffice('user-1', companyDto, file, file),
      ).rejects.toThrow('رقم الترخيص مسجل مسبقاً');
      expect(mockStorage.deleteFile).toHaveBeenCalledWith(
        'https://bucket/office-logos/f.png',
      );
      expect(mockStorage.deleteFile).toHaveBeenCalledWith(
        'https://bucket/office-licenses/f.png',
      );
    });

    it('creates an office with an office approval request', async () => {
      await service.createOffice('user-1', companyDto);

      expect(createCalls()[0][0].data.officeData?.create.licenseNumber).toBe(
        '12345',
      );
      expect(reviewRequestData()).toMatchObject({
        officeIdentityDataId: 'od-1',
      });
    });
  });
});
