import { ChatMessage } from '@/shared/api/chat.service';

export interface DateSeparatorItem {
  id: string;
  type: 'DATE';
  content: string;
}

export type DisplayMessage = ChatMessage | DateSeparatorItem;

/** أمس / اليوم / full date label for the day a message was sent on. */
export function formatDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'اليوم';
  if (date.toDateString() === yesterday.toDateString()) return 'أمس';
  return date.toLocaleDateString('ar-KW', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Inserts a DATE separator item whenever the calendar day changes between
 * consecutive messages (pure client-side — the API returns a flat list).
 */
export function withDateSeparators(messages: ChatMessage[]): DisplayMessage[] {
  const result: DisplayMessage[] = [];
  let lastDayKey: string | null = null;
  for (const msg of messages) {
    const date = new Date(msg.createdAt);
    const dayKey = isNaN(date.getTime()) ? null : date.toDateString();
    if (dayKey && dayKey !== lastDayKey) {
      lastDayKey = dayKey;
      result.push({
        id: `date-${dayKey}`,
        type: 'DATE',
        content: formatDayLabel(date),
      });
    }
    result.push(msg);
  }
  return result;
}
