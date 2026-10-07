import { ChatMessage } from '@/shared/api/chat.service';

import {
  formatDayLabel,
  formatMessageTime,
  withDateSeparators,
} from '../chatDate';

describe('chatDate utility', () => {
  describe('formatDayLabel', () => {
    it('returns "اليوم" for today', () => {
      const now = new Date();
      expect(formatDayLabel(now)).toBe('اليوم');
    });

    it('returns "أمس" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatDayLabel(yesterday)).toBe('أمس');
    });

    it('returns a formatted Arabic date string for older dates', () => {
      const olderDate = new Date(2025, 5, 15);
      const label = formatDayLabel(olderDate);
      expect(label).toBeTruthy();
      expect(label).not.toBe('اليوم');
      expect(label).not.toBe('أمس');
      // Arabic formatted month or year digits
      expect(label).toMatch(/يونيو|2025|٢٠٢٥/);
    });
  });

  describe('withDateSeparators', () => {
    const createMockMessage = (id: string, dateIso: string): ChatMessage => ({
      id,
      senderId: 'user-1',
      content: `Message ${id}`,
      type: 'TEXT',
      createdAt: dateIso,
      isMine: true,
      timestamp: '12:00',
    });

    it('returns empty array when given empty messages', () => {
      expect(withDateSeparators([])).toEqual([]);
    });

    it('prepends a single date separator for messages on the same day', () => {
      const todayIso = new Date().toISOString();
      const messages: ChatMessage[] = [
        createMockMessage('m1', todayIso),
        createMockMessage('m2', todayIso),
      ];

      const result = withDateSeparators(messages);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: expect.stringMatching(/^date-/),
        type: 'DATE',
        content: 'اليوم',
      });
      expect(result[1]).toBe(messages[0]);
      expect(result[2]).toBe(messages[1]);
    });

    it('inserts a new date separator when the day changes', () => {
      const day1 = '2026-01-10T10:00:00.000Z';
      const day2 = '2026-01-11T10:00:00.000Z';

      const messages: ChatMessage[] = [
        createMockMessage('m1', day1),
        createMockMessage('m2', day1),
        createMockMessage('m3', day2),
      ];

      const result = withDateSeparators(messages);
      expect(result).toHaveLength(5);
      expect(result[0].type).toBe('DATE');
      expect(result[1]).toBe(messages[0]);
      expect(result[2]).toBe(messages[1]);
      expect(result[3].type).toBe('DATE');
      expect(result[4]).toBe(messages[2]);
    });

    it('skips date separator if createdAt is invalid date but keeps the message', () => {
      const messages: ChatMessage[] = [createMockMessage('m-invalid', 'invalid-date')];
      const result = withDateSeparators(messages);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(messages[0]);
    });
  });
});

describe('formatMessageTime', () => {
  it('is 24-hour with western digits in the device time zone', () => {
    const d = new Date(2026, 9, 8, 0, 53);
    expect(formatMessageTime(d.toISOString())).toBe('00:53');
    expect(formatMessageTime(new Date(2026, 9, 8, 14, 5).toISOString())).toBe(
      '14:05',
    );
  });

  it('returns an empty string for an invalid date', () => {
    expect(formatMessageTime('not-a-date')).toBe('');
  });
});
