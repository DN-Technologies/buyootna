import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import { CompanyVerificationService } from './company-verification.service';

const file = {
  originalname: 'license.jpg',
  size: 204800,
  mimetype: 'image/jpeg',
} as Express.Multer.File;

const request = (over: Record<string, unknown> = {}) => ({
  id: 'vr-1',
  identityId: 'company-1',
  status: 'PENDING',
  licenseActivity: 'مقاول عام',
  licenseNumber: '6743963845',
  licenseExpiry: '15 ابريل 2027',
  licenseFileUrl: 'https://cdn/old.jpg',
  licenseFileName: 'license.jpg',
  licenseFileSize: 204800,
  licenseFileType: 'image/jpeg',
  issues: null,
  submittedAt: new Date('2026-11-07T09:35:00Z'),
  reviewedAt: null,
  reviewedById: null,
  createdAt: new Date('2026-11-07T09:35:00Z'),
  updatedAt: new Date('2026-11-07T09:35:00Z'),
  ...over,
});

type Row = ReturnType<typeof request>;

const makePrisma = () => {
  const db = {
    identity: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'company-1',
        type: 'COMPANY',
        companyData: { isVerified: false },
      }),
    },
    companyVerificationRequest: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(({ data }: { data: Partial<Row> }) => request(data)),
      update: jest.fn(({ data }: { data: Partial<Row> }) => request(data)),
    },
    companyIdentityData: {
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    },
    officeIdentityData: { findFirst: jest.fn().mockResolvedValue(null) },
    $transaction: jest.fn(),
  };
  db.$transaction.mockImplementation((fn: (tx: typeof db) => unknown) =>
    fn(db),
  );
  return db;
};

describe('CompanyVerificationService («طلب التوثيق»)', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let storage: { uploadFile: jest.Mock; deleteFile: jest.Mock };
  let service: CompanyVerificationService;
  // What the last update wrote
  const updated = () =>
    (
      prisma.companyVerificationRequest.update.mock.calls[0] as [
        { data: Record<string, unknown> },
      ]
    )[0].data;

  beforeEach(() => {
    prisma = makePrisma();
    storage = {
      uploadFile: jest.fn().mockResolvedValue('https://cdn/new.jpg'),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };
    service = new CompanyVerificationService(
      prisma as unknown as PrismaService,
      storage as unknown as StorageService,
    );
  });

  describe('submit', () => {
    it('stores the licence with the file details, normalised', async () => {
      const view = await service.submit(
        'user-1',
        'company-1',
        { licenseNumber: ' ٦٧٤٣ 963845', licenseActivity: 'مقاول عام' },
        file,
      );

      expect(storage.uploadFile).toHaveBeenCalledWith(file, 'company-licenses');
      const created = (
        prisma.companyVerificationRequest.create.mock.calls[0] as [
          { data: Record<string, unknown> },
        ]
      )[0].data;
      expect(created).toMatchObject({
        identityId: 'company-1',
        licenseNumber: '6743963845',
        licenseActivity: 'مقاول عام',
        licenseFileUrl: 'https://cdn/new.jpg',
        licenseFileName: 'license.jpg',
        licenseFileSize: 204800,
        licenseFileType: 'image/jpeg',
      });
      expect(view.status).toBe('PENDING');
    });

    it('needs the licence number and image', async () => {
      await expect(
        service.submit('user-1', 'company-1', {}, file),
      ).rejects.toThrow('رقم الرخصة مطلوب');
      await expect(
        service.submit('user-1', 'company-1', { licenseNumber: '1' }),
      ).rejects.toThrow('صورة الرخصة مطلوبة');
    });

    it('refuses a second request while one is open', async () => {
      prisma.companyVerificationRequest.findFirst.mockResolvedValue(request());
      await expect(
        service.submit('user-1', 'company-1', { licenseNumber: '1' }, file),
      ).rejects.toThrow(ConflictException);
    });

    it('refuses a licence another company or office holds', async () => {
      prisma.officeIdentityData.findFirst.mockResolvedValue({ id: 'o-1' });
      await expect(
        service.submit('user-1', 'company-1', { licenseNumber: '1' }, file),
      ).rejects.toThrow('رقم الترخيص مسجل مسبقاً');
      expect(storage.uploadFile).not.toHaveBeenCalled();
    });

    it('is for an own company only', async () => {
      prisma.identity.findFirst.mockResolvedValueOnce(null);
      await expect(service.getMine('user-2', 'company-1')).rejects.toThrow(
        NotFoundException,
      );
      prisma.identity.findFirst.mockResolvedValueOnce({
        id: 'office-1',
        type: 'OFFICE',
        companyData: null,
      });
      await expect(service.getMine('user-1', 'office-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('refuses an already verified company', async () => {
      prisma.identity.findFirst.mockResolvedValue({
        id: 'company-1',
        type: 'COMPANY',
        companyData: { isVerified: true },
      });
      await expect(
        service.submit('user-1', 'company-1', { licenseNumber: '1' }, file),
      ).rejects.toThrow('حسابك موثق بالفعل');
    });
  });

  describe('resubmit («اعادة ارسال الطلب»)', () => {
    it('changes only the fields sent back, then waits for review again', async () => {
      prisma.companyVerificationRequest.findFirst.mockResolvedValue(
        request({
          status: 'CHANGES_REQUESTED',
          issues: { licenseFile: 'غير واضحة', licenseNumber: 'غير مطابق' },
        }),
      );

      await service.resubmit(
        'user-1',
        'company-1',
        { licenseNumber: '98576389', licenseActivity: 'تجاهل' },
        file,
      );

      const data = updated();
      expect(data).toMatchObject({
        licenseNumber: '98576389',
        licenseFileUrl: 'https://cdn/new.jpg',
        status: 'PENDING',
      });
      // النشاط was accepted: left as it was
      expect(data.licenseActivity).toBeUndefined();
      // The replaced image is removed
      expect(storage.deleteFile).toHaveBeenCalledWith('https://cdn/old.jpg');
    });

    it('needs the new image when the image was sent back', async () => {
      prisma.companyVerificationRequest.findFirst.mockResolvedValue(
        request({ status: 'CHANGES_REQUESTED', issues: { licenseFile: 'x' } }),
      );
      await expect(service.resubmit('user-1', 'company-1', {})).rejects.toThrow(
        'صورة الرخصة مطلوبة',
      );
    });

    it('has nothing to resubmit without a request sent back', async () => {
      await expect(
        service.resubmit('user-1', 'company-1', {}, file),
      ).rejects.toThrow('لا يوجد طلب بحاجة إلى استكمال');
    });
  });

  describe('admin', () => {
    it('approving copies the licence onto the company and verifies it', async () => {
      prisma.companyVerificationRequest.findFirst.mockResolvedValue(request());

      await service.approve('company-1', 'admin-1');

      expect(prisma.companyIdentityData.update).toHaveBeenCalledWith({
        where: { identityId: 'company-1' },
        data: {
          licenseNumber: '6743963845',
          licenseActivity: 'مقاول عام',
          licenseExpiry: '15 ابريل 2027',
          licenseFileUrl: 'https://cdn/old.jpg',
          isVerified: true,
        },
      });
      expect(updated()).toMatchObject({
        status: 'APPROVED',
        reviewedById: 'admin-1',
      });
    });

    it('approving without a pending request does nothing', async () => {
      expect(await service.approve('company-1')).toBeNull();
      expect(prisma.companyIdentityData.update).not.toHaveBeenCalled();
    });

    it('sends chosen fields back with their reasons', async () => {
      prisma.companyVerificationRequest.findFirst.mockResolvedValue(request());

      await service.requestChanges('company-1', {
        licenseNumber: ' غير مطابق ',
        licenseExpiry: '',
      });

      expect(updated()).toMatchObject({
        status: 'CHANGES_REQUESTED',
        issues: { licenseNumber: 'غير مطابق' },
      });
    });

    it('a general note alone asks for the whole licence again', async () => {
      prisma.companyVerificationRequest.findFirst.mockResolvedValue(request());

      await service.requestChanges('company-1', { note: 'الرخصة منتهية' });

      expect(updated().issues).toEqual({
        note: 'الرخصة منتهية',
        licenseFile: 'الرخصة منتهية',
        licenseNumber: 'الرخصة منتهية',
        licenseActivity: 'الرخصة منتهية',
        licenseExpiry: 'الرخصة منتهية',
      });
    });
  });
});
