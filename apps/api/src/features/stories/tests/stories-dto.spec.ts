import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateStoryUploadDto } from '../dto/create-story-upload.dto';
import { PublishStoryDto } from '../dto/publish-story.dto';
import { RecordStoryViewsDto } from '../dto/record-story-views.dto';
import { StoryViewersQueryDto } from '../dto/story-viewers-query.dto';
import { StoryFeedQueryDto } from '../dto/story-feed-query.dto';
import { toViewerStoryDto, type StoryRow } from '../stories.mapper';

const errorsOf = async <T extends object>(cls: new () => T, plain: object) =>
  (await validate(plainToInstance(cls, plain))).map((e) => e.property);

describe('story DTOs', () => {
  describe('CreateStoryUploadDto', () => {
    const ok = {
      mediaType: 'IMAGE',
      contentType: 'image/jpeg',
      sizeBytes: 1000,
    };

    it('a photo upload is valid', async () => {
      expect(await errorsOf(CreateStoryUploadDto, ok)).toEqual([]);
    });

    const video = {
      mediaType: 'VIDEO',
      contentType: 'video/mp4',
      sizeBytes: 50 * 1024 * 1024,
      poster: { contentType: 'image/jpeg', sizeBytes: 1024 * 1024 },
    };

    it('a video with its poster is valid (MP4 or MOV, up to 50 MB)', async () => {
      expect(await errorsOf(CreateStoryUploadDto, video)).toEqual([]);
      expect(
        await errorsOf(CreateStoryUploadDto, {
          ...video,
          contentType: 'video/quicktime',
        }),
      ).toEqual([]);
    });

    it.each([
      ['over 50 MB', { sizeBytes: 50 * 1024 * 1024 + 1 }, ['sizeBytes']],
      ['a photo type', { contentType: 'image/jpeg' }, ['contentType']],
      ['WebM', { contentType: 'video/webm' }, ['contentType']],
      ['no poster', { poster: undefined }, ['mediaType']],
      [
        'a PNG poster',
        { poster: { contentType: 'image/png', sizeBytes: 10 } },
        ['poster'],
      ],
      [
        'a poster over 1 MB',
        { poster: { contentType: 'image/jpeg', sizeBytes: 1024 * 1024 + 1 } },
        ['poster'],
      ],
    ])('a video with %s is refused', async (_label, change, fields) => {
      expect(
        await errorsOf(CreateStoryUploadDto, { ...video, ...change }),
      ).toEqual(fields);
    });

    it('a photo cannot carry a poster, nor use a video type', async () => {
      expect(
        await errorsOf(CreateStoryUploadDto, { ...ok, poster: video.poster }),
      ).toEqual(['mediaType']);
      expect(
        await errorsOf(CreateStoryUploadDto, {
          ...ok,
          contentType: 'video/mp4',
        }),
      ).toEqual(['contentType']);
    });

    it.each([
      ['an unknown kind', { mediaType: 'AUDIO' }, 'mediaType'],
      ['HEIC', { contentType: 'image/heic' }, 'contentType'],
      ['GIF', { contentType: 'image/gif' }, 'contentType'],
      ['over 10 MB', { sizeBytes: 10 * 1024 * 1024 + 1 }, 'sizeBytes'],
      ['empty file', { sizeBytes: 0 }, 'sizeBytes'],
      ['fractional size', { sizeBytes: 10.5 }, 'sizeBytes'],
    ])('%s is refused', async (_label, change, field) => {
      expect(
        await errorsOf(CreateStoryUploadDto, { ...ok, ...change }),
      ).toEqual([field]);
    });
  });

  describe('PublishStoryDto', () => {
    it('both fields are optional', async () => {
      expect(await errorsOf(PublishStoryDto, {})).toEqual([]);
    });

    it('a caption of 200 characters is accepted, 201 refused', async () => {
      expect(
        await errorsOf(PublishStoryDto, { caption: 'ع'.repeat(200) }),
      ).toEqual([]);
      expect(
        await errorsOf(PublishStoryDto, { caption: 'ع'.repeat(201) }),
      ).toEqual(['caption']);
    });

    it('the listing must be an id', async () => {
      expect(
        await errorsOf(PublishStoryDto, { propertyId: '1 OR 1=1' }),
      ).toEqual(['propertyId']);
    });
  });

  describe('StoryFeedQueryDto', () => {
    it('limit comes from the query string as a number up to 30', async () => {
      expect(await errorsOf(StoryFeedQueryDto, { limit: '20' })).toEqual([]);
      expect(await errorsOf(StoryFeedQueryDto, { limit: '31' })).toEqual([
        'limit',
      ]);
      expect(await errorsOf(StoryFeedQueryDto, { limit: '0' })).toEqual([
        'limit',
      ]);
    });
  });
});

describe('phase 2 DTOs', () => {
  const id = (n: number) =>
    `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

  it('views: 1 to 50 distinct story ids', async () => {
    expect(await errorsOf(RecordStoryViewsDto, { storyIds: [id(1)] })).toEqual(
      [],
    );
    const fifty = Array.from({ length: 50 }, (_, i) => id(i + 1));
    expect(await errorsOf(RecordStoryViewsDto, { storyIds: fifty })).toEqual(
      [],
    );
  });

  it.each([
    ['empty', []],
    ['51 ids', Array.from({ length: 51 }, (_, i) => id(i + 1))],
    ['a duplicate', [id(1), id(1)]],
    ['not an id', ['abc']],
    ['not a list', id(1)],
  ])('views: %s is refused', async (_label, storyIds) => {
    expect(await errorsOf(RecordStoryViewsDto, { storyIds })).toEqual([
      'storyIds',
    ]);
  });

  it('viewers: limit up to 50', async () => {
    expect(await errorsOf(StoryViewersQueryDto, { limit: '50' })).toEqual([]);
    expect(await errorsOf(StoryViewersQueryDto, { limit: '51' })).toEqual([
      'limit',
    ]);
  });
});

describe('story mapping', () => {
  const author = '11111111-1111-4111-8111-111111111111';
  const links = {
    mediaUrl: 'https://s3.example/get',
    posterUrl: null,
    urlExpiresAt: new Date('2026-10-20T13:00:00.000Z'),
  };
  const row = (property: StoryRow['property']): StoryRow => ({
    id: 's',
    identityId: author,
    mediaType: 'IMAGE',
    mediaKey: 'k',
    posterKey: null,
    width: 1,
    height: 1,
    durationMs: null,
    caption: null,
    publishedAt: new Date('2026-10-20T10:00:00.000Z'),
    expiresAt: new Date('2026-10-21T10:00:00.000Z'),
    property,
  });
  const listing = {
    id: 'p',
    type: 'SALE',
    category: 'APARTMENT',
    location: 'حولي',
    images: ['https://img/1.jpg'],
    status: 'ACTIVE',
    identityId: author,
  } as unknown as NonNullable<StoryRow['property']>;

  it('shows the linked listing while it is active and the author’s', () => {
    expect(toViewerStoryDto(row(listing), links, false).property).toEqual({
      id: 'p',
      type: 'SALE',
      category: 'APARTMENT',
      location: 'حولي',
      coverUrl: 'https://img/1.jpg',
    });
  });

  it('hides it once inactive or no longer the author’s', () => {
    const inactive = { ...listing, status: 'EXPIRED' } as typeof listing;
    const moved = { ...listing, identityId: 'someone-else' };
    expect(toViewerStoryDto(row(inactive), links, false).property).toBeNull();
    expect(toViewerStoryDto(row(moved), links, false).property).toBeNull();
  });
});
