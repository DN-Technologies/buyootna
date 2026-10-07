import { PrismaService } from 'src/core/prisma/prisma.service';
import { ChatMessagesService } from './chat-messages.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';

// The preformatted `timestamp` older app builds show as-is
describe('ChatMessagesService.formatTime', () => {
  const service = new ChatMessagesService(
    {} as PrismaService,
    {} as ChatParticipantDisplayService,
  );

  it('uses western digits and Kuwait time, whatever the server zone', () => {
    // 21:53 UTC is 00:53 in Kuwait (UTC+3)
    expect(service.formatTime(new Date('2026-10-07T21:53:29Z'))).toBe('00:53');
  });

  it('is 24-hour', () => {
    expect(service.formatTime(new Date('2026-10-07T11:05:00Z'))).toBe('14:05');
  });
});
