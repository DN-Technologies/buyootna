import { PrismaService } from '../../../core/prisma/prisma.service';
import { ChatConversationsService } from './chat-conversations.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';
import { presentRequestContext } from './chat-request-context';

describe('a chat about a quote request', () => {
  const display = {} as ChatParticipantDisplayService;

  const setup = (options: {
    request?: { id: string; clientIdentityId: string } | null;
    existing?: {
      id: string;
      propertyId: string | null;
      requestId: string | null;
    };
  }) => {
    const tx = {
      $executeRaw: jest.fn(),
      conversation: {
        findMany: jest
          .fn()
          .mockResolvedValue(
            options.existing
              ? [{ ...options.existing, participants: [{}, {}] }]
              : [],
          ),
        create: jest.fn((args: { data: object }) => ({
          id: 'new',
          ...args.data,
        })),
        update: jest.fn((args: { data: object }) => ({
          id: options.existing?.id,
          ...args.data,
        })),
      },
    };
    const prisma = {
      identity: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({ id: 'client' })
          .mockResolvedValueOnce({
            id: 'client',
            userId: 'u2',
            user: { isDisabled: false, isBlocked: false },
          }),
      },
      property: { findUnique: jest.fn().mockResolvedValue({ id: 'prop-1' }) },
      companyRequest: {
        findUnique: jest.fn().mockResolvedValue(options.request ?? null),
      },
      $transaction: jest.fn((cb: (client: typeof tx) => unknown) => cb(tx)),
    };
    const service = new ChatConversationsService(
      prisma as unknown as PrismaService,
      display,
    );
    return { service, tx };
  };

  it('links a new chat to the request and drops the ad', async () => {
    const { service, tx } = setup({
      request: { id: 'req-1', clientIdentityId: 'client' },
    });

    await service.findOrCreateConversation(
      'u1',
      'company',
      'client',
      'prop-1',
      'req-1',
    );

    expect(tx.conversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requestId: 'req-1',
          propertyId: null,
        }) as object,
      }),
    );
  });

  it('ignores a request neither persona asked for', async () => {
    const { service, tx } = setup({
      request: { id: 'req-1', clientIdentityId: 'someone-else' },
    });

    await service.findOrCreateConversation(
      'u1',
      'company',
      'client',
      undefined,
      'req-1',
    );

    expect(tx.conversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ requestId: null }) as object,
      }),
    );
  });

  it('moves an existing chat onto the request', async () => {
    const { service, tx } = setup({
      request: { id: 'req-1', clientIdentityId: 'client' },
      existing: { id: 'c-1', propertyId: 'prop-9', requestId: null },
    });

    await service.findOrCreateConversation(
      'u1',
      'company',
      'client',
      undefined,
      'req-1',
    );

    expect(tx.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'c-1' },
        data: expect.objectContaining({
          requestId: 'req-1',
          propertyId: null,
        }) as object,
      }),
    );
  });

  it('clears the request when the chat is opened without one', async () => {
    const { service, tx } = setup({
      existing: { id: 'c-1', propertyId: null, requestId: 'req-1' },
    });

    await service.findOrCreateConversation('u1', 'company', 'client');

    expect(tx.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ requestId: null }) as object,
      }),
    );
  });

  it('presents the request for the pinned bar', () => {
    expect(
      presentRequestContext({
        id: 'req-1',
        title: 'طلب تشطيب شقة',
        location: 'السالمية',
        priceRange: '450,000 د.ك',
        status: 'PENDING',
      }),
    ).toEqual({
      id: 'req-1',
      title: 'طلب تشطيب شقة',
      location: 'السالمية',
      priceRange: '450,000 د.ك',
      status: 'pending',
    });
    expect(presentRequestContext(null)).toBeNull();
  });
});
