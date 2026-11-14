import { BadRequestException } from '@nestjs/common';
import type { CompanyRequestsService } from './company-requests.service';
import {
  PrismaMock,
  setupCompanyRequestsService,
  baseRequest,
  mockNotifications,
  mockPush,
} from './company-requests.service.harness';
import * as subscriptionRules from 'src/features/company-subscriptions/company-subscription.rules';

// The subscription gate has its own spec; here every company is subscribed
jest.mock(
  'src/features/company-subscriptions/company-subscription.rules',
  () => ({
    ...jest.requireActual<Record<string, unknown>>(
      'src/features/company-subscriptions/company-subscription.rules',
    ),
    assertActiveCompanySubscription: jest.fn().mockResolvedValue(undefined),
    hasActiveCompanySubscription: jest.fn().mockResolvedValue(true),
    grantTrialIfNew: jest.fn().mockResolvedValue(undefined),
  }),
);

describe('CompanyRequestsService: create', () => {
  const harness = setupCompanyRequestsService();
  let service: CompanyRequestsService;
  let prisma: PrismaMock;
  beforeEach(() => {
    ({ service, prisma } = harness);
  });

  describe('create', () => {
    const dto = {
      title: 'تشطيب',
      category: 'تشطيب',
      location: 'السالمية',
      latitude: 29.33,
      longitude: 48.05,
      priceRange: '100 - 300 د.ك',
      offerType: 'عرض مخصص',
      description: 'أحتاج تشطيب كامل',
      images: ['https://x/1.jpg'],
    };

    it('creates a directed request as the caller with PENDING status', async () => {
      const result = await service.create('client-1', {
        ...dto,
        targetIdentityId: 'company-1',
      });

      expect(prisma.companyRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientIdentityId: 'client-1',
            targetIdentityId: 'company-1',
            status: 'PENDING',
            images: ['https://x/1.jpg'],
          }),
        }),
      );
      expect(result.id).toBe('req-1');
    });

    it('refuses a private request to a company with no active subscription', async () => {
      jest
        .mocked(subscriptionRules.hasActiveCompanySubscription)
        .mockResolvedValueOnce(false);

      await expect(
        service.create('client-1', { ...dto, targetIdentityId: 'company-1' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.companyRequest.create).not.toHaveBeenCalled();
    });

    // QA: a company or office the client blocked still received requests
    it('refuses a request to a company the client blocked, or that blocked them', async () => {
      // The client and the company are two accounts
      prisma.identity.findUnique.mockImplementation(
        ({ where }: { where: { id: string } }) =>
          Promise.resolve(
            where.id === 'client-1'
              ? { id: 'client-1', userId: 'user-client' }
              : {
                  id: 'company-1',
                  userId: 'user-company',
                  type: 'COMPANY',
                  companyData: { status: 'APPROVED' },
                  officeData: null,
                },
          ),
      );
      prisma.userBlock.findFirst.mockResolvedValue({
        blockerUserId: 'user-company',
      });

      await expect(
        service.create('client-1', { ...dto, targetIdentityId: 'company-1' }),
      ).rejects.toMatchObject({ response: { code: 'USER_BLOCKED' } });
      expect(prisma.companyRequest.create).not.toHaveBeenCalled();
    });

    it('creates a public request when no target identity is given', async () => {
      prisma.companyRequest.create.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
      });

      const result = await service.create('client-1', { ...dto });

      expect(prisma.identity.findUnique).not.toHaveBeenCalled();
      expect(prisma.companyRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientIdentityId: 'client-1',
            targetIdentityId: null,
          }),
        }),
      );
      expect(result.scope).toBe('public');
    });

    it('stores the address details from the location picker', async () => {
      prisma.companyRequest.create.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
        addressDetails: { block: '6', building: '12' },
      });

      const result = await service.create('client-1', {
        ...dto,
        addressDetails: { block: '6', street: '', building: '12' },
      });

      expect(prisma.companyRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            addressDetails: { block: '6', building: '12' },
          }),
        }),
      );
      expect(result.addressDetails).toEqual({ block: '6', building: '12' });
    });

    it('rejects a request directed at a missing or non-company target', async () => {
      prisma.identity.findUnique.mockResolvedValue(null);

      await expect(
        service.create('client-1', { ...dto, targetIdentityId: 'ghost' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.companyRequest.create).not.toHaveBeenCalled();
    });

    it('rejects sending a request to yourself', async () => {
      prisma.identity.findUnique.mockResolvedValue({
        id: 'client-1',
        type: 'INDIVIDUAL',
      });

      await expect(
        service.create('client-1', { ...dto, targetIdentityId: 'client-1' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.companyRequest.create).not.toHaveBeenCalled();
    });
  });

  // QA: a company sent a طلب عرض سعر got no notification at all
  describe('telling the company', () => {
    const dto = {
      title: 'تشطيب محل',
      location: 'السالمية',
      description: 'وصف',
    };
    const target = {
      id: 'company-1',
      type: 'COMPANY',
      companyData: { status: 'APPROVED' },
      officeData: null,
    };
    beforeEach(() => {
      mockNotifications.create.mockClear();
      mockPush.sendToTokens.mockClear();
    });

    it('a request sent to it: a notice on its persona and a push to its account', async () => {
      prisma.identity.findUnique
        .mockResolvedValueOnce(target)
        .mockResolvedValueOnce({ userId: 'user-company' });
      prisma.session.findMany.mockResolvedValue([
        { pushToken: 't1' },
        { pushToken: 't2' },
      ]);

      await service.create('client-1', {
        ...dto,
        targetIdentityId: 'company-1',
      });

      expect(mockNotifications.create).toHaveBeenCalledWith({
        userId: 'user-company',
        type: 'REQUEST_RECEIVED',
        title: 'طلب عرض سعر جديد',
        body: 'أرسل لك نواف الجارحي طلب «تشطيب محل»',
        identityId: 'company-1',
        data: { requestId: 'req-1' },
      });
      expect(mockPush.sendToTokens).toHaveBeenCalledWith(['t1', 't2'], {
        title: 'طلب عرض سعر جديد',
        body: 'أرسل لك نواف الجارحي طلب «تشطيب محل»',
        data: {
          type: 'REQUEST_RECEIVED',
          route: '/(company)/(requests)/req-1',
          requestId: 'req-1',
          identityId: 'company-1',
        },
      });
    });

    // QA: a public request («+» › طلب عرض سعر) reached no company
    describe('a public request', () => {
      const publicRequest = (category: string | null) =>
        prisma.companyRequest.create.mockResolvedValue({
          ...baseRequest,
          targetIdentityId: null,
          category,
        });
      beforeEach(() => mockNotifications.createMany.mockClear());

      it('tells every company that will see it: a notice on each and a push', async () => {
        publicRequest('مقاول عام');
        prisma.identity.findMany.mockResolvedValue([
          { id: 'company-1', userId: 'user-a' },
          { id: 'company-2', userId: 'user-b' },
        ]);
        prisma.session.findMany.mockResolvedValue([
          { userId: 'user-a', pushToken: 'ta' },
          { userId: 'user-b', pushToken: null },
        ]);

        await service.create('client-1', dto);

        expect(mockNotifications.createMany).toHaveBeenCalledWith([
          expect.objectContaining({
            userId: 'user-a',
            identityId: 'company-1',
            type: 'REQUEST_RECEIVED',
            title: 'طلب عرض سعر جديد',
            body: 'نواف الجارحي نشر طلب «تشطيب محل»',
            data: { requestId: 'req-1' },
          }),
          expect.objectContaining({
            userId: 'user-b',
            identityId: 'company-2',
          }),
        ]);
        // Only the account with a device gets a push, opened as its company
        expect(mockPush.sendToTokens).toHaveBeenCalledTimes(1);
        expect(mockPush.sendToTokens).toHaveBeenCalledWith(['ta'], {
          title: 'طلب عرض سعر جديد',
          body: 'نواف الجارحي نشر طلب «تشطيب محل»',
          data: {
            type: 'REQUEST_RECEIVED',
            route: '/(company)/(requests)/req-1',
            requestId: 'req-1',
            identityId: 'company-1',
          },
        });
        expect(mockNotifications.create).not.toHaveBeenCalled();
      });

      it('asks only for approved companies of its specialty (or none), not the requester, no blocks', async () => {
        publicRequest('مقاول عام');

        await service.create('client-1', dto);

        const { where } = (
          prisma.identity.findMany.mock.calls[0] as unknown[]
        )[0] as {
          where: Record<string, unknown>;
        };
        expect(where).toMatchObject({
          type: 'COMPANY',
          userId: { not: 'user-client' },
          companyData: {
            status: 'APPROVED',
            OR: [{ specialty: null }, { specialty: 'مقاول عام' }],
          },
        });
        expect(where.user).toBeDefined();
      });

      it('one with no specialty goes to every approved company', async () => {
        publicRequest(null);

        await service.create('client-1', dto);

        const { where } = (
          prisma.identity.findMany.mock.calls[0] as unknown[]
        )[0] as {
          where: { companyData: Record<string, unknown> };
        };
        expect(where.companyData).toEqual({ status: 'APPROVED' });
      });

      it('no matching company: nothing is sent', async () => {
        publicRequest('مقاول عام');

        await service.create('client-1', dto);

        expect(mockNotifications.createMany).not.toHaveBeenCalled();
        expect(mockPush.sendToTokens).not.toHaveBeenCalled();
      });

      it('a failed notice does not fail the request', async () => {
        publicRequest('مقاول عام');
        prisma.identity.findMany.mockRejectedValueOnce(new Error('db down'));

        const result = await service.create('client-1', dto);

        expect(result.id).toBe('req-1');
      });
    });

    it('a failed notice does not fail the request', async () => {
      prisma.identity.findUnique
        .mockResolvedValueOnce(target)
        .mockResolvedValueOnce({ userId: 'user-company' });
      mockNotifications.create.mockRejectedValueOnce(new Error('db down'));

      const result = await service.create('client-1', {
        ...dto,
        targetIdentityId: 'company-1',
      });

      expect(result.id).toBe('req-1');
    });
  });

  describe('companies/offices under review', () => {
    const pendingOffice = {
      id: 'office-1',
      type: 'OFFICE',
      companyData: null,
      officeData: { status: 'PENDING' },
    };

    it('cannot be sent a request', async () => {
      prisma.identity.findUnique.mockResolvedValue(pendingOffice);

      await expect(
        service.create('client-1', {
          title: 't',
          category: 'c',
          location: 'l',
          description: 'd',
          targetIdentityId: 'office-1',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.companyRequest.create).not.toHaveBeenCalled();
    });

    it('see no leads, but still see their own submissions', async () => {
      prisma.identity.findUnique.mockResolvedValue(pendingOffice);

      await expect(
        service.findMine('office-1', { scope: 'company' }),
      ).resolves.toEqual([]);
      await expect(
        service.findMine('office-1', { scope: 'public' }),
      ).resolves.toEqual([]);
      expect(prisma.companyRequest.findMany).not.toHaveBeenCalled();

      await service.findMine('office-1', { scope: 'mine' });
      expect(prisma.companyRequest.findMany).toHaveBeenCalled();
    });

    it('cannot accept a request', async () => {
      prisma.identity.findUnique.mockResolvedValue(pendingOffice);

      await expect(service.accept('req-1', 'office-1')).rejects.toThrow(
        'حسابك قيد المراجعة',
      );
      expect(prisma.companyRequest.updateMany).not.toHaveBeenCalled();
    });
  });
});
