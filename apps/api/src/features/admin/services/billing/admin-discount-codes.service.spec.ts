import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdminDiscountCodesService } from './admin-discount-codes.service';

describe('AdminDiscountCodesService (أكواد الخصم)', () => {
  const prisma = {
    discountCode: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const auditLog = { log: jest.fn() };
  const service = new AdminDiscountCodesService(
    prisma as never,
    auditLog as never,
  );

  const dto = {
    code: 'save25',
    type: 'PERCENT' as const,
    value: 25,
    appliesTo: ['PLAN' as const],
  };

  beforeEach(() => jest.clearAllMocks());

  it('stores the code upper-case and logs who created it', async () => {
    prisma.discountCode.create.mockResolvedValue({
      id: 'c1',
      ...dto,
      code: 'SAVE25',
    });
    await service.create(dto, 'admin-1');
    expect(prisma.discountCode.create).toHaveBeenCalledWith({
      data: { ...dto, code: 'SAVE25' },
    });
    expect(auditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorAdminId: 'admin-1',
        action: 'DISCOUNT_CODE_CREATED',
        targetId: 'c1',
      }),
    );
  });

  it('refuses a percent over 100 and an end before the start', async () => {
    await expect(
      service.create({ ...dto, value: 120 }, 'admin-1'),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.create(
        {
          ...dto,
          startsAt: new Date('2026-12-01'),
          expiresAt: new Date('2026-11-01'),
        },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.discountCode.create).not.toHaveBeenCalled();
  });

  it('a code that already exists is a conflict', async () => {
    prisma.discountCode.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'x',
      }),
    );
    await expect(service.create(dto, 'admin-1')).rejects.toThrow(
      ConflictException,
    );
  });

  it('deactivating keeps the code (paid invoices point at it)', async () => {
    prisma.discountCode.findUnique.mockResolvedValue({
      id: 'c1',
      code: 'SAVE25',
      type: 'PERCENT',
      value: 25,
      isActive: true,
      startsAt: null,
      expiresAt: null,
    });
    prisma.discountCode.update.mockResolvedValue({ id: 'c1', isActive: false });
    await service.update('c1', { isActive: false }, 'admin-1');
    expect(prisma.discountCode.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { isActive: false },
    });
    expect(auditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DISCOUNT_CODE_UPDATED' }),
    );
  });
});
