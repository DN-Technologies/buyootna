/**
 * Empirical concurrency check for ChatConversationsService.findOrCreateConversation
 * against a REAL Postgres. Simulates a rapid multi-tap / multi-device burst:
 * N concurrent find-or-create calls for the same participant pair must land
 * in exactly ONE conversation (the advisory lock + transaction guarantees
 * it); the old find-then-create flow is replicated inline to show the
 * contrast (it races into duplicates).
 *
 * Gated behind VERIFY_CONVERSATION_DB so ordinary `pnpm test` runs (no DB)
 * skip it. Point it at a THROWAWAY database only:
 *
 *   VERIFY_CONVERSATION_DB=postgresql://postgres:test@localhost:55432/buyootna_test \
 *     DATABASE_URL=postgresql://postgres:test@localhost:55432/buyootna_test \
 *     pnpm --filter api test -- --runTestsByPath src/features/chat/scripts/verify-conversation-concurrency.spec.ts
 */
import { ChatConversationsService } from '../services/chat-conversations.service';
import { ChatParticipantDisplayService } from '../services/chat-participant-display.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

const DB_URL = process.env.VERIFY_CONVERSATION_DB;
const describeIfDb = DB_URL ? describe : describe.skip;

const CONCURRENT_CALLS = 8;

describeIfDb('findOrCreateConversation (real Postgres concurrency)', () => {
  let prisma: PrismaService;
  let service: ChatConversationsService;

  const suffix = Date.now();
  let userA: { id: string };
  let userB: { id: string };
  let identityA: { id: string };
  let identityB: { id: string };

  // Matches participants the same way the service does: an actor is found
  // by userId OR identityId. Side B's actor id is identityB.id (the service
  // was called with recipientId = identityB.id), so its participant row is
  // identityId-only.
  const pairCount = () =>
    prisma.conversation.count({
      where: {
        AND: [
          {
            participants: {
              some: { OR: [{ userId: userA.id }, { identityId: userA.id }] },
            },
          },
          {
            participants: {
              some: {
                OR: [{ userId: identityB.id }, { identityId: identityB.id }],
              },
            },
          },
        ],
      },
    });

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();

    const displayService = new ChatParticipantDisplayService(prisma);
    service = new ChatConversationsService(prisma, displayService);

    userA = await prisma.user.create({
      data: { password: 'test', email: `a-${suffix}@test.local` },
    });
    userB = await prisma.user.create({
      data: { password: 'test', email: `b-${suffix}@test.local` },
    });
    identityA = await prisma.identity.create({
      data: { userId: userA.id, type: 'INDIVIDUAL', isActive: true },
    });
    identityB = await prisma.identity.create({
      data: { userId: userB.id, type: 'INDIVIDUAL', isActive: true },
    });
  });

  afterAll(async () => {
    if (!userA?.id) return;
    await prisma.conversation.deleteMany({
      where: {
        participants: { some: { userId: { in: [userA.id, userB.id] } } },
      },
    });
    await prisma.identity.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });
    await prisma.$disconnect();
  });

  it(`creates exactly ONE conversation under ${CONCURRENT_CALLS} concurrent calls`, async () => {
    await Promise.all(
      Array.from({ length: CONCURRENT_CALLS }, () =>
        service.findOrCreateConversation(userA.id, identityA.id, identityB.id),
      ),
    );

    const count = await pairCount();
    console.log(`NEW flow  -> conversations for pair: ${count}`);
    expect(count).toBe(1);
  });

  it('the old unserialized flow would have created duplicates (documents the bug)', async () => {
    // Inline replica of the pre-fix flow: find-then-create with no lock.
    const oldFindThenCreate = async () => {
      const existing = await prisma.conversation.findMany({
        where: {
          AND: [
            { participants: { some: { userId: userA.id } } },
            { participants: { some: { userId: userB.id } } },
          ],
        },
      });
      if (existing.length > 0) return existing[0];
      return prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: userA.id, identityId: identityA.id },
              { userId: userB.id, identityId: identityB.id },
            ],
          },
        },
      });
    };

    // The first test already created the pair's single conversation, so the
    // old flow would find it every time -- delete it first to force the
    // concurrent-create race exactly as it happened in the bug.
    await prisma.conversation.deleteMany({
      where: {
        participants: { some: { userId: { in: [userA.id, userB.id] } } },
      },
    });

    await Promise.all(
      Array.from({ length: CONCURRENT_CALLS }, () => oldFindThenCreate()),
    );

    const count = await pairCount();
    console.log(`OLD flow  -> conversations for pair: ${count}`);
    // Not an assertion about desired behavior -- it documents that the bug
    // was real. If this ever passes with 1, the race stopped reproducing
    // (e.g. on a future Prisma/Postgres that serializes differently), which
    // is fine: the locked service above remains the guarantee.
    expect(count).toBeGreaterThan(1);
  });
});
