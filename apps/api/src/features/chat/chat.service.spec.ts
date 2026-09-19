import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('ChatService.resolveOtherParticipantDisplay', () => {
  let service: ChatService;
  let prisma: {
    identity: { findFirst: jest.Mock };
    user: { findUnique: jest.Mock };
  };

  // The private method is exercised directly rather than through
  // getConversations/getMessages -- this is pure name/avatar resolution
  // logic and doesn't need the surrounding conversation/message plumbing
  // mocked just to reach it.
  const resolve = (otherPart: any) =>
    (service as any).resolveOtherParticipantDisplay(otherPart);

  beforeEach(async () => {
    prisma = {
      identity: { findFirst: jest.fn() },
      user: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('uses the linked identity data when the participant has one', async () => {
    const result = await resolve({
      userId: 'user-1',
      identity: { individualData: { name: 'أحمد' } },
    });

    expect(result.name).toBe('أحمد');
    expect(prisma.identity.findFirst).not.toHaveBeenCalled();
  });

  it('prefers company/office names over individual data on a linked identity', async () => {
    const result = await resolve({
      userId: 'user-1',
      identity: {
        companyData: { name: 'شركة بيوتنا' },
        individualData: { name: 'أحمد' },
      },
    });

    expect(result.name).toBe('شركة بيوتنا');
  });

  it("falls back to the user's active identity when the participant has no identity link (legacy userId-only participant)", async () => {
    prisma.identity.findFirst.mockResolvedValue({
      individualData: { name: 'مستخدم تجريبي' },
    });

    const result = await resolve({ userId: 'user-legacy', identity: null });

    expect(prisma.identity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-legacy', isActive: true },
      }),
    );
    expect(result.name).toBe('مستخدم تجريبي');
  });

  it('falls back to the bare User row when there is no active identity either', async () => {
    prisma.identity.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({
      name: 'يوسف',
      avatarUrl: null,
    });

    const result = await resolve({ userId: 'user-legacy', identity: null });

    expect(result.name).toBe('يوسف');
  });

  it('only uses the generic placeholder when nothing at all resolves', async () => {
    prisma.identity.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await resolve({ userId: 'user-ghost', identity: null });

    expect(result.name).toBe('مستخدم بيوتنا');
  });

  it('goes straight to the placeholder when there is no userId to fall back on', async () => {
    const result = await resolve(undefined);

    expect(prisma.identity.findFirst).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(result.name).toBe('مستخدم بيوتنا');
  });
});
