import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TestingBugsService } from './testing-bugs.service';

const actor = { tester: { name: 'Ahmed (QA)' }, ip: '1.2.3.4' };

function setup() {
  const prisma = {
    testingBugReport: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    testingBugComment: { create: jest.fn() },
  };
  const storage = {
    uploadFile: jest
      .fn()
      .mockResolvedValue('https://bucket/testing-bugs/a.png'),
  };
  const audit = { record: jest.fn() };
  const service = new TestingBugsService(
    prisma as never,
    storage as never,
    audit as never,
  );
  return { service, prisma, storage, audit };
}

describe('TestingBugsService', () => {
  it('files the bug under the signed-in tester and records it', async () => {
    const { service, prisma, audit } = setup();
    prisma.testingBugReport.create.mockResolvedValue({
      id: 'b1',
      title: 'Story upload hangs',
      severity: 'HIGH',
      area: 'app',
    });
    await service.create(
      {
        title: 'Story upload hangs',
        area: 'app',
        steps: 'Post a video',
        severity: 'HIGH',
      },
      actor,
    );
    expect(prisma.testingBugReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reporterName: 'Ahmed (QA)',
        screenshots: [],
      }),
    });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'BUG_REPORTED',
        target: 'Story upload hangs',
      }),
    );
  });

  it('records a status change with before and after', async () => {
    const { service, prisma, audit } = setup();
    prisma.testingBugReport.findUnique
      .mockResolvedValueOnce({ id: 'b1', status: 'NEW', severity: 'HIGH' })
      .mockResolvedValueOnce({ id: 'b1', comments: [] });
    prisma.testingBugReport.update.mockResolvedValue({
      id: 'b1',
      title: 'T',
      status: 'RESOLVED',
      severity: 'HIGH',
    });
    await service.update('b1', { status: 'RESOLVED' }, actor);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'BUG_UPDATED',
        metadata: {
          bugId: 'b1',
          from: { status: 'NEW', severity: 'HIGH' },
          to: { status: 'RESOLVED', severity: 'HIGH' },
        },
      }),
    );
  });

  it('refuses an empty update and an unknown bug', async () => {
    const { service, prisma } = setup();
    prisma.testingBugReport.findUnique.mockResolvedValue({ id: 'b1' });
    await expect(service.update('b1', {}, actor)).rejects.toThrow(
      BadRequestException,
    );
    prisma.testingBugReport.count.mockResolvedValue(0);
    await expect(
      service.comment('nope', { body: 'hi' }, actor),
    ).rejects.toThrow(NotFoundException);
  });

  it('accepts images only, up to 8 MB', async () => {
    const { service, storage } = setup();
    const file = (mimetype: string, size = 1000) =>
      ({ mimetype, size }) as Express.Multer.File;
    await expect(
      service.uploadScreenshot(file('application/pdf')),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.uploadScreenshot(file('image/png', 9 * 1024 * 1024)),
    ).rejects.toThrow(BadRequestException);
    await expect(service.uploadScreenshot(file('image/png'))).resolves.toEqual({
      url: 'https://bucket/testing-bugs/a.png',
    });
    expect(storage.uploadFile).toHaveBeenCalledWith(
      expect.anything(),
      'testing-bugs',
    );
  });
});
