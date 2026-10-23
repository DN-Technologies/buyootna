import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import {
  CompanyServicesService,
  legacyServicesText,
} from '../company-services.service';

import * as subscriptionRules from 'src/features/company-subscriptions/company-subscription.rules';
// The subscription gate has its own spec; here every company is subscribed
jest.mock(
  'src/features/company-subscriptions/company-subscription.rules',
  () => ({
    ...jest.requireActual(
      'src/features/company-subscriptions/company-subscription.rules',
    ),
    assertActiveCompanySubscription: jest.fn().mockResolvedValue(undefined),
    hasActiveCompanySubscription: jest.fn().mockResolvedValue(true),
    grantTrialIfNew: jest.fn().mockResolvedValue(undefined),
  }),
);

describe('CompanyServicesService', () => {
  let service: CompanyServicesService;
  let prisma: {
    identity: { findFirst: jest.Mock };
    companyService: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      createMany: jest.Mock;
      delete: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
      count: jest.Mock;
    };
    companyIdentityData: { update: jest.Mock; findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  const company = (data: {
    specialty?: string | null;
    services?: string | null;
    servicesHidden?: boolean;
  }) => ({
    id: 'identity-1',
    companyData: {
      specialty: null,
      services: null,
      servicesHidden: false,
      ...data,
    },
  });

  beforeEach(async () => {
    prisma = {
      identity: { findFirst: jest.fn().mockResolvedValue(company({})) },
      companyService: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        createMany: jest.fn((args: unknown) => args),
        delete: jest.fn((args: unknown) => args),
        update: jest.fn((args: unknown) => args),
        updateMany: jest.fn((args: unknown) => args),
        deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
        count: jest.fn(),
      },
      companyIdentityData: {
        update: jest.fn((args: unknown) => args),
        findUnique: jest.fn().mockResolvedValue({ services: null }),
      },
      $transaction: jest.fn((ops: unknown[]) => Promise.resolve(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyServicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CompanyServicesService);
  });

  describe('create', () => {
    it('creates one row per type, sets the specialty and extends the legacy list', async () => {
      prisma.identity.findFirst.mockResolvedValue(
        company({ services: 'تشطيب' }),
      );

      const result = await service.create('user-1', {
        specialty: 'مكتب هندسي',
        types: ['تصميم الواجهات', 'مخطط إنشائي'],
        description: 'وصف',
      });

      expect(result.created).toBe(2);
      expect(prisma.companyService.createMany).toHaveBeenCalledWith({
        data: [
          {
            identityId: 'identity-1',
            specialty: 'مكتب هندسي',
            type: 'تصميم الواجهات',
            title: null,
            description: 'وصف',
          },
          {
            identityId: 'identity-1',
            specialty: 'مكتب هندسي',
            type: 'مخطط إنشائي',
            title: null,
            description: 'وصف',
          },
        ],
      });
      expect(prisma.companyIdentityData.update).toHaveBeenCalledWith({
        where: { identityId: 'identity-1' },
        data: {
          specialty: 'مكتب هندسي',
          services: 'تشطيب، تصميم الواجهات، مخطط إنشائي',
        },
      });
    });

    it('stores "اخرى" under its own title', async () => {
      await service.create('user-1', {
        specialty: 'مكتب هندسي',
        types: ['اخرى'],
        title: 'تصميم حدائق',
      });

      expect(prisma.companyService.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ type: 'اخرى', title: 'تصميم حدائق' })],
      });
      expect(prisma.companyIdentityData.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { specialty: 'مكتب هندسي', services: 'تصميم حدائق' },
        }),
      );
    });

    it('refuses a company with no active subscription', async () => {
      jest
        .mocked(subscriptionRules.assertActiveCompanySubscription)
        .mockRejectedValueOnce(
          new ForbiddenException({ code: 'SUBSCRIPTION_REQUIRED' }),
        );

      await expect(
        service.create('user-1', { specialty: 'مكتب هندسي', types: ['تصميم'] }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects "اخرى" without a title', async () => {
      await expect(
        service.create('user-1', { specialty: 'مكتب هندسي', types: ['اخرى'] }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('refuses a different specialty once the company has one', async () => {
      prisma.identity.findFirst.mockResolvedValue(
        company({ specialty: 'مكتب هندسي' }),
      );

      await expect(
        service.create('user-1', {
          specialty: 'التكييف',
          types: ['اخرى'],
          title: 'x',
        }),
      ).rejects.toThrow('لا يمكن تغيير تخصص الشركة');
    });

    it('skips a type the company already offers, and fails when nothing is new', async () => {
      prisma.companyService.findMany.mockResolvedValue([
        { type: 'تصميم الواجهات', title: null },
      ]);

      const result = await service.create('user-1', {
        specialty: 'مكتب هندسي',
        types: ['تصميم الواجهات', 'مخطط إنشائي'],
      });
      expect(result.created).toBe(1);

      await expect(
        service.create('user-1', {
          specialty: 'مكتب هندسي',
          types: ['تصميم الواجهات'],
        }),
      ).rejects.toThrow('هذه الخدمات مضافة مسبقاً');
    });

    it('needs a company profile', async () => {
      prisma.identity.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user-1', { specialty: 'مكتب هندسي', types: ['x'] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listMine', () => {
    it('returns the specialty with the services', async () => {
      prisma.identity.findFirst.mockResolvedValue(
        company({ specialty: 'مكتب هندسي' }),
      );
      const rows = [
        { id: 's-2', description: 'تنفيذ', createdAt: new Date('2026-10-02') },
        { id: 's-1', description: 'تنفيذ', createdAt: new Date('2026-10-01') },
      ];
      prisma.companyService.findMany.mockResolvedValue(rows);

      await expect(service.listMine('user-1')).resolves.toEqual({
        specialty: 'مكتب هندسي',
        servicesHidden: false,
        description: 'تنفيذ',
        createdAt: new Date('2026-10-01'),
        services: rows,
      });
    });
  });

  describe('deleteMine', () => {
    it('deletes the service and drops it from the legacy list', async () => {
      prisma.identity.findFirst.mockResolvedValue(
        company({ services: 'تشطيب، تصميم الواجهات' }),
      );
      prisma.companyService.findUnique.mockResolvedValue({
        id: 's-1',
        identityId: 'identity-1',
        type: 'تصميم الواجهات',
        title: null,
      });

      await expect(service.deleteMine('user-1', 's-1')).resolves.toEqual({
        success: true,
      });
      expect(prisma.companyService.delete).toHaveBeenCalledWith({
        where: { id: 's-1' },
      });
      expect(prisma.companyIdentityData.update).toHaveBeenCalledWith({
        where: { identityId: 'identity-1' },
        data: { services: 'تشطيب' },
      });
    });

    it("refuses another company's service", async () => {
      prisma.companyService.findUnique.mockResolvedValue({
        id: 's-9',
        identityId: 'someone-else',
        type: 'x',
        title: null,
      });

      await expect(service.deleteMine('user-1', 's-9')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('hiding (الخدمات)', () => {
    const row = (id: string, type: string, isHidden = false) => ({
      id,
      identityId: 'identity-1',
      type,
      title: null,
      isHidden,
    });

    it('legacyServicesText keeps hand-typed parts and lists the visible sub-services', () => {
      expect(
        legacyServicesText('تشطيب، مخطط معماري، تصميم الواجهات', [
          row('s-1', 'مخطط معماري'),
          row('s-2', 'تصميم الواجهات', true),
        ]),
      ).toBe('تشطيب، مخطط معماري');
      expect(legacyServicesText(null, [row('s-1', 'مخطط', true)])).toBeNull();
    });

    it('hides one sub-service and takes its name out of the legacy text', async () => {
      prisma.companyService.findUnique.mockResolvedValue(
        row('s-2', 'تصميم الواجهات'),
      );
      prisma.companyService.findMany.mockResolvedValue([
        row('s-1', 'مخطط معماري'),
        row('s-2', 'تصميم الواجهات', true),
      ]);
      prisma.companyIdentityData.findUnique.mockResolvedValue({
        services: 'مخطط معماري، تصميم الواجهات',
      });

      await service.setHidden('user-1', 's-2', true);
      expect(prisma.companyService.update).toHaveBeenCalledWith({
        where: { id: 's-2' },
        data: { isHidden: true },
      });
      expect(prisma.companyIdentityData.update).toHaveBeenLastCalledWith({
        where: { identityId: 'identity-1' },
        data: { services: 'مخطط معماري' },
      });
    });

    it("refuses another company's sub-service", async () => {
      prisma.companyService.findUnique.mockResolvedValue({
        ...row('s-9', 'x'),
        identityId: 'other',
      });
      await expect(
        service.setHidden('user-1', 's-9', true),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('the edit save changes only what was sent', async () => {
      prisma.companyService.count.mockResolvedValue(1);
      await service.updateMine('user-1', {
        servicesHidden: true,
        rows: [{ id: 's-1', isHidden: true }],
      });
      expect(prisma.companyService.update).toHaveBeenCalledWith({
        where: { id: 's-1' },
        data: { isHidden: true },
      });
      expect(prisma.companyIdentityData.update).toHaveBeenCalledWith({
        where: { identityId: 'identity-1' },
        data: { servicesHidden: true },
      });
      expect(prisma.companyService.updateMany).not.toHaveBeenCalled();
    });

    it('the edit save puts the description on every row, through the filter', async () => {
      await service.updateMine('user-1', { description: 'تنفيذ المشاريع' });
      expect(prisma.companyService.updateMany).toHaveBeenCalledWith({
        where: { identityId: 'identity-1' },
        data: { description: 'تنفيذ المشاريع' },
      });
      await expect(
        service.updateMine('user-1', { description: 'خدمة قحبة' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("refuses rows that aren't the company's", async () => {
      prisma.companyService.count.mockResolvedValue(0);
      await expect(
        service.updateMine('user-1', { rows: [{ id: 's-9', isHidden: true }] }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deleting the service removes every sub-service and clears the specialty', async () => {
      prisma.identity.findFirst.mockResolvedValue(
        company({
          specialty: 'مكتب هندسي',
          services: 'تشطيب، مخطط معماري',
          servicesHidden: true,
        }),
      );
      prisma.companyService.findMany.mockResolvedValue([
        row('s-1', 'مخطط معماري'),
      ]);
      prisma.$transaction.mockResolvedValue([{ count: 1 }, {}]);

      await expect(service.deleteAllMine('user-1')).resolves.toEqual({
        success: true,
        deleted: 1,
      });
      expect(prisma.companyIdentityData.update).toHaveBeenCalledWith({
        where: { identityId: 'identity-1' },
        data: { specialty: null, servicesHidden: false, services: 'تشطيب' },
      });
    });
  });
});
