import { Test, TestingModule } from '@nestjs/testing';
import { IdentitiesService } from './identities.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { IdentityType, Prisma } from '@prisma/client';

interface IdentityCreateArgs {
  data: {
    userId: string;
    type: IdentityType;
    isActive: boolean;
    individualData?: {
      create: { name?: string; whatsapp?: string; avatarUrl?: string };
    };
    companyData?: {
      create: {
        licenseNumber: string | null;
        logoUrl: string | null;
        status?: string;
        specialty?: string;
      };
    };
    officeData?: { create: { licenseNumber: string; status?: string } };
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
    companyIdentityData: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    companyService: { count: jest.fn() },
    officeIdentityData: { findFirst: jest.fn(), update: jest.fn() },
    individualIdentityData: { update: jest.fn() },
    reviewRequest: { create: jest.fn() },
    companySubscription: { findFirst: jest.fn(), create: jest.fn() },
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
    const companyDto = {
      name: 'شركة',
      licenseNumber: ' ١٢٣ ٤٥ ',
      specialty: 'مكتب هندسي',
    };

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

    it('stores the normalised licence and approves the company at once, on its trial', async () => {
      await service.createCompany('user-1', companyDto, file);

      const data = createCalls()[0][0].data;
      expect(data.type).toBe(IdentityType.COMPANY);
      expect(data.companyData?.create.licenseNumber).toBe('12345');
      expect(data.companyData?.create.logoUrl).toBe(
        'https://bucket/company-logos/f.png',
      );
      // No admin wait: listed straight away, with no approval request
      expect(data.companyData?.create.status).toBe('APPROVED');
      expect(mockPrismaService.reviewRequest.create).not.toHaveBeenCalled();
      expect(
        mockPrismaService.companySubscription.create.mock.calls,
      ).toMatchObject([
        [{ data: { identityId: 'identity-c', kind: 'TRIAL' } }],
      ]);
      // Locked on both the persona slot and the licence
      expect(mockPrismaService.$executeRaw).toHaveBeenCalledTimes(2);
      expect(data.companyData?.create.specialty).toBe('مكتب هندسي');
    });

    // The licence comes with «طلب التوثيق»; sign-up asks «التخصص»
    it('creates a company without a licence, with its specialty', async () => {
      await service.createCompany('user-1', {
        name: 'شركة',
        specialty: 'مكتب هندسي',
      });

      const data = createCalls()[0][0].data;
      expect(data.companyData?.create.licenseNumber).toBeNull();
      expect(data.companyData?.create.specialty).toBe('مكتب هندسي');
      expect(data.companyData?.create.status).toBe('APPROVED');
      // Only the persona slot is locked: there's no licence to hold
      expect(mockPrismaService.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it("takes an older app build's النشاط as the specialty", async () => {
      await service.createCompany('user-1', {
        name: 'شركة',
        licenseActivity: 'مقاولات عامة',
      });
      expect(createCalls()[0][0].data.companyData?.create.specialty).toBe(
        'مقاولات عامة',
      );
    });

    it('refuses a company with no specialty', async () => {
      await expect(
        service.createCompany('user-1', { name: 'شركة' }),
      ).rejects.toThrow('التخصص مطلوب');
      expect(mockPrismaService.identity.create).not.toHaveBeenCalled();
    });

    it('an office still needs its licence', async () => {
      await expect(
        service.createOffice('user-1', { name: 'مكتب' } as never),
      ).rejects.toThrow('رقم الرخصة مطلوب');
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
        status: 'PENDING',
        officeIdentityDataId: 'od-1',
      });
      // An office still waits for an admin, and has no company trial
      expect(
        createCalls()[0][0].data.officeData?.create.status,
      ).toBeUndefined();
      expect(
        mockPrismaService.companySubscription.create,
      ).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const companyIdentity = {
      id: 'identity-c',
      userId: 'user-1',
      type: IdentityType.COMPANY,
      companyData: { id: 'cd-1', licenseNumber: '12345' },
    };
    const officeIdentity = {
      id: 'identity-o',
      userId: 'user-1',
      type: IdentityType.OFFICE,
      officeData: { id: 'od-1', licenseNumber: '12345' },
    };

    it('uploads an office logo/license into the office folders and writes the URLs', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(officeIdentity);
      mockPrismaService.officeIdentityData.update.mockResolvedValue({});

      await service.update('user-1', 'identity-o', {}, file, file);

      expect(mockStorage.uploadFile).toHaveBeenCalledWith(file, 'office-logos');
      expect(mockStorage.uploadFile).toHaveBeenCalledWith(
        file,
        'office-licenses',
      );
    });

    // «طلب التوثيق»: a company's licence is reviewed before the badge, so
    // edit profile (including older app builds) can't change it
    it("uploads a company's logo but ignores its licence file and fields", async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(companyIdentity);
      mockPrismaService.companyIdentityData.update.mockResolvedValue({});

      await service.update(
        'user-1',
        'identity-c',
        { about: 'نبذة', licenseNumber: '999', licenseExpiry: '2030' },
        file,
        file,
      );

      expect(mockStorage.uploadFile).toHaveBeenCalledTimes(1);
      expect(mockStorage.uploadFile).toHaveBeenCalledWith(
        file,
        'company-logos',
      );
      const { data } = (
        mockPrismaService.companyIdentityData.update.mock.calls[0] as [
          { data: Record<string, unknown> },
        ]
      )[0];
      expect(data).toMatchObject({
        about: 'نبذة',
        logoUrl: 'https://bucket/company-logos/f.png',
      });
      for (const key of [
        'licenseNumber',
        'licenseExpiry',
        'licenseActivity',
        'licenseFileUrl',
      ]) {
        expect(data).not.toHaveProperty(key);
      }
      expect(mockStorage.deleteFile).not.toHaveBeenCalled();
    });

    it('deletes the uploaded files when the update write fails', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(companyIdentity);
      mockPrismaService.companyIdentityData.update.mockRejectedValue(
        new Error('db down'),
      );

      await expect(
        service.update('user-1', 'identity-c', {}, file, file),
      ).rejects.toThrow('db down');

      expect(mockStorage.deleteFile).toHaveBeenCalledWith(
        'https://bucket/company-logos/f.png',
      );
    });

    it('refuses a bio over 300 characters, before uploading or writing', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(companyIdentity);

      await expect(
        service.update(
          'user-1',
          'identity-c',
          { about: 'ا'.repeat(301) },
          file,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockStorage.uploadFile).not.toHaveBeenCalled();
      expect(
        mockPrismaService.companyIdentityData.update,
      ).not.toHaveBeenCalled();
    });

    it('saves مواعيد العمل sent as JSON text in a multipart body', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(companyIdentity);
      mockPrismaService.companyIdentityData.update.mockResolvedValue({});
      const week = [
        { day: 0, open: true, ranges: [{ from: '09:00', to: '17:00' }] },
      ];

      await service.update('user-1', 'identity-c', {
        workingHours: JSON.stringify(week),
      });

      expect(mockPrismaService.companyIdentityData.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ workingHours: week }) as unknown,
        }),
      );
    });

    it('leaves مواعيد العمل alone when they are not sent', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(companyIdentity);
      mockPrismaService.companyIdentityData.update.mockResolvedValue({});

      await service.update('user-1', 'identity-c', { about: 'نبذة' });

      const { data } = (
        mockPrismaService.companyIdentityData.update.mock.calls as {
          data: { workingHours?: unknown };
        }[][]
      )[0][0];
      expect(data.workingHours).toBeUndefined();
    });

    it('saves the HQ map point sent as multipart text as numbers', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(companyIdentity);
      mockPrismaService.companyIdentityData.update.mockResolvedValue({});

      await service.update('user-1', 'identity-c', {
        hqLocation: 'حولي - السالمية',
        latitude: '29.3376' as unknown as number,
        longitude: '48.0759' as unknown as number,
      });

      const { data } = (
        mockPrismaService.companyIdentityData.update.mock.calls as {
          data: { latitude?: unknown; longitude?: unknown };
        }[][]
      )[0][0];
      expect(data.latitude).toBe(29.3376);
      expect(data.longitude).toBe(48.0759);
    });

    it('updates from a plain JSON body without touching storage', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(companyIdentity);
      mockPrismaService.companyIdentityData.update.mockResolvedValue({});

      await service.update('user-1', 'identity-c', { about: 'نبذة' });

      expect(mockStorage.uploadFile).not.toHaveBeenCalled();
      expect(mockPrismaService.companyIdentityData.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ about: 'نبذة' }),
        }),
      );
    });

    it("still enforces licence uniqueness on an office's update", async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue(officeIdentity);
      mockPrismaService.companyIdentityData.findFirst.mockResolvedValue({
        id: 'cd-other',
      });

      await expect(
        service.update('user-1', 'identity-o', { licenseNumber: ' ١٢٣ ٤٥ ' }),
      ).rejects.toThrow('رقم الترخيص مسجل مسبقاً');
      expect(mockStorage.uploadFile).not.toHaveBeenCalled();
      expect(
        mockPrismaService.officeIdentityData.update,
      ).not.toHaveBeenCalled();
    });

    it('ignores files for an INDIVIDUAL identity update', async () => {
      mockPrismaService.identity.findFirst.mockResolvedValue({
        id: 'identity-i',
        userId: 'user-1',
        type: IdentityType.INDIVIDUAL,
        individualData: { id: 'id-1' },
      });
      mockPrismaService.individualIdentityData.update.mockResolvedValue({});

      await service.update('user-1', 'identity-i', { name: 'علي' }, file, file);

      expect(mockStorage.uploadFile).not.toHaveBeenCalled();
      expect(
        mockPrismaService.individualIdentityData.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ data: { name: 'علي' } }),
      );
    });
  });
});
