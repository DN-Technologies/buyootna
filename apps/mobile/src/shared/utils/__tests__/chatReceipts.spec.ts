import { mergeReceipts, messageStatus } from '@/shared/utils/chatReceipts';

const at = (minute: number) => new Date(2026, 9, 9, 10, minute).toISOString();
const mine = (over = {}) => ({ isMine: true, createdAt: at(10), ...over });

describe('messageStatus (WhatsApp ticks)', () => {
  it('clock while sending, one tick once sent', () => {
    expect(messageStatus(mine({ sending: true }), null)).toBe('sending');
    expect(messageStatus(mine(), null)).toBe('sent');
    expect(messageStatus(mine(), { lastDeliveredAt: at(5), lastReadAt: at(5) })).toBe('sent');
  });

  it("two grey ticks once it reached the other person's app", () => {
    expect(messageStatus(mine(), { lastDeliveredAt: at(11), lastReadAt: at(5) })).toBe(
      'delivered',
    );
  });

  it('gold once they opened the chat, at or after it was sent', () => {
    expect(messageStatus(mine(), { lastDeliveredAt: at(11), lastReadAt: at(12) })).toBe('read');
    expect(messageStatus(mine(), { lastDeliveredAt: at(10), lastReadAt: at(10) })).toBe('read');
  });

  it('nothing for their messages or a failed send', () => {
    expect(messageStatus(mine({ isMine: false }), { lastReadAt: at(30) })).toBeNull();
    expect(messageStatus(mine({ failed: true }), { lastReadAt: at(30) })).toBeNull();
  });
});

describe('mergeReceipts', () => {
  it('only moves forward (a stale response never takes ticks back)', () => {
    expect(
      mergeReceipts(
        { lastDeliveredAt: at(12), lastReadAt: at(12) },
        { lastDeliveredAt: at(11), lastReadAt: null },
      ),
    ).toEqual({ lastDeliveredAt: at(12), lastReadAt: at(12) });
    expect(
      mergeReceipts({ lastDeliveredAt: at(11), lastReadAt: null }, { lastReadAt: at(13) }),
    ).toEqual({ lastDeliveredAt: at(11), lastReadAt: at(13) });
    expect(mergeReceipts(null, { lastReadAt: at(1) })).toEqual({ lastReadAt: at(1) });
  });
});
