import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PresenceService } from '../../core/trust-signals/presence.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatPushService } from './services/chat-push.service';
import { ChatReceiptsService } from './services/chat-receipts.service';

describe('ChatGateway presence and typing', () => {
  const emit = jest.fn();
  const rooms: string[] = [];
  interface Chain {
    to: (room: string) => Chain;
    emit: jest.Mock;
  }
  const chain: Chain = {
    to: (room: string) => {
      rooms.push(room);
      return chain;
    },
    emit,
  };

  const build = (participants: { identityId: string }[]) => {
    const prisma = {
      conversationParticipant: {
        findMany: jest.fn().mockResolvedValue(participants),
      },
    };
    const presence = new PresenceService({
      identity: { update: jest.fn().mockResolvedValue({}) },
    } as unknown as PrismaService);
    const gateway = new ChatGateway(
      {} as JwtService,
      {} as ChatService,
      prisma as unknown as PrismaService,
      presence,
      {} as ChatPushService,
      {} as ChatReceiptsService,
    );
    gateway.server = { to: chain.to } as unknown as ChatGateway['server'];
    return { gateway, presence };
  };

  const client = (identityId?: string) =>
    ({
      id: 'socket-1',
      data: { identityId },
      to: chain.to,
    }) as unknown as Socket;

  beforeEach(() => {
    jest.clearAllMocks();
    rooms.length = 0;
  });

  it('relays typing to the other participant, in the chat and on their list', async () => {
    const { gateway } = build([{ identityId: 'me' }, { identityId: 'them' }]);

    await gateway.handleTyping(client('me'), {
      conversationId: 'c-1',
      isTyping: true,
    });

    expect(rooms).toEqual(['conversation:c-1', 'identity:them']);
    expect(emit).toHaveBeenCalledWith('typing', {
      conversationId: 'c-1',
      identityId: 'me',
      isTyping: true,
    });
  });

  it('ignores typing from someone outside the conversation', async () => {
    const { gateway } = build([{ identityId: 'a' }, { identityId: 'b' }]);

    await gateway.handleTyping(client('intruder'), {
      conversationId: 'c-1',
      isTyping: true,
    });

    expect(emit).not.toHaveBeenCalled();
  });

  it('tells chat partners when a persona goes offline', async () => {
    const { gateway, presence } = build([
      { identityId: 'p1' },
      { identityId: 'p2' },
    ]);
    presence.socketConnected('me');

    gateway.handleDisconnect(client('me'));
    await new Promise((resolve) => setImmediate(resolve));

    expect(rooms).toEqual(['identity:p1', 'identity:p2']);
    expect(emit).toHaveBeenCalledWith(
      'presence_changed',
      expect.objectContaining({ identityId: 'me', isOnline: false }),
    );
  });

  it('stays quiet while another socket of the persona is still open', async () => {
    const { gateway, presence } = build([{ identityId: 'p1' }]);
    presence.socketConnected('me');
    presence.socketConnected('me');

    gateway.handleDisconnect(client('me'));
    await new Promise((resolve) => setImmediate(resolve));

    expect(emit).not.toHaveBeenCalled();
    expect(presence.isConnected('me')).toBe(true);
  });
});
