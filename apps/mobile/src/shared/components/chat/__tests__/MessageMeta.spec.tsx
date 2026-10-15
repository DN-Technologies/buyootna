import { render, screen } from '@testing-library/react-native';
import { ReactElement } from 'react';

import { ChatMessage } from '@/shared/api/chat.service';
import AttachmentMessageBubble from '@/shared/components/chat/AttachmentMessageBubble';
import ImageMessageBubble from '@/shared/components/chat/ImageMessageBubble';
import LocationMessageBubble from '@/shared/components/chat/LocationMessageBubble';
import MessageBubble from '@/shared/components/chat/MessageBubble';
import PropertyMessageBubble from '@/shared/components/chat/PropertyMessageBubble';
import ProposalCard from '@/shared/components/chat/ProposalCard';
import VoiceMessageBubble from '@/shared/components/chat/VoiceMessageBubble';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (props: any) => <View {...props} /> };
});
jest.mock('@/shared/utils/chatMediaCache', () => ({
  cachedImageSource: (uri: string) => ({ uri }),
  stableMediaKey: (uri: string) => uri,
  cachedVoiceFile: jest.fn(async () => null),
  keepVoiceFile: jest.fn(async () => {}),
}));

const time = '10:23 م';
const file = {
  ...({
    id: 'm1',
    type: 'FILE',
    timestamp: time,
    createdAt: '2026-10-14T10:23:00.000Z',
    attachments: [
      { id: 'a1', kind: 'FILE', fileName: 'عقد.pdf', mimeType: 'application/pdf', size: 1, url: 'https://s/1' },
    ],
  } as unknown as ChatMessage),
};

// Every kind of message, received (theirs) and sent (mine)
const bubbles = (isMine: boolean): [string, ReactElement][] => [
  ['text', <MessageBubble key="t" text="هلا" isMine={isMine} timestamp={time} />],
  [
    'file',
    <AttachmentMessageBubble
      key="f"
      message={{ ...file, isMine }}
      timestamp={time}
      onPressPhoto={jest.fn()}
      onPressFile={jest.fn()}
    />,
  ],
  [
    'image',
    <ImageMessageBubble key="i" imageUrl="https://s/a.jpg" isMine={isMine} timestamp={time} />,
  ],
  ['voice', <VoiceMessageBubble key="v" uri="https://s/v.m4a" isMine={isMine} timestamp={time} />],
  [
    'location',
    <LocationMessageBubble
      key="l"
      location={{ latitude: 29.3, longitude: 48, label: 'السالمية' }}
      isMine={isMine}
      timestamp={time}
    />,
  ],
  [
    'ad',
    <PropertyMessageBubble
      key="p"
      property={{ id: 'p1', imageUrl: 'https://s/p.jpg', title: 'شقة', location: 'السالمية' }}
      isMine={isMine}
      timestamp={time}
    />,
  ],
  [
    'offer',
    <ProposalCard
      key="o"
      message={
        {
          id: 'o1',
          type: 'OFFER',
          isMine,
          timestamp: time,
          createdAt: '2026-10-14T10:23:00.000Z',
          proposal: { id: 'pr1', kind: 'OFFER', status: 'PENDING', amount: 500, period: 'TOTAL' },
        } as ChatMessage
      }
      timestamp={time}
    />,
  ],
];

// QA: the time sat beside a text bubble but under (or beside, lower down)
// the others, in three sizes, so the times didn't line up down the chat
describe.each([
  ['received', false],
  ['sent', true],
])('the time on a %s message', (_label, isMine) => {
  it.each(bubbles(isMine))('%s: one row under the bubble, on its side', async (_kind, bubble) => {
    await render(bubble);

    const meta = screen.getByTestId('message-meta');
    // Inside the bubble's column, which lines it up with the bubble's edge
    const column = meta.parent;
    expect(String(column?.props.className)).toContain(isMine ? 'items-start' : 'items-end');
    expect(String(column?.props.className)).not.toContain('flex-row');

    const label = screen.getByTestId('message-bubble-time');
    expect(label.props.children).toBe(time);
    expect(String(label.props.className)).toBe(
      'font-cairo text-[13px] leading-[20px] text-[#6B6A6A]',
    );
  });
});
