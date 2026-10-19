import { Test, TestingModule } from '@nestjs/testing';

import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { ReportsService } from '../../reports/reports.service';
import { StoriesFeedService } from '../stories-feed.service';
import { StoriesController } from '../stories.controller';
import { StoriesService } from '../stories.service';

describe('StoriesController', () => {
  let controller: StoriesController;
  const stories = {
    createUpload: jest.fn(),
    publish: jest.fn(),
    remove: jest.fn(),
    findMine: jest.fn(),
    findByAuthor: jest.fn(),
    recordViews: jest.fn(),
    viewers: jest.fn(),
  };
  const reports = { createForStory: jest.fn() };
  const feedService = { feed: jest.fn() };
  // The posting / viewing profile always comes from the token, never the body
  const reqUser = { userId: 'user-1', identityId: 'ident-1' } as RequestUser;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoriesController],
      providers: [
        { provide: StoriesService, useValue: stories },
        { provide: StoriesFeedService, useValue: feedService },
        { provide: ReportsService, useValue: reports },
      ],
    }).compile();
    controller = module.get(StoriesController);
  });

  it('upload slots are for the active profile', async () => {
    const dto = {
      mediaType: 'IMAGE' as const,
      contentType: 'image/jpeg' as const,
      sizeBytes: 1,
    };
    await controller.createUpload(reqUser, dto);
    expect(stories.createUpload).toHaveBeenCalledWith('ident-1', dto);
  });

  it('publish and delete act as the active profile', async () => {
    await controller.publish(reqUser, 'story-1', { caption: 'x' });
    expect(stories.publish).toHaveBeenCalledWith('story-1', 'ident-1', {
      caption: 'x',
    });
    await controller.remove(reqUser, 'story-1');
    expect(stories.remove).toHaveBeenCalledWith('story-1', 'ident-1');
  });

  it('the feed gets the profile and its account (to leave out own profiles)', async () => {
    await controller.feed(reqUser, { limit: 10 });
    expect(feedService.feed).toHaveBeenCalledWith(
      { identityId: 'ident-1', userId: 'user-1' },
      { limit: 10 },
    );
  });

  it('own stories and one author’s stories', async () => {
    await controller.mine(reqUser);
    expect(stories.findMine).toHaveBeenCalledWith('ident-1');
    await controller.byAuthor(reqUser, 'author-1');
    expect(stories.findByAuthor).toHaveBeenCalledWith('ident-1', 'author-1');
  });

  it('views are recorded for the active profile and its account', async () => {
    const dto = { storyIds: ['s1', 's2'] };
    await controller.recordViews(reqUser, dto);
    expect(stories.recordViews).toHaveBeenCalledWith(
      { identityId: 'ident-1', userId: 'user-1' },
      dto,
    );
  });

  it('the viewer list is asked for as the active profile', async () => {
    await controller.viewers(reqUser, 'story-1', { limit: 10 });
    expect(stories.viewers).toHaveBeenCalledWith('story-1', 'ident-1', {
      limit: 10,
    });
  });

  it('a story report goes through the reports service as the active profile', async () => {
    const dto = { reason: 'محتوى مسيء' };
    await controller.report(reqUser, 'story-1', dto);
    expect(reports.createForStory).toHaveBeenCalledWith(
      { userId: 'user-1', identityId: 'ident-1' },
      'story-1',
      dto,
    );
  });
});
