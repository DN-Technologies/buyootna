import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PropertiesFeedService } from './services/properties-feed.service';
import { PropertiesMutationsService } from './services/properties-mutations.service';
import { PropertiesActivityService } from './services/properties-activity.service';
import { PropertiesQuotaService } from './services/properties-quota.service';

describe('PropertiesService', () => {
  let service: PropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PropertiesFeedService,
          useValue: {
            getHomeFeed: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            incrementViews: jest.fn(),
          },
        },
        {
          provide: PropertiesMutationsService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            archive: jest.fn(),
            renew: jest.fn(),
            verifyOwnership: jest.fn(),
          },
        },
        {
          provide: PropertiesActivityService,
          useValue: {
            getMyActivity: jest.fn(),
          },
        },
        {
          provide: PropertiesQuotaService,
          useValue: {
            resolvePublishQuota: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
