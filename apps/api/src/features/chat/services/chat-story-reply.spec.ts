import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from 'src/core/prisma/prisma.service';

import { SendMessageDto } from '../dto/send-message.dto';

import type { StoriesMediaService } from '../../stories/stories-media.service';
import { ChatAttachmentsService } from './chat-attachments.service';
import { ChatMessagesService } from './chat-messages.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';
import { ChatProposalsService } from './chat-proposals.service';
import { presentStoryReply } from './chat-story-reply';

const NOW = new Date('2026-11-02T12:00:00.000Z');
const STORY_ID = '22222222-2222-4222-8222-222222222222';
const story = (over = {}) => ({
  id: STORY_ID,
  identityId: 'author',
  status: 'ACTIVE' as const,
  mediaType: 'IMAGE' as const,
  mediaKey: 'stories/a/media.jpg',
  posterKey: null,
  expiresAt: new Date(NOW.getTime() + 3600_000),
  mediaDeletedAt: null,
  ...over,
});
const media = {
  linksFor: jest.fn().mockResolvedValue({
    mediaUrl: 'signed-media',
    posterUrl: 'signed-poster',
    urlExpiresAt: NOW,
  }),
};

describe('SendMessageDto storyId', () => {
  const errorsFor = async (storyId: unknown) =>
    (await validate(plainToInstance(SendMessageDto, { storyId }))).map(
      (e) => e.property,
    );

  it('takes a story id, and is optional', async () => {
    expect(await errorsFor(STORY_ID)).toEqual([]);
    expect(await errorsFor(undefined)).toEqual([]);
  });

  it('refuses anything else', async () => {
    expect(await errorsFor('abc')).toEqual(['storyId']);
  });
});

describe('presentStoryReply', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is null for an ordinary message', async () => {
    expect(
      await presentStoryReply(
        media,
        { storyMediaType: null, story: null },
        NOW,
      ),
    ).toBeNull();
    expect(media.linksFor).not.toHaveBeenCalled();
  });

  it('a live photo: its image, tappable, naming its author', async () => {
    expect(
      await presentStoryReply(
        media,
        { storyMediaType: 'IMAGE', story: story() },
        NOW,
      ),
    ).toEqual({
      mediaType: 'IMAGE',
      thumbnailUrl: 'signed-media',
      isLive: true,
      authorIdentityId: 'author',
      unavailable: false,
    });
  });

  it('a video: only its poster, never the playable file', async () => {
    const result = await presentStoryReply(
      media,
      {
        storyMediaType: 'VIDEO',
        story: story({ mediaType: 'VIDEO', posterKey: 'p.jpg' }),
      },
      NOW,
    );
    expect(result?.thumbnailUrl).toBe('signed-poster');
    expect(JSON.stringify(result)).not.toContain('signed-media');
  });

  it('past its 24 hours: keeps the thumbnail, no longer tappable', async () => {
    const result = await presentStoryReply(
      media,
      {
        storyMediaType: 'IMAGE',
        story: story({ expiresAt: new Date(NOW.getTime() - 1000) }),
      },
      NOW,
    );
    expect(result).toMatchObject({
      thumbnailUrl: 'signed-media',
      isLive: false,
      unavailable: false,
    });
    expect(media.linksFor).toHaveBeenCalledWith(expect.anything(), NOW, {
      afterExpiry: true,
    });
  });

  it.each([
    ['deleted by its author', story({ status: 'DELETED' })],
    ['with its files removed', story({ mediaDeletedAt: NOW })],
    ['purged', null],
  ])('%s: unavailable, signing nothing', async (_label, source) => {
    const result = await presentStoryReply(
      media,
      { storyMediaType: 'IMAGE', story: source },
      NOW,
    );
    expect(result).toMatchObject({
      mediaType: 'IMAGE',
      thumbnailUrl: null,
      isLive: false,
      unavailable: true,
    });
    expect(media.linksFor).not.toHaveBeenCalled();
  });

  it('hidden by a block: unavailable, signing nothing', async () => {
    const result = await presentStoryReply(
      media,
      { storyMediaType: 'IMAGE', story: story() },
      NOW,
      { hidden: true },
    );
    expect(result).toMatchObject({ thumbnailUrl: null, unavailable: true });
    expect(media.linksFor).not.toHaveBeenCalled();
  });
});

describe('ChatMessagesService sending a story reply', () => {
  let prisma: any;
  let service: ChatMessagesService;

  beforeEach(() => {
    jest.clearAllMocks();
    const tx = {
      message: {
        create: jest.fn(({ data }) =>
          Promise.resolve({ id: 'new', createdAt: NOW, ...data }),
        ),
      },
      conversation: { findUnique: jest.fn(), update: jest.fn() },
      conversationParticipant: { updateMany: jest.fn() },
    };
    prisma = {
      conversationParticipant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p' }),
        findMany: jest.fn().mockResolvedValue([
          {
            identityId: 'author',
            identity: {
              userId: 'author-user',
              user: { isDisabled: false, isBlocked: false },
            },
          },
        ]),
      },
      message: { findFirst: jest.fn() },
      story: { findFirst: jest.fn() },
      $transaction: jest.fn((fn) => fn(tx)),
      userBlock: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      tx,
    };
    service = new ChatMessagesService(
      prisma,
      {} as ChatParticipantDisplayService,
      {} as ChatAttachmentsService,
      {} as ChatProposalsService,
      media as unknown as StoriesMediaService,
    );
  });

  const send = (storyId?: string) =>
    service.sendMessage({ userId: 'me-user', identityId: 'me' }, 'c1', {
      content: 'كم السعر؟',
      storyId,
    });

  it('links a story of the person being written to', async () => {
    prisma.story.findFirst.mockResolvedValue(story());
    const sent = await send(STORY_ID);

    expect(prisma.story.findFirst.mock.calls[0][0].where).toEqual({
      id: STORY_ID,
      identityId: { in: ['author'] },
      status: 'ACTIVE',
      mediaDeletedAt: null,
    });
    expect(prisma.tx.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        storyId: STORY_ID,
        storyMediaType: 'IMAGE',
      }),
    });
    expect(sent.storyReply).toMatchObject({
      authorIdentityId: 'author',
      unavailable: false,
    });
  });

  it("anyone else's, deleted or unknown story: still sends, unlinked", async () => {
    prisma.story.findFirst.mockResolvedValue(null);
    const sent = await send(STORY_ID);

    expect(prisma.tx.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ storyId: null, storyMediaType: null }),
    });
    expect(sent.content).toBe('كم السعر؟');
    expect(sent.storyReply).toBeNull();
  });

  it('asks nothing about stories for an ordinary message', async () => {
    const sent = await send();
    expect(prisma.story.findFirst).not.toHaveBeenCalled();
    expect(sent.storyReply).toBeNull();
  });
});
